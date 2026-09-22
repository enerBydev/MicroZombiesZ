import { defineConfig } from '@playwright/test'

// E2E de MicroZombiesZ. En este sandbox NO se descargan navegadores
// (ver SPEC/README); en CI y local: `npx playwright install chromium`.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'PORT=4173 npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 60_000
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
})
