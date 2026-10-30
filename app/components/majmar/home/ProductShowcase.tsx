/**
 * Product Showcase slider (home block `mj-showcase`).
 * Products come from the engine product API (`product.queries.list`): hand-picked
 * products, a category, or the latest products when nothing is chosen. Cards are the
 * theme ProductCard. The rail is a native scroll-snap track (swipe on touch, arrow
 * buttons and keyboard on desktop); arrows mirror in RTL.
 */
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ProductCard } from '../../product';
import { SectionHead, urlOf, useBlockText } from './shared';

export interface ProductShowcaseData {
  overline?: unknown;
  title?: unknown;
  products?: unknown;
  category?: unknown;
  link_text?: unknown;
  link_url?: unknown;
  position?: number;
  [key: string]: unknown;
}

/** Ids from a dropdown value: numbers, `{ id }` objects, `{ value }` options, or one of them. */
function idsOf(raw: unknown): number[] {
  const list = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
  return list
    .map((v) => {
      if (typeof v === 'number' || typeof v === 'string') return Number(v);
      const o = v as { id?: unknown; value?: unknown };
      return Number(o?.id ?? o?.value);
    })
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function ProductShowcase({ data }: { data: ProductShowcaseData }) {
  const tx = useBlockText();
  const { t, isRTL } = useTranslation();
  const railRef = useRef<HTMLUListElement>(null);

  const productIds = idsOf(data.products);
  const categoryIds = idsOf(data.category);
  const source: ProductsListSource = productIds.length ? 'selected' : categoryIds.length ? 'categories' : 'latest';
  const sourceValue = productIds.length ? productIds : categoryIds.length ? categoryIds : undefined;

  const { data: result, isLoading } = useQuery(productApi.queries.list({ source, sourceValue, perPage: 12 }));
  const items = result?.items ?? [];

  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = rail.clientWidth * 0.8 * dir * (isRTL ? -1 : 1);
    rail.scrollBy({ left: step, behavior: 'smooth' });
  };

  const linkUrl = urlOf(data.link_url);
  const title = tx(data.title, 'mj.showcase.title', 'The atelier selection');

  return (
    <section className="mj-section mj-showcase" aria-roledescription="carousel" aria-label={title}>
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.showcase.overline', 'New in')}
          title={title}
          link={linkUrl ? { url: linkUrl, label: tx(data.link_text, 'mj.view_all', 'View all') } : null}
        >
          <div className="mj-showcase__arrows">
            <button type="button" className="mj-arrow" aria-label={t('mj.prev', 'Previous')} onClick={() => scrollBy(-1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mj-arrow__icon mj-arrow__icon--prev">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            <button type="button" className="mj-arrow" aria-label={t('mj.next', 'Next')} onClick={() => scrollBy(1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="mj-arrow__icon mj-arrow__icon--next">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
          </div>
        </SectionHead>
      </div>

      <ul ref={railRef} className="mj-rail" data-mj-rail="" tabIndex={0} aria-label={title} aria-busy={isLoading}>
        {isLoading &&
          Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="mj-rail__item">
              <div className="mj-card-skeleton" aria-hidden="true" />
            </li>
          ))}
        {items.map((p, i) => (
          <li key={p.id} className="mj-rail__item" data-mj-reveal="" style={{ ['--mj-i' as string]: Math.min(i, 6) }}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
