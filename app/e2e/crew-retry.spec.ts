import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { CREW_FEEDBACK, VERSION_V2 } from '../src/engine/crew';
import { SEND_RECEIPT } from '../src/engine/approval';
import { dispatch, getState, interactAt, playToApprovalDone, skipExplainIfOpen } from './helpers';

test.setTimeout(240_000);

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('merge, majority, conflict, accept-without-repair, and resend all retry', async ({ page }) => {
  await playToApprovalDone(page);

  await interactAt(page, 'workshop', WORLD_POS.crewDesk.x, WORLD_POS.crewDesk.y);
  await page.getByTestId('crew-roles-merge').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.merge);
  await page.getByTestId('crew-owner-majority').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.ownerMajority);
  await page.getByTestId('crew-owner-robot').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.ownerRobot);
  let state = await getState(page);
  expect(state.evidence['6.2']).toBeUndefined();

  await page.getByTestId('crew-assign-researcher').click();
  await page.getByTestId('crew-assign-builder').click();
  await page.getByTestId('crew-assign-reviewer').click();
  await page.getByTestId('crew-owner-librarian').click();
  await page.getByTestId('crew-handoff-btn').click();
  await page.getByTestId('crew-majority').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.majorityTruth);
  await page.getByTestId('crew-pick-conflict').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.pickConflict);
  await page.getByTestId('crew-pick-evidence').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.inspectFirst);
  state = await getState(page);
  expect(state.evidence['6.2']).toBeUndefined();
  await page.getByTestId('crew-inspect-source').click();
  await page.getByTestId('crew-pick-evidence').click();
  await expect(page.getByTestId('crew-version')).toHaveText(VERSION_V2);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /6\.2/);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /6\.1/);
  await page.getByTestId('crew-resend').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.resend);
  state = await getState(page);
  expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  expect(state.crewQuest.crewReady).toBe(false);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.qualityDesk.x, WORLD_POS.qualityDesk.y);
  await page.getByTestId('crew-accept').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.criteriaFirst);
  await page.getByTestId('crew-open-criteria').click();
  await page.getByTestId('crew-accept').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.failedCriterion);
  await page.getByTestId('crew-repair-tone').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.repairTone);
  await page.getByTestId('crew-quality-majority').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.qualityMajority);
  await page.getByTestId('crew-quality-robot-done').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.robotDoneQuality);
  await page.getByTestId('crew-quality-resend').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(CREW_FEEDBACK.resend);
  state = await getState(page);
  expect(state.evidence['6.1']).toBeUndefined();
  expect(state.crewQuest.crewReady).toBe(false);
  await page.getByTestId('crew-repair-accuracy').click();
  await page.getByTestId('crew-accept').click();
  await expect(page.getByTestId('crew-accepted')).toBeVisible();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /6\.1/);
  state = await getState(page);
  expect(state.crewQuest.crewReady).toBe(true);
  expect(state.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  expect(state.mode).toBe('crew');
});
