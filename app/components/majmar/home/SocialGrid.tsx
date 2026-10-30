/**
 * Social grid (home block `mj-social`).
 * A square grid of merchant-uploaded posts linking to the profile. Instagram's API
 * cannot be called from a theme without a token, so the merchant uploads the images;
 * the profile link defaults to the Instagram URL in the Social settings.
 */
import { useMajmar } from '../../../hooks/useMajmar';
import { artFor, itemsOf, MjMedia, SectionHead, urlOf, useBlockText } from './shared';

interface Post {
  image?: string;
  url?: unknown;
}

export interface SocialGridData {
  overline?: unknown;
  title?: unknown;
  handle?: unknown;
  profile_url?: unknown;
  posts?: unknown;
  [key: string]: unknown;
}

export function SocialGrid({ data }: { data: SocialGridData }) {
  const tx = useBlockText();
  const { social } = useMajmar();
  const posts = itemsOf<Post>(data.posts, 'posts');
  const list: Post[] = (posts.length ? posts : Array.from({ length: 6 }, () => ({}))).slice(0, 8);
  const profile = urlOf(data.profile_url) || social.instagram;
  const handle = tx(data.handle, 'mj.social.handle', '@noiratelier');

  return (
    <section className="mj-section mj-social">
      <div className="mj-container">
        <SectionHead
          overline={tx(data.overline, 'mj.social.overline', 'Follow the atelier')}
          title={tx(data.title, 'mj.social.title', 'Behind the glass')}
          link={profile ? { url: profile, label: handle } : null}
        />
        <ul className="mj-social__grid">
          {list.map((post, i) => {
            const href = urlOf(post.url) || profile;
            const tile = <MjMedia src={post.image} alt="" art={artFor(i)} ratio="1/1" sizes="(min-width: 1024px) 16vw, 33vw" />;
            return (
              <li key={i} data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="mj-social__tile" aria-label={`${handle} (${i + 1})`}>
                    {tile}
                  </a>
                ) : (
                  <div className="mj-social__tile">{tile}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
