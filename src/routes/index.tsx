import { createFileRoute, Link } from '@tanstack/react-router'
import { ModeToggle } from '#/components/common/mode-toggle'
import { Button } from '#/components/ui/button'
import { getSessionFn } from '#/server/auth.functions'

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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
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
              <Button asChild size="lg" className="cursor-pointer">
                <Link to="/dashboard">Buka Dashboard</Link>
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
