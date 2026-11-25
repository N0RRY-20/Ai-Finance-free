import {
  deleteTransactionDef,
  getTransactionSummaryDef,
  listTransactionsDef,
  recordTransactionDef,
  updateTransactionDef,
} from '#/ai/tools/definitions/transaction.tools.def'
import {
  createTransaction,
  deleteTransaction,
  getTransactionSummary,
  listTransactions,
  updateTransaction,
} from '#/services/transaction.service.server'
import { getTodayWibDate } from '#/utils/date'

export function createTransactionTools(userId: string) {
  const recordTransaction = recordTransactionDef.server(async (input) => {
    const result = await createTransaction(userId, {
      ...input,
      transactionDate: input.transactionDate ?? getTodayWibDate(),
    })

    if (!result.ok) {
      return { success: false, error: result.error }
    }

    return { success: true, transaction: result.transaction }
  })

  const listTransactionsTool = listTransactionsDef.server(async (input) => {
    const rows = await listTransactions(userId, input)
    return {
      success: true,
      count: rows.length,
      transactions: rows,
    }
  })

  const getTransactionSummaryTool = getTransactionSummaryDef.server(
    async (input) => {
      const summary = await getTransactionSummary(userId, input)
      return {
        success: true,
        summary,
      }
    },
  )

  const updateTransactionTool = updateTransactionDef.server(async (input) => {
    const result = await updateTransaction(userId, input.transactionId, {
      type: input.type,
      amount: input.amount,
      categoryId: input.categoryId,
      description: input.description,
      transactionDate: input.transactionDate,
    })

    if (!result.ok) {
      return { success: false, error: result.error }
    }

    return { success: true, transaction: result.transaction }
  })

  const deleteTransactionTool = deleteTransactionDef.server(async (input) => {
    const result = await deleteTransaction(userId, input.transactionId)

    if (!result.ok) {
      return { success: false, error: result.error }
    }

    return { success: true, transaction: result.transaction }
  })

  return [
    recordTransaction,
    listTransactionsTool,
    getTransactionSummaryTool,
    updateTransactionTool,
    deleteTransactionTool,
  ]
}
