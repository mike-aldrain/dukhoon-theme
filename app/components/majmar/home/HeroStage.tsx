/**
 * HeroStage: the 3D product showcase beside the hero copy.
 *
 * Shows the store's real products: the products picked in the hero block, or the latest
 * products. First paint (and reduced motion, data saver, no WebGL, block switch off)
 * is a CSS card with the front product's photo, its floor reflection and a gold halo, so
 * LCP never waits for WebGL. After load and idle time, the Three.js showcase
 * (lib/productScene) fades in over it and turns through the products. A caption under
 * the stage names the product in front, with its price and a link.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMajmar } from '../../../hooks/useMajmar';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { imageOf, usePickedProducts } from '../../../hooks/useStoreProducts';
import { priceOf } from './conversionUtils';
import { MjArt } from './shared';

interface HeroStageProps {
  /** Hero block field `products` (picked products), latest products when empty. */
  products?: unknown;
  /** Block switch `webgl` (default on). */
  webgl: boolean;
}

export function canUseWebGL(): boolean {
  try {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    if (nav.connection?.saveData) return false;
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return false;
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export const whenIdle = (fn: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2500 });
  else window.setTimeout(fn, 1200);
};

/** Theme tokens the scene needs, read from the element's computed style. */
export const sceneTokens = (el: Element) => {
  const cs = getComputedStyle(el);
  return {
    accent: cs.getPropertyValue('--mj-gold-rgb') || '200 149 46',
    background: cs.getPropertyValue('--mj-bg-rgb') || '251 248 243',
    surface: cs.getPropertyValue('--mj-surface-rgb') || '255 255 255',
  };
};

export function HeroStage({ products: field, webgl }: HeroStageProps) {
  const { motion } = useMajmar();
  const motionAllowed = useMotionAllowed();
  const { t, isRTL } = useTranslation();
  const { format } = useMoney();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [front, setFront] = useState(0);
  const { products } = usePickedProducts(field, 5);
  const images = products.map(imageOf);
  const key = images.join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !images.length || !webgl || motion === 'off' || !motionAllowed || !canUseWebGL()) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const start = () =>
      whenIdle(() => {
        import('../../../lib/productScene')
          .then(({ mountProductScene }) => {
            if (cancelled) return;
            dispose = mountProductScene(canvas, {
              images,
              ...sceneTokens(canvas),
              rtl: isRTL,
              intensity: motion === 'subtle' ? 'subtle' : 'cinematic',
              onFront: setFront,
            }).dispose;
            requestAnimationFrame(() => !cancelled && setLive(true));
          })
          .catch(() => undefined);
      });
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', start);
      dispose?.();
      setLive(false);
    };
    // `key` stands for the image list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, webgl, motion, motionAllowed, isRTL]);

  const current = products[front] ?? products[0];

  return (
    <div className={`mj-hero__stage${live ? ' is-live' : ''}`}>
      <div className="mj-hero__fallback" aria-hidden="true">
        <span className="mj-hero__halo" />
        <div className="mj-hero__card">
          {images[0] ? <img src={images[0]} alt="" width={680} height={850} decoding="async" crossOrigin="anonymous" /> : <MjArt kind="bottle" />}
        </div>
        <div className="mj-hero__card mj-hero__card--reflection">
          {images[0] ? <img src={images[0]} alt="" width={680} height={850} decoding="async" crossOrigin="anonymous" /> : null}
        </div>
      </div>
      <canvas ref={canvasRef} className="mj-hero__canvas" aria-hidden="true" />
      {current && (
        <Link to={current.url} className="mj-hero__caption" key={current.id}>
          <span className="mj-overline">{t('mj.hero.featured', 'Featured')}</span>
          <span className="mj-hero__caption-name">{current.name}</span>
          <span className="mj-hero__caption-price">{format(priceOf(current))}</span>
        </Link>
      )}
    </div>
  );
}
