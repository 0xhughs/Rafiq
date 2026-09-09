import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAVE_KEY } from '../src/engine/constants';
import { collectConsoleText, playToHelpAccepted, waitForGame } from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/02');
const PLAYER = 'ZAYNAB-PRIVACY-PROBE';

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('keeps the confirmed name out of the URL, title, console, and LearnAI keys', async ({
  page,
}) => {
  const consoleLines = collectConsoleText(page);
  await playToHelpAccepted(page, PLAYER);
  await expect(page).not.toHaveURL(new RegExp(PLAYER));
  const url = page.url();
  expect(url).not.toContain(PLAYER);
  expect(url).not.toContain(encodeURIComponent(PLAYER));
  const title = await page.title();
  expect(title).not.toContain(PLAYER);
  expect(title).toContain('رفيق');
  const stored = await page.evaluate(() => {
    const keys = Object.keys(window.localStorage);
    const values: Record<string, string | null> = {};
    for (const key of keys) values[key] = window.localStorage.getItem(key);
    return { keys, values, href: window.location.href, title: document.title };
  });
  expect(stored.keys).toContain(SAVE_KEY);
  expect(stored.keys.some((key) => key.toLowerCase().includes('learnai'))).toBe(false);
  expect(stored.href).not.toContain(PLAYER);
  expect(stored.title).not.toContain(PLAYER);
  expect(JSON.stringify(stored.values[SAVE_KEY])).toContain(PLAYER);
  const leaked = consoleLines.filter((line) => line.includes(PLAYER));
  expect(leaked, leaked.join('\n')).toEqual([]);
  const report = [
    `url=${url}`,
    `title=${title}`,
    `localStorage_keys=${stored.keys.join(',')}`,
    `learnai_keys=none`,
    `console_name_leaks=${leaked.length}`,
    `save_has_name=${JSON.stringify(stored.values[SAVE_KEY] ?? '').includes(PLAYER)}`,
  ].join('\n');
  fs.writeFileSync(path.join(evidenceDir, 'privacy-checks.txt'), `${report}\n`, 'utf8');
});
