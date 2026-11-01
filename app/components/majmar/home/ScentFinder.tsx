/**
 * Scent Finder (home block `mj-finder`).
 * A three-step quiz: for whom (her, him, everyone), mood (warm, fresh, floral, smoky) and
 * intensity (soft, bold). Each step is a radio group of cards (arrow keys move within a
 * group, as native radios do), with progress dots and a back button.
 *
 * Result: the answers become a search keyword and the shopper is sent to the store search
 * page, `/search?q=<keyword>`. Assumption: merchants tag or name products with these words
 * (for example a product tagged "عود" or "oud"). The mood keywords can be overridden per
 * store (`mood_warm`, `mood_fresh`, `mood_floral`, `mood_smoky`), so the quiz lands on
 * words the merchant actually uses. Intensity and audience are shown in the summary but
 * only the mood keyword is searched, since a longer query rarely matches.
 */
import { useState } from 'react';
import { banner } from '../../../lib/bundledBanners';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { text } from '../../../lib/majmarSettings';
import { useBlockText } from './shared';

export interface ScentFinderData {
  title?: unknown;
  text?: unknown;
  mood_warm?: unknown;
  mood_fresh?: unknown;
  mood_floral?: unknown;
  mood_smoky?: unknown;
  [key: string]: unknown;
}

type StepKey = 'who' | 'mood' | 'strength';

export function ScentFinder({ data }: { data: ScentFinderData }) {
  const tx = useBlockText();
  const { t, locale } = useTranslation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<StepKey, string>>>({});

  const steps: { key: StepKey; question: string; options: { value: string; label: string; hint: string }[] }[] = [
    {
      key: 'who',
      question: t('mj.finder.q_who', 'Who is it for?'),
      options: [
        { value: 'her', label: t('mj.finder.her', 'For her'), hint: t('mj.finder.her_hint', 'Soft, radiant, memorable') },
        { value: 'him', label: t('mj.finder.him', 'For him'), hint: t('mj.finder.him_hint', 'Deep, woody, assured') },
        { value: 'all', label: t('mj.finder.all', 'For everyone'), hint: t('mj.finder.all_hint', 'Shared and timeless') },
      ],
    },
    {
      key: 'mood',
      question: t('mj.finder.q_mood', 'Which mood draws you in?'),
      options: [
        { value: 'warm', label: t('mj.finder.warm', 'Warm'), hint: t('mj.finder.warm_hint', 'Amber, vanilla, resin') },
        { value: 'fresh', label: t('mj.finder.fresh', 'Fresh'), hint: t('mj.finder.fresh_hint', 'Citrus, musk, clean air') },
        { value: 'floral', label: t('mj.finder.floral', 'Floral'), hint: t('mj.finder.floral_hint', 'Taif rose, jasmine') },
        { value: 'smoky', label: t('mj.finder.smoky', 'Smoky'), hint: t('mj.finder.smoky_hint', 'Oud, incense, leather') },
      ],
    },
    {
      key: 'strength',
      question: t('mj.finder.q_strength', 'How should it carry?'),
      options: [
        { value: 'soft', label: t('mj.finder.soft', 'Close to the skin'), hint: t('mj.finder.soft_hint', 'Discreet, for daytime') },
        { value: 'bold', label: t('mj.finder.bold', 'Leave a trail'), hint: t('mj.finder.bold_hint', 'Rich, for evenings') },
      ],
    },
  ];

  const defaults: Record<string, string> = {
    warm: t('mj.finder.kw_warm', 'amber'),
    fresh: t('mj.finder.kw_fresh', 'musk'),
    floral: t('mj.finder.kw_floral', 'rose'),
    smoky: t('mj.finder.kw_smoky', 'oud'),
  };
  const overrides: Record<string, unknown> = {
    warm: data.mood_warm,
    fresh: data.mood_fresh,
    floral: data.mood_floral,
    smoky: data.mood_smoky,
  };
  const keyword = answers.mood ? text(overrides[answers.mood], locale, defaults[answers.mood]) : '';

  const done = step >= steps.length;
  const current = steps[Math.min(step, steps.length - 1)];
  const choose = (value: string) => {
    setAnswers((a) => ({ ...a, [current.key]: value }));
    setStep((s) => s + 1);
  };
  const labelOf = (k: StepKey) => steps.find((s) => s.key === k)?.options.find((o) => o.value === answers[k])?.label;
  const title = tx(data.title, 'mj.finder.title', 'Find your signature scent');

  return (
    <section className="mj-section mj-finder" aria-label={title}>
      <div className="mj-container">
        <div className="mj-finder__panel" data-mj-reveal="">
          <figure className="mj-finder__visual" aria-hidden="true">
            <img src={banner('finder')} alt="" loading="lazy" decoding="async" />
            <span className="mj-finder__wheel" />
          </figure>
          <div className="mj-finder__body">
          <header className="mj-finder__head">
            <p className="mj-overline">{t('mj.finder.overline', 'Scent finder')}</p>
            <h2 className="mj-h2">{title}</h2>
            <p className="mj-body-l mj-finder__text">
              {tx(data.text, 'mj.finder.text', 'Three questions, thirty seconds. We will point you to the scents that suit you.')}
            </p>
          </header>

          <ol className="mj-finder__dots" aria-label={t('mj.finder.progress', 'Progress')}>
            {steps.map((s, i) => (
              <li key={s.key} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
                <span className="mj-sr-only">{s.question}</span>
              </li>
            ))}
          </ol>

          {!done ? (
            <fieldset className="mj-finder__step" key={current.key}>
              <legend className="mj-h3">{current.question}</legend>
              <div className="mj-finder__options">
                {current.options.map((o) => (
                  <label key={o.value} className={`mj-finder__card${answers[current.key] === o.value ? ' is-picked' : ''}`}>
                    <input
                      type="radio"
                      name={`mj-finder-${current.key}`}
                      value={o.value}
                      checked={answers[current.key] === o.value}
                      onChange={() => choose(o.value)}
                      className="mj-sr-only"
                    />
                    <span className="mj-finder__label">{o.label}</span>
                    <span className="mj-caption">{o.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <div className="mj-finder__result" role="status">
              <p className="mj-caption">{t('mj.finder.result_intro', 'Your profile')}</p>
              <p className="mj-h3">{[labelOf('who'), labelOf('mood'), labelOf('strength')].filter(Boolean).join(' · ')}</p>
              <Link to={`/search?q=${encodeURIComponent(keyword)}`} className="mj-btn mj-btn--gold">
                {t('mj.finder.see', 'See my scents')}
              </Link>
            </div>
          )}

          <div className="mj-finder__nav">
            {step > 0 && (
              <button type="button" className="mj-btn mj-btn--ghost" onClick={() => setStep((s) => s - 1)}>
                {t('mj.finder.back', 'Back')}
              </button>
            )}
            {done && (
              <button
                type="button"
                className="mj-link mj-finder__restart"
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                }}
              >
                {t('mj.finder.restart', 'Start again')}
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
