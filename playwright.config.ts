import { defineConfig, devices } from "@playwright/test";

// Smoke suite runs against the STANDALONE PRODUCTION build, not `next dev`.
// NOTE: `npm run build` MUST precede this — `serve:standalone` only boots an
// already-produced `.next/standalone/server.js`; it does not compile. In CI the
// order is: build → test:smoke (see .github/workflows/ci.yml).

const PORT = "3123";

export default defineConfig({
  testDir: "tests",
  reporter: "list",
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`,
  },
  webServer: {
    command: "npm run serve:standalone",
    env: {
      PORT,
      // Silence the analytics beacon so smoke runs don't emit real traffic /
      // network errors that would otherwise trip the console-error assertion.
      NEXT_PUBLIC_ANALYTICS_DISABLED: "1",
    },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      // iPhone 13 metrics but on CHROMIUM (mobile emulation) so CI/contributors
      // only need one browser — no separate ~100 MB WebKit download.
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        defaultBrowserType: "chromium",
      },
    },
  ],
});
