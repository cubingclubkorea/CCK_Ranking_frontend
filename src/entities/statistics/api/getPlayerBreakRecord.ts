import { apiClient } from "@/shared/api/base";
import type { GlobalSingleRankingRecord } from "../types";
import { globalRankingMapper } from "./mapper/globalRankingMapper";
import { normalizeGlobalRankingRows } from "./normalizeGlobalRankingRows";

const BASE_URL = "/statistics/player";

export const getPlayerBreakRecord = async (cckId: string): Promise<GlobalSingleRankingRecord[]> => {
  const encodedCckId = encodeURIComponent(cckId);
  const payload = await apiClient.get<GlobalSingleRankingRecord[]>(`${BASE_URL}/${encodedCckId}/break`);
  return normalizeGlobalRankingRows(payload).map(globalRankingMapper);
};
