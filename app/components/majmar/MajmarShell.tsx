/**
 * MajmarShell: applies the Majmar settings to the document.
 *
 * - `<html>` attributes: palette, accent source, font source and motion level
 *   (read by tokens.scss and 06-majmar). Set through useDocumentClass so the
 *   server render already carries them: no palette flash on load.
 * - `mj-js` on <html> once hydrated, which arms the scroll reveals.
 * - Merchant custom colours as a tiny <style> block. Values are validated hex,
 *   converted to digit channels, so nothing else can reach the stylesheet.
 * - The page-change fade (300ms, 12px rise) and the shared reveal observer.
 */
import { useRef, type ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { useMajmar } from '../../hooks/useMajmar';
import { useHydrated } from '../../hooks/useHydrated';
import { useReveal } from '../../hooks/useReveal';

/**
 * The Majmar data attributes (palette, motion, card style...). ThemeLayout renders them
 * on `.app-inner`, so they are in the server HTML and the palette is right at first
 * paint; the styles select `[data-mj-*]` on any ancestor.
 */
export function majmarDataAttrs(mj: ReturnType<typeof useMajmar>) {
  return {
    'data-mj-palette': mj.palette,
    'data-mj-accent': mj.accentFromStore ? 'store' : 'amber',
    'data-mj-fonts': mj.storeFonts ? 'store' : 'majmar',
    'data-mj-motion': mj.motion,
    'data-mj-card': mj.card.hover,
    'data-mj-badge': mj.card.badge,
    'data-mj-quickadd': mj.card.quickAdd ? 'on' : 'off',
  };
}

export function MajmarShell({ children }: { children: ReactNode }) {
  const mj = useMajmar();
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const firstPath = useRef(pathname);

  useDocumentClass({
    html: {
      class: hydrated ? ['mj-js'] : [],
      // Also on <html> for the engine's own web components; the server-rendered copy
      // that the styles rely on sits on `.app-inner` (ThemeLayout, majmarDataAttrs).
      ...majmarDataAttrs(mj),
    },
  });

  useReveal(pathname);

  const { colors } = mj;
  const custom = mj.customColors
    ? [
        colors.bg && `--mj-bg-rgb:${colors.bg};`,
        colors.surface && `--mj-surface-rgb:${colors.surface};--mj-raised-rgb:${colors.surface};`,
        colors.gold && `--mj-gold-rgb:${colors.gold};--mj-gold-hover-rgb:${colors.gold};`,
        colors.text && `--mj-ivory-rgb:${colors.text};--mj-line-rgb:${colors.text};`,
      ]
        .filter(Boolean)
        .join('')
    : '';

  return (
    <>
      {custom && (
        <style
          // Validated digit channels only (see hexToChannels).
          dangerouslySetInnerHTML={{ __html: `[data-mj-palette]{${custom}}` }}
        />
      )}
      {/* No fade on the first, server-rendered page: it would delay LCP. */}
      <div key={pathname} className={pathname === firstPath.current ? undefined : 'mj-page-enter'}>
        {children}
      </div>
    </>
  );
}
