import { expect, test } from '@playwright/test';
import { NAME_MAX_CHARS } from '../src/engine/names';
import { APARTMENT, WORLD_POS } from '../src/engine/maps';
import {
  advanceUntilChoices,
  getState,
  interactAt,
  pressInteract,
  startAdventure,
  teleport,
  waitForGame,
} from './helpers';

test('rejects blank and overlong names with inline Arabic errors', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await page.getByTestId('name-submit').click();
  await expect(page.getByTestId('name-error')).toContainText('يرجى إدخال');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'name_entry');

  await page.getByTestId('name-input').fill('ا'.repeat(NAME_MAX_CHARS + 1));
  await page.getByTestId('name-submit').click();
  await expect(page.getByTestId('name-error')).toContainText('طويل');
  await expect(page.getByTestId('name-overlay')).toBeVisible();
});

test('renders markup-like names as literal text', async ({ page }) => {
  const name = '<b>علي</b>';
  await startAdventure(page, name);
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await expect(page.getByTestId('dialogue-text')).toHaveText('سأخرج كيس القمامة، ثم أعود.');
  await expect(page.getByTestId('dialogue-speaker')).toHaveText(name);
  await expect(page.locator('b')).toHaveCount(0);
});

test('exit without bag is recoverable and walls block movement', async ({ page }) => {
  await startAdventure(page, 'نورة');
  await interactAt(page, 'apartment', WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'street');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-trash', 'home');
  await interactAt(page, 'street', WORLD_POS.streetDoor.x, WORLD_POS.streetDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'apartment');
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-trash', 'carried');

  await teleport(page, 'apartment', WORLD_POS.westWallInside.x, WORLD_POS.westWallInside.y);
  const before = await getState(page);
  await page.getByTestId('game-root').focus();
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowLeft');
  const after = await getState(page);
  expect(after.position.x).toBeGreaterThan(40);
  expect(after.position.x).toBeLessThan(before.position.x + 20);
});

test('holding interact advances a single bubble', async ({ page }) => {
  await startAdventure(page, 'ليان');
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await page.getByTestId('dialogue-advance').click();
  await interactAt(page, 'apartment', WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y);
  await interactAt(page, 'street', WORLD_POS.dumpsterApproach.x, WORLD_POS.dumpsterApproach.y);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toHaveText('ما هذا؟ روبوت؟');
  await page.getByTestId('game-root').focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(900);
  await page.keyboard.up('Space');
  await expect(page.getByTestId('dialogue-text')).toHaveText('مرحباً… من أنت؟');
  await expect(page.getByTestId('dialogue-text')).not.toContainText('المتجر عند الزاوية');
});

test('postpone then reopen still allows agreeing', async ({ page }) => {
  await startAdventure(page, 'سامي');
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await page.getByTestId('dialogue-advance').click();
  await interactAt(page, 'apartment', WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y);
  await interactAt(page, 'street', WORLD_POS.dumpsterApproach.x, WORLD_POS.dumpsterApproach.y);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await advanceUntilChoices(page);
  await page.getByTestId('dialogue-postpone').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'available');
  await expect(page.getByTestId('dialogue-overlay')).toHaveCount(0);
  await pressInteract(page);
  await expect(page.getByTestId('dialogue-agree')).toBeVisible();
  await page.getByTestId('dialogue-agree').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'help_accepted');
});

test('typing on the name field never moves the player', async ({ page }) => {
  await page.goto('/');
  await waitForGame(page);
  await page.getByTestId('name-input').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('KeyD');
  await page.keyboard.press('KeyW');
  const origin = APARTMENT.spawn;
  await page.getByTestId('name-input').fill('Sara علي');
  await page.getByTestId('name-submit').click();
  await expect(page.getByTestId('name-preview')).toHaveText('Sara علي');
  await page.getByTestId('name-confirm').click();
  const state = await getState(page);
  expect(state.position.x).toBeCloseTo(origin.x, 0);
  expect(state.position.y).toBeCloseTo(origin.y, 0);
});
