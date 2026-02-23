import { apiClient } from "@/shared/api/base";
import type { PlayerEventRanking } from "../model/playerStats";

const BASE_URL = "/statistics/player";

export const getPlayerRanking = async (cckId: string): Promise<PlayerEventRanking[]> => {
  const encoded = encodeURIComponent(cckId);
  return apiClient.get<PlayerEventRanking[]>(`${BASE_URL}/${encoded}/ranking`);
};

