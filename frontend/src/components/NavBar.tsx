"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Select } from "@/components/ui/Select";
import { AVAILABLE_YEARS } from "@/lib/years";
import { getRaces, Race } from "@/services/racesService";
import { getRaceSessions, SessionMeta } from "@/services/sessionsService";

export default function NavBar() {
  const router = useRouter();
  const params = useParams();

  const urlYear = params.year ? Number(params.year) : undefined;
  const urlRound = params.round ? Number(params.round) : undefined;
  const urlSession = params.session ? String(params.session) : undefined;

  const [year, setYear] = useState<number>(urlYear ?? AVAILABLE_YEARS[0]);
  const [races, setRaces] = useState<Race[]>([]);
  const [round, setRound] = useState<number | undefined>(urlRound);
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [session, setSession] = useState<string | undefined>(urlSession);

  // Keep local state in sync when navigation happens elsewhere (e.g. links)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the route params into local selector state
    if (urlYear) setYear(urlYear);
    setRound(urlRound);
    setSession(urlSession);
  }, [urlYear, urlRound, urlSession]);

  useEffect(() => {
    getRaces(year)
      .then((d) => setRaces(d.races))
      .catch(() => setRaces([]));
  }, [year]);

  useEffect(() => {
    if (round === undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clears stale sessions when the round is unset
      setSessions([]);
      return;
    }
    getRaceSessions(year, round)
      .then((d) => setSessions(d.sessions))
      .catch(() => setSessions([]));
  }, [year, round]);

  const handleYear = (v: string) => {
    const y = Number(v);
    setYear(y);
    setRound(undefined);
    setSession(undefined);
    router.push(`/races/${y}`);
  };

  const handleRound = (v: string) => {
    const r = Number(v);
    setRound(r);
    setSession(undefined);
    router.push(`/races/${year}/${r}`);
  };

  const handleSession = (v: string) => {
    setSession(v);
    if (round !== undefined) router.push(`/races/${year}/${round}/${v}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-12 border-b border-border bg-bg/95 backdrop-blur">
      <div className="h-full flex items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-6 h-6 rounded bg-accent flex items-center justify-center text-[10px] font-bold text-white">
            F1
          </span>
          <span className="text-[13px] font-semibold text-text hidden sm:inline">
            Analyst Workbench
          </span>
        </Link>

        <div className="w-px h-5 bg-border hidden sm:block" />

        <div className="flex items-center gap-2 overflow-x-auto">
          <Select
            value={String(year)}
            onValueChange={handleYear}
            options={AVAILABLE_YEARS.map((y) => ({ value: String(y), label: y }))}
          />
          <Select
            value={round !== undefined ? String(round) : ""}
            onValueChange={handleRound}
            placeholder="Grand Prix"
            disabled={races.length === 0}
            options={races.map((r) => ({
              value: String(r.RoundNumber),
              label: `R${String(r.RoundNumber).padStart(2, "0")} · ${r.EventName}`,
            }))}
            className="max-w-[220px]"
          />
          <Select
            value={session ?? ""}
            onValueChange={handleSession}
            placeholder="Session"
            disabled={sessions.length === 0}
            options={sessions.map((s) => ({ value: s.key, label: s.name }))}
          />
        </div>
      </div>
    </header>
  );
}
