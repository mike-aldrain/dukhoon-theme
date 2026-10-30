/**
 * Ritual Bundle (home block `mj-ritual`).
 * "Complete the ritual": up to four picked products (for example perfume + oud oil +
 * bakhoor) joined by plus signs, their combined price, an optional bundle note (such as a
 * coupon code), and one button that adds every product to the bag in turn, then opens the
 * mini-cart. Without picked products it shows the three latest products. If a product
 * cannot be added directly (it needs options), the shopper is sent to that product page.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { openMiniCart } from '../MiniCart';
import { addAllToBag, idsOf, priceOf } from './conversionUtils';
import { MjMedia, SectionHead, useBlockText, artFor } from './shared';

export interface RitualBundleData {
  title?: unknown;
  text?: unknown;
  products?: unknown;
  bundle_note?: unknown;
  [key: string]: unknown;
}

export function RitualBundle({ data }: { data: RitualBundleData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const { format } = useMoney();
  const [busy, setBusy] = useState(false);
  const ids = idsOf(data.products).slice(0, 4);
  const { data: result, isLoading } = useQuery(
    productApi.queries.list(ids.length ? { source: 'selected', sourceValue: ids } : { source: 'latest', perPage: 3 })
  );
  const items = (result?.items ?? []).slice(0, ids.length || 3);
  const total = items.reduce((sum, p) => sum + priceOf(p), 0);
  const note = tx(data.bundle_note, '', '');
  const title = tx(data.title, 'mj.ritual.title', 'Complete the ritual');

  const addRitual = async () => {
    if (!items.length) return;
    setBusy(true);
    const ok = await addAllToBag(items.map((p) => Number(p.id)));
    setBusy(false);
    if (ok) openMiniCart();
    else if (items[0]?.url) window.location.assign(items[0].url);
  };

  return (
    <section className="mj-section mj-ritual" aria-label={title}>
      <div className="mj-container">
        <SectionHead
          overline={t('mj.ritual.overline', 'The ritual')}
          title={title}
          align="center"
        >
          <p className="mj-body-l mj-ritual__text">
            {tx(data.text, 'mj.ritual.text', 'Perfume for the skin, oil for the pulse, bakhoor for the room. Layered together, they last all evening.')}
          </p>
        </SectionHead>

        <ul className="mj-ritual__set" aria-busy={isLoading}>
          {isLoading &&
            [0, 1, 2].map((i) => (
              <li key={i} className="mj-ritual__item">
                <div className="mj-card-skeleton" aria-hidden="true" />
              </li>
            ))}
          {items.map((p, i) => (
            <li key={p.id} className="mj-ritual__item" data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
              {i > 0 && (
                <span className="mj-ritual__plus" aria-hidden="true">
                  +
                </span>
              )}
              <Link to={p.url} className="mj-ritual__card">
                <MjMedia src={p.image?.url} alt={p.image?.alt || p.name} art={artFor(i)} ratio="4/5" sizes="(min-width: 1024px) 22vw, 60vw" />
                <span className="mj-ritual__name">{p.name}</span>
                <span className="mj-ritual__price">{format(priceOf(p))}</span>
              </Link>
            </li>
          ))}
        </ul>

        {items.length > 0 && (
          <div className="mj-ritual__foot">
            <p className="mj-ritual__total">
              <span>{t('mj.ritual.total', 'The ritual together')}</span>
              <strong>{format(total)}</strong>
            </p>
            {note && <p className="mj-caption mj-ritual__note">{note}</p>}
            <button type="button" className="mj-btn mj-btn--gold" onClick={addRitual} disabled={busy} aria-busy={busy}>
              {busy ? t('mj.ritual.adding', 'Adding…') : t('mj.ritual.add', 'Add the ritual to bag')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
