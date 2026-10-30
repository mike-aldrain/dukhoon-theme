import { lazy, Suspense } from 'react';
import { Scripts, Outlet } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
  ThemeHeadContent,
  ThemeStylesheet,
} from '@salla.sa/twilight-theme-engine/tanstack';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import { ThemeLayout } from '../components/layout/ThemeLayout';
import { HOME_ROUTE_ID, PRODUCT_ROUTE_ID } from '../lib/routeIds';
import appCssUrl from '../styles/app.css?url';
import homeCriticalCss from '../styles/critical.scss?inline';
import productCriticalCss from '../styles/critical-product.scss?inline';

// Dev-only: reads the theme's local twilight.json (settings + components),
// fills defaults, and lets you edit them live. Imported from the engine's `/dev`
// subpath under an import.meta.env.DEV gate so it is tree-shaken from prod builds.
const DevSettingsWidget = import.meta.env.DEV
  ? lazy(() =>
      import('@salla.sa/twilight-theme-engine/dev').then((m) => ({ default: m.DevSettingsWidget }))
    )
  : null;

const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400' +
  '&family=El+Messiri:wght@400..600&family=Manrope:wght@400..600&family=Tajawal:wght@400;500;700' +
  '&display=swap';

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
});

// Server-only strings: the client bundle skips them; hydration adopts the inlined <style> by its href.
const CRITICAL_CSS = {
  [HOME_ROUTE_ID]: import.meta.env.SSR ? homeCriticalCss : '',
  [PRODUCT_ROUTE_ID]: import.meta.env.SSR ? productCriticalCss : '',
};

function RootComponent() {
  const ctx = getTwilightContext();
  return (
    <html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Home and product paint from inline critical CSS; `bootClient` adds the full sheet once
            their first screen has painted. Other routes: the full sheet blocks, as before. */}
        {/* Majmar faces. unicode-range in Google's CSS means only the scripts a page
            uses are downloaded; display=swap plus the metric-matched fallbacks in tokens.scss
            keep text visible and still while they load. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_URL} />
        <ThemeStylesheet href={appCssUrl} critical={CRITICAL_CSS} />
        <ThemeHeadContent />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          To get full functionality of this site you need to enable JavaScript.
          <a href="https://www.enable-javascript.com/" rel="noreferrer" target="_blank">
            To enable JavaScript on webpage
          </a>
          .
        </noscript>
        <TwilightProvider
          translations={themeTranslations}
          layout={ThemeLayout}
          toastMobilePosition="top-center"
        >
          <Outlet />
        </TwilightProvider>
        <TanStackRouterDevtools position="bottom-right" />
        {DevSettingsWidget && (
          <Suspense fallback={null}>
            <DevSettingsWidget schema={devSchema} />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
