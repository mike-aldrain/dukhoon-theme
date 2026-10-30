import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { idsOf } from '../components/majmar/home/conversionUtils';

/** The main image URL of a product, or '' when it has none. */
export const imageOf = (p?: Product | null): string => p?.image?.url ?? '';

/**
 * The store's latest products (one shared, cached query). Every Majmar block uses these
 * real product photos as its fallback imagery when the merchant has not uploaded images,
 * so a fresh install shows the store's own products, not placeholders.
 */
export function useLatestProducts(): Product[] {
  const { data } = useQuery(productApi.queries.list({ source: 'latest', perPage: 12 }));
  return data?.items ?? [];
}

/** Image URLs of the latest products that have a photo. */
export function useStoreImages(): string[] {
  return useLatestProducts().map(imageOf).filter(Boolean);
}

/**
 * Products picked in a block field (dropdown of products), or the latest products when
 * none are picked. Returns at most `count`.
 */
export function usePickedProducts(raw: unknown, count: number): { products: Product[]; loading: boolean } {
  const ids = idsOf(raw);
  const picked = useQuery({
    ...productApi.queries.list({ source: 'selected', sourceValue: ids, perPage: count }),
    enabled: ids.length > 0,
  });
  const latest = useQuery(productApi.queries.list({ source: 'latest', perPage: 12 }));
  const list = ids.length ? (picked.data?.items ?? []) : (latest.data?.items ?? []);
  return {
    products: list.filter((p) => imageOf(p)).slice(0, count),
    loading: ids.length ? picked.isLoading : latest.isLoading,
  };
}

/** Gallery image URLs of one product (detail response), deduplicated. */
export function useProductGallery(id: number | null): string[] {
  const { data } = useQuery({ ...productApi.queries.detail(String(id ?? '')), enabled: !!id });
  const urls = [data?.image?.url, ...(data?.images ?? []).map((i) => i.url)].filter((u): u is string => !!u);
  return Array.from(new Set(urls));
}
