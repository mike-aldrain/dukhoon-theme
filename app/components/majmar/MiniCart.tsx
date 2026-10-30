/**
 * MiniCart: the header bag button and the slide-in cart drawer.
 *
 * Data: the cart id comes from the SDK, the cart from the engine `cart` API query
 * (docs: Cart data). Quantity and remove go through `window.salla.cart`, then the
 * query is invalidated. Any part of the theme can open the drawer by dispatching
 * the `mj:minicart` window event.
 * A11y: real dialog (aria-modal, labelled), focus trapped and restored, Escape closes,
 * page scroll locked while open. The drawer slides from the inline end in both directions.
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cart as cartApi } from '@salla.sa/twilight-theme-engine/api/cart';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useCartCount } from '../../hooks/useCartCount';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useScrollLock } from '../../hooks/useScrollLock';
import { CloseIcon, Delete01Icon, MinusIcon, PlusIcon, ShoppingBagIcon } from '../icons';

export const openMiniCart = () => window.dispatchEvent(new Event('mj:minicart'));

type Amount = number | { amount: number } | string | null | undefined;
const amountOf = (v: Amount) =>
  typeof v === 'object' && v !== null ? Number(v.amount) : Number(v ?? 0);

export function MiniCartButton() {
  const { t } = useTranslation();
  const count = useCartCount();
  return (
    <button
      type="button"
      className="header-action mj-bag"
      aria-label={t('mj.cart.open', 'Open bag') + (count ? ` (${count})` : '')}
      aria-haspopup="dialog"
      onClick={openMiniCart}
    >
      <ShoppingBagIcon aria-hidden="true" />
      {count > 0 && (
        <span className="mj-bag__count" aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Mounts the drawer on the first `mj:minicart` event only, so its code and the cart
 * query stay off the first page load. The drawer then handles later opens itself.
 */
export function MiniCartHost() {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (armed) return;
    const arm = () => setArmed(true);
    window.addEventListener('mj:minicart', arm);
    return () => window.removeEventListener('mj:minicart', arm);
  }, [armed]);
  if (!armed) return null;
  return (
    <Suspense fallback={null}>
      <LazyDrawer startOpen />
    </Suspense>
  );
}

const LazyDrawer = lazy(() => import('./MiniCart').then((m) => ({ default: m.MiniCartDrawer })));

export function MiniCartDrawer({ startOpen = false }: { startOpen?: boolean }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [cartId, setCartId] = useState<number | null>(null);
  const opened = useRef(false);
  const [busy, setBusy] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      window.salla?.cart?.api
        ?.getCurrentCartId?.()
        .then((id: unknown) => setCartId(Number(id) || null))
        .catch(() => setCartId(null));
    };
    window.addEventListener('mj:minicart', onOpen);
    // Mounted by the first click: open straight away (once).
    if (startOpen && !opened.current) {
      opened.current = true;
      onOpen();
    }
    return () => window.removeEventListener('mj:minicart', onOpen);
  }, [startOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useDialogFocus(panelRef, open);
  useScrollLock(open);

  const query = cartApi.queries.detail(cartId ?? 0);
  const { data, isLoading } = useQuery({ ...query, enabled: open && !!cartId });

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: query.queryKey }),
    [queryClient, query.queryKey]
  );

  const change = async (id: string, quantity: number) => {
    setBusy(id);
    try {
      if (quantity < 1) await window.salla?.cart?.deleteItem?.(id);
      else await window.salla?.cart?.updateItem?.({ id, quantity });
      await refresh();
    } catch {
      /* the SDK shows its own error toast */
    } finally {
      setBusy(null);
    }
  };

  const items = data?.items ?? [];
  const bar = data?.free_shipping_bar;

  return (
    <div className={`mj-drawer${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="mj-drawer__scrim"
        tabIndex={-1}
        aria-label={t('mj.close', 'Close')}
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        className="mj-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mj-minicart-title"
        tabIndex={-1}
        inert={!open}
      >
        <header className="mj-drawer__head">
          <h2 id="mj-minicart-title" className="mj-h3">
            {t('mj.cart.title', 'Your bag')}
          </h2>
          <button
            type="button"
            className="mj-icon-btn"
            aria-label={t('mj.close', 'Close')}
            onClick={() => setOpen(false)}
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </header>

        {bar && !bar.has_free_shipping && (
          <div className="mj-drawer__ship">
            <p className="mj-caption">
              {t('mj.cart.free_ship_left', 'Remaining for complimentary delivery:')}{' '}
              <strong className="text-mj-gold-ink">{format(amountOf(bar.remaining))}</strong>
            </p>
            <span className="mj-drawer__ship-track">
              <span style={{ transform: `scaleX(${Math.min(100, bar.percent) / 100})` }} />
            </span>
          </div>
        )}

        <div className="mj-drawer__body" aria-live="polite" aria-busy={isLoading}>
          {isLoading && <div className="mj-drawer__loading" aria-hidden="true" />}
          {!isLoading && items.length === 0 && (
            <div className="mj-drawer__empty">
              <ShoppingBagIcon aria-hidden="true" width={40} height={40} />
              <p className="mj-body-l">{t('mj.cart.empty', 'Your bag is waiting to be filled.')}</p>
              <button type="button" className="mj-btn mj-btn--ghost" onClick={() => setOpen(false)}>
                {t('mj.cart.continue', 'Continue browsing')}
              </button>
            </div>
          )}
          <ul className="mj-drawer__list">
            {items.map((item) => (
              <li key={item.id} className={`mj-line${busy === item.id ? ' is-busy' : ''}`}>
                <Link to={item.url} className="mj-line__img" onClick={() => setOpen(false)}>
                  <img src={item.product_image} alt="" width={80} height={100} loading="lazy" />
                </Link>
                <div className="mj-line__info">
                  <Link to={item.url} className="mj-line__name" onClick={() => setOpen(false)}>
                    {item.product_name}
                  </Link>
                  {item.options?.length ? (
                    <p className="mj-caption">
                      {item.options.map((o) => [o.name, o.value].filter(Boolean).join(': ')).join(' · ')}
                    </p>
                  ) : null}
                  <div className="mj-line__row">
                    {item.is_hidden_quantity ? (
                      <span className="mj-caption">× {item.quantity}</span>
                    ) : (
                      <div className="mj-qty" role="group" aria-label={t('mj.cart.quantity', 'Quantity')}>
                        <button
                          type="button"
                          aria-label={t('mj.cart.decrease', 'Decrease quantity')}
                          disabled={busy === item.id}
                          onClick={() => change(item.id, item.quantity - 1)}
                        >
                          <MinusIcon aria-hidden="true" width={14} height={14} />
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={t('mj.cart.increase', 'Increase quantity')}
                          disabled={
                            busy === item.id ||
                            (item.max_quantity != null && item.quantity >= item.max_quantity)
                          }
                          onClick={() => change(item.id, item.quantity + 1)}
                        >
                          <PlusIcon aria-hidden="true" width={14} height={14} />
                        </button>
                      </div>
                    )}
                    <span className="mj-line__price">{format(amountOf(item.total as Amount))}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="mj-icon-btn mj-line__remove"
                  aria-label={t('mj.cart.remove', 'Remove {{name}}', { name: item.product_name })}
                  disabled={busy === item.id}
                  onClick={() => change(item.id, 0)}
                >
                  <Delete01Icon aria-hidden="true" width={18} height={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {items.length > 0 && data && (
          <footer className="mj-drawer__foot">
            <div className="mj-drawer__total">
              <span>{t('mj.cart.subtotal', 'Subtotal')}</span>
              <strong>{format(amountOf(data.total as Amount))}</strong>
            </div>
            <p className="mj-caption">{t('mj.cart.taxes_note', 'Delivery and taxes are confirmed at checkout.')}</p>
            <Link to="/cart" className="mj-btn mj-btn--gold w-full" onClick={() => setOpen(false)}>
              {t('mj.cart.checkout', 'Review bag and checkout')}
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}
