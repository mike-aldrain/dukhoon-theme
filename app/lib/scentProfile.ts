/**
 * Scent profile from product tags.
 *
 * Merchants describe a perfume with ordinary Salla product tags written as
 * "label: value" (Arabic or English labels), for example:
 *   قمة: برغموت   ·  heart: Taif rose  ·  قاعدة: عود  ·  ثبات: 4  ·  فوحان: 3  ·  موسم: شتاء
 * Several tags with the same label are allowed (one note each). Tags without a
 * known label are left alone and still show in the normal tag list.
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';

export interface ScentProfile {
  top: string[];
  heart: string[];
  base: string[];
  longevity: number | null; // 1..5
  sillage: number | null; // 1..5
  season: string[];
  family: string[];
}

const LABELS: Record<string, keyof ScentProfile> = {
  top: 'top',
  'top notes': 'top',
  قمة: 'top',
  افتتاحية: 'top',
  heart: 'heart',
  'heart notes': 'heart',
  middle: 'heart',
  قلب: 'heart',
  base: 'base',
  'base notes': 'base',
  قاعدة: 'base',
  longevity: 'longevity',
  ثبات: 'longevity',
  sillage: 'sillage',
  projection: 'sillage',
  فوحان: 'sillage',
  season: 'season',
  موسم: 'season',
  family: 'family',
  عائلة: 'family',
};

const parse = (name: string): [keyof ScentProfile, string] | null => {
  const m = name.match(/^\s*([^:：]+?)\s*[:：]\s*(.+?)\s*$/);
  if (!m) return null;
  const key = LABELS[m[1].toLowerCase()];
  return key ? [key, m[2]] : null;
};

/** True when a tag is a scent-profile tag (hidden from the plain tag list). */
export const isScentTag = (name: string) => parse(name) !== null;

/** Read the scent profile from a product's tags; null when it has none. */
export function scentProfile(product: Pick<Product, 'tags'>): ScentProfile | null {
  const p: ScentProfile = { top: [], heart: [], base: [], longevity: null, sillage: null, season: [], family: [] };
  let found = false;
  for (const tag of product.tags ?? []) {
    const hit = parse(tag.name);
    if (!hit) continue;
    found = true;
    const [key, value] = hit;
    if (key === 'longevity' || key === 'sillage') {
      const n = Math.round(Number(value.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))));
      p[key] = Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : null;
    } else {
      p[key].push(value);
    }
  }
  return found ? p : null;
}
