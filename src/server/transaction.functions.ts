import { authServerMiddleware } from '#/middleware/auth.middleware'
import { getUserAiKeyStatus } from '#/services/ai-key.service.server'
import {
  createTransaction,
  deleteTransaction,
  getDashboardFinanceOverview,
  getDashboardSummary,
  listTransactionsPaginated,
  updateTransaction,
} from '#/services/transaction.service.server'
import { handleServerError } from '#/utils/server-error.server'
import {
  createTransactionInputSchema,
  transactionIdParamSchema,
  transactionsPageQuerySchema,
  updateTransactionRequestSchema,
} from '#/validations/transaction.validation'
import { createServerFn } from '@tanstack/react-start'

const TRANSACTION_ERROR_MESSAGE =
  'Terjadi kesalahan saat memproses data transaksi. Silakan coba lagi.'

function requireAuthUserId(user: { id: string } | undefined): string {
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user.id
}

export const getDashboardPageDataFn = createServerFn({ method: 'GET' })
  .middleware([authServerMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = requireAuthUserId(context.session?.user)
      const [financeData, aiKeyStatus] = await Promise.all([
        getDashboardFinanceOverview(userId),
        getUserAiKeyStatus(userId, 'gemini'),
      ])
      return { financeData, aiKeyStatus }
    } catch (error) {
      handleServerError(
        'transactions:getDashboardPageDataFn',
        error,
        TRANSACTION_ERROR_MESSAGE,
      )
    }
  })

export const getDashboardFinanceDataFn = createServerFn({ method: 'GET' })
  .middleware([authServerMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = requireAuthUserId(context.session?.user)
      return await getDashboardFinanceOverview(userId)
    } catch (error) {
      handleServerError(
        'transactions:getDashboardFinanceDataFn',
        error,
        TRANSACTION_ERROR_MESSAGE,
      )
    }
  })

export const getDashboardSummaryFn = createServerFn({ method: 'GET' })
  .middleware([authServerMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = requireAuthUserId(context.session?.user)
      return await getDashboardSummary(userId)
    } catch (error) {
      handleServerError(
        'transactions:getDashboardSummaryFn',
        error,
        TRANSACTION_ERROR_MESSAGE,
      )
    }
  })

export const getTransactionsPageDataFn = createServerFn({ method: 'GET' })
  .middleware([authServerMiddleware])
  .validator(transactionsPageQuerySchema)
  .handler(async ({ context, data }) => {
    try {
      const userId = requireAuthUserId(context.session?.user)
      return await listTransactionsPaginated(userId, data)
    } catch (error) {
      handleServerError(
        'transactions:getTransactionsPageDataFn',
        error,
        TRANSACTION_ERROR_MESSAGE,
      )
    }
  })

export const createTransactionFn = createServerFn({ method: 'POST' })
  .middleware([authServerMiddleware])
  .validator(createTransactionInputSchema)
  .handler(async ({ context, data }) => {
    try {
      const userId = requireAuthUserId(context.session?.user)
      return await createTransaction(userId, data)
    } catch (error) {
      handleServerError(
        'transactions:createTransactionFn',
        error,
        TRANSACTION_ERROR_MESSAGE,
      )
    }
  })

export const updateTransactionFn = createServerFn({ method: 'POST' })
  .middleware([authServerMiddleware])
  .validator(updateTransactionRequestSchema)
  .handler(async ({ context, data }) => {
    try {
      const userId = requireAuthUserId(context.session?.user)
      return await updateTransaction(userId, data.transactionId, data.patch)
    } catch (error) {
      handleServerError(
        'transactions:updateTransactionFn',
        error,
        TRANSACTION_ERROR_MESSAGE,
      )
    }
  })

export const deleteTransactionFn = createServerFn({ method: 'POST' })
  .middleware([authServerMiddleware])
  .validator(transactionIdParamSchema)
  .handler(async ({ context, data }) => {
    try {
      const userId = requireAuthUserId(context.session?.user)
      return await deleteTransaction(userId, data.transactionId)
    } catch (error) {
      handleServerError(
        'transactions:deleteTransactionFn',
        error,
        TRANSACTION_ERROR_MESSAGE,
      )
    }
  })
