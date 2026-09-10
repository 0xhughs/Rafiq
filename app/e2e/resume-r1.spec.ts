import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import { CHECKPOINT_AFTER_HELP, OBJECTIVES } from '../src/engine/dialogue';
import { PLAN_EMPTY, SOURCE_TEXT } from '../src/engine/path';
import { PASSPORT_PDF_NAME, PASSPORT_PNG_NAME } from '../src/engine/passport';
import { EVIDENCE_IDS } from '../src/engine/types';
import {
  completePathQuest,
  dispatch,
  getState,
  interactAt,
  playToCrewDone,
  playToHelpAccepted,
  playToPathDone,
  skipExplainIfOpen,
  waitForGame,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/r1');
const PLAYER = 'علي حسن';

test.setTimeout(300_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

function journalCount(
  state: Awaited<ReturnType<typeof getState>>,
  id: string,
): number {
  return state.journalEvents.filter((event) => event.id === id).length;
}

test('help-accepted checkpoint leads to the store without leftover copy', async ({ page }) => {
  await playToHelpAccepted(page, PLAYER);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
  await expect(page.getByTestId('slice-checkpoint')).toHaveText(CHECKPOINT_AFTER_HELP);
  await expect(page.getByTestId('slice-checkpoint')).not.toHaveText(/قيد التطوير/);
  await expect(page.getByTestId('slice-checkpoint')).not.toHaveText(/سيُفتح|مغلق/);
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.cornerStore);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'checkpoint.png'), fullPage: true });
});

test('unfinished path-desk progress survives reload then completePathQuest awards 6.4 once', async ({
  page,
}) => {
  await playToCrewDone(page, PLAYER);
  await interactAt(page, 'workshop', WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y);
  await expect(page.getByTestId('path-desk')).toBeVisible();
  await expect(page.getByTestId('path-empty')).toHaveText('لا مسار جاهز');

  await page.getByTestId('path-inspect-source').click();
  await page.getByTestId('path-refuse-rumor').click();
  await page.getByTestId('path-goal-reading').click();

  await expect(page.getByTestId('path-source')).toHaveText(SOURCE_TEXT);
  await expect(page.getByTestId('path-source').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await expect(page.getByTestId('path-empty')).toHaveCount(0);
  await expect(page.getByTestId('path-plan')).toHaveText(PLAN_EMPTY);
  await expect(page.getByTestId('path-goal-reading')).toHaveClass(/primary/);

  const unfinished = await getState(page);
  expect(unfinished.pathQuest.sourceInspected).toBe(true);
  expect(unfinished.pathQuest.rumorRefused).toBe(true);
  expect(unfinished.pathQuest.goal).toBe('reading');
  expect(unfinished.pathQuest.tools).toBeNull();
  expect(unfinished.pathQuest.packReady).toBe(false);
  expect(unfinished.pathQuest.skillRan).toBe(false);
  expect(unfinished.pathQuest.restored).toBe(false);
  expect(unfinished.evidence['6.4']).toBeUndefined();
  expect(unfinished.endingState).toBe('in_progress');
  expect(unfinished.passportQuest.issued).toBe(false);
  expect(journalCount(unfinished, 'source_verified')).toBe(1);
  expect(journalCount(unfinished, 'path_opened')).toBe(1);
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  const inventoryBefore = [...unfinished.inventory];
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'unfinished.png'), fullPage: true });

  await page.setViewportSize({ width: 1366, height: 768 });
  const desk = page.getByTestId('path-desk');
  const box1366 = await desk.locator('.instruction-card').boundingBox();
  expect(box1366).not.toBeNull();
  if (box1366) {
    expect(box1366.x).toBeGreaterThanOrEqual(0);
    expect(box1366.y).toBeGreaterThanOrEqual(0);
    expect(box1366.x + box1366.width).toBeLessThanOrEqual(1367);
    expect(box1366.y + box1366.height).toBeLessThanOrEqual(769);
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  const box1920 = await desk.locator('.instruction-card').boundingBox();
  expect(box1920).not.toBeNull();
  if (box1920) {
    expect(box1920.x).toBeGreaterThanOrEqual(0);
    expect(box1920.y).toBeGreaterThanOrEqual(0);
    expect(box1920.x + box1920.width).toBeLessThanOrEqual(1921);
    expect(box1920.y + box1920.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });

  await page.reload();
  await waitForGame(page);
  await expect(page.getByTestId('name-overlay')).toHaveCount(0);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'workshop');
  await expect(page.getByTestId('path-desk')).toHaveCount(0);

  await interactAt(page, 'workshop', WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y);
  await expect(page.getByTestId('path-desk')).toBeVisible();
  await expect(page.getByTestId('path-source')).toHaveText(SOURCE_TEXT);
  await expect(page.getByTestId('path-empty')).toHaveCount(0);
  await expect(page.getByTestId('path-plan')).toHaveText(PLAN_EMPTY);
  await expect(page.getByTestId('path-goal-reading')).toHaveClass(/primary/);
  const resumed = await getState(page);
  expect(resumed.mode).toBe('path');
  expect(resumed.pathQuest.sourceInspected).toBe(true);
  expect(resumed.pathQuest.rumorRefused).toBe(true);
  expect(resumed.pathQuest.goal).toBe('reading');
  expect(resumed.pathQuest.tools).toBeNull();
  expect(resumed.pathQuest.packReady).toBe(false);
  expect(resumed.pathQuest.skillRan).toBe(false);
  expect(resumed.pathQuest.restored).toBe(false);
  expect(resumed.evidence['6.4']).toBeUndefined();
  expect(resumed.endingState).toBe('in_progress');
  expect(journalCount(resumed, 'source_verified')).toBe(1);
  expect(journalCount(resumed, 'path_opened')).toBe(1);
  expect(resumed.inventory).toEqual(inventoryBefore);
  expect(resumed.evidence['6.1']).toBe('demonstrated');
  expect(resumed.evidence['6.2']).toBe('demonstrated');
  expect(resumed.companion).toBe(true);
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'resume-puzzle.png'), fullPage: true });

  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await completePathQuest(page);
  const done = await getState(page);
  expect(done.evidence['6.4']).toBe('demonstrated');
  expect(done.pathQuest.restored).toBe(true);
  expect(journalCount(done, 'restored')).toBe(1);
  expect(EVIDENCE_IDS.length).toBe(34);
  for (const id of EVIDENCE_IDS) {
    expect(done.evidence[id], id).toBe('demonstrated');
  }
  expect(done.passportQuest.issued).toBe(false);
  expect(done.endingState).toBe('in_progress');
  await expect(page.getByTestId('certificate')).toHaveCount(0);
});

test('issued ending survives reload without a duplicate passport_issued', async ({ page }) => {
  await playToPathDone(page, PLAYER);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('شكراً');
  await expect(page.getByTestId('dialogue-text')).toContainText(PLAYER);
  await expect(page.getByTestId('dialogue-text')).toContainText('صرت جاهزاً للعمل تحت إشرافك في الحي');
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /الترميم يلغي الهلوسة|الامتحان الموقوت يكفي/,
  );
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  const afterTalk = await getState(page);
  expect(afterTalk.endingState).toBe('in_progress');
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('certificate')).toBeVisible();
  const invited = await getState(page);
  expect(invited.endingState).toBe('invited');
  expect(invited.passportQuest.issued).toBe(false);

  await page.getByTestId('certificate-confirm-name').click();
  const pngDownload = page.waitForEvent('download');
  await page.getByTestId('certificate-download-png').click();
  const png = await pngDownload;
  expect(png.suggestedFilename()).toBe(PASSPORT_PNG_NAME);
  expect(png.suggestedFilename()).not.toContain(PLAYER);
  const issued = await getState(page);
  expect(issued.passportQuest.issued).toBe(true);
  expect(issued.endingState).toBe('issued');
  expect(journalCount(issued, 'passport_issued')).toBe(1);

  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('open-passport')).toHaveText('الجواز');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.passportIssued);
  await expect(page.getByTestId('slice-checkpoint')).toHaveText(OBJECTIVES.passportIssued);

  await page.reload();
  await waitForGame(page);
  await expect(page.getByTestId('name-overlay')).toHaveCount(0);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-ending', 'issued');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.passportIssued);
  await expect(page.getByTestId('slice-checkpoint')).toHaveText(OBJECTIVES.passportIssued);
  const reloaded = await getState(page);
  expect(reloaded.endingState).toBe('issued');
  expect(reloaded.passportQuest.issued).toBe(true);
  expect(reloaded.passportQuest.nameConfirmed).toBe(true);
  expect(reloaded.passportQuest.pngDownloaded).toBe(true);
  expect(journalCount(reloaded, 'passport_issued')).toBe(1);
  expect(EVIDENCE_IDS.length).toBe(34);
  for (const id of EVIDENCE_IDS) {
    expect(reloaded.evidence[id], id).toBe('demonstrated');
  }
  expect(reloaded.evidence['6.4']).toBe('demonstrated');
  await expect(page.getByTestId('certificate')).toHaveCount(0);

  await page.getByTestId('open-passport').click();
  await expect(page.getByTestId('certificate')).toBeVisible();
  await expect(page.getByTestId('certificate-name')).toHaveText(PLAYER);
  const reopened = await getState(page);
  expect(journalCount(reopened, 'passport_issued')).toBe(1);
  expect(reopened.endingState).toBe('issued');

  await page.setViewportSize({ width: 1366, height: 768 });
  const card1366 = await page.getByTestId('certificate').locator('.certificate-card').boundingBox();
  expect(card1366).not.toBeNull();
  if (card1366) {
    expect(card1366.x).toBeGreaterThanOrEqual(0);
    expect(card1366.y).toBeGreaterThanOrEqual(0);
    expect(card1366.x + card1366.width).toBeLessThanOrEqual(1367);
    expect(card1366.y + card1366.height).toBeLessThanOrEqual(769);
  }
  await expect(page.getByTestId('certificate-version').locator('.path-ltr')).toHaveCSS(
    'direction',
    'ltr',
  );
  await page.setViewportSize({ width: 1920, height: 1080 });
  const card1920 = await page.getByTestId('certificate').locator('.certificate-card').boundingBox();
  expect(card1920).not.toBeNull();
  if (card1920) {
    expect(card1920.x).toBeGreaterThanOrEqual(0);
    expect(card1920.y).toBeGreaterThanOrEqual(0);
    expect(card1920.x + card1920.width).toBeLessThanOrEqual(1921);
    expect(card1920.y + card1920.height).toBeLessThanOrEqual(1081);
  }

  const replayPng = page.waitForEvent('download');
  await page.getByTestId('certificate-download-png').click();
  const pngAgain = await replayPng;
  expect(pngAgain.suggestedFilename()).toBe(PASSPORT_PNG_NAME);
  expect(pngAgain.suggestedFilename()).not.toContain(PLAYER);
  const replayPdf = page.waitForEvent('download');
  await page.getByTestId('certificate-download-pdf').click();
  const pdfAgain = await replayPdf;
  expect(pdfAgain.suggestedFilename()).toBe(PASSPORT_PDF_NAME);
  expect(pdfAgain.suggestedFilename()).not.toContain(PLAYER);
  expect(journalCount(await getState(page), 'passport_issued')).toBe(1);

  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'issued-reload.png'), fullPage: true });
});
