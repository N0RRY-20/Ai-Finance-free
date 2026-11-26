import { db } from '#/db'
import { messages } from '#/db/schema/ai-schema'
import type { Message, NewMessage } from '#/types/ai'
import { and, asc, eq, sql } from 'drizzle-orm'

export const messageRepository = {
  /**
   * Mencari pesan pengguna berdasarkan clientMessageId di metadata untuk idempotensi.
   */
  async findUserMessageByClientId(
    conversationId: string,
    clientMessageId: string,
  ): Promise<Message | undefined> {
    const rows = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.role, 'user'),
          sql`${messages.metadata}->>'clientMessageId' = ${clientMessageId}`,
        ),
      )
      .limit(1)
    return rows.at(0)
  },

  /**
   * Menyimpan pesan baru ke tabel messages.
   */
  async create(data: NewMessage): Promise<Message> {
    const [inserted] = await db.insert(messages).values(data).returning()
    return inserted
  },

  /**
   * Mengambil seluruh pesan dalam satu percakapan terurut kronologis.
   */
  async findByConversationId(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
  },
}
