import { fetcher } from "@/lib/fetcher";
import { API_BASE_URL } from "@/lib/config";

export type Race = {
  RoundNumber: number;
  EventName: string;
  EventDate: string;
  Country: string;
  Location: string;
};

export type RaceListResponse = {
  season: number;
  races: Race[];
};

export async function getRaces(year: number): Promise<RaceListResponse> {
  return fetcher<RaceListResponse>(`${API_BASE_URL}/api/races/${year}`);
}
