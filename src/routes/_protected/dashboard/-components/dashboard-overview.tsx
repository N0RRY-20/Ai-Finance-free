import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Separator } from '#/components/ui/separator'
import { cn } from '#/lib/utils'
import type { DashboardFinanceOverview } from '#/types/finance'
import { formatDateId, formatIdr } from '#/utils/format'
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ReceiptTextIcon,
  SparklesIcon,
  WalletIcon,
} from 'lucide-react'
import { Fragment } from 'react'

export function DashboardOverview({
  data,
  onOpenChat,
}: {
  data: DashboardFinanceOverview
  onOpenChat: () => void
}) {
  const cards = [
    {
      title: 'Total Saldo',
      amount: formatIdr(data.balance),
      description: `${data.totalTransactionCount} transaksi tercatat`,
      icon: WalletIcon,
      isNegative: data.balance < 0,
    },
    {
      title: 'Pemasukan Bulan Ini',
      amount: formatIdr(data.monthlyIncome),
      description: `Periode ${formatDateId(data.monthRange.startDate)} – ${formatDateId(data.monthRange.endDate)}`,
      icon: ArrowUpRightIcon,
      isNegative: false,
    },
    {
      title: 'Pengeluaran Bulan Ini',
      amount: formatIdr(data.monthlyExpense),
      description: `${data.monthlyTransactionCount} transaksi bulan ini`,
      icon: ArrowDownRightIcon,
      isNegative: false,
    },
  ]

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              className="rounded-3xl [--card-spacing:--spacing(4)] sm:rounded-4xl sm:[--card-spacing:--spacing(6)]"
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-1 sm:pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <div
                  className={cn(
                    'text-xl font-bold tabular-nums sm:text-2xl',
                    item.isNegative && 'text-destructive',
                  )}
                >
                  {item.amount}
                </div>
                <CardDescription className="text-xs">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="rounded-3xl [--card-spacing:--spacing(4)] sm:rounded-4xl sm:[--card-spacing:--spacing(6)]">
        <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Riwayat transaksi yang dicatat langsung maupun melalui Asisten AI.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full shrink-0 sm:w-auto"
            onClick={onOpenChat}
          >
            <SparklesIcon data-icon="inline-start" />
            Catat via AI
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length === 0 ? (
            <Empty className="border p-6 sm:p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptTextIcon />
                </EmptyMedia>
                <EmptyTitle>Belum ada transaksi</EmptyTitle>
                <EmptyDescription>
                  Mulai catat pengeluaran atau pemasukan pertamamu lewat chat
                  AI, misalnya &ldquo;saya barusan beli buah 10rbu&rdquo;.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={onOpenChat}>
                  <SparklesIcon data-icon="inline-start" />
                  Buka Asisten AI
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {data.recentTransactions.map((tx, index) => {
                const isIncome = tx.type === 'income'
                return (
                  <Fragment key={tx.id}>
                    {index > 0 ? <Separator /> : null}
                    <div className="flex flex-col gap-1.5 py-0.5 sm:py-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {tx.description || tx.categoryLabel}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 text-sm font-semibold tabular-nums',
                            !isIncome && 'text-destructive',
                          )}
                        >
                          {isIncome ? '+' : '-'} {tx.amountFormatted}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={isIncome ? 'secondary' : 'outline'}>
                          {tx.categoryLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateId(tx.transactionDate)}
                        </span>
                      </div>
                    </div>
                  </Fragment>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
