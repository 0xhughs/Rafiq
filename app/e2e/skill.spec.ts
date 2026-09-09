import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  BULLETIN_1447,
  BULLETIN_2208,
  CLOCK_START,
  CLOCK_SUN8,
  ONESHOT_TEXT,
  RUN_COUNT_LABEL,
  SKILL_CARD_EMPTY,
  SKILL_NAME,
  TRAY_EMPTY,
  TRAY_SUN,
  TRIGGER_LOG,
} from '../src/engine/skill';
import { OBJECTIVES } from '../src/engine/dialogue';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToBridgeDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/13');

test.setTimeout(240_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

async function fillFiveFields(page: Parameters<typeof dispatch>[0]): Promise<void> {
  await page.getByTestId('skill-trigger-hours').click();
  await page.getByTestId('skill-input-record').click();
  await page.getByTestId('skill-steps-lookup-format').click();
  await page.getByTestId('skill-output-draft').click();
  await page.getByTestId('skill-stop-unknown').click();
}

test('bridge-success through reusable skill and routine clock', async ({ page }) => {
  await playToBridgeDone(page);
  const afterBridge = await getState(page);
  expect(afterBridge.evidence['5.3']).toBe('demonstrated');
  expect(afterBridge.bridgeQuest.bridgeReady).toBe(true);
  expect(afterBridge.evidence['5.5']).toBeUndefined();
  expect(afterBridge.evidence['5.6']).toBeUndefined();
  expect(afterBridge.skillQuest.skillReady).toBe(false);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-bridge-ready', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-skill-ready', 'false');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.skillWork);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('skill-shelf')).toHaveCount(0);

  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.skillBench.x, WORLD_POS.skillBench.y);
  await expect(page.getByTestId('skill-bench')).toBeVisible();
  await expect(page.getByTestId('skill-card-empty')).toHaveText(SKILL_CARD_EMPTY);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.5/);
  await expect(page.getByTestId('skill-bench')).not.toContainText('MCP');

  await page.getByTestId('skill-oneshot').click();
  await expect(page.getByTestId('skill-oneshot-text')).toHaveText(ONESHOT_TEXT);
  await expect(page.getByTestId('skill-card-empty')).toHaveText(SKILL_CARD_EMPTY);
  const afterOneshot = await getState(page);
  expect(afterOneshot.evidence['5.5']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'oneshot.png'), fullPage: true });

  await page.getByTestId('skill-correct').click();
  await expect(page.getByTestId('skill-oneshot-text')).toHaveText(BULLETIN_1447);
  await expect(page.getByTestId('skill-oneshot-text')).toContainText('sat-10');
  await expect(page.getByTestId('skill-oneshot-text').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'correct.png'), fullPage: true });

  await page.getByTestId('skill-standing').click();
  await fillFiveFields(page);
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-card')).toContainText(SKILL_NAME);
  await expect(page.getByTestId('skill-card')).toContainText('عند ورود سجل ساعات قاعة الحي');
  await expect(page.getByTestId('skill-card')).not.toContainText('demo-slot-key');
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.5/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'config.png'), fullPage: true });

  await page.getByTestId('skill-trial-second').click();
  await expect(page.getByTestId('skill-trial-text')).toHaveText(BULLETIN_2208);
  await expect(page.getByTestId('skill-trial-text')).toContainText('fri-14');
  await expect(page.getByTestId('skill-trial-text')).toContainText('mon-11');
  await expect(page.getByTestId('skill-trial-text').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.5/);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.6/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'trial.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.skillClock.x, WORLD_POS.skillClock.y);
  await expect(page.getByTestId('skill-clock')).toBeVisible();
  await expect(page.getByTestId('skill-clock-time')).toHaveText(CLOCK_START);
  await expect(page.getByTestId('skill-clock-time').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await expect(page.getByTestId('skill-tray')).toHaveText(TRAY_EMPTY);
  await expect(page.getByTestId('skill-run-count')).toHaveText(RUN_COUNT_LABEL(0));
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.6/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'clock.png'), fullPage: true });

  await page.getByTestId('skill-schedule-sun8').click();
  await page.getByTestId('skill-arm').click();
  await page.getByTestId('skill-tick-sun8').click();
  await expect(page.getByTestId('skill-trigger-log')).toHaveText(TRIGGER_LOG);
  await expect(page.getByTestId('skill-tray')).toHaveText(TRAY_SUN);
  await expect(page.getByTestId('skill-run-count')).toHaveText(RUN_COUNT_LABEL(1));
  await expect(page.getByTestId('skill-clock-time')).toHaveText(CLOCK_SUN8);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.6/);

  await page.getByTestId('skill-pause').click();
  const paused = await getState(page);
  expect(paused.mode).toBe('skill');
  expect(paused.skillQuest.paused).toBe(true);
  await page.getByTestId('skill-tick-sun8').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText('الروتين متوقف. لم تُكتب مسودة جديدة.');
  await expect(page.getByTestId('skill-tray')).toHaveText(TRAY_SUN);
  await expect(page.getByTestId('skill-run-count')).toHaveText(RUN_COUNT_LABEL(1));
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.6/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-skill-ready', 'true');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'pause.png'), fullPage: true });
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['5.5']).toBe('demonstrated');
  expect(done.evidence['5.6']).toBe('demonstrated');
  expect(done.skillQuest.skillReady).toBe(true);
  expect(JSON.stringify(done)).not.toMatch(/MCP/);
  expect(JSON.stringify(done)).not.toMatch(/harness/);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('skill-shelf')).toHaveText('رف المهارات');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.approvalWork);
  expect(done.evidence['5.7']).toBeUndefined();
  expect(done.evidence['6.3']).toBeUndefined();
  expect(done.approvalQuest.approvalReady).toBe(false);

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /حُفظت مهارة تلخيص ساعات القاعة وجُرّبت على NH-2208، والروتين المجدول توقف بعد الإلبات/,
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText(/المهارة|الروتين/);
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /الدستور الدائم مهارة|الروتين المتوقف ما زال يعمل/,
  );
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('harness');
});

test('skill overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToBridgeDone(page);
  await interactAt(page, 'workshop', WORLD_POS.skillBench.x, WORLD_POS.skillBench.y);
  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('skill-bench');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('skill-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.skillClock.x, WORLD_POS.skillClock.y);
  const clockCard = page.getByTestId('skill-clock');
  await expect(clockCard).toBeVisible();
  const clockBox = await clockCard.locator('.instruction-card').boundingBox();
  expect(clockBox).not.toBeNull();
  if (clockBox) {
    expect(clockBox.x).toBeGreaterThanOrEqual(0);
    expect(clockBox.y).toBeGreaterThanOrEqual(0);
    expect(clockBox.x + clockBox.width).toBeLessThanOrEqual(1921);
    expect(clockBox.y + clockBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
