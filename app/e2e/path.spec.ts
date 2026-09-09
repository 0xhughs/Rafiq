import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import { SEND_RECEIPT } from '../src/engine/approval';
import {
  DRAFT_TEXT,
  EXTRA_STOPPED,
  NIGHT_RECEIPT,
  PACK_TEXT,
  PATH_EMPTY,
  PATH_FEEDBACK,
  PLAN_BOUNDED,
  PLAN_EMPTY,
  RUMOR_TEXT,
  SEAL_EMPTY,
  SOURCE_TEXT,
} from '../src/engine/path';
import { OBJECTIVES } from '../src/engine/dialogue';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToCrewDone,
  skipExplainIfOpen,
  teleport,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/16');

test.setTimeout(300_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('crew-success through reading-night path and seal', async ({ page }) => {
  await playToCrewDone(page);
  const afterCrew = await getState(page);
  expect(afterCrew.evidence['6.1']).toBe('demonstrated');
  expect(afterCrew.evidence['6.2']).toBe('demonstrated');
  expect(afterCrew.crewQuest.crewReady).toBe(true);
  expect(afterCrew.evidence['6.4']).toBeUndefined();
  expect(afterCrew.pathQuest.restored).toBe(false);
  expect(afterCrew.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-crew-ready', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-restored', 'false');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '16');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.pathWork);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('skill-shelf')).toHaveText('رف المهارات');
  await expect(page.getByTestId('human-gate')).toHaveText('موافقة بشرية');
  await expect(page.getByTestId('crew-output')).toHaveText('ناتج مُراجع');
  await expect(page.getByTestId('restored-agent')).toHaveCount(0);

  await teleport(page, 'workshop', WORLD_POS.workshopTalk.x, WORLD_POS.workshopTalk.y);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y);
  await expect(page.getByTestId('path-desk')).toBeVisible();
  await expect(page.getByTestId('path-empty')).toHaveText(PATH_EMPTY);
  await expect(page.getByTestId('path-rumor')).toHaveText(RUMOR_TEXT);
  await expect(page.getByTestId('path-plan')).toHaveText(PLAN_EMPTY);
  await expect(page.getByTestId('path-desk')).not.toContainText('MCP');
  await expect(page.getByTestId('path-desk')).not.toContainText('harness');
  expect((await getState(page)).evidence['6.4']).toBeUndefined();

  await page.getByTestId('path-inspect-source').click();
  await expect(page.getByTestId('path-source')).toHaveText(SOURCE_TEXT);
  await expect(page.getByTestId('path-source').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  expect((await getState(page)).evidence['6.4']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'source.png'), fullPage: true });

  await page.getByTestId('path-refuse-rumor').click();
  await page.getByTestId('path-goal-reading').click();
  await page.getByTestId('path-tools-safe').click();
  await page.getByTestId('path-stop-budget').click();
  await expect(page.getByTestId('path-plan')).toHaveText(PLAN_BOUNDED);
  expect((await getState(page)).evidence['6.4']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'plan.png'), fullPage: true });

  await page.getByTestId('path-load-reading').click();
  await expect(page.getByTestId('path-pack')).toHaveText(PACK_TEXT);
  await page.getByTestId('path-run-skill').click();
  await expect(page.getByTestId('path-draft')).toHaveText(DRAFT_TEXT);
  await expect(page.getByTestId('path-draft')).toContainText('thu-19');
  await expect(page.getByTestId('path-draft')).not.toContainText('fri-20');
  await expect(page.getByTestId('path-draft')).not.toContainText('بث مباشر');
  await page.getByTestId('path-extra-step').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(EXTRA_STOPPED);
  await expect(page.getByTestId('path-draft')).toHaveText(DRAFT_TEXT);
  expect((await getState(page)).evidence['6.4']).toBeUndefined();
  expect((await getState(page)).pathQuest.restored).toBe(false);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'skill.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.sealDesk.x, WORLD_POS.sealDesk.y);
  await expect(page.getByTestId('path-seal')).toBeVisible();
  await expect(page.getByTestId('path-seal-empty')).toHaveText(SEAL_EMPTY);
  expect((await getState(page)).evidence['6.4']).toBeUndefined();

  await page.getByTestId('path-prepare').click();
  await expect(page.getByTestId('path-recipient-neighbors')).toBeVisible();
  await expect(page.getByTestId('path-receipt')).toHaveCount(0);
  await page.getByTestId('path-inspect-send').click();
  await expect(page.getByTestId('path-review')).toContainText('المستلم');
  await expect(page.getByTestId('path-review')).toContainText('الحمولة');
  await expect(page.getByTestId('path-review')).toContainText('thu-19');
  await expect(page.getByTestId('path-review').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  expect((await getState(page)).evidence['6.4']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'seal.png'), fullPage: true });

  await page.getByTestId('path-reject').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.rejectedWrong);
  await expect(page.getByTestId('path-receipt')).toHaveCount(0);
  await page.getByTestId('path-recipient-librarian').click();
  await page.getByTestId('path-payload-exact').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.rereview);
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-receipt')).toHaveText(NIGHT_RECEIPT);
  await expect(page.getByTestId('path-receipt')).toContainText('thu-19');
  await expect(page.getByTestId('path-receipt')).toContainText('باب القاعة فقط');
  await expect(page.getByTestId('path-receipt')).toContainText('لا بث.');
  await expect(page.getByTestId('path-receipt')).not.toContainText('fri-20');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /6\.4/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-restored', 'true');
  const afterSeal = await getState(page);
  expect(afterSeal.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  expect(afterSeal.approvalQuest.bulletinSent).toBe(true);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['6.4']).toBe('demonstrated');
  expect(done.pathQuest.restored).toBe(true);
  expect(done.evidence['6.1']).toBe('demonstrated');
  expect(done.evidence['6.2']).toBe('demonstrated');
  expect(JSON.stringify(done)).not.toMatch(/MCP/);
  expect(JSON.stringify(done)).not.toMatch(/harness/);
  expect(JSON.stringify(done)).not.toMatch(/امتحان/);
  expect(JSON.stringify(done)).not.toMatch(/شهادة/);
  await expect(page.getByTestId('restored-agent')).toHaveText('وكيل مُشرف');
  await expect(page.getByTestId('crew-output')).toHaveText('ناتج مُراجع');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.restored);
  await expect(page.getByTestId('certificate')).toHaveCount(0);

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /سُهرة القراءة نُشرت بعد سند NH-3301 وخطة محدودة وحزمة سياق ومهارة وموافقة بشرية، والروبوت صار جاهزاً تحت إشراف/,
  );
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText(/المسار|السهرة|الترميم/);
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('شكراً');
  await expect(page.getByTestId('dialogue-text')).toContainText('صرت جاهزاً للعمل تحت إشرافك في الحي');
  await expect(page.getByTestId('dialogue-text')).toContainText(/الترميم يلغي الهلوسة|الامتحان الموقوت يكفي/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'restored.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();
  await assertNoLessonUi(page);
  await expect(page.locator('[data-testid="certificate"]')).toHaveCount(0);
});

test('path overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToCrewDone(page);
  await interactAt(page, 'workshop', WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y);
  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('path-desk');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('path-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.sealDesk.x, WORLD_POS.sealDesk.y);
  const seal = page.getByTestId('path-seal');
  await expect(seal).toBeVisible();
  const sealBox = await seal.locator('.instruction-card').boundingBox();
  expect(sealBox).not.toBeNull();
  if (sealBox) {
    expect(sealBox.x).toBeGreaterThanOrEqual(0);
    expect(sealBox.y).toBeGreaterThanOrEqual(0);
    expect(sealBox.x + sealBox.width).toBeLessThanOrEqual(1921);
    expect(sealBox.y + sealBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
