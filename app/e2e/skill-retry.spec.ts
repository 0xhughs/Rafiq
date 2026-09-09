import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import {
  BULLETIN_1447,
  BULLETIN_2208,
  RUN_COUNT_LABEL,
  SKILL_FEEDBACK,
  TRAY_EMPTY,
  TRAY_SUN,
} from '../src/engine/skill';
import { dispatch, getState, interactAt, playToBridgeDone, skipExplainIfOpen } from './helpers';

test.setTimeout(240_000);

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

test('oneshot, wrong fields, standing, arm-before, schedules, empty tick, cancel, and pause all retry', async ({
  page,
}) => {
  await playToBridgeDone(page);

  await interactAt(page, 'workshop', WORLD_POS.skillClock.x, WORLD_POS.skillClock.y);
  let state = await getState(page);
  expect(state.evidence['5.5']).toBeUndefined();
  expect(state.evidence['5.6']).toBeUndefined();
  await page.getByTestId('skill-arm').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.armBeforeSkill);
  await page.getByTestId('skill-schedule-event').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.eventSchedule);
  await page.getByTestId('skill-schedule-send').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.sendSchedule);
  await page.getByTestId('skill-tick-empty').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.emptySource);
  await page.getByTestId('skill-cancel').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.cancelled);
  state = await getState(page);
  expect(state.evidence['5.6']).toBeUndefined();
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.skillBench.x, WORLD_POS.skillBench.y);
  state = await getState(page);
  expect(state.evidence['5.5']).toBeUndefined();
  expect(state.skillQuest.skillReady).toBe(false);

  await page.getByTestId('skill-robot-done').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.robotDone);

  await page.getByTestId('skill-oneshot').click();
  await expect(page.getByTestId('skill-oneshot-text')).toContainText('الدقيقة 7');
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.saveBeforeCorrect);
  state = await getState(page);
  expect(state.evidence['5.5']).toBeUndefined();

  await page.getByTestId('skill-correct').click();
  await expect(page.getByTestId('skill-oneshot-text')).toHaveText(BULLETIN_1447);
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.missingConfig);

  await page.getByTestId('skill-trigger-anytime').click();
  await page.getByTestId('skill-input-secret').click();
  await page.getByTestId('skill-steps-opinion').click();
  await page.getByTestId('skill-output-send').click();
  await page.getByTestId('skill-stop-invent').click();
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.wrongTrigger);
  await page.getByTestId('skill-trigger-hours').click();
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.wrongInput);
  await page.getByTestId('skill-input-record').click();
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.wrongSteps);
  await page.getByTestId('skill-steps-lookup-format').click();
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.wrongOutput);
  await page.getByTestId('skill-output-draft').click();
  await page.getByTestId('skill-save').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.wrongStop);

  await page.getByTestId('skill-standing').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.standing);
  await page.getByTestId('skill-load-connector').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.connector);
  await page.getByTestId('skill-embed-secret').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.secret);
  state = await getState(page);
  expect(state.evidence['5.5']).toBeUndefined();

  await page.getByTestId('skill-stop-unknown').click();
  await fillFiveFields(page);
  await page.getByTestId('skill-save').click();
  await page.getByTestId('skill-trial-same').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.trialSame);
  state = await getState(page);
  expect(state.evidence['5.5']).toBeUndefined();

  await page.getByTestId('skill-trial-second').click();
  await expect(page.getByTestId('skill-trial-text')).toHaveText(BULLETIN_2208);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.5/);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.skillClock.x, WORLD_POS.skillClock.y);
  await page.getByTestId('skill-tick-empty').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.emptySource);
  await expect(page.getByTestId('skill-tray')).toHaveText(TRAY_EMPTY);
  await expect(page.getByTestId('skill-run-count')).toHaveText(RUN_COUNT_LABEL(0));

  await page.getByTestId('skill-schedule-sun8').click();
  await page.getByTestId('skill-arm').click();
  await page.getByTestId('skill-cancel').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.cancelled);
  await page.getByTestId('skill-tick-sun8').click();
  state = await getState(page);
  expect(state.skillQuest.fired).toBe(false);
  expect(state.evidence['5.6']).toBeUndefined();

  await page.getByTestId('skill-schedule-sun8').click();
  await page.getByTestId('skill-arm').click();
  await page.getByTestId('skill-tick-sun8').click();
  await expect(page.getByTestId('skill-tray')).toHaveText(TRAY_SUN);
  await expect(page.getByTestId('skill-run-count')).toHaveText(RUN_COUNT_LABEL(1));
  state = await getState(page);
  expect(state.evidence['5.6']).toBeUndefined();
  expect(state.mode).toBe('skill');

  await page.getByTestId('skill-pause').click();
  await page.getByTestId('skill-tick-sun8').click();
  await expect(page.getByTestId('skill-feedback')).toHaveText(SKILL_FEEDBACK.paused);
  await expect(page.getByTestId('skill-tray')).toHaveText(TRAY_SUN);
  await expect(page.getByTestId('skill-run-count')).toHaveText(RUN_COUNT_LABEL(1));
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.6/);
  state = await getState(page);
  expect(state.skillQuest.skillReady).toBe(true);
  expect(state.mode).toBe('skill');
});
