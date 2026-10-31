/**
 * Canvas frame-sequence helpers shared by the hero turntable and the scroll film.
 */

/** Size the canvas backing store to its box at up to 2x device pixels. */
export function fitCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
}

/** Draw an image into the canvas with object-fit: cover. Returns false until it has loaded. */
export function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement | undefined): boolean {
  if (!img || !img.complete || !img.naturalWidth) return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  return true;
}

/** Nearest loaded frame at or before index i. */
export function nearestLoaded(frames: (HTMLImageElement | undefined)[], i: number) {
  let j = Math.max(0, Math.min(frames.length - 1, i));
  while (j > 0 && !(frames[j]?.complete && frames[j]?.naturalWidth)) j--;
  return frames[j];
}

/**
 * Load a frame list progressively: every 4th frame first for a quick coarse sequence,
 * then the gaps. Returns the (filling) array and a cancel function.
 */
export function loadFrames(urls: string[], onFirst?: () => void) {
  const frames: (HTMLImageElement | undefined)[] = new Array(urls.length);
  const timers: number[] = [];
  const order = [...urls.keys()].sort((a, b) => (a % 4) - (b % 4) || a - b);
  order.forEach((i, k) => {
    timers.push(
      window.setTimeout(() => {
        const img = new Image();
        img.decoding = 'async';
        if (i === 0 && onFirst) img.onload = onFirst;
        img.src = urls[i];
        frames[i] = img;
      }, k * 10)
    );
  });
  return { frames, cancel: () => timers.forEach((t) => window.clearTimeout(t)) };
}

/** Expand a merchant pattern like `.../frame-{n}.webp` into `count` zero-padded URLs. */
export const expandPattern = (pattern: string, count: number) =>
  Array.from({ length: count }, (_, i) => pattern.replace('{n}', String(i + 1).padStart(4, '0')));
