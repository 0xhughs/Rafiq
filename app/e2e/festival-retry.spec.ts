import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import {
  dispatch,
  enterFestival,
  getState,
  interactAt,
  playToNewsroomDone,
  skipExplainIfOpen,
} from './helpers';

test.setTimeout(180_000);

test('invented cups, robot total, missing stamp, and robot figures all retry', async ({ page }) => {
  await playToNewsroomDone(page);
  await enterFestival(page);

  await interactAt(page, 'festival', WORLD_POS.reconcileDesk.x, WORLD_POS.reconcileDesk.y);
  await page.getByTestId('reconcile-sum').click();
  let state = await getState(page);
  expect(state.evidence['3.4']).toBeUndefined();
  await page.getByTestId('reconcile-close').click();

  await interactAt(page, 'festival', WORLD_POS.stockTable.x, WORLD_POS.stockTable.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'festival', WORLD_POS.receiptsDesk.x, WORLD_POS.receiptsDesk.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'festival', WORLD_POS.reconcileDesk.x, WORLD_POS.reconcileDesk.y);
  await page.getByTestId('reconcile-flags-match').click();
  await page.getByTestId('reconcile-cloth-match').click();
  await page.getByTestId('reconcile-water-receipt').click();
  await page.getByTestId('reconcile-cups-table').click();
  await page.getByTestId('reconcile-sum').click();
  await expect(page.getByTestId('reconcile-feedback')).toBeVisible();
  state = await getState(page);
  expect(state.evidence['3.4']).toBeUndefined();
  await page.getByTestId('reconcile-cups-invent').click();
  await page.getByTestId('reconcile-sum').click();
  state = await getState(page);
  expect(state.evidence['3.4']).toBeUndefined();
  await page.getByTestId('reconcile-robot').click();
  state = await getState(page);
  expect(state.festivalQuest.usedRobotTotal).toBe(true);
  expect(state.evidence['3.4']).toBeUndefined();
  await page.getByTestId('reconcile-flags-match').click();
  await page.getByTestId('reconcile-cloth-match').click();
  await page.getByTestId('reconcile-water-receipt').click();
  await page.getByTestId('reconcile-cups-unknown').click();
  await page.getByTestId('reconcile-sum').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.4/);
  await page.getByTestId('reconcile-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'festival', WORLD_POS.policyBoard.x, WORLD_POS.policyBoard.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'festival', WORLD_POS.submitDesk.x, WORLD_POS.submitDesk.y);
  await page.getByTestId('submit-figures-human').click();
  await page.getByTestId('submit-send-player').click();
  state = await getState(page);
  expect(state.festivalQuest.submittedWithoutStamp).toBe(true);
  expect(state.evidence['3.5']).toBeUndefined();
  await page.getByTestId('submit-stamp').click();
  await page.getByTestId('submit-figures-robot').click();
  await page.getByTestId('submit-send-player').click();
  state = await getState(page);
  expect(state.festivalQuest.submittedRobotFigures).toBe(true);
  expect(state.evidence['3.5']).toBeUndefined();
  await page.getByTestId('submit-figures-human').click();
  await page.getByTestId('submit-send-officer').click();
  state = await getState(page);
  expect(state.festivalQuest.sender).toBe('officer_robot');
  expect(state.evidence['3.5']).toBeUndefined();
  await dispatch(page, { type: 'SUBMIT_SET', field: 'stamp', value: 'on' });
  await page.getByTestId('submit-send-player').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.5/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-materials', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-door', 'open');
});
