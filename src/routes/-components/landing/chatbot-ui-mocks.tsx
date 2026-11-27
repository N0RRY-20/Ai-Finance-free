export type AfToolIconKind = 'record' | 'summary' | 'list' | 'update'

export interface AfTraceRow {
  icon: AfToolIconKind
  title: string
  description?: string
}

export function SparklesSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M8 1.5l1.3 3.7L13 6.5l-3.7 1.3L8 11.5 6.7 7.8 3 6.5l3.7-1.3L8 1.5zM12.5 11l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WalletSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M2.5 4.5A1.5 1.5 0 014 3h8a1.5 1.5 0 011.5 1.5V6H10.5a1.5 1.5 0 000 3h3v3A1.5 1.5 0 0112 13.5H4A1.5 1.5 0 012.5 12V4.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowUpRightSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M5 11L11 5M6 5h5v5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowDownRightSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M5 5l6 6M11 6v5H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HistorySvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M2.5 8a5.5 5.5 0 101.6-3.9L2.5 5.5M2.5 2.5v3h3M8 5v3.2l2 1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M8 3v10M3 8h10" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TraceKindSvg({ kind }: { kind: AfToolIconKind }) {
  switch (kind) {
    case 'summary':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            d="M8.5 2.2v5.3h5.3A5.5 5.5 0 118.5 2.2z"
            strokeLinejoin="round"
          />
          <path d="M10.5 2.4A5.5 5.5 0 0113.6 5.5h-3.1V2.4z" />
        </svg>
      )
    case 'list':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M2.5 4h11M4.5 8h7M6.5 12h3" strokeLinecap="round" />
        </svg>
      )
    case 'update':
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    default:
      return (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            d="M3.5 2.5h9v11l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1v-11zM5.5 6h5M5.5 8.5h3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

function ImagePlusSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="10" rx="2" />
      <path
        d="M4.5 10.5l2.5-2.5 2.2 2 1.8-1.5 1.5 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="6" r=".8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MicSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="5.8" y="2" width="4.4" height="7.5" rx="2.2" />
      <path
        d="M3.5 7.5a4.5 4.5 0 009 0M8 12v2.5M6 14.5h4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SquareSvg() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1.2" />
    </svg>
  )
}

function PlaySvg() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M5 3.5l7.5 4.5L5 12.5V3.5z" />
    </svg>
  )
}

function CloseSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  )
}

function SendHorizontalSvg() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d="M2.5 3l11 5-11 5 1.8-5-1.8-5zM4.3 8h4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AfChatHeader({
  conversationTitle = 'Percakapan Baru',
  showSubtitle = false,
  compact = false,
  singleRow = false,
}: {
  conversationTitle?: string
  showSubtitle?: boolean
  compact?: boolean
  singleRow?: boolean
}) {
  if (singleRow) {
    return (
      <div className="af-chat-head af-chat-head--single-row">
        <span className="af-chat-head__title">Asisten Keuangan AI</span>
        <div className="af-chat-head__tools">
          <span className="af-pill-btn af-chat-head__history">
            <HistorySvg />
            {conversationTitle}
            <ChevronDownSvg />
          </span>
          <span className="af-pill-btn">
            <PlusSvg />
            Chat Baru
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={compact ? 'af-chat-head af-chat-head--compact' : 'af-chat-head'}
    >
      <div className="af-chat-head__title-row">
        <span className="af-chat-head__title">Asisten Keuangan AI</span>
      </div>
      {showSubtitle ? (
        <span className="af-chat-head__desc">
          Catat, lihat, ubah, dan hapus transaksi lewat chat alami, pesan
          suara, atau unggah foto struk.
        </span>
      ) : null}
      <div className="af-chat-head__tools">
        <span className="af-pill-btn af-chat-head__history">
          <HistorySvg />
          {conversationTitle}
          <ChevronDownSvg />
        </span>
        <span className="af-pill-btn">
          <PlusSvg />
          Chat Baru
        </span>
      </div>
    </div>
  )
}

export function AfLiveAudioCard({
  fileName = 'rekaman-suara.webm',
  duration = '00:38',
  size = '420 KB',
}: {
  fileName?: string
  duration?: string
  size?: string
}) {
  return (
    <div className="af-audio-card">
      <div className="af-audio-card__top">
        <span className="af-audio-card__name">
          <MicSvg />
          <span>{fileName}</span>
        </span>
        <span className="af-audio-card__meta">
          {duration} · {size}
        </span>
      </div>
      <div className="af-audio-card__bar" aria-hidden="true">
        <span
          style={{
            width: '12px',
            height: '12px',
            display: 'inline-grid',
            placeItems: 'center',
          }}
        >
          <PlaySvg />
        </span>
        <span>0:24</span>
        <span className="af-audio-card__track">
          <i />
        </span>
        <span>{duration}</span>
      </div>
    </div>
  )
}

export function AfUserMessage({
  userName = 'Norry',
  initials = 'NR',
  text,
  audio,
}: {
  userName?: string
  initials?: string
  text: string
  audio?: { fileName?: string; duration?: string; size?: string }
}) {
  return (
    <div className="af-message af-message--end" data-chat-q="">
      <span className="af-avatar" aria-hidden="true">
        {initials}
      </span>
      <div className="af-message__col">
        <span className="af-message__name">{userName}</span>
        {audio ? (
          <AfLiveAudioCard
            fileName={audio.fileName}
            duration={audio.duration}
            size={audio.size}
          />
        ) : null}
        <div className="af-bubble af-bubble--default ui-msg__text">{text}</div>
      </div>
    </div>
  )
}

export function AfAssistantMessage({
  traces,
  reply,
  replyBold,
  lyPiece = false,
  isLoopAnswer = false,
}: {
  traces: readonly AfTraceRow[]
  reply: string
  replyBold?: string
  lyPiece?: boolean
  isLoopAnswer?: boolean
}) {
  return (
    <div className="af-message" data-chat-a="">
      <span className="af-avatar" aria-hidden="true">
        AI
      </span>
      <div className="af-message__col">
        <span className="af-message__name">Asisten Keuangan AI</span>
        {traces.length > 0 ? (
          <div className="af-trace">
            {traces.map((trace, idx) => (
              <div
                key={`${trace.title}-${idx}`}
                className={
                  lyPiece ? 'ly-piece af-trace__line' : 'af-trace__line'
                }
              >
                <span className="af-trace__icon">
                  <TraceKindSvg kind={trace.icon} />
                </span>
                <span className="af-trace__title">{trace.title}</span>
                {trace.description ? (
                  <span className="af-trace__desc">{trace.description}</span>
                ) : null}
                <ChevronRightSvg className="af-trace__chev" />
              </div>
            ))}
          </div>
        ) : null}
        <div
          className={
            lyPiece
              ? 'ly-piece af-bubble af-bubble--muted'
              : 'af-bubble af-bubble--muted'
          }
        >
          <span className={isLoopAnswer ? 'ui-chat__answer' : undefined}>
            {reply}
            {replyBold ? (
              <>
                {' '}
                <b>{replyBold}</b>
              </>
            ) : null}
          </span>
        </div>
      </div>
    </div>
  )
}

export function AfChatComposer({
  mode = 'idle',
  compact = false,
  inline = false,
  placeholder = 'Ketik transaksi, rekam suara, atau unggah foto struk...',
}: {
  mode?: 'idle' | 'recording'
  compact?: boolean
  inline?: boolean
  placeholder?: string
}) {
  const isRec = mode === 'recording'

  if (inline) {
    return (
      <div className="af-composer-wrap af-composer-wrap--compact">
        <div className="af-composer--inline">
          <span className="af-composer__ico" aria-hidden="true">
            <ImagePlusSvg />
          </span>
          <span className="af-composer__ico" aria-hidden="true">
            <MicSvg />
          </span>
          <span className="af-composer__placeholder">{placeholder}</span>
          <div className="af-pill-btn af-pill-btn--solid">
            <SendHorizontalSvg />
            Kirim
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={
        compact
          ? 'af-composer-wrap af-composer-wrap--compact'
          : 'af-composer-wrap'
      }
    >
      <div className="af-composer">
        {isRec ? (
          <div className="af-rec-strip">
            <span className="af-rec-strip__left">
              <span className="af-rec-dot" aria-hidden="true" />
              Merekam suara...
              <span className="af-rec-strip__time">00:38 / 02:00</span>
            </span>
            <span className="af-rec-strip__actions">
              <span className="af-pill-btn af-pill-btn--ghost">
                <CloseSvg />
                Batal
              </span>
              <div className="af-pill-btn af-pill-btn--danger">
                <SquareSvg />
                Selesai
              </div>
            </span>
          </div>
        ) : null}
        <span className="af-composer__placeholder">{placeholder}</span>
        <div className="af-composer__foot">
          <span className="af-composer__tools">
            <span className="af-composer__ico" aria-hidden="true">
              <ImagePlusSvg />
            </span>
            <span
              className={
                isRec
                  ? 'af-composer__ico af-composer__ico--rec'
                  : 'af-composer__ico'
              }
              aria-hidden="true"
            >
              {isRec ? <SquareSvg /> : <MicSvg />}
            </span>
            <span className="af-composer__hint">
              Enter kirim · Suara &amp; maks. 5 foto struk
            </span>
          </span>
          <div className="af-pill-btn af-pill-btn--solid">
            <SendHorizontalSvg />
            Kirim
          </div>
        </div>
      </div>
    </div>
  )
}

const RECEIPT_THUMBS = [
  { fmt: 'JPG', store: 'Kopi Susu', item: '2× Latte', amount: 'Rp 42.000' },
  { fmt: 'HEIC', store: 'Bukti QRIS', item: 'Nasi Padang', amount: 'Rp 38.000' },
  { fmt: 'PNG', store: 'Token PLN', item: 'Prabayar', amount: 'Rp 202.500' },
  { fmt: 'WebP', store: 'Parkir WIB', item: 'Karcis Motor', amount: 'Rp 4.000' },
] as const

export function AfReceiptUploadMock() {
  return (
    <div className="ui ui-af af-drawer">
      <div className="af-receipts-wrap">
        <div className="af-receipt-meta-row">
          <div className="af-trace__line">
            <span className="af-trace__icon">
              <TraceKindSvg kind="record" />
            </span>
            <span className="af-trace__title">Transaksi dicatat</span>
            <span className="af-trace__desc">Rp 286.500</span>
            <ChevronRightSvg className="af-trace__chev" />
          </div>
          <span className="af-ephemeral-tag">Media tidak disimpan di DB</span>
        </div>

        <div className="af-receipts-bar">
          <span>
            <b>4/5 gambar</b> siap dikirim
          </span>
          <span>Hapus semua</span>
        </div>

        <div className="af-receipts-grid">
          {RECEIPT_THUMBS.map((item) => (
            <div key={item.store} className="af-receipt-thumb">
              <div className="af-receipt-thumb__top">
                <span className="af-receipt-thumb__fmt">{item.fmt}</span>
                <span className="af-receipt-thumb__rm" aria-hidden="true">
                  <CloseSvg />
                </span>
              </div>
              <div className="af-receipt-paper">
                <strong>{item.store}</strong>
                <small>{item.item}</small>
                <span>{item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AfChatComposer inline placeholder="Catat semua struk belanja..." />
    </div>
  )
}

const CATEGORY_FILTER_ROWS = [
  {
    name: 'Termin desain aplikasi',
    category: 'Freelance & Proyek',
    date: '27 Mar 2026',
    amount: '+ Rp 4.500.000',
    income: true,
  },
  {
    name: 'Makan siang nasi padang',
    category: 'Makanan & Minuman',
    date: '27 Mar 2026',
    amount: '- Rp 38.000',
    income: false,
  },
  {
    name: 'Token listrik prabayar',
    category: 'Tagihan & Utilitas',
    date: '26 Mar 2026',
    amount: '- Rp 202.500',
    income: false,
  },
] as const

export function AfCategoryFilterMock() {
  return (
    <div className="ui ui-af af-drawer">
      <div className="af-chat-head af-chat-head--single-row">
        <span className="af-chat-head__title">17 Kategori Transaksi</span>
        <span className="af-badge af-badge--income">6 Masuk · 11 Keluar</span>
      </div>
      <div className="af-filter-bar">
        <span className="af-pill-btn">Semua jenis</span>
        <span className="af-pill-btn">Kategori (17)</span>
        <span className="af-pill-btn">Maret 2026</span>
      </div>
      <div className="af-cat-chips">
        <span className="af-badge af-badge--income">Gaji</span>
        <span className="af-badge af-badge--income">Freelance &amp; Proyek</span>
        <span className="af-badge">Makanan &amp; Minuman</span>
        <span className="af-badge">Tagihan &amp; Utilitas</span>
        <span className="af-badge">Transportasi</span>
      </div>
      <div className="af-thread af-thread--compact">
        <div className="af-tx-list">
          {CATEGORY_FILTER_ROWS.map((row) => (
            <div key={row.name} className="af-tx-row">
              <div className="af-tx-row__top">
                <span className="af-tx-row__name">{row.name}</span>
                <span
                  className={
                    row.income
                      ? 'af-tx-row__amt'
                      : 'af-tx-row__amt af-tx-row__amt--neg'
                  }
                >
                  {row.amount}
                </span>
              </div>
              <div className="af-tx-row__meta">
                <span
                  className={
                    row.income ? 'af-badge af-badge--income' : 'af-badge'
                  }
                >
                  {row.category}
                </span>
                <span>{row.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const RECENT_TRANSACTIONS = [
  {
    name: 'Termin desain aplikasi',
    category: 'Freelance & Proyek',
    date: '27 Mar 2026',
    amount: '+ Rp 4.500.000',
    income: true,
  },
  {
    name: 'Nasi padang & minuman',
    category: 'Makanan & Minuman',
    date: '27 Mar 2026',
    amount: '- Rp 38.000',
    income: false,
  },
  {
    name: 'Pertamax motor harian',
    category: 'Transportasi',
    date: '26 Mar 2026',
    amount: '- Rp 50.000',
    income: false,
  },
  {
    name: 'Transfer gaji bulanan',
    category: 'Gaji',
    date: '25 Mar 2026',
    amount: '+ Rp 12.000.000',
    income: true,
  },
] as const

export function AfDashboardPane() {
  return (
    <div className="af-dash-wrap">
      <div className="af-sidebar" aria-hidden="true">
        <div className="af-sidebar__brand">
          <span className="af-sidebar__mark">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 3h10M3 6h10v7H3z" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="af-sidebar__brand-txt">
            <b>AI Finance</b>
            <span>Dashboard</span>
          </span>
        </div>
        <div className="af-sidebar__nav">
          <span className="af-sidebar__item is-on">
            <WalletSvg />
            Dashboard
          </span>
          <span className="af-sidebar__item">
            <TraceKindSvg kind="list" />
            Transaksi
          </span>
          <span className="af-sidebar__item">
            <TraceKindSvg kind="update" />
            Pengaturan
          </span>
        </div>
      </div>

      <div className="af-dash-main">
        <div className="af-dash-top">
          <div>
            <strong className="af-dash-title">Dashboard</strong>
            <p>Selamat datang kembali, Norry.</p>
          </div>
          <div className="af-pill-btn af-pill-btn--solid">
            <SparklesSvg />
            Asisten AI
          </div>
        </div>

        <div className="af-dash-kpis">
          <div className="af-kpi">
            <div className="af-kpi__head">
              <span>Total Saldo</span>
              <WalletSvg />
            </div>
            <div className="af-kpi__val">Rp 14.210.500</div>
            <div className="af-kpi__sub">24 transaksi tercatat</div>
          </div>
          <div className="af-kpi">
            <div className="af-kpi__head">
              <span>Pemasukan Bulan Ini</span>
              <ArrowUpRightSvg />
            </div>
            <div className="af-kpi__val">Rp 16.500.000</div>
            <div className="af-kpi__sub">Periode 1 Mar – 31 Mar 2026</div>
          </div>
          <div className="af-kpi">
            <div className="af-kpi__head">
              <span>Pengeluaran Bulan Ini</span>
              <ArrowDownRightSvg />
            </div>
            <div className="af-kpi__val">Rp 2.289.500</div>
            <div className="af-kpi__sub">18 transaksi bulan ini</div>
          </div>
        </div>

        <div className="af-tx-card">
          <div className="af-tx-card__head">
            <div>
              <b>Transaksi Terbaru</b>
              <span>Riwayat transaksi dicatat langsung atau lewat AI.</span>
            </div>
            <span className="af-pill-btn">
              <SparklesSvg />
              Catat via AI
            </span>
          </div>

          <div className="af-tx-list">
            {RECENT_TRANSACTIONS.map((tx) => (
              <div key={tx.name} className="af-tx-row">
                <div className="af-tx-row__top">
                  <span className="af-tx-row__name">{tx.name}</span>
                  <span
                    className={
                      tx.income
                        ? 'af-tx-row__amt'
                        : 'af-tx-row__amt af-tx-row__amt--neg'
                    }
                  >
                    {tx.amount}
                  </span>
                </div>
                <div className="af-tx-row__meta">
                  <span
                    className={
                      tx.income ? 'af-badge af-badge--income' : 'af-badge'
                    }
                  >
                    {tx.category}
                  </span>
                  <span>{tx.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
