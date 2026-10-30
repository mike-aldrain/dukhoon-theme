# Majmar QA

Run on 30 October 2026, Windows 10, Chrome headless (puppeteer-core, hardware WebGL),
Node 24.14.1, Salla CLI 3.2.64, against Salla's public demo store (`salla theme dev`).
Legend: **Pass**, **Fail**, **Not run** (with the reason).

## 1. Build and code

| Check | Result | Notes |
| --- | --- | --- |
| `pnpm typecheck` | Pass | 0 errors |
| `pnpm check:manifest` | Pass | 0 errors, 0 warnings; 68 settings, 28 home blocks (17 Majmar) |
| `pnpm test` | Pass | 55 files, 440 tests (adds scent-profile parser tests) |
| `pnpm build` | Pass | 3D scene is its own chunk: 121 KB gzipped, loaded only on demand |
| ESLint / Prettier | Not run | Not configured in the starter |

## 2. Cinematic 3D

| Check | Result | Notes |
| --- | --- | --- |
| Hero first paint without WebGL (CSS/SVG still life) | Pass | Server HTML shows the CSS bottle |
| WebGL hero goes live after load | Pass | `.mj-hero__stage.is-live`, bottle on plinth, smoke and embers |
| Scroll Film: pinned stage and timeline | Pass | Shots at 2%, 30%, 50%, 70%, 97%: bottle turns, cap lifts toward camera, chapters 1–4, buy panel lands |
| Bottle and buy panel never overlap | Pass | Fixed during QA (bottle moved to the wrong side in RTL) |
| Mobile framing (390px) | Pass | Hero bottle above the copy; film bottle rises above the bottom buy panel |
| Reduced motion | Pass | No WebGL started; film renders its static layout with all chapters and the buy panel |
| Frame-sequence and MP4 film sources | Not run | Code path written; needs merchant assets to test |
| Rendering pauses off-screen | Pass (code review) | IntersectionObserver + visibilitychange |

Found and fixed during QA:
- Glass rendered milky white: replaced transmission with faceted clear glass.
- Theme colours looked washed out: they are now converted from sRGB to linear light.
- Hydration mismatch from Organization JSON-LD in a home hook slot: moved into the layout.
- Product rail cards stayed invisible (reveal never fired inside the horizontal scroller): rails now reveal their items together.

## 3. RTL / LTR and breakpoints

| Page | 390 | 1280 / 1440 | Notes |
| --- | --- | --- | --- |
| Home `/ar` | Pass | Pass | No horizontal scroll; one H1 |
| Home `/en` | Pass (film shots) | Pass (film shots) | Full-page English capture timed out in the headless browser |
| Product page | Not run | Not run | Same product page as Noir Atelier plus ScentNotes; demo products have no scent tags, so the parser is covered by unit tests only |

## 4. Store-side behaviour

| Check | Result | Notes |
| --- | --- | --- |
| Ritual / Gift box / Film "add to bag" | Not run | The demo store refuses cart calls from localhost (CORS); needs a linked store |
| Scent Finder results | Not run | Depends on the store's product names and tags |
| Countdown, FAQ, Reels, Families render | Pass | Visible in the full-page Arabic capture |

## 5. Before publishing

- Link a real demo store (`salla theme dev --store`) and test add-to-bag from the film, ritual and gift box.
- Add scent tags to one product and check the notes pyramid.
- Run Lighthouse on the hosted preview.
- Create the GitHub repository and import it in Salla Partners.
