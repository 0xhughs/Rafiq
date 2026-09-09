# T04 browser checks — slice 03

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5173` and **preview** `http://127.0.0.1:4173` of `npm run build` |

## Results

All of the following Playwright files passed on **both** the development server and the production preview (21 tests each run):

- `e2e/journey.spec.ts` — slice 01 opening still works on a fresh storage context; `data-evidence` stays empty after help accepted (opening does not demonstrate 1.1).
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI.
- `e2e/save.spec.ts` — reload resume; NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`.
- `e2e/shop.spec.ts` — help-accepted through shop success with physical actions. Screenshots: `shelf-record.png` (west card: خبز 3, لبن 4, ماء 2 متوفر, no mango), `calculator.png` (3×3+2×4 → 17), `notice.png` (posted ١٧ / تمر ٩ / ماء متوفر, no ٢٠ / ١٨ / نفد), `success.png` (البقال thanks). Overlay bounds at 1366 (inspect card) and 1920 (calculator): `overlays.png` is the 1920 calculator overlay, distinct from the shelf card.
- `e2e/shop-retry.spec.ts` — trusting robot date price 18 fails; retry succeeds; second-claim UI does not name the west shelf or water card; no trap.

Console errors observed in those viewport tests: **none**.

Shop cards look like paper records (not quizzes). Calculator result 17. Posted notice shows ١٧ and source-backed facts without presenting ٢٠ / تمر ١٨ / ماء نفد as true. After success the shopkeeper thanks the player and the HUD lead is the repair parcel; the library inner door stays locked.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
