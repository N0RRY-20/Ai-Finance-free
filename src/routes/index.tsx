import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Button } from '#/components/ui/button.tsx'
import { signOut } from '#/lib/auth-client'
import { getSessionFn } from '#/server/auth.functions'
import { useAuthStore } from '#/stores/auth-store'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    return {
      session,
    }
  },
  component: Home,
})

function Home() {
  const { session } = Route.useRouteContext()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    useAuthStore.getState().clearAuth()
    await router.invalidate()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          AI Finance SaaS
        </h1>
        <p className="text-muted-foreground text-lg">
          Platform manajemen dan analisis keuangan cerdas untuk bisnis dan
          personal.
        </p>
        <div className="pt-4 flex flex-col items-center justify-center gap-4">
          {session?.user ? (
            <div className="space-y-4">
              <p className="text-lg font-medium">
                Halo, <span className="font-semibold">{session.user.name}</span>
                !
              </p>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                Keluar
              </Button>
            </div>
          ) : (
            <Button asChild size="lg" className="cursor-pointer">
              <Link to="/login">Masuk ke Akun</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
