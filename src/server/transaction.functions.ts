import { authServerMiddleware } from '#/middleware/auth.middleware'
import { getDashboardFinanceOverview } from '#/services/transaction.service.server'
import { createServerFn } from '@tanstack/react-start'

export const getDashboardFinanceDataFn = createServerFn({ method: 'GET' })
  .middleware([authServerMiddleware])
  .handler(async ({ context }) => {
    const user = context.session?.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    return await getDashboardFinanceOverview(user.id)
  })
