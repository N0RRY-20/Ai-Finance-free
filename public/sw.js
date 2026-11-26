const VERSION = 'ai-finance-pwa-v1'

const ASSET_CACHE = `static-${VERSION}`
const NAV_CACHE = `pages-${VERSION}`
const OFFLINE_URL = '/offline'

const ASSET_PATHS = [
  '/assets/',
  '/_build/',
  '/icons/',
  '/manifest.json',
  '/favicon.ico',
]

/** Endpoint yang WAJIB selalu lolos ke server tanpa dicegat */
function isServerEndpoint(pathname) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_serverFn') ||
    pathname.startsWith('/serverFn')
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(NAV_CACHE)
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }))
      } catch {
        // Abaikan jika route /offline belum tersedia saat install
      }
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== ASSET_CACHE && key !== NAV_CACHE)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isServerEndpoint(url.pathname) || url.pathname === '/sw.js') return

  // 1) Navigasi Dokumen HTML (SSR) -> Network-First, fallback cache / offline
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(NAV_CACHE)
        try {
          const response = await fetch(request)
          if (response && response.ok && !response.redirected) {
            void cache.put(request, response.clone())
          }
          return response
        } catch {
          const cached = await cache.match(request)
          if (cached) return cached
          const offlinePage = await cache.match(OFFLINE_URL)
          if (offlinePage) return offlinePage
          return new Response('You are offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        }
      })(),
    )
    return
  }

  // 2) Hashed Static Assets -> Cache-First
  if (ASSET_PATHS.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE)
        const cached = await cache.match(request, { ignoreSearch: true })
        if (cached) return cached
        try {
          const response = await fetch(request)
          if (response && response.ok) {
            void cache.put(request, response.clone())
          }
          return response
        } catch {
          const fallback = await caches.match(request, { ignoreSearch: true })
          return fallback ?? Response.error()
        }
      })(),
    )
  }
})
