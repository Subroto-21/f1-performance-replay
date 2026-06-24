"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { DriverTelemetry } from "@/services/sessionsService";

type Panel = "speed" | "throttle" | "brake" | "gear";

const PANEL_CONFIG: Record<Panel, { label: string; unit: string; domain: [number, number] }> = {
  speed:    { label: "Speed",    unit: "km/h", domain: [0, 380] },
  throttle: { label: "Throttle", unit: "%",    domain: [0, 100] },
  brake:    { label: "Brake",    unit: "",     domain: [0, 1]   },
  gear:     { label: "Gear",     unit: "",     domain: [1, 8]   },
};

const PANELS: Panel[] = ["speed", "throttle", "brake", "gear"];

type Props = {
  drivers: DriverTelemetry[];
};

export default function TelemetryChart({ drivers }: Props) {
  if (!drivers.length) return null;

  // Merge distance arrays from all drivers into one chart-data array
  const base = drivers[0].data.distance;
  const chartData = base.map((dist, i) => {
    const row: Record<string, number> = { distance: dist };
    for (const drv of drivers) {
      if (!drv.error && drv.data) {
        row[`${drv.driver}_speed`]    = drv.data.speed[i]    ?? 0;
        row[`${drv.driver}_throttle`] = drv.data.throttle[i] ?? 0;
        row[`${drv.driver}_brake`]    = drv.data.brake[i]    ?? 0;
        row[`${drv.driver}_gear`]     = drv.data.gear[i]     ?? 0;
      }
    }
    return row;
  });

  const validDrivers = drivers.filter((d) => !d.error && d.data);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {PANELS.map((panel) => {
        const cfg = PANEL_CONFIG[panel];
        return (
          <div key={panel}>
            {/* Panel label */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "0.5rem",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {cfg.label}{cfg.unit ? ` (${cfg.unit})` : ""}
              </span>
              {/* Driver legend */}
              <div style={{ display: "flex", gap: "1rem" }}>
                {validDrivers.map((drv) => (
                  <span key={drv.driver} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "11px", color: "#9ca3af" }}>
                    <span style={{ width: 20, height: 2, background: drv.driver === validDrivers[0].driver ? "#e10600" : "#60a5fa", display: "inline-block", borderRadius: 2 }} />
                    {drv.driver}
                  </span>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={panel === "speed" ? 180 : 90}>
              <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="distance"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tick={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={cfg.domain}
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  tickCount={4}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, fontSize: 12, color: "#fff",
                  }}
                  formatter={(val, name) => {
                    const v = Number(val);
                    const label = panel === "speed" ? `${v} km/h` : panel === "throttle" ? `${v}%` : v;
                    return [label, String(name).split("_")[0]];
                  }}
                  labelFormatter={(d) => `${Math.round(d as number)} m`}
                />
                {validDrivers.map((drv, idx) => (
                  <Line
                    key={drv.driver}
                    type="monotone"
                    dataKey={`${drv.driver}_${panel}`}
                    stroke={idx === 0 ? "#e10600" : "#60a5fa"}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Separator */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginTop: "0.75rem" }} />
          </div>
        );
      })}
    </div>
  );
}
