import { apiClient } from "@/shared/api/base";
import type { GlobalSingleRankingRecord } from "../types";
import { globalRankingMapper } from "./mapper/globalRankingMapper";

const BASE_URL = "/statistics/player";

export const getPlayerRecordHistory = async (
  cckId: string,
  eventName: string
): Promise<GlobalSingleRankingRecord[]> => {
  const encodedCckId = encodeURIComponent(cckId);
  const encodedEventName = encodeURIComponent(eventName);
  const data = await apiClient.get<GlobalSingleRankingRecord[]>(
    `${BASE_URL}/${encodedCckId}/history/${encodedEventName}`
  );
  return data.map(globalRankingMapper);
};

