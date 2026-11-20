import type { aiUsage, conversations, messages } from '#/db/schema/ai-schema'

export type MessageRole = 'user' | 'assistant' | 'system'
export type AiUsageStatus = 'success' | 'error' | 'rate_limited' | 'cancelled'

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type AiUsage = typeof aiUsage.$inferSelect
export type NewAiUsage = typeof aiUsage.$inferInsert
