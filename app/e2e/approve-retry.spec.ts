import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { APPROVE_FEEDBACK, SEND_RECEIPT } from '../src/engine/approval';
import { dispatch, getState, interactAt, playToSkillDone, skipExplainIfOpen } from './helpers';

test.setTimeout(240_000);

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('wrong send, silent edit, delete/pay/تم, and clinic auto paths all retry', async ({ page }) => {
  await playToSkillDone(page);

  await interactAt(page, 'workshop', WORLD_POS.approveDesk.x, WORLD_POS.approveDesk.y);
  await page.getByTestId('approve-prepare').click();
  let state = await getState(page);
  expect(state.evidence['5.7']).toBeUndefined();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.inspectFirst);

  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.wrongRecipient);

  await page.getByTestId('approve-recipient-payroll').click();
  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.wrongRecipient);

  await page.getByTestId('approve-payload-extra').click();
  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.wrongPayload);

  await page.getByTestId('approve-payload-comment').click();
  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.wrongPayload);

  await page.getByTestId('approve-recipient-librarian').click();
  await page.getByTestId('approve-payload-exact').click();
  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-reject').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.rejectCorrect);
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.rejectFirst);

  await page.getByTestId('approve-delete').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.deleteDraft);
  await page.getByTestId('approve-pay').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.pay);
  await page.getByTestId('approve-robot-done').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.robotDoneSend);
  state = await getState(page);
  expect(state.evidence['5.7']).toBeUndefined();

  await page.getByTestId('approve-recipient-neighbors').click();
  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-reject').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.rejectedWrong);
  await page.getByTestId('approve-recipient-librarian').click();
  await page.getByTestId('approve-payload-exact').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.rereview);
  state = await getState(page);
  expect(state.evidence['5.7']).toBeUndefined();
  expect(state.approvalQuest.bulletinSent).toBe(false);

  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-receipt')).toHaveText(SEND_RECEIPT);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.7/);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /6\.3/);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.decisionDesk.x, WORLD_POS.decisionDesk.y);
  state = await getState(page);
  expect(state.evidence['6.3']).toBeUndefined();
  await page.getByTestId('approve-case-keep').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.keepWithoutRefusals);
  await page.getByTestId('approve-case-prepare').click();
  expect((await getState(page)).evidence['6.3']).toBeUndefined();
  await page.getByTestId('approve-case-keep').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.keepWithoutRefusals);
  await page.getByTestId('approve-case-auto').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.auto);
  await page.getByTestId('approve-case-majority').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.majority);
  await page.getByTestId('approve-case-robot-done').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.robotDoneCase);
  await page.getByTestId('approve-case-share').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(APPROVE_FEEDBACK.share);
  state = await getState(page);
  expect(state.evidence['6.3']).toBeUndefined();
  await page.getByTestId('approve-case-keep').click();
  await expect(page.getByTestId('approve-case-result')).toBeVisible();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /6\.3/);
  state = await getState(page);
  expect(state.approvalQuest.approvalReady).toBe(true);
  expect(state.mode).toBe('approve');
});
