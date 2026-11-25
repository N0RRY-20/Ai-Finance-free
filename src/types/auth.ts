import type { auth } from '#/lib/auth.server'

export type Session = typeof auth.$Infer.Session
export type AuthUser = Session['user']
export type AuthSessionData = Session['session']
