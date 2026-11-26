import {
  aiUsageRepository,
  conversationRepository,
  messageRepository,
} from '#/db/repositories'
import type {
  DeleteResult,
  RecordAiUsageInput,
  SerializedConversation,
} from '#/types/ai'
import { isValidUuid } from '#/validations/common.validation'
import type { UIMessage } from '@tanstack/ai-react'

const DEFAULT_CONVERSATION_TITLE = 'Percakapan Baru'

export function resolveConversationId(rawThreadId?: string | null): string {
  return isValidUuid(rawThreadId) ? rawThreadId : crypto.randomUUID()
}

export async function listUserConversations(
  userId: string,
): Promise<SerializedConversation[]> {
  const rows = await conversationRepository.findActiveByUser(userId, 30)

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }))
}

export async function ensureConversation(
  userId: string,
  conversationId: string,
  initialTitle?: string,
) {
  const existing = await conversationRepository.findById(conversationId)

  if (existing) {
    if (existing.userId !== userId || existing.deletedAt !== null) {
      throw new Error('Percakapan tidak ditemukan atau akses ditolak.')
    }
    return existing
  }

  return await conversationRepository.create({
    id: conversationId,
    userId,
    title: initialTitle?.trim() || DEFAULT_CONVERSATION_TITLE,
  })
}

export async function updateConversationTitleIfDefault(
  conversationId: string,
  userId: string,
  userText: string,
): Promise<void> {
  const cleaned = userText.replace(/\s+/g, ' ').trim()
  if (!cleaned) return

  const summary =
    cleaned.length > 60 ? `${cleaned.slice(0, 57).trimEnd()}...` : cleaned

  await conversationRepository.updateTitleIfMatches(
    conversationId,
    userId,
    DEFAULT_CONVERSATION_TITLE,
    summary,
  )
}

export async function saveUserMessageIfNew(
  conversationId: string,
  content: string,
  clientMessageId?: string,
) {
  if (clientMessageId) {
    const existing = await messageRepository.findUserMessageByClientId(
      conversationId,
      clientMessageId,
    )
    if (existing) {
      return existing
    }
  }

  const inserted = await messageRepository.create({
    conversationId,
    role: 'user',
    content,
    metadata: {
      ...(clientMessageId ? { clientMessageId } : {}),
      parts: [{ type: 'text', content }],
    },
  })

  await conversationRepository.touchUpdatedAt(conversationId)

  return inserted
}

export async function saveAssistantMessage(
  conversationId: string,
  content: string,
  metadata: Record<string, unknown>,
) {
  const inserted = await messageRepository.create({
    conversationId,
    role: 'assistant',
    content,
    metadata,
  })

  await conversationRepository.touchUpdatedAt(conversationId)

  return inserted
}

export async function recordAiUsage(params: RecordAiUsageInput) {
  await aiUsageRepository.create({
    userId: params.userId,
    conversationId: params.conversationId ?? null,
    messageId: params.messageId ?? null,
    model: params.model,
    inputTokens: Math.max(0, Math.round(params.inputTokens)),
    outputTokens: Math.max(0, Math.round(params.outputTokens)),
    status: params.status,
  })
}

export async function getConversationUiMessages(
  userId: string,
  conversationId: string,
): Promise<UIMessage[]> {
  const conversation = await conversationRepository.findById(conversationId)

  if (!conversation || conversation.deletedAt !== null) {
    return []
  }

  if (conversation.userId !== userId) {
    throw new Error('Akses percakapan ditolak.')
  }

  const rows = await messageRepository.findByConversationId(conversationId)

  return rows.map((row) => {
    const rawParts =
      row.metadata &&
      typeof row.metadata === 'object' &&
      Array.isArray(row.metadata.parts) &&
      row.metadata.parts.length > 0
        ? (row.metadata.parts as UIMessage['parts'])
        : ([{ type: 'text', content: row.content }] as UIMessage['parts'])

    return {
      id: row.id,
      role: row.role,
      parts: rawParts,
      createdAt: row.createdAt,
    }
  })
}

export async function softDeleteConversation(
  userId: string,
  conversationId: string,
): Promise<DeleteResult> {
  const updated = await conversationRepository.softDeleteForUser(
    userId,
    conversationId,
  )

  return { deleted: Boolean(updated) }
}
