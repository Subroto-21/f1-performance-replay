"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getRaces } from "@/services/racesService";

const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020];

const STATS = [
  { value: "5", label: "Seasons" },
  { value: "100+", label: "Grand Prix" },
  { value: "20+", label: "Teams" },
  { value: "1M+", label: "Data Points" },
];

export default function RaceSelect() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [races, setRaces]   = useState<{ RoundNumber: number; EventName: string; Location: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setSelectedRace(null);
        const data = await getRaces(selectedYear);
        setRaces(data.races);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedYear]);

  const handleViewSessions = () => {
    if (selectedYear && selectedRace) router.push(`/races/${selectedYear}/${selectedRace}`);
  };

  const selectedRaceData = races.find((r) => r.RoundNumber === selectedRace);

  return (
    <section style={{ position: "relative", background: "#000" }}>
      {/* Gradient bridge from hero */}
      <div style={{ height: "5rem", background: "linear-gradient(to bottom, #000, #e10600)" }} />

      {/* Red-to-dark gradient body */}
      <div style={{ background: "linear-gradient(to bottom, #e10600 0%, #b40000 30%, #0a0a0a 100%)", paddingBottom: "6rem" }}>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            maxWidth: "640px", margin: "0 auto", padding: "0 1.5rem 3rem",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem",
            textAlign: "center",
          }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <span style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{
                fontSize: "10px", color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase", letterSpacing: "0.18em",
                marginTop: "0.4rem", fontWeight: 600,
              }}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ maxWidth: "480px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div style={{
            background: "#0c0c0c",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}>
            {/* Card header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {["#e10600", "rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"].map((c, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />
                ))}
              </div>
              <span style={{
                flex: 1, textAlign: "center",
                color: "#fff", fontSize: "12px", fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase",
              }}>
                Race Selector
              </span>
            </div>

            {/* Card body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Season */}
              <div>
                <label style={{
                  display: "block", fontSize: "10px", fontWeight: 700,
                  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.2em",
                  marginBottom: "0.75rem",
                }}>
                  Season
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                  {AVAILABLE_YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      style={{
                        padding: "0.6rem 0",
                        borderRadius: "0.625rem",
                        fontSize: "13px", fontWeight: 800,
                        cursor: "pointer", transition: "all 0.2s",
                        background: selectedYear === year ? "#e10600" : "rgba(255,255,255,0.05)",
                        color: selectedYear === year ? "#fff" : "#6b7280",
                        border: selectedYear === year ? "none" : "1px solid rgba(255,255,255,0.06)",
                        boxShadow: selectedYear === year ? "0 0 20px rgba(225,6,0,0.35)" : "none",
                      }}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grand Prix */}
              <div>
                <label style={{
                  display: "block", fontSize: "10px", fontWeight: 700,
                  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.2em",
                  marginBottom: "0.75rem",
                }}>
                  Grand Prix
                  {loading && (
                    <span style={{ marginLeft: "0.5rem", color: "#e10600", fontWeight: 400, textTransform: "none", letterSpacing: 0, animation: "pulseGlow 1s infinite" }}>
                      Loading…
                    </span>
                  )}
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedRace ?? ""}
                    onChange={(e) => setSelectedRace(e.target.value ? Number(e.target.value) : null)}
                    disabled={loading || races.length === 0}
                    style={{
                      width: "100%",
                      background: "#141414",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 2.5rem 0.75rem 1rem",
                      color: "#fff", fontSize: "14px",
                      appearance: "none", cursor: "pointer",
                      outline: "none",
                      opacity: loading || races.length === 0 ? 0.4 : 1,
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(225,6,0,0.5)"; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    <option value="" disabled style={{ background: "#141414", color: "#555" }}>
                      {loading ? "Loading races…" : "Select a Grand Prix"}
                    </option>
                    {races.map((r) => (
                      <option key={r.RoundNumber} value={r.RoundNumber} style={{ background: "#141414" }}>
                        Round {String(r.RoundNumber).padStart(2, "0")} — {r.EventName}
                      </option>
                    ))}
                  </select>
                  <svg
                    style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }}
                    width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Preview */}
              <AnimatePresence>
                {selectedRaceData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.875rem 1rem",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "0.75rem",
                    }}>
                      <div style={{
                        width: 36, height: 36, flexShrink: 0,
                        background: "rgba(225,6,0,0.15)",
                        border: "1px solid rgba(225,6,0,0.25)",
                        borderRadius: "0.5rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#f87171", fontSize: "11px", fontWeight: 800,
                      }}>
                        {String(selectedRaceData.RoundNumber).padStart(2, "0")}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, color: "#fff", fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {selectedRaceData.EventName}
                        </p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>
                          {selectedRaceData.Location}
                        </p>
                      </div>
                      <svg style={{ marginLeft: "auto", flexShrink: 0, color: "rgba(225,6,0,0.6)" }}
                        width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <button
                disabled={!selectedRace}
                onClick={handleViewSessions}
                style={{
                  width: "100%", padding: "0.9rem",
                  borderRadius: "0.75rem",
                  fontWeight: 800, fontSize: "13px",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  cursor: selectedRace ? "pointer" : "not-allowed",
                  border: "none",
                  background: "#e10600",
                  color: "#fff",
                  opacity: selectedRace ? 1 : 0.25,
                  transition: "all 0.3s",
                  boxShadow: selectedRace ? "0 0 30px rgba(225,6,0,0.3)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
                onMouseEnter={(e) => { if (selectedRace) { e.currentTarget.style.background = "#ff1e00"; e.currentTarget.style.boxShadow = "0 0 40px rgba(225,6,0,0.5)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#e10600"; e.currentTarget.style.boxShadow = selectedRace ? "0 0 30px rgba(225,6,0,0.3)" : "none"; }}
              >
                View Sessions
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
