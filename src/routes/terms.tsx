import { createFileRoute } from '@tanstack/react-router'
import { getSessionFn } from '#/server/auth.functions'
import { useLandingKitScripts } from './-components/landing/kit-loader'
import { LandingFooter, LandingNav } from './-components/landing/landing-nav-footer'

export const Route = createFileRoute('/terms')({
  head: () => ({
    meta: [
      {
        title: 'Ketentuan Layanan · AI Finance',
      },
      {
        name: 'description',
        content:
          'Ketentuan penggunaan AI Finance dengan pola Bring Your Own Key Google Gemini API untuk pencatatan keuangan pribadi dan freelancer.',
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn()
    return {
      session,
    }
  },
  component: TermsPage,
})

function TermsPage() {
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
        isHome={false}
      />
      <main id="top" className="legal-main">
        <div className="wrap">
          <article className="legal-article">
            <header className="stack-4">
              <span className="pill">Bring Your Own Key · Gratis Rp 0</span>
              <h1>Ketentuan Layanan AI Finance</h1>
              <p className="t-lead">
                Aturan pemakaian dasar untuk pencatatan keuangan pribadi dan
                freelancer menggunakan kunci Google Gemini API milik pengguna.
              </p>
            </header>

            <section>
              <h2>1. Ruang Lingkup Layanan Pribadi</h2>
              <p>
                AI Finance disediakan secara gratis (Rp 0 biaya langganan)
                untuk membantu pencatatan arus kas pribadi dan proyek lepas
                individu. Aplikasi ini bukan perangkat lunak akuntansi tim
                korporasi, audit pajak resmi, ataupun penasihat investasi.
              </p>
            </section>

            <section>
              <h2>2. Penggunaan Google Gemini API Key (BYOK)</h2>
              <ul>
                <li>
                  Pengguna bertanggung jawab menyediakan dan menjaga batas kuota
                  Google Gemini API Key dari Google AI Studio.
                </li>
                <li>
                  Pemakaian kuota atau biaya yang mungkin timbul dari akun
                  Google AI Studio / Google Cloud pengguna tunduk pada ketentuan
                  layanan Google.
                </li>
                <li>
                  Kunci dapat dicabut atau diganti setiap saat dari menu{' '}
                  <code>/settings</code>.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Akurasi Ekstraksi AI</h2>
              <p>
                Model Gemini membantu mengekstrak nominal, kategori, dan waktu
                transaksi dari teks, foto struk, serta rekaman suara. Pengguna
                tetap bertanggung jawab meninjau daftar mutasi di{' '}
                <code>/transactions</code> dan melakukan koreksi bila terdapat
                kesalahan pembacaan.
              </p>
            </section>

            <div>
              <a className="link" href="/">
                Kembali ke beranda AI Finance
              </a>
            </div>
          </article>
        </div>
      </main>
      <LandingFooter
        primaryHref={primaryHref}
        primaryLabel={primaryLabel}
        isHome={false}
      />
    </>
  )
}
