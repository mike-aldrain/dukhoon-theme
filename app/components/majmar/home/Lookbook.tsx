/**
 * Lookbook / Gallery (home block `mj-lookbook`).
 * CSS-columns masonry with a lightbox. The lightbox is a native <dialog> (focus is
 * trapped and Escape closes it by the browser), with previous/next buttons, arrow
 * keys (mirrored in RTL) and swipe. Focus returns to the tile that opened it.
 */
import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { artFor, itemsOf, MjArt, MjMedia, SectionHead, useBlockText } from './shared';

interface LookItem {
  image?: string;
  caption?: unknown;
}

export interface LookbookData {
  overline?: unknown;
  title?: unknown;
  images?: unknown;
  [key: string]: unknown;
}

const RATIOS = ['4/5', '1/1', '3/4', '4/5', '2/3', '1/1'];

export function Lookbook({ data }: { data: LookbookData }) {
  const tx = useBlockText();
  const { t, isRTL } = useTranslation();
  const items = itemsOf<LookItem>(data.images, 'images');
  const list: LookItem[] = items.length ? items : Array.from({ length: 6 }, () => ({}));
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (step: number) => setIndex((i) => (i === null ? i : (i + step + list.length) % list.length)),
    [list.length]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(isRTL ? -1 : 1);
    if (e.key === 'ArrowLeft') go(isRTL ? 1 : -1);
  };
  const onTouchStart = (e: TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go((dx < 0 ? 1 : -1) * (isRTL ? -1 : 1));
    touchX.current = null;
  };

  const current = index !== null ? list[index] : null;
  const captionOf = (item: LookItem, i: number) =>
    tx(item.caption, '', '') || t('mj.lookbook.image', 'Look {{n}}', { n: i + 1 });

  return (
    <section className="mj-section mj-lookbook">
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.lookbook.overline', 'Lookbook')}
          title={tx(data.title, 'mj.lookbook.title', 'Studies in light')}
          align="center"
        />
        <ul className="mj-masonry">
          {list.map((item, i) => (
            <li key={i} className="mj-masonry__item" data-mj-reveal="" style={{ ['--mj-i' as string]: i % 6 }}>
              <button
                type="button"
                className="mj-masonry__btn"
                aria-label={t('mj.lookbook.open', 'Open image: {{caption}}', { caption: captionOf(item, i) })}
                onClick={(e) => {
                  openerRef.current = e.currentTarget;
                  setIndex(i);
                }}
              >
                <MjMedia src={item.image} alt="" art={artFor(i + 2)} ratio={RATIOS[i % RATIOS.length]} sizes="(min-width: 1024px) 33vw, 50vw" />
                <span className="mj-masonry__zoom" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialogRef}
        className="mj-lightbox"
        aria-label={tx(data.title, 'mj.lookbook.title', 'Studies in light')}
        onClose={() => {
          setIndex(null);
          openerRef.current?.focus();
        }}
        onKeyDown={onKey}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.target === e.currentTarget && setIndex(null)}
      >
        {current && index !== null && (
          <figure className="mj-lightbox__figure">
            {current.image ? (
              <img src={current.image} alt={captionOf(current, index)} className="mj-lightbox__img" />
            ) : (
              <MjArt kind={artFor(index + 2)} className="mj-lightbox__img" />
            )}
            <figcaption className="mj-caption" aria-live="polite">
              {captionOf(current, index)} · {index + 1} / {list.length}
            </figcaption>
          </figure>
        )}
        <button type="button" className="mj-lightbox__close mj-icon-btn" aria-label={t('mj.close', 'Close')} onClick={() => setIndex(null)}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button type="button" className="mj-lightbox__nav mj-lightbox__nav--prev mj-arrow" aria-label={t('mj.prev', 'Previous')} onClick={() => go(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mj-arrow__icon mj-arrow__icon--prev">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
        <button type="button" className="mj-lightbox__nav mj-lightbox__nav--next mj-arrow" aria-label={t('mj.next', 'Next')} onClick={() => go(1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mj-arrow__icon mj-arrow__icon--next">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </dialog>
    </section>
  );
}
