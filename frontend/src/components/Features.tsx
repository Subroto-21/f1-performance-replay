"use client";

import { motion } from "framer-motion";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: (
      <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Live Telemetry",
    description: "Throttle, brake, DRS and gear data visualised at 10 Hz across every lap of the race.",
  },
  {
    icon: (
      <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Sector Timing",
    description: "Compare mini-sector gaps and identify exactly where time is won or lost on each lap.",
  },
  {
    icon: (
      <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Driver Comparison",
    description: "Overlay any two drivers' data side by side for the same lap or full race session.",
  },
  {
    icon: (
      <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    title: "Track Map Replay",
    description: "Animated position replay on a 2D circuit layout, updated every second of the race.",
  },
];

export default function Features() {
  return (
    <section style={{
      position: "relative", background: "#080808",
      padding: "6rem 1.5rem", overflow: "hidden",
    }}>
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }} />

      {/* Top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(to right, transparent, rgba(225,6,0,0.4), transparent)",
      }} />

      <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <span style={{
            display: "inline-block", fontSize: "10px", fontWeight: 700,
            color: "#e10600", textTransform: "uppercase", letterSpacing: "0.25em",
            marginBottom: "1rem",
          }}>
            What&apos;s inside
          </span>
          <h2 style={{
            margin: 0, color: "#fff",
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900,
            lineHeight: 1.1, letterSpacing: "-0.02em",
          }}>
            Built for{" "}
            <span style={{ color: "#e10600" }}>speed nerds</span>
          </h2>
          <p style={{
            marginTop: "1rem", color: "#6b7280",
            fontSize: "1rem", lineHeight: 1.6,
            maxWidth: "420px", marginLeft: "auto", marginRight: "auto",
          }}>
            Every tool you need to analyse race weekends the way engineers do.
          </p>
        </motion.div>

        {/* Grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "1rem",
        }}>
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              style={{
                display: "flex", gap: "1.25rem", padding: "1.5rem",
                borderRadius: "1rem",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                transition: "all 0.3s",
              }}
              whileHover={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              {/* Icon */}
              <div style={{
                width: 48, height: 48, flexShrink: 0,
                background: "rgba(225,6,0,0.1)",
                border: "1px solid rgba(225,6,0,0.2)",
                borderRadius: "0.75rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {feat.icon}
              </div>

              {/* Text */}
              <div>
                <h3 style={{ margin: 0, color: "#fff", fontSize: "15px", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {feat.title}
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "13px", lineHeight: 1.6 }}>
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            marginTop: "4rem", paddingTop: "2.5rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", flexDirection: "row",
            justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: "1rem",
            color: "#4b5563", fontSize: "12px",
          }}
        >
          <span>Data sourced from the FastF1 Python library</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#22c55e", display: "inline-block",
              animation: "pulseGlow 2s infinite",
            }} />
            <span>2020 – 2024 seasons available</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
