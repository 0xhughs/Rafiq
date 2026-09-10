import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  CASE_CONTEXT,
  CASE_EMPTY,
  CASE_RESULT,
  CASE_WAIT,
  SEND_EMPTY,
  SEND_RECEIPT,
} from '../src/engine/approval';
import { OBJECTIVES } from '../src/engine/dialogue';
import { TRAY_SUN } from '../src/engine/skill';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToSkillDone,
  skipExplainIfOpen,
  teleport,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/14');

test.setTimeout(240_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('skill-success through human send approval and personal clinic decision', async ({ page }) => {
  await playToSkillDone(page);
  const afterSkill = await getState(page);
  expect(afterSkill.evidence['5.5']).toBe('demonstrated');
  expect(afterSkill.evidence['5.6']).toBe('demonstrated');
  expect(afterSkill.skillQuest.skillReady).toBe(true);
  expect(afterSkill.evidence['5.7']).toBeUndefined();
  expect(afterSkill.evidence['6.3']).toBeUndefined();
  expect(afterSkill.approvalQuest.approvalReady).toBe(false);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-skill-ready', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-approval-ready', 'false');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.approvalWork);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('skill-shelf')).toHaveText('رف المهارات');
  await expect(page.getByTestId('human-gate')).toHaveCount(0);

  await teleport(page, 'workshop', WORLD_POS.workshopTalk.x, WORLD_POS.workshopTalk.y);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.approveDesk.x, WORLD_POS.approveDesk.y);
  await expect(page.getByTestId('approve-desk')).toBeVisible();
  await expect(page.getByTestId('approve-prepared')).toHaveText(SEND_EMPTY);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.7/);
  await expect(page.getByTestId('approve-desk')).not.toContainText('MCP');
  await expect(page.getByTestId('approve-desk')).not.toContainText('harness');
  await expect(page.getByTestId('approve-receipt')).toHaveCount(0);

  await page.getByTestId('approve-prepare').click();
  await expect(page.getByTestId('approve-prepared')).toHaveCount(0);
  await expect(page.getByTestId('approve-recipient-neighbors')).toBeVisible();
  const afterPrepare = await getState(page);
  expect(afterPrepare.approvalQuest.recipient).toBe('neighbors');
  expect(afterPrepare.approvalQuest.payload).toBe('exact');
  expect(afterPrepare.evidence['5.7']).toBeUndefined();
  expect(afterPrepare.skillQuest.trayText).toBe(TRAY_SUN);
  await expect(page.getByTestId('approve-receipt')).toHaveCount(0);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'prepare.png'), fullPage: true });

  await page.getByTestId('approve-inspect').click();
  await expect(page.getByTestId('approve-review')).toContainText('كل الجيران');
  await expect(page.getByTestId('approve-review')).toContainText('sat-10');
  await expect(page.getByTestId('approve-review').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  const afterInspect = await getState(page);
  expect(afterInspect.evidence['5.7']).toBeUndefined();

  await page.getByTestId('approve-reject').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(
    'رُفض الإرسال الخاطئ. عدّل المستلم والحمولة ثم راجع من جديد.',
  );
  await expect(page.getByTestId('approve-receipt')).toHaveCount(0);
  const afterReject = await getState(page);
  expect(afterReject.approvalQuest.rejectedWrong).toBe(true);
  expect(afterReject.approvalQuest.bulletinSent).toBe(false);
  expect(afterReject.evidence['5.7']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'reject.png'), fullPage: true });

  await page.getByTestId('approve-recipient-librarian').click();
  await page.getByTestId('approve-payload-exact').click();
  const afterEdit = await getState(page);
  expect(afterEdit.approvalQuest.needsRereview).toBe(true);
  expect(afterEdit.approvalQuest.inspectedSend).toBe(false);
  expect(afterEdit.approvalQuest.bulletinSent).toBe(false);
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(
    'بعد التعديل أعد المراجعة. لا إرسال صامت.',
  );
  expect((await getState(page)).evidence['5.7']).toBeUndefined();

  await page.getByTestId('approve-inspect').click();
  await page.getByTestId('approve-confirm').click();
  await expect(page.getByTestId('approve-receipt')).toHaveText(SEND_RECEIPT);
  await expect(page.getByTestId('approve-receipt')).toContainText('sat-10');
  await expect(page.getByTestId('approve-receipt')).toContainText('sun-16');
  await expect(page.getByTestId('approve-receipt')).toContainText('wed-18');
  await expect(page.getByTestId('approve-receipt')).toContainText('لا تعليق.');
  await expect(page.getByTestId('approve-receipt')).not.toContainText('thu-09');
  await expect(page.getByTestId('approve-receipt').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.7/);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /6\.3/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'receipt.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.decisionDesk.x, WORLD_POS.decisionDesk.y);
  await expect(page.getByTestId('approve-case')).toBeVisible();
  await expect(page.getByTestId('approve-case-empty')).toHaveText(CASE_EMPTY);
  await expect(page.getByTestId('approve-receipt')).toHaveCount(0);
  const openedCase = await getState(page);
  expect(openedCase.evidence['6.3']).toBeUndefined();

  await page.getByTestId('approve-case-prepare').click();
  await expect(page.getByTestId('approve-case-context')).toHaveText(CASE_CONTEXT);
  await expect(page.getByTestId('approve-case-wait')).toHaveText(CASE_WAIT);
  await expect(page.getByTestId('approve-case-context').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  expect((await getState(page)).evidence['6.3']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'case.png'), fullPage: true });

  await page.getByTestId('approve-case-auto').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(
    'القرار الشخصي لا يُؤتمت. أبقه عند إنسان مسؤول.',
  );
  await page.getByTestId('approve-case-majority').click();
  await expect(page.getByTestId('approve-feedback')).toHaveText(
    'الأغلبية ليست قراراً مسؤولاً عن عيادة طفل.',
  );
  await page.getByTestId('approve-case-keep').click();
  await expect(page.getByTestId('approve-case-result')).toHaveText(CASE_RESULT);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /6\.3/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-approval-ready', 'true');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'decide.png'), fullPage: true });
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['5.7']).toBe('demonstrated');
  expect(done.evidence['6.3']).toBe('demonstrated');
  expect(done.approvalQuest.approvalReady).toBe(true);
  expect(JSON.stringify(done)).not.toMatch(/MCP/);
  expect(JSON.stringify(done)).not.toMatch(/harness/);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('skill-shelf')).toHaveText('رف المهارات');
  await expect(page.getByTestId('human-gate')).toHaveText('موافقة بشرية');
  await expect(page.getByTestId('crew-output')).toHaveCount(0);
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.crewWork);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-crew-ready', 'false');

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /رُفض إرسال خاطئ ثم وُوفق على نشرة القاعة إلى أمينة القاعة، وقرار عيادة ليان بقي عند إنسان/,
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText(/الموافقة|القرار|الإرسال/);
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /الموافقة الآلية تكفي|أغلبية الجيران تقرر/,
  );
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('harness');
});

test('approval overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToSkillDone(page);
  await interactAt(page, 'workshop', WORLD_POS.approveDesk.x, WORLD_POS.approveDesk.y);
  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('approve-desk');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('approve-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.decisionDesk.x, WORLD_POS.decisionDesk.y);
  const caseCard = page.getByTestId('approve-case');
  await expect(caseCard).toBeVisible();
  const caseBox = await caseCard.locator('.instruction-card').boundingBox();
  expect(caseBox).not.toBeNull();
  if (caseBox) {
    expect(caseBox.x).toBeGreaterThanOrEqual(0);
    expect(caseBox.y).toBeGreaterThanOrEqual(0);
    expect(caseBox.x + caseBox.width).toBeLessThanOrEqual(1921);
    expect(caseBox.y + caseBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
