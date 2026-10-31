/**
 * Store Slider (home block `mj-slider`): the main banner slider with a flash-offer card
 * beside it, the classic Salla store opening.
 *
 * Slides are a native scroll-snap track, so they swipe on touch and work without script;
 * dots and a slow auto-advance (paused on hover, focus and reduced motion) drive it.
 * Each slide has an image (and an optional phone image), a short line, a headline, a
 * sentence and a button. Without merchant slides, two bundled oud slides show.
 *
 * The offer card shows one real store product (picked, or the latest product) with its
 * price and an add-to-bag button. The countdown only shows when the merchant sets an end
 * time, so the theme never invents urgency.
 *
 * LCP: the first slide image is eager with fetchpriority high.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { imageOf, usePickedProducts } from '../../../hooks/useStoreProducts';
import { banner } from '../../../lib/bundledBanners';
import { openMiniCart } from '../MiniCart';
import { priceOf } from './conversionUtils';
import { itemsOf, urlOf, useBlockText } from './shared';

interface SlideItem {
  image?: string;
  mobile_image?: string;
  overline?: unknown;
  title?: unknown;
  text?: unknown;
  button?: unknown;
  url?: unknown;
  tone?: unknown;
}

export interface HeroSliderData {
  slides?: unknown;
  show_offer?: boolean;
  offer_title?: unknown;
  offer_product?: unknown;
  offer_ends?: unknown;
  position?: number;
  [key: string]: unknown;
}

const valueOf = (raw: unknown): string => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return typeof v === 'object' && v ? String((v as { value?: unknown }).value ?? '') : String(v ?? '');
};

/**
 * Remaining time until `end` as three numbers: hours, minutes, seconds (or days, hours,
 * minutes when more than 99 hours are left); null when unset or past.
 */
function useCountdown(end: string): [number, number, number] | null {
  const target = end ? Date.parse(end.replace(' ', 'T')) : NaN;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!Number.isFinite(target)) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  if (!Number.isFinite(target) || now === null || target <= now) return null;
  const s = Math.floor((target - now) / 1000);
  if (s >= 100 * 3600) return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60];
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60];
}

export function HeroSlider({ data }: { data: HeroSliderData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const { format } = useMoney();
  const motionAllowed = useMotionAllowed();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [adding, setAdding] = useState(false);
  const isLead = (data.position ?? 1) === 1;

  const merchant = itemsOf<SlideItem>(data.slides, 'slides').slice(0, 6);
  const slides = merchant.length
    ? merchant.map((s) => ({
        image: s.image || '',
        mobile: s.mobile_image || '',
        overline: tx(s.overline, '', ''),
        title: tx(s.title, '', ''),
        text: tx(s.text, '', ''),
        button: tx(s.button, '', ''),
        url: urlOf(s.url),
        dark: valueOf(s.tone) === 'dark',
      }))
    : [
        {
          image: banner('slide-royal'),
          mobile: '',
          overline: t('mj.slider.s1_over', 'New 2026 edition'),
          title: t('mj.slider.s1_title', 'Oud Royal: oud that stays after you'),
          text: t('mj.slider.s1_text', 'Aged Cambodian oud with a touch of saffron. Twelve hours on skin.'),
          button: t('mj.slider.shop', 'Shop now'),
          url: '/products',
          dark: false,
        },
        {
          image: banner('slide-oils'),
          mobile: '',
          overline: t('mj.slider.s2_over', 'Oud oils'),
          title: t('mj.slider.s2_title', 'Genuine oud oils'),
          text: t('mj.slider.s2_text', 'Cambodi, Hindi and mukhallat. One tola lasts for months.'),
          button: t('mj.slider.s2_button', 'Discover the oils'),
          url: '/products',
          dark: true,
        },
      ];

  const go = (i: number) => {
    const track = trackRef.current;
    const slide = track?.children[i] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: motionAllowed ? 'smooth' : 'auto' });
  };

  // Active dot follows the scroll position (swipe, dots and auto-advance alike).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { root: track, threshold: 0.6 }
    );
    Array.from(track.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [slides.length]);

  useEffect(() => {
    if (!motionAllowed || paused || slides.length < 2) return;
    const id = window.setTimeout(() => go((active + 1) % slides.length), 6000);
    return () => window.clearTimeout(id);
    // `go` reads the ref only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused, motionAllowed, slides.length]);

  // Offer card: one real product.
  const showOffer = data.show_offer !== false;
  const { products } = usePickedProducts(data.offer_product, 1);
  const offer = showOffer ? products[0] : undefined;
  const countdown = useCountdown(valueOf(data.offer_ends));
  const addOffer = async () => {
    if (!offer) return;
    setAdding(true);
    try {
      await window.salla?.cart?.addItem?.(Number(offer.id), 1);
      openMiniCart();
    } catch {
      if (offer.url) window.location.assign(offer.url);
    } finally {
      setAdding(false);
    }
  };

  const Title = isLead ? 'h1' : 'h2';

  return (
    <section className="mj-store-hero" aria-label={t('mj.slider.label', 'Featured')}>
      <div className={`mj-container mj-store-hero__grid${offer ? '' : ' is-solo'}`}>
        <div
          className="mj-slider"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div ref={trackRef} className="mj-slider__track" aria-roledescription="carousel">
            {slides.map((s, i) => {
              const Heading = i === 0 ? Title : 'h2';
              return (
                <div
                  key={i}
                  data-i={i}
                  className={`mj-slide${s.dark ? ' mj-slide--dark' : ''}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} / ${slides.length}`}
                >
                  <picture className="mj-slide__media">
                    {s.mobile && <source media="(max-width: 760px)" srcSet={s.mobile} />}
                    <img
                      src={s.image}
                      alt=""
                      width={1600}
                      height={720}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding={i === 0 ? 'sync' : 'async'}
                      {...(i === 0 && isLead ? { fetchPriority: 'high' as const } : {})}
                    />
                  </picture>
                  <div className="mj-slide__copy">
                    {s.overline && <p className="mj-slide__over">{s.overline}</p>}
                    {s.title && <Heading className="mj-slide__title">{s.title}</Heading>}
                    {s.text && <p className="mj-slide__text">{s.text}</p>}
                    {s.button && s.url && (
                      <Link to={s.url} className={`mj-btn ${s.dark ? 'mj-btn--gold-solid' : 'mj-btn--ink'}`}>
                        {s.button}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {slides.length > 1 && (
            <div className="mj-slider__dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === active ? 'is-on' : undefined}
                  aria-label={t('mj.slider.go', 'Slide {{n}}').replace('{{n}}', String(i + 1))}
                  aria-current={i === active}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          )}
        </div>

        {offer && (
          <aside className="mj-offer" aria-label={tx(data.offer_title, 'mj.slider.offer', 'Flash offer')}>
            <div className="mj-offer__head">
              <h2 className="mj-offer__title">{tx(data.offer_title, 'mj.slider.offer', 'Flash offer')}</h2>
              {countdown && (
                <p className="mj-offer__timer" aria-label={t('mj.slider.ends', 'Ends in')}>
                  {countdown.map((n, i) => (
                    <span key={i}>{String(n).padStart(2, '0')}</span>
                  ))}
                </p>
              )}
            </div>
            <Link to={offer.url} className="mj-offer__img">
              <img src={imageOf(offer)} alt={offer.name} loading="lazy" decoding="async" />
            </Link>
            <Link to={offer.url} className="mj-offer__name">
              {offer.name}
            </Link>
            <p className="mj-offer__price">
              <b>{format(priceOf(offer))}</b>
              {offer.is_on_sale && offer.regular_price ? <s>{format(Number(offer.regular_price))}</s> : null}
            </p>
            <button type="button" className="mj-btn mj-btn--ink" onClick={addOffer} disabled={adding} aria-busy={adding}>
              {t('mj.film.add', 'Add to bag')}
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}
