import { getCategoryById } from '#/constants/categories'
import { transactionRepository } from '#/db/repositories'
import type {
  DashboardSummaryResult,
  ListTransactionsFilters,
  PaginatedTransactionsResult,
  SerializedTransaction,
  Transaction,
  TransactionCategorySummary,
  TransactionMutationResult,
  TransactionsPageQuery,
  TransactionSummaryFilters,
  TransactionSummaryResult,
  TransactionSummaryTotals,
  UpdateTransactionPatch,
} from '#/types/finance'
import { formatIdr } from '#/utils/format'
import { createTransactionInputSchema } from '#/validations/transaction.validation'

export function getTodayWibDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

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

function formatWibMonthLabel(startDate: string): string {
  const [yearStr, monthStr] = startDate.split('-')
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, 1)))
}

function serializeTransaction(row: Transaction): SerializedTransaction {
  const amount = Number(row.amount)
  return {
    id: row.id,
    type: row.type,
    amount,
    amountFormatted: formatIdr(amount),
    categoryId: row.categoryId,
    categoryLabel: getCategoryById(row.categoryId)?.label ?? row.categoryId,
    description: row.description,
    transactionDate: row.transactionDate,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createTransaction(
  userId: string,
  input: unknown,
): Promise<TransactionMutationResult> {
  const parsed = createTransactionInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((issue) => issue.message).join('; '),
    }
  }

  const inserted = await transactionRepository.create({
    userId,
    type: parsed.data.type,
    amount: parsed.data.amount.toFixed(2),
    categoryId: parsed.data.categoryId,
    description: parsed.data.description,
    transactionDate: parsed.data.transactionDate,
  })

  return {
    ok: true,
    transaction: serializeTransaction(inserted),
  }
}

export async function listTransactions(
  userId: string,
  filters?: ListTransactionsFilters,
): Promise<SerializedTransaction[]> {
  const rows = await transactionRepository.findManyByUser(userId, filters)
  return rows.map(serializeTransaction)
}

export async function getTransactionSummary(
  userId: string,
  filters?: TransactionSummaryFilters,
): Promise<TransactionSummaryResult> {
  const grouped = await transactionRepository.aggregateByCategory(
    userId,
    filters,
  )

  let totalIncome = 0
  let totalExpense = 0
  let transactionCount = 0

  const byCategory: TransactionCategorySummary[] = grouped
    .map((row) => {
      const total = Number(row.total)
      if (row.type === 'income') {
        totalIncome += total
      } else {
        totalExpense += total
      }
      transactionCount += row.count

      return {
        categoryId: row.categoryId,
        categoryLabel: getCategoryById(row.categoryId)?.label ?? row.categoryId,
        type: row.type,
        total,
        totalFormatted: formatIdr(total),
        count: row.count,
      }
    })
    .sort((a, b) => b.total - a.total)

  const balance = totalIncome - totalExpense

  return {
    totalIncome,
    totalIncomeFormatted: formatIdr(totalIncome),
    totalExpense,
    totalExpenseFormatted: formatIdr(totalExpense),
    balance,
    balanceFormatted: formatIdr(balance),
    transactionCount,
    byCategory,
  }
}

function pickSummaryTotals(
  result: TransactionSummaryResult,
): TransactionSummaryTotals {
  return {
    totalIncome: result.totalIncome,
    totalIncomeFormatted: result.totalIncomeFormatted,
    totalExpense: result.totalExpense,
    totalExpenseFormatted: result.totalExpenseFormatted,
    balance: result.balance,
    balanceFormatted: result.balanceFormatted,
    transactionCount: result.transactionCount,
  }
}

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummaryResult> {
  const currentMonthRange = getCurrentWibMonthRange()
  const [allTime, currentMonth] = await Promise.all([
    getTransactionSummary(userId),
    getTransactionSummary(userId, currentMonthRange),
  ])

  return {
    monthLabel: formatWibMonthLabel(currentMonthRange.startDate),
    allTime: pickSummaryTotals(allTime),
    currentMonth: pickSummaryTotals(currentMonth),
  }
}

export async function listTransactionsPaginated(
  userId: string,
  query: TransactionsPageQuery,
): Promise<PaginatedTransactionsResult> {
  const filters: TransactionSummaryFilters = {
    type: query.type,
    categoryId: query.categoryId,
    startDate: query.startDate,
    endDate: query.endDate,
    search: query.search,
  }

  const totalItems = await transactionRepository.countByUser(userId, filters)

  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize))
  const safePage = Math.min(Math.max(1, query.page), totalPages)
  const offset = (safePage - 1) * query.pageSize

  const rows =
    totalItems > 0
      ? await transactionRepository.findManyByUser(userId, {
          ...filters,
          limit: query.pageSize,
          offset,
        })
      : []

  return {
    items: rows.map(serializeTransaction),
    pagination: {
      page: safePage,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
    },
  }
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  patch: UpdateTransactionPatch,
): Promise<TransactionMutationResult> {
  const existing = await transactionRepository.findByIdForUser(
    userId,
    transactionId,
  )

  if (!existing) {
    return {
      ok: false,
      error: 'Transaksi tidak ditemukan atau bukan milik pengguna ini.',
    }
  }

  const merged = {
    type: patch.type ?? existing.type,
    amount: patch.amount ?? Number(existing.amount),
    categoryId: patch.categoryId ?? existing.categoryId,
    description: patch.description ?? existing.description,
    transactionDate: patch.transactionDate ?? existing.transactionDate,
  }

  const parsed = createTransactionInputSchema.safeParse(merged)
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((issue) => issue.message).join('; '),
    }
  }

  const updated = await transactionRepository.updateByIdForUser(
    userId,
    transactionId,
    {
      type: parsed.data.type,
      amount: parsed.data.amount.toFixed(2),
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      transactionDate: parsed.data.transactionDate,
    },
  )

  if (!updated) {
    return {
      ok: false,
      error: 'Gagal memperbarui transaksi.',
    }
  }

  return {
    ok: true,
    transaction: serializeTransaction(updated),
  }
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
): Promise<TransactionMutationResult> {
  const deleted = await transactionRepository.deleteByIdForUser(
    userId,
    transactionId,
  )

  if (!deleted) {
    return {
      ok: false,
      error: 'Transaksi tidak ditemukan atau sudah dihapus.',
    }
  }

  return {
    ok: true,
    transaction: serializeTransaction(deleted),
  }
}
