import { expect, test } from "@playwright/test";

import { startDemo } from "./helpers";

// A page that's wider than the phone screen forces sideways scrolling and hides
// content off the edge. (The board is allowed to scroll inside its own area.)
test.describe("phone layout", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  for (const path of ["/", "/dashboard", "/applications", "/applications/new", "/board"]) {
    test(`${path} fits the screen width`, async ({ page }) => {
      await startDemo(page);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
