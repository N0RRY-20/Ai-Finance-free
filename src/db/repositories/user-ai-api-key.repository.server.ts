import { db } from '#/db'
import { userAiKeys } from '#/db/schema/ai-schema'
import type { AiProvider, UserAiKey } from '#/types/ai'
import { and, eq } from 'drizzle-orm'

export const userAiApiKeyRepository = {
  /**
   * Mengambil metadata keyHint, model, dan updatedAt untuk provider milik pengguna.
   */
  async findStatusByUserAndProvider(
    userId: string,
    provider: AiProvider,
  ): Promise<Pick<UserAiKey, 'keyHint' | 'model' | 'updatedAt'> | undefined> {
    const rows = await db
      .select({
        keyHint: userAiKeys.keyHint,
        model: userAiKeys.model,
        updatedAt: userAiKeys.updatedAt,
      })
      .from(userAiKeys)
      .where(
        and(eq(userAiKeys.userId, userId), eq(userAiKeys.provider, provider)),
      )
      .limit(1)
    return rows.at(0)
  },

  /**
   * Mengambil API Key terenkripsi dan model aktif untuk provider milik pengguna.
   */
  async findCredentialsByUserAndProvider(
    userId: string,
    provider: AiProvider,
  ): Promise<Pick<UserAiKey, 'encryptedApiKey' | 'model'> | undefined> {
    const rows = await db
      .select({
        encryptedApiKey: userAiKeys.encryptedApiKey,
        model: userAiKeys.model,
      })
      .from(userAiKeys)
      .where(
        and(eq(userAiKeys.userId, userId), eq(userAiKeys.provider, provider)),
      )
      .limit(1)
    return rows.at(0)
  },

  /**
   * Menyimpan atau memperbarui API Key terenkripsi beserta model pilihan pengguna.
   */
  async upsert(data: {
    userId: string
    provider: AiProvider
    encryptedApiKey: string
    keyHint: string
    model: string
  }): Promise<Pick<UserAiKey, 'keyHint' | 'model' | 'updatedAt'> | undefined> {
    const rows = await db
      .insert(userAiKeys)
      .values({
        userId: data.userId,
        provider: data.provider,
        encryptedApiKey: data.encryptedApiKey,
        keyHint: data.keyHint,
        model: data.model,
      })
      .onConflictDoUpdate({
        target: [userAiKeys.userId, userAiKeys.provider],
        set: {
          encryptedApiKey: data.encryptedApiKey,
          keyHint: data.keyHint,
          model: data.model,
          updatedAt: new Date(),
        },
      })
      .returning({
        keyHint: userAiKeys.keyHint,
        model: userAiKeys.model,
        updatedAt: userAiKeys.updatedAt,
      })
    return rows.at(0)
  },

  /**
   * Memperbarui pilihan model untuk API Key pengguna yang sudah tersimpan.
   */
  async updateModel(
    userId: string,
    provider: AiProvider,
    model: string,
  ): Promise<Pick<UserAiKey, 'keyHint' | 'model' | 'updatedAt'> | undefined> {
    const rows = await db
      .update(userAiKeys)
      .set({
        model,
        updatedAt: new Date(),
      })
      .where(
        and(eq(userAiKeys.userId, userId), eq(userAiKeys.provider, provider)),
      )
      .returning({
        keyHint: userAiKeys.keyHint,
        model: userAiKeys.model,
        updatedAt: userAiKeys.updatedAt,
      })
    return rows.at(0)
  },

  /**
   * Menghapus API Key milik pengguna untuk provider tertentu.
   */
  async deleteByUserAndProvider(
    userId: string,
    provider: AiProvider,
  ): Promise<boolean> {
    const rows = await db
      .delete(userAiKeys)
      .where(
        and(eq(userAiKeys.userId, userId), eq(userAiKeys.provider, provider)),
      )
      .returning({ id: userAiKeys.id })
    return rows.length > 0
  },
}
