import { AiKeySettingsForm } from '#/components/ai/ai-key-settings-form'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { getUserAiKeyStatusFn } from '#/server/ai-key.functions'
import type { UserAiKeyStatus } from '#/types/ai'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ShieldCheckIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_protected/settings/')({
  staticData: {
    breadcrumb: 'Pengaturan',
  },
  loader: async () => await getUserAiKeyStatusFn(),
  component: SettingsPage,
})

function SettingsPage() {
  const initialStatus = Route.useLoaderData()
  const router = useRouter()
  const [status, setStatus] = useState<UserAiKeyStatus>(initialStatus)

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const handleStatusChange = (nextStatus: UserAiKeyStatus) => {
    setStatus(nextStatus)
    void router.invalidate()
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola API Key Google Gemini pribadi Anda untuk menggunakan Asisten
          Keuangan AI.
        </p>
      </div>

      <Alert>
        <ShieldCheckIcon />
        <AlertTitle>Kunci Pribadi & Terenkripsi</AlertTitle>
        <AlertDescription>
          Setiap pengguna wajib menggunakan API Key Gemini miliknya sendiri.
          Kunci Anda dienkripsi di server menggunakan AES-256-GCM sebelum
          disimpan ke database dan tidak pernah dikirim ulang ke browser.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Google Gemini</CardTitle>
          <CardDescription>
            Masukkan API Key dari Google AI Studio dan pilih model default yang
            digunakan oleh chatbot transaksi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiKeySettingsForm
            status={status}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
