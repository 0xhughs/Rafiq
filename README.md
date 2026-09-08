# رفيق — جواز إلى مدينة الذكاء الاصطناعي

Arabic-first desktop browser adventure. Slice 01 is the playable opening: enter your name, wake in the apartment, take out the trash, and meet the damaged robot.

## Run the game

```bash
cd app
npm install
npm run dev
```

Open the printed local URL (typically http://127.0.0.1:5173). Use a desktop browser. The interface is RTL Arabic; movement uses arrow keys or physical WASD, and interact is E or Space.

Refresh resets this slice. There is no save yet.

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

## Slice 01 scope

Only the apartment, adjoining street, dumpster, and introductory robot conversation are playable. The corner store is a story lead, not a playable location yet.
