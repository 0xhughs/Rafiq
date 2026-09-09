import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { WORKSHOP_FEEDBACK } from '../src/engine/workshop';
import {
  dispatch,
  enterWorkshop,
  getState,
  interactAt,
  playToFestivalDone,
  skipExplainIfOpen,
} from './helpers';

test.setTimeout(180_000);

test('extras, missing brief parts, no-brief build, inspect-only, and bloated controls all retry', async ({
  page,
}) => {
  await playToFestivalDone(page);
  await enterWorkshop(page);

  await interactAt(page, 'workshop', WORLD_POS.needSlip.x, WORLD_POS.needSlip.y);
  await page.getByTestId('inspect-close').click();
  let state = await getState(page);
  expect(state.evidence['4.1']).toBeUndefined();
  expect(state.evidence['4.2']).toBeUndefined();

  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-build').click();
  await expect(page.getByTestId('builder-feedback')).toContainText(WORKSHOP_FEEDBACK.buildWithoutBrief);
  state = await getState(page);
  expect(state.workshopQuest.builtWithoutBrief).toBe(true);
  expect(state.workshopQuest.boardKind).toBe('none');
  expect(state.evidence['4.2']).toBeUndefined();
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-done').click();
  await expect(page.getByTestId('builder-feedback')).toContainText(WORKSHOP_FEEDBACK.robotDone);
  state = await getState(page);
  expect(state.evidence['4.1']).toBeUndefined();
  expect(state.evidence['4.2']).toBeUndefined();
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  await page.getByTestId('brief-constraints-ok').click();
  await page.getByTestId('brief-exclusions-ok').click();
  await page.getByTestId('brief-acceptance-ok').click();
  await page.getByTestId('brief-close').click();
  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-hand').click();
  await expect(page.getByTestId('builder-feedback')).toContainText(WORKSHOP_FEEDBACK.needScreens);
  state = await getState(page);
  expect(state.evidence['4.2']).toBeUndefined();
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  await page.getByTestId('brief-screens-ok').click();
  await page.getByTestId('brief-constraints-ok').click();
  await page.getByTestId('brief-exclusions-ok').click();
  await page.getByTestId('brief-acceptance-ok').click();
  await page.getByTestId('brief-extra-pay').click();
  await page.getByTestId('brief-close').click();
  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-hand').click();
  await page.getByTestId('builder-build').click();
  await expect(page.getByTestId('builder-feedback')).toContainText('إضافي');
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'workshop', WORLD_POS.appointmentBoard.x, WORLD_POS.appointmentBoard.y);
  await page.getByTestId('board-extra-pay').click();
  await expect(page.getByTestId('board-feedback')).toContainText(WORKSHOP_FEEDBACK.extraControl);
  state = await getState(page);
  expect(state.evidence['4.1']).toBeUndefined();
  await page.getByTestId('board-close').click();

  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  await page.getByTestId('brief-screens-ok').click();
  await page.getByTestId('brief-constraints-ok').click();
  await page.getByTestId('brief-exclusions-ok').click();
  await page.getByTestId('brief-acceptance-ok').click();
  await page.getByTestId('brief-extra-none').click();
  await page.getByTestId('brief-close').click();
  await interactAt(page, 'workshop', WORLD_POS.builderBench.x, WORLD_POS.builderBench.y);
  await page.getByTestId('builder-hand').click();
  await page.getByTestId('builder-build').click();
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'workshop', WORLD_POS.resultCheck.x, WORLD_POS.resultCheck.y);
  await page.getByTestId('result-screens').click();
  await page.getByTestId('result-constraints').click();
  await page.getByTestId('result-exclusions').click();
  await page.getByTestId('result-acceptance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.2/);
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.appointmentBoard.x, WORLD_POS.appointmentBoard.y);
  await page.getByTestId('board-book-monday').click();
  await expect(page.getByTestId('board-booked')).toHaveText('محجوز');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.1/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-service-posted', 'true');
});
