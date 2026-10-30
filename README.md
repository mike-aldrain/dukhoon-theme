# Majmar · مِجمر

A cinematic luxury theme for perfume, oud and bakhoor stores on Salla, built on the
Twilight React theme engine (`@salla.sa/twilight-theme-engine`). Warm smoked amber,
glass and brass, slow smoke. Arabic and right-to-left first, English verified.

- Concept and market analysis: `../majmar-concept/MAJMAR-THEME-CONCEPT.md`
- Design system: [DESIGN.md](DESIGN.md)
- QA results: [QA.md](QA.md)
- Engine components copied into the theme: [FORKS.md](FORKS.md)

## What makes it cinematic

1. **3D product showcase (WebGL hero).** The store's real products float on lit cards in a
   slow 3D carousel: a gold halo behind the front product, floor reflections, depth fog,
   gold dust and a light sweep. It holds on each product, then turns to the next, and a
   caption shows the front product's name, price and link. Merchants pick the products
   (or it uses the latest ones). The first paint is a plain CSS card with the first
   product's photo, so it never slows the first screen.
2. **Scroll Product Film.** A pinned, scroll-driven film of the featured product: it flies
   in, the carousel turns through its gallery and other real products while the camera
   pushes in through four chapters (scent notes), then it settles beside the buy panel.
   A frame sequence or MP4 can replace the 3D showcase.
3. **Light luxury palette** (default): warm white, ink-black buttons, vivid gold accents;
   all text pairs 5.6:1 or higher. The dark "Oud" palette remains a setting.
4. Every block falls back to the store's real product photos when the merchant has not
   uploaded images.

The 3D code ships as its own chunk (118 KB gzipped, Three.js 0.170) and is never part of
the first page load. Product photos come from Salla's CDN, which allows WebGL use (CORS).

## Demo pack

`C:/Users/Mike/Downloads/majmar-demo-pack`: nine perfume-house products (sheet with
Arabic/English names, prices, scent tags), two photos each (original 3D studio renders, free
to use), two CC0 lifestyle photos, and step-by-step instructions. Load it into the preview
store so the marketplace preview shows perfume.

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
| Cinematic Hero | `mj-hero` | Headline, CTAs, WebGL bottle (switch), image/video background, optional product render |
| Scroll Product Film | `mj-film` | Pinned scroll film: 3D bottle, frame sequence or MP4; chapters; buy panel |
| Occasion Countdown | `mj-countdown` | Ramadan / Eid / National Day urgency |
| Scent Families | `mj-families` | Oud, Musk, Amber, Rose, Fresh, Bakhoor discovery |
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

Grouped under "Majmar": palette (Oud dark / Musk light), accent (amber or store
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
