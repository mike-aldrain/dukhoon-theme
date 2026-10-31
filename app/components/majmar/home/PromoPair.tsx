/**
 * Promo Banners (home block `mj-promos`): two side-by-side image banners (stacked on
 * phones), each with a short line, a headline, a sentence and a button over the image.
 * Without merchant banners, two bundled oud banners show (Oud Intense on emerald,
 * bakhoor and burners on oxblood).
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { banner } from '../../../lib/bundledBanners';
import { itemsOf, urlOf, useBlockText } from './shared';

interface Promo {
  image?: string;
  overline?: unknown;
  title?: unknown;
  text?: unknown;
  button?: unknown;
  url?: unknown;
}

export interface PromoPairData {
  items?: unknown;
  [key: string]: unknown;
}

export function PromoPair({ data }: { data: PromoPairData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<Promo>(data.items, 'items').slice(0, 2);
  const list = items.length
    ? items.map((p) => ({
        image: p.image || '',
        over: tx(p.overline, '', ''),
        title: tx(p.title, '', ''),
        text: tx(p.text, '', ''),
        button: tx(p.button, '', ''),
        url: urlOf(p.url) || '/products',
      }))
    : [
        {
          image: banner('promo-intense'),
          over: t('mj.promos.p1_over', 'The strongest in the house'),
          title: t('mj.promos.p1_title', 'Oud Intense'),
          text: t('mj.promos.p1_text', 'Oud, amber and frankincense at parfum strength.'),
          button: t('mj.slider.shop', 'Shop now'),
          url: '/products',
        },
        {
          image: banner('promo-majlis'),
          over: t('mj.promos.p2_over', 'For the majlis'),
          title: t('mj.promos.p2_title', 'Bakhoor and burners'),
          text: t('mj.promos.p2_text', 'Oud-scented bakhoor and a polished brass burner.'),
          button: t('mj.promos.p2_button', 'Discover the collection'),
          url: '/products',
        },
      ];

  return (
    <section className="mj-section mj-promos" aria-label={t('mj.promos.label', 'Offers')}>
      <div className="mj-container mj-promos__grid">
        {list.map((p, i) => (
          <article key={i} className="mj-promo">
            {p.image && <img className="mj-promo__img" src={p.image} alt="" loading="lazy" decoding="async" />}
            <div className="mj-promo__copy">
              {p.over && <p className="mj-promo__over">{p.over}</p>}
              {p.title && <h2 className="mj-promo__title">{p.title}</h2>}
              {p.text && <p className="mj-promo__text">{p.text}</p>}
              {p.button && (
                <Link to={p.url} className="mj-btn mj-btn--gold-solid">
                  {p.button}
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
