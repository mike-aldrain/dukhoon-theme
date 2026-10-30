/**
 * Shared pieces for the Majmar home blocks:
 * - `MjArt`: placeholder still-life art drawn in SVG with the palette tokens. Shown
 *   whenever a merchant image is missing, so a fresh install looks finished and no
 *   stock photo is ever hotlinked.
 * - `MjMedia`: the engine `Image` (srcset, lazy, aspect box) or `MjArt` as fallback.
 * - `SectionHead`: overline, headline with mask wipe, gold rule and optional link.
 * - `useBlockText`: reads multilanguage block fields for the current locale.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { text } from '../../../lib/majmarSettings';

export type ArtKind = 'bottle' | 'flacon' | 'mabkhara' | 'oud' | 'rose' | 'giftbox' | 'smoke';

const ART_KINDS: ArtKind[] = ['bottle', 'mabkhara', 'flacon', 'oud', 'giftbox', 'rose'];

/** Pick a placeholder deterministically from a position. */
export const artFor = (i: number): ArtKind => ART_KINDS[Math.abs(i) % ART_KINDS.length];

/**
 * Placeholder still life: a stone plinth, warm studio light, curling smoke and one
 * perfume-house object, drawn in palette tokens. Shown until the merchant adds images.
 */
export function MjArt({ kind = 'bottle', className = '' }: { kind?: ArtKind; className?: string }) {
  const id = `mj-${kind}`;
  const smoke = (
    <g fill="none" stroke="rgb(var(--mj-ivory-rgb))" strokeLinecap="round" opacity="0.16">
      <path d="M200 150c-30-30 20-50 0-80s-10-50 10-70" strokeWidth="5">
        <animate attributeName="d" dur="9s" repeatCount="indefinite"
          values="M200 150c-30-30 20-50 0-80s-10-50 10-70;M200 150c25-30-25-50 0-80s15-50-10-70;M200 150c-30-30 20-50 0-80s-10-50 10-70" />
      </path>
      <path d="M215 160c20-40-30-60-5-100" strokeWidth="3" opacity="0.7" />
    </g>
  );
  return (
    <svg className={`mj-art ${className}`} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-light`} cx="50%" cy="34%" r="66%">
          <stop offset="0" stopColor="rgb(var(--mj-gold-rgb))" stopOpacity="0.32" />
          <stop offset="1" stopColor="rgb(var(--mj-bg-rgb))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--mj-gold-hover-rgb))" />
          <stop offset="0.5" stopColor="rgb(var(--mj-gold-rgb))" />
          <stop offset="1" stopColor="rgb(var(--mj-copper-rgb))" />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgb(var(--mj-copper-rgb))" />
          <stop offset="0.45" stopColor="rgb(var(--mj-gold-hover-rgb))" />
          <stop offset="1" stopColor="rgb(var(--mj-copper-rgb))" />
        </linearGradient>
        <linearGradient id={`${id}-stone`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgb(var(--mj-raised-rgb))" />
          <stop offset="0.5" stopColor="rgb(var(--mj-surface-rgb))" />
          <stop offset="1" stopColor="rgb(var(--mj-raised-rgb))" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="rgb(var(--mj-surface-rgb))" />
      <rect width="400" height="500" fill={`url(#${id}-light)`} />
      {kind !== 'smoke' && (
        <>
          <path d="M60 385h280l20 115H40z" fill={`url(#${id}-stone)`} />
          <path d="M60 385h280" stroke="rgb(var(--mj-gold-rgb))" strokeOpacity="0.55" />
          <ellipse cx="200" cy="387" rx="95" ry="9" fill="#000" fillOpacity="0.35" />
        </>
      )}
      {(kind === 'mabkhara' || kind === 'smoke' || kind === 'oud') && smoke}
      {kind === 'bottle' && (
        <g>
          <rect x="182" y="196" width="36" height="40" rx="4" fill={`url(#${id}-brass)`} />
          <path d="M148 250q0-14 14-14h76q14 0 14 14v122q0 13-13 13h-78q-13 0-13-13z" fill={`url(#${id}-glass)`} fillOpacity="0.88" />
          <path d="M160 252h14v116h-14z" fill="#fff" fillOpacity="0.2" rx="7" />
          <rect x="168" y="300" width="64" height="30" fill="rgb(var(--mj-bg-rgb))" fillOpacity="0.5" />
        </g>
      )}
      {kind === 'flacon' && (
        <g>
          <circle cx="200" cy="168" r="18" fill={`url(#${id}-brass)`} />
          <rect x="190" y="184" width="20" height="34" fill={`url(#${id}-brass)`} />
          <path d="M200 218c-50 0-62 40-62 86s20 81 62 81 62-35 62-81-12-86-62-86z" fill={`url(#${id}-glass)`} fillOpacity="0.85" />
          <path d="M165 260c-8 30-6 70 8 96" stroke="#fff" strokeOpacity="0.25" strokeWidth="8" fill="none" strokeLinecap="round" />
        </g>
      )}
      {kind === 'mabkhara' && (
        <g>
          <path d="M150 230h100l-14 50h-72z" fill={`url(#${id}-brass)`} />
          <path d="M140 222h120v12H140z" fill={`url(#${id}-brass)`} />
          <path d="M186 280h28l10 70h-48z" fill={`url(#${id}-brass)`} fillOpacity="0.9" />
          <path d="M160 350h80l10 34h-100z" fill={`url(#${id}-brass)`} />
          <circle cx="188" cy="220" r="6" fill="rgb(var(--mj-gold-hover-rgb))" />
          <circle cx="210" cy="218" r="5" fill="#E86A3A" fillOpacity="0.8" />
        </g>
      )}
      {kind === 'oud' && (
        <g fill={`url(#${id}-glass)`}>
          <path d="M120 372l40-20 30 8-36 22z" />
          <path d="M175 376l26-30 34 10-22 28z" fillOpacity="0.9" />
          <path d="M228 380l30-26 30 14-28 20z" fillOpacity="0.8" />
          <path d="M150 352l24-34 26 12-22 30z" fillOpacity="0.75" />
        </g>
      )}
      {kind === 'rose' && (
        <g>
          <path d="M200 385V240" stroke="rgb(var(--mj-copper-rgb))" strokeWidth="5" />
          <path d="M200 300c-30-10-46 6-50 20 22 4 40-4 50-20z" fill="rgb(var(--mj-copper-rgb))" />
          <circle cx="200" cy="222" r="38" fill={`url(#${id}-glass)`} />
          <path d="M182 222c6-18 30-18 36 0-6 12-30 12-36 0z" fill="rgb(var(--mj-bg-rgb))" fillOpacity="0.35" />
        </g>
      )}
      {kind === 'giftbox' && (
        <g>
          <rect x="120" y="262" width="160" height="122" rx="6" fill="rgb(var(--mj-raised-rgb))" />
          <rect x="112" y="242" width="176" height="28" rx="5" fill="rgb(var(--mj-raised-rgb))" stroke="rgb(var(--mj-gold-rgb))" strokeOpacity="0.4" />
          <rect x="190" y="242" width="20" height="142" fill={`url(#${id}-brass)`} />
          <path d="M200 242c-30-36-62-20-46 0zM200 242c30-36 62-20 46 0z" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="8" />
        </g>
      )}
    </svg>
  );
}

interface MjMediaProps {
  src?: string | null;
  mobileSrc?: string | null;
  alt: string;
  ratio?: string;
  art?: ArtKind;
  priority?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}

/** A merchant image through the engine Image (srcset, lazy), or placeholder art. */
export function MjMedia({ src, mobileSrc, alt, ratio, art = 'bottle', priority, sizes, className = '' }: MjMediaProps) {
  if (!src) {
    return (
      <div className={`mj-media mj-media--art ${className}`} data-ratio={ratio}>
        <MjArt kind={art} />
      </div>
    );
  }
  return (
    <div className={`mj-media ${className}`} data-ratio={ratio}>
      <Image
        src={src}
        mobileSrc={mobileSrc ?? undefined}
        alt={alt}
        priority={priority}
        objectFit="cover"
        srcSetWidths={[480, 768, 1080, 1440, 1920]}
        sizes={sizes ?? '100vw'}
        noWrapper
      />
    </div>
  );
}

interface SectionHeadProps {
  overline?: string;
  title?: string;
  as?: 'h1' | 'h2';
  link?: { url: string; label: string } | null;
  align?: 'start' | 'center';
  children?: ReactNode;
}

/** Overline, headline (mask wipe on reveal), gold rule, optional "view all" link. */
export function SectionHead({ overline, title, as: Tag = 'h2', link, align = 'start', children }: SectionHeadProps) {
  if (!title && !overline) return null;
  return (
    <header className={`mj-head mj-head--${align}`}>
      <div className="mj-head__text">
        {overline && (
          <p className="mj-overline" data-mj-reveal="">
            {overline}
          </p>
        )}
        {title && (
          <Tag className="mj-h2" data-mj-wipe="">
            {title}
          </Tag>
        )}
        <span className="mj-rule" aria-hidden="true" />
        {children}
      </div>
      {link && link.url && (
        <Link to={link.url} className="mj-head__link mj-link">
          {link.label}
        </Link>
      )}
    </header>
  );
}

/** Text from a (possibly multilanguage) block field, with a translated fallback. */
export function useBlockText() {
  const { t, locale } = useTranslation();
  return (raw: unknown, key: string, fallback: string) => text(raw, locale, t(key, fallback));
}

/** Read a URL field (string, or `{ url }` / `{ value }` from a link picker). */
export function urlOf(raw: unknown): string {
  if (typeof raw === 'string') return raw.trim();
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const v = o.url ?? o.value ?? o.link;
    return typeof v === 'string' ? v : '';
  }
  return '';
}

/** A collection field as an array of plain objects (tolerates `slides.image` style keys). */
export function itemsOf<T extends object>(raw: unknown, prefix: string): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const out: Record<string, unknown> = {};
    Object.entries((item ?? {}) as Record<string, unknown>).forEach(([k, v]) => {
      out[k.startsWith(`${prefix}.`) ? k.slice(prefix.length + 1) : k] = v;
    });
    return out as T;
  });
}
