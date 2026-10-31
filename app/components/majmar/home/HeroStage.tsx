/**
 * HeroStage: the drag-to-spin turntable beside the hero copy.
 *
 * Plays a 40-frame turn of the flacon on a canvas: it spins slowly on its own, and the
 * visitor can drag it (or use the arrow keys) to turn it, with inertia. The frames are the
 * merchant's own sequence (`frames_url` with `{n}` + `frames_count`) or the sequence that
 * ships with the theme. A merchant image (`image`) replaces the turntable with a still.
 *
 * First paint is the first frame as a plain <img> (the LCP element on the lead hero), so
 * nothing waits for script. The canvas takes over after hydration, and only when motion
 * is allowed. The loop pauses while the stage is off screen.
 *
 * The price sticker links to a real store product: the first product picked in the block,
 * or the latest product.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMajmar } from '../../../hooks/useMajmar';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { usePickedProducts } from '../../../hooks/useStoreProducts';
import { framesFor } from '../../../lib/bundledFrames';
import { drawCover, expandPattern, fitCanvas, loadFrames } from '../../../lib/framePlayer';
import { priceOf } from './conversionUtils';

interface HeroStageProps {
  products?: unknown;
  framesUrl?: string;
  framesCount?: number;
  image?: string;
  mobileImage?: string;
  sticker: string;
  stickerBadge: string;
  label: string;
  priority: boolean;
}

const NARROW = '(max-width: 820px)';

export function HeroStage({ products: field, framesUrl, framesCount = 0, image, mobileImage, sticker, stickerBadge, label, priority }: HeroStageProps) {
  const { motion, palette } = useMajmar();
  const motionAllowed = useMotionAllowed();
  const { t } = useTranslation();
  const { format } = useMoney();
  const pathId = useId().replace(/:/g, '');
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const { products } = usePickedProducts(field, 1);
  const product = products[0];

  const merchant = framesUrl && framesUrl.includes('{n}') && framesCount > 1 ? expandPattern(framesUrl, Math.min(framesCount, 120)) : null;
  const useStill = !!image;
  const bundled = framesFor(palette);
  const wide = merchant ?? bundled.loopWide;
  const tall = merchant ?? bundled.loopTall;
  const spin = motion !== 'off' && motionAllowed && !useStill;

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!spin || !stage || !canvas) return;
    const urls = window.matchMedia(NARROW).matches ? tall : wide;
    const n = urls.length;
    const { frames, cancel } = loadFrames(urls);
    const cruise = motion === 'subtle' ? 0.06 : 0.12; // frames per animation frame
    let angle = 0;
    let vel = cruise;
    let dragging = false;
    let lastX = 0;
    let raf = 0;
    let visible = true;
    let shown = -1;
    const dir = document.documentElement.dir === 'rtl' ? -1 : 1;

    fitCanvas(canvas);
    const tick = () => {
      raf = 0;
      if (!dragging) {
        angle += vel;
        vel += (cruise - vel) * 0.03;
      }
      const i = ((Math.round(angle) % n) + n) % n;
      if (i !== shown && drawCover(canvas, frames[i])) {
        shown = i;
        setLive(true);
      }
      if (visible) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      stage.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = (e.clientX - lastX) * dir;
      lastX = e.clientX;
      angle -= dx * 0.12;
      vel = -dx * 0.05;
      kick();
    };
    const onUp = () => {
      dragging = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      vel = (e.key === 'ArrowRight' ? 1 : -1) * dir * 0.9;
      kick();
    };
    const onResize = () => {
      fitCanvas(canvas);
      shown = -1;
      kick();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(stage);
    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    kick();
    return () => {
      cancel();
      cancelAnimationFrame(raf);
      io.disconnect();
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onUp);
      stage.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      setLive(false);
    };
    // The frame lists are fixed per render of the merchant settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin, motion, palette, framesUrl, framesCount]);

  const fetchPriority = priority ? { fetchPriority: 'high' as const } : {};
  const posterWide = useStill ? image : wide[0];
  const posterTall = useStill ? mobileImage || image : tall[0];

  return (
    <div
      ref={stageRef}
      className={`mj-hero__stage${live ? ' is-live' : ''}${spin ? ' is-spin' : ''}`}
      role={spin ? 'group' : undefined}
      aria-label={spin ? `${label}. ${t('mj.hero.drag', 'Drag to turn the bottle')}` : undefined}
      tabIndex={spin ? 0 : undefined}
    >
      <picture className="mj-hero__poster">
        {posterTall && posterTall !== posterWide && <source media={NARROW} srcSet={posterTall} />}
        <img
          src={posterWide}
          alt={spin ? '' : label}
          width={1100}
          height={1100}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...fetchPriority}
        />
      </picture>
      {spin && <canvas ref={canvasRef} className="mj-hero__canvas" aria-hidden="true" />}

      {sticker && (
        <svg className="mj-sticker mj-sticker--spin" viewBox="0 0 132 132" aria-hidden="true">
          <defs>
            <path id={pathId} d="M66 66m-48 0a48 48 0 1 1 96 0a48 48 0 1 1-96 0" />
          </defs>
          <circle cx="66" cy="66" r="64" />
          <text>
            <textPath href={`#${pathId}`}>{`${sticker} ✦ ${sticker} ✦ `}</textPath>
          </text>
          {stickerBadge && (
            <text x="66" y="74" textAnchor="middle" className="mj-sticker__badge">
              {stickerBadge}
            </text>
          )}
        </svg>
      )}

      {product && (
        <Link to={product.url} className="mj-sticker mj-sticker--price">
          <span className="mj-sticker__name">{product.name}</span>
          <b>{format(priceOf(product))}</b>
          {product.is_on_sale && product.regular_price ? <s>{format(Number(product.regular_price))}</s> : null}
        </Link>
      )}

      {spin && <p className="mj-hero__hint" aria-hidden="true">{t('mj.hero.drag', 'Drag to turn the bottle')}</p>}
    </div>
  );
}
