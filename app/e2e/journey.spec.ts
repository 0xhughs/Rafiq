import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  assertNoLessonUi,
  getState,
  interactAt,
  startAdventure,
  teleport,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/01');

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('happy path: name, trash, street, dumpster, robot, agree', async ({ page }) => {
  await startAdventure(page, 'علي حسن');
  await expect(page.getByTestId('hud-objective')).toBeVisible();
  await page.getByTestId('game-root').focus();
  const beforeMove = await getState(page);
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(250);
  await page.keyboard.up('KeyD');
  const afterMove = await getState(page);
  expect(afterMove.position.x).toBeGreaterThan(beforeMove.position.x);
  await teleport(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await expect(page.getByTestId('interact-hint')).toBeVisible();
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(evidenceDir, 'apartment.png'), fullPage: true });

  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  await expect(page.getByTestId('dialogue-text')).toHaveText('سأخرج كيس القمامة، ثم أعود.');
  await expect(page.getByTestId('dialogue-speaker')).toHaveText('علي حسن');
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-trash', 'carried');
  await expect(page.getByTestId('inventory')).toHaveText('كيس القمامة');

  await interactAt(page, 'apartment', WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'street');

  await interactAt(page, 'street', WORLD_POS.dumpsterApproach.x, WORLD_POS.dumpsterApproach.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-trash', 'disposed');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'available');

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toHaveText('ما هذا؟ روبوت؟');
  const spoken: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    spoken.push(await page.getByTestId('dialogue-text').innerText());
    if (await page.getByTestId('dialogue-agree').isVisible().catch(() => false)) {
      break;
    }
    await page.getByTestId('dialogue-advance').click();
  }
  expect(spoken.join('\n')).toMatch(/زرقاء/);
  expect(spoken.join('\n')).toMatch(/لم أدخل|لم أر/);
  await expect(page.getByTestId('dialogue-text')).toContainText('هل تساعدني');
  await page.getByTestId('dialogue-agree').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'help_accepted');
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('dialogue-text')).toContainText('المتجر عند الزاوية');
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('slice-checkpoint')).toBeVisible();
  await expect(page.getByTestId('hud-objective')).toContainText('المتجر عند الزاوية');
  await assertNoLessonUi(page);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(evidenceDir, 'robot-checkpoint.png'), fullPage: true });

  const state = await getState(page);
  expect(state.checkpointReached).toBe(true);
  expect(state.encounter).toBe('help_accepted');
});
