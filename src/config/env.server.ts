/**
 * Server-only environment variables configuration.
 * File ini HANYA boleh di-import pada server-side context (loaders, server functions, API routes, db).
 * Bundler TanStack Start / Vite akan mencegah file dengan ekstensi `.server.ts` masuk ke bundle client.
 */

export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? '',
  AI_KEY_ENCRYPTION_SECRET: process.env.AI_KEY_ENCRYPTION_SECRET ?? '',
} as const

export type ServerEnv = typeof serverEnv
