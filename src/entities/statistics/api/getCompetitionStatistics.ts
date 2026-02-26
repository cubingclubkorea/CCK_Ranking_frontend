import { apiClient } from "@/shared/api/base";
import type { CompDnfCount, CompExtraItem, CompStaffCountItem } from "../model/competitionStatistics";

const parseNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
};

const parseNullableString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value;
  return null;
};

const parseExtraList = (rows: unknown): CompExtraItem[] => {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const source = (row ?? {}) as Record<string, unknown>;
    return {
      idx: parseNumber(source.idx),
      recordIdx: parseNumber(source.recordIdx),
      attemptTry: parseNumber(source.attemptTry),
      time: typeof source.time === "number" && Number.isFinite(source.time) ? source.time : null,
      scramblerName: parseNullableString(source.scramblerName),
      scramblerCckId: parseNullableString(source.scramblerCckId),
      judgeName: parseNullableString(source.judgeName),
      judgeCckId: parseNullableString(source.judgeCckId),
      extra: parseNumber(source.extra),
      exReason: parseNullableString(source.exReason),
      delegateName: parseNullableString(source.delegateName),
      delegateCckId: parseNullableString(source.delegateCckId),
      exScramblerName: parseNullableString(source.exScramblerName),
      exScramblerCckId: parseNullableString(source.exScramblerCckId),
    };
  });
};

const parseStaffCountList = (rows: unknown): CompStaffCountItem[] => {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const source = (row ?? {}) as Record<string, unknown>;
    return {
      count: parseNumber(source.count),
      staffName: parseNullableString(source.staffName) ?? "-",
      staffCckId: parseNullableString(source.staffCckId),
    };
  });
};

const parseDnfCount = (value: unknown): CompDnfCount => {
  if (!value || typeof value !== "object") {
    return { dnfCount: 0, successCount: 0, totalCount: 0 };
  }

  const source = value as Record<string, unknown>;
  return {
    dnfCount: parseNumber(source.dnfCount ?? source.dnf_count ?? source.dnf),
    successCount: parseNumber(source.successCount ?? source.success_count ?? source.success),
    totalCount: parseNumber(source.totalCount ?? source.total_count ?? source.total),
  };
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

  throw lastError instanceof Error ? lastError : new Error("통계 API 호출에 실패했습니다.");
};

const buildCandidates = (compIdx: number, suffixes: string[]): string[] => {
  const candidates = suffixes.flatMap((suffix) => [
    `/statistics/comp/${compIdx}/${suffix}`,
    `/statistics/competition/${compIdx}/${suffix}`,
    `/statistics/${compIdx}/${suffix}`,
    `/statistics/comp/${suffix}/${compIdx}`,
    `/statistics/competition/${suffix}/${compIdx}`,
    `/statistics/${suffix}/${compIdx}`,
    `/competition/${compIdx}/statistics/${suffix}`,
  ]);

  return Array.from(new Set(candidates));
};

const COMP_EXTRA_SUFFIXES = ["extra", "extra-list", "comp-extra-list", "get-comp-extra-list", "GetCompExtraList"];
const JUDGE_COUNT_SUFFIXES = ["judge", "judge-count", "comp-judge-count", "get-judge-count", "GetJudgeCount"];
const SCRAMBLER_COUNT_SUFFIXES = ["scrambler", "scrambler-count", "comp-scrambler-count", "get-scrambler-count", "GetScramblerCount"];
const DNF_COUNT_SUFFIXES = ["dnf", "dnf-count", "dnf-count-by-comp", "get-dnf-count-by-comp", "GetDNFCountByComp"];

export const getCompExtraList = async (compIdx: number): Promise<CompExtraItem[]> => {
  const payload = await callWithFallback<unknown>(buildCandidates(compIdx, COMP_EXTRA_SUFFIXES));
  return parseExtraList(payload);
};

export const getJudgeCount = async (compIdx: number): Promise<CompStaffCountItem[]> => {
  const payload = await callWithFallback<unknown>(buildCandidates(compIdx, JUDGE_COUNT_SUFFIXES));
  return parseStaffCountList(payload);
};

export const getScramblerCount = async (compIdx: number): Promise<CompStaffCountItem[]> => {
  const payload = await callWithFallback<unknown>(buildCandidates(compIdx, SCRAMBLER_COUNT_SUFFIXES));
  return parseStaffCountList(payload);
};

export const getDnfCountByComp = async (compIdx: number): Promise<CompDnfCount> => {
  const payload = await callWithFallback<unknown>(buildCandidates(compIdx, DNF_COUNT_SUFFIXES));
  return parseDnfCount(payload);
};

export const getCompBreakCount = async (compIdx: number): Promise<number> => {
  const payload = await callWithFallback<unknown>([
    `/comp/${compIdx}/break`,
    `/competition/${compIdx}/break`,
  ]);

  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    if (Array.isArray(source.content)) {
      return source.content.length;
    }
    return parseNumber(source.count ?? source.totalCount ?? source.total ?? 0);
  }

  return 0;
};
