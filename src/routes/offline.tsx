import { createFileRoute, Link } from '@tanstack/react-router'
import { Home, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

export const Route = createFileRoute('/offline')({
  head: () => ({
    meta: [{ title: 'Offline - AI Finance SaaS' }],
  }),
  component: OfflinePage,
})

function OfflinePage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <WifiOff className="size-6" />
          </div>
          <CardTitle className="text-xl font-bold">
            Anda Sedang Offline
          </CardTitle>
          <CardDescription>
            Koneksi internet Anda terputus. Periksa jaringan Wi-Fi atau data
            seluler Anda, lalu coba muat ulang halaman ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="cursor-pointer"
          >
            <RefreshCw data-icon="inline-start" />
            Coba Muat Ulang
          </Button>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link to="/">
              <Home data-icon="inline-start" />
              Kembali ke Beranda
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
