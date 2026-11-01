/**
 * Timeline (home block `mj-timeline`): the house's journey as alternating cards on a gold
 * line that fills once when the block comes into view (not scroll-scrubbed).
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { itemsOf, SectionHead, useBlockText } from './shared';

interface Step {
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
    ? items.map((s) => ({ year: tx(s.year, '', ''), title: tx(s.title, '', ''), text: tx(s.text, '', '') }))
    : [1, 2, 3, 4].map((i) => ({
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
        <ol ref={ref} className={`mj-tl__list${inView ? ' in' : ''}`}>
          <span className="mj-tl__fill" aria-hidden="true" />
          {steps.map((s, i) => (
            <li key={i} className="mj-tl__item">
              <span className="mj-tl__dot" aria-hidden="true" />
              <div className="mj-tl__card">
                <em>{s.year}</em>
                <b>{s.title}</b>
                {s.text && <p>{s.text}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
