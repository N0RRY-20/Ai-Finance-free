import { useState, useSyncExternalStore } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt: () => Promise<void>
}

interface PwaInstallSnapshot {
  deferredPrompt: BeforeInstallPromptEvent | null
  isInstalled: boolean
  isIos: boolean
}

const SERVER_SNAPSHOT: PwaInstallSnapshot = {
  deferredPrompt: null,
  isInstalled: false,
  isIos: false,
}

let snapshot: PwaInstallSnapshot = SERVER_SNAPSHOT
let initialized = false
const listeners = new Set<() => void>()

function isStandaloneMode(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean(nav.standalone)
  )
}

function detectIsIos(): boolean {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (window.navigator.platform === 'MacIntel' &&
      window.navigator.maxTouchPoints > 1)
  )
}

function updateSnapshot(partial: Partial<PwaInstallSnapshot>): void {
  const next: PwaInstallSnapshot = { ...snapshot, ...partial }
  if (
    next.deferredPrompt === snapshot.deferredPrompt &&
    next.isInstalled === snapshot.isInstalled &&
    next.isIos === snapshot.isIos
  ) {
    return
  }
  snapshot = next
  for (const listener of listeners) {
    listener()
  }
}

export function initPwaInstallListener(): void {
  if (typeof window === 'undefined' || initialized) return
  initialized = true

  updateSnapshot({
    isInstalled: isStandaloneMode(),
    isIos: detectIsIos(),
  })

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    updateSnapshot({
      deferredPrompt: event as BeforeInstallPromptEvent,
    })
  })

  window.addEventListener('appinstalled', () => {
    updateSnapshot({
      deferredPrompt: null,
      isInstalled: true,
    })
  })

  const displayModeQuery = window.matchMedia('(display-mode: standalone)')
  displayModeQuery.addEventListener('change', (event) => {
    if (event.matches) {
      updateSnapshot({
        deferredPrompt: null,
        isInstalled: true,
      })
    }
  })
}

function subscribe(listener: () => void): () => void {
  initPwaInstallListener()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function usePwaInstall() {
  const current = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => SERVER_SNAPSHOT,
  )
  const [isPrompting, setIsPrompting] = useState(false)

  const promptInstall = async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    const promptEvent = current.deferredPrompt
    if (!promptEvent) return 'unavailable'

    setIsPrompting(true)
    try {
      await promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      updateSnapshot({ deferredPrompt: null })
      return outcome
    } finally {
      setIsPrompting(false)
    }
  }

  return {
    canPromptNatively: Boolean(current.deferredPrompt),
    isInstalled: current.isInstalled,
    isIos: current.isIos,
    isPrompting,
    promptInstall,
  }
}
