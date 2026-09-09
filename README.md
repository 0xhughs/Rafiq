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

Apartment, street, corner-store visit, parcel office, library exterior, the inner reading room, and قاعة أخبار الحي are playable after agreeing to help the robot. After the archive’s context module is ready, the street door between the shop and the library opens into the newsroom: compare two disagreeing papers, follow clipping ق-٢٠٤ to its original, mark and correct an attractive draft, match the editor’s voice, and review a repair-request letter. Success thanks the editor and opens a workshop lead; the workshop interior is not open yet.
