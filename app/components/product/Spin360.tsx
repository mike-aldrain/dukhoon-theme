/**
 * Spin360: optional 360° viewer for the product page.
 *
 * Shown when the merchant turns on `mj_pdp_360` and the product has at least
 * `mj_pdp_360_min_frames` images; the images are treated as an ordered frame
 * sequence. A "360°" button opens a <dialog>; dragging (pointer or touch) or the
 * arrow keys step through frames, and the visitor can also use the range slider.
 * Frames load only when the dialog opens. Drag direction follows the reading direction.
 */
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMajmar } from '../../hooks/useMajmar';

export function Spin360({ product }: { product: Product }) {
  const { pdp } = useMajmar();
  const { t, isRTL } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState(0);
  const drag = useRef<{ x: number; start: number } | null>(null);

  const frames = (product.images ?? []).map((img) => img.url).filter((u): u is string => !!u);
  const enabled = pdp.spin && frames.length >= pdp.spinMinFrames;

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Warm the frame cache once the viewer opens.
  useEffect(() => {
    if (!open) return;
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [open, frames]);

  if (!enabled) return null;

  const step = (n: number) => setFrame((f) => (f + n + frames.length) % frames.length);
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: frame };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.x) * (isRTL ? -1 : 1);
    const offset = Math.round(dx / 12);
    setFrame((((drag.current.start + offset) % frames.length) + frames.length) % frames.length);
  };
  const onUp = () => (drag.current = null);

  return (
    <>
      <button type="button" className="mj-btn mj-btn--ghost mj-spin-launch" onClick={() => setOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" stroke="currentColor" strokeWidth="1.3" fill="none" />
        </svg>
        {t('mj.pdp.spin_open', 'View in 360°')}
      </button>
      <dialog
        ref={dialogRef}
        className="mj-lightbox mj-spin"
        aria-label={t('mj.pdp.spin_label', '360° view of {{name}}', { name: product.name })}
        onClose={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') step(isRTL ? -1 : 1);
          if (e.key === 'ArrowLeft') step(isRTL ? 1 : -1);
        }}
      >
        {open && (
          <div className="mj-spin__stage">
            <div
              className="mj-spin__frame"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              <img src={frames[frame]} alt={product.name} draggable={false} />
            </div>
            <label className="mj-spin__range">
              <span className="mj-sr-only">{t('mj.pdp.spin_angle', 'Rotation')}</span>
              <input
                type="range"
                min={0}
                max={frames.length - 1}
                value={frame}
                onChange={(e) => setFrame(Number(e.target.value))}
              />
            </label>
            <p className="mj-caption">{t('mj.pdp.spin_hint', 'Drag or use the arrow keys to turn the piece.')}</p>
          </div>
        )}
        <button type="button" className="mj-lightbox__close mj-icon-btn" aria-label={t('mj.close', 'Close')} onClick={() => setOpen(false)}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </dialog>
    </>
  );
}
