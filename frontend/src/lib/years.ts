// FastF1's telemetry coverage starts in 2018.
const MIN_YEAR = 2018;

export const AVAILABLE_YEARS = Array.from(
  { length: new Date().getFullYear() - MIN_YEAR + 1 },
  (_, i) => new Date().getFullYear() - i
);
