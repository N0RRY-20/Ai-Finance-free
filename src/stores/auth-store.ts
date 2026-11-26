import type { AuthSessionData, AuthUser, Session } from '#/types/auth'
import { create } from 'zustand'

interface AuthState {
  user: AuthUser | null
  session: AuthSessionData | null
  setAuth: (data: Session | null) => void
  clearAuth: () => void
  getValidSession: () => Session | null
}

function isSessionNotExpired(expiresAt: Date | string): boolean {
  const expiresMs =
    expiresAt instanceof Date ? expiresAt.getTime() : Date.parse(expiresAt)
  return Number.isFinite(expiresMs) && expiresMs > Date.now()
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof Error && error.message === 'Unauthorized'
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  setAuth: (data) =>
    set({
      user: data?.user ?? null,
      session: data?.session ?? null,
    }),
  clearAuth: () =>
    set({
      user: null,
      session: null,
    }),
  getValidSession: () => {
    const { user, session } = get()
    if (!user || !session || !isSessionNotExpired(session.expiresAt)) {
      return null
    }
    return { user, session }
  },
}))
