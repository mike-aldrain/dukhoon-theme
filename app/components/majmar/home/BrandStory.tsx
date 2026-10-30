/**
 * Brand Story split (home block `mj-story`).
 * Image on one side (start or end, merchant choice), long copy on the other with a
 * gold pull quote. The image sits in a frame offset by a thin gold line.
 */
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { MjMedia, SectionHead, urlOf, useBlockText } from './shared';

export interface BrandStoryData {
  image?: string;
  overline?: unknown;
  title?: unknown;
  body?: unknown;
  quote?: unknown;
  quote_author?: unknown;
  link_text?: unknown;
  link_url?: unknown;
  image_side?: unknown;
  [key: string]: unknown;
}

export function BrandStory({ data }: { data: BrandStoryData }) {
  const tx = useBlockText();
  const sideRaw = Array.isArray(data.image_side) ? data.image_side[0] : data.image_side;
  const side = (typeof sideRaw === 'object' && sideRaw ? (sideRaw as { value?: string }).value : sideRaw) === 'end' ? 'end' : 'start';
  const body = tx(
    data.body,
    'mj.story.body',
    'Every piece begins in a small studio where time is measured in layers, not hours. We source rare materials, work them by hand and finish each object under soft light, so that what reaches you carries the patience it was made with.'
  );
  const quote = tx(data.quote, 'mj.story.quote', 'Luxury is the care you can feel before you can name it.');
  const author = tx(data.quote_author, 'mj.story.quote_author', 'The founder');
  const linkUrl = urlOf(data.link_url);

  return (
    <section className={`mj-section mj-story mj-story--${side}`}>
      <div className="mj-container mj-story__grid">
        <figure className="mj-story__figure" data-mj-reveal="">
          <MjMedia src={data.image} alt="" art="mabkhara" fallback={1} sizes="(min-width: 1024px) 50vw, 100vw" className="mj-story__media" />
        </figure>
        <div className="mj-story__copy">
          <SectionHead
            overline={tx(data.overline, 'mj.story.overline', 'Our atelier')}
            title={tx(data.title, 'mj.story.title', 'Made slowly, kept for life')}
          />
          {body.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="mj-body-l mj-measure mj-story__para" data-mj-reveal="" style={{ ['--mj-i' as string]: i + 1 }}>
              {para}
            </p>
          ))}
          {quote && (
            <blockquote className="mj-quote" data-mj-reveal="">
              <p className="mj-h3">{quote}</p>
              {author && <footer className="mj-caption">{author}</footer>}
            </blockquote>
          )}
          {linkUrl && (
            <Link to={linkUrl} className="mj-btn mj-btn--ghost">
              {tx(data.link_text, 'mj.story.link', 'Read our story')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
