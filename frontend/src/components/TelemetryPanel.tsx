"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  DriverLaps,
  DriverTelemetry,
  TelemetryResponse,
  CornerInfo,
} from "@/services/sessionsService";
import { formatLapTime, compoundColor } from "@/lib/formatters";
import { cornerLabel, nearestCornerLabel } from "@/lib/corners";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { downloadCsv } from "@/lib/exportCsv";
import LapPicker from "@/components/LapPicker";
import TrackMap from "@/components/TrackMap";

type Channel = "speed" | "throttle" | "brake" | "gear" | "drs";

const CHANNEL_CONFIG: Record<Channel, { label: string; unit: string; domain: [number, number] }> = {
  speed: { label: "Speed", unit: "km/h", domain: [0, 380] },
  throttle: { label: "Throttle", unit: "%", domain: [0, 100] },
  brake: { label: "Brake", unit: "", domain: [0, 1] },
  gear: { label: "Gear", unit: "", domain: [1, 8] },
  drs: { label: "DRS", unit: "", domain: [0, 1] },
};

const ALL_CHANNELS: Channel[] = ["speed", "throttle", "brake", "gear", "drs"];
const DEFAULT_ON: Channel[] = ["speed", "throttle", "brake", "gear"];

// 2026 regs dropped the classic wing-flap DRS for an active-aero / Manual
// Override Mode system — the DRS telemetry channel is always 0 from then on.
const DRS_REMOVED_FROM_YEAR = 2026;

type Props = {
  selectedDrivers: string[];
  driverLaps: DriverLaps[];
  lapSelections: Record<string, string>;
  onLapChange: (driver: string, value: string) => void;
  telemetry: TelemetryResponse | null;
  loading: boolean;
  error: string | null;
  colors: Record<string, string>;
  year: number;
  corners: CornerInfo[];
};

export default function TelemetryPanel({
  selectedDrivers,
  driverLaps,
  lapSelections,
  onLapChange,
  telemetry,
  loading,
  error,
  colors,
  year,
  corners,
}: Props) {
  const [activeChannels, setActiveChannels] = useState<Set<Channel>>(new Set(DEFAULT_ON));

  const visibleChannels = useMemo(
    () => ALL_CHANNELS.filter((c) => c !== "drs" || year < DRS_REMOVED_FROM_YEAR),
    [year]
  );

  const toggleChannel = (c: Channel) => {
    setActiveChannels((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const validDrivers: DriverTelemetry[] = useMemo(
    () => telemetry?.drivers.filter((d) => !d.error && d.data) ?? [],
    [telemetry]
  );
  const erroredDrivers = useMemo(
    () => telemetry?.drivers.filter((d) => d.error) ?? [],
    [telemetry]
  );

  const chartData = useMemo(() => {
    if (validDrivers.length === 0) return [];
    const base = validDrivers[0].data.distance;
    return base.map((dist, i) => {
      const row: Record<string, number> = { distance: dist };
      for (const drv of validDrivers) {
        row[`${drv.driver}_speed`] = drv.data.speed[i] ?? 0;
        row[`${drv.driver}_throttle`] = drv.data.throttle[i] ?? 0;
        row[`${drv.driver}_brake`] = drv.data.brake[i] ?? 0;
        row[`${drv.driver}_gear`] = drv.data.gear[i] ?? 0;
        if (year < DRS_REMOVED_FROM_YEAR) row[`${drv.driver}_drs`] = drv.data.drs[i] ?? 0;
        if (drv.data.delta != null) row[`${drv.driver}_delta`] = drv.data.delta[i] ?? 0;
      }
      return row;
    });
  }, [validDrivers, year]);

  const deltaDomain = useMemo((): [number, number] => {
    let max = 0.5;
    for (const drv of validDrivers) {
      if (!drv.data.delta) continue;
      for (const v of drv.data.delta) max = Math.max(max, Math.abs(v));
    }
    return [-max * 1.1, max * 1.1];
  }, [validDrivers]);

  const handleExport = () => {
    downloadCsv(
      `telemetry_${selectedDrivers.join("-")}`,
      chartData.map((row) => ({ ...row }))
    );
  };

  const channelPanels = useMemo(() => {
    const panels: {
      key: string;
      label: string;
      unit: string;
      domain: [number, number];
      dataKeySuffix: string;
      tallHeight: number;
    }[] = [];

    if (validDrivers.length > 1) {
      panels.push({
        key: "delta",
        label: "Delta (vs. first driver)",
        unit: "s",
        domain: deltaDomain,
        dataKeySuffix: "delta",
        tallHeight: 110,
      });
    }

    for (const channel of visibleChannels) {
      if (!activeChannels.has(channel)) continue;
      const cfg = CHANNEL_CONFIG[channel];
      panels.push({
        key: channel,
        label: `${cfg.label}${cfg.unit ? ` (${cfg.unit})` : ""}`,
        unit: cfg.unit,
        domain: cfg.domain,
        dataKeySuffix: channel,
        tallHeight: channel === "speed" ? 200 : 90,
      });
    }

    return panels;
  }, [validDrivers.length, deltaDomain, visibleChannels, activeChannels]);

  return (
    <div className="flex flex-col gap-4">
      {/* Lap pickers */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedDrivers.map((driver) => {
          const dl = driverLaps.find((d) => d.driver === driver);
          return (
            <LapPicker
              key={driver}
              driver={driver}
              color={colors[driver] ?? "#8b93a1"}
              laps={dl?.laps.filter((l) => l.lap_time != null) ?? []}
              value={lapSelections[driver] ?? "fastest"}
              onChange={(v) => onLapChange(driver, v)}
            />
          );
        })}
      </div>

      {/* Channel toggles + export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {visibleChannels.map((c) => (
            <label key={c} className="flex items-center gap-1.5 cursor-pointer">
              <Checkbox checked={activeChannels.has(c)} onCheckedChange={() => toggleChannel(c)} />
              <span className="text-[12px] text-text-muted">{CHANNEL_CONFIG[c].label}</span>
            </label>
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleExport}
          disabled={chartData.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {loading && (
        <div className="text-[13px] text-accent bg-accent-muted border border-accent/30 rounded-md px-3 py-2">
          Fetching telemetry from FastF1… first load for a session can take up to 60s while data is
          cached.
        </div>
      )}
      {error && <div className="text-[13px] text-danger">{error}</div>}
      {erroredDrivers.map((d) => (
        <div key={d.driver} className="text-[12px] text-danger">
          {d.driver}: {d.error}
        </div>
      ))}

      {validDrivers.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {validDrivers.map((drv) => (
              <div
                key={drv.driver}
                className="flex items-center gap-2 rounded-md border px-2.5 py-1"
                style={{
                  borderColor: `${colors[drv.driver]}40`,
                  background: `${colors[drv.driver]}12`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: colors[drv.driver] }} />
                <span className="text-text text-[12px] font-semibold">{drv.driver}</span>
                <span className="text-text-faint text-[11px]">
                  {formatLapTime(drv.lap_time)} · Lap {drv.lap_number}
                </span>
                {drv.compound && <Badge color={compoundColor(drv.compound)}>{drv.compound}</Badge>}
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Track Map
              </span>
            </div>
            <TrackMap drivers={validDrivers} colors={colors} corners={corners} />
          </div>

          {channelPanels.map((p, i) => (
            <ChannelPanel
              key={p.key}
              label={p.label}
              unit={p.unit}
              domain={p.domain}
              dataKeySuffix={p.dataKeySuffix}
              chartData={chartData}
              drivers={validDrivers}
              colors={colors}
              tallHeight={p.tallHeight}
              corners={corners}
              showAxisLabels={i === channelPanels.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelPanel({
  label,
  unit,
  domain,
  dataKeySuffix,
  chartData,
  drivers,
  colors,
  tallHeight,
  corners,
  showAxisLabels,
}: {
  label: string;
  unit: string;
  domain: [number, number];
  dataKeySuffix: string;
  chartData: Record<string, number>[];
  drivers: DriverTelemetry[];
  colors: Record<string, string>;
  tallHeight: number;
  corners: CornerInfo[];
  showAxisLabels: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
          {label}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={tallHeight}>
        <LineChart
          data={chartData}
          margin={{ top: 0, right: 0, bottom: showAxisLabels ? 16 : 0, left: 0 }}
          syncId="telemetry"
        >
          <XAxis
            dataKey="distance"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={showAxisLabels ? corners.map((c) => c.distance) : undefined}
            tick={showAxisLabels ? { fill: "#8b93a1", fontSize: 10 } : false}
            tickFormatter={(d: number) => {
              const c = corners.find((cc) => Math.abs(cc.distance - d) < 1);
              return c ? cornerLabel(c) : "";
            }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={showAxisLabels}
          />
          <YAxis
            domain={domain}
            tick={{ fill: "#565e6b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={32}
            tickCount={4}
            tickFormatter={(v: number) =>
              unit === "s"
                ? `${v > 0.0005 ? "+" : v < -0.0005 ? "-" : ""}${Math.abs(v).toFixed(1)}`
                : Number.isInteger(v)
                  ? String(v)
                  : v.toFixed(1)
            }
          />
          <Tooltip
            contentStyle={{
              background: "#171b22",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              fontSize: 12,
              color: "#e7e9ec",
            }}
            formatter={(val, name) => {
              const v = Number(val);
              const label =
                unit === "s" ? `${v > 0 ? "+" : ""}${v.toFixed(3)}s` : unit ? `${v}${unit}` : v;
              return [label, String(name).split("_")[0]];
            }}
            labelFormatter={(d) => {
              const dist = d as number;
              const corner = nearestCornerLabel(dist, corners);
              return corner ? `${Math.round(dist)} m · ${corner}` : `${Math.round(dist)} m`;
            }}
          />
          {corners.map((c) => (
            <ReferenceLine
              key={`${c.number}${c.letter}`}
              x={c.distance}
              stroke="var(--color-border)"
              strokeDasharray="2 3"
              ifOverflow="extendDomain"
            />
          ))}
          {drivers.map((drv) => (
            <Line
              key={drv.driver}
              type="monotone"
              dataKey={`${drv.driver}_${dataKeySuffix}`}
              stroke={colors[drv.driver] ?? "#8b93a1"}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
