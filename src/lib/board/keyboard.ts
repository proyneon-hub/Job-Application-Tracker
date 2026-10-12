type Point = { x: number; y: number };
type Box = { left: number; top: number; width: number };

/** How far below a column's top edge a keyboard-dragged card lands. */
const COLUMN_PADDING = 48;

/**
 * Where a card being dragged with the keyboard should move when an arrow key is pressed.
 *
 * Instead of nudging the card a few pixels at a time (dnd-kit's default), Left/Right
 * jump it straight to the centre of the previous/next column. Returns undefined when
 * there's nowhere to go, which leaves the card where it is.
 *
 * Pure function so it can be unit-tested without a browser.
 */
export function getColumnJumpCoordinates(
  key: string,
  current: Point,
  cardWidth: number,
  columns: Box[],
): Point | undefined {
  if (key !== "ArrowRight" && key !== "ArrowLeft") return undefined;
  if (columns.length === 0) return undefined;

  const ordered = columns.toSorted((a, b) => a.left - b.left);
  const cardCentre = current.x + cardWidth / 2;

  // The column the card is over now: the one whose centre is closest to the card's centre.
  let currentIndex = 0;
  ordered.forEach((column, index) => {
    const distance = Math.abs(column.left + column.width / 2 - cardCentre);
    const best = ordered[currentIndex]!;
    if (distance < Math.abs(best.left + best.width / 2 - cardCentre)) currentIndex = index;
  });

  const target = ordered[currentIndex + (key === "ArrowRight" ? 1 : -1)];
  if (!target) return undefined;

  return {
    x: target.left + (target.width - cardWidth) / 2,
    y: target.top + COLUMN_PADDING,
  };
}
