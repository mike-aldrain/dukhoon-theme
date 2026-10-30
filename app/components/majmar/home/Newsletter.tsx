/**
 * Newsletter (home block `mj-newsletter`).
 * An inline email form. The Salla SDK has no newsletter call, so the form posts to the
 * merchant's own form endpoint (Mailchimp, Klaviyo or similar `action` URL) when one is
 * set; otherwise it opens an email to the store with the visitor's address. Native
 * validation, a labelled input and a polite status message.
 */
import { useState, type FormEvent } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { urlOf, useBlockText } from './shared';

export interface NewsletterData {
  overline?: unknown;
  title?: unknown;
  text?: unknown;
  button?: unknown;
  form_action?: unknown;
  [key: string]: unknown;
}

export function Newsletter({ data }: { data: NewsletterData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const store = useStore() as { email?: string; contacts?: { email?: string } } | undefined;
  const [done, setDone] = useState(false);
  const action = urlOf(data.form_action);
  const storeEmail = store?.email || store?.contacts?.email || '';

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (action) {
      // The endpoint receives a normal POST in a new tab; show thanks here.
      setDone(true);
      return;
    }
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email');
    if (storeEmail && typeof email === 'string') {
      window.location.href = `mailto:${storeEmail}?subject=${encodeURIComponent('Newsletter')}&body=${encodeURIComponent(email)}`;
    }
    setDone(true);
  };

  return (
    <section className="mj-section mj-newsletter">
      <div className="mj-container">
        <div className="mj-newsletter__panel" data-mj-reveal="">
          <p className="mj-overline">{tx(data.overline, 'mj.newsletter.overline', 'The private list')}</p>
          <h2 className="mj-h2" data-mj-wipe="">
            {tx(data.title, 'mj.newsletter.title', 'First light on new pieces')}
          </h2>
          <p className="mj-body-l mj-newsletter__text">
            {tx(data.text, 'mj.newsletter.text', 'Early access to limited editions and private previews. No more than twice a month.')}
          </p>
          <form
            className="mj-newsletter__form"
            action={action || undefined}
            method={action ? 'post' : undefined}
            target={action ? '_blank' : undefined}
            onSubmit={onSubmit}
          >
            <label htmlFor="mj-newsletter-email" className="mj-sr-only">
              {t('mj.newsletter.label', 'Email address')}
            </label>
            <input
              id="mj-newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              className="mj-input"
              placeholder={t('mj.newsletter.placeholder', 'Your email address')}
            />
            <button type="submit" className="mj-btn mj-btn--gold">
              {tx(data.button, 'mj.newsletter.button', 'Join')}
            </button>
          </form>
          <p className="mj-caption mj-newsletter__status" role="status" aria-live="polite">
            {done ? t('mj.newsletter.thanks', 'Thank you. You are on the list.') : ''}
          </p>
        </div>
      </div>
    </section>
  );
}
