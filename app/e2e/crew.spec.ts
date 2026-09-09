import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  ACCEPTED_TEXT,
  CRIT_ACCURACY_FAIL,
  CRIT_ACCURACY_OK,
  CRIT_COMPLETE,
  CRIT_RISK,
  CRIT_SOURCE,
  CRIT_TONE,
  HALL_NOTICE,
  HALL_NOTICE_FLAW,
  HANDOFF_TEXT,
  QUALITY_EMPTY,
  ROLES_EMPTY,
  SOURCE_TEXT,
  VERSION_EMPTY,
  VERSION_V1,
  VERSION_V2,
} from '../src/engine/crew';
import { SEND_RECEIPT } from '../src/engine/approval';
import { OBJECTIVES } from '../src/engine/dialogue';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToApprovalDone,
  skipExplainIfOpen,
  teleport,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/15');

test.setTimeout(240_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('approval-success through crew roles and quality review', async ({ page }) => {
  await playToApprovalDone(page);
  const afterApproval = await getState(page);
  expect(afterApproval.evidence['5.7']).toBe('demonstrated');
  expect(afterApproval.evidence['6.3']).toBe('demonstrated');
  expect(afterApproval.approvalQuest.approvalReady).toBe(true);
  expect(afterApproval.evidence['6.1']).toBeUndefined();
  expect(afterApproval.evidence['6.2']).toBeUndefined();
  expect(afterApproval.crewQuest.crewReady).toBe(false);
  expect(afterApproval.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-approval-ready', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-crew-ready', 'false');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '17');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.crewWork);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('skill-shelf')).toHaveText('رف المهارات');
  await expect(page.getByTestId('human-gate')).toHaveText('موافقة بشرية');
  await expect(page.getByTestId('crew-output')).toHaveCount(0);

  await teleport(page, 'workshop', WORLD_POS.workshopTalk.x, WORLD_POS.workshopTalk.y);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.crewDesk.x, WORLD_POS.crewDesk.y);
  await expect(page.getByTestId('crew-desk')).toBeVisible();
  await expect(page.getByTestId('crew-empty')).toHaveText(ROLES_EMPTY);
  await expect(page.getByTestId('crew-version')).toHaveText(VERSION_EMPTY);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /6\.2/);
  await expect(page.getByTestId('crew-desk')).not.toContainText('MCP');
  await expect(page.getByTestId('crew-desk')).not.toContainText('harness');

  await page.getByTestId('crew-assign-researcher').click();
  await page.getByTestId('crew-assign-builder').click();
  await page.getByTestId('crew-assign-reviewer').click();
  await expect(page.getByTestId('crew-roles')).toContainText('الباحث');
  await expect(page.getByTestId('crew-roles')).toContainText('البنّاء');
  await expect(page.getByTestId('crew-roles')).toContainText('المراجع');
  expect((await getState(page)).evidence['6.2']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'roles.png'), fullPage: true });

  await page.getByTestId('crew-owner-librarian').click();
  await page.getByTestId('crew-handoff-btn').click();
  await expect(page.getByTestId('crew-handoff')).toHaveText(HANDOFF_TEXT);
  await expect(page.getByTestId('crew-version')).toHaveText(VERSION_V1);
  await expect(page.getByTestId('crew-draft-evidence')).toContainText(HALL_NOTICE);
  await expect(page.getByTestId('crew-draft-evidence')).toContainText('NH-1447');
  await expect(page.getByTestId('crew-draft-conflict')).toContainText(HALL_NOTICE_FLAW);
  await expect(page.getByTestId('crew-draft-conflict')).toContainText('أغلبية الطاقم');
  expect((await getState(page)).evidence['6.2']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'conflict.png'), fullPage: true });

  await page.getByTestId('crew-inspect-source').click();
  await expect(page.getByTestId('crew-source')).toHaveText(SOURCE_TEXT);
  await expect(page.getByTestId('crew-source').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await page.getByTestId('crew-majority').click();
  await expect(page.getByTestId('crew-feedback')).toHaveText(
    'الأغلبية ليست دليلاً. اعتمد المسودة المسنودة.',
  );
  await page.getByTestId('crew-pick-evidence').click();
  await expect(page.getByTestId('crew-version')).toHaveText(VERSION_V2);
  await expect(page.getByTestId('crew-version')).toContainText('sat-10');
  await expect(page.getByTestId('crew-version')).toContainText('sun-16');
  await expect(page.getByTestId('crew-version')).toContainText('wed-18');
  await expect(page.getByTestId('crew-version')).toContainText('لا تعليق.');
  await expect(page.getByTestId('crew-version')).not.toContainText('thu-09');
  await expect(page.getByTestId('crew-version').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /6\.2/);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /6\.1/);
  const afterRoles = await getState(page);
  expect(afterApproval.approvalQuest.receiptText).toBe(afterRoles.approvalQuest.receiptText);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'version.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.qualityDesk.x, WORLD_POS.qualityDesk.y);
  await expect(page.getByTestId('crew-quality')).toBeVisible();
  await expect(page.getByTestId('crew-quality-empty')).toHaveText(QUALITY_EMPTY);
  expect((await getState(page)).evidence['6.1']).toBeUndefined();

  await page.getByTestId('crew-open-criteria').click();
  await expect(page.getByTestId('crew-output-draft')).toHaveText(HALL_NOTICE_FLAW);
  await expect(page.getByTestId('crew-crit-accuracy')).toHaveText(CRIT_ACCURACY_FAIL);
  await expect(page.getByTestId('crew-crit-source')).toHaveText(CRIT_SOURCE);
  await expect(page.getByTestId('crew-crit-tone')).toHaveText(CRIT_TONE);
  await expect(page.getByTestId('crew-crit-complete')).toHaveText(CRIT_COMPLETE);
  await expect(page.getByTestId('crew-crit-risk')).toHaveText(CRIT_RISK);
  expect((await getState(page)).evidence['6.1']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'criteria.png'), fullPage: true });

  await page.getByTestId('crew-repair-accuracy').click();
  await expect(page.getByTestId('crew-crit-accuracy')).toHaveText(CRIT_ACCURACY_OK);
  await expect(page.getByTestId('crew-output-draft')).toHaveText(HALL_NOTICE);
  await expect(page.getByTestId('crew-output-draft')).not.toContainText('thu-09');
  expect((await getState(page)).evidence['6.1']).toBeUndefined();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'repair.png'), fullPage: true });

  await page.getByTestId('crew-accept').click();
  await expect(page.getByTestId('crew-accepted')).toHaveText(ACCEPTED_TEXT);
  await expect(page.getByTestId('crew-accepted')).not.toContainText('thu-09');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /6\.1/);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-crew-ready', 'true');
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['6.1']).toBe('demonstrated');
  expect(done.evidence['6.2']).toBe('demonstrated');
  expect(done.crewQuest.crewReady).toBe(true);
  expect(done.approvalQuest.receiptText).toBe(SEND_RECEIPT);
  expect(JSON.stringify(done)).not.toMatch(/MCP/);
  expect(JSON.stringify(done)).not.toMatch(/harness/);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('skill-shelf')).toHaveText('رف المهارات');
  await expect(page.getByTestId('human-gate')).toHaveText('موافقة بشرية');
  await expect(page.getByTestId('crew-output')).toHaveText('ناتج مُراجع');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.pathWork);

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /عُيّن باحث وبنّاء ومراجع بمالك واحد، وحُسم خلاف المسودة بدليل السجل لا بالأغلبية، ثم أُصلحت الدقة وقُبلت نشرة القاعة/,
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText(/الطاقم|الناتج|الجودة/);
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /أغلبية الطاقم تقرر الحقيقة|معيار فاشل يُقبل/,
  );
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('harness');
});

test('crew overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToApprovalDone(page);
  await interactAt(page, 'workshop', WORLD_POS.crewDesk.x, WORLD_POS.crewDesk.y);
  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('crew-desk');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('crew-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.qualityDesk.x, WORLD_POS.qualityDesk.y);
  const quality = page.getByTestId('crew-quality');
  await expect(quality).toBeVisible();
  const qualityBox = await quality.locator('.instruction-card').boundingBox();
  expect(qualityBox).not.toBeNull();
  if (qualityBox) {
    expect(qualityBox.x).toBeGreaterThanOrEqual(0);
    expect(qualityBox.y).toBeGreaterThanOrEqual(0);
    expect(qualityBox.x + qualityBox.width).toBeLessThanOrEqual(1921);
    expect(qualityBox.y + qualityBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
