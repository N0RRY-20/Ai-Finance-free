import {
  CATEGORY_IDS,
  isValidCategoryForType,
  TRANSACTION_TYPES,
} from '#/constants/categories'
import { z } from 'zod'
import { isoDateSchema, uuidSchema } from './common.validation'

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES)
export const categoryIdSchema = z.enum(CATEGORY_IDS)

const transactionAmountSchema = z.coerce
  .number()
  .finite('Nominal tidak valid')
  .positive('Nominal harus lebih dari 0')

export const transactionIdParamSchema = z.object({
  transactionId: uuidSchema,
})

export const createTransactionInputSchema = z
  .object({
    type: transactionTypeSchema,
    amount: transactionAmountSchema,
    categoryId: categoryIdSchema,
    description: z.string().trim().max(1000).default(''),
    transactionDate: isoDateSchema,
  })
  .refine((data) => isValidCategoryForType(data.categoryId, data.type), {
    message: 'Kategori tidak sesuai dengan tipe transaksi',
    path: ['categoryId'],
  })

export const updateTransactionPatchSchema = z.object({
  type: transactionTypeSchema.optional(),
  amount: transactionAmountSchema.optional(),
  categoryId: categoryIdSchema.optional(),
  description: z.string().trim().max(1000).optional(),
  transactionDate: isoDateSchema.optional(),
})

export const listTransactionsFilterSchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: categoryIdSchema.optional(),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  search: z.string().trim().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const transactionSummaryFilterSchema = z.object({
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
})

export const serializedTransactionSchema = z.object({
  id: z.string(),
  type: transactionTypeSchema,
  amount: z.number(),
  amountFormatted: z.string(),
  categoryId: categoryIdSchema,
  categoryLabel: z.string(),
  description: z.string(),
  transactionDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const transactionCategorySummarySchema = z.object({
  categoryId: categoryIdSchema,
  categoryLabel: z.string(),
  type: transactionTypeSchema,
  total: z.number(),
  totalFormatted: z.string(),
  count: z.number(),
})

export const transactionSummaryResultSchema = z.object({
  totalIncome: z.number(),
  totalIncomeFormatted: z.string(),
  totalExpense: z.number(),
  totalExpenseFormatted: z.string(),
  balance: z.number(),
  balanceFormatted: z.string(),
  transactionCount: z.number(),
  byCategory: z.array(transactionCategorySummarySchema),
})
