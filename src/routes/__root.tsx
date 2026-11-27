import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { RootErrorComponent } from '#/components/common/route-error-fallback'
import { ThemeProvider } from '#/components/providers/theme-provider'
import { DingToaster } from '#/components/ui/ding-toaster'
import { TooltipProvider } from '#/components/ui/tooltip'
import {
  LANDING_GOOGLE_FONTS_HREF,
  LANDING_HEAD_BOOTSTRAP_JS,
  LANDING_MODULEPRELOADS,
  LANDING_PAGE_CSS,
  LANDING_ROOT_VARS_CSS,
  LANDING_STYLESHEETS,
  isMarketingPath,
} from '#/lib/landing-config'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        title: 'AI Finance SaaS',
      },
      {
        name: 'description',
        content:
          'Platform manajemen dan analisis keuangan cerdas untuk bisnis dan personal.',
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'AI Finance',
      },
    ],
    links: [
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'icon',
        href: '/icons/icon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: 'any',
      },
      {
        rel: 'apple-touch-icon',
        href: '/icons/icon-192x192.png',
      },
    ],
  }),
  errorComponent: RootErrorComponent,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isMarketing = isMarketingPath(pathname)

  return (
    <html
      lang={isMarketing ? 'id' : 'en'}
      suppressHydrationWarning
      {...(isMarketing
        ? {
            'data-type': 'software',
            'data-radius': 'sharp',
            'data-buttons': 'arrow',
            'data-ground': 'sand',
            'data-motion': '',
          }
        : {})}
    >
      <head>
        <HeadContent />
        <meta
          name="theme-color"
          content={isMarketing ? '#f8faf9' : '#09090b'}
        />
        {isMarketing ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link rel="stylesheet" href={LANDING_GOOGLE_FONTS_HREF} />
            {LANDING_STYLESHEETS.map((href) => (
              <link key={href} rel="stylesheet" href={href} />
            ))}
            <style
              dangerouslySetInnerHTML={{
                __html: `${LANDING_ROOT_VARS_CSS}\n${LANDING_PAGE_CSS}`,
              }}
            />
            <script
              dangerouslySetInnerHTML={{ __html: LANDING_HEAD_BOOTSTRAP_JS }}
            />
            <script src="/assets/backgrounds/backgrounds.js" />
            {LANDING_MODULEPRELOADS.map((href) => (
              <link key={href} rel="modulepreload" href={href} />
            ))}
          </>
        ) : (
          <link rel="stylesheet" href={appCss} />
        )}
      </head>
      <body>
        {isMarketing ? (
          <>
            {children}
            <Scripts />
          </>
        ) : (
          <>
            <ThemeProvider defaultTheme="system" storageKey="theme">
              <TooltipProvider>{children}</TooltipProvider>
              <DingToaster position="top-center" sound />
            </ThemeProvider>
            <TanStackDevtools
              config={{
                position: 'bottom-left',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <Scripts />
          </>
        )}
      </body>
    </html>
  )
}
