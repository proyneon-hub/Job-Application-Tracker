import { expect, test } from "@playwright/test";

import { startDemo } from "./helpers";

test.describe("Dashboard (demo mode)", () => {
  test.beforeEach(async ({ page }) => {
    await startDemo(page);
  });

  test("lists overdue and due-today follow-ups, and Done clears one", async ({ page }) => {
    const overdue = page.getByRole("list", { name: /^Overdue/ });
    const dueToday = page.getByRole("list", { name: /^Due today/ });
    // The demo data always has some of each (dates are relative to today).
    await expect(overdue.getByRole("listitem")).not.toHaveCount(0);
    await expect(dueToday.getByRole("listitem")).not.toHaveCount(0);

    const before = await overdue.getByRole("listitem").count();
    const first = overdue.getByRole("listitem").first();
    const company = await first.getByRole("link").textContent();
    await first.getByRole("button", { name: /^Mark follow-up for .* as done$/ }).click();

    await expect(overdue.getByRole("listitem")).toHaveCount(before - 1);
    await page.reload();
    await expect(overdue.getByRole("link", { name: company!, exact: true })).toHaveCount(0);
  });

  test("shows the headline stats and charts", async ({ page }) => {
    await expect(page.getByText("Total applications").locator("..")).toContainText("25");
    await expect(page.getByText("Response rate", { exact: true }).locator("..")).toContainText("%");
    await expect(page.getByText("Avg. time to first response").locator("..")).toContainText("days");
    await expect(page.getByRole("img", { name: /^Column chart: week of/ })).toBeVisible();
    await expect(page.getByRole("figure").filter({ hasText: "Funnel by stage" })).toContainText(
      "Offer",
    );
    await expect(
      page.getByRole("figure").filter({ hasText: "Response rate by resume" }).getByRole("row"),
    ).toHaveCount(5); // header + 3 seeded resumes + "No resume recorded"
  });

  test("the weekly chart can be read as a table", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Show as table" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "Show as chart" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    // A header row plus one row per week.
    const weekly = page.getByRole("figure").filter({ hasText: "Applications per week" });
    await expect(weekly.getByRole("table").getByRole("row")).toHaveCount(9);
  });
});
