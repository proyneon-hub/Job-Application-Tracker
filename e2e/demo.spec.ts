import { expect, test } from "@playwright/test";

import { demoBanner, startDemo } from "./helpers";

test("the landing page explains the app and offers the demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Job Application Tracker");
  await expect(page.getByRole("heading", { name: "Kanban board" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try the demo" })).toBeVisible();
});

test("the demo banner is shown on every app page", async ({ page }) => {
  await startDemo(page);
  for (const path of ["/applications", "/board", "/applications/new"]) {
    await page.goto(path);
    await expect(demoBanner(page)).toContainText("made-up sample data");
  }
});

test("reset puts the original sample data back", async ({ page }) => {
  await startDemo(page);
  await page.goto("/applications");
  await expect(page.getByText("Showing 25 of 25 applications")).toBeVisible();

  // Delete one application.
  await page.getByRole("table").getByRole("link").first().click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page).toHaveURL(/\/applications$/);
  await expect(page.getByText("Showing 24 of 24 applications")).toBeVisible();

  // Reset, confirming in the dialog.
  await demoBanner(page).getByRole("button", { name: "Reset demo data" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Reset demo data" }).click();
  await expect(page.getByText("Showing 25 of 25 applications")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Demo data reset." })).toBeAttached();
});

test("exiting the demo returns to the landing page and locks the app again", async ({ page }) => {
  await startDemo(page);
  await demoBanner(page).getByRole("button", { name: "Exit demo" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: "Try the demo" })).toBeVisible();

  await page.goto("/board");
  await expect(page).toHaveURL(/\/login\?next=%2Fboard$/);
});
