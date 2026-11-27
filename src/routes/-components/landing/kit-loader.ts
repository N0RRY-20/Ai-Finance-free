import { useEffect } from 'react'

declare global {
  interface Window {
    __aiFinanceKitPromise?: Promise<void>
  }
}

const KIT_MODULE_SCRIPTS = [
  '/assets/system.js',
  '/assets/motion/motion.js',
  '/assets/layout/layout.js',
  '/assets/diagrams/mount.js',
] as const

function loadModuleScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[data-kit-src="${src}"]`)
    if (existing) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.src = src
    script.dataset.kitSrc = src
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })
}

export function useLandingKitScripts(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.__aiFinanceKitPromise) {
      window.__aiFinanceKitPromise = (async () => {
        for (const src of KIT_MODULE_SCRIPTS) {
          await loadModuleScript(src)
        }
      })()
    }
  }, [])
}
