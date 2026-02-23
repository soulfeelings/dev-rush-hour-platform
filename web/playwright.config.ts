import { defineConfig } from '@playwright/test'

const webBaseURL = process.env.WEB_BASE_URL ?? 'http://localhost:5173'

export default defineConfig({
  testDir: './tests',

  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },

  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: webBaseURL,
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