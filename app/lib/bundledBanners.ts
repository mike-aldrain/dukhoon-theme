/**
 * Banner and category images that ship with the theme: 3D renders of oud products on the
 * Majmar colours. They are the default content of the store blocks (slider, category
 * grid, promo pair, wide banner) until the merchant uploads their own images.
 */
type Glob = Record<string, string>;
const files = import.meta.glob('../assets/banners/*.webp', { eager: true, query: '?url', import: 'default' }) as Glob;

/** URL of a bundled banner by name, e.g. `banner('slide-royal')`. */
export const banner = (name: string): string => files[`../assets/banners/${name}.webp`] ?? '';
