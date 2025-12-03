"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Select, Button } from "antd";
import { getRaces } from "@/services/racesService";

const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020];

export default function RaceSelect() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedRace, setSelectedRace] = useState<number | null>(null);
  const [races, setRaces] = useState<
    { RoundNumber: number; EventName: string; Location: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoading(true);
        const data = await getRaces(selectedYear);
        setRaces(data.races);
      } catch (error) {
        console.error("Failed to fetch races:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, [selectedYear]);

  const handleViewSessions = () => {
    if (selectedYear && selectedRace) {
      router.push(`/races/${selectedYear}/${selectedRace}`);
    }
  };

  return (
    <div
      className="flex justify-center items-start bg-gradient-to-b from-[#b40000] via-[#e10600] to-[#9a0000] h-[30vh] rounded-t-[3rem]"
      style={{ marginTop: "-20px", zIndex: "30", position: "relative" }}
    >
      <Card
        title={
          <div className="flex items-center justify-center text-red-500 font-semibold">
            🏁 Choose Your Race
          </div>
        }
        className="w-[420px] bg-[#121212] border border-[#2a2a2a] rounded-xl shadow-lg"
        style={{ marginTop: "3.5rem" }}
        styles={{
          header: { borderBottom: "1px solid #2a2a2a" },
          body: { padding: "1.5rem" },
        }}
      >
        {/* Year + Race */}
        <div className="flex justify-between mb-4">
          <Select
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
            className="flex-1"
            options={AVAILABLE_YEARS.map((year) => ({
              value: year,
              label: year.toString(),
            }))}
            dropdownStyle={{
              background: "#1a1a1a",
              borderRadius: 8,
            }}
            style={{
              borderRadius: 8,
              width: "100%",
              marginRight: "5px",
            }}
            popupMatchSelectWidth={false}
          />

          <Select
            value={selectedRace ?? undefined}
            onChange={(value) => setSelectedRace(value)}
            loading={loading}
            placeholder="Select Race"
            className=""
            options={races.map((r) => ({
              value: r.RoundNumber,
              label: `${r.EventName} (${r.Location})`,
            }))}
            dropdownStyle={{
              background: "#1a1a1a",
              color: "#fff",
              borderRadius: 8,
            }}
            style={{
              borderRadius: 8,
              width: "100%",
            }}
            popupMatchSelectWidth={false}
          />
        </div>

        {/* Button */}
        <Button
          type="default"
          block
          disabled={!selectedRace}
          onClick={handleViewSessions}
          className="mt-2 font-semibold rounded-lg transition-all duration-200 "
          style={{ marginTop: "10px" }}
        >
          View Sessions
        </Button>
      </Card>
    </div>
  );
}
