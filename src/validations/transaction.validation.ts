import {
  CATEGORY_IDS,
  isValidCategoryForType,
  TRANSACTION_TYPES,
} from '#/constants/categories'
import { z } from 'zod'

export const transactionTypeSchema = z.enum(TRANSACTION_TYPES)
export const categoryIdSchema = z.enum(CATEGORY_IDS)

export const createTransactionInputSchema = z
  .object({
    type: transactionTypeSchema,
    amount: z.coerce
      .number()
      .finite('Nominal tidak valid')
      .positive('Nominal harus lebih dari 0'),
    categoryId: categoryIdSchema,
    description: z.string().trim().max(1000).default(''),
    transactionDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  })
  .refine((data) => isValidCategoryForType(data.categoryId, data.type), {
    message: 'Kategori tidak sesuai dengan tipe transaksi',
    path: ['categoryId'],
  })
