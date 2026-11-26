import {
  aiUsageRepository,
  conversationRepository,
  messageRepository,
} from '#/db/repositories'
import type {
  ChatImageAttachmentMeta,
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

function parseStoredAttachments(raw: unknown): ChatImageAttachmentMeta[] {
  if (!Array.isArray(raw)) {
    return []
  }

  const parsed: ChatImageAttachmentMeta[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      continue
    }
    const record = item as Record<string, unknown>
    if (
      typeof record.name !== 'string' ||
      !record.name.trim() ||
      typeof record.mimeType !== 'string' ||
      !record.mimeType.trim() ||
      typeof record.sizeBytes !== 'number' ||
      !Number.isFinite(record.sizeBytes) ||
      record.sizeBytes < 0
    ) {
      continue
    }

    parsed.push({
      name: record.name,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      ...(typeof record.width === 'number' &&
      Number.isFinite(record.width) &&
      record.width > 0
        ? { width: record.width }
        : {}),
      ...(typeof record.height === 'number' &&
      Number.isFinite(record.height) &&
      record.height > 0
        ? { height: record.height }
        : {}),
    })
  }

  return parsed
}

export async function saveUserMessageIfNew(
  conversationId: string,
  content: string,
  options?: {
    clientMessageId?: string
    attachments?: ChatImageAttachmentMeta[]
  },
) {
  const clientMessageId = options?.clientMessageId
  if (clientMessageId) {
    const existing = await messageRepository.findUserMessageByClientId(
      conversationId,
      clientMessageId,
    )
    if (existing) {
      return existing
    }
  }

  const parts = content ? [{ type: 'text', content }] : []
  const attachments =
    options?.attachments && options.attachments.length > 0
      ? options.attachments
      : undefined

  // Hanya simpan teks dan metadata lampiran agar biner/base64 gambar tidak disimpan ke database.
  const inserted = await messageRepository.create({
    conversationId,
    role: 'user',
    content,
    metadata: {
      ...(clientMessageId ? { clientMessageId } : {}),
      parts,
      ...(attachments ? { attachments } : {}),
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
    const rowMeta =
      row.metadata && typeof row.metadata === 'object' ? row.metadata : null
    const attachments = parseStoredAttachments(rowMeta?.attachments)

    let rawParts: UIMessage['parts']
    if (rowMeta && Array.isArray(rowMeta.parts)) {
      const nonImageParts = (rowMeta.parts as UIMessage['parts']).filter(
        (part) => part.type !== 'image',
      )
      if (nonImageParts.length > 0) {
        rawParts = nonImageParts
      } else if (row.content) {
        rawParts = [{ type: 'text', content: row.content }]
      } else {
        rawParts = []
      }
    } else {
      rawParts = row.content ? [{ type: 'text', content: row.content }] : []
    }

    return {
      id: row.id,
      role: row.role,
      parts: rawParts,
      ...(attachments.length > 0 ? { metadata: { attachments } } : {}),
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
