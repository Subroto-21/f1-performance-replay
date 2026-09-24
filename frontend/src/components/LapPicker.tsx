"use client";

import * as Popover from "@radix-ui/react-popover";
import { LapRecord } from "@/services/sessionsService";
import { formatLapTime, compoundColor } from "@/lib/formatters";
import { Badge } from "@/components/ui/Badge";

type Props = {
  driver: string;
  color: string;
  laps: LapRecord[];
  value: string; // "fastest" or lap number as string
  onChange: (value: string) => void;
};

export default function LapPicker({ driver, color, laps, value, onChange }: Props) {
  const current =
    value === "fastest"
      ? laps
          .filter((l) => l.lap_time != null)
          .sort((a, b) => (a.lap_time ?? 0) - (b.lap_time ?? 0))[0]
      : laps.find((l) => String(l.lap_number) === value);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-[12px] hover:border-border-strong">
          <span className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-text font-semibold">{driver}</span>
          <span className="text-text-faint">
            {value === "fastest" ? "Fastest" : `Lap ${value}`} · {formatLapTime(current?.lap_time)}
          </span>
          <svg
            width={10}
            height={10}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-text-faint"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          className="z-50 w-64 rounded-md border border-border bg-surface-2 shadow-xl p-1 max-h-80 overflow-y-auto"
        >
          <button
            onClick={() => onChange("fastest")}
            className={`w-full flex items-center justify-between rounded px-2.5 py-1.5 text-[12px] text-left hover:bg-surface-hover ${
              value === "fastest" ? "bg-accent-muted" : ""
            }`}
          >
            <span className="text-text font-medium">Fastest lap</span>
          </button>
          <div className="h-px bg-border my-1" />
          {laps.map((l) => (
            <button
              key={l.lap_number}
              onClick={() => onChange(String(l.lap_number))}
              className={`w-full flex items-center justify-between gap-2 rounded px-2.5 py-1.5 text-[12px] text-left hover:bg-surface-hover ${
                value === String(l.lap_number) ? "bg-accent-muted" : ""
              }`}
            >
              <span className="text-text-muted tabular-nums">L{l.lap_number}</span>
              <span className="text-text tabular-nums">{formatLapTime(l.lap_time)}</span>
              {l.compound && <Badge color={compoundColor(l.compound)}>{l.compound}</Badge>}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
