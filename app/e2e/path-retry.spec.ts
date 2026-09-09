import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { SEND_RECEIPT } from '../src/engine/approval';
import {
  DRAFT_TEXT,
  EXTRA_STOPPED,
  NIGHT_RECEIPT,
  PATH_FEEDBACK,
  PLAN_BOUNDED,
} from '../src/engine/path';
import { dispatch, getState, interactAt, playToCrewDone, skipExplainIfOpen } from './helpers';

test.setTimeout(300_000);

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('trust-rumor, wrong plan, mango/clinic, old skill, exam, and silent edit all retry', async ({
  page,
}) => {
  await playToCrewDone(page);

  await interactAt(page, 'workshop', WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y);
  await page.getByTestId('path-trust-rumor').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.trustRumor);
  await page.getByTestId('path-refuse-rumor').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.refuseFirst);
  let state = await getState(page);
  expect(state.evidence['6.4']).toBeUndefined();

  await page.getByTestId('path-inspect-source').click();
  await page.getByTestId('path-refuse-rumor').click();
  await page.getByTestId('path-goal-live').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.liveGoal);
  await page.getByTestId('path-tools-pay').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.payTools);
  await page.getByTestId('path-stop-unlimited').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.unlimitedStop);
  await page.getByTestId('path-goal-reading').click();
  await page.getByTestId('path-tools-safe').click();
  await page.getByTestId('path-stop-budget').click();
  await expect(page.getByTestId('path-plan')).toHaveText(PLAN_BOUNDED);

  await page.getByTestId('path-load-mango').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.mango);
  await page.getByTestId('path-load-clinic').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.clinic);
  await page.getByTestId('path-load-reading').click();

  await page.getByTestId('path-run-old').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.runOld);
  await page.getByTestId('path-run-chat').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.runChat);
  await page.getByTestId('path-extra-step').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.extraFirst);
  await page.getByTestId('path-run-skill').click();
  await expect(page.getByTestId('path-draft')).toHaveText(DRAFT_TEXT);
  await page.getByTestId('path-extra-step').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(EXTRA_STOPPED);
  await expect(page.getByTestId('path-draft')).toHaveText(DRAFT_TEXT);

  await page.getByTestId('path-exam').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.exam);
  await page.getByTestId('path-quiz').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.quiz);
  await page.getByTestId('path-robot-done').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.robotDone);
  state = await getState(page);
  expect(state.evidence['6.4']).toBeUndefined();
  expect(state.pathQuest.restored).toBe(false);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.sealDesk.x, WORLD_POS.sealDesk.y);
  await page.getByTestId('path-resend-old').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.resendOld);
  state = await getState(page);
  expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  await page.getByTestId('path-prepare').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.inspectFirst);
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.wrongRecipient);
  await page.getByTestId('path-recipient-payroll').click();
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.wrongRecipient);
  await page.getByTestId('path-payload-stream').click();
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.wrongPayload);
  await page.getByTestId('path-recipient-neighbors').click();
  await page.getByTestId('path-payload-exact').click();
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-reject').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.rejectedWrong);
  await page.getByTestId('path-recipient-librarian').click();
  await page.getByTestId('path-payload-exact').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-feedback')).toHaveText(PATH_FEEDBACK.rereview);
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-confirm').click();
  await expect(page.getByTestId('path-receipt')).toHaveText(NIGHT_RECEIPT);
  state = await getState(page);
  expect(state.evidence['6.4']).toBe('demonstrated');
  expect(state.pathQuest.restored).toBe(true);
  expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  expect(state.mode).toBe('path');
});
