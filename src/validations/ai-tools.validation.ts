import { z } from 'zod'
import { isoDateSchema, uuidSchema } from './common.validation'
import {
  categoryIdSchema,
  serializedTransactionSchema,
  transactionSummaryResultSchema,
  transactionTypeSchema,
} from './transaction.validation'

const transactionToolMutationOutputSchema = z.object({
  success: z.boolean(),
  transaction: serializedTransactionSchema.optional(),
  error: z.string().optional(),
})

export const recordTransactionToolInputSchema = z.object({
  type: transactionTypeSchema.describe(
    'Tipe transaksi: "expense" untuk pengeluaran atau "income" untuk pemasukan.',
  ),
  amount: z
    .number()
    .positive()
    .describe('Nominal transaksi dalam Rupiah (angka positif, misal 10000).'),
  categoryId: categoryIdSchema.describe(
    'ID kategori yang sesuai dengan tipe transaksi (misal food_drink untuk pengeluaran makanan/buah, salary untuk gaji).',
  ),
  description: z
    .string()
    .trim()
    .max(1000)
    .describe('Deskripsi singkat dan jelas tentang transaksi tersebut.'),
  transactionDate: isoDateSchema
    .optional()
    .describe(
      'Tanggal transaksi format YYYY-MM-DD. Kosongkan jika transaksi terjadi hari ini.',
    ),
})

export const recordTransactionToolOutputSchema =
  transactionToolMutationOutputSchema

export const listTransactionsToolInputSchema = z.object({
  type: transactionTypeSchema.optional().describe('Filter tipe transaksi.'),
  categoryId: categoryIdSchema
    .optional()
    .describe('Filter ID kategori transaksi.'),
  startDate: isoDateSchema
    .optional()
    .describe('Tanggal mulai filter (YYYY-MM-DD).'),
  endDate: isoDateSchema
    .optional()
    .describe('Tanggal akhir filter (YYYY-MM-DD).'),
  search: z
    .string()
    .optional()
    .describe('Kata kunci pencarian pada deskripsi transaksi.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('Jumlah maksimal transaksi yang diambil (default 20).'),
})

export const listTransactionsToolOutputSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  transactions: z.array(serializedTransactionSchema),
})

export const getTransactionSummaryToolInputSchema = z.object({
  startDate: isoDateSchema
    .optional()
    .describe('Tanggal mulai periode ringkasan (YYYY-MM-DD).'),
  endDate: isoDateSchema
    .optional()
    .describe('Tanggal akhir periode ringkasan (YYYY-MM-DD).'),
})

export const getTransactionSummaryToolOutputSchema = z.object({
  success: z.boolean(),
  summary: transactionSummaryResultSchema,
})

export const updateTransactionToolInputSchema = z.object({
  transactionId: uuidSchema.describe('UUID transaksi yang ingin diubah.'),
  type: transactionTypeSchema.optional().describe('Tipe transaksi baru.'),
  amount: z
    .number()
    .positive()
    .optional()
    .describe('Nominal transaksi baru dalam Rupiah.'),
  categoryId: categoryIdSchema
    .optional()
    .describe('ID kategori baru yang sesuai dengan tipe transaksi.'),
  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .describe('Deskripsi baru transaksi.'),
  transactionDate: isoDateSchema
    .optional()
    .describe('Tanggal transaksi baru (YYYY-MM-DD).'),
})

export const updateTransactionToolOutputSchema =
  transactionToolMutationOutputSchema

export const deleteTransactionToolInputSchema = z.object({
  transactionId: uuidSchema.describe('UUID transaksi yang akan dihapus.'),
})

export const deleteTransactionToolOutputSchema =
  transactionToolMutationOutputSchema
