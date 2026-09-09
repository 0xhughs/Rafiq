import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { LAB_FEEDBACK, LAB_NOT_FOUND } from '../src/engine/lab';
import { dispatch, getState, interactAt, playToKioskDone, skipExplainIfOpen } from './helpers';

test.setTimeout(240_000);

test('guess-fix, decoy, publish-without-repair, repair-without-publish, and refuse all retry', async ({
  page,
}) => {
  await playToKioskDone(page);

  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  let state = await getState(page);
  expect(state.evidence['4.5']).toBeUndefined();
  expect(state.labQuest.labReady).toBe(false);
  await page.getByTestId('lab-close').click();

  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await page.getByTestId('lab-lookup').click();
  await expect(page.getByTestId('lab-feedback')).toContainText(LAB_NOT_FOUND);
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);

  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  await page.getByTestId('lab-patch-prod').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.needLog);
  state = await getState(page);
  expect(state.evidence['4.5']).toBeUndefined();
  expect(state.labQuest.fileRepaired).toBe(false);

  await page.getByTestId('lab-select-preview-log').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.decoyLog);
  await page.getByTestId('lab-patch-preview').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.decoyFile);
  await page.getByTestId('lab-patch-decoy').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.decoyFile);
  state = await getState(page);
  expect(state.evidence['4.5']).toBeUndefined();

  await page.getByTestId('lab-publish').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.frozenWrong);
  await page.getByTestId('lab-close').click();
  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await page.getByTestId('lab-lookup').click();
  await expect(page.getByTestId('lab-feedback')).toContainText(LAB_NOT_FOUND);
  state = await getState(page);
  expect(state.labQuest.publishedVersion).toBe(1);
  expect(state.evidence['4.6']).toBeUndefined();
  await page.getByTestId('lab-close').click();

  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  await page.getByTestId('lab-select-prod-log').click();
  await page.getByTestId('lab-patch-prod').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.5/);
  await page.getByTestId('lab-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await page.getByTestId('lab-lookup').click();
  await expect(page.getByTestId('lab-feedback')).toContainText(LAB_NOT_FOUND);
  state = await getState(page);
  expect(state.labQuest.fileRepaired).toBe(true);
  expect(state.labQuest.publishedVersion).toBe(1);
  expect(state.evidence['4.6']).toBeUndefined();
  await page.getByTestId('lab-close').click();

  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  await page.getByTestId('lab-cat-preview-log').click();
  await page.getByTestId('lab-cat-prod-log').click();
  await page.getByTestId('lab-publish').click();
  state = await getState(page);
  expect(state.labQuest.publishedVersion).toBe(2);
  expect(state.evidence['4.6']).toBeUndefined();
  await page.getByTestId('lab-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await page.getByTestId('lab-lookup').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.6/);
  await page.getByTestId('lab-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  await page.getByTestId('lab-format').click();
  await expect(page.getByTestId('lab-feedback')).toHaveText(LAB_FEEDBACK.refused);
  state = await getState(page);
  expect(state.labQuest.fileRepaired).toBe(true);
  await page.getByTestId('lab-ls').click();
  await page.getByTestId('lab-cat-preview-kiosk').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.4/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-lab-ready', 'true');
});
