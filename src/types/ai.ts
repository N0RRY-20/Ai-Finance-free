import type {
  AI_PROVIDERS,
  GEMINI_CHAT_MODEL_OPTIONS,
} from '#/constants/ai-models'
import type {
  aiUsage,
  conversations,
  messages,
  userAiKeys,
} from '#/db/schema/ai-schema'
import type { saveAiKeyInputSchema } from '#/validations/ai-key.validation'
import type { conversationIdParamSchema } from '#/validations/chat.validation'
import type { z } from 'zod'

export type AiProvider = (typeof AI_PROVIDERS)[number]
export type GeminiChatModelOption = (typeof GEMINI_CHAT_MODEL_OPTIONS)[number]
export type GeminiChatModelId = GeminiChatModelOption['id']
export type MessageRole = 'user' | 'assistant' | 'system'
export type AiUsageStatus = 'success' | 'error' | 'rate_limited' | 'cancelled'

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type AiUsage = typeof aiUsage.$inferSelect
export type NewAiUsage = typeof aiUsage.$inferInsert
export type UserAiKey = typeof userAiKeys.$inferSelect
export type NewUserAiKey = typeof userAiKeys.$inferInsert

export interface SerializedConversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface UserAiKeyStatus {
  hasKey: boolean
  provider: AiProvider
  keyHint: string | null
  model: GeminiChatModelId
  updatedAt: string | null
}

export interface DecryptedUserAiCredentials {
  apiKey: string
  model: GeminiChatModelId
}

export type SaveAiKeyInput = z.infer<typeof saveAiKeyInputSchema>

export interface UpsertUserAiKeyInput {
  apiKey?: string
  model: GeminiChatModelId
  provider?: AiProvider
}

export interface RecordAiUsageInput {
  userId: string
  conversationId?: string | null
  messageId?: string | null
  model: string
  inputTokens: number
  outputTokens: number
  status: AiUsageStatus
}

export type ConversationIdInput = z.infer<typeof conversationIdParamSchema>

export interface ChatImageAttachmentMeta {
  name: string
  mimeType: string
  sizeBytes: number
  width?: number
  height?: number
}

export interface DeleteResult {
  deleted: boolean
}
