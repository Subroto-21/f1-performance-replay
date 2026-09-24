import { describe, expect, it } from "vitest";
import { formatLapTime, formatGap, compoundColor } from "./formatters";

describe("formatLapTime", () => {
  it("renders sub-minute times without a minutes segment", () => {
    expect(formatLapTime(23.456)).toBe("23.456");
  });

  it("renders minutes:seconds for times over a minute", () => {
    expect(formatLapTime(83.456)).toBe("1:23.456");
  });

  it("renders an em dash for null/undefined", () => {
    expect(formatLapTime(null)).toBe("—");
    expect(formatLapTime(undefined)).toBe("—");
  });
});

describe("formatGap", () => {
  it("prefixes a plus sign", () => {
    expect(formatGap(0.185)).toBe("+0.185");
  });

  it("renders an em dash for null and zero (leader has no gap)", () => {
    expect(formatGap(null)).toBe("—");
    expect(formatGap(0)).toBe("—");
  });
});

describe("compoundColor", () => {
  it("looks up known compounds case-insensitively", () => {
    expect(compoundColor("soft")).toBe("#e10600");
    expect(compoundColor("HARD")).toBe("#d1d5db");
  });

  it("falls back to gray for unknown compounds", () => {
    expect(compoundColor("UNKNOWN")).toBe("#6b7280");
  });
});
