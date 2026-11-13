import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn } from '#/server/auth.functions'
import { ProtectedHeader } from './-components/protected-header'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session?.user) {
      throw redirect({
        to: '/login',
      })
    }
    return {
      session,
    }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ProtectedHeader />
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
