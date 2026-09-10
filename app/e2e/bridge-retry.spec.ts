import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { BRIDGE_FEEDBACK, DRAFT_EMPTY, DRAFT_SAVED } from '../src/engine/bridge';
import { dispatch, getState, interactAt, playToAgentDone, skipExplainIfOpen } from './helpers';

test.setTimeout(240_000);

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

async function grantLimited(page: Parameters<typeof dispatch>[0]): Promise<void> {
  const lookup = page.getByTestId('bridge-grant-lookup');
  const draft = page.getByTestId('bridge-grant-draft');
  const week = page.getByTestId('bridge-grant-week');
  if ((await lookup.getAttribute('class'))?.includes('ghost')) await lookup.click();
  if ((await draft.getAttribute('class'))?.includes('ghost')) await draft.click();
  if ((await week.getAttribute('class'))?.includes('ghost')) await week.click();
  const rewrite = page.getByTestId('bridge-grant-rewrite');
  const payroll = page.getByTestId('bridge-grant-payroll');
  if ((await rewrite.getAttribute('class'))?.includes('primary')) await rewrite.click();
  if ((await payroll.getAttribute('class'))?.includes('primary')) await payroll.click();
}

test('connect-only, wrong grant, payroll, save-without-lookup, browser-save, and robot تم all retry', async ({
  page,
}) => {
  await playToAgentDone(page);

  await interactAt(page, 'workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y);
  let state = await getState(page);
  expect(state.evidence['5.3']).toBeUndefined();
  expect(state.bridgeQuest.bridgeReady).toBe(false);

  await page.getByTestId('bridge-connect').click();
  await page.getByTestId('bridge-list-tools').click();
  state = await getState(page);
  expect(state.evidence['5.3']).toBeUndefined();

  await page.getByTestId('bridge-lookup').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.notListed);

  await page.getByTestId('bridge-list-resources').click();
  await page.getByTestId('bridge-grant-all').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.grantAll);
  state = await getState(page);
  expect(state.evidence['5.3']).toBeUndefined();

  await page.getByTestId('bridge-grant-rewrite').click();
  await page.getByTestId('bridge-grant-payroll').click();
  await grantLimited(page);
  await page.getByTestId('bridge-lookup-payroll').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.payroll);

  await page.getByTestId('bridge-save-draft').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.saveWithoutLookup);
  await expect(page.getByTestId('bridge-draft-text')).toHaveText(DRAFT_EMPTY);

  await page.getByTestId('bridge-robot-done').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.robotDone);
  state = await getState(page);
  expect(state.evidence['5.3']).toBeUndefined();

  await page.getByTestId('bridge-load-skill').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.loadSkill);
  expect(state.bridgeQuest.bridgeReady).toBe(false);

  await page.getByTestId('bridge-lookup').click();
  await page.getByTestId('bridge-save-draft').click();
  await expect(page.getByTestId('bridge-draft-text')).toHaveText(DRAFT_SAVED);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.3/);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.bridgeBrowser.x, WORLD_POS.bridgeBrowser.y);
  await page.getByTestId('bridge-browser-save').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.browserSave);
  state = await getState(page);
  expect(state.bridgeQuest.bridgeReady).toBe(false);
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y);
  await page.getByTestId('bridge-invoke-rewrite').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.deniedRewrite);
  await page.getByTestId('bridge-invoke-pay').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.missingPay);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-bridge-ready', 'true');
  state = await getState(page);
  expect(state.bridgeQuest.bridgeReady).toBe(true);
  expect(state.evidence['5.3']).toBe('demonstrated');
});
