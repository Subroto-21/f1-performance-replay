"use client";

import { DriverResult, FastestLap } from "@/services/sessionsService";
import { formatLapTime, formatGap, compoundColor } from "@/lib/formatters";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";

type Props = {
  drivers: DriverResult[];
  fastestLaps: Record<string, FastestLap>;
  isQual: boolean;
  isRace: boolean;
  selected: string[];
  onToggle: (abbreviation: string) => void;
  colors: Record<string, string>;
  maxSelected: number;
};

export default function DriverTable({
  drivers,
  fastestLaps,
  isQual,
  isRace,
  selected,
  onToggle,
  colors,
  maxSelected,
}: Props) {
  const leaderTime = isQual
    ? (drivers[0]?.q3 ?? drivers[0]?.q2 ?? drivers[0]?.q1 ?? null)
    : (drivers[0]?.time ?? null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-3 py-2 w-8" />
            <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold w-10">
              Pos
            </th>
            <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
              Driver
            </th>
            <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
              Team
            </th>
            {isQual && (
              <>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                  Q1
                </th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                  Q2
                </th>
                <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                  Q3
                </th>
              </>
            )}
            {isRace && (
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                Time / Status
              </th>
            )}
            <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
              Fastest Lap
            </th>
            <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
              Compound
            </th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((drv, i) => {
            const fl = fastestLaps[drv.abbreviation];
            const bestTime = isQual ? (drv.q3 ?? drv.q2 ?? drv.q1) : drv.time;
            // Qualifying times are each absolute, so the gap is a subtraction. Race/Sprint
            // `time` is already a gap-to-leader for everyone but the winner (FastF1/timing convention).
            const gap = isQual
              ? bestTime != null && leaderTime != null
                ? bestTime - leaderTime
                : null
              : (drv.time ?? null);
            const isSelected = selected.includes(drv.abbreviation);
            const disabled = !isSelected && selected.length >= maxSelected;

            return (
              <tr
                key={drv.abbreviation}
                onClick={() => !disabled && onToggle(drv.abbreviation)}
                className={`border-b border-border/60 transition-colors ${
                  disabled ? "opacity-40" : "cursor-pointer hover:bg-surface-2"
                } ${isSelected ? "bg-surface-2" : ""}`}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !disabled && onToggle(drv.abbreviation)}
                    disabled={disabled}
                    color={colors[drv.abbreviation]}
                  />
                </td>
                <td className="px-3 py-2 text-text-muted font-semibold tabular-nums">
                  {drv.position ?? "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-[3px] h-5 rounded-sm inline-block shrink-0"
                      style={{ background: colors[drv.abbreviation] ?? drv.team_color }}
                    />
                    <span className="text-text font-semibold">{drv.abbreviation}</span>
                    <span className="text-text-faint text-[12px]">{drv.full_name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-text-muted whitespace-nowrap">{drv.team}</td>

                {isQual && (
                  <>
                    <td className="px-3 py-2 text-text-muted tabular-nums">
                      {formatLapTime(drv.q1)}
                    </td>
                    <td className="px-3 py-2 text-text-muted tabular-nums">
                      {formatLapTime(drv.q2)}
                    </td>
                    <td
                      className={`px-3 py-2 tabular-nums ${drv.q3 != null ? "text-text font-semibold" : "text-text-faint"}`}
                    >
                      {formatLapTime(drv.q3 ?? drv.q2 ?? drv.q1)}
                      {i === 0 && <span className="ml-1 text-warning text-[10px]">P1</span>}
                      {i > 0 && gap != null && (
                        <span className="ml-1 text-text-faint text-[11px]">{formatGap(gap)}</span>
                      )}
                    </td>
                  </>
                )}

                {isRace && (
                  <td
                    className={`px-3 py-2 tabular-nums ${drv.status === "Finished" || !drv.status ? "text-text" : "text-danger"}`}
                  >
                    {i === 0
                      ? formatLapTime(drv.time)
                      : drv.status && drv.status !== "Finished"
                        ? drv.status
                        : formatGap(gap)}
                  </td>
                )}

                <td className="px-3 py-2 text-accent font-medium tabular-nums text-[12px]">
                  {formatLapTime(fl?.lap_time)}
                </td>
                <td className="px-3 py-2">
                  {fl?.compound ? (
                    <Badge color={compoundColor(fl.compound)}>{fl.compound}</Badge>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
