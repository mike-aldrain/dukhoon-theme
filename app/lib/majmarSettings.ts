/**
 * Typed access to the Majmar merchant settings declared in twilight.json.
 *
 * Settings arrive as a plain object. Dropdowns may be a string or `[{ value }]`, a
 * multilanguage text may be a string or `{ ar, en }`, and a setting the merchant never
 * saved is `undefined`. These readers flatten all of that and apply the defaults that
 * twilight.json also declares, so the theme looks finished on install.
 */

export type Palette = 'emerald' | 'oxblood';
export type MotionLevel = 'off' | 'subtle' | 'cinematic';
export type CardHover = 'tilt' | 'zoom' | 'none';
export type BadgeStyle = 'outline' | 'solid';

type Settings = Record<string, unknown> | undefined | null;

/** A dropdown value from either shape, limited to the allowed values. */
export function pick<T extends string>(raw: unknown, allowed: readonly T[], fallback: T): T {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const value =
    typeof first === 'string' ? first : (first as { value?: unknown } | undefined)?.value;
  return (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback;
}

/** A switch that defaults to on unless explicitly saved as false (and the reverse). */
export function flag(raw: unknown, fallback: boolean): boolean {
  if (raw === true || raw === 'true' || raw === 1) return true;
  if (raw === false || raw === 'false' || raw === 0) return false;
  return fallback;
}

/** A text value, resolving `{ ar, en }` objects to the current locale. */
export function text(raw: unknown, locale: string, fallback = ''): string {
  if (typeof raw === 'string') return raw.trim() || fallback;
  if (raw && typeof raw === 'object') {
    const map = raw as Record<string, unknown>;
    const value = map[locale] ?? map.ar ?? map.en;
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}

/** `#RRGGBB` or `#RGB` to the "R G B" channel string the tokens use; null if invalid. */
export function hexToChannels(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let hex = raw.trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const n = parseInt(hex, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export interface MajmarSettings {
  palette: Palette;
  accentFromStore: boolean;
  storeFonts: boolean;
  customColors: boolean;
  colors: { bg: string | null; surface: string | null; gold: string | null; text: string | null };
  motion: MotionLevel;
  announcement: { enabled: boolean; text: string; link: string };
  headerTransparent: boolean;
  card: { hover: CardHover; badge: BadgeStyle; quickAdd: boolean; secondImage: boolean };
  pdp: { stickyBox: boolean; spin: boolean; spinMinFrames: number };
  footer: { payments: boolean; tagline: string };
  social: {
    whatsapp: { enabled: boolean; number: string; message: string };
    instagram: string;
    tiktok: string;
    snapchat: string;
    x: string;
  };
  cookieNotice: boolean;
}

/** Normalise every Majmar setting for one locale. */
export function readMajmarSettings(settings: Settings, locale: string): MajmarSettings {
  const s = settings ?? {};
  const frames = Number(s.mj_pdp_360_min_frames);
  return {
    palette: pick(s.mj_palette, ['emerald', 'oxblood'] as const, 'emerald'),
    accentFromStore: pick(s.mj_accent_source, ['amber', 'store'] as const, 'amber') === 'store',
    storeFonts: pick(s.mj_fonts, ['majmar', 'store'] as const, 'majmar') === 'store',
    customColors: flag(s.mj_custom_colors, false),
    colors: {
      bg: hexToChannels(s.mj_color_bg),
      surface: hexToChannels(s.mj_color_surface),
      gold: hexToChannels(s.mj_color_gold),
      text: hexToChannels(s.mj_color_text),
    },
    motion: pick(s.mj_motion, ['off', 'subtle', 'cinematic'] as const, 'cinematic'),
    announcement: {
      enabled: flag(s.mj_announcement_enabled, true),
      text: text(s.mj_announcement_text, locale),
      link: text(s.mj_announcement_link, locale),
    },
    headerTransparent: flag(s.mj_header_transparent, true),
    card: {
      hover: pick(s.mj_card_hover, ['tilt', 'zoom', 'none'] as const, 'tilt'),
      badge: pick(s.mj_card_badge, ['outline', 'solid'] as const, 'outline'),
      quickAdd: flag(s.mj_card_quick_add, true),
      secondImage: flag(s.mj_card_second_image, true),
    },
    pdp: {
      stickyBox: flag(s.mj_pdp_sticky_box, true),
      spin: flag(s.mj_pdp_360, false),
      spinMinFrames: Number.isFinite(frames) && frames >= 8 ? Math.round(frames) : 24,
    },
    footer: {
      payments: flag(s.mj_footer_payments, true),
      tagline: text(s.mj_footer_tagline, locale),
    },
    social: {
      whatsapp: {
        enabled: flag(s.mj_whatsapp_enabled, false),
        number: text(s.mj_whatsapp_number, locale).replace(/[^\d]/g, ''),
        message: text(s.mj_whatsapp_message, locale),
      },
      instagram: text(s.mj_instagram_url, locale),
      tiktok: text(s.mj_tiktok_url, locale),
      snapchat: text(s.mj_snapchat_url, locale),
      x: text(s.mj_x_url, locale),
    },
    cookieNotice: flag(s.mj_cookie_notice, true),
  };
}
