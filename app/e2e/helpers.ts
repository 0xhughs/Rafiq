import { expect, type Page } from '@playwright/test';
import { WORLD_POS } from '../src/engine/maps';
import type { GameAction, MapId, SerializedTestState } from '../src/engine/types';
import { EVIDENCE_IDS } from '../src/engine/types';

export async function waitForGame(page: Page): Promise<void> {
  await page.waitForFunction(() => Boolean(window.__RAFIQ_TEST__));
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
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
  await page.evaluate(() => {
    const api = window.__RAFIQ_TEST__;
    if (!api) throw new Error('missing __RAFIQ_TEST__');
    api.dispatch({ type: 'INTERACT' });
  });
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
  const root = page.getByTestId('game-root');
  const skip = page.getByTestId('explain-skip');
  for (let i = 0; i < 10; i += 1) {
    const mode = await root.getAttribute('data-mode');
    if (mode === 'explain' || (await skip.isVisible().catch(() => false))) {
      await skip.click();
      await expect(root).toHaveAttribute('data-mode', 'playing');
      return;
    }
    if (mode === 'playing') return;
    await page.waitForTimeout(40);
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

export async function playToParcelDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToShopHelped(page, name);
  await enterParcelOffice(page);
  await briefParcelClerk(page);
  await talkCompanionOnParcel(page);
  await clickChoice(page, 'dialogue-choice-delegate_retrieve');
  await clickChoice(page, 'dialogue-choice-stop_overbroad');
  await page.getByTestId('dialogue-advance').click();
  await skipExplainIfOpen(page);
  await interactAt(page, 'parcel', WORLD_POS.instructionDesk.x, WORLD_POS.instructionDesk.y);
  await page.getByTestId('instruction-ambiguous').click();
  await fillCompleteInstruction(page, 'r19');
  await page.getByTestId('instruction-send').click();
  await page.getByTestId('dialogue-advance').click();
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  const done = await getState(page);
  expect(done.parcelQuest.commsRepaired).toBe(true);
}

export async function playToArchiveDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToParcelDone(page, name);
  await enterArchive(page);
  await interactAt(page, 'archive', WORLD_POS.contextBench.x, WORLD_POS.contextBench.y);
  await page.getByTestId('context-load-constraint').click();
  await page.getByTestId('context-load-hold').click();
  await page.getByTestId('context-recite').click();
  await page.getByTestId('context-close').click();
  await skipExplainIfOpen(page);
  await interactAt(page, 'archive', WORLD_POS.communityFile.x, WORLD_POS.communityFile.y);
  await page.getByTestId('redact-name_noura').click();
  await page.getByTestId('redact-name_khalid').click();
  await page.getByTestId('redact-phone').click();
  await page.getByTestId('redact-address').click();
  await page.getByTestId('redact-give').click();
  await page.getByTestId('redact-close').click();
  await skipExplainIfOpen(page);
  await interactAt(page, 'archive', WORLD_POS.packTable.x, WORLD_POS.packTable.y);
  await page.getByTestId('pack-toggle-spec').click();
  await page.getByTestId('pack-toggle-delivery').click();
  await page.getByTestId('pack-stamp-rafiq_repair').click();
  await page.getByTestId('pack-assemble').click();
  await page.getByTestId('pack-close').click();
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('context-module')).toHaveText('وحدة السياق');
}

export async function enterNewsroom(page: Page): Promise<void> {
  const before = await getState(page);
  expect(before.libraryQuest.contextModule).toBe(true);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await interactAt(page, 'street', WORLD_POS.newsroomDoor.x, WORLD_POS.newsroomDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'newsroom');
}

export async function playToNewsroomDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToArchiveDone(page, name);
  await enterNewsroom(page);
  await interactAt(page, 'newsroom', WORLD_POS.sourceBulletin.x, WORLD_POS.sourceBulletin.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.sourcePoster.x, WORLD_POS.sourcePoster.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.compareDesk.x, WORLD_POS.compareDesk.y);
  await page.getByTestId('compare-namedBulletin').click();
  await page.getByTestId('compare-namedPoster').click();
  await page.getByTestId('compare-hoursA').click();
  await page.getByTestId('compare-hoursB').click();
  await page.getByTestId('compare-accessA').click();
  await page.getByTestId('compare-accessB').click();
  await page.getByTestId('compare-submit').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'newsroom', WORLD_POS.clippingBoard.x, WORLD_POS.clippingBoard.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'newsroom', WORLD_POS.originalDrawer.x, WORLD_POS.originalDrawer.y);
  await page.getByTestId('verify-original').click();
  await skipExplainIfOpen(page);
  await interactAt(page, 'newsroom', WORLD_POS.draftTable.x, WORLD_POS.draftTable.y);
  await page.getByTestId('draft-mark-always_open').click();
  await page.getByTestId('draft-correct-always_open').click();
  await page.getByTestId('draft-correct-midnight_hold').click();
  await page.getByTestId('draft-correct-no_written').click();
  await page.getByTestId('draft-release').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'newsroom', WORLD_POS.voiceDesk.x, WORLD_POS.voiceDesk.y);
  await page.getByTestId('voice-editor').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'newsroom', WORLD_POS.letterDesk.x, WORLD_POS.letterDesk.y);
  await page.getByTestId('letter-recipient-workshop_manager').click();
  await page.getByTestId('letter-purpose-inspection').click();
  await page.getByTestId('letter-tone-clear_polite').click();
  await page.getByTestId('letter-body-ok').click();
  await page.getByTestId('letter-review').click();
  await page.getByTestId('letter-send-player').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-lead', 'true');
  const done = await getState(page);
  expect(done.evidence['3.4']).toBeUndefined();
  expect(done.evidence['3.5']).toBeUndefined();
  expect(done.festivalQuest.workshopMaterials).toBe(false);
  expect(done.festivalQuest.workshopDoorOpen).toBe(false);
}

export async function enterFestival(page: Page): Promise<void> {
  const before = await getState(page);
  expect(before.newsroomQuest.workshopLead).toBe(true);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await interactAt(page, 'street', WORLD_POS.festivalDoor.x, WORLD_POS.festivalDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'festival');
}

export async function playToFestivalDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToNewsroomDone(page, name);
  await enterFestival(page);
  await interactAt(page, 'festival', WORLD_POS.officer.x, WORLD_POS.officer.y);
  await page.getByTestId('dialogue-advance').click();
  await page.getByTestId('dialogue-advance').click();
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await interactAt(page, 'festival', WORLD_POS.stockTable.x, WORLD_POS.stockTable.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'festival', WORLD_POS.receiptsDesk.x, WORLD_POS.receiptsDesk.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'festival', WORLD_POS.reconcileDesk.x, WORLD_POS.reconcileDesk.y);
  await page.getByTestId('reconcile-flags-match').click();
  await page.getByTestId('reconcile-cloth-match').click();
  await page.getByTestId('reconcile-water-receipt').click();
  await page.getByTestId('reconcile-cups-unknown').click();
  await page.getByTestId('reconcile-sum').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'festival', WORLD_POS.policyBoard.x, WORLD_POS.policyBoard.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'festival', WORLD_POS.submitDesk.x, WORLD_POS.submitDesk.y);
  await page.getByTestId('submit-figures-human').click();
  await page.getByTestId('submit-stamp').click();
  await page.getByTestId('submit-send-player').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-workshop-materials', 'true');
  const done = await getState(page);
  expect(done.evidence['3.4']).toBe('demonstrated');
  expect(done.evidence['3.5']).toBe('demonstrated');
  expect(done.festivalQuest.workshopMaterials).toBe(true);
  expect(done.evidence['4.1']).toBeUndefined();
  expect(done.evidence['4.2']).toBeUndefined();
  expect(done.workshopQuest.servicePosted).toBe(false);
}

export async function enterWorkshop(page: Page): Promise<void> {
  const before = await getState(page);
  expect(before.festivalQuest.workshopMaterials).toBe(true);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await interactAt(page, 'street', WORLD_POS.workshopDoor.x, WORLD_POS.workshopDoor.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'workshop');
}

export async function enterArchive(page: Page): Promise<void> {
  const before = await getState(page);
  expect(before.parcelQuest.commsRepaired).toBe(true);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-mode', 'playing');
  await interactAt(page, 'library', WORLD_POS.libraryInner.x, WORLD_POS.libraryInner.y);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-map', 'archive');
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

export async function playToWorkshopDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToFestivalDone(page, name);
  await enterWorkshop(page);
  await interactAt(page, 'workshop', WORLD_POS.needSlip.x, WORLD_POS.needSlip.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'workshop', WORLD_POS.briefDesk.x, WORLD_POS.briefDesk.y);
  await page.getByTestId('brief-screens-ok').click();
  await page.getByTestId('brief-constraints-ok').click();
  await page.getByTestId('brief-exclusions-ok').click();
  await page.getByTestId('brief-acceptance-ok').click();
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
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.appointmentBoard.x, WORLD_POS.appointmentBoard.y);
  await page.getByTestId('board-book-sunday').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.workshopQuest.servicePosted).toBe(true);
  expect(done.evidence['4.1']).toBe('demonstrated');
  expect(done.evidence['4.2']).toBe('demonstrated');
  expect(done.evidence['4.3']).toBeUndefined();
  expect(done.evidence['4.4']).toBeUndefined();
  expect(done.evidence['4.5']).toBeUndefined();
  expect(done.evidence['4.6']).toBeUndefined();
  expect(done.evidence['5.4']).toBeUndefined();
  expect(done.kioskQuest.kioskReady).toBe(false);
}

export async function playToKioskDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToWorkshopDone(page, name);
  await interactAt(page, 'workshop', WORLD_POS.kioskDocs.x, WORLD_POS.kioskDocs.y);
  await page.getByTestId('inspect-close').click();
  await interactAt(page, 'workshop', WORLD_POS.kioskFace.x, WORLD_POS.kioskFace.y);
  await page.getByTestId('kiosk-send').click();
  await page.getByTestId('kiosk-strip').click();
  await page.getByTestId('kiosk-send').click();
  await page.getByTestId('kiosk-move-vault').click();
  await page.getByTestId('kiosk-send').click();
  await page.getByTestId('kiosk-set-rtl').click();
  await page.getByTestId('kiosk-isolate').click();
  await page.getByTestId('kiosk-lookup-sunday').click();
  await page.getByTestId('kiosk-check-title').click();
  await page.getByTestId('kiosk-check-slot').click();
  await page.getByTestId('kiosk-check-lookup').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.kioskQuest.kioskReady).toBe(true);
  expect(done.evidence['4.3']).toBe('demonstrated');
  expect(done.evidence['4.4']).toBe('demonstrated');
  expect(done.evidence['4.5']).toBeUndefined();
  expect(done.evidence['4.6']).toBeUndefined();
  expect(done.evidence['5.4']).toBeUndefined();
  expect(done.labQuest.labReady).toBe(false);
}

export async function playToLabDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToKioskDone(page, name);
  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await page.getByTestId('lab-lookup').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.labTerminal.x, WORLD_POS.labTerminal.y);
  await page.getByTestId('lab-ls').click();
  await page.getByTestId('lab-cat-preview-log').click();
  await page.getByTestId('lab-cat-prod-log').click();
  await page.getByTestId('lab-select-prod-log').click();
  await page.getByTestId('lab-patch-prod').click();
  await page.getByTestId('lab-rm').click();
  await page.getByTestId('lab-publish').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.labProd.x, WORLD_POS.labProd.y);
  await page.getByTestId('lab-lookup').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.evidence['4.5']).toBe('demonstrated');
  expect(done.evidence['4.6']).toBe('demonstrated');
  expect(done.evidence['5.4']).toBe('demonstrated');
  expect(done.labQuest.labReady).toBe(true);
  expect(done.evidence['5.1']).toBeUndefined();
  expect(done.evidence['5.2']).toBeUndefined();
  expect(done.agentQuest.agentReady).toBe(false);
}

export async function playToAgentDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToLabDone(page, name);
  await interactAt(page, 'workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y);
  await expect(page.getByTestId('agent-board-text')).toBeVisible();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  await page.getByTestId('agent-chat-plan').click();
  await page.getByTestId('agent-job-slots').click();
  await page.getByTestId('agent-goal-slots').click();
  await page.getByTestId('agent-tool-read').click();
  await page.getByTestId('agent-tool-write').click();
  await page.getByTestId('agent-tool-verify').click();
  await page.getByTestId('agent-success-slots').click();
  await page.getByTestId('agent-stop-budget3').click();
  await page.getByTestId('agent-job-shelf').click();
  await page.getByTestId('agent-run').click();
  await page.getByTestId('agent-job-slots').click();
  await page.getByTestId('agent-run').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.agentBoard.x, WORLD_POS.agentBoard.y);
  await expect(page.getByTestId('agent-board-text')).toContainText('sun-pm');
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.agentConsole.x, WORLD_POS.agentConsole.y);
  await page.getByTestId('agent-extra-step').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.evidence['5.1']).toBe('demonstrated');
  expect(done.evidence['5.2']).toBe('demonstrated');
  expect(done.agentQuest.agentReady).toBe(true);
  expect(done.evidence['5.3']).toBeUndefined();
  expect(done.bridgeQuest.bridgeReady).toBe(false);
}

export async function playToBridgeDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToAgentDone(page, name);
  await interactAt(page, 'workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y);
  await page.getByTestId('bridge-connect').click();
  await page.getByTestId('bridge-list-tools').click();
  await page.getByTestId('bridge-list-resources').click();
  await page.getByTestId('bridge-grant-lookup').click();
  await page.getByTestId('bridge-grant-draft').click();
  await page.getByTestId('bridge-grant-week').click();
  await page.getByTestId('bridge-lookup').click();
  await page.getByTestId('bridge-save-draft').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.bridgeBrowser.x, WORLD_POS.bridgeBrowser.y);
  await page.getByTestId('bridge-browser-save').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y);
  await page.getByTestId('bridge-invoke-rewrite').click();
  await page.getByTestId('bridge-invoke-pay').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.evidence['5.3']).toBe('demonstrated');
  expect(done.bridgeQuest.bridgeReady).toBe(true);
  expect(done.evidence['5.5']).toBeUndefined();
  expect(done.evidence['5.6']).toBeUndefined();
  expect(done.skillQuest.skillReady).toBe(false);
}

export async function playToSkillDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToBridgeDone(page, name);
  await interactAt(page, 'workshop', WORLD_POS.skillBench.x, WORLD_POS.skillBench.y);
  await page.getByTestId('skill-oneshot').click();
  await page.getByTestId('skill-correct').click();
  await page.getByTestId('skill-standing').click();
  await page.getByTestId('skill-trigger-hours').click();
  await page.getByTestId('skill-input-record').click();
  await page.getByTestId('skill-steps-lookup-format').click();
  await page.getByTestId('skill-output-draft').click();
  await page.getByTestId('skill-stop-unknown').click();
  await page.getByTestId('skill-save').click();
  await page.getByTestId('skill-trial-second').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.skillClock.x, WORLD_POS.skillClock.y);
  await page.getByTestId('skill-schedule-sun8').click();
  await page.getByTestId('skill-arm').click();
  await page.getByTestId('skill-tick-sun8').click();
  await page.getByTestId('skill-pause').click();
  await page.getByTestId('skill-tick-sun8').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.evidence['5.5']).toBe('demonstrated');
  expect(done.evidence['5.6']).toBe('demonstrated');
  expect(done.skillQuest.skillReady).toBe(true);
  expect(done.evidence['5.7']).toBeUndefined();
  expect(done.evidence['6.3']).toBeUndefined();
  expect(done.approvalQuest.approvalReady).toBe(false);
}

export async function playToApprovalDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToSkillDone(page, name);
  await interactAt(page, 'workshop', WORLD_POS.approveDesk.x, WORLD_POS.approveDesk.y);
  await page.getByTestId('approve-prepare').click();
  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-reject').click();
  await page.getByTestId('approve-recipient-librarian').click();
  await page.getByTestId('approve-payload-exact').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(
    'بعد التعديل أعد المراجعة. لا إرسال صامت.',
  );
  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-receipt')).toBeVisible();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.decisionDesk.x, WORLD_POS.decisionDesk.y);
  await page.getByTestId('approve-case-prepare').click();
  await page.getByTestId('approve-case-auto').click();
  await page.getByTestId('approve-case-majority').click();
  await page.getByTestId('approve-case-keep').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.evidence['5.7']).toBe('demonstrated');
  expect(done.evidence['6.3']).toBe('demonstrated');
  expect(done.approvalQuest.approvalReady).toBe(true);
  expect(done.evidence['6.1']).toBeUndefined();
  expect(done.evidence['6.2']).toBeUndefined();
  expect(done.crewQuest.crewReady).toBe(false);
}

export async function playToCrewDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToApprovalDone(page, name);
  await interactAt(page, 'workshop', WORLD_POS.crewDesk.x, WORLD_POS.crewDesk.y);
  await page.getByTestId('crew-assign-researcher').click();
  await page.getByTestId('crew-assign-builder').click();
  await page.getByTestId('crew-assign-reviewer').click();
  await page.getByTestId('crew-owner-librarian').click();
  await page.getByTestId('crew-handoff-btn').click();
  await page.getByTestId('crew-inspect-source').click();
  await page.getByTestId('crew-majority').click();
  await page.getByTestId('crew-pick-evidence').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.qualityDesk.x, WORLD_POS.qualityDesk.y);
  await page.getByTestId('crew-open-criteria').click();
  await page.getByTestId('crew-repair-accuracy').click();
  await page.getByTestId('crew-accept').click();
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
  const done = await getState(page);
  expect(done.evidence['6.1']).toBe('demonstrated');
  expect(done.evidence['6.2']).toBe('demonstrated');
  expect(done.crewQuest.crewReady).toBe(true);
  expect(done.evidence['6.4']).toBeUndefined();
  expect(done.pathQuest.restored).toBe(false);
}

export async function completePathQuest(page: Page): Promise<void> {
  await interactAt(page, 'workshop', WORLD_POS.pathDesk.x, WORLD_POS.pathDesk.y);
  await page.getByTestId('path-inspect-source').click();
  await page.getByTestId('path-refuse-rumor').click();
  await page.getByTestId('path-goal-reading').click();
  await page.getByTestId('path-tools-safe').click();
  await page.getByTestId('path-stop-budget').click();
  await page.getByTestId('path-load-reading').click();
  await page.getByTestId('path-run-skill').click();
  await page.getByTestId('path-extra-step').click();
  await closeOverlay(page);
  await skipExplainIfOpen(page);
  await interactAt(page, 'workshop', WORLD_POS.sealDesk.x, WORLD_POS.sealDesk.y);
  await page.getByTestId('path-prepare').click();
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-reject').click();
  await page.getByTestId('path-recipient-librarian').click();
  await page.getByTestId('path-payload-exact').click();
  await page.getByTestId('path-confirm').click();
  await page.getByTestId('path-inspect-send').click();
  await page.getByTestId('path-confirm').click();
  await closeOverlay(page);
  await skipExplainIfOpen(page);
}

export async function playToPathDone(page: Page, name = 'علي حسن'): Promise<void> {
  await playToCrewDone(page, name);
  await completePathQuest(page);
  const done = await getState(page);
  expect(done.pathQuest.restored).toBe(true);
  expect(done.evidence['6.4']).toBe('demonstrated');
  for (const id of EVIDENCE_IDS) {
    expect(done.evidence[id], id).toBe('demonstrated');
  }
  expect(done.endingState).toBe('in_progress');
  expect(done.passportQuest.issued).toBe(false);
  expect(done.passportQuest.thanksHeard).toBe(false);
  await expect(page.getByTestId('certificate')).toHaveCount(0);
  await expect(page.getByTestId('open-passport')).toHaveCount(0);
}

