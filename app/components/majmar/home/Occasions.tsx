/**
 * Occasions (home block `mj-occasions`): gift paths for the Saudi calendar, as arched
 * tiles on the brand colour. Each tile has a gold line icon (or a merchant photo), a name, a
 * short line and a link. Defaults: Ramadan, Eid, Founding Day and weddings.
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { itemsOf, SectionHead, urlOf, useBlockText } from './shared';

type Icon = 'ramadan' | 'eid' | 'founding' | 'wedding' | 'gift';

const ICONS: Record<Icon, string> = {
  ramadan: 'M30 8a16 16 0 1 0 14 24A13 13 0 1 1 30 8zM44 10l1.5 3 3.2.5-2.3 2.2.6 3.2-3-1.5-2.9 1.5.5-3.2-2.3-2.2 3.2-.5z',
  eid: 'M10 22h36v24H10zM8 16h40v6H8zM28 16v30M28 16c-3-7-12-7-10-1M28 16c3-7 12-7 10-1',
  founding: 'M28 48V22M28 22c-4-8-14-8-18-4 7-1 12 0 18 4zM28 22c4-8 14-8 18-4-7-1-12 0-18 4zM28 22c-8-3-16 2-17 8 6-4 11-6 17-8zM28 22c8-3 16 2 17 8-6-4-11-6-17-8zM20 48h16',
  wedding: 'M33 32a11 11 0 1 1-22 0 11 11 0 0 1 22 0zM45 32a11 11 0 1 1-22 0 11 11 0 0 1 22 0zM34 15l3-5h-6z',
  gift: 'M10 22h36v24H10zM8 16h40v6H8zM28 16v30',
};

interface OccItem {
  icon?: unknown;
  image?: string;
  title?: unknown;
  text?: unknown;
  url?: unknown;
}

export interface OccasionsData {
  overline?: unknown;
  title?: unknown;
  items?: unknown;
  [key: string]: unknown;
}

const valueOf = (raw: unknown): string => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return typeof v === 'object' && v ? String((v as { value?: unknown }).value ?? '') : String(v ?? '');
};

export function Occasions({ data }: { data: OccasionsData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<OccItem>(data.items, 'items').slice(0, 6);
  const list = items.length
    ? items.map((it) => ({
        icon: (Object.keys(ICONS).includes(valueOf(it.icon)) ? valueOf(it.icon) : 'gift') as Icon,
        image: it.image || '',
        title: tx(it.title, '', ''),
        text: tx(it.text, '', ''),
        url: urlOf(it.url) || '/products',
      }))
    : (
        [
          ['ramadan', 'mj.occ.ramadan', 'Ramadan', 'mj.occ.ramadan_text', 'Hospitality gifts for suhoor and iftar'],
          ['eid', 'mj.occ.eid', 'Eid', 'mj.occ.eid_text', 'An eidiya worthy of your loved ones'],
          ['founding', 'mj.occ.founding', 'Founding Day', 'mj.occ.founding_text', 'The Diriyah collection'],
          ['wedding', 'mj.occ.wedding', 'Weddings', 'mj.occ.wedding_text', 'Sets for the bride and groom'],
        ] as [Icon, string, string, string, string][]
      ).map(([icon, k, en, kt, ent]) => ({ icon, image: '', title: t(k, en), text: t(kt, ent), url: '/products' }));

  return (
    <section className="mj-section mj-occ">
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.occ.overline', 'An oud for every occasion')}
          title={tx(data.title, 'mj.occ.title', 'Occasion gifts')}
          align="center"
        />
        <ul className="mj-occ__grid">
          {list.map((o, i) => (
            <li key={i}>
              <Link to={o.url} className={`mj-occ__tile${o.image ? ' has-image' : ''}`}>
                {o.image ? (
                  <img className="mj-occ__img" src={o.image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <svg className="mj-occ__icon" viewBox="0 0 56 56" aria-hidden="true">
                    <path d={ICONS[o.icon]} />
                  </svg>
                )}
                <b className="mj-occ__name">{o.title}</b>
                {o.text && <span className="mj-occ__text">{o.text}</span>}
                <span className="mj-occ__go">{t('mj.occ.shop', 'Shop')} ←</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
