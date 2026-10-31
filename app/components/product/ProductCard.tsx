import { useEffect, useRef, useState, type ComponentProps, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { ProductCard as EngineProductCard } from '@salla.sa/twilight-theme-engine/product';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { registerNativeBookingHook } from '../../lib/nativeBooking';
import { WishlistHeartButton } from './WishlistHeartButton';
import { useMajmar } from '../../hooks/useMajmar';

type ProductCardProps = ComponentProps<typeof EngineProductCard>;

/** Colour-block fields for the bright palette, picked from the product id so a card keeps its colour. */
const TONES = ['saffron', 'rose', 'coral', 'lilac', 'butter', 'mint'] as const;

/**
 * Thin wrapper over the engine `ProductCard`.
 *
 * After mount (and whenever the lazily-hydrated bits appear):
 *  - sets `display: none` inline on a vertical card's own image-corner
 *    wishlist button (a plain style mutation on an existing node — safe,
 *    unlike moving it; see below), and portals a theme-owned wishlist button
 *    into `.s-product-card-content-footer` instead. Hiding it inline rather
 *    than only through `04-components/product.scss` keeps this component
 *    correct on its own — that stylesheet's rule hides it too, from the
 *    first paint.
 *  - The engine's button is a React-owned node; physically moving it there
 *    with `appendChild` (the previous approach) left React still tracking it
 *    as a child of the image container, so on unmount (e.g. navigating away)
 *    React tried to `removeChild` it from a parent it was no longer inside,
 *    throwing `NotFoundError`. A portal keeps this button fully React-managed
 *    at its real DOM location instead.
 *  - sets `loader-position="center"` on the add-to-cart button (grid + list).
 * Inside the Salla app, a booking product's "Book now" fires `mobile::booking.open`
 * instead of opening the booking page (`lib/nativeBooking.ts`).
 * Styling: `04-components/product.scss`.
 *
 * Majmar additions (styles in `06-majmar/_product.scss`):
 *  - The card sits in a `.mj-card` shell with a `data-tone` colour field (bright palette).
 *  - The shell: On fine pointers and with the "tilt" hover
 *    setting, pointer position drives `--rx` / `--ry` (up to `--mj-tilt-max`, 6deg),
 *    written straight to the shell's style in a rAF, so React does not re-render.
 *  - A gold edge light sweeps across on hover (CSS only).
 *  - When the product carries a second gallery image (detail responses; list
 *    responses only include the main image), it is portalled into the engine's
 *    image box and cross-fades in on hover.
 */
export function ProductCard(props: ProductCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [footerEl, setFooterEl] = useState<HTMLElement | null>(null);
  const [imageEl, setImageEl] = useState<HTMLElement | null>(null);
  const { card } = useMajmar();
  const frame = useRef(0);
  const altImage = card.secondImage ? props.product.images?.[1]?.url : undefined;

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (card.hover !== 'tilt' || e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      // -0.5..0.5 from the centre; the image tilts up toward the cursor.
      el.style.setProperty('--rx', (((clientY - r.top) / r.height - 0.5) * -2).toFixed(3));
      el.style.setProperty('--ry', (((clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    });
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frame.current);
    e.currentTarget.style.setProperty('--rx', '0');
    e.currentTarget.style.setProperty('--ry', '0');
  };

  useEffect(() => {
    registerNativeBookingHook();
    const root = ref.current;
    if (!root) return;

    const sync = () => {
      root.querySelectorAll<HTMLElement>('salla-add-product-button').forEach((el) => {
        // engine ships the card button fill="outline"; make it solid + centre its spinner
        el.setAttribute('fill', 'solid');
        el.setAttribute('loader-position', 'center');
      });

      const vertical = root.querySelector<HTMLElement>('.s-product-card-vertical');
      if (!vertical) return;

      const originalWishlistBtn = vertical.querySelector<HTMLElement>(
        '.s-product-card-image .s-product-card-wishlist-btn'
      );
      if (originalWishlistBtn) originalWishlistBtn.style.display = 'none';

      setFooterEl(vertical.querySelector<HTMLElement>('.s-product-card-content-footer'));
      setImageEl(vertical.querySelector<HTMLElement>('.s-product-card-image'));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`mj-card${altImage ? ' has-alt' : ''}`}
      data-tone={TONES[Math.abs(Number(props.product.id) || 0) % TONES.length]}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <EngineProductCard {...props} />
      <span className="mj-card__sweep" aria-hidden="true" />
      {imageEl &&
        altImage &&
        createPortal(
          <img className="mj-card__alt" src={altImage} alt="" loading="lazy" decoding="async" />,
          imageEl
        )}
      {footerEl &&
        createPortal(
          // List responses send the id as a numeric string; the wishlist holds numbers.
          <FooterWishlistButton productId={Number(props.product.id)} />,
          footerEl
        )}
    </div>
  );
}

/** Same button the engine renders for `horizontal`/`fullImage` layouts
 * (`ProductCardContent`, theme-engine) — reused here for `vertical`, which
 * the engine only ever places in the image corner. */
function FooterWishlistButton({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const inWishlist = wishlist.has(productId);

  return (
    <WishlistHeartButton
      productId={productId}
      ariaLabel={t('pages.wishlist.toggle', 'Add or remove to wishlist')}
      className={`s-product-card-wishlist-btn animated ${inWishlist ? 's-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}`}
      onClick={() => wishlist.toggle(productId)}
    />
  );
}
