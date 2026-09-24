import { describe, expect, it } from "vitest";
import { cornerLabel, nearestIndexForDistance, nearestCornerLabel } from "./corners";

describe("cornerLabel", () => {
  it("formats a plain corner number", () => {
    expect(cornerLabel({ number: 1, letter: "", distance: 338 })).toBe("T1");
  });

  it("includes the sub-corner letter when present", () => {
    expect(cornerLabel({ number: 3, letter: "A", distance: 818 })).toBe("T3A");
  });
});

describe("nearestIndexForDistance", () => {
  it("finds the closest sample index", () => {
    const distance = [0, 100, 200, 300, 400];
    expect(nearestIndexForDistance(distance, 210)).toBe(2);
    expect(nearestIndexForDistance(distance, 0)).toBe(0);
    expect(nearestIndexForDistance(distance, 999)).toBe(4);
  });
});

describe("nearestCornerLabel", () => {
  const corners = [
    { number: 1, letter: "", distance: 100 },
    { number: 2, letter: "", distance: 500 },
  ];

  it("returns the label of the nearest corner within maxGap", () => {
    expect(nearestCornerLabel(120, corners)).toBe("T1");
  });

  it("returns null when nothing is within maxGap", () => {
    expect(nearestCornerLabel(300, corners)).toBeNull();
  });
});
