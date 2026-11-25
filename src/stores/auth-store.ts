import type { AuthSessionData, AuthUser, Session } from '#/types/auth'
import { create } from 'zustand'

interface AuthState {
  user: AuthUser | null
  session: AuthSessionData | null
  setAuth: (data: Session | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
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
}))
