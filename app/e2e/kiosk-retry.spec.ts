import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { KIOSK_FEEDBACK } from '../src/engine/kiosk';
import {
  dispatch,
  getState,
  interactAt,
  playToWorkshopDone,
  skipExplainIfOpen,
} from './helpers';

test.setTimeout(240_000);

test('missing key, exposure, LTR lookup, and skipped checklist all retry', async ({ page }) => {
  await playToWorkshopDone(page);

  await interactAt(page, 'workshop', WORLD_POS.kioskDocs.x, WORLD_POS.kioskDocs.y);
  await page.getByTestId('inspect-close').click();
  let state = await getState(page);
  expect(state.evidence['4.3']).toBeUndefined();
  expect(state.evidence['4.4']).toBeUndefined();

  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  await page.getByTestId('kiosk-strip').click();
  await page.getByTestId('kiosk-send').click();
  await expect(page.getByTestId('kiosk-feedback')).toHaveText(KIOSK_FEEDBACK.missing);
  state = await getState(page);
  expect(state.kioskQuest.sawMissingKey).toBe(true);
  expect(state.evidence['4.3']).toBeUndefined();
  await page.getByTestId('kiosk-embed').click();
  await page.getByTestId('kiosk-send').click();
  await expect(page.getByTestId('kiosk-feedback')).toContainText(KIOSK_FEEDBACK.exposure);
  state = await getState(page);
  expect(state.kioskQuest.sawExposure).toBe(true);
  expect(state.evidence['4.3']).toBeUndefined();
  await page.getByTestId('kiosk-move-vault').click();
  await page.getByTestId('kiosk-send').click();
  await expect(page.getByTestId('kiosk-response')).toContainText('200');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.3/);
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);

  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  await page.getByTestId('kiosk-lookup-sunday').click();
  await expect(page.getByTestId('kiosk-feedback')).toHaveText(KIOSK_FEEDBACK.fixRtl);
  state = await getState(page);
  expect(state.evidence['4.4']).toBeUndefined();
  await page.getByTestId('kiosk-close').click();
  state = await getState(page);
  expect(state.evidence['4.4']).toBeUndefined();

  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  await page.getByTestId('kiosk-set-rtl').click();
  await page.getByTestId('kiosk-isolate').click();
  await page.getByTestId('kiosk-lookup-monday').click();
  await page.getByTestId('kiosk-close').click();
  state = await getState(page);
  expect(state.kioskQuest.lookupDone).toBe(true);
  expect(state.evidence['4.4']).toBeUndefined();

  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  await page.getByTestId('kiosk-check-title').click();
  await page.getByTestId('kiosk-check-slot').click();
  await page.getByTestId('kiosk-check-lookup').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /4\.4/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-kiosk-ready', 'true');
});
