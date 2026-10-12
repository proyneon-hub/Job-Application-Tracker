import { expect, test, type Page } from "@playwright/test";

import { cardsIn, column, startDemo } from "./helpers";

/**
 * Picks up the first Applied card with Space, moves it right with the arrow key,
 * drops it with Space, then checks it's saved and recorded in the history.
 */
async function moveWithKeyboard(page: Page) {
  const appliedBefore = await cardsIn(page, "applied").count();
  const screeningBefore = await cardsIn(page, "screening").count();

  const handle = cardsIn(page, "applied")
    .first()
    .getByRole("button", { name: /^Drag / });
  const label = (await handle.getAttribute("aria-label"))!.replace(/^Drag /, "");

  await handle.focus();
  await page.keyboard.press("Space");
  await expect(page.getByText(`Picked up ${label}.`)).toBeAttached();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText(`${label} is over the Screening column.`)).toBeAttached();
  await page.keyboard.press("Space");

  await expect(cardsIn(page, "applied")).toHaveCount(appliedBefore - 1);
  await expect(cardsIn(page, "screening")).toHaveCount(screeningBefore + 1);
  await expect(
    column(page, "screening").getByRole("button", { name: `Drag ${label}` }),
  ).toBeVisible();

  // The change is saved: it survives a reload...
  await page.reload();
  await expect(
    column(page, "screening").getByRole("button", { name: `Drag ${label}` }),
  ).toBeVisible();

  // ...and shows up in the application's status history.
  const company = label.split(" at ").at(-1)!;
  await column(page, "screening").getByRole("link", { name: company, exact: true }).click();
  await expect(page.getByRole("list", { name: "Status changes, oldest first" })).toContainText(
    "Applied → Screening",
  );
}

test.describe("Kanban board (demo mode)", () => {
  test.beforeEach(async ({ page }) => {
    await startDemo(page);
    await page.getByRole("link", { name: "Board", exact: true }).click();
    await expect(cardsIn(page, "applied").first()).toBeVisible();
  });

  test("moves a card to the next column with the keyboard only", async ({ page }) => {
    await moveWithKeyboard(page);
  });

  test("Escape cancels a keyboard move", async ({ page }) => {
    const appliedBefore = await cardsIn(page, "applied").count();
    await cardsIn(page, "applied")
      .first()
      .getByRole("button", { name: /^Drag / })
      .focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(cardsIn(page, "applied")).toHaveCount(appliedBefore);
  });

  test("moves a card by dragging with the mouse", async ({ page }) => {
    const wishlistBefore = await cardsIn(page, "wishlist").count();
    const appliedBefore = await cardsIn(page, "applied").count();

    const handle = cardsIn(page, "wishlist")
      .first()
      .getByRole("button", { name: /^Drag / });
    const from = (await handle.boundingBox())!;
    const to = (await column(page, "applied").boundingBox())!;

    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + 80, { steps: 15 });
    await page.mouse.up();

    await expect(cardsIn(page, "wishlist")).toHaveCount(wishlistBefore - 1);
    await expect(cardsIn(page, "applied")).toHaveCount(appliedBefore + 1);
  });

  test("moves a card with the Move to menu (no dragging needed)", async ({ page }) => {
    const offersBefore = await cardsIn(page, "offer").count();
    await cardsIn(page, "interview")
      .first()
      .getByRole("combobox", { name: /^Move .* to$/ })
      .selectOption({ label: "Move to Offer" });
    await expect(cardsIn(page, "offer")).toHaveCount(offersBefore + 1);
  });
});

test("logged-out visitors without demo mode are sent to log in", async ({ page }) => {
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login\?next=%2Fboard$/);
});

// On a screen wide enough for every column, the board can't scroll, so only our
// arrow-key handling (src/lib/board/keyboard.ts) can move the card. At narrower
// widths the browser's own sideways scrolling could hide a bug in it.
test.describe("Kanban board on a wide screen", () => {
  test.use({ viewport: { width: 2400, height: 900 } });

  test("moves a card to the next column with the keyboard only", async ({ page }) => {
    await startDemo(page);
    await page.goto("/board");
    const board = page.getByTestId("board-scroller");
    await expect(cardsIn(page, "applied").first()).toBeVisible();
    expect(await board.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await moveWithKeyboard(page);
  });
});
