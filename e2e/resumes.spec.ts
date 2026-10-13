import { expect, test } from "@playwright/test";

import { startDemo } from "./helpers";

// Resume tracking end to end, in demo mode: add a version, use it on an
// application, see it in the table, the dashboard and the detail page, then
// delete it and check the application survives.
test("tracks which resume was sent with an application", async ({ page }) => {
  await startDemo(page);

  // Add a resume version.
  await page.getByRole("navigation").getByRole("link", { name: "Resumes" }).click();
  await expect(page.getByRole("heading", { name: "Resumes", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Add resume" }).click();
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.getByLabel("Name").fill("Platform focus – v1");
  await page.getByLabel("Link to the file").fill("https://files.example.test/platform-v1.pdf");
  await page.getByRole("button", { name: "Add resume" }).click();
  const card = page
    .getByRole("list", { name: "Your resumes" })
    .getByRole("listitem")
    .filter({ hasText: "Platform focus – v1" });
  await expect(card).toContainText("Not used yet");

  // A duplicate name is rejected with a message on the field.
  await page.getByRole("button", { name: "Add resume" }).click();
  await page.getByLabel("Name").fill("Platform focus – v1");
  await page.getByRole("button", { name: "Add resume" }).click();
  await expect(page.getByLabel("Name")).toHaveAccessibleDescription(
    "You already have a resume with that name.",
  );
  await page.getByRole("button", { name: "Cancel" }).click();

  // Use it on a new application.
  await page.goto("/applications/new");
  await page.getByLabel("Company").fill("Imaginary Clouds Inc");
  await page.getByLabel("Role title").fill("Platform Engineer");
  await page.getByLabel("Status").selectOption("applied");
  await page.getByLabel("Resume used").selectOption({ label: "Platform focus – v1" });
  await page.getByRole("button", { name: "Add application" }).click();

  // The detail page links to the file.
  await expect(page.getByRole("heading", { name: "Platform Engineer" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Platform focus – v1/ })).toHaveAttribute(
    "href",
    "https://files.example.test/platform-v1.pdf",
  );

  // The table filter finds it.
  await page.goto("/applications");
  await page.getByLabel("Resume").selectOption({ label: "Platform focus – v1" });
  await expect(page.getByText("Showing 1 of 26 applications")).toBeVisible();
  await expect(
    page.getByRole("table").getByRole("link", { name: "Imaginary Clouds Inc" }),
  ).toBeVisible();

  // The dashboard counts it.
  await page.goto("/dashboard");
  const statsRow = page
    .getByRole("figure", { name: "Response rate by resume" })
    .getByRole("row", { name: /Platform focus – v1/ });
  await expect(statsRow.getByRole("cell").first()).toHaveText("1");

  // Deleting the resume keeps the application but clears the link.
  await page.goto("/resumes");
  await expect(card).toContainText("Used in 1 application");
  await card.getByRole("button", { name: "Delete Platform focus – v1" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toContainText("1 application will keep its details");
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(card).toHaveCount(0);

  await page.goto("/applications");
  await page.getByRole("table").getByRole("link", { name: "Imaginary Clouds Inc" }).click();
  await expect(page.getByRole("heading", { name: "Platform Engineer" })).toBeVisible();
  await expect(page.getByRole("term").filter({ hasText: "Resume" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Platform focus – v1/ })).toHaveCount(0);
});
