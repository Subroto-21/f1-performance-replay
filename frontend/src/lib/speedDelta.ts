// Linear interpolation of (xp, fp) at each x, clamped to the end values —
// same contract as numpy.interp. xp must be ascending.
export function interpolate(x: number[], xp: number[], fp: number[]): number[] {
  if (xp.length === 0) return x.map(() => 0);
  const out: number[] = new Array(x.length);
  let j = 0;
  for (let i = 0; i < x.length; i++) {
    const xi = x[i];
    if (xi <= xp[0]) {
      out[i] = fp[0];
      continue;
    }
    if (xi >= xp[xp.length - 1]) {
      out[i] = fp[fp.length - 1];
      continue;
    }
    // x is ascending too, so the bracketing segment only ever moves forward.
    while (j < xp.length - 2 && xp[j + 1] < xi) j++;
    const span = xp[j + 1] - xp[j];
    const t = span === 0 ? 0 : (xi - xp[j]) / span;
    out[i] = fp[j] + t * (fp[j + 1] - fp[j]);
  }
  return out;
}

// Each driver's telemetry comes back on its own distance grid (0 → that lap's
// length), so resample onto the reference's grid before subtracting.
// Positive = faster than the reference at that point on track.
export function speedDeltaOnGrid(
  refDistance: number[],
  refSpeed: number[],
  distance: number[],
  speed: number[]
): number[] {
  const resampled = interpolate(refDistance, distance, speed);
  return resampled.map((v, i) => Math.round((v - (refSpeed[i] ?? 0)) * 10) / 10);
}

// Symmetric y-domain around zero, rounded up to a multiple of `step`, so the
// zero line sits mid-panel and faster/slower read at the same scale.
export function symmetricDomain(series: number[][], step = 10, min = 10): [number, number] {
  let max = 0;
  for (const s of series) for (const v of s) max = Math.max(max, Math.abs(v));
  const bound = Math.max(min, Math.ceil(max / step) * step);
  return [-bound, bound];
}

// Where zero falls in an area's bounding box, as a 0–1 gradient offset from the
// top — lets one <linearGradient> switch from the "faster" to "slower" color
// exactly at the zero line.
export function zeroCrossingOffset(values: number[]): number {
  let hi = 0;
  let lo = 0;
  for (const v of values) {
    if (v > hi) hi = v;
    if (v < lo) lo = v;
  }
  if (hi === lo) return 0.5;
  return hi / (hi - lo);
}
