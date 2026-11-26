import { useEffect } from 'react'
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { getSessionFn } from '#/server/auth.functions'

export const Route = createFileRoute('/(auth)')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (session?.user) {
      throw redirect({
        to: '/dashboard',
      })
    }
    return {
      session,
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const router = useRouter()

  useEffect(() => {
    router.clearCache()
  }, [router])

  return <Outlet />
}
