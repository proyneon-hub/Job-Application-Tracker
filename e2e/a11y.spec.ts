import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { startDemo } from "./helpers";

// Automated accessibility checks (axe-core) against WCAG 2.2 A and AA, in both
// themes. Automated tools catch roughly a third of issues; keyboard use, screen
// reader announcements and focus handling are covered by the other e2e tests.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help} -> ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary).toEqual([]);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`accessibility (${theme} theme)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("jat-theme", value), theme);
    });

    test("public pages", async ({ page }) => {
      for (const path of ["/", "/login", "/signup", "/forgot-password"]) {
        await page.goto(path);
        await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*dark)/);
        await expectNoViolations(page);
      }
    });

    test("app pages in demo mode", async ({ page }) => {
      await startDemo(page);
      await expect(page.getByText("Funnel by stage")).toBeVisible();
      await expect(page.getByText("Response rate by resume")).toBeVisible();
      await expectNoViolations(page);

      await page.goto("/applications");
      await expect(page.getByText(/Showing \d+ of \d+/)).toBeVisible();
      await expectNoViolations(page);

      await page.getByRole("table").getByRole("link").first().click();
      await expect(page.getByRole("heading", { name: "Status history" })).toBeVisible();
      await expect(page.getByRole("list", { name: "Status changes, oldest first" })).toBeVisible();
      await expectNoViolations(page);

      await page.goto("/applications/new");
      await expectNoViolations(page);

      await page.goto("/board");
      await expect(page.getByTestId("column-applied").getByRole("listitem").first()).toBeVisible();
      await expectNoViolations(page);

      await page.goto("/resumes");
      await expect(page.getByRole("list", { name: "Your resumes" })).toBeVisible();
      await expectNoViolations(page);
      await page.getByRole("button", { name: "Add resume" }).click();
      await expectNoViolations(page);

      await page.goto("/no-such-page");
      await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
      await expectNoViolations(page);
    });
  });
}
