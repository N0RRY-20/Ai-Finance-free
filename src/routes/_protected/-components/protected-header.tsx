import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import { GalleryVerticalEnd } from 'lucide-react'
import { ModeToggle } from '#/components/common/mode-toggle'
import { Button } from '#/components/ui/button'
import { signOut } from '#/lib/auth-client'
import { useAuthStore } from '#/stores/auth-store'

const routeApi = getRouteApi('/_protected')

export function ProtectedHeader() {
  const { session } = routeApi.useRouteContext()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    useAuthStore.getState().clearAuth()
    await router.navigate({ to: '/login' })
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <Link to="/dashboard" className="flex items-center gap-2 font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        AI Finance
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {session.user.name}
        </span>
        <ModeToggle />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="cursor-pointer"
        >
          Keluar
        </Button>
      </div>
    </header>
  )
}
