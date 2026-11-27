export interface LandingShellProps {
  primaryHref: string
  primaryLabel: string
  isHome?: boolean
}

function ArrowIcon() {
  return (
    <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path className="m-arrow__stem" d="M1 6h8" />
      <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
  )
}

export function LandingNav({
  primaryHref,
  primaryLabel,
  isHome = true,
}: LandingShellProps) {
  const prefix = isHome ? '' : '/'
  const logoHref = isHome ? '#top' : '/'

  return (
    <header className="nav nav--centre">
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">
          Langsung ke konten
        </a>
        <a className="nav__logo brand-logo" href={logoHref}>
          <img
            src="/icons/icon.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
          AI Finance
        </a>

        <nav className="nav__links" aria-label="Navigasi utama">
          <div className="nav__item">
            <a className="nav__link" href={`${prefix}#antarmuka`}>
              Antarmuka{' '}
              <svg className="chev" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M3 4.5l3 3 3-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <div className="nav__menu">
              <div className="wrap grid">
                <div className="menu-col span-3">
                  <p className="t-label">Ruang kerja</p>
                  <a href={`${prefix}#antarmuka`}>
                    Ledger &amp; chat AI
                    <span>Tabel mutasi berdampingan asisten Gemini</span>
                  </a>
                  <a href={`${prefix}#multimodal`}>
                    Input multimodal
                    <span>Teks santai, foto struk, suara</span>
                  </a>
                  <a href={`${prefix}#alur`}>
                    Alur kerja
                    <span>Masuk, tempel kunci, langsung catat</span>
                  </a>
                </div>
                <div className="menu-col span-3">
                  <p className="t-label">Kendali &amp; privasi</p>
                  <a href={`${prefix}#keamanan`}>
                    Kunci BYOK
                    <span>Enkripsi AES-256-GCM di server Neon</span>
                  </a>
                  <a href={`${prefix}#transaksi`}>
                    Kategori &amp; PWA
                    <span>17 kategori dan 4 model Gemini</span>
                  </a>
                  <a href="/privacy">
                    Kebijakan privasi
                    <span>Media diproses tanpa disimpan</span>
                  </a>
                </div>
                <a className="menu-card span-3 start-10" href={`${prefix}#antarmuka`}>
                  <div className="panel" />
                  <span className="t-card">Catat otomatis dalam Bahasa Indonesia</span>
                  <span className="t-small muted">
                    Mendukung 10rbu, goceng, 5 foto struk, dan pesan suara 2 menit.
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="nav__item">
            <a className="nav__link" href={`${prefix}#multimodal`}>
              Multimodal
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href={`${prefix}#alur`}>
              Alur
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href={`${prefix}#keamanan`}>
              Keamanan
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href={`${prefix}#transaksi`}>
              Transaksi
            </a>
          </div>
          <div className="nav__item">
            <a className="nav__link" href={`${prefix}#faq`}>
              FAQ
            </a>
          </div>
        </nav>

        <div className="nav__actions">
          <a className="btn btn--primary" href={primaryHref}>
            {primaryLabel}
            <ArrowIcon />
          </a>
        </div>

        <button
          className="nav__toggle"
          type="button"
          aria-expanded="false"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M2 5h14M2 13h14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}

export function LandingFooter({
  primaryHref,
  primaryLabel,
  isHome = true,
}: LandingShellProps) {
  const prefix = isHome ? '' : '/'
  const logoHref = isHome ? '#top' : '/'

  return (
    <footer
      className="footer closing footer--dark ground-inverse"
      id="contact"
      aria-labelledby="close-h"
    >
      <div className="wrap">
        <div className="closing__cta close--word">
          <div className="section-head--split">
            <div>
              <h2 id="close-h">Mulai catat keuangan di AI Finance.</h2>
              <p className="t-lead">
                Gratis Rp&nbsp;0 dengan kunci Google Gemini API pribadi Anda.
              </p>
            </div>
            <a className="btn btn--primary" href={primaryHref}>
              {primaryLabel}
              <ArrowIcon />
            </a>
          </div>
          <p className="close__word" aria-hidden="true">
            AI Finance
          </p>
        </div>

        <div className="closing__links">
          <div className="grid">
            <div className="span-4 stack-4">
              <a className="nav__logo brand-logo" href={logoHref}>
                <img
                  src="/icons/icon.svg"
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden="true"
                />
                AI Finance
              </a>
              <p className="footer__lede">
                Pencatat keuangan AI pribadi gratis dengan kunci Gemini Anda
                sendiri.
              </p>
            </div>

            <div className="span-2 footer__col">
              <h3>Produk</h3>
              <ul>
                <li>
                  <a href={`${prefix}#antarmuka`}>Antarmuka</a>
                </li>
                <li>
                  <a href={`${prefix}#multimodal`}>Multimodal</a>
                </li>
                <li>
                  <a href={`${prefix}#alur`}>Alur</a>
                </li>
              </ul>
            </div>

            <div className="span-2 footer__col">
              <h3>Fitur</h3>
              <ul>
                <li>
                  <a href={`${prefix}#transaksi`}>Transaksi</a>
                </li>
                <li>
                  <a href={`${prefix}#faq`}>FAQ</a>
                </li>
              </ul>
            </div>

            <div className="span-2 footer__col">
              <h3>Keamanan</h3>
              <ul>
                <li>
                  <a href={`${prefix}#keamanan`}>Keamanan</a>
                </li>
                <li>
                  <a href="/privacy">Privasi</a>
                </li>
                <li>
                  <a href="/terms">Ketentuan</a>
                </li>
              </ul>
            </div>

            <div className="span-2 footer__col">
              <h3>Akses</h3>
              <ul>
                <li>
                  <a href={primaryHref}>{primaryLabel}</a>
                </li>
                <li>
                  <a href="/transactions">Buku transaksi</a>
                </li>
                <li>
                  <a href="/settings">Pengaturan Gemini</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer__legal">
            <span className="footer__legal-left">
              <span>&copy; 2026 AI Finance</span>
              <a href="/privacy">Privasi</a>
              <a href="/terms">Ketentuan</a>
            </span>
            <div className="socials" />
            <details className="credits">
              <summary>Merek dagang &amp; lisensi ikon pihak ketiga</summary>
              <p>
                Merek dagang Google, Gemini, Neon, PostgreSQL, dan Chrome
                dimiliki pemegang hak masing-masing. Ikon pihak ketiga berasal
                dari @iconify-json/vscode-icons (MIT) dan gilbarbara/logos
                (CC0-1.0) dari berkas lokal aplikasi.
              </p>
            </details>
          </div>
        </div>
      </div>
    </footer>
  )
}
