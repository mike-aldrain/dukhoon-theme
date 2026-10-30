import { useEffect, useState } from 'react';

type Summary = { count?: number | string | null } | undefined;

/**
 * Live cart line count. Starts at 0 (SSR-safe), reads the SDK's stored count once,
 * then follows `cart::updated`. Subscribes by name on `salla.event` and waits for
 * the `theme::ready` document event when the SDK is not up yet (docs: React to cart events).
 */
export function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onUpdated = (...args: unknown[]) => setCount(Number((args[0] as Summary)?.count) || 0);
    let bound = false;
    const bind = () => {
      const sdk = window.salla;
      if (bound || !sdk?.event?.on) return;
      setCount(Number(sdk.storage?.get?.('cart.summary.count', 0)) || 0);
      sdk.event.on('cart::updated', onUpdated);
      bound = true;
    };
    bind();
    document.addEventListener('theme::ready', bind);
    return () => {
      document.removeEventListener('theme::ready', bind);
      if (bound) window.salla?.event?.off?.('cart::updated', onUpdated);
    };
  }, []);

  return count;
}
