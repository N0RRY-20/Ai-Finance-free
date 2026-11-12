import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button.tsx'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          AI Finance SaaS
        </h1>
        <p className="text-muted-foreground text-lg">
          Platform manajemen dan analisis keuangan cerdas untuk bisnis dan personal.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button asChild size="lg" className="cursor-pointer">
            <Link to="/login">Masuk ke Akun</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
