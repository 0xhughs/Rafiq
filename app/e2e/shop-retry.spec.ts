import { expect, test } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import { SECOND_CLAIM_FORBIDDEN } from '../src/engine/shop';
import {
  advanceDialogue,
  clickChoice,
  enterShop,
  getState,
  hearShopMango,
  interactAt,
  playToHelpAccepted,
  skipExplainIfOpen,
} from './helpers';

async function completeLookupAndNotice(page: import('@playwright/test').Page): Promise<void> {
  await interactAt(page, 'shop', WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-tell_no_mango');
  await advanceDialogue(page);
  await skipExplainIfOpen(page);
  await interactAt(page, 'shop', WORLD_POS.shelfEast.x, WORLD_POS.shelfEast.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.calculator.x, WORLD_POS.calculator.y);
  for (const key of ['3', 'mul', '3', 'add', '2', 'mul', '4', 'eq'] as const) {
    await page.getByTestId(`calc-key-${key}`).click();
  }
  await page.getByTestId('calculator-close').click();
  await interactAt(page, 'shop', WORLD_POS.noticeBoard.x, WORLD_POS.noticeBoard.y);
  await page.getByTestId('notice-use-total').click();
  await page.getByTestId('notice-use-dates').click();
  await page.getByTestId('notice-post').click();
  await skipExplainIfOpen(page);
}

test('trusting the invented date price fails, retry succeeds, second claim does not point', async ({
  page,
}) => {
  await playToHelpAccepted(page);
  await enterShop(page);
  await hearShopMango(page);
  await completeLookupAndNotice(page);

  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await advanceDialogue(page);
  await clickChoice(page, 'dialogue-choice-trust_dates');
  await expect(page.getByTestId('dialogue-text')).toContainText('تحقق');
  const afterFail = await getState(page);
  expect(afterFail.evidence['1.3']).toBeUndefined();
  expect(afterFail.map).toBe('shop');
  await advanceDialogue(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');

  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await advanceDialogue(page);
  await clickChoice(page, 'dialogue-choice-refuse_dates');
  await advanceDialogue(page);
  await interactAt(page, 'shop', WORLD_POS.shelfEast.x, WORLD_POS.shelfEast.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-correct_dates');
  const claim = await page.getByTestId('dialogue-text').innerText();
  expect(claim).toMatch(/ماء|نفد|خمسة/);
  const body = await page.locator('body').innerText();
  for (const phrase of SECOND_CLAIM_FORBIDDEN) {
    expect(body).not.toContain(phrase);
  }
  await expect(page.getByTestId('hud-objective')).not.toContainText('الرف الغربي');
  await expect(page.getByTestId('hud-objective')).not.toContainText('بطاقة الماء');
  await clickChoice(page, 'dialogue-choice-verify_later');
  await interactAt(page, 'shop', WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-reject_water');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', '1.1,1.2,1.3');
  await advanceDialogue(page);
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-shop-quest', 'crate');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
});
