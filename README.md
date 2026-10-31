# Majmar · مِجمر

A cinematic luxury theme for perfume, oud and bakhoor stores on Salla, built on the
Twilight React theme engine (`@salla.sa/twilight-theme-engine`). Warm smoked amber,
glass and brass, slow smoke. Arabic and right-to-left first, English verified.

- Concept and market analysis: `../majmar-concept/MAJMAR-THEME-CONCEPT.md`
- Design system: [DESIGN.md](DESIGN.md)
- QA results: [QA.md](QA.md)
- Engine components copied into the theme: [FORKS.md](FORKS.md)

## What makes it cinematic

1. **Drag-to-spin hero turntable.** A 40-frame turn of the flacon under a warm spotlight
   on oud-wood dark. It turns slowly by itself; shoppers can drag it (or use the arrow
   keys) and it spins with inertia. The first frame is a plain priority image, so the
   first screen never waits for script. A gold-framed price label links to a real store
   product. Merchants can upload their own 360° frames (`frames_url` with `{n}`) or a
   still image.
2. **Scroll Product Film.** A pinned, scroll-driven film: the flacon turns, its cap lifts
   toward the camera, gold smoke rises, and four chapters about the oud fade in. At the
   end, a buy panel for a real store product lands beside the bottle. The film ships with
   the theme (80 frames, wide and phone framings); a merchant frame sequence or MP4 can
   replace it.
3. **Oud luxury palette** (default): oud-wood dark `#120D0A`, warm gold `#D6A85C`, cream
   text. All text pairs 8.5:1 or higher. "Quiet light luxury" and "Bright colour blocks"
   remain settings.
4. **Scent Marquee**: a slow band of oud names between gold hairlines.
5. Every block falls back to the store's real product photos when the merchant has not
   uploaded images.

No 3D library ships with the theme. The turntable and the film play pre-rendered WebP
frames (about 3.1 MB in total, loaded only when needed and only for the screen size in
use), so the JavaScript stays small.

## Demo pack

`C:/Users/Mike/Downloads/majmar-demo-pack`: twelve oud products (oud perfumes, oud oils,
oud wood, bakhoor and a burner), with a sheet of Arabic/English names, prices and scent
tags, two photos each (original 3D studio renders, free to use), two CC0 lifestyle photos,
and step-by-step instructions. Load it into the preview store so the marketplace preview
shows oud.

## Run it

```bash
pnpm install
salla theme dev              # demo store at http://localhost:5173/ar
salla theme dev --store      # pick your own demo store (interactive)
```

The dev settings panel (gear button) edits theme settings and home blocks live. A
sample layout with all Majmar blocks is in `twilight.preview.json` (git-ignored).

## Checks

```bash
pnpm typecheck
pnpm test             # 55 files, 440 tests
pnpm check:manifest
pnpm build
```

`scripts/build-manifest.py` writes the Majmar settings and blocks into `twilight.json`
(it also merges `scripts/blocks-conversion.json`), and `scripts/locales-mj.py` writes
the `mj.*` strings into `locales/ar.json` and `locales/en.json`. Both can be re-run.

## Home blocks (17)

| Block | Key | Purpose |
| --- | --- | --- |
| Cinematic Hero | `mj-hero` | Headline with a gold word, CTAs, drag-to-spin turntable (bundled or merchant frames, or a still), price label for a real product |
| Scent Marquee | `mj-marquee` | Oud names scrolling between gold hairlines |
| Scroll Product Film | `mj-film` | Pinned scroll film: 3D bottle, frame sequence or MP4; chapters; buy panel |
| Occasion Countdown | `mj-countdown` | Ramadan / Eid / National Day urgency |
| Scent Families | `mj-families` | Cambodi, Hindi, Oud oil, Muattar, Mukhallat, Bakhoor discovery |
| Scent Finder | `mj-finder` | 3-question quiz leading to search results |
| Ritual Bundle | `mj-ritual` | Perfume + oud oil + bakhoor, one-tap add to bag |
| Gift Box Builder | `mj-giftbox` | Pick N pieces, live tray and total, add box to bag |
| Product Reels | `mj-reels` | Vertical videos with "shop this" |
| FAQ | `mj-faq` | Accordion with FAQPage structured data |
| Featured Collections, Product Showcase, Brand Story, Lookbook, Testimonials, Social Grid, Newsletter, Trust Bar | `mj-*` | As in Noir Atelier, restyled for Majmar |

Raed's own blocks remain available.

## Perfume product page

Merchants add ordinary Salla product tags written as `label: value`:

```
قمة: زعفران      قلب: ورد الطائف      قاعدة: عود
ثبات: 4          فوحان: 3             موسم: شتاء
```

(English labels work too: `top`, `heart`, `base`, `longevity`, `sillage`, `season`,
`family`.) The product page then shows a notes pyramid and longevity / sillage meters,
and hides those tags from the plain tag list. Products without such tags look normal.

## Settings

Grouped under "Majmar": palette (Oud luxury dark, default / Quiet light luxury / Bright colour blocks), accent (amber or store
colour), fonts (El Messiri, Tajawal, Bodoni Moda, Manrope, or the store font),
custom colours, announcement bar, transparent header, card hover / badges / quick add,
sticky buy box, 360° view, footer, WhatsApp and social links, motion level
(cinematic / subtle / off), cookie notice.

## Publish

Same as Noir Atelier: create a GitHub repository, add it as `origin`, push `main` and
`master`, import it in Salla Partners (Themes > Import From GitHub), then complete the
listing (5 screenshots at 1600×1200 under 200 KB, preview store, price, support).

## Deviations and notes

- Starts from Salla's Raed starter plus the Noir Atelier layer (renamed `mj-`).
- Scent notes come from tags because Salla does not give themes merchant-defined
  product fields.
- The Scent Finder links to `/search?q=<mood word>`; results depend on product names
  and tags containing those words.
- Fonts load from Google Fonts with `display=swap` and metric-matched fallbacks.
