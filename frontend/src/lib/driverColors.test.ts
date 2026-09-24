import { describe, expect, it } from "vitest";
import { assignDriverColors } from "./driverColors";

describe("assignDriverColors", () => {
  it("uses the raw team color for a driver with no teammate collision", () => {
    const result = assignDriverColors([{ abbreviation: "VER", team_color: "#3671C6" }]);
    expect(result.VER).toBe("#3671C6");
  });

  it("nudges the second driver's lightness when two drivers share a team color", () => {
    const result = assignDriverColors([
      { abbreviation: "VER", team_color: "#3671C6" },
      { abbreviation: "PER", team_color: "#3671C6" },
    ]);
    expect(result.VER).toBe("#3671C6");
    expect(result.PER).not.toBe("#3671C6");
    expect(result.PER).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("falls back to the palette for invalid team colors", () => {
    const result = assignDriverColors([{ abbreviation: "XXX", team_color: "" }]);
    expect(result.XXX).toBe("#4f8cff");
  });
});
