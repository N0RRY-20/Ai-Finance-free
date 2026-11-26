import { useState } from 'react'
import { Download, MonitorSmartphone, Share } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { usePwaInstall } from '#/hooks/use-pwa-install'

export function PwaInstallButton() {
  const { canPromptNatively, isInstalled, isIos, isPrompting, promptInstall } =
    usePwaInstall()
  const [guideOpen, setGuideOpen] = useState(false)

  if (isInstalled) return null

  const handleInstallClick = async () => {
    if (canPromptNatively) {
      const outcome = await promptInstall()
      if (outcome === 'accepted') {
        toast.success('Aplikasi AI Finance sedang dipasang ke perangkat Anda.')
      } else if (outcome === 'dismissed') {
        toast.info('Instalasi aplikasi dibatalkan.')
      } else {
        setGuideOpen(true)
      }
      return
    }

    setGuideOpen(true)
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-9 cursor-pointer px-0 sm:w-auto sm:gap-1.5 sm:px-3"
            disabled={isPrompting}
            aria-label="Install Aplikasi"
            onClick={() => {
              void handleInstallClick()
            }}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Install App</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Install aplikasi AI Finance</TooltipContent>
      </Tooltip>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isIos ? (
                <Share className="size-4 text-muted-foreground" />
              ) : (
                <MonitorSmartphone className="size-4 text-muted-foreground" />
              )}
              Install Aplikasi AI Finance
            </DialogTitle>
            <DialogDescription>
              Pasang AI Finance ke perangkat Anda agar bisa dibuka langsung dari
              layar utama seperti aplikasi native.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            {isIos ? (
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                <li>
                  Ketuk tombol{' '}
                  <strong className="text-foreground">Share</strong> di bilah
                  menu Safari.
                </li>
                <li>
                  Gulir ke bawah lalu pilih{' '}
                  <strong className="text-foreground">
                    Add to Home Screen / Tambah ke Layar Utama
                  </strong>
                  .
                </li>
                <li>
                  Ketuk{' '}
                  <strong className="text-foreground">Add / Tambah</strong>{' '}
                  untuk memasang aplikasi.
                </li>
              </ol>
            ) : (
              <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                <li>
                  Klik ikon <strong className="text-foreground">Install</strong>{' '}
                  di ujung kanan address bar browser Anda (jika tersedia).
                </li>
                <li>
                  Atau buka menu browser (
                  <strong className="text-foreground">⋮ / ⋯</strong>) lalu pilih{' '}
                  <strong className="text-foreground">
                    Install AI Finance
                  </strong>{' '}
                  /{' '}
                  <strong className="text-foreground">
                    Add to Home Screen
                  </strong>
                  .
                </li>
              </ol>
            )}

            {import.meta.env.DEV ? (
              <div className="rounded-2xl border bg-muted/50 p-3 text-xs text-muted-foreground">
                Pada mode development (<code>npm run dev</code>), Service Worker
                sengaja dinonaktifkan agar HMR tetap aman. Prompt instalasi
                satu-klik dari browser akan aktif otomatis pada build produksi (
                <code>NODE_ENV=production npm run build</code>).
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                Mengerti
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
