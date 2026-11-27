import { createFileRoute } from '@tanstack/react-router'
import { getSessionFn } from '#/server/auth.functions'
import { useLandingKitScripts } from './-components/landing/kit-loader'
import { LandingFooter, LandingNav } from './-components/landing/landing-nav-footer'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      {
        title: 'Kebijakan Privasi · AI Finance',
      },
      {
        name: 'description',
        content:
          'Penjelasan transparan tentang penyimpanan kunci Google Gemini API terenkripsi AES-256-GCM, kebijakan media sementara, dan database akun pribadi AI Finance.',
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn()
    return {
      session,
    }
  },
  component: PrivacyPage,
})

function PrivacyPage() {
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
              <span className="pill">Privasi &amp; Enkripsi Data</span>
              <h1>Kebijakan Privasi AI Finance</h1>
              <p className="t-lead">
                Dokumen ini merangkum data apa saja yang disimpan AI Finance,
                cara kunci Gemini API dilindungi, dan perlakuan atas foto struk
                serta rekaman suara.
              </p>
            </header>

            <section>
              <h2>1. Autentikasi Akun Google (Better Auth)</h2>
              <p>
                Pendaftaran dan masuk ke aplikasi dilakukan memakai Google OAuth
                melalui Better Auth. Kami menerima profil dasar (nama, alamat
                email, dan foto avatar akun Google) untuk membuat identitas
                pengguna pribadi serta menjaga sesi login aman di server.
              </p>
            </section>

            <section>
              <h2>2. Enkripsi Google Gemini API Key (AES-256-GCM)</h2>
              <ul>
                <li>
                  Pengguna memasukkan kunci Gemini API pribadi pada menu{' '}
                  <code>/settings</code>.
                </li>
                <li>
                  Kunci segera dienkripsi di server memakai AES-256-GCM sebelum
                  disimpan di PostgreSQL Neon.
                </li>
                <li>
                  Nilai asli API Key tidak pernah dikirim ulang ke browser setelah
                  disimpan dan dapat dihapus kapan saja oleh pemilik akun.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. Pemrosesan Sementara Foto Struk &amp; Pesan Suara</h2>
              <p>
                Lampiran gambar struk (maksimal 5 berkas per pesan, batas 12 MB
                gambar) maupun rekaman suara (maksimal 2 menit per pesan) hanya
                dikirim ke Google Gemini API selama permintaan berlangsung.
                Aplikasi tidak menyimpan berkas gambar atau rekaman audio
                mentah tersebut ke dalam riwayat percakapan di database.
              </p>
            </section>

            <section>
              <h2>4. Catatan Teks, Transaksi, dan Hak Penghapusan</h2>
              <p>
                Riwayat teks obrolan dan catatan transaksi terstruktur (17
                kategori, nominal IDR, tipe pemasukan/pengeluaran, dan tanggal
                WIB) disimpan per akun pengguna di Neon PostgreSQL. Anda dapat
                memperbarui atau menghapus transaksi serta mencabut API Key
                pribadi secara langsung melalui Dashboard dan Settings.
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
