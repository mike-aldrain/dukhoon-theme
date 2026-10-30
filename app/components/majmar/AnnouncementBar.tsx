/**
 * AnnouncementBar: one quiet line above the header (merchant text and optional link).
 * Hidden when the setting is off or the text is empty. Dismissal lasts for the visit.
 */
import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMajmar } from '../../hooks/useMajmar';
import { CloseIcon } from '../icons';

export function AnnouncementBar() {
  const { announcement } = useMajmar();
  const { t } = useTranslation();
  const [closed, setClosed] = useState(false);
  const message = announcement.text || t('mj.announcement.default', 'Complimentary delivery across the Kingdom on orders above 500 SAR');

  if (!announcement.enabled || closed) return null;

  return (
    <div className="mj-announce" role="region" aria-label={t('mj.announcement.label', 'Announcement')}>
      <div className="mj-container mj-announce__inner">
        <span className="mj-announce__dot" aria-hidden="true" />
        {announcement.link ? (
          <Link to={announcement.link} className="mj-announce__text mj-link">
            {message}
          </Link>
        ) : (
          <p className="mj-announce__text">{message}</p>
        )}
        <button
          type="button"
          className="mj-announce__close"
          aria-label={t('mj.close', 'Close')}
          onClick={() => setClosed(true)}
        >
          <CloseIcon aria-hidden="true" width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
