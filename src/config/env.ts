/**
 * Isomorphic environment configuration.
 * File ini aman di-import di mana saja, baik di server (SSR) maupun di browser (client).
 * Di Vite / TanStack Start, variabel yang dapat diakses oleh client menggunakan prefix `VITE_`
 * dan diakses melalui `import.meta.env`.
 */

const getClientEnv = () => {
  const isBrowser = typeof window !== 'undefined'

  return {
    APP_URL:
      import.meta.env.VITE_APP_URL ??
      (isBrowser ? window.location.origin : 'http://localhost:3000'),
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  } as const
}

export const env = getClientEnv()

export type Env = typeof env
