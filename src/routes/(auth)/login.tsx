import { createFileRoute, Link } from '@tanstack/react-router'
import { GalleryVerticalEnd } from 'lucide-react'
import { ModeToggle } from '#/components/common/mode-toggle'
import { LoginForm } from './-components/login-form.tsx'

export const Route = createFileRoute('/(auth)/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium text-foreground"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          AI Finance
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
