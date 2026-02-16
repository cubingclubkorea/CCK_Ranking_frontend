import { useEffect, useState } from "react";
import { type RankingRecordMetric, getRankingEventNames, getRankingRecords, formatTimeValue } from "@/features/ranking";
import { resolveAverageValue } from "@/shared";

export type RecentRecordItem = {
  id: string;
  bestType: "CCR" | "SR";
  eventName: string;
  metric: RankingRecordMetric;
  value: string;
  name: string;
  cckId: string;
  state: string;
  compName: string;
  idx: number;
};

type UseRecentRecordsResult = {
  loading: boolean;
  error: string | null;
  records: RecentRecordItem[];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "최근 신기록을 불러오지 못했습니다.";
};

const isBestType = (value: string | null): value is "CCR" | "SR" => value === "CCR" || value === "SR";

export const useRecentRecords = (): UseRecentRecordsResult => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<RecentRecordItem[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchRecentRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const eventNames = await getRankingEventNames();
        const targets = eventNames.flatMap((eventName) => {
          const metrics: RankingRecordMetric[] = ["single", "average"];
          return metrics.map((metric) => ({ eventName, metric }));
        });

        const settled = await Promise.allSettled(
          targets.map(({ eventName, metric }) => getRankingRecords(metric, eventName))
        );

        if (!mounted) return;

        const merged: RecentRecordItem[] = [];

        settled.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          const { eventName, metric } = targets[index];

          result.value.forEach((row) => {
            if (metric === "single") {
              if (!isBestType(row.singleBestType) || row.single === null) return;
              merged.push({
                id: `single-${row.idx}`,
                bestType: row.singleBestType,
                eventName,
                metric,
                value: formatTimeValue(row.single),
                name: row.name,
                cckId: row.cckId,
                state: row.state ?? "",
                compName: row.compName,
                idx: row.idx,
              });
              return;
            }

            if (!isBestType(row.averageBestType)) return;
            const averageValue = resolveAverageValue(row.attempts, row.avgCalc, row.average);
            if (averageValue === null || averageValue === undefined) return;
            merged.push({
              id: `average-${row.idx}`,
              bestType: row.averageBestType,
              eventName,
              metric,
              value: formatTimeValue(averageValue),
              name: row.name,
              cckId: row.cckId,
              state: row.state ?? "",
              compName: row.compName,
              idx: row.idx,
            });
          });
        });

        const sorted = merged
          .sort((a, b) => {
            if (a.bestType !== b.bestType) {
              return a.bestType === "CCR" ? -1 : 1;
            }
            return b.idx - a.idx;
          })
          .slice(0, 24);
        setRecords(sorted);
      } catch (fetchError) {
        if (!mounted) return;
        setError(getErrorMessage(fetchError));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRecentRecords();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    loading,
    error,
    records,
  };
};
