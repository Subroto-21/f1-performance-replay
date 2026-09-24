import { describe, expect, it } from "vitest";
import { categorizeTrackStatus, buildFlagBands } from "./trackStatus";

describe("categorizeTrackStatus", () => {
  it("returns null when the track was clear", () => {
    expect(categorizeTrackStatus("1")).toBeNull();
    expect(categorizeTrackStatus("")).toBeNull();
  });

  it("detects yellow, VSC, safety car and red flag", () => {
    expect(categorizeTrackStatus("12")).toBe("yellow");
    expect(categorizeTrackStatus("16")).toBe("vsc");
    expect(categorizeTrackStatus("17")).toBe("vsc");
    expect(categorizeTrackStatus("14")).toBe("sc");
    expect(categorizeTrackStatus("15")).toBe("red");
  });

  it("prioritizes the most severe flag when multiple occurred in one lap", () => {
    expect(categorizeTrackStatus("126")).toBe("vsc");
    expect(categorizeTrackStatus("6712")).toBe("vsc");
    expect(categorizeTrackStatus("1245")).toBe("red");
  });
});

describe("buildFlagBands", () => {
  it("merges consecutive laps sharing a category into one band", () => {
    const laps = [
      [
        { lap_number: 1, track_status: "1" },
        { lap_number: 2, track_status: "26" },
        { lap_number: 3, track_status: "6" },
        { lap_number: 4, track_status: "67" },
        { lap_number: 5, track_status: "71" },
      ],
    ];
    expect(buildFlagBands(laps, 5)).toEqual([{ start: 2, end: 5, category: "vsc" }]);
  });

  it("keeps separate incidents as separate bands", () => {
    const laps = [
      [
        { lap_number: 1, track_status: "1" },
        { lap_number: 2, track_status: "12" },
        { lap_number: 3, track_status: "1" },
        { lap_number: 4, track_status: "14" },
      ],
    ];
    expect(buildFlagBands(laps, 4)).toEqual([
      { start: 2, end: 2, category: "yellow" },
      { start: 4, end: 4, category: "sc" },
    ]);
  });

  it("uses the most severe category across drivers for the same lap", () => {
    const laps = [
      [{ lap_number: 5, track_status: "12" }],
      [{ lap_number: 5, track_status: "126" }],
    ];
    expect(buildFlagBands(laps, 5)).toEqual([{ start: 5, end: 5, category: "vsc" }]);
  });

  it("ignores laps without a lap number", () => {
    const laps = [[{ lap_number: null, track_status: "14" }]];
    expect(buildFlagBands(laps, 3)).toEqual([]);
  });
});
