/** Format seconds → "1:23.456" or "23.456" */
export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, "0");
  return mins > 0 ? `${mins}:${secs}` : secs;
}

/** Format gap to leader in seconds → "+0.185" */
export function formatGap(seconds: number | null | undefined): string {
  if (seconds == null || seconds === 0) return "—";
  return `+${seconds.toFixed(3)}`;
}

/** Format a date string → "May 5, 2024" */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export const COMPOUND_COLOR: Record<string, string> = {
  SOFT:   "#e10600",
  MEDIUM: "#fbbf24",
  HARD:   "#d1d5db",
  INTER:  "#22c55e",
  WET:    "#60a5fa",
  TEST_UNKNOWN: "#a855f7",
};

export function compoundColor(compound: string): string {
  return COMPOUND_COLOR[compound?.toUpperCase()] ?? "#6b7280";
}
