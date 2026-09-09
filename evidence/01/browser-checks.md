# T04 browser checks — slice 01

Recorded 2026-09-08 on the Cloud Agent VM.

## Environment that was tested

| Item | Value |
|---|---|
| OS | Ubuntu 24.04.4 LTS (Linux 6.12.94+ x86_64) |
| Browser | Google Chrome 148.0.7778.96 (`/usr/bin/google-chrome`) |
| Playwright | `@playwright/test` 1.63, `executablePath=/usr/bin/google-chrome`, `--no-sandbox` |
| App servers | Vite 6.4.3 **dev** `http://127.0.0.1:5173` and **preview** `http://127.0.0.1:4173` of `npm run build` |

## Results

All of the following Playwright files passed on **both** the development server and the production preview:

- `e2e/journey.spec.ts` — valid Arabic name → WASD movement → bag → street → dumpster → inspect → unseen-fact lines → agree → checkpoint. Screenshots: `apartment.png`, `robot-checkpoint.png`.
- `e2e/negative.spec.ts` — blank/overlong names; markup-like name `<b>علي</b>` as text; exit without bag and return; wall block; held Space advances one bubble; postpone/reopen; typing on the name field does not move the player.
- `e2e/viewports.spec.ts` — 1366×768 and 1920×1080 with names `عبد الرحمن الطويل الأحمدي` and `Sara علي-Khan`. Pause/help overlay stayed inside the viewport; objective remained readable; no `pageerror` or console `error` messages.

Console errors observed in those viewport tests: **none**.

Arabic shaping and mixed-script names were readable in the name confirmation, HUD, and help overlay at both sizes. Overlays use `max-height: 90vh` and `overflow: auto`.

No sound, pixel-perfect click, or timed reaction is required.

## Untested (explicit)

- Firefox, Microsoft Edge, and Safari
- Windows and macOS desktops
- Mobile viewports (out of slice)
- Hardware Arabic keyboard (physical `KeyW`/`KeyA`/`KeyS`/`KeyD` codes were used; a physical Arabic keyboard was not attached)
