import { isUnauthorizedError, useAuthStore } from '#/stores/auth-store'
import { redirect } from '@tanstack/react-router'

export async function runProtectedLoader<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (isUnauthorizedError(error)) {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().clearAuth()
      }
      throw redirect({
        to: '/login',
      })
    }
    throw error
  }
}
