import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { AGENT_FEEDBACK, BOARD_EMPTY, LIVE_HOURS_TEXT } from '../src/engine/agent';
import { dispatch, getState, interactAt, playToLabDone, skipExplainIfOpen } from './helpers';

test.setTimeout(240_000);

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('chat-plan, wrong config, budget_1, unlimited extra, and robot تم all retry', async ({
  page,
}) => {
  await playToLabDone(page);

  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  let state = await getState(page);
  expect(state.evidence['5.1']).toBeUndefined();
  expect(state.agentQuest.agentReady).toBe(false);

  await page.getByTestId('agent-chat-plan').click();
  await expect(page.getByTestId('agent-feedback')).toHaveText(AGENT_FEEDBACK.chatPlan);
  state = await getState(page);
  expect(state.evidence['5.1']).toBeUndefined();

  await page.getByTestId('agent-robot-done').click();
  await expect(page.getByTestId('agent-feedback')).toHaveText(AGENT_FEEDBACK.robotDone);
  state = await getState(page);
  expect(state.evidence['5.1']).toBeUndefined();

  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-feedback')).toHaveText(AGENT_FEEDBACK.missingConfig);

  await page.getByTestId('agent-job-slots').click();
  await page.getByTestId('agent-goal-chat').click();
  await page.getByTestId('agent-tool-read').click();
  await page.getByTestId('agent-tool-write').click();
  await page.getByTestId('agent-tool-verify').click();
  await page.getByTestId('agent-success-slots').click();
  await page.getByTestId('agent-stop-budget3').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-feedback')).toHaveText(AGENT_FEEDBACK.wrongGoal);

  await page.getByTestId('agent-goal-slots').click();
  await page.getByTestId('agent-tool-hours').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-feedback')).toHaveText(AGENT_FEEDBACK.wrongTools);

  await page.getByTestId('agent-tool-hours').click();
  await page.getByTestId('agent-success-robot').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-feedback')).toHaveText(AGENT_FEEDBACK.wrongSuccess);

  await page.getByTestId('agent-success-slots').click();
  await page.getByTestId('agent-stop-1').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.budget1);
  await page.getByTestId('agent-close').click();
  await interactAt(page, 'workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y);
  await expect(page.getByTestId('agent-board-text')).toHaveText(BOARD_EMPTY);
  state = await getState(page);
  expect(state.evidence['5.1']).toBeUndefined();
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  await page.getByTestId('agent-stop-budget3').click();
  await page.getByTestId('agent-job-shelf').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.missingInput);
  state = await getState(page);
  expect(state.evidence['5.2']).toBeUndefined();

  await page.getByTestId('agent-job-slots').click();
  await page.getByTestId('agent-run').click();
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.successStop);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.2/);
  await page.getByTestId('agent-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y);
  await expect(page.getByTestId('agent-board-text')).toContainText('sun-pm');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.1/);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  await page.getByTestId('agent-stop-unlimited').click();
  await page.getByTestId('agent-extra-step').click();
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.unlimitedExtra);
  state = await getState(page);
  expect(state.agentQuest.agentReady).toBe(false);
  expect(state.agentQuest.boardPolluted).toBe(true);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-agent-ready', 'false');

  await page.getByTestId('agent-stop-budget3').click();
  await page.getByTestId('agent-run').click();
  await page.getByTestId('agent-extra-step').click();
  await expect(page.getByTestId('agent-stop-reason')).toHaveText(AGENT_FEEDBACK.budget3);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-agent-ready', 'true');
  state = await getState(page);
  expect(state.agentQuest.boardPolluted).toBe(false);
  expect(state.agentQuest.agentReady).toBe(true);
  expect(LIVE_HOURS_TEXT).toBe('ساعات حيّة');
});
