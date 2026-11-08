/**
 * Frame sequences for the hero turntable and the scroll film, so both work before a
 * merchant uploads any media. Each palette has its own set, rendered on that palette's
 * colour so the frames melt into the page; a store only loads the set for its palette.
 * The files live on the media CDN (see mediaCdn.ts); only their URLs are in the bundle.
 *
 *   loop-w: 40 frames, 1100 x 1100, one full turn of the flacon under a warm spotlight.
 *   loop-t: 40 frames, 720 x 900, the same turn framed for phones.
 *   film-w: 80 frames, 1280 x 720, the scroll film (cap lifts, gold smoke rises).
 *   film-t: 80 frames, 720 x 1280, the same film framed for phones.
 */
import type { Palette } from './majmarSettings';
import { MEDIA_CDN } from './mediaCdn';

const seq = (palette: Palette, kind: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${MEDIA_CDN}/frames/${palette}/${kind}-${String(i + 1).padStart(4, '0')}.webp`);

const set = (palette: Palette) => ({
  loopWide: seq(palette, 'loop-w', 40),
  loopTall: seq(palette, 'loop-t', 40),
  filmWide: seq(palette, 'film-w', 80),
  filmTall: seq(palette, 'film-t', 80),
});

const sets = { emerald: set('emerald'), noir: set('noir'), oxblood: set('oxblood') };

/** The frame set for a palette. */
export const framesFor = (palette: Palette) => sets[palette] ?? sets.emerald;
