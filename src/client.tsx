import { StrictMode, startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import { initPwaInstallListener } from '#/hooks/use-pwa-install'

initPwaInstallListener()

// Registrasi Service Worker PWA (Hanya di Production)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service worker registration failed:', err)
    })
  })
}

// Di Development: Bersihkan SW & Cache lama agar HMR tidak rusak
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister()
    }
  })

  if ('caches' in window) {
    void window.caches.keys().then((keys) => {
      for (const key of keys) {
        void window.caches.delete(key)
      }
    })
  }
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  )
})
