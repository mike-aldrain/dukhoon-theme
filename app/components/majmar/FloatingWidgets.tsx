/**
 * Floating widgets mounted at the `body:end` slot:
 * - WhatsAppButton: merchant toggle + number + prefilled message. Sits above the
 *   mobile bottom bar and on the inline-start side, away from the cart and chat apps.
 * - CookieNotice: a small, dismissible notice. The choice is kept in localStorage
 *   (wrapped in try/catch, the notice still works when storage is blocked).
 * Both render nothing on the server, so they never cause a hydration mismatch.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMajmar } from '../../hooks/useMajmar';
import { useHydrated } from '../../hooks/useHydrated';

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const { social } = useMajmar();
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const { enabled, number, message } = social.whatsapp;
  if (!hydrated || !enabled || !number) return null;
  const href = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
  return (
    <a
      className="mj-whatsapp"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('mj.whatsapp', 'Chat with us on WhatsApp')}
    >
      <WhatsAppGlyph />
    </a>
  );
}

const COOKIE_KEY = 'mj-cookie-ok';

export function CookieNotice() {
  const { cookieNotice } = useMajmar();
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!cookieNotice) return;
    try {
      setShow(window.localStorage.getItem(COOKIE_KEY) !== '1');
    } catch {
      setShow(true);
    }
  }, [cookieNotice]);

  if (!show) return null;

  const accept = () => {
    try {
      window.localStorage.setItem(COOKIE_KEY, '1');
    } catch {
      /* storage blocked: hide for this page view only */
    }
    setShow(false);
  };

  return (
    <div className="mj-cookie" role="region" aria-label={t('mj.cookie.label', 'Cookie notice')}>
      <p className="mj-caption">
        {t(
          'mj.cookie.text',
          'We use essential cookies to keep your bag and preferences. By continuing you accept them.'
        )}
      </p>
      <button type="button" className="mj-btn mj-btn--gold" onClick={accept}>
        {t('mj.cookie.accept', 'Accept')}
      </button>
    </div>
  );
}
