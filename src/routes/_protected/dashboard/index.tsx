import { Button } from '#/components/ui/button'
import { getUserAiKeyStatusFn } from '#/server/ai-key.functions'
import { getDashboardFinanceDataFn } from '#/server/transaction.functions'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { SparklesIcon } from 'lucide-react'
import { useState } from 'react'
import { DashboardOverview } from './-components/dashboard-overview'
import { FinanceChatDrawer } from './-components/finance-chat-drawer'

export const Route = createFileRoute('/_protected/dashboard/')({
  staticData: {
    breadcrumb: 'Dashboard',
  },
  loader: async () => {
    const [financeData, aiKeyStatus] = await Promise.all([
      getDashboardFinanceDataFn(),
      getUserAiKeyStatusFn(),
    ])
    return { financeData, aiKeyStatus }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { session } = Route.useRouteContext()
  const { financeData, aiKeyStatus } = Route.useLoaderData()
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali, {session.user.name}.
          </p>
        </div>
        <Button onClick={() => setIsChatOpen(true)}>
          <SparklesIcon data-icon="inline-start" />
          Asisten AI
        </Button>
      </div>

      <DashboardOverview
        data={financeData}
        onOpenChat={() => setIsChatOpen(true)}
      />

      <FinanceChatDrawer
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        userName={session.user.name}
        userImage={session.user.image}
        initialAiKeyStatus={aiKeyStatus}
        onTransactionMutated={() => void router.invalidate()}
      />
    </div>
  )
}
