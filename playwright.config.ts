import { defineConfig, devices } from '@playwright/test'

const FRONTEND_URL = process.env.BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './tests/e2e/specs',
  // The backend keeps state in a single in-memory store (no per-worker test
  // database), so parallel workers would stomp on each other's seed/cleanup.
  // Run serially until the backend gets a real, isolated test database.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: FRONTEND_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'npm run dev',
          cwd: './frontend',
          url: FRONTEND_URL,
          reuseExistingServer: true,
          env: { VITE_API_BASE_URL: 'http://localhost:8000/api' },
        },
        {
          command: 'python -m uvicorn main:app --port 8000',
          cwd: './backend',
          url: 'http://localhost:8000/api/health',
          reuseExistingServer: true,
          env: { ENV: 'development' },
        },
      ],
})
