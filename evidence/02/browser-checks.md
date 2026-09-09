# T04 browser checks — slice 02

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu 24.04.4 LTS (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5173` and **preview** `http://127.0.0.1:4173` of `npm run build` |

## Results

All of the following Playwright files passed on **both** the development server and the production preview (18 tests each run):

- `e2e/journey.spec.ts` — slice 01 opening still works on a fresh storage context.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI. Screenshots: `shop.png`, `library.png`, `journal.png`.
- `e2e/save.spec.ts` — reload resume without name overlay (`resume.png`); NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`. Journal overlay (`pause-overlay`, `journal-lead`, `journal-events`, `help-controls`) stayed inside the viewport; RTL; no `pageerror` or console `error`.

Console errors observed in those viewport tests: **none**.

Arabic shaping and mixed-script names were readable in the name confirmation, HUD, and journal overlay at both sizes. Overlays use `max-height: 90vh` and `overflow: auto`.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
