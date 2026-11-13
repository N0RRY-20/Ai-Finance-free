/**
 * Mengambil maksimal 2 huruf inisial kapital dari nama lengkap.
 * Contoh: "Norry Dev" -> "ND", "Budi" -> "B", "" -> "U".
 */
export function getInitials(name?: string | null, fallback = 'U'): string {
  const trimmed = name?.trim()
  if (!trimmed) return fallback

  return (
    trimmed
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || fallback
  )
}
