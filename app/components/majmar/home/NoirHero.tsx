/**
 * Noir Hero (home block `mj-noir`): a full-screen cinematic hero.
 * The photo zooms very slowly; smoke and gold embers drift over it on a canvas (ambient,
 * never tied to scroll, paused off screen and for reduced motion). The headline can carry
 * a highlighted word with a moving gold sheen. Beside it, a glass "signature" card shows
 * one real product: photo, scent pyramid, longevity and sillage, and add to bag.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMotionAllowed } from '../../../hooks/useMotionAllowed';
import { imageOf, usePickedProducts } from '../../../hooks/useStoreProducts';
import { banner } from '../../../lib/bundledBanners';
import { scentProfile } from '../../../lib/scentProfile';
import { openMiniCart } from '../MiniCart';
import { priceOf } from './conversionUtils';
import { urlOf, useBlockText } from './shared';
import { HeroStage } from './HeroStage';

export interface NoirHeroData {
  image?: string;
  mobile_image?: string;
  overline?: unknown;
  title?: unknown;
  highlight?: unknown;
  text?: unknown;
  cta_text?: unknown;
  cta_url?: unknown;
  cta2_text?: unknown;
  cta2_url?: unknown;
  product?: unknown;
  show_card?: boolean;
  ghost?: unknown;
  /** 'photo' or '3d' (default): the turning 3D flacon in the mashrabiya arch. */
  media?: unknown;
  position?: number;
  [key: string]: unknown;
}

function useAtmosphere(canvasRef: React.RefObject<HTMLCanvasElement | null>, on: boolean) {
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !on) return;
    const g = c.getContext('2d');
    if (!g) return;
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = true;
    const fit = () => {
      W = c.width = Math.round(c.clientWidth);
      H = c.height = Math.round(c.clientHeight);
    };
    fit();
    type P = { smoke: boolean; x: number; y: number; r: number; vy: number; vx: number; life: number; max: number; ph: number };
    const make = (smoke: boolean): P => ({
      smoke,
      x: W * (0.1 + Math.random() * 0.8),
      y: H + Math.random() * 60,
      r: smoke ? 40 + Math.random() * 90 : 1 + Math.random() * 2,
      vy: smoke ? 0.25 + Math.random() * 0.35 : 0.5 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.3,
      life: 0,
      max: smoke ? 900 + Math.random() * 600 : 500 + Math.random() * 400,
      ph: Math.random() * 6,
    });
    const parts: P[] = [];
    for (let i = 0; i < 24; i++) {
      const p = make(true);
      p.y = Math.random() * H;
      p.life = Math.random() * p.max;
      parts.push(p);
    }
    for (let i = 0; i < 36; i++) {
      const p = make(false);
      p.y = Math.random() * H;
      parts.push(p);
    }
    const loop = () => {
      raf = 0;
      if (!visible) return;
      g.clearRect(0, 0, W, H);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.life++;
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.life / 120 + p.ph) * (p.smoke ? 0.35 : 0.2);
        const t = p.life / p.max;
        const fade = Math.sin(Math.PI * Math.min(1, t));
        if (p.smoke) {
          const rr = p.r * (1 + t * 1.4);
          const grd = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
          grd.addColorStop(0, `rgba(255,240,215,${0.05 * fade})`);
          grd.addColorStop(1, 'rgba(255,240,215,0)');
          g.fillStyle = grd;
          g.beginPath();
          g.arc(p.x, p.y, rr, 0, 7);
          g.fill();
        } else {
          g.fillStyle = `rgba(240,200,120,${0.85 * fade})`;
          g.beginPath();
          g.arc(p.x, p.y, p.r, 0, 7);
          g.fill();
        }
        if (t >= 1 || p.y < -150) parts[i] = make(p.smoke);
      }
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(c);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    ro?.observe(c);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro?.disconnect();
    };
  }, [canvasRef, on]);
}

export function NoirHero({ data }: { data: NoirHeroData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const { format } = useMoney();
  const motion = useMotionAllowed();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [adding, setAdding] = useState(false);
  useAtmosphere(canvasRef, motion);
  const isLead = (data.position ?? 1) === 1;
  const rawMedia = Array.isArray(data.media) ? data.media[0] : data.media;
  const mediaVal = typeof rawMedia === 'object' && rawMedia ? (rawMedia as { value?: unknown }).value : rawMedia;
  const is3d = mediaVal !== 'photo';

  const title = tx(data.title, 'mj.noir.title', 'Oud that stays after you');
  const hl = tx(data.highlight, 'mj.noir.highlight', 'stays');
  const at = hl ? title.indexOf(hl) : -1;
  const Title = isLead ? 'h1' : 'h2';
  const { products } = usePickedProducts(data.product, 1);
  const product = data.show_card === false ? undefined : products[0];
  const profile = product ? scentProfile(product) : null;
  const add = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await window.salla?.cart?.addItem?.({ id: Number(product.id), quantity: 1 });
      openMiniCart();
    } catch {
      if (product.url) window.location.assign(product.url);
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className={`mj-noir${is3d ? ' mj-noir--3d' : ''}`} aria-label={title}>
      <picture className="mj-noir__media">
        {data.mobile_image && <source media="(max-width: 760px)" srcSet={data.mobile_image} />}
        <img
          src={data.image || banner('noir-hero')}
          alt=""
          width={1600}
          height={900}
          loading={isLead ? 'eager' : 'lazy'}
          {...(isLead ? { fetchPriority: 'high' as const } : {})}
        />
      </picture>
      {is3d && (
        <div className="mj-noir__stage">
          <span className="mj-noir__halo" aria-hidden="true" />
          <HeroStage sticker="" stickerBadge="" label={title} priority={isLead} showPrice={false} />
          <span className="mj-noir__plinth" aria-hidden="true" />
        </div>
      )}
      <canvas ref={canvasRef} className="mj-noir__fx" aria-hidden="true" />
      <span className="mj-noir__arch" aria-hidden="true" />
      <span className="mj-noir__scrim" aria-hidden="true" />
      <span className="mj-noir__ghost" aria-hidden="true">{tx(data.ghost, 'mj.noir.ghost', 'Oud')}</span>
      <span className="mj-noir__frame" aria-hidden="true" />
      <span className="mj-noir__vert" aria-hidden="true">
        MAJMAR · MAISON D&apos;OUD · {tx(data.overline, 'mj.noir.overline', 'Diriyah edition 2026')}
      </span>
      <div className="mj-container mj-noir__in">
        <div className="mj-noir__copy">
          <p className="mj-noir__eyebrow">
            <i className="mj-pip" aria-hidden="true" />
            {tx(data.overline, 'mj.noir.overline', 'Diriyah edition 2026')}
          </p>
          <Title className="mj-noir__title">
            {at < 0 ? (
              title
            ) : (
              <>
                {title.slice(0, at)}
                <span className="mj-sheen">{hl}</span>
                {title.slice(at + hl.length)}
              </>
            )}
          </Title>
          <p className="mj-noir__text">
            {tx(data.text, 'mj.noir.text', 'Not every scent wants to please you; some want to stay in your memory. Cambodian oud aged ten years.')}
          </p>
          <span className="mj-noir__orn" aria-hidden="true" />
          <div className="mj-noir__ctas">
            <Link to={urlOf(data.cta_url) || '/products'} className="mj-btn mj-btn--gold-solid">
              {tx(data.cta_text, 'mj.noir.cta', 'Shop the collection')}
            </Link>
            {urlOf(data.cta2_url) && (
              <Link to={urlOf(data.cta2_url)} className="mj-btn mj-btn--glass">
                {tx(data.cta2_text, 'mj.noir.cta2', 'Discover the looks')}
              </Link>
            )}
          </div>
          <dl className="mj-noir__stats">
            <div>
              <dt>{t('mj.noir.s1', '12 hrs')}</dt>
              <dd>{t('mj.noir.s1l', 'on skin')}</dd>
            </div>
            <div>
              <dt>{t('mj.noir.s2', '10 yrs')}</dt>
              <dd>{t('mj.noir.s2l', 'aged oil')}</dd>
            </div>
            <div>
              <dt>{t('mj.noir.s3', '4.9')}</dt>
              <dd>{t('mj.noir.s3l', 'client rating')}</dd>
            </div>
          </dl>
        </div>
        {product && (
          <aside className="mj-sig" aria-label={product.name}>
            <div className="mj-sig__top">
              <Link to={product.url} className="mj-sig__img">
                <img src={imageOf(product)} alt="" loading="lazy" />
              </Link>
              <div>
                <p className="mj-sig__over">
                  <i className="mj-pip" aria-hidden="true" />
                  {t('mj.noir.signature', 'Signature of the night')}
                </p>
                <h2 className="mj-sig__name">
                  <Link to={product.url}>{product.name}</Link>
                </h2>
              </div>
            </div>
            {profile && (profile.top.length || profile.heart.length || profile.base.length) ? (
              <dl className="mj-sig__pyr">
                {(
                  [
                    [t('mj.notes.top', 'Top'), profile.top],
                    [t('mj.notes.heart', 'Heart'), profile.heart],
                    [t('mj.notes.base', 'Base'), profile.base],
                  ] as [string, string[]][]
                )
                  .filter(([, v]) => v.length)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v[0]}</dd>
                    </div>
                  ))}
              </dl>
            ) : null}
            {profile?.longevity ? (
              <p className="mj-sig__bar">
                {t('mj.notes.longevity', 'Longevity')}
                <i style={{ ['--v' as string]: `${profile.longevity * 20}%` }} />
              </p>
            ) : null}
            <button type="button" className="mj-btn mj-btn--gold-solid mj-sig__add" onClick={add} disabled={adding} aria-busy={adding}>
              {t('mj.noir.add', 'Add to your collection')} · {format(priceOf(product))}
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}
