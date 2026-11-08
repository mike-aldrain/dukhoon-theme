/**
 * Banner and category images that ship with the theme: renders of oud products on the
 * theme colours. They are the default content of the store blocks (slider, category
 * grid, promo pair, wide banner) until the merchant uploads their own images.
 * The files live on the media CDN (see mediaCdn.ts).
 */
import { MEDIA_CDN } from './mediaCdn';

/** URL of a default banner by name, e.g. `banner('slide-royal')`. */
export const banner = (name: string): string => (name ? `${MEDIA_CDN}/banners/${name}.webp` : '');
