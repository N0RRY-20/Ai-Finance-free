import { useEffect } from 'react'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn } from '#/server/auth.functions'
import { useAuthStore } from '#/stores/auth-store'
import { ModeToggle } from '#/components/common/mode-toggle'
import { PwaInstallButton } from '#/components/common/pwa-install-button'
import { Separator } from '#/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'
import { AppBreadcrumb } from './-components/app-breadcrumb'
import { AppSidebar } from './-components/app-sidebar'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    if (typeof window !== 'undefined') {
      const cachedSession = useAuthStore.getState().getValidSession()
      if (cachedSession) {
        return {
          session: cachedSession,
        }
      }
    }

    const session = await getSessionFn()
    if (!session?.user) {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().clearAuth()
      }
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
  const { session } = Route.useRouteContext()

  useEffect(() => {
    const current = useAuthStore.getState()
    if (
      current.session?.id !== session.session.id ||
      current.user?.id !== session.user.id
    ) {
      current.setAuth(session)
    }
  }, [session])

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-center"
          />
          <AppBreadcrumb />
          <div className="ml-auto flex items-center gap-2">
            <PwaInstallButton />
            <ModeToggle />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
