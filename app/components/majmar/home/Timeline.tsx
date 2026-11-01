/**
 * Timeline (home block `mj-timeline`): the house's journey as a horizontal row of
 * milestones at staggered heights. Each has an arch-framed photo, a large calligraphic year
 * and a short text. A gold line with diamond markers draws across and the markers light up
 * one by one when the block comes into view (once, not scroll-scrubbed). Swipe on phones.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { banner } from '../../../lib/bundledBanners';
import { itemsOf, SectionHead, useBlockText } from './shared';

interface Step {
  image?: string;
  year?: unknown;
  title?: unknown;
  text?: unknown;
}

export interface TimelineData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

const DEFAULT_IMG = ['cat-wood', 'cat-oil', 'cat-bakhoor', 'noir-hero'];

export function Timeline({ data }: { data: TimelineData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const ref = useRef<HTMLOListElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const items = itemsOf<Step>(data.items, 'items').slice(0, 8);
  const steps = items.length
    ? items.map((s, i) => ({ image: s.image || banner(DEFAULT_IMG[i % 4]), year: tx(s.year, '', ''), title: tx(s.title, '', ''), text: tx(s.text, '', '') }))
    : [1, 2, 3, 4].map((i) => ({
        image: banner(DEFAULT_IMG[i - 1]),
        year: t(`mj.tl.y${i}`, ['2018', '2020', '2023', '2026'][i - 1]),
        title: t(`mj.tl.t${i}`, ['The beginning', 'Our own oud oil', 'Twenty thousand clients', 'The Diriyah edition'][i - 1]),
        text: t(`mj.tl.d${i}`, [
          'From a small shop in Riyadh, we began choosing oud by hand.',
          'We launched our first oud oil aged ten years.',
          'We reached every city in the Kingdom and the Gulf.',
          'A collection inspired by Najdi architecture and majlis hospitality.',
        ][i - 1]),
      }));

  return (
    <section className="mj-section mj-tl">
      <div className="mj-container">
        <SectionHead overline={tx(data.overline, 'mj.tl.overline', 'Our journey')} title={tx(data.title, 'mj.tl.title', 'From the souq to every majlis')} align="center" />
        <ol ref={ref} className={`mj-tl__row${inView ? ' in' : ''}`} style={{ ['--n' as string]: steps.length }}>
          <span className="mj-tl__line" aria-hidden="true">
            <span />
          </span>
          {steps.map((s, i) => (
            <li key={i} className="mj-tl__step" style={{ ['--i' as string]: i }}>
              <span className="mj-tl__node" aria-hidden="true" />
              <figure className="mj-tl__arch">{s.image && <img src={s.image} alt="" loading="lazy" decoding="async" />}</figure>
              <em className="mj-tl__year">{s.year}</em>
              <b className="mj-tl__title">{s.title}</b>
              {s.text && <p className="mj-tl__text">{s.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
