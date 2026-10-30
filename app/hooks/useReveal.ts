import { useEffect } from 'react';

/**
 * One IntersectionObserver for the whole page: every `[data-mj-reveal]` and
 * `[data-mj-wipe]` element gets `is-in` the first time it enters the viewport.
 * New elements (route changes, lazy home blocks) are picked up by a MutationObserver.
 * A wipe element starts fully clipped, which gives it no visible area, so the
 * observer watches its parent and reveals the wipe when the parent arrives. Items
 * inside a `[data-mj-rail]` scroller are revealed together when the rail arrives.
 * Only a class is toggled; the CSS in 06-majmar/_motion.scss does the animation.
 */
export function useReveal(key: string) {
  useEffect(() => {
    const SELECTOR = '[data-mj-reveal]:not(.is-in),[data-mj-wipe]:not(.is-in)';
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll(SELECTOR).forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (targets.get(entry.target) ?? [entry.target]).forEach((el) => el.classList.add('is-in'));
          targets.delete(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    const watched = new WeakSet<Element>();
    // observed element -> the elements it reveals
    const targets = new Map<Element, Element[]>();
    const scan = () =>
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        // Wipes start fully clipped (no visible area) and items inside horizontal rails
        // can sit outside the viewport sideways, so both are revealed by their parent.
        const inRail = el.parentElement?.closest('[data-mj-rail]');
        const host = inRail ?? (el.hasAttribute('data-mj-wipe') && el.parentElement ? el.parentElement : el);
        targets.set(host, [...(targets.get(host) ?? []), el]);
        io.observe(host);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [key]);
}
