"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSessionResults,
  getSessionLaps,
  getSessionTelemetry,
  SessionResultsResponse,
  SessionLapsResponse,
  TelemetryResponse,
} from "@/services/sessionsService";
import { assignDriverColors } from "@/lib/driverColors";
import { pushRecentSession } from "@/lib/recentSessions";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import DriverTable from "@/components/DriverTable";
import TelemetryPanel from "@/components/TelemetryPanel";
import PaceChart from "@/components/PaceChart";
import StrategyChart from "@/components/StrategyChart";
import LapsTable from "@/components/LapsTable";

const SESSION_LABEL: Record<string, string> = {
  FP1: "Practice 1",
  FP2: "Practice 2",
  FP3: "Practice 3",
  Q: "Qualifying",
  SQ: "Sprint Qualifying",
  S: "Sprint",
  R: "Race",
};

const MAX_SELECTED = 6;

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = `/races/${params.year}/${params.round}/${params.session}`;
  const searchParams = useSearchParams();

  const year = Number(params.year);
  const round = Number(params.round);
  const session = String(params.session);

  const [results, setResults] = useState<SessionResultsResponse | null>(null);
  const [resultsErr, setResultsErr] = useState<string | null>(null);
  const [resultsLoading, setResultsLoading] = useState(true);

  const [laps, setLaps] = useState<SessionLapsResponse | null>(null);

  const [selectedDrivers, setSelectedDrivers] = useState<string[]>(
    () => searchParams.get("drivers")?.split(",").filter(Boolean) ?? []
  );
  const [lapSelections, setLapSelections] = useState<Record<string, string>>(() => {
    const raw = searchParams.get("laps");
    if (!raw) return {};
    const out: Record<string, string> = {};
    raw.split(",").forEach((pair) => {
      const [d, v] = pair.split(":");
      if (d && v) out[d] = v;
    });
    return out;
  });
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "telemetry");

  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [telErr, setTelErr] = useState<string | null>(null);
  const [telLoading, setTelLoading] = useState(false);

  const isQual = ["Q", "SQ"].includes(session);
  const isRace = ["R", "S"].includes(session);
  const drivers = useMemo(() => results?.drivers ?? [], [results]);

  // Load results + laps on mount
  useEffect(() => {
    setResultsLoading(true);
    getSessionResults(year, round, session)
      .then((data) => {
        setResults(data);
        pushRecentSession({
          year,
          round,
          session,
          eventName: data.event_name,
          sessionName: SESSION_LABEL[session] ?? session,
        });
        setSelectedDrivers((prev) => {
          if (prev.length > 0) return prev;
          const abbrs = data.drivers.filter((d) => d.abbreviation).map((d) => d.abbreviation);
          return abbrs.slice(0, 2);
        });
      })
      .catch((e) => setResultsErr(e.message))
      .finally(() => setResultsLoading(false));

    getSessionLaps(year, round, session)
      .then(setLaps)
      .catch(() => setLaps(null));
  }, [year, round, session]);

  // Sync selection state to the URL so views are shareable
  useEffect(() => {
    const p = new URLSearchParams();
    if (selectedDrivers.length) p.set("drivers", selectedDrivers.join(","));
    const lapPairs = Object.entries(lapSelections).filter(([d]) => selectedDrivers.includes(d));
    if (lapPairs.length) p.set("laps", lapPairs.map(([d, v]) => `${d}:${v}`).join(","));
    if (activeTab) p.set("tab", activeTab);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDrivers, lapSelections, activeTab]);

  const colors = useMemo(
    () =>
      assignDriverColors(
        selectedDrivers.map((abbr) => ({
          abbreviation: abbr,
          team_color: drivers.find((d) => d.abbreviation === abbr)?.team_color ?? "",
        }))
      ),
    [selectedDrivers, drivers]
  );

  const toggleDriver = useCallback((abbr: string) => {
    setSelectedDrivers((prev) =>
      prev.includes(abbr) ? prev.filter((d) => d !== abbr) : [...prev, abbr].slice(0, MAX_SELECTED)
    );
  }, []);

  const handleLapChange = useCallback((driver: string, value: string) => {
    setLapSelections((prev) => ({ ...prev, [driver]: value }));
  }, []);

  // Fetch telemetry whenever selection changes and the telemetry tab is active
  useEffect(() => {
    if (activeTab !== "telemetry" || selectedDrivers.length === 0) return;
    setTelLoading(true);
    setTelErr(null);
    const lapsParam = selectedDrivers.map((d) => lapSelections[d] ?? "fastest");
    getSessionTelemetry(year, round, session, selectedDrivers, lapsParam)
      .then(setTelemetry)
      .catch((e) => setTelErr(e.message))
      .finally(() => setTelLoading(false));
  }, [activeTab, selectedDrivers, lapSelections, year, round, session]);

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-4">
      <div>
        {resultsLoading ? (
          <div className="h-10 w-64 rounded skeleton" />
        ) : resultsErr ? (
          <div className="text-danger text-[13px]">{resultsErr}</div>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              {SESSION_LABEL[session] ?? session} · {year}
            </p>
            <h1 className="text-xl font-bold text-text mt-0.5">{results?.event_name}</h1>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <span className="text-[11px] text-text-faint">
            {selectedDrivers.length}/{MAX_SELECTED} selected for comparison
          </span>
        </CardHeader>
        <CardBody className="p-0">
          {resultsLoading && (
            <div className="p-4 text-[13px] text-text-muted">
              Loading session data… (first load may take 30-60s)
            </div>
          )}
          {!resultsLoading && !resultsErr && drivers.length > 0 && results && (
            <DriverTable
              drivers={drivers}
              fastestLaps={results.fastest_laps}
              isQual={isQual}
              isRace={isRace}
              selected={selectedDrivers}
              onToggle={toggleDriver}
              colors={colors}
              maxSelected={MAX_SELECTED}
            />
          )}
        </CardBody>
      </Card>

      {!resultsLoading && !resultsErr && drivers.length > 0 && (
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
              <TabsTrigger value="pace">Pace</TabsTrigger>
              {isRace && <TabsTrigger value="strategy">Strategy</TabsTrigger>}
              <TabsTrigger value="laps">Laps</TabsTrigger>
            </TabsList>

            <TabsContent value="telemetry" className="p-4">
              <TelemetryPanel
                selectedDrivers={selectedDrivers}
                driverLaps={laps?.drivers ?? []}
                lapSelections={lapSelections}
                onLapChange={handleLapChange}
                telemetry={telemetry}
                loading={telLoading}
                error={telErr}
                colors={colors}
                year={year}
              />
            </TabsContent>

            <TabsContent value="pace" className="p-4">
              <PaceChart
                selectedDrivers={selectedDrivers}
                driverLaps={laps?.drivers ?? []}
                colors={colors}
              />
            </TabsContent>

            {isRace && (
              <TabsContent value="strategy" className="p-4">
                <StrategyChart
                  selectedDrivers={selectedDrivers}
                  driverLaps={laps?.drivers ?? []}
                  colors={colors}
                />
              </TabsContent>
            )}

            <TabsContent value="laps" className="p-4">
              <LapsTable
                selectedDrivers={selectedDrivers}
                driverLaps={laps?.drivers ?? []}
                colors={colors}
              />
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
