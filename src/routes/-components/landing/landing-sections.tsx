import type { CSSProperties } from 'react'
import {
  AfAssistantMessage,
  AfCategoryFilterMock,
  AfChatComposer,
  AfChatHeader,
  AfDashboardPane,
  AfReceiptUploadMock,
  AfUserMessage,
} from './chatbot-ui-mocks'

export interface LandingSectionsProps {
  primaryHref: string
  primaryLabel: string
}

const BOWTIE_DIAGRAM = JSON.stringify({
  layout: 'bowtie',
  alt: 'Alur data Google OAuth, foto struk, dan pesan suara diproses AI Finance dengan kunci Gemini terenkripsi AES-256-GCM menuju ledger Neon PostgreSQL dan aplikasi PWA.',
  sources: [
    {
      label: 'Google OAuth',
      icon: 'logos:google-icon',
      sub: 'Sesi personal',
    },
    {
      label: 'Struk belanja',
      icon: 'image',
      sub: 'Hingga 5 foto',
    },
    {
      label: 'Pesan suara',
      icon: 'audio',
      sub: 'Maks 2 menit',
    },
  ],
  core: {
    label: 'AI Finance',
    icon: 'gemini',
  },
  targets: [
    {
      label: 'Neon Postgres',
      icon: 'neon',
      sub: 'Teks & mutasi',
    },
    {
      label: '4 Model Gemini',
      icon: 'gemini',
      sub: 'Kunci AES-256-GCM',
    },
    {
      label: 'PWA Offline',
      icon: 'chrome',
      sub: 'Install di HP',
    },
  ],
})

function ArrowIcon() {
  return (
    <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path className="m-arrow__stem" d="M1 6h8" />
      <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LandingSections({
  primaryHref,
  primaryLabel,
}: LandingSectionsProps) {
  return (
    <main id="top">
      <section className="hero hero--centred" data-enter="">
        <div className="wrap">
          <div className="hero-text">
            <div className="hero__c">
              <span className="pill">
                Gratis Rp&nbsp;0 · Kunci Gemini Pribadi
              </span>
              <h1>Pencatat keuangan AI pribadi</h1>
              <p className="hero__lead">
                Kirim chat kasual, foto struk belanja, atau pesan suara untuk
                mencatat pemasukan dan pengeluaran pribadi ke ledger Anda.
              </p>
              <div className="btn-row hero__actions">
                <a className="btn btn--primary" href={primaryHref}>
                  {primaryLabel}
                  <ArrowIcon />
                </a>
                <a className="btn btn--secondary" href="#antarmuka">
                  Lihat antarmuka
                </a>
              </div>
            </div>

            <div
              className="hero__window"
              data-fx="gradient-mesh"
              data-fx-seed="42"
            >
              <div
                className="ly-piece ui ui-af af-shell hero-win"
                data-ly-steps="900"
              >
                <div className="hero-win__body">
                  <div className="hero-win__side" aria-hidden="true">
                    <div className="hero-win__stat-card">
                      <div className="hero-win__stat-head">
                        <span>Total Saldo</span>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            d="M2.5 4.5A1.5 1.5 0 014 3h8a1.5 1.5 0 011.5 1.5V6H10.5a1.5 1.5 0 000 3h3v3A1.5 1.5 0 0112 13.5H4A1.5 1.5 0 012.5 12V4.5z"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="hero-win__stat-val">Rp 14.210.500</span>
                      <span className="hero-win__stat-sub">
                        24 transaksi tercatat
                      </span>
                    </div>

                    <div className="hero-win__stat-card">
                      <div className="hero-win__stat-head">
                        <span>Pemasukan Bulan Ini</span>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            d="M5 11L11 5M6 5h5v5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="hero-win__stat-val">Rp 16.500.000</span>
                      <span className="hero-win__stat-sub">
                        Periode 1 Mar – 31 Mar
                      </span>
                    </div>

                    <div className="hero-win__stat-card">
                      <div className="hero-win__stat-head">
                        <span>Pengeluaran Bulan Ini</span>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            d="M5 5l6 6M11 6v5H6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="hero-win__stat-val">Rp 2.289.500</span>
                      <span className="hero-win__stat-sub">
                        18 transaksi bulan ini
                      </span>
                    </div>
                  </div>

                  <div className="af-drawer af-drawer--flush">
                    <AfChatHeader singleRow />
                    <div className="af-thread af-thread--compact">
                      <AfUserMessage text="Saya barusan beli buah 10rbu dan kopi 32rb" />
                      <AfAssistantMessage
                        lyPiece
                        traces={[
                          {
                            icon: 'record',
                            title: 'Transaksi dicatat',
                            description: 'Rp 10.000 · Rp 32.000',
                          },
                        ]}
                        reply="Dua pengeluaran masuk ke Makanan & Minuman."
                      />
                    </div>
                    <AfChatComposer
                      inline
                      placeholder="Ketik transaksi atau unggah struk..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section ground-surface"
        id="antarmuka"
        style={{ '--hm': 2 } as CSSProperties}
        aria-labelledby="antarmuka-h"
      >
        <div className="wrap">
          <div className="section-head">
            <h2 id="antarmuka-h">
              Satu antarmuka untuk ledger dan chat AI Finance.{' '}
              <span className="muted">
                Pencatatan dan rekap berjalan di tempat yang sama.
              </span>
            </h2>
            <p className="t-lead">
              Ringkasan saldo dan transaksi terbaru di Dashboard terhubung
              langsung dengan drawer Asisten Keuangan AI.
            </p>
          </div>

          <div className="panel app-panel">
            <div className="app-frame">
              <div className="ui ui-af af-shell">
                <AfDashboardPane />
              </div>

              <div
                className="ui ui-af af-drawer af-drawer--flush"
                data-ui="chat"
                data-ui-loop=""
              >
                <AfChatHeader showSubtitle />
                <div className="af-thread">
                  <AfUserMessage text="Catat makan siang nasi padang 38rb dan pertamax 50rb barusan" />
                  <AfAssistantMessage
                    traces={[
                      {
                        icon: 'record',
                        title: 'Transaksi dicatat',
                        description: 'Rp 38.000',
                      },
                      {
                        icon: 'summary',
                        title: 'Ringkasan keuangan dihitung',
                        description: 'Rp 14.210.500',
                      },
                    ]}
                    reply="Selesai. Kedua transaksi masuk kategori Makanan & Minuman dan Transportasi."
                    isLoopAnswer
                  />
                </div>
                <AfChatComposer />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section g2 bg-band"
        id="multimodal"
        aria-labelledby="multimodal-h"
      >
        <div className="wrap">
          <div className="group">
            <div className="section-head">
              <h2 id="multimodal-h">
                Input multimodal Gemini untuk mencatat keuangan dari chat,
                struk, dan suara.
              </h2>
              <p className="t-lead">
                Kirim format catatan keuangan apa pun saat transaksi terjadi.
              </p>
            </div>

            <div className="grid">
              <article className="card card--row card--open span-6">
                <h3>Chat nominal rupiah AI Finance</h3>
                <p>
                  Kenali <code>10rbu</code>, <code>25rb</code>, <code>1.5jt</code>,{' '}
                  <code>goceng</code>, hingga <code>cepek</code> otomatis
                  sesuai WIB.
                </p>
                <div
                  className="panel"
                  data-fx="painterly-landscape"
                  data-fx-seed="11"
                  data-fx-palette='{"bg":"#a3b0b6","accent":"#c49a6c"}'
                  data-fx-params='{"blur":1,"brush":0.35,"slope":0,"hillY":0.3,"horizon":0.62,"speed":0}'
                >
                  <div className="stage">
                    <div
                      className="at-rise fit"
                      style={
                        {
                          '--fit-max': '392px',
                          '--ax': 'max(12px, 50% - 196px)',
                          '--ay': '18px',
                          '--ay-sm': '8px',
                        } as CSSProperties
                      }
                    >
                      <div
                        className="ui ui-af af-drawer"
                        data-ui="chat"
                        data-ui-loop=""
                      >
                        <AfChatHeader singleRow />
                        <div className="af-thread af-thread--compact">
                          <AfUserMessage text="Bayar parkir goceng sama pulsa cepek" />
                          <AfAssistantMessage
                            traces={[
                              {
                                icon: 'record',
                                title: 'Transaksi dicatat',
                                description: 'Rp 5.000 · Rp 100.000',
                              },
                            ]}
                            reply="Masuk Transportasi & Tagihan."
                            isLoopAnswer
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="card card--row card--open span-6">
                <h3>Unggah 5 foto struk transaksi AI Finance</h3>
                <p>
                  Dukung JPEG, PNG, WebP, dan HEIC hingga 12&nbsp;MB per pesan
                  untuk diekstrak ke ledger.
                </p>
                <div className="panel">
                  <div className="stage">
                    <div
                      className="at-corner fit"
                      style={{ '--fit-max': '452px' } as CSSProperties}
                    >
                      <AfReceiptUploadMock />
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="grid">
            <article className="card card--row card--open card--multimodal-voice span-6">
              <h3>Pesan suara transaksi AI Finance</h3>
              <p>
                Rekam suara hingga 2 menit di chat tanpa menyimpan berkas audio
                ke database.
              </p>
              <div className="panel">
                <div className="stage">
                  <div
                    className="at-right fit"
                    style={
                      {
                        '--fit-max': '392px',
                        '--ax': 'max(12px, 50% - 196px)',
                        '--ay': '12px',
                        '--ay-sm': '6px',
                      } as CSSProperties
                    }
                  >
                    <div className="ui ui-af af-drawer">
                      <AfChatHeader singleRow />
                      <div className="af-thread af-thread--compact">
                        <AfUserMessage
                          text="Beli beras 85rb sama sayur 30rb"
                          audio={{
                            fileName: 'rekaman-suara.webm',
                            duration: '00:38',
                            size: '420 KB',
                          }}
                        />
                        <AfAssistantMessage
                          traces={[
                            {
                              icon: 'record',
                              title: 'Transaksi dicatat',
                              description: 'Rp 115.000',
                            },
                          ]}
                          reply="Tercatat ke Makanan & Minuman."
                        />
                      </div>
                      <AfChatComposer mode="recording" compact />
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="card card--row card--open span-6">
              <h3>5 tool transaksi langsung ke database</h3>
              <p>
                Memanggil <code>record_transaction</code>,{' '}
                <code>list_transactions</code>,{' '}
                <code>get_transaction_summary</code>,{' '}
                <code>update_transaction</code>, <code>delete_transaction</code>.
              </p>
              <div className="panel">
                <div className="stage">
                  <div
                    className="at-rise fit"
                    style={
                      {
                        '--fit-max': '392px',
                        '--ax': 'max(16px, 50% - 196px)',
                        '--ay': '24px',
                        '--ay-sm': '12px',
                      } as CSSProperties
                    }
                  >
                    <div
                      className="ui-notify"
                      data-ui="notify"
                      data-ui-still=""
                    >
                      <ul className="ui-notify__list" data-notify-list="">
                        <li className="ui-note">
                          <span className="ui-note__ico" aria-hidden="true">
                            <CheckIcon />
                          </span>
                          <span className="ui-note__text">
                            <span className="ui-note__title">
                              Transaksi dicatat
                              <time>Rp 50.000</time>
                            </span>
                            <span className="ui-note__body">
                              Transportasi · record_transaction selesai
                            </span>
                          </span>
                        </li>
                        <li className="ui-note">
                          <span className="ui-note__ico" aria-hidden="true">
                            <CheckIcon />
                          </span>
                          <span className="ui-note__text">
                            <span className="ui-note__title">
                              Ringkasan keuangan dihitung
                              <time>1m lalu</time>
                            </span>
                            <span className="ui-note__body">
                              get_transaction_summary saldo bersih diperbarui
                            </span>
                          </span>
                        </li>
                        <li className="ui-note">
                          <span className="ui-note__ico" aria-hidden="true">
                            <CheckIcon />
                          </span>
                          <span className="ui-note__text">
                            <span className="ui-note__title">
                              Transaksi diperbarui
                              <time>5m lalu</time>
                            </span>
                            <span className="ui-note__body">
                              update_transaction nominal Tagihan &amp; Utilitas
                            </span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        className="section"
        id="alur"
        style={{ '--h': 2 } as CSSProperties}
        data-moment="pinned-chapters"
        aria-labelledby="alur-h"
      >
        <div className="wrap mo-pc__grid">
          <div className="mo-pc__text">
            <h2 id="alur-h">
              Alur pencatatan keuangan AI selesai dalam tiga langkah.
            </h2>
            <ol className="mo-pc__steps">
              <li className="mo-pc__step">
                <h3>1. Masuk dengan akun Google</h3>
                <p>
                  Daftar dan login dalam satu klik lewat Google OAuth melalui
                  Better Auth. Akun personal dan riwayat mutasi langsung siap
                  dipakai.
                </p>
                <figure className="mo-pc__visual mo-pc__visual--lit">
                  <div className="ui ui-notify" data-ui="notify">
                    <ul className="ui-notify__list" data-notify-list="">
                      <li className="ui-note">
                        <span className="ui-note__ico" aria-hidden="true">
                          <img
                            src="/assets/icons/google-icon.svg"
                            alt=""
                            width={16}
                            height={16}
                          />
                        </span>
                        <span className="ui-note__text">
                          <span className="ui-note__title">
                            Google OAuth · Better Auth
                            <time>Aktif</time>
                          </span>
                          <span className="ui-note__body">
                            Sesi akun pribadi terhubung ke Dashboard
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </figure>
              </li>

              <li className="mo-pc__step">
                <h3>2. Simpan kunci Gemini API pribadi</h3>
                <p>
                  Tempel API Key gratis dari Google AI Studio pada menu
                  Settings. Kunci dienkripsi memakai AES-256-GCM sebelum
                  disimpan di server.
                </p>
                <figure className="mo-pc__visual mo-pc__visual--lit">
                  <div
                    className="ui ui-panel ui-toggles"
                    data-ui="toggles"
                    data-ui-still=""
                  >
                    <div className="ui-head">
                      <span className="ui-head__title">Pengaturan Gemini</span>
                      <span className="ui-head__meta" data-tg-count="">
                        Terenkripsi
                      </span>
                    </div>
                    <div className="ui-toggles__list">
                      <div className="ui-tg is-active">
                        <div className="ui-tg__text">
                          <span className="ui-tg__label">
                            Enkripsi AES-256-GCM
                          </span>
                          <span className="ui-tg__sub">
                            API Key tidak pernah dikembalikan ke browser
                          </span>
                        </div>
                        <span className="ui-switch is-on" aria-hidden="true">
                          <i />
                        </span>
                      </div>
                      <div className="ui-tg">
                        <div className="ui-tg__text">
                          <span className="ui-tg__label">
                            Gemini 3.5 Flash-Lite
                          </span>
                          <span className="ui-tg__sub">
                            Model default cepat &amp; hemat kuota
                          </span>
                        </div>
                        <span className="ui-switch is-on" aria-hidden="true">
                          <i />
                        </span>
                      </div>
                    </div>
                  </div>
                </figure>
              </li>

              <li className="mo-pc__step">
                <h3>3. Kirim chat, foto struk, atau suara</h3>
                <p>
                  AI memanggil tool pencatat transaksi secara otomatis lalu
                  menyegarkan total pemasukan, pengeluaran, dan saldo bersih.
                </p>
                <figure className="mo-pc__visual mo-pc__visual--lit">
                  <div className="ui ui-af af-drawer">
                    <AfChatHeader
                      singleRow
                      conversationTitle="Ringkasan Maret"
                    />
                    <div className="af-thread af-thread--compact">
                      <AfUserMessage text="Ringkasan pengeluaran bulan ini" />
                      <AfAssistantMessage
                        traces={[
                          {
                            icon: 'summary',
                            title: 'Ringkasan keuangan dihitung',
                            description: 'Rp 14.210.500',
                          },
                        ]}
                        reply="Pengeluaran Maret Rp 2.289.500 dari 18 transaksi."
                      />
                    </div>
                  </div>
                </figure>
              </li>
            </ol>
          </div>

          <div className="mo-pc__visuals frame" />
        </div>
      </section>

      <section
        className="section ground-surface"
        id="keamanan"
        aria-labelledby="keamanan-h"
      >
        <div className="wrap">
          <div className="grid grid--middle">
            <div className="span-5 stack-6">
              <div className="section-head" style={{ marginBottom: 0 }}>
                <h2 id="keamanan-h">
                  Keamanan kunci Gemini dan privasi media.
                </h2>
                <p className="t-lead">
                  Bring Your Own Key membuat akses gratis dengan enkripsi penuh.
                </p>
              </div>

              <ul className="rows">
                <li>
                  <span className="rows__name">Enkripsi AES-256-GCM</span>
                  <span className="rows__value">Server-only</span>
                  <p>
                    API Key dienkripsi server dan dapat dihapus di Settings.
                  </p>
                </li>
                <li>
                  <span className="rows__name">Media sementara</span>
                  <span className="rows__value">Tanpa simpan file</span>
                  <p>
                    Foto struk &amp; audio diproses AI tanpa disimpan database.
                  </p>
                </li>
                <li>
                  <span className="rows__name">Database Neon Postgres</span>
                  <span className="rows__value">Neon DB</span>
                  <p>
                    Hanya teks obrolan dan catatan transaksi pribadi tersimpan.
                  </p>
                </li>
              </ul>

              <p>
                <a className="link" href="/privacy">
                  Baca kebijakan privasi lengkap
                </a>
              </p>
            </div>

            <div className="span-6 start-7">
              <div
                className="frame frame--lit dg-box"
                style={{ padding: 'var(--s-6)' }}
              >
                <div
                  className="dg"
                  data-diagram={BOWTIE_DIAGRAM}
                  data-dg-still=""
                  data-icon-base="/assets/icons/"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section"
        id="transaksi"
        aria-labelledby="transaksi-h"
      >
        <div className="wrap">
          <div className="section-head">
            <h2 id="transaksi-h">
              Kelola 17 kategori transaksi, 4 model Gemini, dan akses aplikasi
              PWA.
            </h2>
            <p className="t-lead">
              Seluruh klasifikasi pemasukan, pilihan model AI, hingga instalasi
              di layar utama tersedia bawaan di akun pribadi Anda.
            </p>
          </div>

          <div
            className="tabs"
            role="tablist"
            aria-label="Fitur kelola transaksi dan pengaturan"
          >
            <button
              type="button"
              className="tab"
              role="tab"
              id="tab-btn-kategori"
              aria-selected="true"
              aria-controls="tab-panel-kategori"
            >
              17 Kategori
            </button>
            <button
              type="button"
              className="tab"
              role="tab"
              id="tab-btn-model"
              aria-selected="false"
              aria-controls="tab-panel-model"
            >
              4 Model AI
            </button>
            <button
              type="button"
              className="tab"
              role="tab"
              id="tab-btn-pwa"
              aria-selected="false"
              aria-controls="tab-panel-pwa"
            >
              Aplikasi PWA
            </button>
          </div>

          <div
            id="tab-panel-kategori"
            role="tabpanel"
            aria-labelledby="tab-btn-kategori"
            className="tour-panel-grid"
          >
            <div className="grid grid--middle">
              <div className="span-5 stack-4">
                <h3>17 kategori pemasukan dan pengeluaran terstruktur</h3>
                <p>
                  Mencakup 6 sumber pemasukan mulai dari Gaji, Freelance &amp;
                  Proyek, Bisnis &amp; Usaha, Investasi &amp; Dividen, Hadiah
                  &amp; Bonus, hingga Pemasukan Lainnya, serta 11 kategori
                  pengeluaran.
                </p>
                <ul className="checks">
                  <li>
                    Filter berdasarkan jenis, kategori, kata kunci, dan periode.
                  </li>
                  <li>
                    Sunting atau hapus langsung dari tabel atau lewat chat AI.
                  </li>
                </ul>
              </div>
              <div className="span-6 start-7">
                <div className="frame frame--split frame--lit tour-stage">
                  <AfCategoryFilterMock />
                </div>
              </div>
            </div>
          </div>

          <div
            id="tab-panel-model"
            role="tabpanel"
            aria-labelledby="tab-btn-model"
            className="tour-panel-grid"
            hidden
          >
            <div className="grid grid--middle">
              <div className="span-5 stack-4">
                <h3>Bebas pilih 4 model resmi Google Gemini</h3>
                <p>
                  Gunakan Gemini 3.5 Flash-Lite sebagai setelan awal yang
                  ringan, atau beralih kapan saja ke Gemini 3.1 Flash-Lite,
                  Gemini 3.6 Flash, dan Gemini 3.8 Flash di halaman Settings.
                </p>
                <ul className="checks">
                  <li>Memakai API Key Google AI Studio milik pribadi Anda.</li>
                  <li>Bisa uji koneksi kunci langsung sebelum menyimpan.</li>
                </ul>
              </div>
              <div className="span-6 start-7">
                <div className="frame frame--split frame--lit tour-stage">
                  <div
                    className="ui ui-panel ui-toggles"
                    data-ui="toggles"
                    data-ui-still=""
                  >
                    <div className="ui-head">
                      <span className="ui-head__title">
                        Pilihan Model Gemini
                      </span>
                      <span className="ui-head__meta" data-tg-count="">
                        4 model
                      </span>
                    </div>
                    <div className="ui-toggles__list">
                      <div className="ui-tg is-active">
                        <div className="ui-tg__text">
                          <span className="ui-tg__label">
                            Gemini 3.5 Flash-Lite
                          </span>
                          <span className="ui-tg__sub">
                            Default cepat untuk pencatatan harian
                          </span>
                        </div>
                        <span className="ui-switch is-on" aria-hidden="true">
                          <i />
                        </span>
                      </div>
                      <div className="ui-tg">
                        <div className="ui-tg__text">
                          <span className="ui-tg__label">
                            Gemini 3.1 Flash-Lite
                          </span>
                          <span className="ui-tg__sub">
                            Alternatif ringan untuk kuota gratis
                          </span>
                        </div>
                        <span className="ui-switch" aria-hidden="true">
                          <i />
                        </span>
                      </div>
                      <div className="ui-tg">
                        <div className="ui-tg__text">
                          <span className="ui-tg__label">Gemini 3.6 Flash</span>
                          <span className="ui-tg__sub">
                            Akurasi tinggi untuk foto struk panjang
                          </span>
                        </div>
                        <span className="ui-switch" aria-hidden="true">
                          <i />
                        </span>
                      </div>
                      <div className="ui-tg">
                        <div className="ui-tg__text">
                          <span className="ui-tg__label">Gemini 3.8 Flash</span>
                          <span className="ui-tg__sub">
                            Penalaran lanjut untuk ringkasan mutasi
                          </span>
                        </div>
                        <span className="ui-switch" aria-hidden="true">
                          <i />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            id="tab-panel-pwa"
            role="tabpanel"
            aria-labelledby="tab-btn-pwa"
            className="tour-panel-grid"
            hidden
          >
            <div className="grid grid--middle">
              <div className="span-5 stack-4">
                <h3>Pasang AI Finance sebagai aplikasi PWA di ponsel</h3>
                <p>
                  Didukung Web App Manifest, Service Worker, dan rute cadangan{' '}
                  <code>/offline</code> agar pintasan membuka langsung Dashboard
                  pribadi tanpa tab browser penuh.
                </p>
                <ul className="checks">
                  <li>
                    Pemasangan langsung dari Chrome, Edge, atau Safari iOS.
                  </li>
                  <li>Layar cadangan bersih saat koneksi internet terputus.</li>
                </ul>
              </div>
              <div className="span-6 start-7">
                <div className="frame frame--split frame--lit tour-stage">
                  <div className="ui ui-notify" data-ui="notify">
                    <ul className="ui-notify__list" data-notify-list="">
                      <li className="ui-note">
                        <span className="ui-note__ico" aria-hidden="true">
                          <img
                            src="/assets/icons/chrome.svg"
                            alt=""
                            width={16}
                            height={16}
                          />
                        </span>
                        <span className="ui-note__text">
                          <span className="ui-note__title">
                            Web App Manifest
                            <time>Siap</time>
                          </span>
                          <span className="ui-note__body">
                            start_url diarahkan langsung ke /dashboard
                          </span>
                        </span>
                      </li>
                      <li className="ui-note">
                        <span className="ui-note__ico" aria-hidden="true">
                          <CheckIcon />
                        </span>
                        <span className="ui-note__text">
                          <span className="ui-note__title">
                            Service Worker &amp; /offline
                            <time>Aktif</time>
                          </span>
                          <span className="ui-note__body">
                            Halaman offline siap tampil saat sinyal hilang
                          </span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section ground-surface"
        id="faq"
        aria-labelledby="faq-h"
      >
        <div className="wrap">
          <div className="grid">
            <div className="span-5 stack-5">
              <div className="section-head" style={{ marginBottom: 0 }}>
                <h2 id="faq-h">FAQ pencatat keuangan AI Finance.</h2>
                <p className="t-lead">
                  Jawaban singkat mengenai biaya, enkripsi kunci Gemini, dan
                  batasan fitur akun pribadi.
                </p>
              </div>
              <div className="ui ui-af af-faq-badge">
                <img
                  src="/icons/icon.svg"
                  alt="Logo AI Finance"
                  width={28}
                  height={28}
                />
                <span>Gratis Rp&nbsp;0 · Kunci BYOK AES-256-GCM · 17 Kategori</span>
              </div>
            </div>

            <div className="span-6 start-7">
              <div className="faq">
                <div className="faq__item">
                  <h3>
                    Apakah AI Finance gratis Rp&nbsp;0 tanpa langganan bulanan?
                  </h3>
                  <p>
                    Ya, gratis tanpa biaya langganan karena seluruh proses AI
                    memakai API Key Google Gemini milik Anda sendiri.
                  </p>
                </div>

                <div className="faq__item">
                  <h3>
                    Bagaimana cara mendapat kunci Gemini API di Google AI
                    Studio?
                  </h3>
                  <p>
                    Masuk ke Google AI Studio, buat API Key gratis, lalu tempel
                    dan uji kunci tersebut di halaman Settings.
                  </p>
                </div>

                <div className="faq__item">
                  <h3>
                    Apakah kunci Gemini API aman tersimpan di server AI Finance?
                  </h3>
                  <p>
                    Kunci dienkripsi server-side memakai AES-256-GCM sebelum
                    masuk database Neon dan dapat dihapus kapan saja.
                  </p>
                </div>

                <div className="faq__item">
                  <h3>
                    Apakah foto struk dan suara transaksi keuangan disimpan AI
                    Finance?
                  </h3>
                  <p>
                    Tidak. Foto struk dan rekaman suara hanya diproses selama
                    permintaan AI berlangsung; hanya teks dan transaksi yang
                    tersimpan.
                  </p>
                </div>

                <div className="faq__item">
                  <h3>
                    Apakah AI Finance dibuat untuk tim atau personal dengan 17
                    kategori?
                  </h3>
                  <p>
                    Khusus untuk pribadi dan freelancer individu dengan 17
                    kategori standar dan singkatan rupiah seperti 10rbu,
                    goceng, dan cepek.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
