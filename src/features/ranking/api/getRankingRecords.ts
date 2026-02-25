import {
  getGlobalAverageRanking,
  getGlobalSingleRanking,
  getStateAverageRanking,
  getStateSingleRanking,
  type GlobalSingleRankingRecord,
} from "@/entities/statistics";

export type RankingRecordMetric = "single" | "average";

export const getRankingRecords = async (
  metric: RankingRecordMetric,
  eventName: string,
  size = 50,
  state?: string
): Promise<GlobalSingleRankingRecord[]> => {
  if (state) {
    if (metric === "single") {
      return getStateSingleRanking(eventName, state, size);
    }
    return getStateAverageRanking(eventName, state, size);
  }

  if (metric === "single") {
    return getGlobalSingleRanking(eventName, size);
  }
  return getGlobalAverageRanking(eventName, size);
};
