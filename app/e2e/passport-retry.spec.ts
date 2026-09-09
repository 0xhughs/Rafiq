import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { PASSPORT_FEEDBACK } from '../src/engine/passport';
import { dispatch, getState, interactAt, playToCrewDone, completePathQuest, waitForGame } from './helpers';

test.setTimeout(300_000);

test('retry paths do not trap and do not issue until confirm plus download', async ({ page }) => {
  await playToCrewDone(page);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toBeVisible();
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  await page.getByTestId('dialogue-advance').click();

  await completePathQuest(page);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await page.getByTestId('dialogue-advance').click();

  await page.evaluate(() => {
    const key = 'rafiq.adventure.v1';
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error('missing save');
    const envelope = JSON.parse(raw) as { evidence: Record<string, string> };
    delete envelope.evidence['1.1'];
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });
  await page.reload();
  await waitForGame(page);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  await expect(page.getByTestId('shop-feedback')).toHaveText(PASSPORT_FEEDBACK.ineligible);

  await page.evaluate(() => {
    const key = 'rafiq.adventure.v1';
    const raw = window.localStorage.getItem(key);
    if (!raw) throw new Error('missing save');
    const envelope = JSON.parse(raw) as { evidence: Record<string, string> };
    envelope.evidence['1.1'] = 'demonstrated';
    window.localStorage.setItem(key, JSON.stringify(envelope));
  });
  await page.reload();
  await waitForGame(page);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('certificate')).toBeVisible();

  await page.getByTestId('certificate-download-png').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.confirmFirst);
  expect((await getState(page)).passportQuest.issued).toBe(false);

  await page.getByTestId('certificate-exam').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.exam);
  await page.getByTestId('certificate-percent').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.percent);
  await page.getByTestId('certificate-verify-public').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.verifyPublic);
  await page.getByTestId('certificate-registry').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.registry);
  await page.getByTestId('certificate-legacy').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.legacy);
  await page.getByTestId('certificate-network').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.network);
  await page.getByTestId('certificate-robot-done').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.robotDone);
  expect((await getState(page)).passportQuest.issued).toBe(false);

  await page.getByTestId('certificate-close').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-ending', 'invited');
  expect((await getState(page)).passportQuest.issued).toBe(false);
  await page.getByTestId('open-passport').click();
  await expect(page.getByTestId('certificate')).toBeVisible();

  await page.getByTestId('certificate-fail').click();
  await expect(page.getByTestId('certificate-feedback')).toHaveText(PASSPORT_FEEDBACK.fail);
  await expect(page.getByTestId('certificate')).toBeVisible();
  expect((await getState(page)).passportQuest.issued).toBe(false);

  await page.getByTestId('certificate-confirm-name').click();
  const pngFirst = page.waitForEvent('download');
  await page.getByTestId('certificate-download-png').click();
  await pngFirst;
  expect((await getState(page)).passportQuest.issued).toBe(true);

  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  if ((await page.getByTestId('game-root').getAttribute('data-mode')) === 'explain') {
    await page.getByTestId('explain-skip').click();
  }
  await page.getByTestId('open-passport').click();
  const pngReplay = page.waitForEvent('download');
  await page.getByTestId('certificate-download-png').click();
  const replayed = await pngReplay;
  expect(replayed.suggestedFilename()).toBe('rafiq-passport.png');
  expect((await getState(page)).passportQuest.issued).toBe(true);
});
