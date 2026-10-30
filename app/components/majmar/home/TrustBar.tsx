/**
 * Trust bar (home block `mj-trust`).
 * Up to four promises (shipping, returns, secure payment, gift wrapping) with line
 * icons, and a row of payment method marks. The marks are neutral text-in-frame SVG
 * labels, not copies of the payment brands' artwork; the store's real payment
 * logos are shown by the footer's own payments component.
 */
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { itemsOf, useBlockText } from './shared';

type IconName = 'delivery' | 'returns' | 'secure' | 'gift';

interface Promise_ {
  icon?: unknown;
  title?: unknown;
  text?: unknown;
}

export interface TrustBarData {
  items?: unknown;
  show_payments?: unknown;
  payments?: unknown;
  [key: string]: unknown;
}

const PAYMENT_LABELS: Record<string, string> = {
  mada: 'mada',
  applepay: 'Apple Pay',
  stcpay: 'STC Pay',
  tabby: 'tabby',
  tamara: 'tamara',
  visa: 'VISA',
  mastercard: 'Mastercard',
};

const ICONS: Record<IconName, string> = {
  delivery: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  returns: 'M4 9h11a5 5 0 0 1 0 10H9M4 9l4-4M4 9l4 4',
  secure: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4',
  gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-3-6-3-6 0M12 7c2-3 6-3 6 0',
};

const valueOf = (raw: unknown): string => {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return typeof v === 'object' && v ? String((v as { value?: unknown }).value ?? '') : String(v ?? '');
};

export function TrustBar({ data }: { data: TrustBarData }) {
  const tx = useBlockText();
  const { t } = useTranslation();
  const items = itemsOf<Promise_>(data.items, 'items');
  const list = items.length
    ? items
    : [
        { icon: 'delivery', title: t('mj.trust.delivery', 'Delivery across the GCC'), text: t('mj.trust.delivery_text', 'Insured, tracked, gift-wrapped') },
        { icon: 'returns', title: t('mj.trust.returns', '14-day returns'), text: t('mj.trust.returns_text', 'Simple and courteous') },
        { icon: 'secure', title: t('mj.trust.secure', 'Secure payment'), text: t('mj.trust.secure_text', 'Pay now or in instalments') },
        { icon: 'gift', title: t('mj.trust.gift', 'Signature wrapping'), text: t('mj.trust.gift_text', 'With a handwritten card') },
      ];
  const showPayments = data.show_payments !== false;
  const chosen = Array.isArray(data.payments) && data.payments.length ? data.payments.map(valueOf) : Object.keys(PAYMENT_LABELS).slice(0, 5);

  return (
    <section className="mj-trust" aria-label={t('mj.trust.label', 'Our promise')}>
      <div className="mj-container">
        <ul className="mj-trust__list">
          {list.slice(0, 4).map((item, i) => {
            const icon = (Object.keys(ICONS).includes(valueOf(item.icon)) ? valueOf(item.icon) : 'delivery') as IconName;
            return (
              <li key={i} className="mj-trust__item" data-mj-reveal="" style={{ ['--mj-i' as string]: i }}>
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={ICONS[icon]} stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="mj-trust__title">{tx(item.title, '', '')}</p>
                  <p className="mj-caption">{tx(item.text, '', '')}</p>
                </div>
              </li>
            );
          })}
        </ul>
        {showPayments && (
          <ul className="mj-pay" aria-label={t('mj.trust.payments', 'Payment methods')}>
            {chosen
              .filter((k) => PAYMENT_LABELS[k])
              .map((k) => (
                <li key={k} className={`mj-pay__mark mj-pay__mark--${k}`}>
                  {PAYMENT_LABELS[k]}
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}
