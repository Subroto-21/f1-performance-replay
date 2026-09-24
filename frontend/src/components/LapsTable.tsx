"use client";

import { useMemo, useState } from "react";
import { DriverLaps, LapRecord } from "@/services/sessionsService";
import { formatLapTime, compoundColor } from "@/lib/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { downloadCsv } from "@/lib/exportCsv";

type Row = LapRecord & { driver: string };

type SortKey =
  | "driver"
  | "lap_number"
  | "lap_time"
  | "sector1"
  | "sector2"
  | "sector3"
  | "tyre_life";

type Props = {
  selectedDrivers: string[];
  driverLaps: DriverLaps[];
  colors: Record<string, string>;
};

export default function LapsTable({ selectedDrivers, driverLaps, colors }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("lap_number");
  const [sortAsc, setSortAsc] = useState(true);

  const rows: Row[] = useMemo(() => {
    return driverLaps
      .filter((d) => selectedDrivers.includes(d.driver))
      .flatMap((d) => d.laps.map((l) => ({ ...l, driver: d.driver })));
  }, [driverLaps, selectedDrivers]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" || typeof bv === "string") {
        return String(av).localeCompare(String(bv)) * (sortAsc ? 1 : -1);
      }
      return (Number(av) - Number(bv)) * (sortAsc ? 1 : -1);
    });
    return copy;
  }, [rows, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = () => downloadCsv(`laps_${selectedDrivers.join("-")}`, sorted);

  const columns: { key: SortKey; label: string }[] = [
    { key: "driver", label: "Driver" },
    { key: "lap_number", label: "Lap" },
    { key: "lap_time", label: "Time" },
    { key: "sector1", label: "S1" },
    { key: "sector2", label: "S2" },
    { key: "sector3", label: "S3" },
    { key: "tyre_life", label: "Tyre Life" },
  ];

  if (rows.length === 0) {
    return (
      <p className="text-[13px] text-text-faint">
        Select at least one driver to see lap-by-lap data.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto border border-border rounded-md">
        <table className="w-full text-[12px] border-collapse">
          <thead className="sticky top-0 bg-surface-2">
            <tr className="border-b border-border text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold cursor-pointer select-none hover:text-text"
                >
                  {c.label}
                  {sortKey === c.key && (sortAsc ? " ▲" : " ▼")}
                </th>
              ))}
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                Compound
              </th>
              <th className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-faint font-semibold">
                Flags
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={`${row.driver}-${row.lap_number}-${i}`}
                className={`border-b border-border/60 ${row.deleted ? "opacity-50" : ""}`}
              >
                <td className="px-3 py-1.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: colors[row.driver] }}
                    />
                    <span className="text-text font-medium">{row.driver}</span>
                  </span>
                </td>
                <td className="px-3 py-1.5 text-text-muted tabular-nums">{row.lap_number}</td>
                <td className="px-3 py-1.5 text-text tabular-nums">
                  {formatLapTime(row.lap_time)}
                </td>
                <td className="px-3 py-1.5 text-text-muted tabular-nums">
                  {formatLapTime(row.sector1)}
                </td>
                <td className="px-3 py-1.5 text-text-muted tabular-nums">
                  {formatLapTime(row.sector2)}
                </td>
                <td className="px-3 py-1.5 text-text-muted tabular-nums">
                  {formatLapTime(row.sector3)}
                </td>
                <td className="px-3 py-1.5 text-text-muted tabular-nums">{row.tyre_life ?? "—"}</td>
                <td className="px-3 py-1.5">
                  {row.compound ? (
                    <Badge color={compoundColor(row.compound)}>{row.compound}</Badge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex gap-1">
                    {row.is_personal_best && <Badge color="#eab308">PB</Badge>}
                    {row.deleted && <Badge color="#ef4444">DEL</Badge>}
                    {row.pit_in && <Badge>PIT IN</Badge>}
                    {row.pit_out && <Badge>PIT OUT</Badge>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
