import { RouteErrorFallback } from '#/components/common/route-error-fallback'
import { getDashboardSummaryFn } from '#/server/transaction.functions'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { DashboardOverview } from './-components/dashboard-overview'

export const Route = createFileRoute('/_protected/dashboard/')({
  staticData: {
    breadcrumb: 'Dashboard',
  },
  loader: async () => await getDashboardSummaryFn(),
  errorComponent: DashboardErrorState,
  component: DashboardPage,
})

function DashboardErrorState({ error, reset }: ErrorComponentProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan kondisi keuangan Anda.
        </p>
      </div>

      <RouteErrorFallback
        error={error}
        reset={reset}
        title="Gagal memuat ringkasan dashboard"
        description="Terjadi kendala saat mengambil ringkasan keuangan dari server. Silakan coba lagi."
      />
    </div>
  )
}

function DashboardPage() {
  const { session } = Route.useRouteContext()
  const summary = Route.useLoaderData()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali, {session.user.name}.
        </p>
      </div>
      <DashboardOverview summary={summary} />
    </div>
  )
}
