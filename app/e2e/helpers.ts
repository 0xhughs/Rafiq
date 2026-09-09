import { expect, type Page } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import type { GameAction, MapId, SerializedTestState } from '../src/engine/types';

export async function waitForGame(page: Page): Promise<void> {
  await page.waitForFunction(() => Boolean(window.__RAFIQ_TEST__));
}

export async function getState(page: Page): Promise<SerializedTestState> {
  return page.evaluate(() => {
    const api = window.__RAFIQ_TEST__;
    if (!api) throw new Error('missing __RAFIQ_TEST__');
    return api.getState();
  });
}

export async function startAdventure(page: Page, name: string): Promise<void> {
  await page.goto('/');
  await waitForGame(page);
  await page.getByTestId('name-input').fill(name);
  await page.getByTestId('name-submit').click();
  await expect(page.getByTestId('name-preview')).toHaveText(name);
  await page.getByTestId('name-confirm').click();
  await expect(page.getByTestId('world-canvas')).toBeVisible();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
}

export async function teleport(page: Page, map: MapId, x: number, y: number): Promise<void> {
  await page.evaluate(
    ({ map, x, y }) => {
      window.__RAFIQ_TEST__!.teleport(map, x, y);
    },
    { map, x, y },
  );
}

export async function pressInteract(page: Page): Promise<void> {
  await page.getByTestId('game-root').focus();
  await page.keyboard.press('KeyE');
}

export async function interactAt(
  page: Page,
  map: MapId,
  x: number,
  y: number,
): Promise<void> {
  await page.evaluate(
    ({ map, x, y }) => {
      const api = window.__RAFIQ_TEST__;
      if (!api) throw new Error('missing __RAFIQ_TEST__');
      api.teleport(map, x, y);
      api.dispatch({ type: 'INTERACT' });
    },
    { map, x, y },
  );
  await page.waitForTimeout(30);
}

export async function advanceUntilChoices(page: Page): Promise<void> {
  for (let i = 0; i < 12; i += 1) {
    if (await page.getByTestId('dialogue-agree').isVisible().catch(() => false)) {
      return;
    }
    const advance = page.getByTestId('dialogue-advance');
    if (await advance.isVisible().catch(() => false)) {
      await advance.click();
      continue;
    }
    throw new Error('dialogue ended before choices');
  }
}

export async function playToHelpAccepted(page: Page, name = 'علي حسن'): Promise<void> {
  await startAdventure(page, name);
  await interactAt(page, 'apartment', WORLD_POS.trash.x, WORLD_POS.trash.y);
  const leaving = page.getByTestId('dialogue-advance');
  if (await leaving.isVisible()) {
    await leaving.click();
  }
  await interactAt(page, 'apartment', WORLD_POS.apartmentDoor.x, WORLD_POS.apartmentDoor.y);
  await interactAt(page, 'street', WORLD_POS.dumpsterApproach.x, WORLD_POS.dumpsterApproach.y);
  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await advanceUntilChoices(page);
  await page.getByTestId('dialogue-agree').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-encounter', 'help_accepted');
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
}

export async function assertNoLessonUi(page: Page): Promise<void> {
  await expect(page.getByTestId('lesson')).toHaveCount(0);
  await expect(page.getByTestId('exam')).toHaveCount(0);
  await expect(page.getByTestId('quiz')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('موضوع 1.1');
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('الاختبار النهائي');
}

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

export async function dispatch(page: Page, action: GameAction): Promise<void> {
  await page.evaluate((next) => {
    const api = window.__RAFIQ_TEST__;
    if (!api) throw new Error('missing __RAFIQ_TEST__');
    api.dispatch(next);
  }, action);
  await page.waitForTimeout(30);
}

export async function closeOverlay(page: Page): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
}

export async function skipExplainIfOpen(page: Page): Promise<void> {
  const skip = page.getByTestId('explain-skip');
  if (await skip.isVisible().catch(() => false)) {
    await skip.click();
  }
}

export async function completeShopVisit(page: Page): Promise<void> {
  await enterShop(page);
  await hearShopMango(page);
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
  await page.getByTestId('notice-use-water').click();
  await page.getByTestId('notice-post').click();
  await skipExplainIfOpen(page);
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await advanceDialogue(page);
  await clickChoice(page, 'dialogue-choice-refuse_dates');
  await advanceDialogue(page);
  await interactAt(page, 'shop', WORLD_POS.shelfEast.x, WORLD_POS.shelfEast.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-correct_dates');
  await clickChoice(page, 'dialogue-choice-verify_later');
  await interactAt(page, 'shop', WORLD_POS.shelfWest.x, WORLD_POS.shelfWest.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await clickChoice(page, 'dialogue-choice-reject_water');
  await advanceDialogue(page);
  await skipExplainIfOpen(page);
  await interactAt(page, 'shop', WORLD_POS.crate.x, WORLD_POS.crate.y);
  await page.getByTestId('crate-ask-shopkeeper').click();
  await advanceDialogue(page);
  await advanceDialogue(page);
  await advanceDialogue(page);
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-shop-quest', 'helped');
}

export async function playToShopHelped(page: Page, name = 'علي حسن'): Promise<void> {
  await playToHelpAccepted(page, name);
  await completeShopVisit(page);
}

export async function enterParcelOffice(page: Page): Promise<void> {
  await interactAt(page, 'street', WORLD_POS.parcelDoor.x, WORLD_POS.parcelDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'parcel');
}

export async function briefParcelClerk(page: Page): Promise<void> {
  await interactAt(page, 'parcel', WORLD_POS.clerk.x, WORLD_POS.clerk.y);
  await expect(page.getByTestId('dialogue-text')).toContainText('مكتب طرود الرصيف');
  await advanceDialogue(page);
  await expect(page.getByTestId('dialogue-text')).toContainText('الحجز');
  await advanceDialogue(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
}

export async function talkCompanionOnParcel(page: Page): Promise<void> {
  await interactAt(page, 'parcel', 4 * 48 + 24, 6 * 48 + 24);
}

export async function fillCompleteInstruction(page: Page, parcel: 'r17' | 'r19'): Promise<void> {
  await page.getByTestId(`instruction-parcel-${parcel}`).click();
  await page.getByTestId('instruction-location-west').click();
  await page.getByTestId('instruction-constraints-repair_no_pay').click();
  await page.getByTestId('instruction-return-tag_to_desk').click();
}

export async function enterShop(page: Page): Promise<void> {
  await interactAt(page, 'street', WORLD_POS.shopDoor.x, WORLD_POS.shopDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'shop');
}

export async function advanceDialogue(page: Page): Promise<void> {
  const advance = page.getByTestId('dialogue-advance');
  await expect(advance).toBeVisible();
  await advance.click();
}

export async function clickChoice(page: Page, testId: string): Promise<void> {
  await page.getByTestId(testId).click();
}

export async function hearShopMango(page: Page): Promise<void> {
  await interactAt(page, 'shop', WORLD_POS.shopkeeper.x, WORLD_POS.shopkeeper.y);
  await expect(page.getByTestId('dialogue-text')).toBeVisible();
  await advanceDialogue(page);
  await expect(page.getByTestId('dialogue-text')).toContainText('عصير المانجو على الرف الأيسر');
  await advanceDialogue(page);
  await expect(page.getByTestId('dialogue-text')).toContainText('بطاقات الرفوف');
  await advanceDialogue(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-shop-quest', 'lookup');
}

export function collectConsoleText(page: Page): string[] {
  const lines: string[] = [];
  page.on('console', (message) => {
    lines.push(message.text());
  });
  return lines;
}
