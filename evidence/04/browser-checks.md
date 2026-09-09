# T04 browser checks — slice 04

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5173` and **preview** `http://127.0.0.1:4173` of `npm run build` |

## Results

All of the following Playwright files passed on **both** the development server and the production preview (25 tests each run):

- `e2e/journey.spec.ts` — slice 01 opening still works on a fresh storage context; `data-evidence` stays empty after help accepted.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI.
- `e2e/save.spec.ts` — reload resume; NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`.
- `e2e/shop.spec.ts` — help-accepted through shop success with physical actions. Shop success evidence remains `1.1,1.2,1.3,1.6` (no 2.x).
- `e2e/shop-retry.spec.ts` — trusting robot date price 18 fails; retry succeeds; no trap.
- `e2e/parcel.spec.ts` — shop_helped through parcel success with physical actions. Screenshots: `office.png` (مكتب طرود الرصيف with west ر-١٧ / east ر-٧١), `parcel-tags.png` (east tag: ر-٧١ للبيع ١٢, gray), `overbroad-stop.png` (exact overbroad line plus stop/allow), `ambiguous-fail.png` (هات الطرد الرمادي / gray fail, west staged to ر-١٩), `instruction-repair.png` (four understood fields for ر-١٩ west / no-pay / return to desk), `success.png` (clerk confirms hold; inventory طرد الإصلاح). Overlay bounds at 1366 (instruction card) and 1920 (pay window): `overlays.png` is the 1920 pay overlay, distinct from the instruction sheet.
- `e2e/parcel-retry.spec.ts` — allow overbroad fails recoverably then stop awards 2.1; ambiguous fail, revise missing field, fresh ر-١٩, failed send id does not become success; robot pay blocked; paying decoy awards no evidence.

Console errors observed in those viewport tests: **none**.

West repair hold starts as ر-١٧ (not for sale); after the ambiguous fail it becomes ر-١٩. East decoy stays ر-٧١ for sale 12. The instruction sheet is a paper record with four named fields, not a quiz. After success the HUD lead is the locked library inner door; the robot still invents an unsupported library rumor.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
