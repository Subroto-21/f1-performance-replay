"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

const SPEED_LINES = [
  { top: "18%", width: "38%", duration: 1.3, delay: 0.0, opacity: 0.18 },
  { top: "30%", width: "55%", duration: 1.7, delay: 0.4, opacity: 0.10 },
  { top: "44%", width: "42%", duration: 2.0, delay: 0.8, opacity: 0.22 },
  { top: "56%", width: "28%", duration: 1.5, delay: 0.2, opacity: 0.14 },
  { top: "68%", width: "60%", duration: 2.3, delay: 0.6, opacity: 0.08 },
  { top: "78%", width: "35%", duration: 1.6, delay: 1.0, opacity: 0.16 },
];

export default function CarSection() {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const rawX        = useTransform(scrollYProgress, [0, 1], ["0%", "-1200%"]);
  const x           = useSpring(rawX, { stiffness: 45, damping: 20 });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.5], [0, -30]);

  return (
    <section ref={ref} style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {/* Fixed-height hero wrapper */}
      <div style={{ position: "relative", width: "100%", height: "88vh" }}>
        {/* Background */}
        <Image
          src="/background.png"
          alt="Race background"
          fill
          priority
          style={{ objectFit: "cover", zIndex: 0 }}
        />

        {/* Dark overlays */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to right, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.4))",
        }} />

        {/* Speed lines */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, overflow: "hidden", pointerEvents: "none" }}>
          {SPEED_LINES.map((l, i) => (
            <span
              key={i}
              className="speed-line"
              style={{
                top: l.top, width: l.width, opacity: l.opacity,
                animationDuration: `${l.duration}s`,
                animationDelay: `${l.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", zIndex: 3,
          background: "linear-gradient(to right, transparent, rgba(225,6,0,0.5), transparent)",
        }} />

        {/* Hero content — centred with inline flex */}
        <motion.div
          style={{
            position: "absolute", inset: 0, zIndex: 4,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "0 1.5rem",
            opacity: heroOpacity, y: heroY,
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ marginBottom: "1.75rem" }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.35rem 1rem", borderRadius: "9999px",
              background: "rgba(225,6,0,0.12)", border: "1px solid rgba(225,6,0,0.35)",
              color: "#f87171", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e10600", display: "inline-block", animation: "pulseGlow 2s infinite" }} />
              Formula 1 · Season 2020 – 2024
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{
              margin: 0, padding: 0,
              fontSize: "clamp(3rem, 8vw, 7rem)",
              fontWeight: 900, lineHeight: 0.9,
              letterSpacing: "-0.03em", color: "#fff",
            }}
          >
            F1{" "}
            <span className="glow-text" style={{ color: "#e10600" }}>Perf</span>
            <span style={{ color: "rgba(255,255,255,0.93)" }}>ormance</span>
            <br />
            <span style={{
              fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
              fontWeight: 200, letterSpacing: "0.3em",
              color: "rgba(255,255,255,0.7)", textTransform: "uppercase",
            }}>
              Replay
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{
              marginTop: "1.25rem", color: "#9ca3af",
              fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
              maxWidth: "440px", lineHeight: 1.6,
            }}
          >
            Explore telemetry, sector times &amp; race data
            from every Grand Prix
          </motion.p>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            style={{
              marginTop: "3rem", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "0.4rem", color: "#4b5563",
            }}
          >
            <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Scroll to explore
            </span>
            <motion.svg
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              width={16} height={16} fill="none" viewBox="0 0 24 24"
              stroke="#e10600" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated car — left:27.5% centres a 45%-wide element; only Framer x moves it */}
      <motion.div
        style={{
          x,
          position: "absolute", bottom: "-3%", zIndex: 10,
          width: "45%", left: "27.5%",
        }}
      >
        <Image
          src="/car.png"
          alt="F1 Car"
          width={1200}
          height={600}
          style={{
            width: "100%", height: "auto", objectFit: "contain",
            filter: "drop-shadow(0 8px 50px rgba(225,6,0,0.4))",
          }}
        />
      </motion.div>
    </section>
  );
}
