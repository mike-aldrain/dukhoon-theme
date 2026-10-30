# Majmar design system

Late evening in a majlis: low warm light, smoke curling past a glass flacon, a brass mabkhara.
Quiet confidence and a lot of air. This file is the reference for extending the theme.

Source of truth: `app/styles/tokens.scss` (tokens), `tailwind.config.cjs` (Tailwind mapping),
`app/styles/06-majmar/` (component styles).

---

## 1. Colour

Every colour is a CSS variable stored as RGB channels (`--mj-gold-rgb: 201 169 110`) plus a ready
colour (`--mj-gold`). Tailwind exposes them as `mj-*` colours that accept alpha (`bg-mj-gold/10`).
The palette is chosen by `data-mj-palette` on `<html>`.

| Token | Oud (default) | Musk | Use |
| --- | --- | --- | --- |
| `--mj-bg` | smoked oud `#14100D` | `#F7F1E8` | Page background |
| `--mj-surface` | `#1E1814` | `#FFFDF9` | Cards, drawers, panels |
| `--mj-raised` | `#2A221C` | `#EEE4D6` | Image wells, skeletons, raised bands |
| `--mj-gold` | Amber `#D4A35A` | `#B98A44` | Fills, rules, icons, focus rings |
| `--mj-gold-hover` | `#E8BE7A` | `#A07434` | Hover fill |
| `--mj-gold-ink` | `#B98A44` | `#7E5A24` | Gold used as **text** |
| `--mj-ivory` | Sand `#F3EADF` | Ink `#1F1813` | Primary text |
| `--mj-muted` | `#B3A493` | `#665A4E` | Secondary text |
| `--mj-on-gold` | `#0B0B0D` | `#16161A` | Text on a gold fill |
| `--mj-line` | ivory at 8% | charcoal at 10% | Borders, dividers |
| `--mj-success` / `warning` / `error` | `#7FB69A` / `#D9B36A` / `#D17B74` | darker tints | States |

### Contrast (WCAG 2.2 AA, 4.5:1 for body text)

| Pair | Oud | Light |
| --- | --- | --- |
| Primary text on background | 17.2:1 | 16.2:1 |
| Secondary text on background | 7.8:1 | 6.1:1 |
| Secondary text on surface (cards) | 7.3:1 | 6.7:1 |
| Gold text on background | 8.8:1 | 5.6:1 (gold-ink) |
| Text on gold button | 8.8:1 | 8.1:1 |
| Error text on background | 6.4:1 | 5.6:1 |

Champagne gold on Ivory is only 2.0:1, which is why the Light palette has a separate `gold-ink`.
**Never use `--mj-gold` for text; use `--mj-gold-ink`.**

### Dark stages

The hero, image tiles and lightboxes always use the Oud values, in both palettes, so ivory copy
over photography keeps its contrast. They redefine the tokens locally (see `tokens.scss`).

### How the engine follows the palette

Raed and the engine are written for a white page. Instead of forking them, `tailwind.config.cjs`
remaps `bg-white`, `bg-gray-*`, `text-gray-*`, `text-black`, `border-gray-*` and the reds onto the
tokens, per utility. `text-white` is left alone because it sits on images. The engine's primary
colour variables (`--color-primary*`) are mapped to gold unless the merchant chooses the store
colour.

## 2. Typography

| Role | Arabic (RTL) | Latin (LTR) |
| --- | --- | --- |
| Display / headings | El Messiri 500 | Bodoni Moda 400–600, italic for taglines |
| Body | Tajawal 400/500/700 | Manrope 400–600 |

Fonts load from Google Fonts with `display=swap`. The stacks end in metric-matched local
fallbacks (`Na Sans Fallback`, `Na Serif Fallback`) to limit layout shift.

### Scale (desktop / mobile, fluid between 360 and 1280 px)

| Token / class | Size | Line height |
| --- | --- | --- |
| `--mj-fs-display` / `.mj-display` | 72 / 40 | 1.1 |
| `--mj-fs-h1` / `.mj-h1` | 56 / 34 | 1.25 |
| `--mj-fs-h2` / `.mj-h2` | 40 / 28 | 1.25 |
| `--mj-fs-h3` / `.mj-h3` | 28 / 22 | 1.25 |
| `--mj-fs-body-l` / `.mj-body-l` | 18 / 17 | 1.6 |
| `--mj-fs-body` | 16 / 15 | 1.6 |
| `--mj-fs-caption` / `.mj-caption` | 13 / 12 | 1.6 |
| `.mj-overline` | 11, uppercase, 0.18em tracking (Latin only) | 1.4 |

- Measure: `.mj-measure` caps paragraphs at 68ch.
- **Never letter-space Arabic.** `.mj-overline` drops tracking and uppercase in RTL and grows 2px.
- Arabic headings use El Messiri 500.
- One `<h1>` per page. The lead hero renders it on the home page; a hero placed lower uses `<h2>`.

## 3. Space, layout and shape

- 8pt grid: `--mj-space-1` (8px) to `--mj-space-8` (64px).
- Section top padding `--mj-section`: 48 / 72 / 120 px (mobile / tablet / desktop). Sections pad
  the top only, so stacked sections don't double the gap.
- Container: 1320px content (`--mj-container`), gutters `--mj-gutter` 24 / 40 / 64 px. Use
  `.mj-container`, or Tailwind's `container`, which follows the same numbers.
- Breakpoints: 360, 390 (`mob`), 768 (`md`), 1024 (`lg`), 1280 (`xl`), 1536.
- Radius: 4px controls (`--mj-radius-control`, `rounded-control`), 14px cards (`rounded-card`,
  Tailwind's default `rounded`), 24px modals (`rounded-modal`).
- Tap targets: at least 44 × 44 px for controls; pagination dots get a 24px hit area.

## 4. Elevation through light

- Rest: a 1px inner line, `--mj-edge`.
- Hover: a gold inner edge plus a soft 40px gold-tinted shadow, `--mj-glow-hover`.
- Pinned header, bottom bar, drawers: frosted glass (`backdrop-filter: blur(18px)`).
- One radial "studio light" per hero. No neon, no heavy drop shadows.

## 5. Motion

| Token | Value |
| --- | --- |
| `--mj-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--mj-dur-reveal` | 600ms |
| `--mj-stagger` | 60ms per item (`--mj-i` index on the element) |
| `--mj-dur-page` | 300ms fade + 12px rise (`--mj-rise`) |
| `--mj-tilt-max` | 6deg |

Patterns:

- **Scroll reveal:** add `data-mj-reveal` (and optionally `style={{ '--mj-i': n }}`). One shared
  IntersectionObserver (`useReveal`) adds `is-in`. Elements hide only after hydration (`html.mj-js`),
  so server HTML is never blank.
- **Headline wipe:** add `data-mj-wipe`. The clip follows reading direction. The observer watches
  the parent, because a fully clipped element has no visible area.
- **Hero:** CSS-only entrance (never waits for JavaScript), 22s Ken Burns, gold line drawn on
  load, product render in a 1200px perspective with pointer parallax.
- **Card:** tilt toward the cursor (fine pointers only), a gold sweep, second-image cross-fade.
- **Page change:** a 300ms fade and rise, skipped on the first server-rendered page to protect LCP.

Intensity: `data-mj-motion` = `cinematic` | `subtle` (shorter travel, no Ken Burns or tilt) |
`off`. `prefers-reduced-motion: reduce` always gets the `off` behaviour: opacity only.

## 6. Components (class map)

| Pattern | Classes |
| --- | --- |
| Buttons | `.mj-btn` + `--gold` / `--ghost` / `--on-image` |
| Text link | `.mj-link` (underline grows in reading direction) |
| Input | `.mj-input` (16px text so iOS does not zoom) |
| Card surface | `.mj-card` |
| Section head | `SectionHead` component: overline, wipe headline, gold rule, link |
| Media | `NaMedia` (engine `Image` with srcset) or `NaArt` placeholder |
| Arrows | `.mj-arrow`; the icon mirrors in RTL |
| Drawer | `.mj-drawer` (inline-end side in both directions) |
| Lightbox | native `<dialog class="mj-lightbox">` |

## 7. Do and don't

**Do**

- Use logical properties and utilities: `ms-*`, `pe-*`, `inset-inline-*`, `text-start`.
- Mirror direction-bearing icons in RTL (`html[dir='rtl'] … { transform: scaleX(-1) }`).
- Take every colour from a token; check new pairs against 4.5:1.
- Give new home blocks placeholder copy and `NaArt` so a fresh install looks finished.
- Put new strings in both `locales/ar.json` and `locales/en.json` (via `scripts/locales-na.py`).
- Reserve block heights in `registerHomeComponentConfig` to keep CLS low.

**Don't**

- Don't use `ml-*`/`mr-*`/`left`/`right` for layout.
- Don't letter-space or uppercase Arabic.
- Don't use gold as text on the Light palette; use `gold-ink`.
- Don't add `!important`. The single exception is the engine primary-colour bridge in `tokens.scss`.
- Don't animate on page load anything that is the LCP element.
- Don't hotlink stock photography. Placeholders are SVG.
- Don't edit `app/routeTree.gen.ts` or `// @auto-generated` route files.

## 8. Cinematic 3D (Majmar)

| Piece | Where | Rules |
| --- | --- | --- |
| Hero still life | `app/lib/heroScene.ts` (idle mode), `HeroStage.tsx` | Loaded after first paint and idle time; CSS/SVG fallback underneath; off for reduced motion, save-data, <2 GB memory, motion "off", block switch off |
| Scroll Product Film | `ScrollFilm.tsx`, `heroScene.ts` (scroll mode) | Pinned stage, scroll 0..1 drives the timeline; frame sequence or MP4 replaces the 3D bottle; static layout without motion |
| Materials | Faceted crystal (10 facets, flat shaded), amber liquid with soft emission, brushed brass cap and plinth edge, RoomEnvironment reflections | No transmission pass (milky on transparent canvas); sRGB colours converted before use |
| Budget | `heroScene` chunk 121 KB gz | Pixel ratio capped at 1.75; rendering stops off-screen and in hidden tabs |

Do: keep the bottle on the inline-end side of copy, the buy panel on the inline-start side.
Don't: animate the LCP element, add shadow maps, or load Three.js in the main bundle.
