export const MARKETING_PATHS = new Set(['/', '/privacy', '/terms'])

export function isMarketingPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return MARKETING_PATHS.has(normalized)
}

export const LANDING_DEAL = {
  type: 'software',
  trade: 'fintech',
  hero: 'centred',
  nav: 'nav-centre',
  footer: 'footer-dark',
  close: 'close-word',
  rhythm: 'surface-pairs',
  buttons: 'arrow',
  ground: 'sand',
  fontPair: 'host',
  heroEffect: 'gradient-mesh',
  cardEffect: 'painterly-landscape',
  moment: 'pinned-chapters',
  diagram: 'bowtie',
} as const

export const LANDING_GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400..700&family=JetBrains+Mono:wght@400..500&display=swap'

export const LANDING_STYLESHEETS = [
  '/assets/system.css',
  '/assets/ui/cards.css',
  '/assets/ui/base.css',
  '/assets/ui/window/fragment.css',
  '/assets/ui/chat/fragment.css',
  '/assets/ui/notify/fragment.css',
  '/assets/ui/toggles/fragment.css',
  '/assets/diagrams/diagram.css',
  '/assets/motion/motion.css',
  '/assets/backgrounds/backgrounds.css',
  '/assets/moments/pinned-chapters/moment.css',
  '/assets/layout/layout.css',
  '/assets/icons/icon.css',
] as const

export const LANDING_MODULEPRELOADS = [
  '/assets/system.js',
  '/assets/motion/motion.js',
  '/assets/layout/layout.js',
  '/assets/diagrams/mount.js',
  '/assets/moments/moments.js',
  '/assets/moments/lib.js',
  '/assets/moments/pinned-chapters/moment.js',
] as const

export const LANDING_ROOT_VARS_CSS = `:root {
  --p-bg: #f8faf9; --p-surface: #eef3f2; --p-ink: #0f1718; --p-muted: #656b6b;
  --p-accent: #176b66; --p-accent-ink: #f8faf9; --p-action: #176b66; --p-action-ink: #f8faf9;
  --p-inv-bg: #0f1718; --p-inv-surface: #1c2425; --p-inv-ink: #f8faf9; --p-inv-muted: #969b9b;
  --p-inv-accent: #f8faf9; --p-inv-accent-ink: #0f1718; --p-inv-action: #f8faf9; --p-inv-action-ink: #0f1718;
  --font-display: "Host Grotesk", system-ui, sans-serif;
  --font-text: "Host Grotesk", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --display-weight: 500;
  --display-tracking: -0.035em;
  --display-tracking-xl: -0.04em;
}`

export const LANDING_HEAD_BOOTSTRAP_JS = `(() => {
  const r = document.documentElement;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    r.classList.add('m-enter');
    setTimeout(() => r.classList.add('m-enter-done'), 900);
  }
  r.classList.add('mo-js');
  setTimeout(() => r.classList.add('mo-safe'), 2500);
})();`

export const LANDING_PAGE_CSS = `
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.brand-logo img {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  flex: none;
  display: block;
}
@media (max-width: 639px) {
  .brand-logo img {
    width: 20px;
    height: 20px;
  }
}
@media (max-width: 380px) {
  .nav__logo {
    font-size: 15px;
    gap: 5px;
  }
  .nav__logo img {
    width: 18px;
    height: 18px;
  }
  .nav:not(.is-open) .nav__actions .btn {
    padding-inline: 10px;
    font-size: 13px;
    height: 44px;
  }
  .nav:not(.is-open) .nav__actions .btn .m-arrow {
    display: none;
  }
}

.hero--centred .hero__lead {
  color: var(--ink);
}
main h3 {
  font-size: var(--t-card);
  line-height: 1.3;
}
.tab[aria-selected="true"] {
  background: var(--action);
  border-color: var(--action);
  color: var(--action-ink);
}
footer#contact .close__word {
  line-height: 1.04;
  padding-top: 0.08em;
  overflow: visible;
}
.footer__legal-left {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-4);
}
.af-faq-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid var(--af-line);
  background: var(--af-bg);
  font-size: 12px;
  font-weight: 500;
  color: var(--af-ink);
  width: fit-content;
}

/* Shared tokens mirroring real AI Finance shadcn + Tailwind app UI */
.af-shell,
.af-drawer,
.af-card {
  --af-bg: #ffffff;
  --af-muted-bg: #f4f6f6;
  --af-muted-deep: #e8eded;
  --af-line: #dce3e3;
  --af-line-strong: #c8d3d3;
  --af-ink: #0f1718;
  --af-muted: #3b4649;
  --af-primary: #192021;
  --af-primary-ink: #fbfdfd;
  --af-teal: #176b66;
  --af-red: #b91c1c;
  --af-red-soft: rgb(185 28 28 / .07);
  --af-red-line: rgb(185 28 28 / .26);
  background: var(--af-bg);
  color: var(--af-ink);
  font-family: var(--font-text);
  font-size: 13px;
  line-height: 1.45;
  text-align: left;
}

/* Hero Responsive Window Sizing (Desktop >=1280, Laptop 1024-1279, Tablet 640-1023, Mobile <=639) */
.hero--centred .hero__window > .ly-piece.hero-win {
  top: 16px;
  width: min(920px, calc(100% - 48px));
}
.hero-win {
  border-radius: 20px;
  border: 1px solid var(--af-line-strong);
  box-shadow: 0 1px 2px rgb(0 0 0 / .06), 0 18px 42px -18px rgb(0 0 0 / .24);
  overflow: hidden;
}
.hero-win__body {
  display: grid;
  grid-template-columns: 244px minmax(0, 1fr);
  align-items: stretch;
}
.hero-win__side {
  display: grid;
  align-content: start;
  gap: 7px;
  padding: 11px;
  border-right: 1px solid var(--af-line);
  background: #f7fafa;
}
.hero-win__stat-card {
  display: grid;
  gap: 1px;
  padding: 8px 10px;
  border-radius: 14px;
  border: 1px solid var(--af-line);
  background: var(--af-bg);
}
.hero-win__stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11px;
  font-weight: 500;
  color: var(--af-ink);
}
.hero-win__stat-head svg {
  width: 13px;
  height: 13px;
  color: var(--af-muted);
  flex: none;
}
.hero-win__stat-val {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--af-ink);
}
.hero-win__stat-sub {
  font-size: 10px;
  color: var(--af-muted);
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .hero--centred .hero__window > .ly-piece.hero-win {
    top: 14px;
    width: min(840px, calc(100% - 36px));
  }
  .hero-win__body {
    grid-template-columns: 204px minmax(0, 1fr);
  }
  .hero-win__side {
    padding: 9px;
    gap: 6px;
  }
  .hero-win__stat-card {
    padding: 7px 9px;
  }
}
@media (min-width: 640px) and (max-width: 1023px) {
  .hero--centred .hero__window > .ly-piece.hero-win {
    top: 12px;
    width: calc(100% - 28px);
  }
  .hero-win__body {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero-win__side {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border-right: 0;
    border-bottom: 1px solid var(--af-line);
    padding: 8px 10px;
    gap: 8px;
  }
  .hero-win__stat-sub {
    display: none;
  }
}
@media (max-width: 639px) {
  .hero--centred .hero__window {
    min-height: 236px;
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 22px), transparent);
    mask-image: linear-gradient(to bottom, #000 calc(100% - 22px), transparent);
  }
  .hero--centred .hero__window > .ly-piece.hero-win {
    top: 10px;
    width: calc(100% - 20px);
    border-radius: 16px;
  }
  .hero-win__side {
    display: none;
  }
  .hero-win__body {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero-win .af-chat-head__history,
  .hero-win .af-message__name,
  .hero-win .af-composer__hint {
    display: none;
  }
  .hero-win .af-avatar {
    width: 22px;
    height: 22px;
    font-size: 10px;
    margin-top: 2px;
  }
  .hero-win .af-thread--compact {
    padding: 7px 10px;
    gap: 6px;
  }
  .hero-win .af-bubble {
    padding: 6px 10px;
    font-size: 12px;
  }
}

/* Real FinanceChatDrawer + FinanceChatThread primitives */
.af-drawer {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 18px;
  border: 1px solid var(--af-line);
  box-shadow: 0 2px 10px rgb(0 0 0 / .04);
  overflow: hidden;
}
.af-drawer--flush {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
.af-chat-head {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--af-line);
  background: var(--af-bg);
}
.af-chat-head--compact {
  padding: 9px 12px;
  gap: 4px;
}
.af-chat-head--single-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
}
.af-chat-head__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.af-chat-head__title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--af-ink);
  white-space: nowrap;
}
.af-chat-head__desc {
  font-size: 11px;
  line-height: 1.4;
  color: var(--af-muted);
}
.af-chat-head__tools {
  display: flex;
  align-items: center;
  gap: 6px;
}
.af-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 25px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid var(--af-line-strong);
  background: var(--af-bg);
  color: var(--af-ink);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  flex: none;
}
.af-pill-btn svg {
  width: 12px;
  height: 12px;
  color: var(--af-muted);
  flex: none;
}
.af-pill-btn--solid {
  border-color: var(--af-primary);
  background: var(--af-primary);
  color: var(--af-primary-ink);
}
.af-pill-btn--solid svg {
  color: var(--af-primary-ink);
}
.af-pill-btn--ghost {
  border-color: transparent;
  background: transparent;
  padding: 0 6px;
}
.af-pill-btn--danger {
  border-color: var(--af-red);
  background: var(--af-red);
  color: #ffffff;
}
.af-pill-btn--danger svg {
  color: #ffffff;
}

.af-thread {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background: var(--af-bg);
  flex: 0 0 auto;
}
.af-thread--compact {
  gap: 7px;
  padding: 9px 12px;
}
.af-message {
  display: flex;
  width: 100%;
  gap: 8px;
  align-items: flex-start;
}
.af-message--end {
  flex-direction: row-reverse;
}
.af-avatar {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--af-muted-deep);
  color: var(--af-ink);
  font-size: 10.5px;
  font-weight: 600;
  flex: none;
  margin-top: 13px;
}
.af-message__col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: 88%;
}
.af-message--end .af-message__col {
  align-items: flex-end;
}
.af-message__name {
  padding: 0 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--af-muted);
}
.af-bubble {
  width: fit-content;
  max-width: 100%;
  padding: 7px 12px;
  border-radius: 16px;
  font-size: 12.5px;
  line-height: 1.44;
  overflow-wrap: anywhere;
}
.af-bubble--default {
  background: var(--af-primary);
  color: var(--af-primary-ink);
}
.af-bubble--muted {
  background: var(--af-muted-bg);
  color: var(--af-ink);
  border: 1px solid var(--af-line);
}
.af-bubble--muted b {
  font-weight: 600;
}

.af-trace {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0 2px;
}
.af-trace__line {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--af-muted);
}
.af-trace__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  flex: none;
  color: var(--af-teal);
}
.af-trace__icon svg {
  width: 13px;
  height: 13px;
}
.af-trace__title {
  color: var(--af-ink);
  font-weight: 500;
}
.af-trace__desc {
  color: var(--af-muted);
  font-variant-numeric: tabular-nums;
}
.af-trace__chev {
  width: 11px;
  height: 11px;
  color: var(--af-muted);
  flex: none;
}

.af-audio-card {
  display: grid;
  gap: 5px;
  width: 244px;
  max-width: 100%;
  padding: 7px 9px;
  border-radius: 14px;
  border: 1px solid var(--af-line);
  background: var(--af-muted-bg);
}
.af-audio-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
}
.af-audio-card__name {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  color: var(--af-ink);
  min-width: 0;
}
.af-audio-card__name svg {
  width: 12px;
  height: 12px;
  color: var(--af-teal);
  flex: none;
}
.af-audio-card__meta {
  font-size: 10.5px;
  color: var(--af-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.af-audio-card__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--af-bg);
  border: 1px solid var(--af-line);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--af-muted);
}
.af-audio-card__track {
  position: relative;
  flex: 1;
  height: 3px;
  border-radius: 99px;
  background: var(--af-line-strong);
  overflow: hidden;
}
.af-audio-card__track i {
  display: block;
  width: 62%;
  height: 100%;
  background: var(--af-primary);
}

/* Composer + inline variant for compact Hero */
.af-composer-wrap {
  border-top: 1px solid var(--af-line);
  padding: 8px 12px 9px;
  background: var(--af-bg);
}
.af-composer-wrap--compact {
  padding: 6px 10px 7px;
}
.af-composer {
  display: grid;
  gap: 5px;
  padding: 7px 9px;
  border-radius: 12px;
  border: 1px solid var(--af-line-strong);
  background: var(--af-bg);
}
.af-composer--inline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 8px;
  border-radius: 11px;
  border: 1px solid var(--af-line-strong);
  background: var(--af-bg);
}
.af-composer--inline .af-composer__placeholder {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.af-rec-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 9px;
  border: 1px solid var(--af-red-line);
  background: var(--af-red-soft);
  font-size: 11px;
}
.af-rec-strip__left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--af-ink);
  font-weight: 500;
}
.af-rec-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--af-red);
  flex: none;
}
.af-rec-strip__time {
  font-variant-numeric: tabular-nums;
  color: var(--af-muted);
  font-weight: 400;
}
.af-rec-strip__actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
}
.af-composer__placeholder {
  font-size: 12px;
  color: var(--af-muted);
  line-height: 1.35;
}
.af-composer__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.af-composer__tools {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.af-composer__ico {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  color: var(--af-muted);
  flex: none;
}
.af-composer__ico--rec {
  background: var(--af-red);
  color: #ffffff;
}
.af-composer__ico svg {
  width: 14px;
  height: 14px;
}
.af-composer__hint {
  font-size: 10.5px;
  color: var(--af-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Card 2 Improvised Multi-Receipt Thumbnail Staging (matches InputGroupAddon in finance-chat-thread.tsx) */
.af-receipts-wrap {
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  background: var(--af-bg);
}
.af-receipts-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: var(--af-muted);
}
.af-receipts-bar b {
  font-weight: 600;
  color: var(--af-ink);
}
.af-receipts-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.af-receipt-thumb {
  position: relative;
  display: grid;
  align-content: space-between;
  gap: 4px;
  padding: 7px;
  border-radius: 12px;
  border: 1px solid var(--af-line);
  background: #f8fafa;
}
.af-receipt-thumb__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.af-receipt-thumb__fmt {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--af-muted-deep);
  color: var(--af-ink);
}
.af-receipt-thumb__rm {
  display: inline-grid;
  place-items: center;
  width: 15px;
  height: 15px;
  border-radius: 999px;
  border: 1px solid var(--af-line-strong);
  background: var(--af-bg);
  color: var(--af-muted);
}
.af-receipt-thumb__rm svg {
  width: 9px;
  height: 9px;
}
.af-receipt-paper {
  display: grid;
  gap: 2px;
  padding: 7px 7px;
  border-radius: 6px;
  background: var(--af-bg);
  border: 1px dashed var(--af-line-strong);
}
.af-receipt-paper strong {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--af-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.af-receipt-paper small {
  font-size: 9.5px;
  color: var(--af-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.af-receipt-paper span {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--af-ink);
  font-weight: 600;
}
.af-receipt-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.af-ephemeral-tag {
  font-size: 10.5px;
  color: var(--af-muted);
}

/* Real Dashboard overview + sidebar inside #antarmuka */
.app-panel {
  --p-h: auto;
  height: auto;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid var(--af-line);
  background: var(--af-bg);
}
.app-frame {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 1fr);
  align-items: stretch;
  width: 100%;
}
.af-dash-wrap {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  background: #fafafa;
  border-right: 1px solid var(--af-line);
}
.af-sidebar {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 12px 10px;
  border-right: 1px solid var(--af-line);
  background: #f5f7f7;
}
.af-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
}
.af-sidebar__mark {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--af-primary);
  color: var(--af-primary-ink);
  flex: none;
}
.af-sidebar__mark svg {
  width: 14px;
  height: 14px;
}
.af-sidebar__brand-txt {
  display: grid;
  line-height: 1.2;
}
.af-sidebar__brand-txt b {
  font-size: 12px;
  font-weight: 600;
}
.af-sidebar__brand-txt span {
  font-size: 10.5px;
  color: var(--af-muted);
}
.af-sidebar__nav {
  display: grid;
  gap: 2px;
}
.af-sidebar__item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 12px;
  color: var(--af-muted);
}
.af-sidebar__item svg {
  width: 14px;
  height: 14px;
  flex: none;
}
.af-sidebar__item.is-on {
  background: var(--af-bg);
  color: var(--af-ink);
  font-weight: 500;
  box-shadow: 0 1px 2px rgb(0 0 0 / .05);
}
.af-dash-main {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 12px 14px;
  background: var(--af-bg);
}
.af-dash-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.af-dash-top .af-dash-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.af-dash-top p {
  font-size: 11.5px;
  color: var(--af-muted);
}
.af-dash-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.af-kpi {
  display: grid;
  gap: 2px;
  padding: 9px 10px;
  border-radius: 14px;
  border: 1px solid var(--af-line);
  background: var(--af-bg);
}
.af-kpi__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--af-ink);
}
.af-kpi__head svg {
  width: 13px;
  height: 13px;
  color: var(--af-muted);
  flex: none;
}
.af-kpi__val {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.af-kpi__sub {
  font-size: 10px;
  color: var(--af-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.af-tx-card {
  display: grid;
  gap: 6px;
  padding: 11px;
  border-radius: 16px;
  border: 1px solid var(--af-line);
  background: var(--af-bg);
}
.af-tx-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.af-tx-card__head b {
  font-size: 13px;
  font-weight: 600;
}
.af-tx-card__head span {
  display: block;
  font-size: 11px;
  color: var(--af-muted);
}
.af-tx-list {
  display: grid;
}
.af-tx-row {
  display: grid;
  gap: 2px;
  padding: 6px 0;
  border-top: 1px solid var(--af-line);
}
.af-tx-row__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.af-tx-row__name {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.af-tx-row__amt {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.af-tx-row__amt--neg {
  color: var(--af-red);
}
.af-tx-row__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  color: var(--af-muted);
}
.af-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid var(--af-line-strong);
  background: var(--af-bg);
  color: var(--af-ink);
}
.af-badge--income {
  border-color: transparent;
  background: var(--af-muted-bg);
}

/* Tab 1 Category & Ledger Filter Mock */
.af-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--af-line);
  background: #fafafa;
}
.af-cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 10px 12px 2px;
}

.app-frame .af-drawer > button.loop-pause {
  bottom: 58px;
  right: 14px;
}
@media (max-width: 1023px) {
  .app-frame {
    grid-template-columns: minmax(0, 1fr);
  }
  .af-dash-wrap {
    border-right: 0;
    border-bottom: 1px solid var(--af-line);
  }
}
@media (max-width: 820px) {
  .af-dash-wrap {
    grid-template-columns: minmax(0, 1fr);
  }
  .af-sidebar {
    display: none;
  }
}
@media (max-width: 639px) {
  .af-dash-kpis {
    grid-template-columns: minmax(0, 1fr);
  }
  .af-receipts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }
}

#multimodal .panel {
  --p-h: 340px;
  overflow: hidden;
}
#multimodal .ui.af-drawer {
  width: 100%;
  max-width: 100%;
}
#multimodal .at-corner.fit {
  width: min(452px, calc(100% - 28px));
}
@media (max-width: 639px) {
  #multimodal.g2:not(.g2m) > .wrap {
    row-gap: 14px;
  }
  #multimodal .grid {
    row-gap: 18px;
  }
  #multimodal .group > .section-head {
    margin-bottom: 14px;
  }
  #multimodal .card {
    gap: 6px;
  }
  #multimodal .panel {
    --p-h: 196px;
  }
  #multimodal .at-corner.fit {
    width: calc(100% - 16px);
    left: 8px;
    top: 8px;
  }
  #multimodal .af-chat-head__history,
  #multimodal .af-chat-head__desc,
  #multimodal .af-message__name,
  #multimodal .af-composer__hint,
  #multimodal .af-audio-card__bar,
  #multimodal .af-ephemeral-tag,
  #multimodal .af-receipt-paper small,
  #multimodal .card--multimodal-voice .af-chat-head {
    display: none;
  }
  #multimodal .af-receipts-wrap {
    padding: 6px 9px;
    gap: 5px;
  }
  #multimodal .af-receipt-thumb {
    padding: 5px;
    gap: 3px;
  }
  #multimodal .af-receipt-paper {
    padding: 4px 5px;
  }
  #multimodal .af-avatar {
    width: 22px;
    height: 22px;
    font-size: 10px;
    margin-top: 2px;
  }
  #multimodal .af-thread--compact {
    padding: 5px 9px;
    gap: 4px;
  }
  #multimodal .af-bubble {
    padding: 4px 9px;
    font-size: 11.5px;
  }
  #multimodal .af-rec-strip {
    padding: 4px 7px;
  }
  #multimodal .af-composer {
    padding: 5px 8px;
    gap: 4px;
  }
  #multimodal .ui-note {
    min-height: 46px;
    padding: 5px 10px;
  }
  #multimodal .card--row > h3 {
    margin-bottom: 2px;
  }
  #multimodal .card--row > p {
    font-size: 13.5px;
    line-height: 1.38;
  }
}

#alur .mo-pc__visual--lit {
  overflow: hidden;
}
#alur .mo-pc__visual--lit > .ui {
  width: min(100%, 380px);
}
@media (max-width: 959px) {
  #alur .mo-pc__visual--lit {
    padding: 10px;
  }
  #alur .mo-pc__visual--lit .af-chat-head {
    display: none;
  }
  #alur .mo-pc__visual--lit > .ui {
    width: 100%;
    max-width: 380px;
  }
}
@media (max-width: 639px) {
  #alur .mo-pc__steps {
    gap: var(--s-4);
    margin-top: var(--s-4);
  }
  #alur .mo-pc__visual {
    max-height: 148px;
  }
  #keamanan .dg-box {
    min-height: 180px;
    height: 196px;
    padding: var(--s-3) !important;
  }
  #keamanan .rows > li {
    padding-block: var(--s-2);
  }
  #keamanan .rows > li > p {
    font-size: 14px;
    line-height: 1.4;
  }
  #keamanan .stack-6 > * + * {
    margin-top: var(--s-3);
  }
  #keamanan .grid {
    gap: var(--s-4);
  }
}

.faq > :is(.faq__item, details) {
  padding: var(--s-4) 0;
}
.dg-box {
  width: 100%;
  min-height: 380px;
}
@media (max-width: 639px) {
  .dg-box {
    min-height: 300px;
  }
}

.tour-panel-grid {
  margin-top: var(--s-6);
}
.tour-stage {
  width: 100%;
  min-height: 360px;
  padding: clamp(16px, 3vw, 28px);
}
.tour-stage > .ui {
  width: 100%;
  max-width: 520px;
}
@media (max-width: 639px) {
  .tour-stage {
    min-height: 300px;
    padding: 14px;
  }
}

.legal-main {
  padding-top: calc(var(--nav-h, 72px) + var(--s-8));
  padding-bottom: var(--s-9);
}
.legal-article {
  max-width: 68ch;
  display: grid;
  gap: var(--s-6);
}
.legal-article section {
  display: grid;
  gap: var(--s-3);
  padding-top: var(--s-5);
  border-top: 1px solid var(--line);
}
.legal-article h2 {
  font: 500 var(--t-h3)/1.3 var(--font-display);
  letter-spacing: var(--display-tracking);
}
.legal-article ul {
  display: grid;
  gap: var(--s-2);
  padding-left: 1.25rem;
  list-style: disc;
  color: var(--ink);
}
`
