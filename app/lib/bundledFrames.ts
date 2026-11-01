/**
 * Frame sequences that ship with the theme, so the hero turntable and the scroll film
 * work before a merchant uploads any media. Each palette has its own set, rendered on
 * that palette's colour so the frames melt into the page; a store only ever loads the
 * set for its palette. Vite emits each WebP as a hashed asset; only URLs are bundled.
 *
 *   loop-w: 40 frames, 1100 x 1100, one full turn of the flacon under a warm spotlight.
 *   loop-t: 40 frames, 720 x 900, the same turn framed for phones.
 *   film-w: 80 frames, 1280 x 720, the scroll film (cap lifts, gold smoke rises).
 *   film-t: 80 frames, 720 x 1280, the same film framed for phones.
 */
import type { Palette } from './majmarSettings';

type Glob = Record<string, string>;
const sorted = (g: Glob) =>
  Object.keys(g)
    .sort()
    .map((k) => g[k]);

const glob = {
  emerald: {
    loopWide: sorted(import.meta.glob('../assets/frames/emerald/loop-w-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
    loopTall: sorted(import.meta.glob('../assets/frames/emerald/loop-t-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
    filmWide: sorted(import.meta.glob('../assets/frames/emerald/film-w-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
    filmTall: sorted(import.meta.glob('../assets/frames/emerald/film-t-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
  },
  oxblood: {
    loopWide: sorted(import.meta.glob('../assets/frames/oxblood/loop-w-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
    loopTall: sorted(import.meta.glob('../assets/frames/oxblood/loop-t-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
    filmWide: sorted(import.meta.glob('../assets/frames/oxblood/film-w-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
    filmTall: sorted(import.meta.glob('../assets/frames/oxblood/film-t-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
  },
};

/** The bundled frame set for a palette. */
export const framesFor = (palette: Palette) => (palette === 'oxblood' ? glob.oxblood : glob.emerald);
