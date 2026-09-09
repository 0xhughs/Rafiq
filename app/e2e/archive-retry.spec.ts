import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { NOTE_TEXT } from '../src/engine/library';
import {
  enterArchive,
  getState,
  interactAt,
  playToParcelDone,
  skipExplainIfOpen,
} from './helpers';

test('pin does not skip 1.4; overflow then reselect awards', async ({ page }) => {
  await playToParcelDone(page);
  await enterArchive(page);
  await interactAt(page, 'archive', WORLD_POS.contextBench.x, WORLD_POS.contextBench.y);
  await page.getByTestId('context-pin-constraint').click();
  await page.getByTestId('context-pin-hold').click();
  await page.getByTestId('context-recite').click();
  let state = await getState(page);
  expect(state.evidence['1.4']).toBeUndefined();
  expect(state.libraryQuest.pinnedNotes).toContain('constraint');
  await page.getByTestId('context-load-constraint').click();
  await expect(page.getByTestId('context-overflow')).toBeVisible();
  await page.getByTestId('context-load-hold').click();
  await page.getByTestId('context-recite').click();
  await expect(page.getByTestId('context-recitation')).toHaveText(NOTE_TEXT.constraint);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /1\.4/);
  await page.getByTestId('context-close').click();
  await skipExplainIfOpen(page);
});

test('unredacted give fails then redact succeeds; hiding facts fails', async ({ page }) => {
  await playToParcelDone(page);
  await enterArchive(page);
  await interactAt(page, 'archive', WORLD_POS.communityFile.x, WORLD_POS.communityFile.y);
  await page.getByTestId('redact-give').click();
  await expect(page.getByTestId('redact-feedback')).toBeVisible();
  let state = await getState(page);
  expect(state.evidence['1.5']).toBeUndefined();
  await page.getByTestId('redact-name_noura').click();
  await page.getByTestId('redact-name_khalid').click();
  await page.getByTestId('redact-phone').click();
  await page.getByTestId('redact-address').click();
  await page.getByTestId('fact-shelf').click();
  await page.getByTestId('redact-give').click();
  state = await getState(page);
  expect(state.evidence['1.5']).toBeUndefined();
  await page.getByTestId('fact-shelf').click();
  await page.getByTestId('redact-give').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /1\.5/);
  await page.getByTestId('redact-close').click();
  await skipExplainIfOpen(page);
});

test('wrong pack then correct named pack', async ({ page }) => {
  await playToParcelDone(page);
  await enterArchive(page);
  await interactAt(page, 'archive', WORLD_POS.packTable.x, WORLD_POS.packTable.y);
  await page.getByTestId('pack-toggle-spec').click();
  await page.getByTestId('pack-toggle-delivery').click();
  await page.getByTestId('pack-toggle-festival').click();
  await page.getByTestId('pack-stamp-festival').click();
  await page.getByTestId('pack-assemble').click();
  let state = await getState(page);
  expect(state.evidence['2.5']).toBeUndefined();
  await page.getByTestId('pack-toggle-festival').click();
  await page.getByTestId('pack-stamp-unnamed').click();
  await page.getByTestId('pack-assemble').click();
  state = await getState(page);
  expect(state.evidence['2.5']).toBeUndefined();
  await page.getByTestId('pack-stamp-rafiq_repair').click();
  await page.getByTestId('pack-assemble').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.5/);
  await page.getByTestId('pack-close').click();
  await skipExplainIfOpen(page);
});
