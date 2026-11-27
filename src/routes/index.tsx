import { createFileRoute } from '@tanstack/react-router'
import { getSessionFn } from '#/server/auth.functions'
import { useLandingKitScripts } from './-components/landing/kit-loader'
import { LandingFooter, LandingNav } from './-components/landing/landing-nav-footer'
import { LandingSections } from './-components/landing/landing-sections'

const PAGE_TITLE = 'AI Finance: Pencatat keuangan AI untuk pribadi dan freelancer'
const PAGE_DESCRIPTION =
  'Catat transaksi pribadi dan freelancer lewat chat Bahasa Indonesia, hingga 5 foto struk, dan pesan suara 2 menit. Gratis Rp 0 dengan Google Gemini API Key terenkripsi AES-256-GCM.'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: PAGE_TITLE,
      },
      {
        name: 'description',
        content: PAGE_DESCRIPTION,
      },
      {
        name: 'site-kind',
        content: 'software',
      },
      {
        name: 'page-type',
        content: 'software',
      },
      {
        property: 'og:title',
        content: PAGE_TITLE,
      },
      {
        property: 'og:description',
        content: PAGE_DESCRIPTION,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:image',
        content: '/share.jpg',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:image',
        content: '/share.jpg',
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn()
    return {
      session,
    }
  },
  component: Home,
})

function Home() {
  const { session } = Route.useRouteContext()
  useLandingKitScripts()

  const isAuthenticated = Boolean(session?.user)
  const primaryHref = isAuthenticated ? '/dashboard' : '/login'
  const primaryLabel = isAuthenticated ? 'Buka Dashboard' : 'Mulai Catat Gratis'

  return (
    <>
      <LandingNav
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        isHome
      />
      <LandingSections
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
      />
      <LandingFooter
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        isHome
      />
    </>
  )
}
