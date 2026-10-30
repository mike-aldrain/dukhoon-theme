# Majmar · مِجمر

A cinematic luxury theme for perfume, oud and bakhoor stores on Salla, built on the
Twilight React theme engine (`@salla.sa/twilight-theme-engine`). Warm smoked amber,
glass and brass, slow smoke. Arabic and right-to-left first, English verified.

- Concept and market analysis: `../majmar-concept/MAJMAR-THEME-CONCEPT.md`
- Design system: [DESIGN.md](DESIGN.md)
- QA results: [QA.md](QA.md)
- Engine components copied into the theme: [FORKS.md](FORKS.md)

## What makes it cinematic

1. **3D hero (WebGL).** A faceted crystal flacon with amber liquid and a brass cap
   turns on a stone plinth under warm studio light, with incense smoke and embers.
   It loads after the page appears (the first paint is a light CSS/SVG still life),
   pauses when off-screen, and is skipped for reduced motion, data saver, low-memory
   devices and when the merchant switches it off.
2. **Scroll Product Film.** A pinned, scroll-driven film: the bottle turns, the cap
   lifts toward the camera, the camera pushes in through four chapters (the scent
   notes), then the bottle settles and the buy panel lands. Merchants can replace the
   3D bottle with their own **frame sequence** (`frame-{n}.webp`) or an **MP4**, which
   scroll exactly the same way.
3. CSS depth everywhere else: card tilt with amber edge light, reveal-on-scroll, mask
   wipes on headlines, glass header and drawers.

The 3D code ships as its own chunk (121 KB gzipped, Three.js 0.170) and is never part
of the first page load.

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
