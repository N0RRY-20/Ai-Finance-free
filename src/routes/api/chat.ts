import { DEFAULT_GEMINI_MODEL } from '#/constants/ai-models'
import {
  MAX_CHAT_IMAGES_PER_MESSAGE,
  MAX_ENCODED_IMAGE_BYTES,
  MAX_HISTORY_INLINE_IMAGE_BYTES,
  MAX_TOTAL_IMAGES_BYTES,
  estimateBase64ByteSize,
  formatAttachmentSize,
  isAllowedChatImageMimeType,
} from '#/constants/chat-media'
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
import type { ChatImageAttachmentMeta } from '#/types/ai'
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

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
      const texts: string[] = []
      for (const part of message.content as Array<unknown>) {
        if (!isRecord(part) || part.type !== 'text') continue
        // Pesan AG-UI wire memakai `{ type: 'text', text }`, sedangkan ModelMessage memakai `{ type: 'text', content }`.
        if (typeof part.text === 'string') {
          texts.push(part.text)
        } else if (typeof part.content === 'string') {
          texts.push(part.content)
        }
      }
      return texts.join('\n').trim()
    }
  }

  return ''
}

function parseInboundAttachmentsMeta(
  metadata: unknown,
): ChatImageAttachmentMeta[] {
  if (!isRecord(metadata) || !Array.isArray(metadata.attachments)) {
    return []
  }

  const result: ChatImageAttachmentMeta[] = []
  for (const item of metadata.attachments) {
    if (!isRecord(item)) continue
    const rawName = typeof item.name === 'string' ? item.name.trim() : ''
    if (!rawName) continue
    const mimeType =
      typeof item.mimeType === 'string' ? item.mimeType.trim() : 'image/jpeg'
    const sizeBytes =
      typeof item.sizeBytes === 'number' &&
      Number.isFinite(item.sizeBytes) &&
      item.sizeBytes >= 0
        ? item.sizeBytes
        : 0

    result.push({
      name: rawName.slice(0, 120),
      mimeType,
      sizeBytes,
      ...(typeof item.width === 'number' &&
      Number.isFinite(item.width) &&
      item.width > 0
        ? { width: item.width }
        : {}),
      ...(typeof item.height === 'number' &&
      Number.isFinite(item.height) &&
      item.height > 0
        ? { height: item.height }
        : {}),
    })
  }

  return result
}

function extractRawImageParts(
  message: UIMessage | ModelMessage,
): Array<Record<string, unknown>> {
  const sourceParts: Array<unknown> =
    'parts' in message && Array.isArray(message.parts)
      ? message.parts
      : 'content' in message && Array.isArray(message.content)
        ? message.content
        : []

  return sourceParts.filter(
    (part): part is Record<string, unknown> =>
      isRecord(part) && part.type === 'image',
  )
}

function withTextContent(
  message: UIMessage | ModelMessage,
  text: string,
): UIMessage | ModelMessage {
  if ('parts' in message) {
    return {
      ...message,
      parts: [{ type: 'text', content: text }],
    }
  }

  return {
    ...message,
    content: text,
  }
}

type PreparedMessagesResult =
  | { ok: false; error: string }
  | {
      ok: true
      preparedMessages: Array<UIMessage | ModelMessage>
      lastUserMessage: (UIMessage | ModelMessage) | undefined
      lastUserAttachments: ChatImageAttachmentMeta[]
    }

function validateAndPrepareMessages(
  messages: Array<UIMessage | ModelMessage>,
): PreparedMessagesResult {
  let lastUserIndex = -1
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i]?.role === 'user') {
      lastUserIndex = i
      break
    }
  }

  let lastUserAttachments: ChatImageAttachmentMeta[] = []
  let totalHistoryImageBytes = 0
  const messageImageSizes = new Map<number, number>()
  const messageAttachmentNames = new Map<number, string[]>()

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    if (msg.role !== 'user') continue

    const rawImages = extractRawImageParts(msg)
    const userText = extractMessageText(msg)
    const metaAttachments = parseInboundAttachmentsMeta(msg.metadata)

    if (i === lastUserIndex && rawImages.length > MAX_CHAT_IMAGES_PER_MESSAGE) {
      return {
        ok: false,
        error: `Maksimal ${MAX_CHAT_IMAGES_PER_MESSAGE} gambar yang dapat dikirim sekaligus.`,
      }
    }

    let messageBytes = 0
    const namesForMessage: string[] = []
    const verifiedAttachments: ChatImageAttachmentMeta[] = []

    for (let imgIdx = 0; imgIdx < rawImages.length; imgIdx++) {
      const img = rawImages[imgIdx]
      const source = img.source
      if (!isRecord(source) || source.type !== 'data') {
        return {
          ok: false,
          error:
            'Sumber gambar tidak valid. Hanya unggahan gambar langsung yang didukung.',
        }
      }

      const mimeType =
        typeof source.mimeType === 'string'
          ? source.mimeType.trim().toLowerCase()
          : ''
      if (!isAllowedChatImageMimeType(mimeType)) {
        return {
          ok: false,
          error:
            'Format gambar tidak didukung. Gunakan JPG, PNG, WebP, HEIC, atau HEIF.',
        }
      }

      const value = typeof source.value === 'string' ? source.value.trim() : ''
      if (!value) {
        return {
          ok: false,
          error: 'Data gambar kosong atau tidak valid.',
        }
      }

      const sizeBytes = estimateBase64ByteSize(value)
      if (sizeBytes > MAX_ENCODED_IMAGE_BYTES) {
        return {
          ok: false,
          error: `Ukuran gambar melebihi batas ${formatAttachmentSize(MAX_ENCODED_IMAGE_BYTES)}.`,
        }
      }

      messageBytes += sizeBytes

      const partMeta = isRecord(img.metadata) ? img.metadata : undefined
      const metaItem = metaAttachments.at(imgIdx)
      const rawName =
        typeof partMeta?.name === 'string' && partMeta.name.trim()
          ? partMeta.name.trim()
          : (metaItem?.name ?? '')
      const name = (rawName || `Struk ${imgIdx + 1}`).slice(0, 120)
      namesForMessage.push(name)

      const width =
        typeof partMeta?.width === 'number' &&
        Number.isFinite(partMeta.width) &&
        partMeta.width > 0
          ? partMeta.width
          : metaItem?.width
      const height =
        typeof partMeta?.height === 'number' &&
        Number.isFinite(partMeta.height) &&
        partMeta.height > 0
          ? partMeta.height
          : metaItem?.height

      verifiedAttachments.push({
        name,
        mimeType,
        sizeBytes,
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
      })
    }

    if (i === lastUserIndex) {
      if (messageBytes > MAX_TOTAL_IMAGES_BYTES) {
        return {
          ok: false,
          error: `Total ukuran gambar dalam satu pesan melebihi batas ${formatAttachmentSize(MAX_TOTAL_IMAGES_BYTES)}.`,
        }
      }
      if (!userText && rawImages.length === 0) {
        return {
          ok: false,
          error: 'Pesan tidak boleh kosong.',
        }
      }
      lastUserAttachments = verifiedAttachments
    }

    messageImageSizes.set(i, messageBytes)
    messageAttachmentNames.set(i, namesForMessage)
    totalHistoryImageBytes += messageBytes
  }

  let remainingHistoryBytes = totalHistoryImageBytes
  const preparedMessages: Array<UIMessage | ModelMessage> = messages.map(
    (msg, i) => {
      if (msg.role !== 'user') {
        return msg
      }

      const rawImages = extractRawImageParts(msg)
      const userText = extractMessageText(msg)

      if (rawImages.length > 0) {
        const msgBytes = messageImageSizes.get(i) ?? 0
        if (
          i !== lastUserIndex &&
          remainingHistoryBytes > MAX_HISTORY_INLINE_IMAGE_BYTES
        ) {
          remainingHistoryBytes -= msgBytes
          const names = (messageAttachmentNames.get(i) ?? []).join(', ')
          const note = `[Pengguna sebelumnya mengirim ${rawImages.length} gambar (${names}), tetapi lampiran gambar dihapus dari konteks riwayat agar ukuran permintaan tetap aman.]`
          return withTextContent(
            msg,
            userText ? `${userText}\n\n${note}` : note,
          )
        }
        return msg
      }

      if (!userText) {
        const metaAttachments = parseInboundAttachmentsMeta(msg.metadata)
        if (metaAttachments.length > 0) {
          const names = metaAttachments.map((item) => item.name).join(', ')
          const note = `[Pengguna sebelumnya mengirim ${metaAttachments.length} gambar: ${names}. File gambar tidak disimpan di riwayat.]`
          return withTextContent(msg, note)
        }
        if (i !== lastUserIndex) {
          return withTextContent(msg, '[Pesan pengguna sebelumnya]')
        }
      }

      return msg
    },
  )

  return {
    ok: true,
    preparedMessages,
    lastUserMessage: lastUserIndex >= 0 ? messages[lastUserIndex] : undefined,
    lastUserAttachments,
  }
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

        const validation = validateAndPrepareMessages(params.messages)
        if (!validation.ok) {
          return Response.json({ error: validation.error }, { status: 400 })
        }

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

        const { lastUserMessage, lastUserAttachments, preparedMessages } =
          validation

        if (lastUserMessage) {
          const userText = extractMessageText(lastUserMessage)
          const clientMessageId =
            'id' in lastUserMessage && typeof lastUserMessage.id === 'string'
              ? lastUserMessage.id
              : undefined

          if (userText || lastUserAttachments.length > 0) {
            await saveUserMessageIfNew(conversationId, userText, {
              clientMessageId,
              attachments: lastUserAttachments,
            })
            const fallbackTitle =
              lastUserAttachments.length === 1
                ? 'Analisis foto struk'
                : `Analisis ${lastUserAttachments.length} foto struk`
            await updateConversationTitleIfDefault(
              conversationId,
              userId,
              userText || fallbackTitle,
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
          messages: preparedMessages,
          threadId: conversationId,
          runId: params.runId,
          ...(params.parentRunId ? { parentRunId: params.parentRunId } : {}),
          ...(params.resume ? { resume: params.resume } : {}),
          systemPrompts: [buildFinanceSystemPrompt()],
          tools: [...createTransactionTools(userId)],
          agentLoopStrategy: maxIterations(8),
          middleware: [persistenceMiddleware],
          abortController,
        })

        return toServerSentEventsResponse(stream, { abortController })
      },
    },
  },
})
