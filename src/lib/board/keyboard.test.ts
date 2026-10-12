import { describe, expect, it } from "vitest";

import { getColumnJumpCoordinates } from "./keyboard";

// Three 300px-wide columns, 20px apart, given out of order on purpose.
const columns = [
  { left: 640, top: 100, width: 300 },
  { left: 0, top: 100, width: 300 },
  { left: 320, top: 100, width: 300 },
];
const cardWidth = 280;
const inFirstColumn = { x: 10, y: 300 };

describe("getColumnJumpCoordinates", () => {
  it("jumps right to the centre of the next column", () => {
    expect(getColumnJumpCoordinates("ArrowRight", inFirstColumn, cardWidth, columns)).toEqual({
      x: 330,
      y: 148,
    });
  });

  it("jumps left to the previous column", () => {
    const inThirdColumn = { x: 650, y: 300 };
    expect(getColumnJumpCoordinates("ArrowLeft", inThirdColumn, cardWidth, columns)).toEqual({
      x: 330,
      y: 148,
    });
  });

  it("stays put at either end of the board", () => {
    expect(
      getColumnJumpCoordinates("ArrowLeft", inFirstColumn, cardWidth, columns),
    ).toBeUndefined();
    expect(
      getColumnJumpCoordinates("ArrowRight", { x: 650, y: 300 }, cardWidth, columns),
    ).toBeUndefined();
  });

  it("ignores other keys and empty boards", () => {
    expect(
      getColumnJumpCoordinates("ArrowDown", inFirstColumn, cardWidth, columns),
    ).toBeUndefined();
    expect(getColumnJumpCoordinates("ArrowRight", inFirstColumn, cardWidth, [])).toBeUndefined();
  });

  it("works out the current column even when the card is between two columns", () => {
    // Card centre at 320 + 140 = 460: closest to the middle column (centre 470).
    const between = { x: 320, y: 300 };
    expect(getColumnJumpCoordinates("ArrowRight", between, cardWidth, columns)?.x).toBe(650);
  });
});
