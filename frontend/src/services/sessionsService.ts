import { fetcher } from "@/lib/fetcher";
import { API_BASE_URL } from "@/lib/config";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SessionMeta = {
  number: number;
  name: string;
  key: string;
};

export type RaceSessionsResponse = {
  year: number;
  round: number;
  event_name: string;
  country: string;
  location: string;
  date: string;
  sessions: SessionMeta[];
};

export type DriverResult = {
  position: number | null;
  driver_number: string;
  abbreviation: string;
  full_name: string;
  team: string;
  team_color: string;
  // qualifying
  q1?: number | null;
  q2?: number | null;
  q3?: number | null;
  // race
  time?: number | null;
  status?: string;
  points?: number;
  grid_position?: number | null;
};

export type FastestLap = {
  lap_time: number | null;
  lap_number: number;
  compound: string;
};

export type SessionResultsResponse = {
  session_key: string;
  session_name: string;
  event_name: string;
  year: number;
  round: number;
  drivers: DriverResult[];
  fastest_laps: Record<string, FastestLap>;
};

export type TelemetryData = {
  distance: number[];
  speed: number[];
  throttle: number[];
  brake: number[];
  gear: number[];
  drs: number[];
  time: number[];
  x: number[];
  y: number[];
  delta?: number[];
};

export type DriverTelemetry = {
  driver: string;
  lap_number: number;
  lap_time: number | null;
  compound: string;
  data: TelemetryData;
  error?: string;
};

export type TelemetryResponse = {
  drivers: DriverTelemetry[];
};

export type LapRecord = {
  lap_number: number | null;
  lap_time: number | null;
  sector1: number | null;
  sector2: number | null;
  sector3: number | null;
  compound: string;
  tyre_life: number | null;
  stint: number | null;
  is_personal_best: boolean;
  deleted: boolean;
  pit_in: boolean;
  pit_out: boolean;
  track_status: string;
  position: number | null;
};

export type DriverLaps = {
  driver: string;
  laps: LapRecord[];
};

export type SessionLapsResponse = {
  year: number;
  round: number;
  session_key: string;
  drivers: DriverLaps[];
};

// ─── Fetchers ────────────────────────────────────────────────────────────────

export function getRaceSessions(year: number, round: number) {
  return fetcher<RaceSessionsResponse>(`${API_BASE_URL}/api/races/${year}/${round}/sessions`);
}

export function getSessionResults(year: number, round: number, session: string) {
  return fetcher<SessionResultsResponse>(
    `${API_BASE_URL}/api/sessions/${year}/${round}/${session}/results`
  );
}

export function getSessionLaps(year: number, round: number, session: string) {
  return fetcher<SessionLapsResponse>(
    `${API_BASE_URL}/api/sessions/${year}/${round}/${session}/laps`
  );
}

/**
 * `laps` is parallel to `drivers` — "fastest" or a lap number string for each.
 * The first driver in the list becomes the delta-time reference (delta = 0).
 */
export function getSessionTelemetry(
  year: number,
  round: number,
  session: string,
  drivers: string[],
  laps: string[] = []
) {
  const params = new URLSearchParams();
  drivers.forEach((d) => params.append("drivers", d));
  drivers.forEach((_, i) => params.append("laps", laps[i] ?? "fastest"));
  return fetcher<TelemetryResponse>(
    `${API_BASE_URL}/api/sessions/${year}/${round}/${session}/telemetry?${params.toString()}`
  );
}
