import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import {
  briefParcelClerk,
  clickChoice,
  enterParcelOffice,
  fillCompleteInstruction,
  getState,
  interactAt,
  playToShopHelped,
  skipExplainIfOpen,
  talkCompanionOnParcel,
} from './helpers';

test('ambiguous fail, revise missing field, fresh ر-١٩, no trap', async ({ page }) => {
  await playToShopHelped(page);
  await enterParcelOffice(page);
  await briefParcelClerk(page);
  await talkCompanionOnParcel(page);
  await clickChoice(page, 'dialogue-choice-delegate_retrieve');
  await clickChoice(page, 'dialogue-choice-allow_overbroad');
  await expect(page.getByTestId('dialogue-text')).toContainText('لا');
  const afterAllow = await getState(page);
  expect(afterAllow.evidence['2.1']).toBeUndefined();
  await page.getByTestId('dialogue-advance').click();

  await talkCompanionOnParcel(page);
  await clickChoice(page, 'dialogue-choice-stop_overbroad');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.1/);
  await page.getByTestId('dialogue-advance').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'parcel', WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
  await page.getByTestId('instruction-ambiguous').click();
  await expect(page.getByTestId('ambiguous-fail')).toBeVisible();
  const failed = await getState(page);
  expect(failed.parcelQuest.failedAttempt).toBe(true);
  expect(failed.evidence['2.4']).toBeUndefined();
  const failedSend = failed.parcelQuest.failedSendId;

  await fillCompleteInstruction(page, 'r19');
  const beforeSend = await getState(page);
  expect(beforeSend.parcelQuest.retrievedParcelId).toBeNull();
  expect(beforeSend.parcelQuest.failedSendId).toBe(failedSend);
  expect(beforeSend.evidence['2.4']).toBeUndefined();

  await page.getByTestId('instruction-send').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.4/);
  const done = await getState(page);
  expect(done.parcelQuest.successSendId).not.toBe(failedSend);
  expect(done.parcelQuest.retrievedParcelId).toBe('r19');
  await page.getByTestId('dialogue-advance').click();
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
});

test('robot cannot pay and paying the decoy does not award evidence', async ({ page }) => {
  await playToShopHelped(page);
  await enterParcelOffice(page);
  await briefParcelClerk(page);
  await interactAt(page, 'parcel', WORLD_POS.payWindow.x, WORLD_POS.payWindow.y);
  await page.getByTestId('pay-robot').click();
  await expect(page.getByTestId('pay-feedback')).toContainText('لا يدفع');
  let state = await getState(page);
  expect(state.evidence['2.1']).toBeUndefined();
  expect(state.evidence['2.2']).toBeUndefined();
  await page.getByTestId('pay-player').click();
  await expect(page.getByTestId('pay-decoy-done')).toBeVisible();
  state = await getState(page);
  expect(state.parcelQuest.playerPaidDecoy).toBe(true);
  expect(state.evidence['2.2']).toBeUndefined();
  expect(state.evidence['2.4']).toBeUndefined();
});
