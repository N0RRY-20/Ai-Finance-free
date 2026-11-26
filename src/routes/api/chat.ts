import { DEFAULT_GEMINI_MODEL } from '#/constants/ai-models'
import { auth } from '#/lib/auth.server'
import { getDecryptedUserAiCredentials } from '#/services/ai-key.service.server'
import { buildFinanceSystemPrompt } from '#/ai/prompts/finance.prompt'
import { createTransactionTools } from '#/ai/tools/server/transaction.tools.server'
import {
  ensureConversation,
  recordAiUsage,
  resolveConversationId,
  saveAssistantMessage,
  saveUserMessageIfNew,
  updateConversationTitleIfDefault,
} from '#/services/chat.service.server'
import type {
  ChatMiddleware,
  MessagePart,
  ModelMessage,
  UIMessage,
} from '@tanstack/ai'
import {
  chat,
  chatParamsFromRequest,
  maxIterations,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { scrubSecrets } from '@tanstack/ai/byok'
import type { GeminiTextModel } from '@tanstack/ai-gemini'
import { GEMINI_MODELS, createGeminiChat } from '@tanstack/ai-gemini'
import { createFileRoute } from '@tanstack/react-router'

function resolveGeminiModel(requested: string): GeminiTextModel {
  return (GEMINI_MODELS as readonly string[]).includes(requested)
    ? (requested as GeminiTextModel)
    : DEFAULT_GEMINI_MODEL
}

function extractMessageText(message: UIMessage | ModelMessage): string {
  if ('parts' in message && Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.content)
      .join('\n')
      .trim()
  }

  if ('content' in message) {
    if (typeof message.content === 'string') {
      return message.content.trim()
    }

    if (Array.isArray(message.content)) {
      return message.content
        .filter((part) => part.type === 'text')
        .map((part) => part.content)
        .join('\n')
        .trim()
    }
  }

  return ''
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session?.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        let credentials: Awaited<
          ReturnType<typeof getDecryptedUserAiCredentials>
        >
        try {
          credentials = await getDecryptedUserAiCredentials(userId, 'gemini')
        } catch (error) {
          return Response.json(
            {
              code: 'INVALID_STORED_API_KEY',
              error:
                error instanceof Error
                  ? `${error.message} Silakan simpan ulang API Key Gemini Anda.`
                  : 'Gagal membaca API Key Gemini tersimpan. Silakan simpan ulang API Key Anda.',
            },
            { status: 400 },
          )
        }

        if (!credentials) {
          return Response.json(
            {
              code: 'MISSING_API_KEY',
              error:
                'API Key Gemini belum diatur. Silakan tambahkan API Key pribadi Anda terlebih dahulu.',
            },
            { status: 400 },
          )
        }

        let params: Awaited<ReturnType<typeof chatParamsFromRequest>>
        try {
          params = await chatParamsFromRequest(request)
        } catch (error) {
          if (error instanceof Response) {
            return error
          }
          return Response.json(
            { error: 'Permintaan chat tidak valid.' },
            { status: 400 },
          )
        }

        const conversationId = resolveConversationId(params.threadId)
        const model = resolveGeminiModel(credentials.model)
        const formatSafeError = (err: unknown) =>
          scrubSecrets(err instanceof Error ? err.message : String(err), [
            credentials.apiKey,
          ])

        try {
          await ensureConversation(userId, conversationId)
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Gagal membuka percakapan.',
            },
            { status: 403 },
          )
        }

        const lastUserMessage = [...params.messages]
          .reverse()
          .find((msg) => msg.role === 'user')

        if (lastUserMessage) {
          const userText = extractMessageText(lastUserMessage)
          const clientMessageId =
            'id' in lastUserMessage && typeof lastUserMessage.id === 'string'
              ? lastUserMessage.id
              : undefined

          if (userText) {
            await saveUserMessageIfNew(
              conversationId,
              userText,
              clientMessageId,
            )
            await updateConversationTitleIfDefault(
              conversationId,
              userId,
              userText,
            )
          }
        }

        let inputTokens = 0
        let outputTokens = 0
        const collectedToolParts: MessagePart[] = []

        const persistenceMiddleware: ChatMiddleware = {
          name: 'finance-chat-persistence',
          onAfterToolCall: (_ctx, info) => {
            const rawArgs = info.toolCall.function.arguments || '{}'
            const parsedInput = safeJsonParse(rawArgs)
            const errorMessage =
              info.error instanceof Error
                ? info.error.message
                : info.error !== undefined
                  ? String(info.error)
                  : undefined
            const outputPayload = info.ok
              ? info.result
              : { error: errorMessage ?? 'Tool execution failed' }

            collectedToolParts.push({
              type: 'tool-call',
              id: info.toolCallId,
              name: info.toolName,
              arguments: rawArgs,
              ...(parsedInput !== undefined ? { input: parsedInput } : {}),
              state: info.ok ? 'complete' : 'error',
              output: outputPayload,
            })

            collectedToolParts.push({
              type: 'tool-result',
              toolCallId: info.toolCallId,
              name: info.toolName,
              content:
                typeof outputPayload === 'string'
                  ? outputPayload
                  : JSON.stringify(outputPayload),
              state: info.ok ? 'complete' : 'error',
              ...(errorMessage ? { error: errorMessage } : {}),
            })
          },
          onUsage: (_ctx, usage) => {
            inputTokens += usage.promptTokens
            outputTokens += usage.completionTokens
          },
          onFinish: async (_ctx, info) => {
            const finalInputTokens =
              inputTokens > 0 ? inputTokens : (info.usage?.promptTokens ?? 0)
            const finalOutputTokens =
              outputTokens > 0
                ? outputTokens
                : (info.usage?.completionTokens ?? 0)

            const parts: MessagePart[] = [
              ...collectedToolParts,
              ...(info.content
                ? [{ type: 'text' as const, content: info.content }]
                : []),
            ]

            try {
              const savedMessage = await saveAssistantMessage(
                conversationId,
                info.content,
                {
                  model,
                  parts,
                  finishReason: info.finishReason,
                  durationMs: info.duration,
                },
              )

              await recordAiUsage({
                userId,
                conversationId,
                messageId: savedMessage.id,
                model,
                inputTokens: finalInputTokens,
                outputTokens: finalOutputTokens,
                status: 'success',
              })
            } catch (dbError) {
              console.error(
                'Failed to persist assistant message:',
                formatSafeError(dbError),
              )
            }
          },
          onAbort: async () => {
            try {
              await recordAiUsage({
                userId,
                conversationId,
                messageId: null,
                model,
                inputTokens,
                outputTokens,
                status: 'cancelled',
              })
            } catch (dbError) {
              console.error(
                'Failed to record cancelled AI usage:',
                formatSafeError(dbError),
              )
            }
          },
          onError: async (_ctx, info) => {
            console.error('AI chat error:', formatSafeError(info.error))
            try {
              await recordAiUsage({
                userId,
                conversationId,
                messageId: null,
                model,
                inputTokens,
                outputTokens,
                status: 'error',
              })
            } catch (dbError) {
              console.error(
                'Failed to record failed AI usage:',
                formatSafeError(dbError),
              )
            }
          },
        }

        const abortController = new AbortController()
        const stream = chat({
          adapter: createGeminiChat(model, credentials.apiKey),
          messages: params.messages,
          threadId: conversationId,
          runId: params.runId,
          ...(params.parentRunId ? { parentRunId: params.parentRunId } : {}),
          ...(params.resume ? { resume: params.resume } : {}),
          systemPrompts: [buildFinanceSystemPrompt()],
          tools: [...createTransactionTools(userId)],
          agentLoopStrategy: maxIterations(4),
          middleware: [persistenceMiddleware],
          abortController,
        })

        return toServerSentEventsResponse(stream, { abortController })
      },
    },
  },
})
