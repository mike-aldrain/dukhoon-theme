/**
 * Product Reels (home block `mj-reels`).
 * Short vertical (9:16) product videos on a snap rail, each with a caption and a
 * "Shop this" link. Videos are muted, start only while at least 60% visible, pause when
 * they leave, and never autoplay for visitors who ask for reduced motion (the poster
 * shows instead). Video files load with `preload="none"` until they are needed.
 * Without merchant items the block shows perfume-house art cards as placeholders.
 */
import { useEffect, useRef } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { artFor, itemsOf, MjArt, SectionHead, urlOf, useBlockText } from './shared';

interface Reel {
  video?: unknown;
  poster?: string;
  url?: unknown;
  caption?: unknown;
}

export interface ProductReelsData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

export function ProductReels({ data }: { data: ProductReelsData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const motionAllowed = useMotionAllowed();
  const railRef = useRef<HTMLUListElement>(null);
  const items = itemsOf<Reel>(data.items, 'items').slice(0, 8);
  const list = items.length
    ? items
    : [1, 2, 3, 4].map((i) => ({ caption: t(`mj.reels.demo${i}`, ['Layering oud and rose', 'One spray, twelve hours', 'Lighting the mabkhara', 'Our gift box, unwrapped'][i - 1]) }) as Reel);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !motionAllowed || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            v.muted = true;
            v.play().catch(() => undefined);
          } else v.pause();
        }),
      { threshold: 0.6 }
    );
    rail.querySelectorAll('video').forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, [motionAllowed, items.length]);

  const title = tx(data.title, 'mj.reels.title', 'Seen on our reels');

  return (
    <section className="mj-section mj-reels" aria-label={title}>
      <div className="mj-container">
        <SectionHead overline={tx(data.overline, 'mj.reels.overline', 'In motion')} title={title} />
      </div>
      <ul ref={railRef} className="mj-reels__rail" data-mj-rail="" tabIndex={0} aria-label={title}>
        {list.map((r, i) => {
          const video = urlOf(r.video);
          const href = urlOf(r.url);
          const caption = tx(r.caption, '', '');
          return (
            <li key={i} className="mj-reels__item" data-mj-reveal="" style={{ ['--mj-i' as string]: Math.min(i, 5) }}>
              <figure className="mj-reels__card">
                {video ? (
                  <video
                    className="mj-reels__video"
                    src={video}
                    poster={r.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-label={caption || undefined}
                  />
                ) : r.poster ? (
                  <img className="mj-reels__video" src={r.poster} alt={caption} loading="lazy" />
                ) : (
                  <MjArt kind={artFor(i)} className="mj-reels__video" />
                )}
                <figcaption className="mj-reels__caption">
                  {caption && <span>{caption}</span>}
                  {href && (
                    <Link to={href} className="mj-btn mj-btn--on-image mj-reels__shop">
                      {t('mj.reels.shop', 'Shop this')}
                    </Link>
                  )}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
