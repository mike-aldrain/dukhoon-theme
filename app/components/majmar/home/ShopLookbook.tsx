/**
 * Shoppable Lookbook (home block `mj-looks`): wide photo panels that expand on hover, focus
 * or tap. The open panel shows a pulsing (+) hotspot placed by the merchant; it opens a
 * small card for the linked product (name, price, link). Defaults use bundled photos.
 */
import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { banner } from '../../../lib/bundledBanners';
import { idsOf, priceOf } from './conversionUtils';
import { itemsOf, SectionHead, useBlockText } from './shared';

interface Look {
  image?: string;
  title?: unknown;
  product?: unknown;
  x?: unknown;
  y?: unknown;
}

export interface ShopLookbookData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

const pct = (v: unknown, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : d;
};

export function ShopLookbook({ data }: { data: ShopLookbookData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const { format } = useMoney();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(-1);
  const merchant = itemsOf<Look>(data.items, 'items').slice(0, 4);
  const looks = merchant.length
    ? merchant.map((l) => ({ image: l.image || '', title: tx(l.title, '', ''), id: idsOf(l.product)[0], x: pct(l.x, 50), y: pct(l.y, 55) }))
    : [
        { image: banner('look-1'), title: t('mj.looks.l1', 'Eid look'), id: undefined, x: 52, y: 56 },
        { image: banner('look-2'), title: t('mj.looks.l2', 'Majlis nights'), id: undefined, x: 48, y: 46 },
        { image: banner('look-3'), title: t('mj.looks.l3', 'Evening signature'), id: undefined, x: 55, y: 50 },
      ];
  const ids = looks.map((l) => l.id).filter((n): n is number => !!n);
  const { data: picked } = useQuery({
    ...productApi.queries.list({ source: ids.length ? 'selected' : 'latest', sourceValue: ids.length ? ids : undefined, perPage: 4 }),
  });
  const products = picked?.items ?? [];

  return (
    <section className="mj-section mj-looks">
      <div className="mj-container">
        <SectionHead overline={tx(data.overline, 'mj.looks.overline', 'Just arrived')} title={tx(data.title, 'mj.looks.title', 'Looks of the season')} />
        <div className="mj-looks__row">
          {looks.map((l, i) => {
            const p = l.id ? products.find((x) => Number(x.id) === l.id) : products[i];
            return (
              <figure
                key={i}
                className={`mj-look${i === active ? ' is-on' : ''}${i === open ? ' show' : ''}`}
                tabIndex={0}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                {l.image && <img src={l.image} alt={l.title} loading="lazy" decoding="async" />}
                <figcaption>
                  <b>{l.title}</b>
                  <span>{t('mj.looks.hint', 'Tap (+) to see the product')}</span>
                </figcaption>
                {p && (
                  <>
                    <button
                      type="button"
                      className="mj-look__spot"
                      style={{ ['--x' as string]: `${l.x}%`, ['--y' as string]: `${l.y}%` }}
                      aria-label={p.name}
                      aria-expanded={i === open}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(i === open ? -1 : i);
                      }}
                    >
                      +
                    </button>
                    <div className="mj-look__pop" style={{ ['--x' as string]: `${l.x}%`, ['--y' as string]: `${l.y}%` }}>
                      <b>{p.name}</b>
                      <span>{format(priceOf(p))}</span>
                      <Link to={p.url}>{t('mj.looks.view', 'View product')} ←</Link>
                    </div>
                  </>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
