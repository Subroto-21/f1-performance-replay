"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getSessionResults,
  getSessionTelemetry,
  SessionResultsResponse,
  TelemetryResponse,
  DriverTelemetry,
} from "@/services/sessionsService";
import { formatLapTime, formatGap, compoundColor } from "@/lib/formatters";
import TelemetryChart from "@/components/TelemetryChart";

const SESSION_LABEL: Record<string, string> = {
  FP1: "Practice 1", FP2: "Practice 2", FP3: "Practice 3",
  Q: "Qualifying", SQ: "Sprint Qualifying", S: "Sprint", R: "Race",
};

function CompoundBadge({ compound }: { compound: string }) {
  const color = compoundColor(compound);
  return (
    <span style={{
      display: "inline-block", padding: "0.15rem 0.5rem",
      borderRadius: 4, fontSize: 10, fontWeight: 800,
      color, border: `1px solid ${color}60`,
      background: `${color}15`,
      textTransform: "uppercase", letterSpacing: "0.08em",
    }}>
      {compound || "—"}
    </span>
  );
}

export default function SessionPage() {
  const params  = useParams();
  const router  = useRouter();
  const year    = Number(params.year);
  const round   = Number(params.round);
  const session = String(params.session);

  const [results, setResults]     = useState<SessionResultsResponse | null>(null);
  const [resultsErr, setResultsErr] = useState<string | null>(null);
  const [resultsLoading, setResultsLoading] = useState(true);

  const [d1, setD1] = useState<string>("");
  const [d2, setD2] = useState<string>("");

  const [telemetry, setTelemetry]   = useState<TelemetryResponse | null>(null);
  const [telErr, setTelErr]         = useState<string | null>(null);
  const [telLoading, setTelLoading] = useState(false);

  // Load results on mount
  useEffect(() => {
    getSessionResults(year, round, session)
      .then((data) => {
        setResults(data);
        const drivers = data.drivers.filter((d) => d.abbreviation);
        if (drivers.length >= 1) setD1(drivers[0].abbreviation);
        if (drivers.length >= 2) setD2(drivers[1].abbreviation);
      })
      .catch((e) => setResultsErr(e.message))
      .finally(() => setResultsLoading(false));
  }, [year, round, session]);

  const loadTelemetry = () => {
    if (!d1 || !d2) return;
    setTelLoading(true);
    setTelErr(null);
    setTelemetry(null);
    getSessionTelemetry(year, round, session, [d1, d2])
      .then(setTelemetry)
      .catch((e) => setTelErr(e.message))
      .finally(() => setTelLoading(false));
  };

  const isQual  = ["Q", "SQ"].includes(session);
  const isRace  = ["R", "S"].includes(session);
  const drivers = results?.drivers ?? [];

  const leaderTime = isQual
    ? (drivers[0]?.q3 ?? drivers[0]?.q2 ?? drivers[0]?.q1 ?? null)
    : drivers[0]?.time ?? null;

  const validTelDrivers: DriverTelemetry[] = telemetry?.drivers.filter((d) => !d.error && d.data) ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#000", paddingBottom: "6rem" }}>
      {/* Header */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "#0a0a0a",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "2.5rem 1.5rem 2rem",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#e10600" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button
            onClick={() => router.push(`/races/${year}/${round}`)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "none", border: "none", color: "#6b7280",
              fontSize: 13, cursor: "pointer", marginBottom: "1.25rem", padding: 0,
            }}
          >
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {results?.event_name ?? "Back"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{
              padding: "0.3rem 0.8rem", borderRadius: 6,
              background: "rgba(225,6,0,0.15)", border: "1px solid rgba(225,6,0,0.3)",
              color: "#f87171", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
            }}>
              {SESSION_LABEL[session] ?? session}
            </div>
            <h1 style={{ margin: 0, color: "#fff", fontSize: "clamp(1.25rem,3vw,1.75rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
              {results?.event_name ?? "…"} · {year}
            </h1>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* ── Results table ─────────────────────────────────────── */}
        <section style={{ marginBottom: "3rem" }}>
          <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "1rem" }}>
            Results
          </p>

          {resultsLoading && (
            <div style={{ color: "#6b7280", fontSize: 14, padding: "2rem 0" }}>
              Loading session data… (first load may take 30–60 s)
            </div>
          )}

          {resultsErr && (
            <div style={{
              padding: "1rem 1.25rem", borderRadius: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", fontSize: 13,
            }}>
              {resultsErr}
            </div>
          )}

          {!resultsLoading && !resultsErr && drivers.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["POS", "Driver", "Team", isQual ? "Q1" : "", isQual ? "Q2" : "", isQual ? "Q3" : "", isRace ? "Time / Status" : "", "Fastest Lap", "Compound"].filter(Boolean).map((h) => (
                      <th key={h} style={{
                        padding: "0.5rem 0.75rem", textAlign: "left",
                        color: "#4b5563", fontWeight: 700, fontSize: 10,
                        textTransform: "uppercase", letterSpacing: "0.12em",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((drv, i) => {
                    const fl = results?.fastest_laps[drv.abbreviation];
                    const bestTime = isQual ? (drv.q3 ?? drv.q2 ?? drv.q1) : drv.time;
                    const gap = bestTime != null && leaderTime != null ? bestTime - leaderTime : null;

                    return (
                      <motion.tr
                        key={drv.abbreviation}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025 }}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        {/* POS */}
                        <td style={{ padding: "0.65rem 0.75rem", color: drv.position === 1 ? "#fbbf24" : "#6b7280", fontWeight: 800, width: 36 }}>
                          {drv.position ?? "—"}
                        </td>
                        {/* Driver */}
                        <td style={{ padding: "0.65rem 0.75rem", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: 3, height: 20, background: drv.team_color, borderRadius: 2, display: "inline-block", flexShrink: 0 }} />
                            <span style={{ color: "#fff", fontWeight: 700 }}>{drv.abbreviation}</span>
                            <span style={{ color: "#6b7280", fontSize: 12 }}>{drv.full_name}</span>
                          </div>
                        </td>
                        {/* Team */}
                        <td style={{ padding: "0.65rem 0.75rem", color: "#9ca3af", whiteSpace: "nowrap" }}>{drv.team}</td>

                        {/* Qualifying columns */}
                        {isQual && (
                          <>
                            <td style={{ padding: "0.65rem 0.75rem", color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{formatLapTime(drv.q1)}</td>
                            <td style={{ padding: "0.65rem 0.75rem", color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{formatLapTime(drv.q2)}</td>
                            <td style={{ padding: "0.65rem 0.75rem", color: drv.q3 != null ? "#fff" : "#6b7280", fontWeight: drv.q3 != null ? 700 : 400, fontVariantNumeric: "tabular-nums" }}>
                              {formatLapTime(drv.q3 ?? drv.q2 ?? drv.q1)}
                              {i === 0 && <span style={{ marginLeft: 4, color: "#fbbf24", fontSize: 10 }}>P1</span>}
                              {i > 0 && gap != null && (
                                <span style={{ marginLeft: 4, color: "#6b7280", fontSize: 11 }}>{formatGap(gap)}</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Race columns */}
                        {isRace && (
                          <td style={{ padding: "0.65rem 0.75rem", color: drv.status === "Finished" || !drv.status ? "#fff" : "#f87171", fontVariantNumeric: "tabular-nums" }}>
                            {i === 0 ? formatLapTime(drv.time) : drv.status && drv.status !== "Finished" ? drv.status : formatGap(gap)}
                          </td>
                        )}

                        {/* Fastest lap */}
                        <td style={{ padding: "0.65rem 0.75rem", color: "#c084fc", fontWeight: 600, fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
                          {formatLapTime(fl?.lap_time)}
                        </td>

                        {/* Compound */}
                        <td style={{ padding: "0.65rem 0.75rem" }}>
                          {fl?.compound ? <CompoundBadge compound={fl.compound} /> : "—"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Telemetry comparison ──────────────────────────────── */}
        {!resultsLoading && !resultsErr && drivers.length > 0 && (
          <section>
            <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "1.25rem" }}>
              Telemetry Comparison — Fastest Lap
            </p>

            {/* Driver pickers + load button */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "1.5rem" }}>
              {[{ val: d1, set: setD1, color: "#e10600" }, { val: d2, set: setD2, color: "#60a5fa" }].map(({ val, set, color }, idx) => (
                <div key={idx}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.4rem" }}>
                    Driver {idx + 1}
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      style={{
                        background: "#111", border: `1px solid ${color}60`,
                        borderRadius: 8, padding: "0.6rem 2rem 0.6rem 0.75rem",
                        color: "#fff", fontSize: 13, appearance: "none", cursor: "pointer",
                        outline: "none", minWidth: 120,
                      }}
                    >
                      {drivers.map((d) => (
                        <option key={d.abbreviation} value={d.abbreviation} style={{ background: "#111" }}>
                          {d.abbreviation} – {d.full_name}
                        </option>
                      ))}
                    </select>
                    <svg style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#4b5563" }} width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ))}

              <button
                onClick={loadTelemetry}
                disabled={!d1 || !d2 || d1 === d2 || telLoading}
                style={{
                  padding: "0.6rem 1.25rem", borderRadius: 8,
                  background: "#e10600", color: "#fff",
                  border: "none", fontWeight: 800, fontSize: 12,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: (!d1 || !d2 || d1 === d2 || telLoading) ? "not-allowed" : "pointer",
                  opacity: (!d1 || !d2 || d1 === d2 || telLoading) ? 0.5 : 1,
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}
              >
                {telLoading ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Loading…
                  </>
                ) : "Load Telemetry"}
              </button>
            </div>

            {/* Slow-load notice */}
            {telLoading && (
              <div style={{ padding: "1rem 1.25rem", borderRadius: 8, background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", color: "#93c5fd", fontSize: 13, marginBottom: "1.5rem" }}>
                Fetching telemetry from FastF1… first load may take up to 60 s while data is cached.
              </div>
            )}

            {telErr && (
              <div style={{ padding: "1rem 1.25rem", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 13, marginBottom: "1.5rem" }}>
                {telErr}
              </div>
            )}

            {/* Charts */}
            {validTelDrivers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12, padding: "1.5rem",
                }}
              >
                {/* Driver summary pills */}
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                  {validTelDrivers.map((drv, idx) => (
                    <div key={drv.driver} style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.4rem 0.75rem", borderRadius: 6,
                      background: "rgba(255,255,255,0.04)", border: `1px solid ${idx === 0 ? "rgba(225,6,0,0.3)" : "rgba(96,165,250,0.3)"}`,
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: idx === 0 ? "#e10600" : "#60a5fa" }} />
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{drv.driver}</span>
                      <span style={{ color: "#6b7280", fontSize: 12 }}>{formatLapTime(drv.lap_time)} · Lap {drv.lap_number}</span>
                      {drv.compound && <CompoundBadge compound={drv.compound} />}
                    </div>
                  ))}
                </div>

                <TelemetryChart drivers={validTelDrivers} />
              </motion.div>
            )}
          </section>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
