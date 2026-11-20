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
