import { useEffect, useMemo, useState } from "react";
import { getCubeEventList } from "@/entities/cubeEvent";
import { type GlobalSingleRankingRecord } from "@/entities/statistics";
import { isBo3AvgCalc, isSingleAvgCalc, REGION_FILTER_OPTIONS, resolveRegionKey } from "@/shared";
import { getRankingRecords } from "../api/getRankingRecords";
import {
  getErrorMessage,
  type MetricEventKey,
  type RankingMetric,
  sortEventNames,
} from "../model/ranking";

export const useRankingData = () => {
  const rankingSizeOptions = [10, 30, 50, 100, 150] as const;
  const [orderedEventNames, setOrderedEventNames] = useState<string[]>([]);
  const [eventAvgCalcMap, setEventAvgCalcMap] = useState<Record<string, string>>({});
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [metric, setMetric] = useState<RankingMetric>("single");
  const [selectedRegion, setSelectedRegion] = useState("전체 지역");
  const [rankingSize, setRankingSize] = useState<number>(50);
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
    () => `${metric}:${selectedEvent}:${selectedRegion}:${rankingSize}` as MetricEventKey,
    [metric, selectedEvent, selectedRegion, rankingSize]
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
        const selectedRegionKey =
          selectedRegion === "전체 지역" ? undefined : resolveRegionKey(selectedRegion);
        if (selectedRegion !== "전체 지역" && !selectedRegionKey) {
          throw new Error("선택한 지역 정보를 확인할 수 없습니다.");
        }

        const rows = await getRankingRecords(metric, selectedEvent, rankingSize, selectedRegionKey);
        if (!mounted) return;
        setRankingCache((prev) => ({
          ...prev,
          [cacheKey]: rows,
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
  }, [averageEnabled, cacheKey, metric, rankingCache, rankingSize, selectedEvent, selectedRegion]);

  const rankingRows = selectedEvent ? rankingCache[cacheKey] ?? [] : [];
  const regionOptions = useMemo(
    () => ["전체 지역", ...REGION_FILTER_OPTIONS],
    []
  );
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
    rankingSize,
    setRankingSize,
    rankingSizeOptions: [...rankingSizeOptions],
    rankingRows,
  };
};
