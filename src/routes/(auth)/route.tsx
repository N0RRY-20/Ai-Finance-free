import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
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
  return <Outlet />
}
