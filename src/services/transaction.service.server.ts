import { getCategoryById } from '#/constants/categories'
import { transactionRepository } from '#/db/repositories'
import type {
  DashboardFinanceOverview,
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
import { getCurrentWibMonthRange } from '#/utils/date'
import { formatIdr } from '#/utils/format'
import { createTransactionInputSchema } from '#/validations/transaction.validation'

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

function buildSummaryTotals(
  incomeRaw: string,
  expenseRaw: string,
  transactionCount: number,
): TransactionSummaryTotals {
  const totalIncome = Number(incomeRaw)
  const totalExpense = Number(expenseRaw)
  const balance = totalIncome - totalExpense

  return {
    totalIncome,
    totalIncomeFormatted: formatIdr(totalIncome),
    totalExpense,
    totalExpenseFormatted: formatIdr(totalExpense),
    balance,
    balanceFormatted: formatIdr(balance),
    transactionCount,
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

export async function getDashboardSummary(
  userId: string,
): Promise<DashboardSummaryResult> {
  const currentMonthRange = getCurrentWibMonthRange()
  const aggregated = await transactionRepository.aggregateDashboardOverview(
    userId,
    currentMonthRange,
  )

  return {
    monthLabel: formatWibMonthLabel(currentMonthRange.startDate),
    allTime: buildSummaryTotals(
      aggregated.allTimeIncome,
      aggregated.allTimeExpense,
      aggregated.totalTransactionCount,
    ),
    currentMonth: buildSummaryTotals(
      aggregated.monthlyIncome,
      aggregated.monthlyExpense,
      aggregated.monthlyTransactionCount,
    ),
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

  const requestedPage = Math.max(1, query.page)
  const requestedOffset = (requestedPage - 1) * query.pageSize

  const [totalItems, initialRows] = await Promise.all([
    transactionRepository.countByUser(userId, filters),
    transactionRepository.findManyByUser(userId, {
      ...filters,
      limit: query.pageSize,
      offset: requestedOffset,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize))
  const safePage = Math.min(requestedPage, totalPages)

  let rows = initialRows
  if (totalItems === 0) {
    rows = []
  } else if (safePage !== requestedPage) {
    const safeOffset = (safePage - 1) * query.pageSize
    rows = await transactionRepository.findManyByUser(userId, {
      ...filters,
      limit: query.pageSize,
      offset: safeOffset,
    })
  }

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

export async function getDashboardFinanceOverview(
  userId: string,
): Promise<DashboardFinanceOverview> {
  const monthRange = getCurrentWibMonthRange()

  const [aggregated, recentTransactions] = await Promise.all([
    transactionRepository.aggregateDashboardOverview(userId, monthRange),
    listTransactions(userId, { limit: 10 }),
  ])

  const allTimeIncome = Number(aggregated.allTimeIncome)
  const allTimeExpense = Number(aggregated.allTimeExpense)

  return {
    balance: allTimeIncome - allTimeExpense,
    monthlyIncome: Number(aggregated.monthlyIncome),
    monthlyExpense: Number(aggregated.monthlyExpense),
    totalTransactionCount: aggregated.totalTransactionCount,
    monthlyTransactionCount: aggregated.monthlyTransactionCount,
    monthRange,
    recentTransactions,
  }
}
