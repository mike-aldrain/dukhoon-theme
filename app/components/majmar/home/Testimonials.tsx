/**
 * Testimonials (home block `mj-testimonials`).
 * Quotes with a gold star rating (exposed as text for screen readers) separated by a
 * gold divider. Three columns on desktop, a swipeable snap rail on mobile.
 */
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { itemsOf, SectionHead, useBlockText } from './shared';

interface Testimonial {
  name?: unknown;
  location?: unknown;
  quote?: unknown;
  rating?: unknown;
}

export interface TestimonialsData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

/** Shown until the merchant adds testimonials: [key prefix, name, city, quote]. */
const DEMO = [
  ['mj.testimonials.demo1', 'Noura A.', 'Riyadh', 'The bottle arrived wrapped like a gift to myself. The scent lasts from morning prayer to dinner.'],
  ['mj.testimonials.demo2', 'Faisal K.', 'Jeddah', 'Quiet, precise service. The engraving on the cufflinks was exactly as I asked.'],
  ['mj.testimonials.demo3', 'Layla M.', 'Dubai', 'Every object in our majlis now comes from here. Guests always ask.'],
] as const;

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <span className="mj-stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className={i < value ? 'is-on' : ''}>
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function Testimonials({ data }: { data: TestimonialsData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<Testimonial>(data.items, 'items');
  const list: Testimonial[] = items.length
    ? items
    : DEMO.map(([k, name, city, quote]) => ({
        name: t(`${k}_name`, name),
        location: t(`${k}_city`, city),
        quote: t(`${k}_quote`, quote),
        rating: 5,
      }));

  return (
    <section className="mj-section mj-testimonials">
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.testimonials.overline', 'Kind words')}
          title={tx(data.title, 'mj.testimonials.title', 'From our clients')}
          align="center"
        />
        <ul className="mj-testimonials__list" data-mj-rail="">
          {list.map((item, i) => {
            const rating = Math.max(0, Math.min(5, Math.round(Number(item.rating) || 5)));
            return (
              <li key={i} className="mj-testimonial" data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
                <Stars value={rating} label={t('mj.testimonials.rating', 'Rated {{n}} out of 5', { n: rating })} />
                <blockquote>
                  <p className="mj-testimonial__quote">{tx(item.quote, '', '')}</p>
                </blockquote>
                <span className="mj-rule" aria-hidden="true" />
                <p className="mj-testimonial__name">
                  {tx(item.name, '', '')}
                  {tx(item.location, '', '') && <span className="mj-caption"> · {tx(item.location, '', '')}</span>}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
