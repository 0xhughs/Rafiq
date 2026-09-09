import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  NOTE_TEXT,
  PRIVATE_STRING_LIST,
  NEEDED_STRING_LIST,
  PACK_STAMP_RAFIQ,
} from '../src/engine/library';
import {
  assertNoLessonUi,
  dispatch,
  enterArchive,
  getState,
  interactAt,
  playToParcelDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/05');

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('parcel-done through archive success with physical actions', async ({ page }) => {
  await playToParcelDone(page);
  const afterParcel = await getState(page);
  expect(afterParcel.evidence['1.4']).toBeUndefined();
  expect(afterParcel.evidence['1.5']).toBeUndefined();
  expect(afterParcel.evidence['2.5']).toBeUndefined();

  await enterArchive(page);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'archive', WORLD_POS.librarian.x, WORLD_POS.librarian.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('قاعة القراءة');
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-advance').click();

  await interactAt(page, 'archive', WORLD_POS.communityFile.x, WORLD_POS.communityFile.y);
  await expect(page.getByTestId('community-file')).toBeVisible();
  const fileSource = page.getByTestId('community-file-source');
  for (const item of PRIVATE_STRING_LIST) {
    await expect(fileSource).toContainText(item);
  }
  for (const item of NEEDED_STRING_LIST) {
    await expect(fileSource).toContainText(item);
  }
  await expect(fileSource).not.toContainText('علي حسن');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'community-file.png'), fullPage: true });
  await page.getByTestId('redact-close').click();

  await interactAt(page, 'archive', WORLD_POS.contextBench.x, WORLD_POS.contextBench.y);
  await expect(page.getByTestId('context-overlay')).toBeVisible();
  await expect(page.getByTestId('context-slot-0')).toContainText('المهرجان');
  await expect(page.getByTestId('context-slot-1')).toContainText('المانجو');
  await page.getByTestId('context-load-constraint').click();
  await expect(page.getByTestId('context-overflow')).toBeVisible();
  await expect(page.getByTestId('context-slot-0')).toContainText('المانجو');
  await expect(page.getByTestId('context-slot-1')).toContainText('قيد');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overflow.png'), fullPage: true });
  await page.getByTestId('context-load-hold').click();
  await expect(page.getByTestId('context-slot-0')).toContainText('قيد');
  await expect(page.getByTestId('context-slot-1')).toContainText('الحجز');
  await page.getByTestId('context-recite').click();
  await expect(page.getByTestId('context-recitation')).toHaveText(NOTE_TEXT.constraint);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /1\.4/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'reselect.png'), fullPage: true });
  await page.getByTestId('context-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'archive', WORLD_POS.communityFile.x, WORLD_POS.communityFile.y);
  await page.getByTestId('redact-name_noura').click();
  await page.getByTestId('redact-name_khalid').click();
  await page.getByTestId('redact-phone').click();
  await page.getByTestId('redact-address').click();
  await expect(page.getByTestId('redact-payload')).not.toContainText('نورة الشمري');
  await expect(page.getByTestId('redact-payload')).toContainText('م-٤');
  await page.getByTestId('redact-give').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /1\.5/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'redact.png'), fullPage: true });
  await page.getByTestId('redact-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'archive', WORLD_POS.packTable.x, WORLD_POS.packTable.y);
  await expect(page.getByTestId('pack-overlay')).toBeVisible();
  await page.getByTestId('pack-toggle-spec').click();
  await page.getByTestId('pack-toggle-delivery').click();
  await page.getByTestId('pack-stamp-rafiq_repair').click();
  await expect(page.getByTestId('pack-stamp-rafiq_repair')).toContainText(PACK_STAMP_RAFIQ);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'pack.png'), fullPage: true });
  await page.getByTestId('pack-assemble').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.5/);
  await page.getByTestId('pack-close').click();
  await skipExplainIfOpen(page);

  await expect(page.getByTestId('context-module')).toHaveText('وحدة السياق');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-cassette', 'contextModule');
  await interactAt(page, 'archive', WORLD_POS.specCase.x, WORLD_POS.specCase.y);
  await expect(page.getByTestId('spec-text')).toContainText('م-٤');
  await expect(page.getByTestId('spec-text')).toContainText('بعد العصر');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  const done = await getState(page);
  expect(done.evidence['1.4']).toBe('demonstrated');
  expect(done.evidence['1.5']).toBe('demonstrated');
  expect(done.evidence['1.6']).toBe('demonstrated');
  expect(done.evidence['2.5']).toBe('demonstrated');
  expect(done.libraryQuest.contextModule).toBe(true);
  expect(done.libraryQuest.specReleased).toBe(true);
  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('حزمة');
  await page.getByTestId('resume-button').click();
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/الأخبار|منتصف/);
  await assertNoLessonUi(page);
  expect(done.evidence['2.3']).toBeUndefined();
  expect(done.evidence['2.6']).toBeUndefined();
  expect(done.evidence['3.1']).toBeUndefined();
  expect(done.evidence['3.2']).toBeUndefined();
  expect(done.evidence['3.3']).toBeUndefined();
  await page.getByTestId('dialogue-advance').click();
  await interactAt(page, 'street', WORLD_POS.newsroomDoor.x, WORLD_POS.newsroomDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'newsroom');
  const entered = await getState(page);
  expect(entered.evidence['2.3']).toBeUndefined();
  expect(entered.evidence['2.6']).toBeUndefined();
  expect(entered.evidence['3.1']).toBeUndefined();
  expect(entered.evidence['3.2']).toBeUndefined();
  expect(entered.evidence['3.3']).toBeUndefined();
  await expect(page.locator('body')).not.toContainText('شهادة');
  await expect(page.locator('body')).not.toContainText('امتحان');
});

test('archive overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToParcelDone(page);
  await enterArchive(page);
  await page.setViewportSize({ width: 1366, height: 768 });
  await interactAt(page, 'archive', WORLD_POS.contextBench.x, WORLD_POS.contextBench.y);
  const overlay = page.getByTestId('context-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('context-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'archive', WORLD_POS.communityFile.x, WORLD_POS.communityFile.y);
  const file = page.getByTestId('redact-overlay');
  await expect(file).toBeVisible();
  const fileBox = await file.locator('.paper-card').boundingBox();
  expect(fileBox).not.toBeNull();
  if (fileBox) {
    expect(fileBox.x).toBeGreaterThanOrEqual(0);
    expect(fileBox.y).toBeGreaterThanOrEqual(0);
    expect(fileBox.x + fileBox.width).toBeLessThanOrEqual(1921);
    expect(fileBox.y + fileBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
