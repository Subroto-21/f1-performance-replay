"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRaces, Race } from "@/services/racesService";
import { formatDate } from "@/lib/formatters";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/Card";

export default function SeasonPage() {
  const params = useParams();
  const router = useRouter();
  const year = Number(params.year);

  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets loading before the fetch for the new year resolves
    setLoading(true);
    getRaces(year)
      .then((d) => setRaces(d.races))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {year} Season
        </p>
        <h1 className="text-xl font-bold text-text mt-0.5">Race Calendar</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rounds</CardTitle>
          <span className="text-[11px] text-text-faint">{races.length} events</span>
        </CardHeader>
        <CardBody className="p-0">
          {loading && (
            <div className="p-4 flex flex-col gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 rounded skeleton" />
              ))}
            </div>
          )}
          {error && <div className="p-4 text-danger text-[13px]">{error}</div>}
          {!loading && !error && (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold w-14">
                    Rnd
                  </th>
                  <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                    Event
                  </th>
                  <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                    Location
                  </th>
                  <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {races.map((r) => (
                  <tr
                    key={r.RoundNumber}
                    onClick={() => router.push(`/races/${year}/${r.RoundNumber}`)}
                    className="border-b border-border/60 cursor-pointer hover:bg-surface-2 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-text-muted tabular-nums">
                      {String(r.RoundNumber).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-2.5 text-text font-medium">{r.EventName}</td>
                    <td className="px-4 py-2.5 text-text-muted">
                      {r.Location}, {r.Country}
                    </td>
                    <td className="px-4 py-2.5 text-text-muted tabular-nums">
                      {formatDate(r.EventDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
