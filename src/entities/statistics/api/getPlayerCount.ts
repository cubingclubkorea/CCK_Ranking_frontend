import { apiClient } from "@/shared/api/base";
import type { PlayerCountResponse } from "../model/playerStats";

const BASE_URL = "/statistics/player";

const parseCount = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};

export const getPlayerCount = async (cckId: string): Promise<PlayerCountResponse> => {
  const encoded = encodeURIComponent(cckId);
  const data = await apiClient.get<unknown>(`${BASE_URL}/${encoded}/player-count`);

  if (!data || typeof data !== "object") {
    return {
      competitionCount: 0,
      completeCount: 0,
    };
  }

  const source = data as Record<string, unknown>;
  return {
    competitionCount: parseCount(source.competitionCount ?? source.competition_count ?? source.competition),
    completeCount: parseCount(source.completeCount ?? source.complete_count ?? source.completedCount ?? source.complete),
  };
};
