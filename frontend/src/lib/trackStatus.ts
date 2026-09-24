// FastF1 track status codes: '1' clear, '2' yellow, '3' unused, '4' Safety
// Car, '5' red flag, '6' VSC deployed, '7' VSC ending. A lap's `track_status`
// is the set of codes that occurred during that lap, concatenated as digits.
export type FlagCategory = "yellow" | "vsc" | "sc" | "red";

const PRIORITY: Record<FlagCategory, number> = { yellow: 0, vsc: 1, sc: 2, red: 3 };

export const FLAG_STYLE: Record<FlagCategory, { color: string; label: string }> = {
  yellow: { color: "#f5e642", label: "Yellow" },
  vsc: { color: "#f5c518", label: "VSC" },
  sc: { color: "#f5a623", label: "Safety Car" },
  red: { color: "#e10600", label: "Red flag" },
};

/** Highest-severity flag active during a lap, or null if the track was clear. */
export function categorizeTrackStatus(status: string): FlagCategory | null {
  if (status.includes("5")) return "red";
  if (status.includes("4")) return "sc";
  if (status.includes("6") || status.includes("7")) return "vsc";
  if (status.includes("2")) return "yellow";
  return null;
}

export type FlagBand = { start: number; end: number; category: FlagCategory };

/**
 * Merges per-lap flag categories (across all drivers, so one driver's
 * inaccurate lap boundary doesn't hide a real incident) into contiguous
 * lap-number bands for chart shading.
 */
export function buildFlagBands(
  laps: { lap_number: number | null; track_status: string }[][],
  maxLap: number
): FlagBand[] {
  const perLap: (FlagCategory | null)[] = new Array(maxLap + 1).fill(null);

  for (const driverLaps of laps) {
    for (const l of driverLaps) {
      if (!l.lap_number) continue;
      const cat = categorizeTrackStatus(l.track_status || "");
      if (!cat) continue;
      const existing = perLap[l.lap_number];
      if (!existing || PRIORITY[cat] > PRIORITY[existing]) {
        perLap[l.lap_number] = cat;
      }
    }
  }

  const bands: FlagBand[] = [];
  let i = 1;
  while (i <= maxLap) {
    const cat = perLap[i];
    if (!cat) {
      i++;
      continue;
    }
    let j = i;
    while (j + 1 <= maxLap && perLap[j + 1] === cat) j++;
    bands.push({ start: i, end: j, category: cat });
    i = j + 1;
  }
  return bands;
}
