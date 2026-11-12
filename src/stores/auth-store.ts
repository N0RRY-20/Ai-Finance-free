import type { Session } from '#/lib/auth.server'
import { create } from 'zustand'

type UserData = Session['user']
type SessionData = Session['session']

interface AuthState {
  user: UserData | null
  session: SessionData | null
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
