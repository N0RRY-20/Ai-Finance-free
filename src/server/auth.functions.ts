import { authClientMiddleware } from '#/middleware/auth.middleware'
import { createServerFn } from '@tanstack/react-start'

/**
 * Server Function untuk mengambil data session aktif dari server
 * sekaligus menyinkronkannya ke dalam Zustand useAuthStore melalui authClientMiddleware.
 */
export const getSessionFn = createServerFn({ method: 'GET' })
  .middleware([authClientMiddleware])
  .handler(async ({ context }) => {
    return context.session
  })
