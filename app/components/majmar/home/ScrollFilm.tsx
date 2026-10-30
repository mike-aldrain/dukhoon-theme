/**
 * Scroll Film (home block `mj-film`): a scroll-driven product film.
 *
 * The section is several screens tall; its stage stays pinned while the visitor scrolls,
 * and scroll position (0..1) plays the film. Three sources, in order of preference:
 *   1. Frame sequence: `frames_url` with `{n}` (e.g. .../frame-{n}.webp) and `frames_count`,
 *      drawn to a canvas. Frames load progressively once the section is near.
 *   2. MP4 video (`video`), scrubbed by setting currentTime.
 *   3. Default: the WebGL bottle in `scroll` mode (turn, cap lifts toward camera,
 *      push in, settle), so the block works with no merchant assets.
 * Chapters fade in along the timeline and the buy panel lands at the end.
 *
 * Server render, reduced motion, motion "off" and no-WebGL visitors get a static
 * layout with the same copy and buy panel. The film only starts after hydration.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMajmar } from '../../../hooks/useMajmar';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { useHydrated } from '../../../hooks/useHydrated';
import type { HeroSceneHandle } from '../../../lib/heroScene';
import { openMiniCart } from '../MiniCart';
import { itemsOf, MjArt, urlOf, useBlockText } from './shared';

interface Chapter {
  title?: unknown;
  text?: unknown;
}

export interface ScrollFilmData {
  overline?: unknown;
  title?: unknown;
  chapters?: unknown;
  product?: unknown;
  frames_url?: unknown;
  frames_count?: unknown;
  video?: unknown;
  length?: unknown;
  webgl?: boolean;
  [key: string]: unknown;
}

const LENGTHS = { short: 3, medium: 4, long: 5.5 } as const;

const firstId = (raw: unknown): number | null => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(typeof v === 'object' && v ? ((v as { id?: unknown; value?: unknown }).id ?? (v as { value?: unknown }).value) : v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const choice = (raw: unknown): string => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return String(typeof v === 'object' && v ? (v as { value?: unknown }).value ?? '' : v ?? '');
};

/** Draw an image into the canvas with object-fit: cover. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function ScrollFilm({ data }: { data: ScrollFilmData }) {
  const tx = useBlockText();
  const { t, isRTL } = useTranslation();
  const { format } = useMoney();
  const { motion } = useMajmar();
  const motionAllowed = useMotionAllowed();
  const hydrated = useHydrated();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(-1);
  const [ended, setEnded] = useState(false);
  const [adding, setAdding] = useState(false);

  const framesPattern = urlOf(data.frames_url);
  const framesCount = Math.min(400, Math.max(0, Math.round(Number(data.frames_count) || 0)));
  const videoUrl = urlOf(data.video);
  const source: 'frames' | 'video' | 'webgl' =
    framesPattern.includes('{n}') && framesCount > 1 ? 'frames' : videoUrl ? 'video' : 'webgl';
  const animate = hydrated && motionAllowed && motion !== 'off' && (source !== 'webgl' || data.webgl !== false);
  const screens = LENGTHS[(choice(data.length) as keyof typeof LENGTHS) || 'medium'] ?? LENGTHS.medium;

  const chapters = useMemo(() => {
    const items = itemsOf<Chapter>(data.chapters, 'chapters');
    if (items.length) return items.slice(0, 5);
    return [1, 2, 3, 4].map((i) => ({
      title: t(`mj.film.ch${i}_title`, ['Blown glass', 'Top: saffron and bergamot', 'Heart: Taif rose', 'Base: aged oud'][i - 1]),
      text: t(`mj.film.ch${i}_text`, [
        'Each flacon is mouth-blown and polished by hand.',
        'A bright, warm opening that greets you first.',
        'Rose from the Taif highlands, picked at dawn.',
        'Twelve hours on skin, and the scent is still yours.',
      ][i - 1]),
    }));
  }, [data.chapters, t]);

  const productId = firstId(data.product);
  const { data: picked } = useQuery({
    ...productApi.queries.list({ source: productId ? 'selected' : 'latest', sourceValue: productId ? [productId] : undefined, perPage: 1 }),
  });
  const item = picked?.items?.[0];

  // ---- Progress from scroll (rAF-throttled), feeding the active source.
  const sceneRef = useRef<HeroSceneHandle | null>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const onProgress = useCallback(
    (p: number) => {
      barRef.current?.style.setProperty('transform', `scaleX(${p.toFixed(4)})`);
      const n = chapters.length;
      const idx = p < 0.06 ? -1 : Math.min(n - 1, Math.floor(((p - 0.06) / 0.72) * n));
      setActive(p > 0.8 ? -1 : idx);
      setEnded(p > 0.8);
      if (source === 'webgl') sceneRef.current?.setProgress(p);
      else if (source === 'video') {
        const v = videoRef.current;
        if (v && v.duration && Math.abs(v.currentTime - p * v.duration) > 0.04) v.currentTime = p * v.duration;
      } else {
        const c = canvasRef.current;
        const frames = framesRef.current;
        if (!c || !frames.length) return;
        // Nearest loaded frame at or before the target.
        let i = Math.round(p * (framesCount - 1));
        while (i > 0 && !frames[i]?.complete) i--;
        const img = frames[i];
        const ctx = c.getContext('2d');
        if (img?.complete && img.naturalWidth && ctx) drawCover(ctx, img, c.width, c.height);
      }
    },
    [chapters.length, source, framesCount]
  );

  useEffect(() => {
    if (!animate) return;
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      onProgress(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [animate, onProgress]);

  // ---- Source setup once the section is near the viewport.
  useEffect(() => {
    if (!animate) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    let cancelled = false;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (source === 'frames') {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
      }
    };
    const start = () => {
      if (source === 'webgl') {
        import('../../../lib/heroScene')
          .then(({ mountHeroScene }) => {
            if (cancelled) return;
            const accent = getComputedStyle(canvas).getPropertyValue('--mj-gold-rgb') || '212 163 90';
            sceneRef.current = mountHeroScene(canvas, {
              bottle: true,
              accent,
              rtl: isRTL,
              intensity: motion === 'subtle' ? 'subtle' : 'cinematic',
              mode: 'scroll',
              plinth: false,
            });
            window.dispatchEvent(new Event('scroll'));
          })
          .catch(() => undefined);
      } else if (source === 'frames') {
        fit();
        const urls = Array.from({ length: framesCount }, (_, i) => framesPattern.replace('{n}', String(i + 1).padStart(4, '0')));
        // Load every 4th frame first for a quick coarse film, then fill the gaps.
        const order = [...urls.keys()].sort((a, b) => (a % 4) - (b % 4) || a - b);
        framesRef.current = new Array(framesCount);
        order.forEach((i, k) => {
          window.setTimeout(() => {
            if (cancelled) return;
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => i === 0 && window.dispatchEvent(new Event('scroll'));
            img.src = urls[i];
            framesRef.current[i] = img;
          }, k * 12);
        });
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        start();
      },
      { rootMargin: '100% 0px' }
    );
    io.observe(section);
    window.addEventListener('resize', fit);
    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener('resize', fit);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [animate, source, framesPattern, framesCount, isRTL, motion]);

  const addToBag = async () => {
    if (!item) return;
    setAdding(true);
    try {
      await window.salla?.cart?.addItem?.(Number(item.id), 1);
      openMiniCart();
    } catch {
      // Products with options need the product page.
      if (item.url) window.location.assign(item.url);
    } finally {
      setAdding(false);
    }
  };

  const overline = tx(data.overline, 'mj.film.overline', 'The film');
  const title = tx(data.title, 'mj.film.title', 'Inside the flacon');
  const price = item ? (item.is_on_sale && item.sale_price ? item.sale_price : item.price) : null;

  const buyPanel = item && (
    <div className={`mj-film__buy${ended || !animate ? ' is-in' : ''}`}>
      <p className="mj-overline">{tx(data.buy_overline, 'mj.film.buy_overline', 'Now available')}</p>
      <h3 className="mj-h2">{item.name}</h3>
      <p className="mj-film__price">
        {format(Number(price))}
        {item.is_on_sale && item.sale_price ? <s>{format(Number(item.regular_price ?? item.price))}</s> : null}
      </p>
      <div className="mj-film__actions">
        <button type="button" className="mj-btn mj-btn--gold" onClick={addToBag} disabled={adding} aria-busy={adding}>
          {t('mj.film.add', 'Add to bag')}
        </button>
        {item.url && (
          <Link to={item.url} className="mj-btn mj-btn--on-image">
            {t('mj.film.details', 'View details')}
          </Link>
        )}
      </div>
    </div>
  );

  if (!animate) {
    return (
      <section className="mj-film mj-film--static mj-stage-dark" aria-label={title}>
        <div className="mj-container mj-film__static">
          <div className="mj-film__poster">
            {videoUrl ? (
              <video src={videoUrl} muted playsInline preload="metadata" />
            ) : (
              <MjArt kind="flacon" />
            )}
          </div>
          <div className="mj-film__static-copy">
            <p className="mj-overline">{overline}</p>
            <h2 className="mj-h1">{title}</h2>
            <ol className="mj-film__list">
              {chapters.map((c, i) => (
                <li key={i}>
                  <span className="mj-film__num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="mj-h3">{tx(c.title, '', '')}</h3>
                    <p>{tx(c.text, '', '')}</p>
                  </div>
                </li>
              ))}
            </ol>
            {buyPanel}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`mj-film mj-stage-dark${ended ? ' is-ended' : ''}`}
      style={{ height: `${screens * 100}svh` }}
      aria-label={title}
    >
      <div className="mj-film__pin">
        {source === 'video' ? (
          <video ref={videoRef} className="mj-film__media" src={videoUrl} muted playsInline preload="auto" />
        ) : (
          <canvas ref={canvasRef} className="mj-film__media" aria-hidden="true" />
        )}
        <span className="mj-film__vignette" aria-hidden="true" />

        <header className={`mj-film__intro${active === -1 && !ended ? ' is-in' : ''}`}>
          <p className="mj-overline">{overline}</p>
          <h2 className="mj-display">{title}</h2>
          <p className="mj-film__hint">{t('mj.film.hint', 'Scroll to play')}</p>
        </header>

        <div className="mj-film__chapters" aria-live="polite">
          {chapters.map((c, i) => (
            <div key={i} className={`mj-film__chapter${active === i ? ' is-in' : ''}`} aria-hidden={active !== i}>
              <span className="mj-film__num">
                {String(i + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
              </span>
              <h3 className="mj-h1">{tx(c.title, '', '')}</h3>
              <p className="mj-body-l">{tx(c.text, '', '')}</p>
            </div>
          ))}
        </div>

        {buyPanel}

        <span className="mj-film__bar" aria-hidden="true">
          <span ref={barRef} />
        </span>
      </div>
    </section>
  );
}
