import { useEffect } from 'react'
import { Toaster, toast } from '@yusufceng1z/ding-react'
import type { Position, Theme, ToastLabels } from '@yusufceng1z/ding-react'
import { useTheme } from '#/components/providers/theme-provider'

type ConfigureOptions = NonNullable<Parameters<typeof toast.configure>[0]>

type DingToasterProps = {
  position?: Position
  theme?: Theme
  labels?: Partial<ToastLabels>
  nonce?: string
  sound?: ConfigureOptions['sound']
  volume?: number
}

const DEFAULT_LABELS: ToastLabels = {
  region: 'Notifikasi',
  dismiss: 'Tutup notifikasi',
}

function DingToaster({
  position = 'top-center',
  theme,
  labels,
  nonce,
  sound = true,
  volume,
}: DingToasterProps) {
  const { theme: activeTheme = 'system' } = useTheme()
  const resolvedTheme = theme ?? activeTheme

  useEffect(() => {
    toast.configure({ sound, volume })
  }, [sound, volume])

  return (
    <Toaster
      position={position}
      theme={resolvedTheme}
      labels={{ ...DEFAULT_LABELS, ...labels }}
      nonce={nonce}
    />
  )
}

export { DingToaster, toast }
export type { DingToasterProps }
