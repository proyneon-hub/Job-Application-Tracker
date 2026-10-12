import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { startDemo } from "./helpers";

test("exports all applications as a CSV file", async ({ page }) => {
  await startDemo(page);
  await page.goto("/applications");
  await expect(page.getByText("Showing 25 of 25 applications")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^job-applications-\d{4}-\d{2}-\d{2}\.csv$/);
  const text = (await readFile((await download.path())!, "utf8")).replace(/^﻿/, "");
  const lines = text.split("\r\n");
  expect(lines[0]).toMatch(/^Company,Role title,Status,/);
  expect(lines).toHaveLength(26); // header + 25 applications
});

test("the theme toggle switches to dark mode and remembers it", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  // System -> Light -> Dark
  await page.getByRole("button", { name: /^Theme: System/ }).click();
  await page.getByRole("button", { name: /^Theme: Light/ }).click();
  await expect(html).toHaveClass(/dark/);

  // Applied before paint on the next load, with no flash of the light theme.
  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: /^Theme: Dark/ })).toBeVisible();
});

test("follows the operating system in System mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/login");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("keyboard users can skip straight to the main content", async ({ page }) => {
  await page.goto("/login");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("unknown pages: guests are asked to log in, signed-in or demo visitors get a 404", async ({
  page,
}) => {
  // Pages are private by default, so a guest never learns which URLs exist.
  await page.goto("/this-page-does-not-exist");
  await expect(page).toHaveURL(/\/login\?next=%2Fthis-page-does-not-exist$/);

  await startDemo(page);
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});
