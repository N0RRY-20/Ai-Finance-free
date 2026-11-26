import { db } from '#/db'
import { aiUsage } from '#/db/schema/ai-schema'
import type { NewAiUsage } from '#/types/ai'

export const aiUsageRepository = {
  /**
   * Mencatat log pemakaian token & status eksekusi AI.
   */
  async create(data: NewAiUsage): Promise<void> {
    await db.insert(aiUsage).values(data)
  },
}
