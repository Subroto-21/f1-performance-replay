/**
 * Assigns each selected driver a display color based on their real team color.
 * When two selected drivers share a team (identical team_color), the second
 * one gets a lightness/hue nudge so they stay visually distinguishable.
 */

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) =>
    Math.round(255 * n)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

const FALLBACK_PALETTE = [
  "#4f8cff",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#60a5fa",
];

/**
 * Returns a color per driver, keyed by abbreviation, given their raw team_color hex.
 * Order matters: later duplicates of a team color get shifted.
 */
export function assignDriverColors(
  drivers: { abbreviation: string; team_color: string }[]
): Record<string, string> {
  const seen = new Map<string, number>(); // team_color -> count so far
  const result: Record<string, string> = {};
  let fallbackIdx = 0;

  for (const d of drivers) {
    const raw = /^#[0-9a-fA-F]{6}$/.test(d.team_color) ? d.team_color : null;
    if (!raw) {
      result[d.abbreviation] = FALLBACK_PALETTE[fallbackIdx++ % FALLBACK_PALETTE.length];
      continue;
    }
    const count = seen.get(raw) ?? 0;
    seen.set(raw, count + 1);

    if (count === 0) {
      result[d.abbreviation] = raw;
    } else {
      // Teammate collision: nudge lightness up/down alternately, keep hue/sat.
      const [h, s, l] = hexToHsl(raw);
      const nudged = count % 2 === 1 ? Math.min(l + 22, 88) : Math.max(l - 22, 12);
      result[d.abbreviation] = hslToHex(h, s, nudged);
    }
  }

  return result;
}
