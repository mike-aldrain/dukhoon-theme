/**
 * Cinematic Hero (home block `mj-hero`).
 *
 * Full-bleed image or muted looping video with a slow Ken Burns, a radial studio
 * light behind the copy, an optional transparent product render floating in a
 * 1200px-perspective layer (parallax on fine pointers), and a thin gold line that
 * draws across as the page loads.
 *
 * LCP: the background image is `priority` (eager + fetchpriority high) and the copy
 * is server-rendered visible; its entrance is a CSS animation, not a JS reveal, so it
 * never waits for hydration. Video only starts after hydration and never for
 * reduced-motion visitors (the poster image stays).
 */
import { useEffect, useRef } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMajmar } from '../../../hooks/useMajmar';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { MjMedia, urlOf, useBlockText } from './shared';
import { HeroStage } from './HeroStage';

export interface CinematicHeroData {
  overline?: unknown;
  title?: unknown;
  subtitle?: unknown;
  image?: string;
  mobile_image?: string;
  video?: string;
  /** Picked products shown in the 3D showcase (latest products when empty). */
  products?: unknown;
  /** Block switch: WebGL 3D still life (default on). */
  webgl?: boolean;
  cta_primary_text?: unknown;
  cta_primary_url?: unknown;
  cta_secondary_text?: unknown;
  cta_secondary_url?: unknown;
  height?: unknown;
  align?: unknown;
  position?: number;
  [key: string]: unknown;
}

const HEIGHTS = ['full', 'tall', 'medium'] as const;
const first = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const choice = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => {
  const raw = first(v);
  const val = typeof raw === 'object' && raw ? (raw as { value?: unknown }).value : raw;
  return (allowed as readonly unknown[]).includes(val) ? (val as T) : d;
};

export function CinematicHero({ data }: { data: CinematicHeroData }) {
  const tx = useBlockText();
  const { motion } = useMajmar();
  const motionAllowed = useMotionAllowed();
  const stageRef = useRef<HTMLDivElement>(null);
  // The engine numbers blocks from 1 (`position: index + 1`).
  const isLead = (data.position ?? 1) === 1;
  const height = choice(data.height, HEIGHTS, 'full');
  const align = choice(data.align, ['start', 'center'] as const, 'start');
  const playVideo = !!data.video && motionAllowed && motion !== 'off';

  // Pointer parallax for the product render: fine pointers and cinematic motion only.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || motion !== 'cinematic' || !motionAllowed) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        stage.style.setProperty('--px', x.toFixed(3));
        stage.style.setProperty('--py', y.toFixed(3));
      });
    };
    const onLeave = () => {
      stage.style.setProperty('--px', '0');
      stage.style.setProperty('--py', '0');
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
    };
  }, [motion, motionAllowed]);

  const overline = tx(data.overline, 'mj.hero.overline', 'House of oud and amber');
  const title = tx(data.title, 'mj.hero.title', 'A scent that stays');
  const subtitle = tx(
    data.subtitle,
    'mj.hero.subtitle',
    'Oud oils, perfumes and bakhoor blended by hand, made to linger long after you leave.'
  );
  const primary = { label: tx(data.cta_primary_text, 'mj.hero.cta_primary', 'Discover the scents'), url: urlOf(data.cta_primary_url) || '/products' };
  const secondaryUrl = urlOf(data.cta_secondary_url);
  const secondary = { label: tx(data.cta_secondary_text, 'mj.hero.cta_secondary', 'Find your scent'), url: secondaryUrl };

  // One H1 per page: the lead hero carries it, a hero placed lower uses H2.
  const Title = isLead ? 'h1' : 'h2';

  return (
    <section
      ref={stageRef}
      className={`mj-hero mj-hero--${height} mj-hero--${align}${isLead ? ' mj-hero--lead' : ''}`}
      aria-label={title}
    >
      <div className="mj-hero__media" aria-hidden="true">
        <MjMedia
          src={data.image}
          mobileSrc={data.mobile_image}
          alt=""
          art="smoke"
          priority={isLead}
          sizes="100vw"
          className="mj-hero__img"
        />
        {playVideo && (
          <video
            className="mj-hero__video"
            src={data.video}
            poster={data.image}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}
        <span className="mj-hero__shade" />
        <span className="mj-hero__light" />
      </div>

      <div className="mj-container mj-hero__inner">
        <div className="mj-hero__copy">
          <p className="mj-overline mj-hero__overline">{overline}</p>
          <Title className="mj-display mj-hero__title">{title}</Title>
          {subtitle && <p className="mj-body-l mj-hero__subtitle">{subtitle}</p>}
          <div className="mj-hero__ctas">
            <Link to={primary.url} className="mj-btn mj-btn--gold">
              {primary.label}
              <svg className="mj-icon-flip" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </Link>
            {secondary.url && (
              <Link to={secondary.url} className="mj-btn mj-btn--ghost">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>

        <HeroStage products={data.products} webgl={data.webgl !== false} />
      </div>

      <span className="mj-hero__progress" aria-hidden="true" />
      <span className="mj-hero__scroll" aria-hidden="true" />
    </section>
  );
}
