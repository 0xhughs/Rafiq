import { expect, test } from '@playwright/test';
import { collectPageErrors, startAdventure } from './helpers';

const viewports = [
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
] as const;

const names = ['عبد الرحمن الطويل الأحمدي', 'Sara علي-Khan'];

for (const viewport of viewports) {
  for (const name of names) {
    test(`readable overlays at ${viewport.width}x${viewport.height} for ${name}`, async ({
      page,
    }) => {
      const errors = collectPageErrors(page);
      await page.setViewportSize(viewport);
      await startAdventure(page, name);
      await expect(page.getByTestId('hud-objective')).toBeVisible();
      await page.getByTestId('help-button').click();
      const overlay = page.getByTestId('pause-overlay');
      await expect(overlay).toBeVisible();
      await expect(page.getByTestId('help-objective')).toBeVisible();
      await expect(page.getByTestId('journal-lead')).toBeVisible();
      await expect(page.getByTestId('journal-events')).toBeVisible();
      await expect(overlay).toHaveCSS('direction', 'rtl');
      const box = await overlay.locator('.panel').boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
      }
      await expect(page.getByTestId('help-objective')).toContainText('كيس القمامة');
      await expect(page.getByTestId('journal-lead')).toContainText('كيس القمامة');
      await expect(page.getByTestId('help-controls')).toContainText('WASD');
      await page.getByTestId('resume-button').click();
      await expect(page.getByTestId('pause-overlay')).toHaveCount(0);
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }
}
