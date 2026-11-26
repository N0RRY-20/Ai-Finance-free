import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { isUnauthorizedError, useAuthStore } from '#/stores/auth-store'

interface RouteErrorFallbackProps {
  error: ErrorComponentProps['error']
  reset: ErrorComponentProps['reset']
  title?: string
  description?: string
  className?: string
}

/**
 * Tampilan fallback error bersama untuk route TanStack Router,
 * dilengkapi tombol coba lagi dan detail pesan error di mode development.
 */
export function RouteErrorFallback({
  error,
  reset,
  title = 'Terjadi kesalahan pada aplikasi',
  description = 'Halaman gagal dimuat karena terjadi kendala tak terduga. Silakan coba muat ulang.',
  className,
}: RouteErrorFallbackProps) {
  const router = useRouter()
  const isUnauthorized = isUnauthorizedError(error)

  useEffect(() => {
    if (!isUnauthorized) return
    useAuthStore.getState().clearAuth()
    router.clearCache()
    void router.navigate({ to: '/login', replace: true })
  }, [isUnauthorized, router])

  if (isUnauthorized) {
    return (
      <p className="text-sm text-muted-foreground">
        Sesi berakhir, mengalihkan ke halaman login...
      </p>
    )
  }

  const handleRetry = () => {
    reset()
    void router.invalidate()
  }

  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{description}</p>
        {import.meta.env.DEV ? (
          <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-destructive/10 p-2 font-mono text-xs break-words whitespace-pre-wrap">
            {errorMessage}
          </pre>
        ) : null}
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw data-icon="inline-start" />
            Coba Lagi
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Error boundary fallback untuk RootRoute agar error yang tidak tertangani
 * di route turunan tetap tampil rapi.
 */
export function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-2xl items-center justify-center p-6">
      <RouteErrorFallback error={error} reset={reset} />
    </div>
  )
}
