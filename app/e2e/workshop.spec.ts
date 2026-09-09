import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  ACCEPTANCE_OK,
  CONSTRAINTS_OK,
  EXCLUSIONS_OK,
  EXTRAS_TEXT,
  NEED_TEXT,
  SCREENS_OK,
  SLOT_LABELS,
  WORKSHOP_FEEDBACK,
} from '../src/engine/workshop';
import {
  assertNoLessonUi,
  dispatch,
  enterWorkshop,
  getState,
  interactAt,
  playToFestivalDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/08');

test.setTimeout(180_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('festival-success through workshop success with physical actions', async ({ page }) => {
  await playToFestivalDone(page);
  const afterFest = await getState(page);
  expect(afterFest.evidence['4.1']).toBeUndefined();
  expect(afterFest.evidence['4.2']).toBeUndefined();
  expect(afterFest.workshopQuest.servicePosted).toBe(false);

  await enterWorkshop(page);
  const afterEnter = await getState(page);
  expect(afterEnter.evidence['4.1']).toBeUndefined();
  expect(afterEnter.evidence['4.2']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('لوحة مواعيد المعاينة');
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');

  await interactAt(page, 'workshop', WORLD_POS.needSlip.x, WORLD_POS.needSlip.y);
  await expect(page.getByTestId('need-text')).toContainText(NEED_TEXT.split('\n')[1]);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'need.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.extrasSlip.x, WORLD_POS.extrasSlip.y);
  await expect(page.getByTestId('extras-text')).toContainText(EXTRAS_TEXT.split('\n')[1]);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'extras.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  await expect(page.getByTestId('brief-overlay')).toBeVisible();
  await page.getByTestId('brief-constraints-ok').click();
  await page.getByTestId('brief-exclusions-ok').click();
  await page.getByTestId('brief-acceptance-ok').click();
  await page.getByTestId('brief-close').click();

  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-hand').click();
  await expect(page.getByTestId('builder-feedback')).toContainText(WORKSHOP_FEEDBACK.needScreens);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'missing.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  await page.getByTestId('brief-screens-ok').click();
  await page.getByTestId('brief-constraints-ok').click();
  await page.getByTestId('brief-exclusions-ok').click();
  await page.getByTestId('brief-acceptance-ok').click();
  await expect(page.getByTestId('brief-screens-ok')).toContainText(SCREENS_OK.split('+')[0].trim());
  await expect(page.getByTestId('brief-constraints-ok')).toContainText(CONSTRAINTS_OK.slice(0, 12));
  await expect(page.getByTestId('brief-exclusions-ok')).toContainText('لا كiosk');
  await expect(page.getByTestId('brief-acceptance-ok')).toContainText(ACCEPTANCE_OK.slice(0, 10));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'brief.png'), fullPage: true });
  await page.getByTestId('brief-close').click();

  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-hand').click();
  await expect(page.getByTestId('builder-feedback')).toContainText('سُلّم');
  await page.getByTestId('builder-build').click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'builder.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.resultCheck.x, WORLD_POS.resultCheck.y);
  await page.getByTestId('result-screens').click();
  await page.getByTestId('result-constraints').click();
  await page.getByTestId('result-exclusions').click();
  await page.getByTestId('result-acceptance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.2/);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.appointmentBoard.x, WORLD_POS.appointmentBoard.y);
  await expect(page.getByTestId('board-overlay')).toBeVisible();
  await expect(page.getByTestId('board-slot-sunday')).toContainText(SLOT_LABELS.sunday);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'board.png'), fullPage: true });
  await page.getByTestId('board-book-sunday').click();
  await expect(page.getByTestId('board-booked')).toHaveText('محجوز');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.1/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-service-posted', 'true');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'booked.png'), fullPage: true });
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['4.1']).toBe('demonstrated');
  expect(done.evidence['4.2']).toBe('demonstrated');
  expect(done.workshopQuest.servicePosted).toBe(true);

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('شكراً');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('لوحة مواعيد المعاينة');
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/مفتوحة دائماً|الدفع/);
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('شهادة');
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('MCP');
});

test('workshop overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToFestivalDone(page);
  await enterWorkshop(page);
  await interactAt(page, 'workshop', WORLD_POS.needSlip.x, WORLD_POS.needSlip.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  await page.getByTestId('brief-screens-ok').click();
  await page.getByTestId('brief-constraints-ok').click();
  await page.getByTestId('brief-exclusions-ok').click();
  await page.getByTestId('brief-acceptance-ok').click();
  await page.getByTestId('brief-close').click();
  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-hand').click();
  await page.getByTestId('builder-build').click();
  await page.getByTestId('inspect-close').click();

  await page.setViewportSize({ width: 1366, height: 768 });
  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  const overlay = page.getByTestId('brief-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('brief-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.appointmentBoard.x, WORLD_POS.appointmentBoard.y);
  const board = page.getByTestId('board-overlay');
  await expect(board).toBeVisible();
  const boardBox = await board.locator('.instruction-card').boundingBox();
  expect(boardBox).not.toBeNull();
  if (boardBox) {
    expect(boardBox.x).toBeGreaterThanOrEqual(0);
    expect(boardBox.y).toBeGreaterThanOrEqual(0);
    expect(boardBox.x + boardBox.width).toBeLessThanOrEqual(1921);
    expect(boardBox.y + boardBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
