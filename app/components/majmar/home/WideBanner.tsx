/**
 * Wide Banner (home block `mj-wide`): one full-width image banner with a headline, a
 * sentence and a button, for a collection or a brand. Optional phone image. Without a
 * merchant image, the bundled Cambodian oud collection banner shows.
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { banner } from '../../../lib/bundledBanners';
import { urlOf, useBlockText } from './shared';

export interface WideBannerData {
  image?: string;
  mobile_image?: string;
  title?: unknown;
  text?: unknown;
  button?: unknown;
  url?: unknown;
  [key: string]: unknown;
}

export function WideBanner({ data }: { data: WideBannerData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const image = data.image || banner('wide-collection');
  const title = tx(data.title, 'mj.wide.title', 'The Cambodian oud collection');
  const text = tx(data.text, 'mj.wide.text', 'Four perfumes from one oud, a scent for every occasion.');
  const button = tx(data.button, 'mj.wide.button', 'Shop the collection');
  const url = urlOf(data.url) || '/products';

  return (
    <section className="mj-section mj-wide" aria-label={title}>
      <div className="mj-container">
        <div className="mj-wide__box">
          <picture>
            {data.mobile_image && <source media="(max-width: 760px)" srcSet={data.mobile_image} />}
            <img className="mj-wide__img" src={image} alt="" loading="lazy" decoding="async" width={1600} height={520} />
          </picture>
          <div className="mj-wide__copy">
            {title && <h2 className="mj-wide__title">{title}</h2>}
            {text && <p className="mj-wide__text">{text}</p>}
            {button && (
              <Link to={url} className="mj-btn mj-btn--gold-solid">
                {button}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
