import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'
import type { DashboardSummaryResult } from '#/types/finance'
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'

interface DashboardOverviewProps {
  summary: DashboardSummaryResult
}

export function DashboardOverview({ summary }: DashboardOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          <Badge variant="outline">
            <Wallet data-icon="inline-start" />
            {summary.allTime.transactionCount} transaksi
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div
            className={cn(
              'text-2xl font-bold tabular-nums',
              summary.allTime.balance < 0 && 'text-destructive',
            )}
          >
            {summary.allTime.balanceFormatted}
          </div>
          <CardDescription className="text-xs">
            Selisih seluruh pemasukan & pengeluaran
          </CardDescription>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            Pemasukan Bulan Ini
          </CardTitle>
          <Badge variant="secondary">
            <ArrowUpRight data-icon="inline-start" />
            Masuk
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="text-2xl font-bold tabular-nums">
            {summary.currentMonth.totalIncomeFormatted}
          </div>
          <CardDescription className="text-xs">
            Periode {summary.monthLabel} · Total{' '}
            {summary.allTime.totalIncomeFormatted}
          </CardDescription>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            Pengeluaran Bulan Ini
          </CardTitle>
          <Badge variant="destructive">
            <ArrowDownRight data-icon="inline-start" />
            Keluar
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div
            className={cn(
              'text-2xl font-bold tabular-nums',
              summary.currentMonth.totalExpense > 0 && 'text-destructive',
            )}
          >
            {summary.currentMonth.totalExpenseFormatted}
          </div>
          <CardDescription className="text-xs">
            Periode {summary.monthLabel} · Total{' '}
            {summary.allTime.totalExpenseFormatted}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
