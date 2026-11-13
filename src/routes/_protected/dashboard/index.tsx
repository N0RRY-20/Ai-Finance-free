import { createFileRoute } from '@tanstack/react-router'
import { DashboardOverview } from './-components/dashboard-overview'

export const Route = createFileRoute('/_protected/dashboard/')({
  staticData: {
    breadcrumb: 'Dashboard',
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { session } = Route.useRouteContext()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {session.user.name}.
        </p>
      </div>
      <DashboardOverview />
    </div>
  )
}
