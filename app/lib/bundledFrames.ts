/**
 * Frame sequences that ship with the theme, so the hero turntable and the scroll film
 * work before a merchant uploads any media. Vite emits each WebP as a hashed asset;
 * only the URLs are bundled, and the frames load on demand.
 *
 *   loop-w: 40 frames, 1100 x 1100, spotlit oud-brown field, one full turn of the flacon.
 *   loop-t: 40 frames, 720 x 900, the same turn framed for phones.
 *   film-w: 80 frames, 1280 x 720, the scroll film (spotlit oud-brown fields, gold smoke).
 *   film-t: 80 frames, 720 x 1280, the same film framed for phones.
 */
type Glob = Record<string, string>;
const sorted = (g: Glob) =>
  Object.keys(g)
    .sort()
    .map((k) => g[k]);

export const bundledFrames = {
  loopWide: sorted(import.meta.glob('../assets/frames/loop-w-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
  loopTall: sorted(import.meta.glob('../assets/frames/loop-t-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
  filmWide: sorted(import.meta.glob('../assets/frames/film-w-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
  filmTall: sorted(import.meta.glob('../assets/frames/film-t-*.webp', { eager: true, query: '?url', import: 'default' }) as Glob),
};

/**
 * Whether copy over the bundled film at progress p should be ink. The bundled film runs
 * on deep oud-brown fields throughout, so its copy is always cream.
 */
export const bundledFilmInk = (_p: number) => false;
