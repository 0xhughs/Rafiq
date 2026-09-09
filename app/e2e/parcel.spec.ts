import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import { OVERBROAD_LINE } from '../src/engine/parcel';
import {
  assertNoLessonUi,
  briefParcelClerk,
  clickChoice,
  closeOverlay,
  completeShopVisit,
  dispatch,
  enterParcelOffice,
  fillCompleteInstruction,
  getState,
  interactAt,
  playToHelpAccepted,
  skipExplainIfOpen,
  talkCompanionOnParcel,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/04');

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('shop_helped through parcel success with physical actions', async ({ page }) => {
  await playToHelpAccepted(page);
  await interactAt(page, 'street', WORLD_POS.parcelDoor.x, WORLD_POS.parcelDoor.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('طرود');
  await closeOverlay(page);

  await completeShopVisit(page);
  const afterShop = await getState(page);
  expect(afterShop.evidence['2.1']).toBeUndefined();
  expect(afterShop.evidence['2.2']).toBeUndefined();
  expect(afterShop.evidence['2.4']).toBeUndefined();

  await enterParcelOffice(page);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'office.png'), fullPage: true });
  await briefParcelClerk(page);

  await interactAt(page, 'parcel', WORLD_POS.holdWest.x, WORLD_POS.holdWest.y);
  await expect(page.getByTestId('parcel-tag-west')).toContainText('ر-١٧');
  await expect(page.getByTestId('parcel-tag-west')).toContainText('ليس للبيع');
  await expect(page.getByTestId('parcel-tag-west')).toContainText('رمادي');
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'parcel', WORLD_POS.holdEast.x, WORLD_POS.holdEast.y);
  await expect(page.getByTestId('parcel-tag-east')).toContainText('ر-٧١');
  await expect(page.getByTestId('parcel-tag-east')).toContainText('١٢');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'parcel-tags.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  const afterInspect = await getState(page);
  expect(afterInspect.evidence['2.1']).toBeUndefined();

  await talkCompanionOnParcel(page);
  await expect(page.getByTestId('dialogue-text')).toContainText('ماذا تبقي');
  await clickChoice(page, 'dialogue-choice-delegate_retrieve');
  await expect(page.getByTestId('dialogue-text')).toHaveText(OVERBROAD_LINE);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overbroad-stop.png'), fullPage: true });
  await clickChoice(page, 'dialogue-choice-stop_overbroad');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.1/);
  await page.getByTestId('dialogue-advance').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'parcel', WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
  await expect(page.getByTestId('instruction-overlay')).toBeVisible();
  await page.getByTestId('instruction-ambiguous').click();
  await expect(page.getByTestId('ambiguous-fail')).toBeVisible();
  await expect(page.getByTestId('instruction-feedback')).toContainText(/رمادي|ر-١٧|ر-٧١/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'ambiguous-fail.png'), fullPage: true });
  const afterFail = await getState(page);
  expect(afterFail.parcelQuest.failedAttempt).toBe(true);
  expect(afterFail.parcelQuest.r19Staged).toBe(true);
  expect(afterFail.evidence['2.4']).toBeUndefined();
  expect(afterFail.parcelQuest.retrievedParcelId).toBeNull();

  await fillCompleteInstruction(page, 'r19');
  await expect(page.getByTestId('understood-parcel')).toContainText('ر-١٩');
  await expect(page.getByTestId('understood-location')).toContainText('الرف الغربي');
  await expect(page.getByTestId('understood-constraints')).toContainText('لا تدفع');
  await expect(page.getByTestId('understood-return')).toContainText('رقم الحجز');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'instruction-repair.png'), fullPage: true });
  await page.getByTestId('instruction-send').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.4/);
  await expect(page.getByTestId('dialogue-text')).toContainText('الحجز');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();
  await skipExplainIfOpen(page);

  const done = await getState(page);
  expect(done.evidence['1.1']).toBe('demonstrated');
  expect(done.evidence['2.1']).toBe('demonstrated');
  expect(done.evidence['2.2']).toBe('demonstrated');
  expect(done.evidence['2.4']).toBe('demonstrated');
  expect(done.inventory).toContain('repair_parcel');
  expect(done.parcelQuest.commsRepaired).toBe(true);
  await expect(page.getByTestId('inventory')).toContainText('طرد الإصلاح');
  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('طرود');
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'library', WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('مقفل');
  await closeOverlay(page);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/المكتبة|منتصف/);
  await assertNoLessonUi(page);
});

test('parcel instruction overlay stays inside 1366 and 1920 viewports', async ({ page }) => {
  await playToHelpAccepted(page);
  await completeShopVisit(page);
  await enterParcelOffice(page);
  await briefParcelClerk(page);
  await page.setViewportSize({ width: 1366, height: 768 });
  await interactAt(page, 'parcel', WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
  const overlay = page.getByTestId('instruction-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('instruction-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'parcel', WORLD_POS.payWindow.x, WORLD_POS.payWindow.y);
  const pay = page.getByTestId('pay-overlay');
  await expect(pay).toBeVisible();
  const payBox = await pay.locator('.paper-card').boundingBox();
  expect(payBox).not.toBeNull();
  if (payBox) {
    expect(payBox.x).toBeGreaterThanOrEqual(0);
    expect(payBox.y).toBeGreaterThanOrEqual(0);
    expect(payBox.x + payBox.width).toBeLessThanOrEqual(1921);
    expect(payBox.y + payBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
