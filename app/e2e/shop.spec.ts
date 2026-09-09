import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  assertNoLessonUi,
  advanceDialogue,
  clickChoice,
  closeOverlay,
  dispatch,
  enterShop,
  getState,
  hearShopMango,
  interactAt,
  playToHelpAccepted,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/03');

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

test('help-accepted through shop success with physical actions', async ({ page }) => {
  await playToHelpAccepted(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', '');
  await enterShop(page);
  await hearShopMango(page);

  await interactAt(page, 'shop', WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  await expect(page.getByTestId('shelf-record-west')).toContainText('خبز');
  await expect(page.getByTestId('shelf-record-west')).toContainText('لبن');
  await expect(page.getByTestId('shelf-record-west')).toContainText('ماء');
  await expect(page.getByTestId('shelf-record-west')).toContainText('متوفر');
  await expect(page.getByTestId('shelf-record-west')).toContainText('لا يوجد عصير مانجو');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'shelf-record.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();
  const afterInspect = await getState(page);
  expect(afterInspect.evidence['1.1']).toBeUndefined();

  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-tell_no_mango');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', '1.1');
  await advanceDialogue(page);
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-shop-quest', 'notice');

  await interactAt(page, 'shop', WORLD_POS.shelfEast.x, WORLD_POS.shelfEast.y);
  await expect(page.getByTestId('shelf-record-east')).toContainText('تمر الخلاص');
  await expect(page.getByTestId('shelf-record-east')).toContainText('٩');
  await expect(page.getByTestId('shelf-record-east')).toContainText('لا يوجد مانجو');
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'shop', WORLD_POS.priceList.x, WORLD_POS.priceList.y);
  await expect(page.getByTestId('price-list')).toContainText('مفتوح حتى المغرب');
  await page.getByTestId('inspect-close').click();

  await interactAt(page, 'shop', WORLD_POS.calculator.x, WORLD_POS.calculator.y);
  await expect(page.getByTestId('calculator-overlay')).toBeVisible();
  for (const key of ['3', 'mul', '3', 'add', '2', 'mul', '4', 'eq'] as const) {
    await page.getByTestId(`calc-key-${key}`).click();
  }
  await expect(page.getByTestId('calculator-result')).toHaveText('17');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'calculator.png'), fullPage: true });
  await page.getByTestId('calculator-close').click();

  await interactAt(page, 'shop', WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
  await expect(page.getByTestId('notice-draft')).toContainText('٢٠');
  await expect(page.getByTestId('notice-draft')).toContainText('نفد');
  await expect(page.getByTestId('notice-draft')).toContainText('١٨');
  await page.getByTestId('notice-use-total').click();
  await page.getByTestId('notice-use-dates').click();
  await page.getByTestId('notice-use-water').click();
  await page.getByTestId('notice-post').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', '1.1,1.2');
  await skipExplainIfOpen(page);

  await interactAt(page, 'shop', WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
  await expect(page.getByTestId('notice-posted')).toContainText('١٧');
  await expect(page.getByTestId('notice-posted')).not.toContainText('٢٠');
  await expect(page.getByTestId('notice-posted')).not.toContainText('نفد');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'notice.png'), fullPage: true });
  await page.getByTestId('notice-close').click();

  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await advanceDialogue(page);
  await expect(page.getByTestId('dialogue-text')).toContainText('ثمانية عشر');
  await clickChoice(page, 'dialogue-choice-refuse_dates');
  await advanceDialogue(page);
  await interactAt(page, 'shop', WORLD_POS.shelfEast.x, WORLD_POS.shelfEast.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-correct_dates');
  await expect(page.getByTestId('dialogue-text')).toContainText(/ماء|نفد|خمسة/);
  await clickChoice(page, 'dialogue-choice-verify_later');
  await interactAt(page, 'shop', WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-reject_water');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', '1.1,1.2,1.3');
  await advanceDialogue(page);
  await skipExplainIfOpen(page);

  await interactAt(page, 'shop', WORLD_POS.crate.x, WORLD_POS.crate.y);
  await page.getByTestId('crate-ask-shopkeeper').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', '1.1,1.2,1.3,1.6');
  await expect(page.getByTestId('dialogue-text')).toContainText('شكراً');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await advanceDialogue(page);
  await expect(page.getByTestId('dialogue-text')).toContainText('طرد');
  await advanceDialogue(page);
  await expect(page.getByTestId('dialogue-text')).toContainText(/المكتبة|الفجر/);
  await advanceDialogue(page);
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-shop-quest', 'helped');
  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText('طرد');
  await page.getByTestId('resume-button').click();
  await assertNoLessonUi(page);

  const done = await getState(page);
  expect(done.evidence).toEqual({
    '1.1': 'demonstrated',
    '1.2': 'demonstrated',
    '1.3': 'demonstrated',
    '1.6': 'demonstrated',
  });
  expect(done.shopQuest.phase).toBe('helped');

  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('طرد الإصلاح');
  await closeOverlay(page);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/المكتبة|الفجر/);
});

test('shop overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToHelpAccepted(page);
  await enterShop(page);
  await hearShopMango(page);
  await page.setViewportSize({ width: 1366, height: 768 });
  await interactAt(page, 'shop', WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  const overlay = page.getByTestId('inspect-overlay');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.paper-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await page.getByTestId('inspect-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'shop', WORLD_POS.calculator.x, WORLD_POS.calculator.y);
  const calc = page.getByTestId('calculator-overlay');
  await expect(calc).toBeVisible();
  const calcBox = await calc.locator('.calculator-body').boundingBox();
  expect(calcBox).not.toBeNull();
  if (calcBox) {
    expect(calcBox.x + calcBox.width).toBeLessThanOrEqual(1921);
    expect(calcBox.y + calcBox.height).toBeLessThanOrEqual(1081);
  }
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
