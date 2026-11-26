/**
 * Mengambil tanggal hari ini pada zona waktu WIB (Asia/Jakarta) dalam format YYYY-MM-DD.
 */
export function getTodayWibDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/**
 * Mengembalikan rentang tanggal awal dan akhir bulan berjalan pada zona waktu WIB (YYYY-MM-DD).
 */
export function getCurrentWibMonthRange(): {
  startDate: string
  endDate: string
} {
  const today = getTodayWibDate()
  const [yearStr, monthStr] = today.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()

  return {
    startDate: `${yearStr}-${monthStr}-01`,
    endDate: `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
  }
}
