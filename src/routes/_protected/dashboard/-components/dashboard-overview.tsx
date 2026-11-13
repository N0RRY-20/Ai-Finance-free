import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react'

export function DashboardOverview() {
  const cards = [
    {
      title: 'Total Saldo',
      amount: 'Rp 24.500.000',
      description: '+12% dari bulan lalu',
      icon: Wallet,
      color: 'text-primary',
    },
    {
      title: 'Pemasukan Bulan Ini',
      amount: 'Rp 8.200.000',
      description: '+5% dibandingkan target',
      icon: ArrowUpRight,
      color: 'text-emerald-500',
    },
    {
      title: 'Pengeluaran Bulan Ini',
      amount: 'Rp 3.750.000',
      description: '-8% dari bulan sebelumnya',
      icon: ArrowDownRight,
      color: 'text-rose-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className={`size-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.amount}</div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {item.description}
              </CardDescription>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
