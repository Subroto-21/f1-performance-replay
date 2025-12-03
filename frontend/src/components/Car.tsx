"use client";

import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export default function CarSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Moves car out of view (left) on scroll down
  const rawX = useTransform(scrollYProgress, [0, 1], ["0%", "-1200%"]);

  const x = useSpring(rawX, {
    stiffness: 45, // lower = smoother
    damping: 20, // higher = more resistance
  });

  return (
    <section ref={ref} className="relative w-full overflow-hidden">
      {/* ✅ Background + text wrapper */}
      <div className="relative w-full h-[80vh]">
        {/* Background image behind text */}
        <Image src="/background.png" alt="Race background" fill priority className="z-10" />

        {/* Overlay text on top of image */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-20">
          <h1
            style={{ color: "#ffffff", zIndex: 20, position: "relative" }}
            className="text-4xl md:text-5xl font-semibold tracking-tight"
          >
            F1 <span style={{ color: "#ef4444" }}>Performance Replay</span>
          </h1>

          <p
            style={{ color: "#e5e7eb", zIndex: 20, position: "relative" }}
            className="text-sm md:text-base mt-3"
          >
            Select a season and race to explore telemetry and replay data
          </p>
        </div>
      </div>

      {/* 🏎️ Animated Car */}
      <motion.div
        style={{ x }}
        className="absolute bottom-[-5%] w-[50%] md:w-[55%] lg:w-[45%] left-1/2 -translate-x-1/2 z-10"
      >
        <Image
          src="/car.png"
          alt="F1 Car"
          width={1200}
          height={600}
          className="w-full h-auto object-contain"
        />
      </motion.div>
    </section>
  );
}
