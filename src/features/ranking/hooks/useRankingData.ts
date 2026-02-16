import { useEffect, useMemo, useState } from "react";
import { type GlobalSingleRankingRecord } from "@/entities/statistics";
import { mapRegionName, REGION_FILTER_OPTIONS } from "@/shared";
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
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [metric, setMetric] = useState<RankingMetric>("single");
  const [selectedRegion, setSelectedRegion] = useState("전체 지역");
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
    if (orderedEventNames.length === 0) {
      setSelectedEvent("");
      return;
    }
    if (!selectedEvent || !orderedEventNames.includes(selectedEvent)) {
      setSelectedEvent(orderedEventNames[0]);
    }
  }, [orderedEventNames, selectedEvent]);

  const cacheKey = useMemo(
    () => `${metric}:${selectedEvent}` as MetricEventKey,
    [metric, selectedEvent]
  );

  useEffect(() => {
    let mounted = true;

    const fetchSelectedRanking = async () => {
      if (!selectedEvent) {
        setRankingLoading(false);
        return;
      }

      const cachedRows = rankingCache[cacheKey];
      if (cachedRows) {
        setRankingLoading(false);
        return;
      }

      setRankingLoading(true);
      setError(null);

      try {
        const rows = await getRankingRecords(metric, selectedEvent);
        if (!mounted) return;
        setRankingCache((prev) => ({
          ...prev,
          [cacheKey]: sortRanking(rows, metric),
        }));
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setRankingLoading(false);
      }
    };

    fetchSelectedRanking();

    return () => {
      mounted = false;
    };
  }, [cacheKey, metric, rankingCache, selectedEvent]);

  const rankingRows = selectedEvent ? rankingCache[cacheKey] ?? [] : [];
  const regionOptions = useMemo(
    () => ["전체 지역", ...REGION_FILTER_OPTIONS],
    []
  );
  const filteredRankingRows = useMemo(() => {
    if (selectedRegion === "전체 지역") {
      return rankingRows;
    }
    return rankingRows.filter((row) => {
      const mappedRegion = mapRegionName(row.state);
      return mappedRegion === selectedRegion;
    });
  }, [rankingRows, selectedRegion]);

  return {
    eventLoading,
    rankingLoading,
    error,
    visibleEventNames: orderedEventNames,
    selectedEvent,
    setSelectedEvent,
    metric,
    setMetric,
    selectedRegion,
    setSelectedRegion,
    regionOptions,
    rankingRows: filteredRankingRows,
  };
};
