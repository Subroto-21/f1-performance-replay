"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRaces, Race } from "@/services/racesService";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020];

export default function Home() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRaces(selectedYear)
      .then((data) => {
        setRaces(data.races);
        setSelectedRace(null);
      })
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const handleViewSessions = () => {
    if (selectedYear && selectedRace) {
      router.push(`/races/${selectedYear}/${selectedRace}`);
    }
  };

  return (
    <div className="mt-20 flex justify-center">
      <Card className="w-full max-w-md bg-gray-950 border-gray-800">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-3xl font-bold text-center text-red-500">
            F1 Performance Replay 🏎️
          </h1>
          <p className="text-gray-400 text-center text-sm">
            Select a season and race to explore telemetry and replay data
          </p>

          {/* Year Selector */}
          <div>
            <label className="text-sm text-gray-400">Select Year</label>
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white mt-1">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_YEARS.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Race Selector */}
          <div>
            <label className="text-sm text-gray-400">Select Race</label>
            <Select
              disabled={loading || races.length === 0}
              value={selectedRace ? String(selectedRace) : ""}
              onValueChange={(value) => setSelectedRace(Number(value))}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white mt-1">
                <SelectValue
                  placeholder={loading ? "Loading..." : "Choose a race"}
                />
              </SelectTrigger>
              <SelectContent>
                {races.map((race) => (
                  <SelectItem
                    key={race.RoundNumber}
                    value={String(race.RoundNumber)}
                  >
                    {race.RoundNumber}. {race.EventName} ({race.Location})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Button */}
          <Button
            onClick={handleViewSessions}
            disabled={!selectedRace}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            View Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
