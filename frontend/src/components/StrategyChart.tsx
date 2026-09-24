"use client";

import { DriverLaps } from "@/services/sessionsService";
import { compoundColor } from "@/lib/formatters";

type Stint = {
  compound: string;
  startLap: number;
  endLap: number;
};

function buildStints(laps: DriverLaps["laps"]): Stint[] {
  const sorted = [...laps].sort((a, b) => (a.lap_number ?? 0) - (b.lap_number ?? 0));
  const stints: Stint[] = [];
  let currentStintNumber: number | null = null;

  for (const lap of sorted) {
    if (lap.lap_number == null) continue;
    const last = stints[stints.length - 1];

    if (last && lap.stint === currentStintNumber) {
      last.endLap = lap.lap_number;
    } else {
      stints.push({ compound: lap.compound, startLap: lap.lap_number, endLap: lap.lap_number });
      currentStintNumber = lap.stint;
    }
  }
  return stints;
}

type Props = {
  selectedDrivers: string[];
  driverLaps: DriverLaps[];
  colors: Record<string, string>;
};

export default function StrategyChart({ selectedDrivers, driverLaps, colors }: Props) {
  const relevant = driverLaps.filter((d) => selectedDrivers.includes(d.driver));
  const totalLaps = Math.max(1, ...relevant.flatMap((d) => d.laps.map((l) => l.lap_number ?? 0)));

  if (relevant.length === 0) {
    return (
      <p className="text-[13px] text-text-faint">
        Select at least one driver to see tyre strategy.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {relevant.map((d) => {
        const stints = buildStints(d.laps);
        return (
          <div key={d.driver} className="flex items-center gap-3">
            <div className="w-16 shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: colors[d.driver] }} />
              <span className="text-[12px] font-semibold text-text">{d.driver}</span>
            </div>
            <div className="flex-1 flex h-6 rounded overflow-hidden border border-border">
              {stints.map((s, i) => {
                const laps = s.endLap - s.startLap + 1;
                const pct = (laps / totalLaps) * 100;
                const color = compoundColor(s.compound);
                return (
                  <div
                    key={i}
                    title={`${s.compound || "Unknown"} · Laps ${s.startLap}-${s.endLap} (${laps})`}
                    style={{
                      width: `${pct}%`,
                      background: `${color}55`,
                      borderRight: "1px solid var(--color-bg)",
                    }}
                    className="flex items-center justify-center overflow-hidden"
                  >
                    {pct > 6 && (
                      <span className="text-[10px] font-semibold" style={{ color }}>
                        {laps}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 pt-1">
        {["SOFT", "MEDIUM", "HARD", "INTER", "WET"].map((c) => (
          <div key={c} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: compoundColor(c) }} />
            <span className="text-[11px] text-text-faint">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
