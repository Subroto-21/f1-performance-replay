export type RecentSession = {
  year: number;
  round: number;
  session: string;
  eventName: string;
  sessionName: string;
  visitedAt: number;
};

const KEY = "f1-workbench-recent-sessions";
const MAX = 8;

export function getRecentSessions(): RecentSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentSession[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentSession(entry: Omit<RecentSession, "visitedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSessions().filter(
      (r) => !(r.year === entry.year && r.round === entry.round && r.session === entry.session)
    );
    const next = [{ ...entry, visitedAt: Date.now() }, ...existing].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore quota/serialization errors
  }
}
