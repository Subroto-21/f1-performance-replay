"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRaceSessions, RaceSessionsResponse, SessionMeta } from "@/services/sessionsService";
import { formatDate } from "@/lib/formatters";
import { Card, CardBody } from "@/components/ui/Card";

const SESSION_COLOR: Record<string, string> = {
  FP1: "#4f8cff",
  FP2: "#4f8cff",
  FP3: "#4f8cff",
  Q: "#a855f7",
  SQ: "#a855f7",
  S: "#f97316",
  R: "#22c55e",
};

export default function RacePage() {
  const params = useParams();
  const router = useRouter();
  const year = Number(params.year);
  const round = Number(params.round);

  const [data, setData] = useState<RaceSessionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRaceSessions(year, round)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year, round]);

  const goToSession = (s: SessionMeta) => {
    router.push(`/races/${year}/${round}/${s.key}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {loading ? (
        <div className="h-16 rounded skeleton mb-6" />
      ) : error ? (
        <div className="text-danger text-[13px] mb-6">{error}</div>
      ) : data ? (
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Round {round} · {data.year}
          </p>
          <h1 className="text-xl font-bold text-text mt-0.5">{data.event_name}</h1>
          <p className="text-[12px] text-text-faint mt-1">
            {data.location}, {data.country} · {formatDate(data.date)}
          </p>
        </div>
      ) : null}

      {!loading && !error && data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {data.sessions.map((s) => (
            <Card
              key={s.key}
              className="cursor-pointer hover:border-border-strong transition-colors"
              onClick={() => goToSession(s)}
            >
              <CardBody className="flex flex-col gap-3">
                <span
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold"
                  style={{
                    color: SESSION_COLOR[s.key] ?? "#4f8cff",
                    background: `${SESSION_COLOR[s.key] ?? "#4f8cff"}1a`,
                    border: `1px solid ${SESSION_COLOR[s.key] ?? "#4f8cff"}40`,
                  }}
                >
                  {s.key}
                </span>
                <div>
                  <p className="text-text font-medium text-[13px]">{s.name}</p>
                  <p className="text-text-faint text-[11px] mt-0.5">Open workspace →</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
