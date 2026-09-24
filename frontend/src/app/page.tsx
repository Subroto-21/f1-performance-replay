"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_YEARS } from "@/lib/years";
import { getRaces, Race } from "@/services/racesService";
import { getRecentSessions, RecentSession } from "@/lib/recentSessions";
import { formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const router = useRouter();
  const [year, setYear] = useState(AVAILABLE_YEARS[0]);
  const [races, setRaces] = useState<Race[]>([]);
  const [round, setRound] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<RecentSession[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available client-side, read once on mount
    setRecents(getRecentSessions());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets picker state before the fetch for the new year resolves
    setLoading(true);
    setRound(null);
    getRaces(year)
      .then((d) => setRaces(d.races))
      .catch(() => setRaces([]))
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">F1 Analyst Workbench</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Session results, lap-by-lap pace, tyre strategy, and telemetry comparison — built on
          FastF1 data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Open a session</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Select
                value={String(year)}
                onValueChange={(v) => setYear(Number(v))}
                options={AVAILABLE_YEARS.map((y) => ({ value: String(y), label: y }))}
              />
              <Select
                value={round !== null ? String(round) : ""}
                onValueChange={(v) => setRound(Number(v))}
                placeholder={loading ? "Loading…" : "Grand Prix"}
                disabled={loading || races.length === 0}
                options={races.map((r) => ({
                  value: String(r.RoundNumber),
                  label: `R${String(r.RoundNumber).padStart(2, "0")} · ${r.EventName}`,
                }))}
                className="flex-1"
              />
            </div>
            <Button
              variant="primary"
              disabled={round === null}
              onClick={() => round !== null && router.push(`/races/${year}/${round}`)}
            >
              Open event →
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent sessions</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            {recents.length === 0 ? (
              <p className="p-4 text-[13px] text-text-faint">
                Sessions you open will show up here for quick access.
              </p>
            ) : (
              <ul>
                {recents.map((r) => (
                  <li
                    key={`${r.year}-${r.round}-${r.session}`}
                    onClick={() => router.push(`/races/${r.year}/${r.round}/${r.session}`)}
                    className="px-4 py-2.5 border-b border-border/60 last:border-b-0 cursor-pointer hover:bg-surface-2 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-text text-[13px] font-medium truncate">{r.eventName}</p>
                      <p className="text-text-faint text-[11px]">
                        {r.sessionName} · {r.year}
                      </p>
                    </div>
                    <span className="text-text-faint text-[11px] shrink-0">
                      {formatDate(new Date(r.visitedAt).toISOString())}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
