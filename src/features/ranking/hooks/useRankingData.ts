import { useEffect, useMemo, useState } from "react";
import { getCubeEventList } from "@/entities/cubeEvent";
import { type GlobalSingleRankingRecord } from "@/entities/statistics";
import { isBo3AvgCalc, isSingleAvgCalc, mapRegionName, REGION_FILTER_OPTIONS } from "@/shared";
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
  const [eventAvgCalcMap, setEventAvgCalcMap] = useState<Record<string, string>>({});
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
        const events = await getCubeEventList();
        if (!mounted) return;

        const eventNames = Array.from(new Set(events.map((event) => event.eventName)));
        const avgCalcMap = events.reduce<Record<string, string>>((acc, event) => {
          if (!acc[event.eventName]) {
            acc[event.eventName] = event.avgCalc;
          }
          return acc;
        }, {});
        setOrderedEventNames(sortEventNames(eventNames));
        setEventAvgCalcMap(avgCalcMap);
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

  const averageEnabled = useMemo(() => {
    if (!selectedEvent) return true;
    const avgCalc = eventAvgCalcMap[selectedEvent];
    return !isSingleAvgCalc(avgCalc) && !isBo3AvgCalc(avgCalc);
  }, [eventAvgCalcMap, selectedEvent]);

  useEffect(() => {
    if (!averageEnabled && metric === "average") {
      setMetric("single");
    }
  }, [averageEnabled, metric]);

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
      if (metric === "average" && !averageEnabled) {
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
  }, [averageEnabled, cacheKey, metric, rankingCache, selectedEvent]);

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

  const handleSetMetric = (nextMetric: RankingMetric) => {
    if (nextMetric === "average" && !averageEnabled) return;
    setMetric(nextMetric);
  };

  return {
    eventLoading,
    rankingLoading,
    error,
    visibleEventNames: orderedEventNames,
    selectedEvent,
    setSelectedEvent,
    metric,
    setMetric: handleSetMetric,
    averageEnabled,
    selectedRegion,
    setSelectedRegion,
    regionOptions,
    rankingRows: filteredRankingRows,
  };
};
