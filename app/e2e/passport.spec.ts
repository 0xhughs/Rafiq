import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import { OBJECTIVES } from '../src/engine/dialogue';
import {
  CAMPAIGN_DATE,
  CAMPAIGN_VERSION,
  CERTIFICATE_BODY,
  CERTIFICATE_DISCLAIMER,
  CERTIFICATE_INVITE,
  CERTIFICATE_TITLE,
  PASSPORT_PDF_NAME,
  PASSPORT_PNG_NAME,
} from '../src/engine/passport';
import { PRODUCT_TITLE } from '../src/engine/constants';
import {
  dispatch,
  getState,
  interactAt,
  playToPathDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/17');
const LONG_AR = 'عبد الرحمن بن محمد بن عبد الله الأندلسي';
const MIXED = 'Sara علي-Khan';

test.setTimeout(300_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('path-done thanks then passport overlay, confirm, and local downloads', async ({ page }) => {
  await playToPathDone(page, LONG_AR);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-ending', 'in_progress');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.restored);
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  await expect(page.getByTestId('open-passport')).toHaveCount(0);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('شكراً');
  await expect(page.getByTestId('dialogue-text')).toContainText(LONG_AR);
  await expect(page.getByTestId('dialogue-text')).toContainText('صرت جاهزاً للعمل تحت إشرافك في الحي');
  await expect(page.getByTestId('dialogue-text')).toContainText(/الترميم يلغي الهلوسة|الامتحان الموقوت يكفي/);
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'thanks.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  const afterThanks = await getState(page);
  expect(afterThanks.passportQuest.thanksHeard).toBe(true);
  expect(afterThanks.endingState).toBe('in_progress');
  expect(afterThanks.passportQuest.issued).toBe(false);

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('certificate')).toBeVisible();
  await expect(page.getByTestId('certificate')).toHaveCSS('direction', 'rtl');
  await expect(page.getByTestId('certificate-invite')).toHaveText(CERTIFICATE_INVITE);
  await expect(page.getByTestId('certificate-title')).toHaveText(CERTIFICATE_TITLE);
  await expect(page.getByTestId('certificate-product')).toHaveText(PRODUCT_TITLE);
  await expect(page.getByTestId('certificate-name')).toHaveText(LONG_AR);
  await expect(page.getByTestId('certificate-name')).toHaveCSS('unicode-bidi', 'plaintext');
  await expect(page.getByTestId('certificate-body')).toHaveText(CERTIFICATE_BODY);
  await expect(page.getByTestId('certificate-version')).toContainText(`إصدار الحملة: ${CAMPAIGN_VERSION}`);
  await expect(page.getByTestId('certificate-version').locator('.path-ltr')).toHaveCSS('direction', 'ltr');
  await expect(page.getByTestId('certificate-date')).toHaveText(`تاريخ الإتمام: ${CAMPAIGN_DATE}`);
  await expect(page.getByTestId('certificate-disclaimer')).toHaveText(CERTIFICATE_DISCLAIMER);
  await expect(page.getByTestId('certificate-preview')).toBeVisible();
  const invited = await getState(page);
  expect(invited.endingState).toBe('invited');
  expect(invited.passportQuest.issued).toBe(false);
  expect(invited.passportQuest.pngDownloaded).toBe(false);
  expect(invited.passportQuest.pdfDownloaded).toBe(false);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlay.png'), fullPage: true });
  await page.screenshot({ path: path.join(evidenceDir, 'name-ar.png'), fullPage: true });

  await page.getByTestId('certificate-confirm-name').click();
  const confirmed = await getState(page);
  expect(confirmed.passportQuest.nameConfirmed).toBe(true);
  expect(confirmed.passportQuest.issued).toBe(false);

  const pngDownload = page.waitForEvent('download');
  await page.getByTestId('certificate-download-png').click();
  const png = await pngDownload;
  expect(png.suggestedFilename()).toBe(PASSPORT_PNG_NAME);
  expect(png.suggestedFilename()).not.toContain(LONG_AR);
  await png.saveAs(path.join(evidenceDir, 'rafiq-passport.png'));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'png.png'), fullPage: true });

  const pdfDownload = page.waitForEvent('download');
  await page.getByTestId('certificate-download-pdf').click();
  const pdf = await pdfDownload;
  expect(pdf.suggestedFilename()).toBe(PASSPORT_PDF_NAME);
  expect(pdf.suggestedFilename()).not.toContain(LONG_AR);
  await pdf.saveAs(path.join(evidenceDir, 'rafiq-passport.pdf'));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'pdf.png'), fullPage: true });

  const issued = await getState(page);
  expect(issued.passportQuest.issued).toBe(true);
  expect(issued.endingState).toBe('issued');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-ending', 'issued');
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.passportIssued);
  await expect(page.getByTestId('open-passport')).toHaveText('الجواز');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });

  const pngBytes = fs.readFileSync(path.join(evidenceDir, 'rafiq-passport.png'));
  expect(pngBytes[0]).toBe(0x89);
  expect(pngBytes[1]).toBe(0x50);
  expect(pngBytes[2]).toBe(0x4e);
  expect(pngBytes[3]).toBe(0x47);
  const pdfBytes = fs.readFileSync(path.join(evidenceDir, 'rafiq-passport.pdf'));
  expect(pdfBytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdfBytes.includes(pngBytes.subarray(0, 8))).toBe(true);
});

test('mixed-script name appears on the overlay', async ({ page }) => {
  await playToPathDone(page, MIXED);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await page.getByTestId('dialogue-advance').click();
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('certificate-name')).toHaveText(MIXED);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'name-mixed.png'), fullPage: true });
});

test('certificate overlay stays inside 1366 and 1920 viewports', async ({ page }) => {
  await playToPathDone(page, LONG_AR);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await page.getByTestId('dialogue-advance').click();
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('certificate')).toBeVisible();

  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('certificate');
  const box1366 = await overlay.locator('.certificate-card').boundingBox();
  expect(box1366).not.toBeNull();
  if (box1366) {
    expect(box1366.x).toBeGreaterThanOrEqual(0);
    expect(box1366.y).toBeGreaterThanOrEqual(0);
    expect(box1366.x + box1366.width).toBeLessThanOrEqual(1367);
    expect(box1366.y + box1366.height).toBeLessThanOrEqual(769);
  }
  await expect(page.getByTestId('certificate-name')).toHaveText(LONG_AR);
  await expect(page.getByTestId('certificate-version').locator('.path-ltr')).toHaveCSS(
    'direction',
    'ltr',
  );

  await page.setViewportSize({ width: 1920, height: 1080 });
  const box1920 = await overlay.locator('.certificate-card').boundingBox();
  expect(box1920).not.toBeNull();
  if (box1920) {
    expect(box1920.x).toBeGreaterThanOrEqual(0);
    expect(box1920.y).toBeGreaterThanOrEqual(0);
    expect(box1920.x + box1920.width).toBeLessThanOrEqual(1921);
    expect(box1920.y + box1920.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
});
