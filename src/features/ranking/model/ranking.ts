import type { BestType, Record as RoundRecord } from "@/entities/record";
import type { GlobalSingleRankingRecord } from "@/entities/statistics";

export type RankingMetric = "single" | "average";
export type MetricEventKey = `${RankingMetric}:${string}`;

const EVENT_ORDER_CANDIDATES: string[][] = [
  ["3x3x3"],
  ["2x2x2"],
  ["4x4x4"],
  ["5x5x5"],
  ["6x6x6"],
  ["7x7x7"],
  ["Pyraminx"],
  ["Megaminx"],
  ["Skewb"],
  ["Clock"],
  ["Square-1"],
  ["3x3x3 OH"],
  ["3x3x3 BLD"],
  ["4x4x4 BLD"],
  ["3x3x3 MULTBLD"],
  ["5x5x5 BLD"],
  ["3x3x3 FMC"],
  ["3x3x3 Ao12"],
  ["2x2x2 Ao12"],
  ["3x3x3 BA5"],
  ["4x4x4 BA5"],
  ["Pyraminx BA5"],
  ["Clock BA5"],
  ["Magic"],
  ["FTO"],
  ["234 Relay"],
  ["Mini-Guildford"],
  ["2인 1조"]
];

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "랭킹 데이터를 불러오지 못했습니다.";
};

export const sortEventNames = (rawEventNames: string[]) => {
  const nameSet = new Set(rawEventNames.filter((name) => name !== "Event Round"));
  const ordered: string[] = [];

  for (const candidateGroup of EVENT_ORDER_CANDIDATES) {
    const matched = candidateGroup.find((candidate) => nameSet.has(candidate));
    if (!matched) continue;
    ordered.push(matched);
    nameSet.delete(matched);
  }

  const remains = Array.from(nameSet.values()).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...remains];
};

export const sortRanking = (rows: GlobalSingleRankingRecord[], metric: RankingMetric) =>
  [...rows].sort((a, b) => {
    const aValue = (metric === "single" ? a.single : a.average) ?? Number.POSITIVE_INFINITY;
    const bValue = (metric === "single" ? b.single : b.average) ?? Number.POSITIVE_INFINITY;
    if (aValue !== bValue) return aValue - bValue;
    if (a.ranking !== b.ranking) return a.ranking - b.ranking;
    return a.name.localeCompare(b.name);
  });

export const formatTime = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)}`;
};

export const formatTimeValue = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  if (value === -1) return "DNF";
  if (value === -2) return "DNS";
  const absValue = Math.abs(value);
  if (absValue >= 60) {
    const minutes = Math.floor(absValue / 60);
    const seconds = absValue - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return value.toFixed(2);
};

export const getAttemptValue = (attempts: RoundRecord["attempts"], attemptTry: number) => {
  const attempt = attempts?.find((item) => item.attemptTry === attemptTry);
  return attempt ? formatTimeValue(attempt.time) : "-";
};

const toBestType = (value: string | null): BestType | undefined => {
  if (value === "PR" || value === "SR" || value === "CCR") return value;
  return undefined;
};

export const toRecord = (row: GlobalSingleRankingRecord): RoundRecord => ({
  idx: row.idx,
  pdx: row.pdx ?? 0,
  name: row.name,
  state: row.state ?? "",
  cckId: row.cckId,
  roundIdx: row.roundIdx,
  roundName: row.roundName,
  roundGroup: row.roundGroup ?? "",
  roundAdvance: row.roundAdvance ?? undefined,
  compIdx: row.compIdx,
  compName: row.compName,
  eventName: row.eventName,
  avgCalc: row.avgCalc,
  attempts: row.attempts.map((attempt) => ({
    idx: attempt.idx,
    recordIdx: attempt.recordIdx,
    attemptTry: attempt.attemptTry,
    time: attempt.time,
    scramblerName: "",
    scramblerCckId: "",
    judgeName: "",
    judgeCckId: "",
    extra: undefined,
    exReason: undefined,
    delegateName: undefined,
    delegateCckId: undefined,
    exScramblerName: undefined,
    exScramblerCckId: undefined,
  })),
  single: row.single ?? undefined,
  average: row.average ?? undefined,
  ranking: row.ranking,
  stateRanking: row.stateRanking ?? undefined,
  singleBestType: toBestType(row.singleBestType),
  averageBestType: toBestType(row.averageBestType),
  note: row.note ?? undefined,
});
