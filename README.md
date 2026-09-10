# رفيق — جواز إلى مدينة الذكاء الاصطناعي

Arabic-first desktop browser adventure. After the opening, the player can walk the connected street into the corner shop, check invented product claims against shelf records, and keep a readable Arabic journal.

## Run the game

```bash
cd app
npm install
npm run dev
```

Open the printed local URL (typically http://127.0.0.1:5173). Use a desktop browser. The interface is RTL Arabic; movement uses arrow keys or physical WASD, and interact is E or Space. Open the journal with **H**, **J**, or دفتر / مساعدة.

Progress is stored locally as `rafiq.adventure.v1` (with a `.prev` backup) on this browser only. The confirmed name stays in the game UI and that save payload — not in the document title, URL, or logs.

## Other commands

```bash
cd app
npm run build
npm run preview
npm test
npm run test:e2e
npm run lint
```

`test` runs Vitest unit tests. `test:e2e` runs Playwright against Google Chrome (`/usr/bin/google-chrome` in this environment) using the production preview. Build the app first (`npm run build`) so the preview server has `dist/`.

## Current slice

Apartment, street, corner-store visit, parcel office, library exterior, the inner reading room, قاعة أخبار الحي, مكتب المهرجان, and ورشة الإصلاح are playable after agreeing to help the robot. After festival materials, the south-street workshop door portals into the workshop: write a product brief for a tiny appointment board, hand it to the builder, inspect the result, and book one posted slot. After the board is posted, three workshop stations unlock: a documented fictional API slip, a server-side vault, and a neighborhood kiosk. Wire the dummy key in the vault (not on the kiosk face), repair RTL, isolate `slot-id`, and test a posted-slot lookup. After the kiosk works, a deployment lab unlocks on the same workshop floor: reproduce the frozen production break (`GET /appointments/slot`), read logs, patch `production/kiosk.js`, refuse a destructive command, publish frozen v2, and verify production. Kiosk success does not award 4.5/4.6/5.4. After the frozen production copy is repaired, a bounded neighborhood job unlocks on the same workshop floor: configure a goal, allowed tools, success test, and stop; watch the runner post three slots to لوحة الحي; and see it stop for missing input and an extra step. Lab success does not award 5.1/5.2. After that job, منصة الموصل and متصفح السجل unlock: connect the robot’s application to a fictional civic-hours server through a client, grant only lookup/draft, save a draft of NH-1447 hours, refuse a denied tool and a missing capability, and contrast the read-only browser. Agent success does not award 5.3. After the civic-hours draft is saved, منصة المهارة and ساعة الحي unlock: correct a one-shot hall-hours summary, save a five-part stored procedure, try it on a second record, then arm Sunday 08:00 on the hall clock, watch it fire, and pause it. Bridge success does not award 5.5/5.6.
