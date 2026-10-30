/**
 * FAQ (home block `mj-faq`).
 * Questions and answers on native <details>/<summary>, so they open with keyboard and
 * screen readers without script, with an animated plus icon. Up to 12 merchant items;
 * until then five defaults cover authenticity, longevity, delivery, returns and gift wrap.
 * Emits FAQPage JSON-LD for the visible questions (`<` escaped so text cannot close the tag).
 */
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { itemsOf, SectionHead, useBlockText } from './shared';

interface FaqItem {
  question?: unknown;
  answer?: unknown;
}

export interface FaqData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

const DEFAULTS: [string, string, string][] = [
  ['q1', 'Are your perfumes and oud oils authentic?', 'Every bottle comes from our own workshop or directly from the house that made it, sealed, with its batch number.'],
  ['q2', 'How long does the scent last?', 'Our oils and extraits hold eight to twelve hours on skin and longer on fabric. Each product page shows its longevity.'],
  ['q3', 'How fast is delivery?', 'Orders ship within one working day. Delivery takes two to four days inside the Kingdom and three to six across the GCC.'],
  ['q4', 'Can I return a perfume?', 'Sealed products can be returned within 14 days. Opened bottles can be exchanged if they arrive damaged.'],
  ['q5', 'Do you gift wrap?', 'Yes. Choose gift wrap at checkout and add a message; we write it by hand on our card.'],
];

export function Faq({ data }: { data: FaqData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<FaqItem>(data.items, 'items').slice(0, 12);
  const list = (
    items.length
      ? items.map((it) => ({ q: tx(it.question, '', ''), a: tx(it.answer, '', '') }))
      : DEFAULTS.map(([k, q, a]) => ({ q: t(`mj.faq.${k}`, q), a: t(`mj.faq.${k}_a`, a) }))
  ).filter((x) => x.q && x.a);

  if (!list.length) return null;

  const ld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
  }).replace(/</g, '\\u003c');

  return (
    <section className="mj-section mj-faq">
      <div className="mj-container mj-faq__grid">
        <SectionHead
          overline={tx(data.overline, 'mj.faq.overline', 'Questions')}
          title={tx(data.title, 'mj.faq.title', 'Before you choose')}
        />
        <div className="mj-faq__list">
          {list.map((x, i) => (
            <details key={i} className="mj-faq__item" data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
              <summary className="mj-faq__q">
                <span>{x.q}</span>
                <span className="mj-faq__icon" aria-hidden="true" />
              </summary>
              <p className="mj-faq__a">{x.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
    </section>
  );
}
