# T04 browser checks — slice 06

Recorded 2026-09-09 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox`, `--disable-http-cache` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5173` and **preview** `http://127.0.0.1:4180` of `npm run build` |

Playwright in this environment must not inherit an unrelated `BASE_URL` (this checkout exported `http://127.0.0.1:5178`). Preview runs used `env -u BASE_URL`; dev runs set `BASE_URL=http://127.0.0.1:5173`.

## Results

All of the following Playwright files passed on **both** the development server and the production preview (33 tests each run):

- `e2e/journey.spec.ts` — slice 01 opening still works on a fresh storage context; `data-evidence` stays empty after help accepted.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like names as text; exit without bag; wall block; held Space; postpone/reopen; typing does not move the player.
- `e2e/neighborhood.spec.ts` — checkpoint → shop → street → library, companion present, walls block, no lesson UI.
- `e2e/save.spec.ts` — reload resume; NPC postpone persist; corrupt primary → recovered notice; `storage-warning`; بداية جديدة.
- `e2e/privacy.spec.ts` — name absent from URL/title/console; `rafiq.adventure.v1` present; no `learnai*` keys.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`.
- `e2e/shop.spec.ts` — help-accepted through shop success. Shop success evidence remains `1.1,1.2,1.3,1.6`.
- `e2e/shop-retry.spec.ts` — trusting robot date price 18 fails; retry succeeds.
- `e2e/parcel.spec.ts` — shop_helped through parcel success, then inner door `F` enters map `archive`.
- `e2e/parcel-retry.spec.ts` — overbroad / ambiguous / decoy-pay retries still recover without awarding archive ids.
- `e2e/archive.spec.ts` — parcel-done through archive success. After 1.4+1.5+2.5, 06 ids stay unawarded. The body may contain `newsroom` as a map id / `data-newsroom-quest` (the old string ban was lifted). Entering قاعة أخبار الحي after archive success does not award 2.3 / 2.6 / 3.1 / 3.2 / 3.3. No certificate or exam UI.
- `e2e/archive-retry.spec.ts` — pin does not skip 1.4; overflow then reselect; unredacted give fails; wrong pack then correct named pack.
- `e2e/newsroom.spec.ts` — archive-success through newsroom success with physical actions. Screenshots in `evidence/06/`: `interior.png` (قاعة أخبار الحي with نشرة / ملصق / مقارنة / قصاصة / أصل / مسودة / صوت / خطاب), `sources.png` (نشرة الورشة + ملصق الرصيف with disagreeing hours and access), `comparison.png` (both names, both disagreements, real passages attached), `clipping.png` (ق-٢٠٤ midnight parts hold), `original.png` (festival night watch, not a parts hold), `mismatch.png` (attractive draft with always-open / midnight hold / no written request), `voice.png` (editor sample يا أهل الحي without نقلة نوعية), `letter.png` (مدير ورشة الإصلاح / موعد معاينة / واضح ومهذب), `success.png` (editor thanks + workshop lead). Overlay bounds at 1366 (compare card) and 1920 (letter card): `overlays.png` is the 1920 letter overlay.
- `e2e/newsroom-retry.spec.ts` — consensus fails then split awards 3.1; cite-before-original fails then follow+verify awards 3.3; unmarked then partial-correct release fail, then mark+correct all three awards 2.3; slogan and fact-change fail then editor voice retries and awards 2.6; circular 14 and robot-as-manager fail then reviewed player send awards 3.2. No trap.

Console errors observed in those viewport tests: **none**.

The newsroom overlays are paper sheets, not a quiz. After all five ids the HUD objective is the workshop lead; the workshop interior is not implemented. The robot still invents تعميم ١٤ / midnight parts.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
- Festival office and workshop interior (out of slice)
