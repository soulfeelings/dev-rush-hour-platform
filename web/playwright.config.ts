import { defineConfig } from '@playwright/test'

const apiBaseURL = process.env.API_BASE_URL ?? 'http://localhost:8080/api'
const webBaseURL = process.env.WEB_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'line' : [['list'], ['html', { open: 'never' }]],
  use: { trace: 'on-first-retry' },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: apiBaseURL,
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: {
        baseURL: webBaseURL,
      },
    },
  ],
})
