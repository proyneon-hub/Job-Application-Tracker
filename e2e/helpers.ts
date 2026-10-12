import { expect, type Page } from "@playwright/test";

import type { ApplicationStatus } from "../src/lib/applications/constants";

/** Starts demo mode from the landing page, like a visitor would. */
export async function startDemo(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Try the demo" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export function column(page: Page, status: ApplicationStatus) {
  return page.getByTestId(`column-${status}`);
}

export function cardsIn(page: Page, status: ApplicationStatus) {
  return column(page, status).getByRole("listitem");
}
