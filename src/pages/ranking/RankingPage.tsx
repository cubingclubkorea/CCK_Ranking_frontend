import { useEffect, useMemo, useState } from "react";
import type { Record as RoundRecord } from "@/entities/record";
import { formatTimeValue, toRecord, useRankingData } from "@/features/ranking";
import { shouldUseRequestErrorPage } from "@/shared";
import { PageHeader } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";
import { RecordDetailModal } from "@/pages/round/components/RecordDetailModal";
import { RankingControls } from "./components/RankingControls";
import { RankingPanelSkeleton } from "./components/RankingPanelSkeleton";
import { RankingTable } from "./components/RankingTable";
import { RankingTableSkeleton } from "./components/RankingTableSkeleton";

export const RankingPage = () => {
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

  useEffect(() => {
    setSelectedRecord(null);
  }, [metric, selectedEvent, selectedRegion, rankingSize]);

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
          onSelectEvent={setSelectedEvent}
          metric={metric}
          onSelectMetric={setMetric}
          averageDisabled={!averageEnabled}
          regionOptions={regionOptions}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          sizeOptions={rankingSizeOptions}
          selectedSize={rankingSize}
          onSelectSize={setRankingSize}
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
