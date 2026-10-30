/**
 * Structured data (JSON-LD) the engine does not already emit.
 * The engine's Breadcrumb outputs BreadcrumbList; this adds:
 * - `ProductLd`: Product + Offer (+ AggregateRating, Brand, SKU/GTIN when present).
 * - `OrganizationLd`: the store as an Organization, on the home page.
 * JSON-LD is valid in <body>; values are JSON-encoded and `<` is escaped so merchant
 * text can never close the script tag.
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

function Ld({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const strip = (html?: string | null) =>
  (html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 5000);

export function ProductLd({ product }: { product: Product }) {
  const { currency, store } = useTwilight();
  const p = product as Product & { description?: string; url?: string };
  const price = Number(p.is_on_sale && p.sale_price ? p.sale_price : p.price);
  const images = [p.image?.url, ...(p.images ?? []).map((i) => i.url)].filter(Boolean);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: strip(p.description) || undefined,
    image: Array.from(new Set(images)),
    sku: p.sku || undefined,
    gtin: p.gtin || undefined,
    mpn: p.mpn || undefined,
    brand: p.brand?.name ? { '@type': 'Brand', name: p.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      url: p.url,
      priceCurrency: currency?.code || 'SAR',
      price: Number.isFinite(price) ? price.toFixed(2) : undefined,
      availability: p.is_out_of_stock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      seller: store?.name ? { '@type': 'Organization', name: store.name } : undefined,
    },
  };
  if (p.rating?.count) {
    data.aggregateRating = { '@type': 'AggregateRating', ratingValue: p.rating.stars, reviewCount: p.rating.count };
  }
  return <Ld data={data} />;
}

export function OrganizationLd() {
  const { store } = useTwilight();
  if (!store?.name) return null;
  const s = store as typeof store & {
    url?: string;
    logo?: string;
    social?: Record<string, string | null | undefined>;
    contacts?: { email?: string; mobile?: string; phone?: string };
  };
  const sameAs = Object.values(s.social ?? {}).filter((v): v is string => typeof v === 'string' && /^https?:/.test(v));
  return (
    <Ld
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: s.name,
        url: s.url,
        logo: s.logo,
        email: s.contacts?.email || undefined,
        telephone: s.contacts?.mobile || s.contacts?.phone || undefined,
        sameAs: sameAs.length ? sameAs : undefined,
      }}
    />
  );
}
