import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RESTORE_NOTICE, SAVE_BACKUP_KEY, SAVE_KEY, STORAGE_WARNING } from '../src/engine/constants';
import { WORLD_POS } from '../src/engine/maps';
import {
  getState,
  interactAt,
  playToHelpAccepted,
  startAdventure,
  waitForGame,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/02');

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('reload resumes at the last checkpoint without name entry', async ({ page }) => {
  await playToHelpAccepted(page, 'نورة سالم');
  await interactAt(page, 'street', WORLD_POS.shopDoor.x, WORLD_POS.shopDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'shop');
  await page.reload();
  await waitForGame(page);
  await expect(page.getByTestId('name-overlay')).toHaveCount(0);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'help_accepted');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'shop');
  const state = await getState(page);
  expect(state.companion).toBe(true);
  expect(state.playerName).toBe('نورة سالم');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'resume.png'), fullPage: true });
});

test('NPC postpone saves and duplicate trash does not clone the bag', async ({ page }) => {
  await startAdventure(page, 'سامي');
  await interactAt(page, 'apartment', WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y);
  await interactAt(page, 'street', WORLD_POS.neighbor.x, WORLD_POS.neighbor.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('جارنا الجديد');
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-postpone').click();
  const before = await getState(page);
  expect(before.encounter).toBe('unseen');
  expect(before.trash).toBe('home');
  await page.reload();
  await waitForGame(page);
  const after = await getState(page);
  expect(after.mode).toBe('playing');
  expect(after.encounter).toBe('unseen');
  expect(after.trash).toBe('home');
  expect(after.neighbor).toBe('unmet');

  await interactAt(page, 'street', WORLD_POS.streetDoor.x, WORLD_POS.streetDoor.y);
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await page.getByTestId('dialogue-advance').click();
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  const bag = await getState(page);
  expect(bag.inventory.filter((id) => id === 'trash_bag')).toHaveLength(1);
  expect(bag.trash).toBe('carried');
});

test('corrupt primary save restores the backup with a notice', async ({ page }) => {
  await playToHelpAccepted(page, 'ليان');
  const backup = await page.evaluate((key) => window.localStorage.getItem(key), SAVE_KEY);
  expect(backup).toBeTruthy();
  await page.evaluate(
    ({ primary, prev, value }) => {
      window.localStorage.setItem(prev, value);
      window.localStorage.setItem(primary, '{not-json');
    },
    { primary: SAVE_KEY, prev: SAVE_BACKUP_KEY, value: backup! },
  );
  await page.reload();
  await waitForGame(page);
  await expect(page.getByTestId('name-overlay')).toHaveCount(0);
  await expect(page.getByTestId('save-recovered')).toHaveText(RESTORE_NOTICE);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'help_accepted');
});

test('storage failure shows a warning and the session stays playable', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(key: string, value: string) {
      if (String(key).startsWith('rafiq.adventure')) {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      }
      return original.call(this, key, value);
    };
  });
  await startAdventure(page, 'هدى');
  await expect(page.getByTestId('storage-warning')).toHaveText(STORAGE_WARNING);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-trash', 'carried');
});

test('new adventure clears only Rafiq keys', async ({ page }) => {
  await playToHelpAccepted(page, 'ماجد');
  await page.evaluate(() => {
    window.localStorage.setItem('learnai.progress', 'keep-me');
  });
  await page.getByTestId('help-button').click();
  await page.getByTestId('new-adventure-button').click();
  await page.getByTestId('new-adventure-confirm').click();
  await expect(page.getByTestId('name-overlay')).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(keys.some((key) => key.startsWith('rafiq.adventure'))).toBe(false);
  expect(keys).toContain('learnai.progress');
});
