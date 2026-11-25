import { z } from 'zod'

export const uuidSchema = z.string().uuid('ID harus berupa UUID yang valid')

function isValidIsoCalendarDate(value: string): boolean {
  const [yearStr, monthStr, dayStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!year || !month || !day) return false

  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
  .refine(isValidIsoCalendarDate, 'Tanggal kalender tidak valid')

/**
 * Memeriksa apakah nilai bertipe string dan memenuhi format UUID yang valid.
 */
export function isValidUuid(value: string | undefined | null): value is string {
  return typeof value === 'string' && uuidSchema.safeParse(value).success
}
