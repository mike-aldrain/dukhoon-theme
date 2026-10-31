/**
 * Cinematic Hero (home block `mj-hero`).
 *
 * A deep oud field (or a colour field the merchant picks) with a giant outlined word, the headline (one
 * word can be highlighted in cream with an ink outline), two pill buttons, and the
 * drag-to-spin turntable (HeroStage) with a spinning sticker and a price sticker that links
 * to a real store product.
 *
 * LCP: the turntable's first frame is a plain priority <img> and the copy is
 * server-rendered visible; its entrance is CSS, so nothing waits for hydration.
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { urlOf, useBlockText } from './shared';
import { HeroStage } from './HeroStage';

export interface CinematicHeroData {
  overline?: unknown;
  title?: unknown;
  highlight?: unknown;
  subtitle?: unknown;
  giant?: unknown;
  sticker?: unknown;
  sticker_badge?: unknown;
  image?: string;
  mobile_image?: string;
  frames_url?: unknown;
  frames_count?: unknown;
  /** Picked products: the first one fills the price sticker (latest product when empty). */
  products?: unknown;
  field?: unknown;
  cta_primary_text?: unknown;
  cta_primary_url?: unknown;
  cta_secondary_text?: unknown;
  cta_secondary_url?: unknown;
  position?: number;
  [key: string]: unknown;
}

const FIELDS = ['oud', 'saffron', 'coral', 'rose', 'lilac', 'emerald', 'plum'] as const;
const choice = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => {
  const raw = Array.isArray(v) ? v[0] : v;
  const val = typeof raw === 'object' && raw ? (raw as { value?: unknown }).value : raw;
  return (allowed as readonly unknown[]).includes(val) ? (val as T) : d;
};

/** Split the title around the highlighted word, if it appears in it. */
function withHighlight(title: string, word: string) {
  const at = word ? title.indexOf(word) : -1;
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <em>{word}</em>
      {title.slice(at + word.length)}
    </>
  );
}

export function CinematicHero({ data }: { data: CinematicHeroData }) {
  const tx = useBlockText();
  // The engine numbers blocks from 1 (`position: index + 1`).
  const isLead = (data.position ?? 1) === 1;
  const field = choice(data.field, FIELDS, 'oud');

  const overline = tx(data.overline, 'mj.hero.overline', 'House of oud · 2026 edition');
  const title = tx(data.title, 'mj.hero.title', 'Oud that stays after you');
  const highlight = tx(data.highlight, 'mj.hero.highlight', 'stays');
  const subtitle = tx(
    data.subtitle,
    'mj.hero.subtitle',
    'Oud Royal: aged Cambodian oud with a touch of saffron. Twelve hours on skin.'
  );
  const giant = tx(data.giant, 'mj.hero.giant', 'Oud');
  const sticker = tx(data.sticker, 'mj.hero.sticker', '');
  const stickerBadge = tx(data.sticker_badge, 'mj.hero.sticker_badge', '');
  const primary = { label: tx(data.cta_primary_text, 'mj.hero.cta_primary', 'Shop the oud'), url: urlOf(data.cta_primary_url) || '/products' };
  const secondary = { label: tx(data.cta_secondary_text, 'mj.hero.cta_secondary', 'Watch the film'), url: urlOf(data.cta_secondary_url) };

  // One H1 per page: the lead hero carries it, a hero placed lower uses H2.
  const Title = isLead ? 'h1' : 'h2';

  return (
    <section className={`mj-hero mj-field--${field}${isLead ? ' mj-hero--lead' : ''}`} aria-label={title}>
      {giant && (
        <span className="mj-hero__giant" aria-hidden="true">
          {giant}
        </span>
      )}
      <div className="mj-container mj-hero__inner">
        <div className="mj-hero__copy">
          {overline && <p className="mj-eyebrow">{overline}</p>}
          <Title className="mj-hero__title">{withHighlight(title, highlight)}</Title>
          {subtitle && <p className="mj-hero__subtitle">{subtitle}</p>}
          <div className="mj-hero__ctas">
            <Link to={primary.url} className="mj-btn mj-btn--ink">
              {primary.label}
              <svg className="mj-icon-flip" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" fill="none" />
              </svg>
            </Link>
            {secondary.url && (
              <Link to={secondary.url} className="mj-btn mj-btn--ghost">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>

        <HeroStage
          products={data.products}
          framesUrl={urlOf(data.frames_url)}
          framesCount={Number(data.frames_count) || 0}
          image={data.image}
          mobileImage={data.mobile_image}
          sticker={sticker}
          stickerBadge={stickerBadge}
          label={title}
          priority={isLead}
        />
      </div>
    </section>
  );
}
