import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  DISCLOSURE_STAMP,
  POLICY_TEXT,
  RECEIPTS_TEXT,
  SUPPORTED_TOTAL,
  TABLE_TEXT,
  TABLE_WATER,
  arNum,
} from '../src/engine/festival';
import {
  assertNoLessonUi,
  dispatch,
  enterFestival,
  getState,
  interactAt,
  playToNewsroomDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/07');

test.setTimeout(180_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('newsroom-success through festival success with physical actions', async ({ page }) => {
  await playToNewsroomDone(page);
  const afterNews = await getState(page);
  expect(afterNews.evidence['3.4']).toBeUndefined();
  expect(afterNews.evidence['3.5']).toBeUndefined();
  expect(afterNews.festivalQuest.workshopMaterials).toBe(false);

  await enterFestival(page);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'festival', WORLD_POS.officer.x, WORLD_POS.officer.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('مكتب المهرجان');
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');

  await interactAt(page, 'festival', WORLD_POS.stockTable.x, WORLD_POS.stockTable.y);
  await expect(page.getByTestId('stock-table-text')).toContainText(TABLE_TEXT.split('\n')[1]);
  await expect(page.getByTestId('stock-table-text')).toContainText(arNum(TABLE_WATER));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'table.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'festival', WORLD_POS.receiptsDesk.x, WORLD_POS.receiptsDesk.y);
  await expect(page.getByTestId('receipts-text')).toContainText(RECEIPTS_TEXT.split('\n')[1]);
  await expect(page.getByTestId('receipts-text')).toContainText('لا إيصال');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'receipts.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'festival', WORLD_POS.reconcileDesk.x, WORLD_POS.reconcileDesk.y);
  await expect(page.getByTestId('reconcile-overlay')).toBeVisible();
  await page.getByTestId('reconcile-flags-match').click();
  await page.getByTestId('reconcile-cloth-match').click();
  await page.getByTestId('reconcile-water-receipt').click();
  await page.getByTestId('reconcile-cups-unknown').click();
  await expect(page.getByTestId('missing-cups')).toContainText('غير معروف');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'missing.png'), fullPage: true });
  await page.screenshot({ path: path.join(evidenceDir, 'reconcile.png'), fullPage: true });
  await page.getByTestId('reconcile-sum').click();
  await expect(page.getByTestId('supported-total')).toHaveText(arNum(SUPPORTED_TOTAL));
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.4/);
  await closeThenSkip(page);

  await interactAt(page, 'festival', WORLD_POS.policyBoard.x, WORLD_POS.policyBoard.y);
  await expect(page.getByTestId('policy-text')).toContainText(POLICY_TEXT.split('\n')[0]);
  await expect(page.getByTestId('policy-text')).toContainText(DISCLOSURE_STAMP);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'policy.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'festival', WORLD_POS.submitDesk.x, WORLD_POS.submitDesk.y);
  await expect(page.getByTestId('submit-overlay')).toBeVisible();
  await page.getByTestId('submit-figures-human').click();
  await page.getByTestId('submit-stamp').click();
  await expect(page.getByTestId('disclosure-stamp')).toContainText(DISCLOSURE_STAMP);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'submission.png'), fullPage: true });
  await page.getByTestId('submit-send-player').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.5/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-materials', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-door', 'open');
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['3.4']).toBe('demonstrated');
  expect(done.evidence['3.5']).toBe('demonstrated');
  expect(done.festivalQuest.workshopMaterials).toBe(true);
  expect(done.festivalQuest.workshopDoorOpen).toBe(true);

  await interactAt(page, 'festival', WORLD_POS.officer.x, WORLD_POS.officer.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('شكراً');
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('dialogue-text')).toContainText('مواد');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('طابقت');
  await expect(page.getByTestId('journal-events')).toContainText('بيان الصرف');
  await expect(page.getByTestId('journal-events')).toContainText('مواد المعاينة');
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.workshopDoor.x, WORLD_POS.workshopDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'workshop');
  const afterDoor = await getState(page);
  expect(afterDoor.evidence['4.1']).toBeUndefined();
  expect(afterDoor.evidence['4.2']).toBeUndefined();
  expect(afterDoor.workshopQuest.servicePosted).toBe(false);

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/عشرة|ستة وأربعون/);
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('شهادة');
  await expect(page.locator('body')).not.toContainText('امتحان');
});

test('festival overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToNewsroomDone(page);
  await enterFestival(page);
  await interactAt(page, 'festival', WORLD_POS.stockTable.x, WORLD_POS.stockTable.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'festival', WORLD_POS.receiptsDesk.x, WORLD_POS.receiptsDesk.y);
  await page.getByTestId('inspect-close').click();

  await page.setViewportSize({ width: 1366, height: 768 });
  await interactAt(page, 'festival', WORLD_POS.reconcileDesk.x, WORLD_POS.reconcileDesk.y);
  const overlay = page.getByTestId('reconcile-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('reconcile-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'festival', WORLD_POS.submitDesk.x, WORLD_POS.submitDesk.y);
  const submit = page.getByTestId('submit-overlay');
  await expect(submit).toBeVisible();
  const submitBox = await submit.locator('.instruction-card').boundingBox();
  expect(submitBox).not.toBeNull();
  if (submitBox) {
    expect(submitBox.x).toBeGreaterThanOrEqual(0);
    expect(submitBox.y).toBeGreaterThanOrEqual(0);
    expect(submitBox.x + submitBox.width).toBeLessThanOrEqual(1921);
    expect(submitBox.y + submitBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
