import { useEffect, useMemo, useState } from "react";
import { type GlobalSingleRankingRecord } from "@/entities/statistics";
import { getRankingEventNames } from "../api/getRankingEventNames";
import { getRankingRecords } from "../api/getRankingRecords";
import {
  getErrorMessage,
  type MetricEventKey,
  type RankingMetric,
  sortEventNames,
  sortRanking,
} from "../model/ranking";

export const useRankingData = () => {
  const [orderedEventNames, setOrderedEventNames] = useState<string[]>([]);
  const [visibleEventNames, setVisibleEventNames] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [metric, setMetric] = useState<RankingMetric>("single");
  const [eventLoading, setEventLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rankingCache, setRankingCache] = useState<Record<MetricEventKey, GlobalSingleRankingRecord[]>>({});

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      setEventLoading(true);
      setError(null);

      try {
        const eventNames = await getRankingEventNames();
        if (!mounted) return;

        setOrderedEventNames(sortEventNames(eventNames));
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setEventLoading(false);
      }
    };

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchAvailability = async () => {
      if (orderedEventNames.length === 0) {
        setVisibleEventNames([]);
        setSelectedEvent("");
        return;
      }

      setRankingLoading(true);
      setError(null);

      try {
        const rowsByEvent = await Promise.all(
          orderedEventNames.map(async (eventName) => {
            const key = `${metric}:${eventName}` as MetricEventKey;
            const cached = rankingCache[key];
            if (cached) {
              return { eventName, key, rows: cached };
            }

            const fetchedRows = await getRankingRecords(metric, eventName);
            return { eventName, key, rows: sortRanking(fetchedRows, metric) };
          })
        );

        if (!mounted) return;

        setRankingCache((prev) => {
          const next = { ...prev };
          for (const item of rowsByEvent) {
            next[item.key] = item.rows;
          }
          return next;
        });

        const nextVisible = rowsByEvent
          .filter((item) => item.rows.length > 0)
          .map((item) => item.eventName);
        setVisibleEventNames(nextVisible);

        if (nextVisible.length === 0) {
          setSelectedEvent("");
        } else if (!nextVisible.includes(selectedEvent)) {
          setSelectedEvent(nextVisible[0]);
        }
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setRankingLoading(false);
      }
    };

    fetchAvailability();

    return () => {
      mounted = false;
    };
  }, [metric, orderedEventNames]);

  const cacheKey = useMemo(
    () => `${metric}:${selectedEvent}` as MetricEventKey,
    [metric, selectedEvent]
  );

  const rankingRows = selectedEvent ? rankingCache[cacheKey] ?? [] : [];

  return {
    eventLoading,
    rankingLoading,
    error,
    visibleEventNames,
    selectedEvent,
    setSelectedEvent,
    metric,
    setMetric,
    rankingRows,
  };
};
