import { RouteErrorFallback } from '#/components/common/route-error-fallback'
import { Button } from '#/components/ui/button'
import { runProtectedLoader } from '#/lib/protected-loader'
import { getDashboardPageDataFn } from '#/server/transaction.functions'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { SparklesIcon } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import { DashboardOverview } from './-components/dashboard-overview'
import {
  ChatDrawerLoadingFallback,
  DashboardPendingState,
} from './-components/dashboard-skeleton'

const LazyFinanceChatDrawer = lazy(async () => {
  const mod = await import('./-components/finance-chat-drawer')
  return { default: mod.FinanceChatDrawer }
})

export const Route = createFileRoute('/_protected/dashboard/')({
  staticData: {
    breadcrumb: 'Dashboard',
  },
  loader: async () => await runProtectedLoader(() => getDashboardPageDataFn()),
  pendingComponent: DashboardPendingState,
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
  const { financeData, aiKeyStatus } = Route.useLoaderData()
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [hasOpenedChat, setHasOpenedChat] = useState(false)

  const handleOpenChat = () => {
    setHasOpenedChat(true)
    setIsChatOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {session.user.name}.
          </p>
        </div>
        <Button onClick={handleOpenChat}>
          <SparklesIcon data-icon="inline-start" />
          Asisten AI
        </Button>
      </div>

      <DashboardOverview data={financeData} onOpenChat={handleOpenChat} />

      {hasOpenedChat ? (
        <Suspense
          fallback={
            <ChatDrawerLoadingFallback
              open={isChatOpen}
              onOpenChange={setIsChatOpen}
            />
          }
        >
          <LazyFinanceChatDrawer
            open={isChatOpen}
            onOpenChange={setIsChatOpen}
            userName={session.user.name}
            userImage={session.user.image}
            initialAiKeyStatus={aiKeyStatus}
            onTransactionMutated={() => void router.invalidate()}
          />
        </Suspense>
      ) : null}
    </div>
  )
}
