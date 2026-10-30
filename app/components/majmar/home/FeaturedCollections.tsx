/**
 * Featured Collections (home block `mj-collections`).
 * Editorial three-column layout: the first tile is tall, the others stack. Each tile
 * gains depth on hover (image eases in, caption lifts, gold edge light), and the
 * whole tile is one link with a visible focus ring.
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { artFor, itemsOf, MjMedia, SectionHead, urlOf, useBlockText } from './shared';

interface CollectionItem {
  image?: string;
  title?: unknown;
  caption?: unknown;
  url?: unknown;
}

export interface FeaturedCollectionsData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

/** Shown until the merchant adds collections, so a new install looks finished. */
const DEMO = [
  ['mj.collections.demo1_title', 'Oud & Amber', 'mj.collections.demo1_caption', 'Evening fragrances'],
  ['mj.collections.demo2_title', 'Fine Jewellery', 'mj.collections.demo2_caption', 'Gold, pearl, stone'],
  ['mj.collections.demo3_title', 'The Home Edit', 'mj.collections.demo3_caption', 'Objects for slow rooms'],
] as const;

export function FeaturedCollections({ data }: { data: FeaturedCollectionsData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<CollectionItem>(data.items, 'items');
  const demo: CollectionItem[] = DEMO.map(([tk, tf, ck, cf]) => ({ title: t(tk, tf), caption: t(ck, cf) }));
  const list = (items.length ? items : demo).slice(0, 6);

  return (
    <section className="mj-section mj-collections">
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.collections.overline', 'The collections')}
          title={tx(data.title, 'mj.collections.title', 'Chosen for the season')}
        />
        <ul className="mj-collections__grid">
          {list.map((item, i) => {
            const title = tx(item.title, '', '');
            const caption = tx(item.caption, '', '');
            const url = urlOf(item.url) || '/products';
            return (
              <li key={i} className={`mj-collections__item${i === 0 ? ' is-feature' : ''}`} data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
                <Link to={url} className="mj-tile">
                  <MjMedia
                    src={item.image}
                    fallback={i}
                    alt=""
                    art={artFor(i + 1)}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="mj-tile__media"
                  />
                  <span className="mj-tile__veil" aria-hidden="true" />
                  <span className="mj-tile__body">
                    {caption && <span className="mj-overline">{caption}</span>}
                    <span className="mj-h3 mj-tile__title">{title}</span>
                  </span>
                  <span className="mj-tile__edge" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
