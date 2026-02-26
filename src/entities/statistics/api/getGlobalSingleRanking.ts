import { apiClient } from "@/shared/api/base";
import type { GlobalSingleRankingRecord } from "../types";
import { globalRankingMapper } from "./mapper/globalRankingMapper";
import { normalizeGlobalRankingRows } from "./normalizeGlobalRankingRows";

const BASE_URL = "/statistics/global/single";

export const getGlobalSingleRanking = async (
  eventName: string,
  size = 50
): Promise<GlobalSingleRankingRecord[]> => {
  const encodedEventName = encodeURIComponent(eventName);
  const payload = await apiClient.get<GlobalSingleRankingRecord[]>(
    `${BASE_URL}/${encodedEventName}`,
    { size }
  );
  return normalizeGlobalRankingRows(payload).map(globalRankingMapper);
};
