import { getCategoryById } from '#/constants/categories'
import { transactionRepository } from '#/db/repositories'
import type {
  DashboardFinanceOverview,
  ListTransactionsFilters,
  SerializedTransaction,
  Transaction,
  TransactionCategorySummary,
  TransactionDateRangeFilter,
  TransactionMutationResult,
  TransactionSummaryResult,
  UpdateTransactionPatch,
} from '#/types/finance'
import { formatIdr } from '#/utils/format'
import { getCurrentWibMonthRange } from '#/utils/date'
import { createTransactionInputSchema } from '#/validations/transaction.validation'

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
  filters?: TransactionDateRangeFilter,
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

  const [allTime, monthly, recentTransactions] = await Promise.all([
    getTransactionSummary(userId),
    getTransactionSummary(userId, monthRange),
    listTransactions(userId, { limit: 10 }),
  ])

  return {
    balance: allTime.balance,
    monthlyIncome: monthly.totalIncome,
    monthlyExpense: monthly.totalExpense,
    totalTransactionCount: allTime.transactionCount,
    monthlyTransactionCount: monthly.transactionCount,
    monthRange,
    recentTransactions,
  }
}
