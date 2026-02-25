import {
  getGlobalAverageRanking,
  getGlobalSingleRanking,
  type GlobalSingleRankingRecord,
} from "@/entities/statistics";

export type RankingRecordMetric = "single" | "average";

export const getRankingRecords = async (
  metric: RankingRecordMetric,
  eventName: string,
  size = 50
): Promise<GlobalSingleRankingRecord[]> => {
  if (metric === "single") {
    return getGlobalSingleRanking(eventName, size);
  }
  return getGlobalAverageRanking(eventName, size);
};
