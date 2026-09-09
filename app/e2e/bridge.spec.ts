import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_POS } from '../src/engine/maps';
import {
  BRIDGE_CLIENT,
  BRIDGE_FEEDBACK,
  BRIDGE_HOST,
  BRIDGE_SERVER,
  BROWSER_PATH,
  BROWSER_TITLE,
  DRAFT_EMPTY,
  DRAFT_SAVED,
  MCP_NOTE,
  RECORD_NH,
  RESOURCE_PAYROLL,
  RESOURCE_WEEK,
  TOOL_LOOKUP,
  TOOL_REWRITE,
  TOOL_SAVE,
} from '../src/engine/bridge';
import { OBJECTIVES } from '../src/engine/dialogue';
import {
  assertNoLessonUi,
  dispatch,
  getState,
  interactAt,
  playToAgentDone,
  skipExplainIfOpen,
} from './helpers';

const evidenceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../evidence/12');

test.setTimeout(240_000);

test.beforeAll(() => {
  fs.mkdirSync(evidenceDir, { recursive: true });
});

async function closeThenSkip(page: Parameters<typeof skipExplainIfOpen>[0]): Promise<void> {
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await skipExplainIfOpen(page);
}

test('agent-success through civic connector with physical actions', async ({ page }) => {
  await playToAgentDone(page);
  const afterAgent = await getState(page);
  expect(afterAgent.evidence['5.1']).toBe('demonstrated');
  expect(afterAgent.evidence['5.2']).toBe('demonstrated');
  expect(afterAgent.agentQuest.agentReady).toBe(true);
  expect(afterAgent.evidence['5.3']).toBeUndefined();
  expect(afterAgent.bridgeQuest.bridgeReady).toBe(false);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-agent-ready', 'true');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-bridge-ready', 'false');
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-slice', '14');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.bridgeWork);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');

  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'interior.png'), fullPage: true });

  await interactAt(page, 'workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y);
  await expect(page.getByTestId('bridge-host')).toBeVisible();
  await expect(page.getByTestId('bridge-draft-text')).toHaveText(DRAFT_EMPTY);
  await expect(page.getByTestId('game-root')).not.toHaveAttribute('data-evidence', /5\.3/);

  await page.getByTestId('bridge-connect').click();
  await expect(page.getByTestId('bridge-host-name')).toHaveText(BRIDGE_HOST);
  await expect(page.getByTestId('bridge-client-name')).toHaveText(BRIDGE_CLIENT);
  await expect(page.getByTestId('bridge-server-name')).toHaveText(BRIDGE_SERVER);
  await expect(page.getByTestId('bridge-mcp-note')).toHaveText(MCP_NOTE);
  await expect(page.getByTestId('bridge-host-name')).toHaveCSS('direction', 'ltr');
  await expect(page.getByTestId('bridge-mcp-note').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'connect.png'), fullPage: true });

  await page.getByTestId('bridge-list-tools').click();
  await expect(page.getByTestId('bridge-tools-list')).toContainText(TOOL_LOOKUP);
  await expect(page.getByTestId('bridge-tools-list')).toContainText(TOOL_SAVE);
  await expect(page.getByTestId('bridge-tools-list')).toContainText(TOOL_REWRITE);
  await expect(page.getByTestId('bridge-tools-list').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'tools.png'), fullPage: true });

  await page.getByTestId('bridge-list-resources').click();
  await expect(page.getByTestId('bridge-resources-list')).toContainText(RESOURCE_WEEK);
  await expect(page.getByTestId('bridge-resources-list')).toContainText(RESOURCE_PAYROLL);

  await page.getByTestId('bridge-grant-lookup').click();
  await page.getByTestId('bridge-grant-draft').click();
  await page.getByTestId('bridge-grant-week').click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'grant.png'), fullPage: true });

  await page.getByTestId('bridge-lookup').click();
  await expect(page.getByTestId('bridge-lookup-result')).toContainText('sat-10');
  await expect(page.getByTestId('bridge-lookup-result')).toContainText('sun-16');
  await expect(page.getByTestId('bridge-lookup-result')).toContainText('wed-18');
  await expect(page.getByTestId('bridge-lookup-result').locator('.path-ltr').first()).toHaveCSS(
    'direction',
    'ltr',
  );
  await expect(page.getByTestId('bridge-lookup')).toContainText(RECORD_NH);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'lookup.png'), fullPage: true });

  await page.getByTestId('bridge-save-draft').click();
  await expect(page.getByTestId('bridge-draft-text')).toHaveText(DRAFT_SAVED);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-evidence', /5\.3/);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'draft.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.bridgeBrowser.x, WORLD_POS.bridgeBrowser.y);
  await expect(page.getByTestId('bridge-browser')).toBeVisible();
  await expect(page.getByTestId('bridge-browser')).toContainText(BROWSER_TITLE);
  await expect(page.getByTestId('bridge-browser')).toContainText(BROWSER_PATH);
  await expect(page.getByTestId('bridge-browser-page')).toContainText('sat-10');
  await expect(page.getByTestId('bridge-browser-page')).toContainText('sun-16');
  await expect(page.getByTestId('bridge-browser-page')).toContainText('wed-18');
  await page.getByTestId('bridge-browser-save').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.browserSave);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'browser.png'), fullPage: true });
  await closeThenSkip(page);

  await interactAt(page, 'workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y);
  await page.getByTestId('bridge-invoke-rewrite').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.deniedRewrite);
  await expect(page.getByTestId('bridge-draft-text')).toHaveText(DRAFT_SAVED);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'denied.png'), fullPage: true });
  await page.getByTestId('bridge-invoke-pay').click();
  await expect(page.getByTestId('bridge-feedback')).toHaveText(BRIDGE_FEEDBACK.missingPay);
  await expect(page.getByTestId('game-root')).toHaveAttribute('data-bridge-ready', 'true');
  await closeThenSkip(page);

  const done = await getState(page);
  expect(done.evidence['5.3']).toBe('demonstrated');
  expect(done.bridgeQuest.bridgeReady).toBe(true);
  expect(done.evidence['5.5']).toBeUndefined();
  expect(done.evidence['5.6']).toBeUndefined();
  expect(done.skillQuest.skillReady).toBe(false);
  await expect(page.getByTestId('planning-core')).toHaveText('نواة التخطيط');
  await expect(page.getByTestId('civic-connector')).toHaveText('موصل السجل');
  await expect(page.getByTestId('hud-objective')).toHaveText(OBJECTIVES.skillWork);
  await expect(page.getByTestId('skill-shelf')).toHaveCount(0);

  await interactAt(page, 'workshop', WORLD_POS.manager.x, WORLD_POS.manager.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(
    /مسودة ساعات قاعة الحي حُفظت من NH-1447 عبر موصل محدود/,
  );
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'success.png'), fullPage: true });
  await page.getByTestId('dialogue-advance').click();

  await page.getByTestId('help-button').click();
  await expect(page.getByTestId('journal-events')).toContainText(/الموصل|مسودة/);
  await page.getByTestId('resume-button').click();

  await interactAt(page, 'street', WORLD_POS.robot.x, WORLD_POS.robot.y);
  await expect(page.getByTestId('dialogue-text')).toContainText(/MCP مهارة تُحمَّل|الربط يفتح كل الأدوات/);
  await assertNoLessonUi(page);
  await expect(page.locator('body')).not.toContainText('امتحان');
  await expect(page.locator('body')).not.toContainText('harness');
});

test('bridge overlays stay inside 1366 and 1920 viewports', async ({ page }) => {
  await playToAgentDone(page);
  await interactAt(page, 'workshop', WORLD_POS.bridgeHost.x, WORLD_POS.bridgeHost.y);
  await page.getByTestId('bridge-connect').click();
  await page.setViewportSize({ width: 1366, height: 768 });
  const overlay = page.getByTestId('bridge-host');
  await expect(overlay).toBeVisible();
  const box = await overlay.locator('.instruction-card').boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1367);
    expect(box.y + box.height).toBeLessThanOrEqual(769);
  }
  await page.getByTestId('bridge-close').click();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await interactAt(page, 'workshop', WORLD_POS.bridgeBrowser.x, WORLD_POS.bridgeBrowser.y);
  const browserCard = page.getByTestId('bridge-browser');
  await expect(browserCard).toBeVisible();
  const browserBox = await browserCard.locator('.instruction-card').boundingBox();
  expect(browserBox).not.toBeNull();
  if (browserBox) {
    expect(browserBox.x).toBeGreaterThanOrEqual(0);
    expect(browserBox.y).toBeGreaterThanOrEqual(0);
    expect(browserBox.x + browserBox.width).toBeLessThanOrEqual(1921);
    expect(browserBox.y + browserBox.height).toBeLessThanOrEqual(1081);
  }
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(evidenceDir, 'overlays.png'), fullPage: true });
  await dispatch(page, { type: 'CLOSE_OVERLAY' });
  await assertNoLessonUi(page);
});
