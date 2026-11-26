import {
  deleteTransactionToolInputSchema,
  deleteTransactionToolOutputSchema,
  getTransactionSummaryToolInputSchema,
  getTransactionSummaryToolOutputSchema,
  listTransactionsToolInputSchema,
  listTransactionsToolOutputSchema,
  recordTransactionToolInputSchema,
  recordTransactionToolOutputSchema,
  updateTransactionToolInputSchema,
  updateTransactionToolOutputSchema,
} from '#/validations/ai-tools.validation'
import { toolDefinition } from '@tanstack/ai'

export const recordTransactionDef = toolDefinition({
  name: 'record_transaction',
  description:
    'Catat transaksi pemasukan atau pengeluaran baru ke database transaksi keuangan pengguna.',
  inputSchema: recordTransactionToolInputSchema,
  outputSchema: recordTransactionToolOutputSchema,
})

export const listTransactionsDef = toolDefinition({
  name: 'list_transactions',
  description:
    'Ambil daftar riwayat transaksi milik pengguna dengan filter opsional tipe, kategori, rentang tanggal, kata kunci deskripsi, dan batas jumlah.',
  inputSchema: listTransactionsToolInputSchema,
  outputSchema: listTransactionsToolOutputSchema,
})

export const getTransactionSummaryDef = toolDefinition({
  name: 'get_transaction_summary',
  description:
    'Hitung ringkasan total pemasukan, total pengeluaran, saldo bersih, dan rincian per kategori milik pengguna.',
  inputSchema: getTransactionSummaryToolInputSchema,
  outputSchema: getTransactionSummaryToolOutputSchema,
})

export const updateTransactionDef = toolDefinition({
  name: 'update_transaction',
  description:
    'Perbarui data transaksi yang sudah ada berdasarkan ID transaksi (nominal, tipe, kategori, deskripsi, atau tanggal).',
  inputSchema: updateTransactionToolInputSchema,
  outputSchema: updateTransactionToolOutputSchema,
})

export const deleteTransactionDef = toolDefinition({
  name: 'delete_transaction',
  description: 'Hapus transaksi dari database berdasarkan ID transaksi.',
  inputSchema: deleteTransactionToolInputSchema,
  outputSchema: deleteTransactionToolOutputSchema,
})
