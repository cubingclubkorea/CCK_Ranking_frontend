import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Record as RoundRecord } from "@/entities/record";
import { formatTimeValue, toRecord, type RankingMetric, useRankingData } from "@/features/ranking";
import { mapRegionKeyToLabel, resolveRegionKey, shouldUseRequestErrorPage } from "@/shared";
import { PageHeader } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";
import { RecordDetailModal } from "@/pages/round/components/RecordDetailModal";
import { RankingControls } from "./components/RankingControls";
import { RankingPanelSkeleton } from "./components/RankingPanelSkeleton";
import { RankingTable } from "./components/RankingTable";
import { RankingTableSkeleton } from "./components/RankingTableSkeleton";

export const RankingPage = () => {
  const { event: rawEventParam, metric: rawMetricParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    eventLoading,
    rankingLoading,
    error,
    visibleEventNames,
    selectedEvent,
    setSelectedEvent,
    metric,
    setMetric,
    averageEnabled,
    selectedRegion,
    setSelectedRegion,
    regionOptions,
    rankingSize,
    setRankingSize,
    rankingSizeOptions,
    rankingRows,
  } = useRankingData();
  const [selectedRecord, setSelectedRecord] = useState<{ record: RoundRecord; rank: number } | null>(null);
  const defaultRegion = "전체 지역";
  const defaultShow = 50;

  const eventParam = useMemo(() => {
    if (!rawEventParam) return "";
    try {
      return decodeURIComponent(rawEventParam).replace(/_/g, " ");
    } catch {
      return rawEventParam.replace(/_/g, " ");
    }
  }, [rawEventParam]);

  const metricParam = useMemo<RankingMetric | null>(() => {
    if (rawMetricParam === "single" || rawMetricParam === "average") {
      return rawMetricParam;
    }
    return null;
  }, [rawMetricParam]);

  const stateParam = searchParams.get("state");
  const showParam = Number(searchParams.get("show"));
  const stateLabelParam = useMemo(
    () => (stateParam ? mapRegionKeyToLabel(stateParam) : null),
    [stateParam]
  );

  useEffect(() => {
    setSelectedRecord(null);
  }, [metric, selectedEvent, selectedRegion, rankingSize]);

  useEffect(() => {
    if (visibleEventNames.length === 0) return;
    const nextEvent =
      eventParam && visibleEventNames.includes(eventParam) ? eventParam : visibleEventNames[0];
    if (selectedEvent !== nextEvent) {
      setSelectedEvent(nextEvent);
    }
  }, [eventParam, selectedEvent, setSelectedEvent, visibleEventNames]);

  useEffect(() => {
    const nextMetric = metricParam ?? "single";
    if (metric !== nextMetric) {
      setMetric(nextMetric);
    }
  }, [metric, metricParam, setMetric]);

  useEffect(() => {
    const nextRegion =
      stateLabelParam && regionOptions.includes(stateLabelParam)
        ? stateLabelParam
        : stateParam && regionOptions.includes(stateParam)
          ? stateParam
          : defaultRegion;
    if (selectedRegion !== nextRegion) {
      setSelectedRegion(nextRegion);
    }
  }, [regionOptions, selectedRegion, setSelectedRegion, stateLabelParam, stateParam]);

  useEffect(() => {
    const nextSize = (rankingSizeOptions as readonly number[]).includes(showParam) 
      ? (showParam as 10 | 30 | 50 | 100 | 150)
      : (defaultShow as 10 | 30 | 50 | 100 | 150);
    if (rankingSize !== nextSize) {
      setRankingSize(nextSize);
    }
  }, [rankingSize, rankingSizeOptions, setRankingSize, showParam]);

  const toRankingUrl = (
    nextEvent: string,
    nextMetric: RankingMetric,
    nextRegion: string,
    nextSize: number
  ) => {
    const eventSlug = nextEvent.replace(/\s+/g, "_");
    const nextPath = `/ranking/${encodeURIComponent(eventSlug)}/${nextMetric}`;
    const nextParams = new URLSearchParams();
    if (nextRegion !== defaultRegion) {
      const regionKey = resolveRegionKey(nextRegion);
      if (regionKey) {
        nextParams.set("state", regionKey);
      }
    }
    if (nextSize !== defaultShow) {
      nextParams.set("show", String(nextSize));
    }
    const nextSearch = nextParams.toString();
    return nextSearch ? `${nextPath}?${nextSearch}` : nextPath;
  };

  useEffect(() => {
    if (!selectedEvent) return;
    if (!rawEventParam || !rawMetricParam) {
      navigate(toRankingUrl(selectedEvent, metric, selectedRegion, rankingSize), { replace: true });
    }
  }, [metric, navigate, rankingSize, rawEventParam, rawMetricParam, selectedEvent, selectedRegion]);

  const handleSelectEvent = (eventName: string) => {
    navigate(toRankingUrl(eventName, metric, selectedRegion, rankingSize), { replace: true });
  };

  const handleSelectMetric = (nextMetric: RankingMetric) => {
    if (!selectedEvent) return;
    if (nextMetric === "average" && !averageEnabled) {
      return;
    }
    navigate(toRankingUrl(selectedEvent, nextMetric, selectedRegion, rankingSize), { replace: true });
  };

  const handleSelectRegion = (region: string) => {
    if (!selectedEvent) return;
    navigate(toRankingUrl(selectedEvent, metric, region, rankingSize), { replace: true });
  };

  const handleSelectSize = (size: number) => {
    if (!selectedEvent) return;
    navigate(toRankingUrl(selectedEvent, metric, selectedRegion, size), { replace: true });
  };

  const metricLabel = useMemo(() => (metric === "single" ? "최고" : "평균"), [metric]);
  const rankingTitle = useMemo(() => {
    const baseTitle = `${selectedEvent || "-"} · ${metricLabel}`;
    if (selectedRegion === "전체 지역") {
      return baseTitle;
    }
    return `${baseTitle} · ${selectedRegion}`;
  }, [metricLabel, selectedEvent, selectedRegion]);

  if (eventLoading) {
    return (
      <div className="main-page ranking-page">
        <PageHeader
          containerClassName="comp-header ranking-header"
          iconSrc="/icon/sidebar/trophy.svg"
          title="랭킹"
          subtitle="CCK Ranking"
        />
        <RankingPanelSkeleton />
      </div>
    );
  }

  if (!rankingLoading && error && shouldUseRequestErrorPage(error)) {
    return <RequestErrorPage message={error} />;
  }

  return (
    <div className="main-page ranking-page">
      <PageHeader
        containerClassName="comp-header ranking-header"
        iconSrc="/icon/sidebar/trophy.svg"
        title="랭킹"
        subtitle="CCK Ranking"
      />

      <section className="ranking-panel">
        <RankingControls
          events={visibleEventNames}
          selectedEvent={selectedEvent}
          onSelectEvent={handleSelectEvent}
          metric={metric}
          onSelectMetric={handleSelectMetric}
          averageDisabled={!averageEnabled}
          regionOptions={regionOptions}
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
          sizeOptions={rankingSizeOptions}
          selectedSize={rankingSize}
          onSelectSize={handleSelectSize}
        />

        <div className="ranking-panel-head">
          {rankingLoading ? (
            <>
              <div className="ui-skeleton ranking-skeleton-panel-title" aria-hidden="true" />
              <div className="ui-skeleton ranking-skeleton-panel-meta" aria-hidden="true" />
            </>
          ) : (
            <>
              <h2 className="ranking-panel-title">
                {rankingTitle}
              </h2>
              <span className="ranking-panel-meta">
                {rankingRows.length > 0 ? `총 ${rankingRows.length.toLocaleString()}명` : "데이터 없음"}
              </span>
            </>
          )}
        </div>

        {rankingLoading ? <RankingTableSkeleton /> : null}

        {!rankingLoading && error ? <div className="round-list-empty">{error}</div> : null}

        {!rankingLoading && !error && rankingRows.length === 0 ? (
          <div className="round-list-empty">선택한 종목의 랭킹 데이터가 없습니다.</div>
        ) : null}

        {!rankingLoading && !error && rankingRows.length > 0 ? (
          <RankingTable
            rows={rankingRows}
            metric={metric}
            onSelectRow={(row, index) => {
              setSelectedRecord({ record: toRecord(row), rank: index + 1 });
            }}
          />
        ) : null}
      </section>

      <RecordDetailModal
        selected={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        formatTimeValue={formatTimeValue}
      />
    </div>
  );
};
