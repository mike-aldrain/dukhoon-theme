/**
 * Occasion Countdown (home block `mj-countdown`).
 * A live days / hours / minutes / seconds countdown to the merchant's end date (Ramadan,
 * Eid, National Day, a sale). Nothing time-based renders on the server: the digits appear
 * after hydration, so there is no hydration mismatch. Without an end date the block counts
 * to 14 days after the first visit render, so a fresh install still shows it working.
 * After the end date the block hides itself. Digits update once a second and are exposed
 * to screen readers as one polite, minute-level label rather than ticking every second.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useHydrated } from '../../../hooks/useHydrated';
import { urlOf, useBlockText } from './shared';

export interface OccasionCountdownData {
  title?: unknown;
  text?: unknown;
  end_date?: unknown;
  link_text?: unknown;
  link_url?: unknown;
  [key: string]: unknown;
}

const FALLBACK_DAYS = 14;

function parseEnd(raw: unknown): number | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const ms = Date.parse(raw.trim());
  return Number.isFinite(ms) ? ms : null;
}

export function OccasionCountdown({ data }: { data: OccasionCountdownData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const merchantEnd = parseEnd(data.end_date);
  // The fallback target is fixed on first client render, not on every tick.
  const end = useMemo(
    () => merchantEnd ?? (hydrated ? Date.now() + FALLBACK_DAYS * 864e5 : null),
    [merchantEnd, hydrated]
  );
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hydrated]);

  const left = end !== null && now !== null ? Math.max(0, end - now) : null;
  if (left === 0) return null;

  const days = left === null ? 0 : Math.floor(left / 864e5);
  const hours = left === null ? 0 : Math.floor((left % 864e5) / 36e5);
  const mins = left === null ? 0 : Math.floor((left % 36e5) / 6e4);
  const secs = left === null ? 0 : Math.floor((left % 6e4) / 1e3);
  const units = [
    { v: days, label: t('mj.countdown.days', 'Days') },
    { v: hours, label: t('mj.countdown.hours', 'Hours') },
    { v: mins, label: t('mj.countdown.minutes', 'Minutes') },
    { v: secs, label: t('mj.countdown.seconds', 'Seconds') },
  ];
  const linkUrl = urlOf(data.link_url) || '/products';
  const title = tx(data.title, 'mj.countdown.title', 'The Eid edit ends soon');

  return (
    <section className="mj-section mj-countdown" aria-label={title}>
      <div className="mj-container">
        <div className="mj-countdown__panel" data-mj-reveal="">
          <div className="mj-countdown__copy">
            <p className="mj-overline">{t('mj.countdown.overline', 'Limited time')}</p>
            <h2 className="mj-h2">{title}</h2>
            <p className="mj-body-l mj-countdown__text">
              {tx(data.text, 'mj.countdown.text', 'Gift sets and limited oud blends at their seasonal price, while the clock runs.')}
            </p>
          </div>
          <div
            className="mj-countdown__clock"
            role="timer"
            aria-label={
              left === null
                ? undefined
                : t('mj.countdown.label', '{{d}} days, {{h}} hours and {{m}} minutes left', { d: days, h: hours, m: mins })
            }
          >
            {units.map((u, i) => (
              <div key={i} className="mj-countdown__unit" aria-hidden="true">
                <span className="mj-countdown__num">{left === null ? '--' : String(u.v).padStart(2, '0')}</span>
                <span className="mj-caption">{u.label}</span>
              </div>
            ))}
          </div>
          <Link to={linkUrl} className="mj-btn mj-btn--gold mj-countdown__cta">
            {tx(data.link_text, 'mj.countdown.cta', 'Shop the edit')}
          </Link>
        </div>
      </div>
    </section>
  );
}
