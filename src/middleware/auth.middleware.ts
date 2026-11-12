import { auth } from '#/lib/auth.server'
import { useAuthStore } from '#/stores/auth-store'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

// ==========================================
// 1. SERVER MIDDLEWARE
// Mengambil session dari Better Auth menggunakan request headers
// dan meneruskannya ke context server serta sendContext (untuk client).
// ==========================================
export const authServerMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })

  return next({
    context: {
      session,
    },
    sendContext: {
      session,
    },
  })
})

// ==========================================
// 2. CLIENT MIDDLEWARE
// Meng-chain authServerMiddleware dan otomatis menyimpan
// data session dari server ke dalam Zustand useAuthStore.
// ==========================================
export const authClientMiddleware = createMiddleware({
  type: 'function',
})
  .middleware([authServerMiddleware])
  .client(async ({ next }) => {
    const result = await next()

    if (typeof window !== 'undefined') {
      useAuthStore.getState().setAuth(result.context.session ?? null)
    }

    return result
  })
