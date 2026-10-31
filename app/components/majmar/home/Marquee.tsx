/**
 * Scent Marquee (home block `mj-marquee`): a band of large scent words that scrolls
 * sideways without end, on an ink or colour field. The words are one comma-separated
 * field. The track is decorative (aria-hidden); the words are also given once as a
 * visually hidden list for screen readers. CSS-only motion, stopped for reduced motion.
 */
import { Fragment } from 'react';
import { useBlockText } from './shared';

export interface MarqueeData {
  words?: unknown;
  field?: unknown;
  [key: string]: unknown;
}

const FIELDS = ['ink', 'saffron', 'coral', 'emerald'] as const;

export function Marquee({ data }: { data: MarqueeData }) {
  const tx = useBlockText();
  const raw = Array.isArray(data.field) ? data.field[0] : data.field;
  const value = typeof raw === 'object' && raw ? (raw as { value?: unknown }).value : raw;
  const field = (FIELDS as readonly unknown[]).includes(value) ? (value as string) : 'ink';
  const words = tx(data.words, 'mj.marquee.words', 'Cambodian oud, Hindi oud, Oud oil, Muattar, Mukhallat, Majlis bakhoor')
    .split(/[,،]/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 12);
  if (!words.length) return null;

  // Each set is repeated so one set always covers the widest screen; two sets loop seamlessly.
  const reps = Math.max(1, Math.ceil(8 / words.length));
  const set = (
    <span className="mj-marquee__set">
      {Array.from({ length: reps }, (_, r) =>
        words.map((w, i) => (
          <Fragment key={`${r}-${i}`}>
            {w} <i>✦</i>
          </Fragment>
        ))
      )}
    </span>
  );

  return (
    <section className={`mj-marquee mj-field--${field}`}>
      <ul className="mj-sr-only">
        {words.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <div className="mj-marquee__track" aria-hidden="true">
        {set}
        {set}
      </div>
    </section>
  );
}
