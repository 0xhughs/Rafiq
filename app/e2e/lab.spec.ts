import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  LAB_FEEDBACK,
  LAB_NOT_FOUND,
  LAB_OK200,
  LAB_PATHS,
  PREVIEW_LOG,
  PROD_ERROR_LOG,
} from '../src/engine/lab';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToKioskDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/10');

test.setTimeout(240_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('kiosk-success through lab success with physical actions', async ({ page }) => {
  await playToKioskDone(page);
  const afterKiosk = await getState(page);
  expect(afterKiosk.evidence['4.5']).toBeUndefined();
  expect(afterKiosk.evidence['4.6']).toBeUndefined();
  expect(afterKiosk.evidence['5.4']).toBeUndefined();
  expect(afterKiosk.labQuest.labReady).toBe(false);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-kiosk-ready', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-lab-ready', 'false');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '13');

  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  await page.getByTestId('kiosk-lookup-sunday').click();
  await expect(page.getByTestId('kiosk-confirm')).toContainText('sun-pm');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'preview.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await expect(page.getByTestId('prod-face')).toBeVisible();
  await page.getByTestId('lab-lookup').click();
  await expect(page.getByTestId('lab-feedback')).toContainText(LAB_NOT_FOUND);
  await expect(page.getByTestId('lab-feedback')).toContainText(LAB_FEEDBACK.prodDown);
  await expect(page.getByTestId('prod-path')).toHaveCSS('direction', 'ltr');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'prod-broken.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  await expect(page.getByTestId('lab-terminal')).toBeVisible();
  await page.getByTestId('lab-patch-prod').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.needLog);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /4\.5/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'guess.png'), fullPage: true });

  await page.getByTestId('lab-ls').click();
  for (const listed of LAB_PATHS) {
    await expect(page.getByTestId('lab-ls-list')).toContainText(listed);
  }
  await expect(page.getByTestId('lab-ls-list').locator('.path-ltr').first()).toHaveCSS('direction', 'ltr');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'ls.png'), fullPage: true });

  await page.getByTestId('lab-cat-preview-log').click();
  await expect(page.getByTestId('lab-output')).toContainText(PREVIEW_LOG);
  await page.getByTestId('lab-cat-prod-log').click();
  await expect(page.getByTestId('lab-output')).toContainText(PROD_ERROR_LOG);
  await page.getByTestId('lab-select-prod-log').click();
  await expect(page.getByTestId('lab-output')).toContainText('404 GET /appointments/slot');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'logs.png'), fullPage: true });

  await page.getByTestId('lab-patch-prod').click();
  await expect(page.getByTestId('lab-feedback')).toContainText('/appointments/slots');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.5/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'fixed.png'), fullPage: true });

  await page.getByTestId('lab-rm').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.refused);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.4/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'refuse.png'), fullPage: true });

  await page.getByTestId('lab-publish').click();
  await expect(page.getByTestId('lab-feedback')).toContainText('v2');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'published.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await page.getByTestId('lab-lookup').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_OK200);
  await expect(page.getByTestId('lab-verified')).toContainText('sun-pm');
  await expect(page.getByTestId('lab-verified')).toContainText('mon-am');
  await expect(page.getByTestId('lab-verified')).toContainText('tue-pm');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.6/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-lab-ready', 'true');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'verified.png'), fullPage: true });
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['4.5']).toBe('demonstrated');
  expect(done.evidence['4.6']).toBe('demonstrated');
  expect(done.evidence['5.4']).toBe('demonstrated');
  expect(done.labQuest.labReady).toBe(true);
  expect(done.evidence['5.1']).toBeUndefined();
  expect(done.evidence['5.2']).toBeUndefined();
  expect(done.agentQuest.agentReady).toBe(false);

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/النسخة المجمّدة|الإنتاج/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText(/مختبر|نُشرت|الإنتاج/);
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/rm -rf|الجيران يرون المعاينة/);
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('شهادة');
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('MCP');
});

test('lab overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToKioskDone(page);
  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('lab-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('lab-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  const faceCard = page.getByTestId('lab-overlay');
  await expect(faceCard).toBeVisible();
  const faceBox = await faceCard.locator('.instruction-card').boundingBox();
  expect(faceBox).not.toBeNull();
  if (faceBox) {
    expect(faceBox.x).toBeGreaterThanOrEqual(0);
    expect(faceBox.y).toBeGreaterThanOrEqual(0);
    expect(faceBox.x + faceBox.width).toBeLessThanOrEqual(1921);
    expect(faceBox.y + faceBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
