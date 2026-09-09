import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  AGENT_FEEDBACK,
  BOARD_EMPTY,
  CHAT_PLAN_TEXT,
  GOAL_SLOTS_TEXT,
  SUCCESS_SLOTS_TEXT,
} from '../src/engine/agent';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToLabDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/11');

test.setTimeout(240_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

async function configureSlotsJob(page: Parameters<typeof dispatch>[0]): Promise<void> {
  await page.getByTestId('agent-job-slots').click();
  await page.getByTestId('agent-goal-slots').click();
  await page.getByTestId('agent-tool-read').click();
  await page.getByTestId('agent-tool-write').click();
  await page.getByTestId('agent-tool-verify').click();
  await page.getByTestId('agent-success-slots').click();
  await page.getByTestId('agent-stop-budget3').click();
}

test('lab-success through bounded agent job with physical actions', async ({ page }) => {
  await playToLabDone(page);
  const afterLab = await getState(page);
  expect(afterLab.evidence['4.5']).toBe('demonstrated');
  expect(afterLab.evidence['4.6']).toBe('demonstrated');
  expect(afterLab.evidence['5.4']).toBe('demonstrated');
  expect(afterLab.labQuest.labReady).toBe(true);
  expect(afterLab.evidence['5.1']).toBeUndefined();
  expect(afterLab.evidence['5.2']).toBeUndefined();
  expect(afterLab.agentQuest.agentReady).toBe(false);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-lab-ready', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-agent-ready', 'false');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '11');
  await expect(page.getByTestId('hud-objective')).toHaveText(
    'منصة المشغّل مفتوحة: اضبط الهدف والأدوات ومعيار النجاح والتوقف، ثم راقب الحلقة على لوحة الحي.',
  );

  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y);
  await expect(page.getByTestId('agent-board')).toBeVisible();
  await expect(page.getByTestId('agent-board-text')).toHaveText(BOARD_EMPTY);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  await expect(page.getByTestId('agent-console')).toBeVisible();
  await expect(page.getByTestId('agent-chat-plan-text')).toHaveText(CHAT_PLAN_TEXT);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'plan.png'), fullPage: true });

  await page.getByTestId('agent-chat-plan').click();
  await expect(page.getByTestId('agent-feedback')).toHaveText(AGENT_FEEDBACK.chatPlan);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.1/);

  await configureSlotsJob(page);
  await expect(page.getByTestId('agent-goal-slots')).toContainText(GOAL_SLOTS_TEXT);
  await expect(page.getByTestId('agent-success-slots')).toContainText(SUCCESS_SLOTS_TEXT);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'config.png'), fullPage: true });

  await page.getByTestId('agent-job-shelf').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.missingInput);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'missing.png'), fullPage: true });

  await page.getByTestId('agent-job-slots').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-trace')).toContainText('راقب');
  await expect(page.getByTestId('agent-trace')).toContainText('نفّذ');
  await expect(page.getByTestId('agent-trace')).toContainText('تحقق');
  await expect(page.getByTestId('agent-trace')).toContainText('read_slots');
  await expect(page.getByTestId('agent-trace')).toContainText('write_notice');
  await expect(page.getByTestId('agent-trace')).toContainText('verify_notice');
  await expect(page.getByTestId('agent-trace').locator('.path-ltr').first()).toHaveCSS('direction', 'ltr');
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.successStop);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.2/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'run.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y);
  await expect(page.getByTestId('agent-board-text')).toContainText('sun-pm');
  await expect(page.getByTestId('agent-board-text')).toContainText('mon-am');
  await expect(page.getByTestId('agent-board-text')).toContainText('tue-pm');
  await expect(page.getByTestId('agent-board-text').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.1/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'board.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  await page.getByTestId('agent-extra-step').click();
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.budget3);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-agent-ready', 'true');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'extra.png'), fullPage: true });
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['5.1']).toBe('demonstrated');
  expect(done.evidence['5.2']).toBe('demonstrated');
  expect(done.agentQuest.agentReady).toBe(true);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/لوحة الحي تعرض الفترات الثلاث/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText(/المشغّل|لوحة الحي/);
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/الدردشة وحدها وكالة|المشغّل اختياري/);
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('شهادة');
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('MCP');
  await expect(page.locator('body')).not.toContainText('harness');
});

test('agent overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToLabDone(page);
  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('agent-console');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('agent-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y);
  const boardCard = page.getByTestId('agent-board');
  await expect(boardCard).toBeVisible();
  const boardBox = await boardCard.locator('.instruction-card').boundingBox();
  expect(boardBox).not.toBeNull();
  if (boardBox) {
    expect(boardBox.x).toBeGreaterThanOrEqual(0);
    expect(boardBox.y).toBeGreaterThanOrEqual(0);
    expect(boardBox.x + boardBox.width).toBeLessThanOrEqual(1921);
    expect(boardBox.y + boardBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
