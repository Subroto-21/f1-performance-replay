import { CornerInfo } from "@/services/sessionsService";

/** "T1", "T3A", etc. */
export function cornerLabel(corner: CornerInfo): string {
  return `T${corner.number}${corner.letter}`;
}

/**
 * Finds the index into `distance` closest to each corner's own distance, so
 * corner markers can be placed using a specific driver's own telemetry
 * samples (matching whatever line/points are actually drawn for them).
 */
export function nearestIndexForDistance(distance: number[], target: number): number {
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < distance.length; i++) {
    const diff = Math.abs(distance[i] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/** Label for the corner nearest to `distance`, or null if none is within `maxGap` meters. */
export function nearestCornerLabel(
  distance: number,
  corners: CornerInfo[],
  maxGap = 60
): string | null {
  let best: CornerInfo | null = null;
  let bestDiff = Infinity;
  for (const c of corners) {
    const diff = Math.abs(c.distance - distance);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = c;
    }
  }
  return best && bestDiff <= maxGap ? cornerLabel(best) : null;
}
