import { useMemo } from 'react';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { readMajmarSettings, type MajmarSettings } from '../lib/majmarSettings';

/** Settings from the provider, or none outside it (isolated tests, previews). */
function useThemeSettings(): Record<string, unknown> | undefined {
  try {
    return useTheme().settings as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

/**
 * The Majmar merchant settings, normalised for the current locale.
 * Without a TwilightProvider it returns the defaults instead of throwing.
 */
export function useMajmar(): MajmarSettings {
  const settings = useThemeSettings();
  const { locale } = useTranslation();
  return useMemo(() => readMajmarSettings(settings, locale), [settings, locale]);
}
