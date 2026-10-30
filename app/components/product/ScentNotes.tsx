/**
 * ScentNotes: the perfume block on the product page.
 * A three-tier notes pyramid (top, heart, base), longevity and sillage meters, and
 * season / family chips, all read from the product's "label: value" tags
 * (see lib/scentProfile.ts). Renders nothing when the product has no scent tags.
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { scentProfile } from '../../lib/scentProfile';

function Meter({ label, value, low, high }: { label: string; value: number; low: string; high: string }) {
  return (
    <div className="mj-meter">
      <div className="mj-meter__head">
        <span>{label}</span>
        <span className="mj-meter__value">{value} / 5</span>
      </div>
      <span
        className="mj-meter__track"
        role="meter"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= value ? 'is-on' : ''} />
        ))}
      </span>
      <div className="mj-meter__ends">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export function ScentNotes({ product }: { product: Product }) {
  const { t } = useTranslation();
  const p = scentProfile(product);
  if (!p) return null;

  const tiers = [
    { key: 'top', label: t('mj.notes.top', 'Top notes'), hint: t('mj.notes.top_hint', 'The first impression'), notes: p.top },
    { key: 'heart', label: t('mj.notes.heart', 'Heart notes'), hint: t('mj.notes.heart_hint', 'After a few minutes'), notes: p.heart },
    { key: 'base', label: t('mj.notes.base', 'Base notes'), hint: t('mj.notes.base_hint', 'What stays for hours'), notes: p.base },
  ].filter((tier) => tier.notes.length);

  return (
    <section className="mj-notes" aria-labelledby="mj-notes-title">
      <h2 id="mj-notes-title" className="mj-overline">
        {t('mj.notes.title', 'Scent profile')}
      </h2>
      {tiers.length > 0 && (
        <ol className="mj-notes__pyramid">
          {tiers.map((tier, i) => (
            <li key={tier.key} className={`mj-notes__tier mj-notes__tier--${tier.key}`} style={{ ['--mj-i' as string]: i }}>
              <div className="mj-notes__label">
                <strong>{tier.label}</strong>
                <span>{tier.hint}</span>
              </div>
              <ul className="mj-notes__chips">
                {tier.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
      {(p.longevity || p.sillage) && (
        <div className="mj-notes__meters">
          {p.longevity && (
            <Meter
              label={t('mj.notes.longevity', 'Longevity')}
              value={p.longevity}
              low={t('mj.notes.longevity_low', 'Light')}
              high={t('mj.notes.longevity_high', 'All day')}
            />
          )}
          {p.sillage && (
            <Meter
              label={t('mj.notes.sillage', 'Sillage')}
              value={p.sillage}
              low={t('mj.notes.sillage_low', 'Close to skin')}
              high={t('mj.notes.sillage_high', 'Fills the room')}
            />
          )}
        </div>
      )}
      {(p.season.length > 0 || p.family.length > 0) && (
        <ul className="mj-notes__tags">
          {[...p.family, ...p.season].map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
