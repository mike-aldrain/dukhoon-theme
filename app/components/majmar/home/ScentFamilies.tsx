/**
 * Scent Families (home block `mj-families`).
 * Fast discovery by scent family: round tiles with an image (or perfume-house art) and a
 * name, each one link. A horizontal snap rail on mobile, a grid from tablet up. Up to 8
 * merchant items; until the merchant adds any, six default families show (Oud, Musk,
 * Amber, Rose, Fresh, Bakhoor) linking to the store search.
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

/** [translation key, English fallback, art] for the default families. */
const DEFAULTS: [string, string, ArtKind][] = [
  ['mj.families.oud', 'Oud', 'oud'],
  ['mj.families.musk', 'Musk', 'flacon'],
  ['mj.families.amber', 'Amber', 'bottle'],
  ['mj.families.rose', 'Rose', 'rose'],
  ['mj.families.fresh', 'Fresh', 'flacon'],
  ['mj.families.bakhoor', 'Bakhoor', 'mabkhara'],
];
const ARTS: ArtKind[] = ['oud', 'flacon', 'bottle', 'rose', 'mabkhara', 'giftbox'];

export function ScentFamilies({ data }: { data: ScentFamiliesData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<FamilyItem>(data.items, 'items').slice(0, 8);
  const list = items.length
    ? items.map((it, i) => ({ image: it.image, name: tx(it.title, '', ''), url: urlOf(it.url), art: ARTS[i % ARTS.length] }))
    : DEFAULTS.map(([k, en, art]) => {
        const name = t(k, en);
        return { image: undefined, name, url: `/search?q=${encodeURIComponent(name)}`, art };
      });

  return (
    <section className="mj-section mj-families">
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.families.overline', 'Scent families')}
          title={tx(data.title, 'mj.families.title', 'Find your note')}
          align="center"
        />
      </div>
      <ul className="mj-families__rail" data-mj-rail="">
        {list.map((f, i) => (
          <li key={i} className="mj-families__item" data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
            <Link to={f.url || '/products'} className="mj-families__link">
              <span className="mj-families__disc">
                <MjMedia src={f.image} alt="" art={f.art} ratio="1/1" sizes="160px" />
              </span>
              <span className="mj-families__name">{f.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
