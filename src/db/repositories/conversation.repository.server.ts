import { db } from '#/db'
import { conversations } from '#/db/schema/ai-schema'
import type { Conversation, NewConversation } from '#/types/ai'
import { and, desc, eq, isNull } from 'drizzle-orm'

export const conversationRepository = {
  /**
   * Mengambil daftar percakapan aktif (belum di-soft-delete) milik pengguna.
   */
  async findActiveByUser(userId: string, limit = 30): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.userId, userId), isNull(conversations.deletedAt)),
      )
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
  },

  /**
   * Mengambil satu percakapan berdasarkan ID-nya.
   */
  async findById(conversationId: string): Promise<Conversation | undefined> {
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1)
    return rows.at(0)
  },

  /**
   * Membuat entri percakapan baru.
   */
  async create(data: NewConversation): Promise<Conversation> {
    const [created] = await db.insert(conversations).values(data).returning()
    return created
  },

  /**
   * Memperbarui judul percakapan hanya jika judul saat ini masih sama dengan expectedTitle.
   */
  async updateTitleIfMatches(
    conversationId: string,
    userId: string,
    expectedTitle: string,
    nextTitle: string,
  ): Promise<void> {
    await db
      .update(conversations)
      .set({
        title: nextTitle,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId),
          eq(conversations.title, expectedTitle),
        ),
      )
  },

  /**
   * Memperbarui timestamp updatedAt pada percakapan ketika ada pesan baru.
   */
  async touchUpdatedAt(conversationId: string): Promise<void> {
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId))
  },

  /**
   * Melakukan soft-delete percakapan milik pengguna.
   */
  async softDeleteForUser(
    userId: string,
    conversationId: string,
  ): Promise<{ id: string } | undefined> {
    const [updated] = await db
      .update(conversations)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId),
          isNull(conversations.deletedAt),
        ),
      )
      .returning({ id: conversations.id })
    return updated
  },
}
