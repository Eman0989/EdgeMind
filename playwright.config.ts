import {
  defineConfig,
  devices,
} from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  fullyParallel: false,

  forbidOnly:
    Boolean(process.env.CI),

  retries:
    process.env.CI ? 2 : 0,

  workers:
    process.env.CI ? 1 : undefined,

  reporter: "html",

  use: {
    baseURL:
      "http://127.0.0.1:5173",

    trace:
      "on-first-retry",

    screenshot:
      "only-on-failure",

    video:
      "retain-on-failure",
  },

  projects: [
    {
      name: "webkit",

      use: {
        ...devices[
          "Desktop Safari"
        ],
      },
    },
  ],

  webServer: [
    {
      command:
        ".venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000",

      cwd: "./backend",

      url:
        "http://127.0.0.1:8000/api/health",

      reuseExistingServer: true,

      timeout: 120_000,
    },

    {
      command:
        "npm run dev -- --host 127.0.0.1 --port 5173 --strictPort",

      cwd: ".",

      url:
        "http://127.0.0.1:5173",

      reuseExistingServer: true,

      timeout: 120_000,
    },
  ],
});
