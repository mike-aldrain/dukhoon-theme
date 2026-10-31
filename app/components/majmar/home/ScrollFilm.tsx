/**
 * Scroll Film (home block `mj-film`): a scroll-driven product film.
 *
 * The section is several screens tall; its stage stays pinned while the visitor scrolls,
 * and scroll position (0..1) plays the film. Sources, in order of preference:
 *   1. The merchant's frame sequence: `frames_url` with `{n}` and `frames_count`.
 *   2. The merchant's MP4 (`video`), scrubbed by setting currentTime.
 *   3. The film that ships with the theme: 80 frames (wide and phone framings) in which
 *      the flacon turns under a warm spotlight, its cap lifts toward the camera and
 *      gold smoke rises, rendered on the palette's own colour (emerald or oxblood).
 * Frames are drawn to a canvas and load progressively once the section is near.
 * Chapters fade in along the timeline, the copy switches between ink and cream to stay
 * readable on each field, and the buy panel for a real store product lands at the end.
 *
 * Server render, reduced motion and motion "off" get a static layout with the same copy
 * and buy panel. The film only starts after hydration.
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
import { framesFor } from '../../../lib/bundledFrames';
import { drawCover, expandPattern, fitCanvas, loadFrames, nearestLoaded } from '../../../lib/framePlayer';
import { openMiniCart } from '../MiniCart';
import { itemsOf, urlOf, useBlockText } from './shared';

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
  tone?: unknown;
  [key: string]: unknown;
}

const LENGTHS = { short: 3, medium: 4, long: 5.5 } as const;
const NARROW = '(max-width: 820px)';

const firstId = (raw: unknown): number | null => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(typeof v === 'object' && v ? ((v as { id?: unknown; value?: unknown }).id ?? (v as { value?: unknown }).value) : v);
  return Number.isFinite(n) && n > 0 ? n : null;
};
const choice = (raw: unknown): string => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return String(typeof v === 'object' && v ? (v as { value?: unknown }).value ?? '' : v ?? '');
};

export function ScrollFilm({ data }: { data: ScrollFilmData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const { format } = useMoney();
  const { motion, palette } = useMajmar();
  const bundled = framesFor(palette);
  const motionAllowed = useMotionAllowed();
  const hydrated = useHydrated();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const framesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const [active, setActive] = useState(-1);
  const [ended, setEnded] = useState(false);
  const [ink, setInk] = useState(false);
  const [adding, setAdding] = useState(false);

  const framesPattern = urlOf(data.frames_url);
  const framesCount = Math.min(400, Math.max(0, Math.round(Number(data.frames_count) || 0)));
  const videoUrl = urlOf(data.video);
  const source: 'frames' | 'video' | 'bundled' =
    framesPattern.includes('{n}') && framesCount > 1 ? 'frames' : videoUrl ? 'video' : 'bundled';
  // Merchant media: the merchant says whether it is bright (ink copy) or dark (cream copy).
  const tone = choice(data.tone) === 'bright' ? 'bright' : 'dark';
  const animate = hydrated && motionAllowed && motion !== 'off';
  const screens = LENGTHS[(choice(data.length) as keyof typeof LENGTHS) || 'long'] ?? LENGTHS.long;

  const chapters = useMemo(() => {
    const items = itemsOf<Chapter>(data.chapters, 'chapters');
    if (items.length) return items.slice(0, 5);
    return [1, 2, 3, 4].map((i) => ({
      title: t(`mj.film.ch${i}_title`, ['Blown by hand', 'Cambodian oud', 'Aged ten years', 'It stays with you'][i - 1]),
      text: t(`mj.film.ch${i}_text`, [
        'A heavy flacon of clear glass, its edges polished one by one.',
        'Oud wood from the forests of Cambodia, distilled slowly over a low fire.',
        'The oil rests in the dark until it rounds and clears.',
        'Twelve hours on skin, and the oud is still yours.',
      ][i - 1]),
    }));
  }, [data.chapters, t]);

  const productId = firstId(data.product);
  const { data: picked } = useQuery({
    ...productApi.queries.list({ source: productId ? 'selected' : 'latest', sourceValue: productId ? [productId] : undefined, perPage: 1 }),
  });
  const item = picked?.items?.[0];

  const onProgress = useCallback(
    (p: number) => {
      barRef.current?.style.setProperty('transform', `scaleX(${p.toFixed(4)})`);
      const n = chapters.length;
      const idx = p < 0.12 ? -1 : Math.min(n - 1, Math.floor(((p - 0.12) / 0.74) * n));
      setActive(p > 0.88 ? -1 : idx);
      setEnded(p > 0.88);
      // The bundled film is dark throughout; merchant media follows the tone setting.
      setInk(source !== 'bundled' && tone === 'bright');
      if (source === 'video') {
        const v = videoRef.current;
        if (v && v.duration && Math.abs(v.currentTime - p * v.duration) > 0.04) v.currentTime = p * v.duration;
        return;
      }
      const c = canvasRef.current;
      const frames = framesRef.current;
      if (c && frames.length) drawCover(c, nearestLoaded(frames, Math.round(p * (frames.length - 1))));
    },
    [chapters.length, source, tone]
  );

  // Progress from scroll, eased toward the target so the film glides between frames.
  useEffect(() => {
    if (!animate) return;
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    let shown = -1;
    let target = 0;
    const measure = () => {
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const tick = () => {
      raf = 0;
      shown = shown < 0 ? target : shown + (target - shown) * 0.16;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      onProgress(shown);
      if (shown !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('mj:film-frame', onScroll);
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('mj:film-frame', onScroll);
    };
  }, [animate, onProgress]);

  // Frames load once the section is a screen away.
  useEffect(() => {
    if (!animate || source === 'video') return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    let cancelLoad: (() => void) | undefined;
    const redraw = () => window.dispatchEvent(new Event('mj:film-frame'));
    const start = () => {
      fitCanvas(canvas);
      const narrow = window.matchMedia(NARROW).matches;
      const urls = source === 'frames' ? expandPattern(framesPattern, framesCount) : narrow ? bundled.filmTall : bundled.filmWide;
      const loaded = loadFrames(urls, redraw);
      framesRef.current = loaded.frames;
      cancelLoad = loaded.cancel;
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
    const onResize = () => {
      fitCanvas(canvas);
      redraw();
    };
    window.addEventListener('resize', onResize);
    return () => {
      io.disconnect();
      cancelLoad?.();
      framesRef.current = [];
      window.removeEventListener('resize', onResize);
    };
  }, [animate, source, framesPattern, framesCount, bundled]);

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
      <p className="mj-film__buy-over">{tx(data.buy_overline, 'mj.film.buy_overline', 'Available now')}</p>
      <h3 className="mj-film__buy-name">{item.name}</h3>
      <p className="mj-film__price">
        {format(Number(price))}
        {item.is_on_sale && item.sale_price ? <s>{format(Number(item.regular_price ?? item.price))}</s> : null}
      </p>
      <div className="mj-film__actions">
        <button type="button" className="mj-btn mj-btn--ink" onClick={addToBag} disabled={adding} aria-busy={adding}>
          {t('mj.film.add', 'Add to bag')}
        </button>
        {item.url && (
          <Link to={item.url} className="mj-btn mj-btn--ghost">
            {t('mj.film.details', 'View details')}
          </Link>
        )}
      </div>
    </div>
  );

  if (!animate) {
    const poster = source === 'bundled' ? bundled.filmWide[Math.round(bundled.filmWide.length * 0.3)] : '';
    return (
      <section className="mj-film mj-film--static" aria-label={title}>
        <div className="mj-container mj-film__static">
          <div className="mj-film__poster">
            {videoUrl ? (
              <video src={videoUrl} muted playsInline preload="metadata" />
            ) : poster ? (
              <img src={poster} alt="" loading="lazy" width={1280} height={720} />
            ) : item?.image?.url ? (
              <img src={item.image.url} alt="" loading="lazy" />
            ) : null}
          </div>
          <div className="mj-film__static-copy">
            <p className="mj-eyebrow">{overline}</p>
            <h2 className="mj-film__title">{title}</h2>
            <ol className="mj-film__list">
              {chapters.map((c, i) => (
                <li key={i}>
                  <span className="mj-film__num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{tx(c.title, '', '')}</h3>
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
      className={`mj-film${ended ? ' is-ended' : ''}${ink ? ' is-ink' : ''}`}
      style={{ height: `${screens * 100}svh` }}
      aria-label={title}
    >
      <div className="mj-film__pin">
        {source === 'video' ? (
          <video ref={videoRef} className="mj-film__media" src={videoUrl} muted playsInline preload="auto" />
        ) : (
          <canvas ref={canvasRef} className="mj-film__media" aria-hidden="true" />
        )}

        <p className="mj-film__count" aria-hidden="true">
          {String(Math.max(1, active + 1)).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
        </p>

        <header className={`mj-film__intro${active === -1 && !ended ? ' is-in' : ''}`}>
          <p className="mj-film__over">{overline}</p>
          <h2 className="mj-film__title">{title}</h2>
          <p className="mj-film__hint">{t('mj.film.hint', 'Scroll to play')}</p>
        </header>

        <div className="mj-film__chapters" aria-live="polite">
          {chapters.map((c, i) => (
            <div key={i} className={`mj-film__chapter${active === i ? ' is-in' : ''}`} aria-hidden={active !== i}>
              <p className="mj-film__over">
                {String(i + 1).padStart(2, '0')} · {overline}
              </p>
              <h3 className="mj-film__chapter-title">{tx(c.title, '', '')}</h3>
              <p className="mj-film__chapter-text">{tx(c.text, '', '')}</p>
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
