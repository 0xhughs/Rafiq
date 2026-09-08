import { expect, type Page } from '@playwright/test';
import type { MapId, SerializedTestState } from '../src/engine/types';

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
  await teleport(page, map, x, y);
  await page.waitForTimeout(50);
  await pressInteract(page);
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
