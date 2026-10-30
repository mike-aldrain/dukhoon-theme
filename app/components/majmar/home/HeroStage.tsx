/**
 * HeroStage: the 3D still life beside the hero copy.
 *
 * Server render and first paint show the light CSS/SVG still life (or the merchant's
 * product render), so LCP never waits for WebGL. After the page is idle, and only when
 * 3D is allowed (block switch on, motion not "off", no reduced-motion request, no
 * data-saver, WebGL available), the Three.js scene is imported as its own chunk and
 * fades in over the fallback.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMajmar } from '../../../hooks/useMajmar';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { MjArt } from './shared';

interface HeroStageProps {
  productImage?: string;
  /** Block switch `webgl` (default on). */
  webgl: boolean;
}

function canUseWebGL(): boolean {
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

const whenIdle = (fn: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 2500 });
  else window.setTimeout(fn, 1200);
};

export function HeroStage({ productImage, webgl }: HeroStageProps) {
  const { motion } = useMajmar();
  const motionAllowed = useMotionAllowed();
  const { isRTL } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !webgl || motion === 'off' || !motionAllowed || !canUseWebGL()) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const start = () =>
      whenIdle(() => {
        import('../../../lib/heroScene')
          .then(({ mountHeroScene }) => {
            if (cancelled) return;
            const accent = getComputedStyle(canvas).getPropertyValue('--mj-gold-rgb') || '212 163 90';
            dispose = mountHeroScene(canvas, {
              bottle: !productImage,
              accent,
              rtl: isRTL,
              intensity: motion === 'subtle' ? 'subtle' : 'cinematic',
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
  }, [webgl, motion, motionAllowed, productImage, isRTL]);

  return (
    <div className={`mj-hero__stage${live ? ' is-live' : ''}${productImage ? ' has-render' : ''}`} aria-hidden="true">
      <div className="mj-hero__fallback">
        <div className="mj-hero__plinth" />
        {!productImage && (
          <div className="mj-hero__render">
            <MjArt kind="bottle" className="mj-hero__art" />
          </div>
        )}
        <div className="mj-hero__halo" />
      </div>
      <canvas ref={canvasRef} className="mj-hero__canvas" />
      {productImage && (
        <div className="mj-hero__render mj-hero__render--product">
          <img src={productImage} alt="" width={520} height={650} decoding="async" />
        </div>
      )}
    </div>
  );
}
