/**
 * Scent Families (home block `mj-families`).
 * Fast discovery by oud type: category cards with a photo and a name, each one link.
 * A horizontal snap rail on mobile, six across from tablet up; straight after the hero the
 * row overlaps the hero's lower edge. Up to 8 merchant items; until the merchant adds any,
 * six default oud types show (Cambodi, Hindi, oud oil, muattar, mukhallat, bakhoor) with
 * photos that ship with the theme, linking to the store search.
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { itemsOf, MjMedia, SectionHead, urlOf, useBlockText, type ArtKind } from './shared';

interface FamilyItem {
  image?: string;
  title?: unknown;
  url?: unknown;
}

export interface ScentFamiliesData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

/** Default card photos, bundled so the block shows oud even before the store has products. */
const PHOTOS = import.meta.glob('../../../assets/families/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const photo = (name: string) => PHOTOS[`../../../assets/families/${name}.webp`];

/** [translation key, English fallback, art] for the default families. */
const DEFAULTS: [string, string, ArtKind][] = [
  ['mj.families.cambodi', 'Cambodi', 'oud'],
  ['mj.families.hindi', 'Hindi', 'oud'],
  ['mj.families.oil', 'Oud oil', 'flacon'],
  ['mj.families.muattar', 'Muattar', 'oud'],
  ['mj.families.mukhallat', 'Mukhallat', 'bottle'],
  ['mj.families.bakhoor', 'Bakhoor', 'mabkhara'],
];
const ARTS: ArtKind[] = ['oud', 'flacon', 'bottle', 'rose', 'mabkhara', 'giftbox'];

export function ScentFamilies({ data }: { data: ScentFamiliesData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<FamilyItem>(data.items, 'items').slice(0, 8);
  const list = items.length
    ? items.map((it, i) => ({ image: it.image, bundled: false, name: tx(it.title, '', ''), url: urlOf(it.url), art: ARTS[i % ARTS.length] }))
    : DEFAULTS.map(([k, en, art]) => {
        const name = t(k, en);
        return { image: photo(k.split('.').pop() ?? ''), bundled: true, name, url: `/search?q=${encodeURIComponent(name)}`, art };
      });

  return (
    <section className="mj-section mj-families">
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.families.overline', 'The world of oud')}
          title={tx(data.title, 'mj.families.title', 'Choose your oud')}
          align="center"
        />
      </div>
      <ul className="mj-families__rail" data-mj-rail="">
        {list.map((f, i) => (
          <li key={i} className="mj-families__item" data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
            <Link to={f.url || '/products'} className="mj-families__link">
              <span className="mj-families__disc">
                {f.bundled ? (
                  <img className="mj-families__photo" src={f.image} alt="" width={480} height={480} loading="lazy" decoding="async" />
                ) : (
                  <MjMedia src={f.image} alt="" art={f.art} fallback={i} ratio="1/1" sizes="240px" />
                )}
              </span>
              <span className="mj-families__name">{f.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
