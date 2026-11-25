import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import type { AiUsageStatus, MessageRole } from '#/types/ai'
import { user } from './auth-schema'

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    // Menggunakan text agar kompatibel dengan user.id dari Better Auth,
    // tanpa onDelete: 'cascade' agar riwayat percakapan tetap bertahan.
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    title: varchar('title', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('conversations_user_id_idx').on(table.userId),
    index('conversations_user_updated_idx').on(table.userId, table.updatedAt),
  ],
)

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 20 }).$type<MessageRole>().notNull(),
    content: text('content').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('messages_conversation_id_idx').on(table.conversationId),
    index('messages_conversation_created_idx').on(
      table.conversationId,
      table.createdAt,
    ),
  ],
)

export const aiUsage = pgTable(
  'ai_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    conversationId: uuid('conversation_id').references(() => conversations.id, {
      onDelete: 'set null',
    }),
    messageId: uuid('message_id').references(() => messages.id, {
      onDelete: 'set null',
    }),
    model: varchar('model', { length: 100 }).notNull(),
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
    status: varchar('status', { length: 32 }).$type<AiUsageStatus>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('ai_usage_user_id_idx').on(table.userId),
    index('ai_usage_conversation_id_idx').on(table.conversationId),
    index('ai_usage_created_at_idx').on(table.createdAt),
  ],
)

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(user, {
      fields: [conversations.userId],
      references: [user.id],
    }),
    messages: many(messages),
    aiUsages: many(aiUsage),
  }),
)

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  aiUsages: many(aiUsage),
}))

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  user: one(user, {
    fields: [aiUsage.userId],
    references: [user.id],
  }),
  conversation: one(conversations, {
    fields: [aiUsage.conversationId],
    references: [conversations.id],
  }),
  message: one(messages, {
    fields: [aiUsage.messageId],
    references: [messages.id],
  }),
}))
