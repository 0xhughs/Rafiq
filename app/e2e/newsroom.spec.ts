import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  DOC_ID,
  PASSAGE_A_ACCESS,
  PASSAGE_A_HOURS,
  PASSAGE_B_ACCESS,
  PASSAGE_B_HOURS,
  SOURCE_A_NAME,
  SOURCE_B_NAME,
} from '../src/engine/newsroom';
import {
  assertNoLessonUi,
  dispatch,
  enterNewsroom,
  getState,
  interactAt,
  playToArchiveDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/06');

test.setTimeout(120_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('archive-success through newsroom success with physical actions', async ({ page }) => {
  await playToArchiveDone(page);
  const afterArchive = await getState(page);
  expect(afterArchive.evidence['2.3']).toBeUndefined();
  expect(afterArchive.evidence['2.6']).toBeUndefined();
  expect(afterArchive.evidence['3.1']).toBeUndefined();
  expect(afterArchive.evidence['3.2']).toBeUndefined();
  expect(afterArchive.evidence['3.3']).toBeUndefined();

  await enterNewsroom(page);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'newsroom', WORLD_POS.editor.x, WORLD_POS.editor.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('قاعة أخبار الحي');
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');

  await interactAt(page, 'newsroom', WORLD_POS.sourceBulletin.x, WORLD_POS.sourceBulletin.y);
  await expect(page.getByTestId('source-a-text')).toContainText(PASSAGE_A_HOURS);
  await expect(page.getByTestId('source-a-text')).toContainText(PASSAGE_A_ACCESS);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.sourcePoster.x, WORLD_POS.sourcePoster.y);
  await expect(page.getByTestId('source-b-text')).toContainText(PASSAGE_B_HOURS);
  await expect(page.getByTestId('source-b-text')).toContainText(PASSAGE_B_ACCESS);
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'newsroom', WORLD_POS.compareDesk.x, WORLD_POS.compareDesk.y);
  await expect(page.getByTestId('compare-overlay')).toBeVisible();
  await expect(page.getByTestId('sources')).toContainText(SOURCE_A_NAME);
  await expect(page.getByTestId('sources')).toContainText(SOURCE_B_NAME);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'sources.png'), fullPage: true });
  await page.getByTestId('compare-namedBulletin').click();
  await page.getByTestId('compare-namedPoster').click();
  await page.getByTestId('compare-hoursA').click();
  await page.getByTestId('compare-hoursB').click();
  await page.getByTestId('compare-accessA').click();
  await page.getByTestId('compare-accessB').click();
  await expect(page.getByTestId('passage-a')).toContainText(PASSAGE_A_HOURS);
  await expect(page.getByTestId('passage-b')).toContainText(PASSAGE_B_HOURS);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'comparison.png'), fullPage: true });
  await page.getByTestId('compare-submit').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.1/);
  await closeThenSkip(page);

  await interactAt(page, 'newsroom', WORLD_POS.clippingBoard.x, WORLD_POS.clippingBoard.y);
  await expect(page.getByTestId('clipping-text')).toContainText(DOC_ID);
  await expect(page.getByTestId('clipping-text')).toContainText('حجز قطع منتصف الليل');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'clipping.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'newsroom', WORLD_POS.originalDrawer.x, WORLD_POS.originalDrawer.y);
  await expect(page.getByTestId('original-text')).toContainText('حراسة ليلية');
  await expect(page.getByTestId('original-text')).not.toContainText('حجز قطع منتصف الليل');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'original.png'), fullPage: true });
  await page.getByTestId('verify-original').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.3/);
  await skipExplainIfOpen(page);

  await interactAt(page, 'newsroom', WORLD_POS.draftTable.x, WORLD_POS.draftTable.y);
  await expect(page.getByTestId('attractive-draft')).toContainText('مفتوحة دائماً');
  await expect(page.getByTestId('attractive-draft')).toContainText('حجز قطع منتصف الليل');
  await expect(page.getByTestId('attractive-draft')).toContainText('لا حاجة لطلب مكتوب');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'mismatch.png'), fullPage: true });
  await page.getByTestId('draft-mark-always_open').click();
  await page.getByTestId('draft-correct-always_open').click();
  await page.getByTestId('draft-correct-midnight_hold').click();
  await page.getByTestId('draft-correct-no_written').click();
  await page.getByTestId('draft-release').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.3/);
  await closeThenSkip(page);

  await interactAt(page, 'newsroom', WORLD_POS.voiceDesk.x, WORLD_POS.voiceDesk.y);
  await expect(page.getByTestId('editor-sample')).toContainText('يا أهل الحي');
  await expect(page.getByTestId('editor-sample')).not.toContainText('نقلة نوعية');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'voice.png'), fullPage: true });
  await page.getByTestId('voice-editor').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.6/);
  await closeThenSkip(page);

  await interactAt(page, 'newsroom', WORLD_POS.letterDesk.x, WORLD_POS.letterDesk.y);
  await expect(page.getByTestId('letter-overlay')).toBeVisible();
  await page.getByTestId('letter-recipient-workshop_manager').click();
  await page.getByTestId('letter-purpose-inspection').click();
  await page.getByTestId('letter-tone-clear_polite').click();
  await page.getByTestId('letter-body-ok').click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'letter.png'), fullPage: true });
  await page.getByTestId('letter-review').click();
  await page.getByTestId('letter-send-player').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.2/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-lead', 'true');
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['2.3']).toBe('demonstrated');
  expect(done.evidence['2.6']).toBe('demonstrated');
  expect(done.evidence['3.1']).toBe('demonstrated');
  expect(done.evidence['3.2']).toBe('demonstrated');
  expect(done.evidence['3.3']).toBe('demonstrated');
  expect(done.newsroomQuest.workshopLead).toBe(true);

  await interactAt(page, 'newsroom', WORLD_POS.editor.x, WORLD_POS.editor.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('شكراً');
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('dialogue-text')).toContainText('ورشة');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('قارنت');
  await expect(page.getByTestId('journal-events')).toContainText('ق-٢٠٤');
  await expect(page.getByTestId('journal-events')).toContainText('خطاب');
  await expect(page.getByTestId('journal-events')).toContainText('ورشة');
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/تعميم ١٤|منتصف/);
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('شهادة');
  await expect(page.locator('body')).not.toContainText('امتحان');
});

test('newsroom overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToArchiveDone(page);
  await enterNewsroom(page);
  await interactAt(page, 'newsroom', WORLD_POS.sourceBulletin.x, WORLD_POS.sourceBulletin.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.sourcePoster.x, WORLD_POS.sourcePoster.y);
  await page.getByTestId('inspect-close').click();

  await page.setViewportSize({ width: 1366, height: 768 });
  await interactAt(page, 'newsroom', WORLD_POS.compareDesk.x, WORLD_POS.compareDesk.y);
  const overlay = page.getByTestId('compare-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('compare-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'newsroom', WORLD_POS.letterDesk.x, WORLD_POS.letterDesk.y);
  const letter = page.getByTestId('letter-overlay');
  await expect(letter).toBeVisible();
  const letterBox = await letter.locator('.instruction-card').boundingBox();
  expect(letterBox).not.toBeNull();
  if (letterBox) {
    expect(letterBox.x).toBeGreaterThanOrEqual(0);
    expect(letterBox.y).toBeGreaterThanOrEqual(0);
    expect(letterBox.x + letterBox.width).toBeLessThanOrEqual(1921);
    expect(letterBox.y + letterBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
