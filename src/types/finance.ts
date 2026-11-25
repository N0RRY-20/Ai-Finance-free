import type {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
} from '#/constants/categories'
import type { transactions } from '#/db/schema/finance-schema'
import type { createTransactionInputSchema } from '#/validations/transaction.validation'
import type { z } from 'zod'

export type TransactionType = (typeof TRANSACTION_TYPES)[number]
export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number]
export type CategoryId = TransactionCategory['id']

export type CreateTransactionInput = z.infer<
  typeof createTransactionInputSchema
>

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

export interface SerializedTransaction {
  id: string
  type: TransactionType
  amount: number
  amountFormatted: string
  categoryId: CategoryId
  categoryLabel: string
  description: string
  transactionDate: string
  createdAt: string
  updatedAt: string
}

export interface TransactionCategorySummary {
  categoryId: CategoryId
  categoryLabel: string
  type: TransactionType
  total: number
  totalFormatted: string
  count: number
}

export interface TransactionSummaryResult {
  totalIncome: number
  totalIncomeFormatted: string
  totalExpense: number
  totalExpenseFormatted: string
  balance: number
  balanceFormatted: string
  transactionCount: number
  byCategory: TransactionCategorySummary[]
}

export interface TransactionCategoryAggregationRow {
  type: TransactionType
  categoryId: CategoryId
  total: string
  count: number
}

export interface DashboardFinanceOverview {
  balance: number
  monthlyIncome: number
  monthlyExpense: number
  totalTransactionCount: number
  monthlyTransactionCount: number
  monthRange: {
    startDate: string
    endDate: string
  }
  recentTransactions: SerializedTransaction[]
}

export interface ListTransactionsFilters {
  type?: TransactionType
  categoryId?: CategoryId
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
}

export interface TransactionDateRangeFilter {
  startDate?: string
  endDate?: string
}

export interface UpdateTransactionPatch {
  type?: TransactionType
  amount?: number
  categoryId?: CategoryId
  description?: string
  transactionDate?: string
}

export type TransactionMutationResult =
  | { ok: true; transaction: SerializedTransaction }
  | { ok: false; error: string }
