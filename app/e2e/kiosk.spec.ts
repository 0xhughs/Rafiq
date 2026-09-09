import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  CHECKLIST,
  DEMO_SLOT_KEY,
  DOCS_TEXT,
  KIOSK_FEEDBACK,
  KIOSK_TITLE,
} from '../src/engine/kiosk';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToWorkshopDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/09');

test.setTimeout(240_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('workshop-success through kiosk success with physical actions', async ({ page }) => {
  await playToWorkshopDone(page);
  const afterWorkshop = await getState(page);
  expect(afterWorkshop.evidence['4.3']).toBeUndefined();
  expect(afterWorkshop.evidence['4.4']).toBeUndefined();
  expect(afterWorkshop.kioskQuest.kioskReady).toBe(false);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-service-posted', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-kiosk-ready', 'false');

  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.kioskDocs.x, WORLD_POS.kioskDocs.y);
  await expect(page.getByTestId('docs-text')).toContainText(DOCS_TEXT.split('\n')[1]);
  await expect(page.getByTestId('docs-text')).toContainText('x-api-key');
  await expect(page.getByTestId('docs-dummy')).toContainText(DEMO_SLOT_KEY);
  await expect(page.getByTestId('docs-dummy')).toContainText('وهمي');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'docs.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.kioskVault.x, WORLD_POS.kioskVault.y);
  await expect(page.getByTestId('vault-empty')).toBeVisible();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'vault.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  const face = page.getByTestId('kiosk-face');
  await expect(face).toBeVisible();
  await expect(face).toContainText(`x-api-key: ${DEMO_SLOT_KEY}`);
  await expect(face).toHaveAttribute('dir', 'ltr');
  await expect(face).toHaveCSS('direction', 'ltr');
  await expect(page.getByTestId('kiosk-title')).toHaveText(KIOSK_TITLE);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'ltr.png'), fullPage: true });

  await page.getByTestId('kiosk-send').click();
  await expect(page.getByTestId('kiosk-feedback')).toContainText(KIOSK_FEEDBACK.exposure);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /4\.3/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'exposed.png'), fullPage: true });

  await page.getByTestId('kiosk-strip').click();
  await expect(face).not.toContainText(DEMO_SLOT_KEY);
  await page.getByTestId('kiosk-send').click();
  await expect(page.getByTestId('kiosk-feedback')).toHaveText(KIOSK_FEEDBACK.missing);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /4\.3/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'missing.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.kioskVault.x, WORLD_POS.kioskVault.y);
  await page.getByTestId('vault-put').click();
  await expect(page.getByTestId('vault-key')).toContainText(DEMO_SLOT_KEY);
  await expect(page.getByTestId('vault-key')).toContainText('وهمي');
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  await expect(page.getByTestId('kiosk-face')).not.toContainText(DEMO_SLOT_KEY);
  await page.getByTestId('kiosk-send').click();
  await expect(page.getByTestId('kiosk-response')).toContainText('200');
  await expect(page.getByTestId('kiosk-response')).toContainText('sun-pm');
  await expect(page.getByTestId('kiosk-response')).toContainText('mon-am');
  await expect(page.getByTestId('kiosk-response')).toContainText('tue-pm');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.3/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'wired.png'), fullPage: true });

  await page.getByTestId('kiosk-set-rtl').click();
  await expect(face).toHaveAttribute('dir', 'rtl');
  await expect(face).toHaveCSS('direction', 'rtl');
  await page.getByTestId('kiosk-isolate').click();
  const slotSpan = page.getByTestId('slot-id-sunday');
  await expect(slotSpan).toHaveAttribute('dir', 'ltr');
  await expect(slotSpan).toHaveCSS('direction', 'ltr');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'rtl.png'), fullPage: true });

  await page.getByTestId('kiosk-lookup-sunday').click();
  await expect(page.getByTestId('kiosk-confirm')).toContainText('slot-id: sun-pm');
  await page.getByTestId('kiosk-check-title').click();
  await page.getByTestId('kiosk-check-slot').click();
  await page.getByTestId('kiosk-check-lookup').click();
  await expect(page.getByTestId('kiosk-check-title')).toContainText(CHECKLIST.title);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.4/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-kiosk-ready', 'true');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'manual.png'), fullPage: true });
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['4.3']).toBe('demonstrated');
  expect(done.evidence['4.4']).toBe('demonstrated');
  expect(done.kioskQuest.kioskReady).toBe(true);

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('كiosk');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('كiosk');
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/ضع المفتاح على الشاشة|Book appointment/);
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('شهادة');
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('MCP');
});

test('kiosk overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToWorkshopDone(page);
  await interactAt(page, 'workshop', WORLD_POS.kioskDocs.x, WORLD_POS.kioskDocs.y);
  await page.getByTestId('inspect-close').click();

  await page.setViewportSize({ width: 1366, height: 768 });
  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  const overlay = page.getByTestId('kiosk-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('kiosk-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  const faceCard = page.getByTestId('kiosk-overlay');
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
