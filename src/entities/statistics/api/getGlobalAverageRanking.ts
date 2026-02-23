import { apiClient } from "@/shared/api/base";
import type { GlobalSingleRankingRecord } from "../types";
import { globalRankingMapper } from "./mapper/globalRankingMapper";

const BASE_URL = "/statistics/global/average";

export const getGlobalAverageRanking = async (
  eventName: string
): Promise<GlobalSingleRankingRecord[]> => {
  const encodedEventName = encodeURIComponent(eventName);
  const data = await apiClient.get<GlobalSingleRankingRecord[]>(`${BASE_URL}/${encodedEventName}`);
  return data.map(globalRankingMapper);
};
