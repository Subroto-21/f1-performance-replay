"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import { DriverLaps } from "@/services/sessionsService";
import { formatLapTime, compoundColor } from "@/lib/formatters";
import { buildFlagBands, FLAG_STYLE } from "@/lib/trackStatus";
import { Button } from "@/components/ui/Button";
import { downloadCsv } from "@/lib/exportCsv";

type Props = {
  selectedDrivers: string[];
  driverLaps: DriverLaps[];
  colors: Record<string, string>;
};

export default function PaceChart({ selectedDrivers, driverLaps, colors }: Props) {
  const relevant = driverLaps.filter((d) => selectedDrivers.includes(d.driver));

  const maxLap = Math.max(0, ...relevant.flatMap((d) => d.laps.map((l) => l.lap_number ?? 0)));

  // Derived from every driver's laps (not just the selected ones) so one
  // driver's slightly-off lap boundary doesn't hide a real SC/VSC period.
  const flagBands = useMemo(
    () =>
      buildFlagBands(
        driverLaps.map((d) => d.laps),
        maxLap
      ),
    [driverLaps, maxLap]
  );

  const chartData = useMemo(() => {
    const rows: Record<string, number | string>[] = [];
    for (let lap = 1; lap <= maxLap; lap++) {
      const row: Record<string, number | string> = { lap };
      for (const d of relevant) {
        const rec = d.laps.find((l) => l.lap_number === lap);
        if (rec?.lap_time != null && !rec.pit_in && !rec.pit_out) {
          row[`${d.driver}_time`] = rec.lap_time;
          row[`${d.driver}_compound`] = rec.compound;
        }
      }
      rows.push(row);
    }
    return rows;
  }, [relevant, maxLap]);

  const handleExport = () => {
    const rows = relevant.flatMap((d) => d.laps.map((l) => ({ driver: d.driver, ...l })));
    downloadCsv(`pace_${selectedDrivers.join("-")}`, rows);
  };

  if (relevant.length === 0) {
    return (
      <p className="text-[13px] text-text-faint">Select at least one driver to see lap pace.</p>
    );
  }

  const activeCategories = Array.from(new Set(flagBands.map((b) => b.category)));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {activeCategories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-faint">
            {activeCategories.map((cat) => (
              <span key={cat} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: FLAG_STYLE[cat].color, opacity: 0.7 }}
                />
                {FLAG_STYLE[cat].label}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <Button size="sm" variant="secondary" onClick={handleExport}>
          Export CSV
        </Button>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="lap"
            type="number"
            domain={[1, maxLap]}
            tick={{ fill: "#565e6b", fontSize: 10 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            label={{
              value: "Lap",
              position: "insideBottom",
              offset: -2,
              fill: "#565e6b",
              fontSize: 10,
            }}
          />
          <YAxis
            tick={{ fill: "#565e6b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => formatLapTime(v)}
            reversed
          />
          <Tooltip
            contentStyle={{
              background: "#171b22",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              fontSize: 12,
              color: "#e7e9ec",
            }}
            formatter={(val, name) => [formatLapTime(Number(val)), String(name).split("_")[0]]}
            labelFormatter={(l) => {
              const band = flagBands.find((b) => l >= b.start && l <= b.end);
              return band ? `Lap ${l} · ${FLAG_STYLE[band.category].label}` : `Lap ${l}`;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => <span style={{ color: "#8b93a1" }}>{value}</span>}
          />
          {flagBands.map((b) => (
            <ReferenceArea
              key={`${b.start}-${b.end}`}
              x1={b.start - 0.5}
              x2={b.end + 0.5}
              fill={FLAG_STYLE[b.category].color}
              fillOpacity={0.16}
              stroke={FLAG_STYLE[b.category].color}
              strokeOpacity={0.5}
              ifOverflow="extendDomain"
              label={{
                value: FLAG_STYLE[b.category].label,
                position: "insideTop",
                fill: FLAG_STYLE[b.category].color,
                fontSize: 10,
                fontWeight: 700,
              }}
            />
          ))}
          {relevant.map((d) => (
            <Line
              key={d.driver}
              name={d.driver}
              type="monotone"
              dataKey={`${d.driver}_time`}
              stroke={colors[d.driver] ?? "#8b93a1"}
              strokeWidth={1.5}
              connectNulls
              dot={(props) => {
                const { cx, cy, payload, key } = props;
                const compound = payload[`${d.driver}_compound`];
                if (payload[`${d.driver}_time`] == null) return <g key={key} />;
                return (
                  <circle
                    key={key}
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill={compound ? compoundColor(compound) : (colors[d.driver] ?? "#8b93a1")}
                  />
                );
              }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
