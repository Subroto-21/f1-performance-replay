"use client";

import { useMemo, useState } from "react";
import { DriverTelemetry, CornerInfo } from "@/services/sessionsService";
import { cornerLabel, nearestIndexForDistance } from "@/lib/corners";
import { Button } from "@/components/ui/Button";

type Metric = "speed" | "throttle" | "brake";

const METRIC_LABEL: Record<Metric, string> = {
  speed: "Speed",
  throttle: "Throttle",
  brake: "Braking zones",
};

const SPEED_DOMAIN: [number, number] = [40, 340];
const VIEW_W = 900;
const VIEW_H = 520;
const PAD = 36;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function speedColor(v: number): string {
  const t = clamp((v - SPEED_DOMAIN[0]) / (SPEED_DOMAIN[1] - SPEED_DOMAIN[0]), 0, 1);
  const hue = 240 - 240 * t; // blue (slow) -> red (fast)
  return `hsl(${hue}, 85%, 52%)`;
}

function throttleColor(v: number): string {
  const t = clamp(v / 100, 0, 1);
  const hue = 120 * t; // red (0%) -> green (100%)
  return `hsl(${hue}, 75%, 46%)`;
}

function brakeColor(v: number): string {
  return v > 0 ? "#e10600" : "#3a4150";
}

function colorFor(metric: Metric, value: number): string {
  if (metric === "speed") return speedColor(value);
  if (metric === "throttle") return throttleColor(value);
  return brakeColor(value);
}

type Props = {
  drivers: DriverTelemetry[];
  colors: Record<string, string>;
  corners: CornerInfo[];
};

export default function TrackMap({ drivers, colors, corners }: Props) {
  const [metric, setMetric] = useState<Metric>("speed");
  const [activeDriver, setActiveDriver] = useState<string | null>(null);

  const driver = useMemo(() => {
    const found = drivers.find((d) => d.driver === activeDriver);
    return found ?? drivers[0] ?? null;
  }, [drivers, activeDriver]);

  const projected = useMemo(() => {
    if (!driver?.data?.x?.length || !driver.data.y?.length) return null;
    const { x, y } = driver.data;

    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);
    const w = maxX - minX || 1;
    const h = maxY - minY || 1;
    const scale = Math.min((VIEW_W - PAD * 2) / w, (VIEW_H - PAD * 2) / h);
    const offX = (VIEW_W - w * scale) / 2;
    const offY = (VIEW_H - h * scale) / 2;

    const points: [number, number][] = x.map((px, i) => [
      offX + (px - minX) * scale,
      VIEW_H - (offY + (y[i] - minY) * scale), // flip so track reads top-up
    ]);

    return points;
  }, [driver]);

  const cornerMarkers = useMemo(() => {
    if (!driver?.data?.distance?.length || !projected) return [];
    return corners.map((c) => {
      const idx = nearestIndexForDistance(driver.data.distance, c.distance);
      return { label: cornerLabel(c), point: projected[idx] };
    });
  }, [driver, projected, corners]);

  if (!drivers.length || !driver || !projected) return null;

  const values = driver.data[metric];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={metric === m ? "primary" : "secondary"}
              onClick={() => setMetric(m)}
            >
              {METRIC_LABEL[m]}
            </Button>
          ))}
        </div>

        {drivers.length > 1 && (
          <div className="flex items-center gap-1.5">
            {drivers.map((d) => (
              <button
                key={d.driver}
                onClick={() => setActiveDriver(d.driver)}
                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-semibold transition-colors"
                style={{
                  borderColor:
                    driver.driver === d.driver ? colors[d.driver] : "var(--color-border)",
                  background: driver.driver === d.driver ? `${colors[d.driver]}1f` : "transparent",
                  color: driver.driver === d.driver ? colors[d.driver] : "var(--color-text-muted)",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: colors[d.driver] }} />
                {d.driver}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border border-border bg-surface-2 p-2">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto">
          {projected.slice(0, -1).map(([x1, y1], i) => {
            const [x2, y2] = projected[i + 1];
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colorFor(metric, values[i] ?? 0)}
                strokeWidth={7}
                strokeLinecap="round"
              />
            );
          })}
          {cornerMarkers.map(({ label, point: [cx, cy] }) => (
            <g key={label}>
              <circle cx={cx} cy={cy} r={9} fill="#0d0f13" stroke="#8b93a1" strokeWidth={1} />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={8.5}
                fontWeight={600}
                fill="#e7e9ec"
              >
                {label}
              </text>
            </g>
          ))}
          {/* Start/finish marker */}
          <circle
            cx={projected[0][0]}
            cy={projected[0][1]}
            r={6}
            fill="#fff"
            stroke="#000"
            strokeWidth={1.5}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-faint">
        <span>
          {driver.driver} · {METRIC_LABEL[metric]} on this lap
        </span>
        {metric === "brake" ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#e10600" }} /> Braking
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#3a4150" }} /> Off
              brake
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>{metric === "speed" ? `${SPEED_DOMAIN[0]} km/h` : "0%"}</span>
            <span
              className="h-2 w-24 rounded-full"
              style={{
                background:
                  metric === "speed"
                    ? "linear-gradient(90deg, hsl(240,85%,52%), hsl(180,85%,52%), hsl(120,85%,52%), hsl(60,85%,52%), hsl(0,85%,52%))"
                    : "linear-gradient(90deg, hsl(0,75%,46%), hsl(60,75%,46%), hsl(120,75%,46%))",
              }}
            />
            <span>{metric === "speed" ? `${SPEED_DOMAIN[1]} km/h` : "100%"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
