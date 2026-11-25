import { z } from 'zod'

export const uuidSchema = z.string().uuid('ID harus berupa UUID yang valid')

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')

/**
 * Memeriksa apakah nilai bertipe string dan memenuhi format UUID yang valid.
 */
export function isValidUuid(value: string | undefined | null): value is string {
  return typeof value === 'string' && uuidSchema.safeParse(value).success
}
