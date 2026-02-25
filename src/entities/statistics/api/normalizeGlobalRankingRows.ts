import type { GlobalSingleRankingRecord } from "../types";

export const normalizeGlobalRankingRows = (
  payload: unknown
): GlobalSingleRankingRecord[] => {
  if (Array.isArray(payload)) {
    return payload as GlobalSingleRankingRecord[];
  }

  const objectPayload =
    typeof payload === "object" && payload !== null
      ? (payload as {
          data?: unknown;
          content?: unknown;
          items?: unknown;
          result?: unknown;
        })
      : null;

  const candidates = [
    objectPayload?.data,
    objectPayload?.content,
    objectPayload?.items,
    objectPayload?.result,
  ];
  const matched = candidates.find((item) => Array.isArray(item));
  return (matched as GlobalSingleRankingRecord[] | undefined) ?? [];
};
