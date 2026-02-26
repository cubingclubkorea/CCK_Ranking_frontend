import { apiClient } from "@/shared/api/base";
import type {
  RoundDnfCount,
  RoundGlobalSingleAverage,
  RoundStateSingleAverage,
} from "../model/roundStatistics";

const parseNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};

const parseString = (value: unknown): string => {
  if (typeof value === "string" && value.trim()) return value;
  return "";
};

const callWithFallback = async <T>(endpoints: string[]): Promise<T> => {
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      return await apiClient.get<T>(endpoint);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("라운드 통계 API 호출에 실패했습니다.");
};

const parseGlobalAverage = (data: unknown): RoundGlobalSingleAverage => {
  if (!data || typeof data !== "object") {
    return { singleAvg: 0, averageAvg: 0, count: 0 };
  }

  const source = data as Record<string, unknown>;
  return {
    singleAvg: parseNumber(source.singleAvg ?? source.single_avg ?? source.single),
    averageAvg: parseNumber(source.averageAvg ?? source.average_avg ?? source.average),
    count: parseNumber(source.count ?? source.totalCount ?? source.total),
  };
};

const parseStateAverageList = (data: unknown): RoundStateSingleAverage[] => {
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const source = (row ?? {}) as Record<string, unknown>;
    return {
      state: parseString(source.state),
      singleAvg: parseNumber(source.singleAvg ?? source.single_avg ?? source.single),
      averageAvg: parseNumber(source.averageAvg ?? source.average_avg ?? source.average),
      count: parseNumber(source.count ?? source.totalCount ?? source.total),
    };
  });
};

const parseDnfCount = (data: unknown): RoundDnfCount => {
  if (!data || typeof data !== "object") {
    return { dnfCount: 0, successCount: 0, totalCount: 0 };
  }

  const source = data as Record<string, unknown>;
  return {
    dnfCount: parseNumber(source.dnfCount ?? source.dnf_count ?? source.dnf),
    successCount: parseNumber(source.successCount ?? source.success_count ?? source.success),
    totalCount: parseNumber(source.totalCount ?? source.total_count ?? source.total),
  };
};

export const getGlobalSingleAverage = async (roundIdx: number): Promise<RoundGlobalSingleAverage> => {
  const payload = await callWithFallback<unknown>([
    `/statistics/round/${roundIdx}/global`,
  ]);
  return parseGlobalAverage(payload);
};

export const getStateSingleAverage = async (roundIdx: number): Promise<RoundStateSingleAverage[]> => {
  const payload = await callWithFallback<unknown>([
    `/statistics/round/${roundIdx}/state`,
    `/statistics/round/${roundIdx}/states`,
    `/statistics/round/${roundIdx}/state-average`,
  ]);
  return parseStateAverageList(payload);
};

export const getDnfCountByRound = async (roundIdx: number): Promise<RoundDnfCount> => {
  const payload = await callWithFallback<unknown>([
    `/statistics/round/${roundIdx}/dnf`,
  ]);
  return parseDnfCount(payload);
};
