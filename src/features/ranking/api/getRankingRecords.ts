import {
  getGlobalAverageRanking,
  getGlobalSingleRanking,
  type GlobalSingleRankingRecord,
} from "@/entities/statistics";

export type RankingRecordMetric = "single" | "average";

export const getRankingRecords = async (
  metric: RankingRecordMetric,
  eventName: string
): Promise<GlobalSingleRankingRecord[]> => {
  if (metric === "single") {
    return getGlobalSingleRanking(eventName);
  }
  return getGlobalAverageRanking(eventName);
};
