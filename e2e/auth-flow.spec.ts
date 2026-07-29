import {
  expect,
  test,
} from "@playwright/test";

test(
  "user registers, opens protected pages, logs out, and logs in again",
  async ({ page }) => {
    const uniqueEmail =
      `e2e-${Date.now()}@edgemind.dev`;

    const password =
      "EdgeMind2026!";

    const fullName =
      "E2E Operator";

    await page.goto(
      "/settings",
    );

    await expect(page).toHaveURL(
      /\/login$/,
    );

    await page
      .getByRole("link", {
        name: "Create an account",
      })
      .click();

    await expect(page).toHaveURL(
      /\/register$/,
    );

    await page
      .getByLabel("FULL NAME")
      .fill(fullName);

    await page
      .getByLabel("EMAIL ADDRESS")
      .fill(uniqueEmail);

    await page
      .getByPlaceholder(
        "Create a password",
      )
      .fill(password);

    await page
      .getByPlaceholder(
        "Repeat your password",
      )
      .fill(password);

    await page
      .getByRole("checkbox", {
        name:
          /I agree to the Terms of Service/i,
      })
      .check();

    await page
      .getByRole("button", {
        name:
          /Create EdgeMind account/i,
      })
      .click();

    await expect(page).toHaveURL(
      /\/dashboard$/,
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Good to see you, E2E.",
        },
      ),
    ).toBeVisible();

    await page.goto(
      "/settings",
    );

    await expect(page).toHaveURL(
      /\/settings$/,
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Log out of EdgeMind",
        },
      ),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Log out",
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(
      /\/login$/,
    );

    await page
      .getByLabel("EMAIL ADDRESS")
      .fill(uniqueEmail);

    await page
      .getByPlaceholder(
        "Enter your password",
      )
      .fill(password);

    await page
      .getByRole("button", {
        name:
          /Enter control plane/i,
      })
      .click();

    await expect(page).toHaveURL(
      /\/dashboard$/,
    );

    await expect(
      page.getByRole(
        "heading",
        {
          name:
            "Good to see you, E2E.",
        },
      ),
    ).toBeVisible();
  },
);
