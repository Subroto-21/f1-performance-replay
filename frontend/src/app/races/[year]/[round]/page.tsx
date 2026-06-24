"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRaceSessions, RaceSessionsResponse, SessionMeta } from "@/services/sessionsService";
import { formatDate } from "@/lib/formatters";

const SESSION_ICON: Record<string, string> = {
  FP1: "P1", FP2: "P2", FP3: "P3", Q: "Q", SQ: "SQ", S: "SP", R: "R",
};

const SESSION_COLOR: Record<string, string> = {
  FP1: "#3b82f6", FP2: "#3b82f6", FP3: "#3b82f6",
  Q: "#a855f7", SQ: "#a855f7",
  S: "#f97316",
  R: "#e10600",
};

export default function RacePage() {
  const params  = useParams();
  const router  = useRouter();
  const year    = Number(params.year);
  const round   = Number(params.round);

  const [data, setData]     = useState<RaceSessionsResponse | null>(null);
  const [error, setError]   = useState<string | null>(null);
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
    <div style={{ minHeight: "100vh", background: "#000", paddingBottom: "6rem" }}>
      {/* Header */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(to bottom, #0d0d0d, #000)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "3rem 1.5rem 2.5rem",
      }}>
        {/* Red accent top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#e10600" }} />

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Back */}
          <button
            onClick={() => router.push("/")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "none", border: "none", color: "#6b7280",
              fontSize: 13, cursor: "pointer", marginBottom: "1.5rem",
              padding: 0,
            }}
          >
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </button>

          {loading ? (
            <div style={{ color: "#6b7280", fontSize: 14 }}>Loading event info…</div>
          ) : error ? (
            <div style={{ color: "#f87171", fontSize: 14 }}>{error}</div>
          ) : data ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{
                  width: 44, height: 44, background: "#e10600", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 13, color: "#fff", flexShrink: 0,
                }}>
                  R{round}
                </div>
                <div>
                  <h1 style={{ margin: 0, color: "#fff", fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
                    {data.event_name}
                  </h1>
                  <p style={{ margin: "0.35rem 0 0", color: "#6b7280", fontSize: 13 }}>
                    {data.location}, {data.country} · {formatDate(data.date)} · {data.year}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Sessions */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {!loading && !error && data && (
          <>
            <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "1.25rem" }}>
              Sessions
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
              {data.sessions.map((s, i) => (
                <motion.button
                  key={s.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => goToSession(s)}
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    padding: "1.25rem 1.5rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    display: "flex", flexDirection: "column", gap: "0.5rem",
                  }}
                  whileHover={{ backgroundColor: "#141414", borderColor: "rgba(255,255,255,0.14)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: `${SESSION_COLOR[s.key] ?? "#e10600"}20`,
                    border: `1px solid ${SESSION_COLOR[s.key] ?? "#e10600"}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: 12,
                    color: SESSION_COLOR[s.key] ?? "#e10600",
                  }}>
                    {SESSION_ICON[s.key] ?? s.key}
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "#fff", fontWeight: 700, fontSize: 14 }}>{s.name}</p>
                    <p style={{ margin: "0.2rem 0 0", color: "#6b7280", fontSize: 12 }}>
                      View data →
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                height: 96, borderRadius: 12,
                background: "linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
