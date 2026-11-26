import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSessionFn } from '#/server/auth.functions'
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
