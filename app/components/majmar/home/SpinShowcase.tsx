/**
 * 360 Showcase (home block `mj-spin`): one product presented on the brand-colour band.
 * The turntable (drag to spin, inertia, keyboard arrows) sits in an arch frame; beside it
 * the product's name, a short text, its scent pyramid (top, heart, base) and longevity and
 * sillage meters read from the product's scent tags, its price and an add-to-bag button.
 * The product is picked in the block, or the latest product. Without scent tags the
 * pyramid and meters are hidden.
 */
import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { usePickedProducts } from '../../../hooks/useStoreProducts';
import { scentProfile } from '../../../lib/scentProfile';
import { openMiniCart } from '../MiniCart';
import { priceOf } from './conversionUtils';
import { HeroStage } from './HeroStage';
import { urlOf, useBlockText } from './shared';

export interface SpinShowcaseData {
  overline?: unknown;
  title?: unknown;
  text?: unknown;
  product?: unknown;
  frames_url?: unknown;
  frames_count?: unknown;
  [key: string]: unknown;
}

export function SpinShowcase({ data }: { data: SpinShowcaseData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const { format } = useMoney();
  const [adding, setAdding] = useState(false);
  const { products } = usePickedProducts(data.product, 1);
  const product = products[0];
  const profile = product ? scentProfile(product) : null;

  const title = tx(data.title, '', '') || product?.name || t('mj.spin.title', 'Oud Royal');
  const text = tx(
    data.text,
    'mj.spin.text',
    'A heavy glass flacon with a gilded cap, holding aged Cambodian oud that unfolds on skin hour after hour.'
  );

  const add = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await window.salla?.cart?.addItem?.(Number(product.id), 1);
      openMiniCart();
    } catch {
      if (product.url) window.location.assign(product.url);
    } finally {
      setAdding(false);
    }
  };

  const tiers: [string, string[]][] = profile
    ? ([
        [t('mj.notes.top', 'Top notes'), profile.top],
        [t('mj.notes.heart', 'Heart notes'), profile.heart],
        [t('mj.notes.base', 'Base notes'), profile.base],
      ] as [string, string[]][]).filter(([, v]) => v.length)
    : [];

  return (
    <section className="mj-spin" aria-label={title}>
      <span className="mj-najdi-edge" aria-hidden="true" />
      <div className="mj-container mj-spin__grid">
        <div className="mj-spin__stage">
          <HeroStage
            sticker=""
            stickerBadge=""
            label={title}
            priority={false}
            showPrice={false}
            framesUrl={urlOf(data.frames_url)}
            framesCount={Number(data.frames_count) || 0}
          />
        </div>
        <div className="mj-spin__copy">
          <p className="mj-eyebrow">{tx(data.overline, 'mj.spin.overline', 'The flacon from every angle')}</p>
          <h2 className="mj-spin__title">{title}</h2>
          {text && <p className="mj-spin__text">{text}</p>}
          {tiers.length > 0 && (
            <dl className="mj-spin__pyr">
              {tiers.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          )}
          {profile && (profile.longevity || profile.sillage) && (
            <div className="mj-spin__meters">
              {profile.longevity ? (
                <p>
                  {t('mj.notes.longevity', 'Longevity')}
                  <i style={{ ['--v' as string]: `${profile.longevity * 20}%` }} />
                </p>
              ) : null}
              {profile.sillage ? (
                <p>
                  {t('mj.notes.sillage', 'Sillage')}
                  <i style={{ ['--v' as string]: `${profile.sillage * 20}%` }} />
                </p>
              ) : null}
            </div>
          )}
          {product && (
            <div className="mj-spin__buy">
              <button type="button" className="mj-btn mj-btn--gold-solid" onClick={add} disabled={adding} aria-busy={adding}>
                {t('mj.film.add', 'Add to bag')} · {format(priceOf(product))}
              </button>
              {product.url && (
                <Link to={product.url} className="mj-btn mj-btn--line">
                  {t('mj.film.details', 'View details')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      <span className="mj-najdi-edge mj-najdi-edge--down" aria-hidden="true" />
    </section>
  );
}
