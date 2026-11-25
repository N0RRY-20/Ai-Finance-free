import {
  CATEGORY_IDS,
  isValidCategoryForType,
  TRANSACTION_TYPES,
} from '#/constants/categories'
import { z } from 'zod'
import { isoDateSchema, uuidSchema } from './common.validation'

export const MAX_TRANSACTION_AMOUNT = 999_999_999_999.99
export const TRANSACTION_PAGE_SIZES = [10, 20, 50] as const

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES)
export const categoryIdSchema = z.enum(CATEGORY_IDS)

const transactionAmountSchema = z.coerce
  .number()
  .finite('Nominal tidak valid')
  .positive('Nominal harus lebih dari 0')
  .max(MAX_TRANSACTION_AMOUNT, 'Nominal terlalu besar')

export const transactionIdParamSchema = z.object({
  transactionId: uuidSchema,
})

export const createTransactionInputSchema = z
  .object({
    type: transactionTypeSchema,
    amount: transactionAmountSchema,
    categoryId: categoryIdSchema,
    description: z
      .string()
      .trim()
      .max(1000, 'Deskripsi maksimal 1000 karakter')
      .default(''),
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
  description: z
    .string()
    .trim()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional(),
  transactionDate: isoDateSchema.optional(),
})

export const updateTransactionRequestSchema = z.object({
  transactionId: uuidSchema,
  patch: updateTransactionPatchSchema,
})

export const listTransactionsFilterSchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: categoryIdSchema.optional(),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  search: z.string().trim().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const transactionPageSizeSchema = z.coerce
  .number()
  .int()
  .refine(
    (value): value is (typeof TRANSACTION_PAGE_SIZES)[number] =>
      value === 10 || value === 20 || value === 50,
    'Ukuran halaman harus 10, 20, atau 50',
  )

export const transactionsPageQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: categoryIdSchema.optional(),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  search: z
    .string()
    .trim()
    .max(200)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: transactionPageSizeSchema.default(10),
})

const optionalSearchDateSchema = z
  .preprocess(
    (value) =>
      typeof value === 'string' && value.trim() === '' ? undefined : value,
    isoDateSchema.optional(),
  )
  .catch(undefined)

const optionalSearchKeywordSchema = z
  .preprocess((value) => {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, z.string().max(200).optional())
  .catch(undefined)

export const transactionsSearchSchema = z.object({
  type: transactionTypeSchema.optional().catch(undefined),
  categoryId: categoryIdSchema.optional().catch(undefined),
  startDate: optionalSearchDateSchema,
  endDate: optionalSearchDateSchema,
  search: optionalSearchKeywordSchema,
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: transactionPageSizeSchema.catch(10),
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
