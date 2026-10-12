import { expect, test, type Page } from "@playwright/test";

import { cardsIn, demoBanner, startDemo } from "./helpers";

// Regenerates the README screenshots from demo mode (fictional data only).
// Not part of the normal test run: `npm run screenshots`.
test.skip(!process.env.SCREENSHOTS, "Run with SCREENSHOTS=1 (npm run screenshots)");

const DIR = "docs/screenshots";

async function shot(page: Page, name: string) {
  // Let streamed content (like the demo banner) settle before capturing.
  await expect(
    demoBanner(page).or(page.getByRole("button", { name: "Try the demo" })),
  ).toBeVisible();
  // Park the mouse in a corner so no link shows a hover state.
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `${DIR}/${name}.png` });
}

test.describe("README screenshots", () => {
  test.use({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });

  test("light mode pages", async ({ page }) => {
    await page.goto("/");
    await shot(page, "landing");

    await startDemo(page);
    await expect(page.getByText("Funnel by stage")).toBeVisible();
    await shot(page, "dashboard");

    await page.goto("/board");
    await expect(cardsIn(page, "applied").first()).toBeVisible();
    await shot(page, "board");

    await page.goto("/applications");
    await expect(page.getByText(/Showing \d+ of \d+/)).toBeVisible();
    await shot(page, "applications");

    await page.goto("/board");
    await cardsIn(page, "interview").first().getByRole("link").click();
    await expect(page.getByRole("list", { name: "Status changes, oldest first" })).toBeVisible();
    await shot(page, "application-detail");
  });

  test("dark mode dashboard", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await startDemo(page);
    await expect(page.getByText("Funnel by stage")).toBeVisible();
    await shot(page, "dashboard-dark");
  });
});

test.describe("README screenshots (phone)", () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: "light" });

  test("board on a phone", async ({ page }) => {
    await startDemo(page);
    await page.goto("/board");
    await expect(cardsIn(page, "wishlist").first()).toBeVisible();
    await shot(page, "board-phone");
  });
});
