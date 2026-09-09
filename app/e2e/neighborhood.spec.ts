import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { playerHitsSolid } from '../src/engine/collision';
import { WORLD_POS } from '../src/engine/maps';
import {
  assertNoLessonUi,
  getState,
  interactAt,
  playToHelpAccepted,
  teleport,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/02');

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('walks from the slice 01 checkpoint into shop and library', async ({ page }) => {
  await playToHelpAccepted(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'help_accepted');

  await interactAt(page, 'street', WORLD_POS.shopDoor.x, WORLD_POS.shopDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'shop');
  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('بقالة');
  await expect(page.getByTestId('journal-lead')).toBeVisible();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'journal.png'), fullPage: true });
  await page.getByTestId('resume-button').click();
  const inShop = await getState(page);
  expect(inShop.companion).toBe(true);
  expect(inShop.encounter).toBe('help_accepted');
  expect(playerHitsSolid('shop', inShop.position.x, inShop.position.y)).toBe(false);
  await teleport(page, 'shop', WORLD_POS.shopWestWallInside.x, WORLD_POS.shopWestWallInside.y);
  const beforeShopWall = await getState(page);
  await page.getByTestId('game-root').focus();
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowLeft');
  const afterShopWall = await getState(page);
  expect(afterShopWall.position.x).toBeGreaterThan(40);
  expect(afterShopWall.position.x).toBeLessThan(beforeShopWall.position.x + 20);
  await teleport(page, 'shop', WORLD_POS.shopSpawn.x, WORLD_POS.shopSpawn.y);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'shop.png'), fullPage: true });
  await assertNoLessonUi(page);

  await interactAt(page, 'shop', WORLD_POS.shopExit.x, WORLD_POS.shopExit.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'street');

  await interactAt(page, 'street', WORLD_POS.libraryDoor.x, WORLD_POS.libraryDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'library');
  const inLibrary = await getState(page);
  expect(inLibrary.companion).toBe(true);
  expect(inLibrary.encounter).toBe('help_accepted');
  expect(playerHitsSolid('library', inLibrary.position.x, inLibrary.position.y)).toBe(false);
  await teleport(page, 'library', WORLD_POS.libraryWestWallInside.x, WORLD_POS.libraryWestWallInside.y);
  const beforeLibWall = await getState(page);
  await page.getByTestId('game-root').focus();
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowLeft');
  const afterLibWall = await getState(page);
  expect(afterLibWall.position.x).toBeGreaterThan(40);
  expect(afterLibWall.position.x).toBeLessThan(beforeLibWall.position.x + 20);
  await teleport(page, 'library', WORLD_POS.librarySpawn.x, WORLD_POS.librarySpawn.y);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'library.png'), fullPage: true });
  await assertNoLessonUi(page);

  await interactAt(page, 'library', WORLD_POS.libraryExit.x, WORLD_POS.libraryExit.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'street');
});
