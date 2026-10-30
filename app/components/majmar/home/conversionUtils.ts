/**
 * Helpers shared by the Majmar conversion blocks (countdown, finder, ritual, gift box,
 * FAQ, reels): reading dropdown ids and adding several products to the bag in turn.
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/** Ids from a dropdown value: numbers, `{ id }` objects, `{ value }` options, or one of them. */
export function idsOf(raw: unknown): number[] {
  const list = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
  return list
    .map((v) => {
      if (typeof v === 'number' || typeof v === 'string') return Number(v);
      const o = v as { id?: unknown; value?: unknown };
      return Number(o?.id ?? o?.value);
    })
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** The price a shopper pays now for a list product. */
export const priceOf = (p: Product): number =>
  Number(p.is_on_sale && p.sale_price ? p.sale_price : p.price) || 0;

/**
 * Adds each product (quantity 1) to the bag, one after another. Resolves true when all
 * were added; false on the first failure (usually a product that needs options chosen).
 */
export async function addAllToBag(ids: number[]): Promise<boolean> {
  try {
    for (const id of ids) {
      await window.salla?.cart?.addItem?.(id, 1);
    }
    return true;
  } catch {
    return false;
  }
}
