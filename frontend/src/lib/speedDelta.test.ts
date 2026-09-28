import { describe, expect, it } from "vitest";
import { interpolate, speedDeltaOnGrid, symmetricDomain, zeroCrossingOffset } from "./speedDelta";

describe("interpolate", () => {
  it("interpolates linearly between points", () => {
    expect(interpolate([0, 5, 10, 15], [0, 10, 20], [100, 200, 300])).toEqual([100, 150, 200, 250]);
  });

  it("clamps to the end values outside the source range", () => {
    expect(interpolate([-5, 25], [0, 10, 20], [100, 200, 300])).toEqual([100, 300]);
  });

  it("returns zeros for an empty source", () => {
    expect(interpolate([1, 2], [], [])).toEqual([0, 0]);
  });
});

describe("speedDeltaOnGrid", () => {
  it("is positive where the driver is faster than the reference", () => {
    expect(
      speedDeltaOnGrid([0, 100, 200], [200, 250, 300], [0, 100, 200], [205, 240, 300])
    ).toEqual([5, -10, 0]);
  });

  it("resamples a driver whose lap has a different distance grid", () => {
    // Driver's grid runs 0→400 m while the reference's runs 0→200 m; at the
    // reference's 100 m point the driver's speed is halfway between 200 and 240.
    const delta = speedDeltaOnGrid([0, 100, 200], [200, 200, 200], [0, 200, 400], [200, 240, 280]);
    expect(delta).toEqual([0, 20, 40]);
  });

  it("rounds to one decimal place", () => {
    expect(speedDeltaOnGrid([0], [200], [0], [200.46])).toEqual([0.5]);
  });
});

describe("symmetricDomain", () => {
  it("rounds the largest magnitude up to the step", () => {
    expect(symmetricDomain([[3, -23], [12]])).toEqual([-30, 30]);
  });

  it("never goes below the minimum", () => {
    expect(symmetricDomain([[1, -2]])).toEqual([-10, 10]);
    expect(symmetricDomain([])).toEqual([-10, 10]);
  });
});

describe("zeroCrossingOffset", () => {
  it("places zero proportionally between the max and min", () => {
    expect(zeroCrossingOffset([30, -10])).toBe(0.75);
  });

  it("is 1 when everything is faster and 0 when everything is slower", () => {
    expect(zeroCrossingOffset([5, 10])).toBe(1);
    expect(zeroCrossingOffset([-5, -10])).toBe(0);
  });

  it("falls back to the middle for a flat series", () => {
    expect(zeroCrossingOffset([0, 0])).toBe(0.5);
  });
});
