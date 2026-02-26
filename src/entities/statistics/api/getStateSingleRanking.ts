import { apiClient } from "@/shared/api/base";
import type { GlobalSingleRankingRecord } from "../types";
import { globalRankingMapper } from "./mapper/globalRankingMapper";
import { normalizeGlobalRankingRows } from "./normalizeGlobalRankingRows";

const BASE_URL = "/statistics/state/single";

export const getStateSingleRanking = async (
  eventName: string,
  state: string,
  size = 50,
  page = 0
): Promise<GlobalSingleRankingRecord[]> => {
  const encodedEventName = encodeURIComponent(eventName);
  const encodedState = encodeURIComponent(state);
  const payload = await apiClient.get<GlobalSingleRankingRecord[]>(
    `${BASE_URL}/${encodedEventName}/state/${encodedState}`,
    { page, size }
  );
  return normalizeGlobalRankingRows(payload).map(globalRankingMapper);
};
