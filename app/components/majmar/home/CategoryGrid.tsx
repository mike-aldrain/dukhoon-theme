/**
 * Category Grid (home block `mj-categories`): "shop by category" as round story-style
 * icons with gold rings (default, the pattern Saudi shoppers know from apps), or a bento of
 * photo tiles. The first tile is tall on desktop and wide on phones; each tile has a frosted
 * caption with the name and a short note, and links to its category. Up to five merchant
 * tiles; until the merchant adds any, five bundled oud tiles show (perfumes, oils, wood,
 * bakhoor, gift sets) linking to the store search.
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { banner } from '../../../lib/bundledBanners';
import { itemsOf, SectionHead, urlOf, useBlockText } from './shared';

interface Tile {
  image?: string;
  title?: unknown;
  caption?: unknown;
  url?: unknown;
}

export interface CategoryGridData {
  title?: unknown;
  items?: unknown;
  link_text?: unknown;
  link_url?: unknown;
  layout?: unknown;
  overline?: unknown;
  [key: string]: unknown;
}

const DEFAULTS: [string, string, string][] = [
  ['cat-perfume', 'mj.cats.perfume', 'Oud perfumes'],
  ['cat-oil', 'mj.cats.oil', 'Oud oils'],
  ['cat-wood', 'mj.cats.wood', 'Oud wood'],
  ['cat-mukhallat', 'mj.cats.mukhallat', 'Mukhallat'],
  ['cat-bakhoor', 'mj.cats.bakhoor', 'Bakhoor and burners'],
  ['cat-gifts', 'mj.cats.gifts', 'Gift sets'],
];

export function CategoryGrid({ data }: { data: CategoryGridData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const raw = Array.isArray(data.layout) ? data.layout[0] : data.layout;
  const layoutVal = typeof raw === 'object' && raw ? (raw as { value?: unknown }).value : raw;
  const stories = layoutVal !== 'bento';
  const items = itemsOf<Tile>(data.items, 'items').slice(0, stories ? 10 : 5);
  const tiles = items.length
    ? items.map((it) => ({ image: it.image || '', name: tx(it.title, '', ''), note: tx(it.caption, '', ''), url: urlOf(it.url) || '/products' }))
    : DEFAULTS.filter(([img]) => stories || img !== 'cat-mukhallat').map(([img, key, en]) => {
        const name = t(key, en);
        return { image: banner(img), name, note: t('mj.cats.shop', 'Shop'), url: `/search?q=${encodeURIComponent(name)}` };
      });
  const linkUrl = urlOf(data.link_url);

  if (stories) {
    return (
      <section className="mj-section mj-cats mj-cats--stories">
        <div className="mj-container">
          <SectionHead
            overline={tx(data.overline, 'mj.cats.overline', 'Shop by category')}
            title={tx(data.title, 'mj.cats.stories_title', 'The world of oud')}
            align="center"
          />
          <ul className="mj-stories">
            {tiles.map((tile, i) => (
              <li key={i}>
                <Link to={tile.url} className="mj-stories__item">
                  <span className="mj-stories__ring">{tile.image && <img src={tile.image} alt="" loading="lazy" decoding="async" />}</span>
                  <b>{tile.name}</b>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="mj-section mj-cats">
      <div className="mj-container">
        <SectionHead
          title={tx(data.title, 'mj.cats.title', 'Shop by category')}
          link={linkUrl ? { url: linkUrl, label: tx(data.link_text, 'mj.cats.all', 'All categories') } : undefined}
        />
        <ul className={`mj-cats__grid mj-cats__grid--${tiles.length}`}>
          {tiles.map((tile, i) => (
            <li key={i} className="mj-cats__item">
              <Link to={tile.url} className="mj-cats__tile">
                {tile.image && <img src={tile.image} alt="" loading="lazy" decoding="async" />}
                <span className="mj-cats__cap">
                  <b>{tile.name}</b>
                  {tile.note && <span>{tile.note}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
