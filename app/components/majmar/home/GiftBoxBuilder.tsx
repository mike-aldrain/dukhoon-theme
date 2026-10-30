/**
 * Gift Box Builder (home block `mj-giftbox`).
 * Shoppers pick up to `max_items` products (default 3) from a category or a hand-picked
 * list to fill a gift box. Cards are checkboxes (native input, labelled), so the choice is
 * keyboard and screen-reader friendly; cards beyond the limit are disabled. A live tray
 * shows the chosen pieces and the running total; on mobile it sticks to the bottom of the
 * block. "Add box to bag" adds each piece, then opens the mini-cart.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { openMiniCart } from '../MiniCart';
import { addAllToBag, idsOf, priceOf } from './conversionUtils';
import { artFor, MjMedia, SectionHead, useBlockText } from './shared';

export interface GiftBoxBuilderData {
  title?: unknown;
  text?: unknown;
  category?: unknown;
  products?: unknown;
  max_items?: unknown;
  [key: string]: unknown;
}

export function GiftBoxBuilder({ data }: { data: GiftBoxBuilderData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const { format } = useMoney();
  const [chosen, setChosen] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const max = Math.min(6, Math.max(1, Math.round(Number(data.max_items) || 3)));

  const productIds = idsOf(data.products);
  const categoryIds = idsOf(data.category);
  const params = productIds.length
    ? { source: 'selected' as const, sourceValue: productIds }
    : categoryIds.length
      ? { source: 'categories' as const, sourceValue: categoryIds, perPage: 12 }
      : { source: 'latest' as const, perPage: 12 };
  const { data: result, isLoading } = useQuery(productApi.queries.list(params));
  const items = (result?.items ?? []).slice(0, 12);

  const has = (p: Product) => chosen.some((c) => c.id === p.id);
  const toggle = (p: Product) => {
    setFailed(false);
    setChosen((list) => (list.some((c) => c.id === p.id) ? list.filter((c) => c.id !== p.id) : list.length < max ? [...list, p] : list));
  };
  const total = chosen.reduce((s, p) => s + priceOf(p), 0);
  const title = tx(data.title, 'mj.giftbox.title', 'Build your gift box');

  const addBox = async () => {
    setBusy(true);
    const ok = await addAllToBag(chosen.map((p) => Number(p.id)));
    setBusy(false);
    if (ok) {
      setChosen([]);
      openMiniCart();
    } else setFailed(true);
  };

  return (
    <section className="mj-section mj-giftbox" aria-label={title}>
      <div className="mj-container">
        <SectionHead overline={t('mj.giftbox.overline', 'Gifting')} title={title}>
          <p className="mj-body-l mj-giftbox__text">
            {tx(data.text, '', '') ||
              t('mj.giftbox.text', 'Choose {{n}} pieces. We wrap them in our signature box with a handwritten card.', { n: max })}
          </p>
        </SectionHead>

        <ul className="mj-giftbox__grid" aria-busy={isLoading}>
          {isLoading &&
            Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <div className="mj-card-skeleton" aria-hidden="true" />
              </li>
            ))}
          {items.map((p, i) => {
            const picked = has(p);
            const full = !picked && chosen.length >= max;
            return (
              <li key={p.id}>
                <label className={`mj-giftbox__card${picked ? ' is-picked' : ''}${full ? ' is-full' : ''}`}>
                  <input
                    type="checkbox"
                    className="mj-sr-only"
                    checked={picked}
                    disabled={full}
                    onChange={() => toggle(p)}
                  />
                  <MjMedia src={p.image?.url} alt="" art={artFor(i + 4)} ratio="4/5" sizes="(min-width: 1024px) 20vw, 45vw" />
                  <span className="mj-giftbox__check" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M5 12l5 5 9-10" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </span>
                  <span className="mj-giftbox__name">{p.name}</span>
                  <span className="mj-giftbox__price">{format(priceOf(p))}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="mj-giftbox__tray" aria-live="polite">
          <div className="mj-giftbox__slots">
            {Array.from({ length: max }, (_, i) => {
              const p = chosen[i];
              return (
                <span key={i} className={`mj-giftbox__slot${p ? ' is-filled' : ''}`}>
                  {p?.image?.url ? <img src={p.image.url} alt={p.name} width={48} height={60} loading="lazy" /> : <span aria-hidden="true">{i + 1}</span>}
                </span>
              );
            })}
          </div>
          <p className="mj-giftbox__sum">
            <span className="mj-caption">
              {t('mj.giftbox.count', '{{n}} of {{max}} chosen', { n: chosen.length, max })}
            </span>
            <strong>{format(total)}</strong>
          </p>
          <button type="button" className="mj-btn mj-btn--gold" onClick={addBox} disabled={!chosen.length || busy} aria-busy={busy}>
            {busy ? t('mj.giftbox.adding', 'Adding…') : t('mj.giftbox.add', 'Add box to bag')}
          </button>
          {failed && (
            <p className="mj-caption mj-giftbox__error" role="alert">
              {t('mj.giftbox.failed', 'One piece needs a size or option. Open it to choose, then add it.')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
