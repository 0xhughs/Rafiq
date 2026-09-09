import { defineConfig } from '@playwright/test';

const previewPort = process.env.PREVIEW_PORT ?? '4180';
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL,
    locale: 'ar',
    viewport: { width: 1366, height: 768 },
    launchOptions: {
      executablePath: '/usr/bin/google-chrome',
      args: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-http-cache',
        '--disk-cache-size=0',
      ],
    },
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npx vite preview --host 127.0.0.1 --port ${previewPort} --strictPort`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
