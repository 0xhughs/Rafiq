import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import {
  enterNewsroom,
  getState,
  interactAt,
  playToArchiveDone,
  skipExplainIfOpen,
} from './helpers';

test.setTimeout(120_000);

test('consensus, cite-before-original, unmarked draft, slogan, and circular letter all retry', async ({
  page,
}) => {
  await playToArchiveDone(page);
  await enterNewsroom(page);

  await interactAt(page, 'newsroom', WORLD_POS.compareDesk.x, WORLD_POS.compareDesk.y);
  await page.getByTestId('compare-submit').click();
  let state = await getState(page);
  expect(state.evidence['3.1']).toBeUndefined();
  await page.getByTestId('compare-close').click();

  await interactAt(page, 'newsroom', WORLD_POS.sourceBulletin.x, WORLD_POS.sourceBulletin.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.sourcePoster.x, WORLD_POS.sourcePoster.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.compareDesk.x, WORLD_POS.compareDesk.y);
  await page.getByTestId('compare-consensus').click();
  state = await getState(page);
  expect(state.newsroomQuest.consensusAttempted).toBe(true);
  expect(state.evidence['3.1']).toBeUndefined();
  await page.getByTestId('compare-namedBulletin').click();
  await page.getByTestId('compare-namedPoster').click();
  await page.getByTestId('compare-hoursA').click();
  await page.getByTestId('compare-hoursB').click();
  await page.getByTestId('compare-accessA').click();
  await page.getByTestId('compare-accessB').click();
  await page.getByTestId('compare-submit').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.1/);
  await page.getByTestId('compare-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'newsroom', WORLD_POS.clippingBoard.x, WORLD_POS.clippingBoard.y);
  await page.getByTestId('cite-clipping').click();
  await expect(page.getByTestId('clipping-feedback')).toBeVisible();
  state = await getState(page);
  expect(state.newsroomQuest.citedBeforeOriginal).toBe(true);
  expect(state.evidence['3.3']).toBeUndefined();
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.originalDrawer.x, WORLD_POS.originalDrawer.y);
  await page.getByTestId('verify-original').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.3/);
  await skipExplainIfOpen(page);

  await interactAt(page, 'newsroom', WORLD_POS.draftTable.x, WORLD_POS.draftTable.y);
  await page.getByTestId('draft-release').click();
  state = await getState(page);
  expect(state.newsroomQuest.releasedUnchecked).toBe(true);
  expect(state.evidence['2.3']).toBeUndefined();
  await page.getByTestId('draft-mark-always_open').click();
  await page.getByTestId('draft-release').click();
  state = await getState(page);
  expect(state.evidence['2.3']).toBeUndefined();
  await page.getByTestId('draft-correct-always_open').click();
  await page.getByTestId('draft-correct-midnight_hold').click();
  await page.getByTestId('draft-correct-no_written').click();
  await page.getByTestId('draft-release').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.3/);
  await page.getByTestId('draft-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'newsroom', WORLD_POS.voiceDesk.x, WORLD_POS.voiceDesk.y);
  await page.getByTestId('voice-slogan').click();
  state = await getState(page);
  expect(state.evidence['2.6']).toBeUndefined();
  await page.getByTestId('voice-change-facts').click();
  state = await getState(page);
  expect(state.newsroomQuest.factsChanged).toBe(true);
  expect(state.evidence['2.6']).toBeUndefined();
  await page.getByTestId('voice-editor').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /2\.6/);
  state = await getState(page);
  expect(state.newsroomQuest.factsChanged).toBe(false);
  await page.getByTestId('voice-close').click();
  await skipExplainIfOpen(page);

  await interactAt(page, 'newsroom', WORLD_POS.letterDesk.x, WORLD_POS.letterDesk.y);
  await page.getByTestId('letter-send-player').click();
  state = await getState(page);
  expect(state.evidence['3.2']).toBeUndefined();
  await page.getByTestId('letter-recipient-circular14').click();
  await page.getByTestId('letter-purpose-inspection').click();
  await page.getByTestId('letter-tone-clear_polite').click();
  await page.getByTestId('letter-review').click();
  await page.getByTestId('letter-send-player').click();
  await expect(page.getByTestId('letter-feedback')).toContainText('تعميم');
  state = await getState(page);
  expect(state.evidence['3.2']).toBeUndefined();
  await page.getByTestId('letter-recipient-workshop_manager').click();
  await page.getByTestId('letter-purpose-inspection').click();
  await page.getByTestId('letter-tone-clear_polite').click();
  await page.getByTestId('letter-body-ok').click();
  await page.getByTestId('letter-send-robot').click();
  state = await getState(page);
  expect(state.newsroomQuest.letterSignedBy).toBe('robot_manager');
  expect(state.evidence['3.2']).toBeUndefined();
  await page.getByTestId('letter-review').click();
  await page.getByTestId('letter-send-player').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /3\.2/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-lead', 'true');
});
