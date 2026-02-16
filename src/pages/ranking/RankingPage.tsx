import { useEffect, useMemo, useState } from "react";
import type { Record as RoundRecord } from "@/entities/record";
import { getAttemptValue, formatTimeValue, toRecord, useRankingData } from "@/features/ranking";
import { RecordDetailModal } from "@/pages/round/components/RecordDetailModal";
import { RankingControls } from "./components/RankingControls";
import { RankingHeader } from "./components/RankingHeader";
import { RankingPanelSkeleton } from "./components/RankingPanelSkeleton";
import { RankingTable } from "./components/RankingTable";

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
    rankingRows,
  } = useRankingData();
  const [selectedRecord, setSelectedRecord] = useState<{ record: RoundRecord; rank: number } | null>(null);

  useEffect(() => {
    setSelectedRecord(null);
  }, [metric, selectedEvent]);

  const metricLabel = useMemo(() => (metric === "single" ? "최고" : "평균"), [metric]);

  if (eventLoading) {
    return (
      <div className="main-page ranking-page">
        <RankingHeader />
        <RankingPanelSkeleton />
      </div>
    );
  }

  return (
    <div className="main-page ranking-page">
      <RankingHeader />

      {rankingLoading ? (
        <RankingPanelSkeleton />
      ) : (
        <section className="ranking-panel">
          <RankingControls
            events={visibleEventNames}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            metric={metric}
            onSelectMetric={setMetric}
          />

          <div className="ranking-panel-head">
            <h2 className="ranking-panel-title">
              {selectedEvent || "-"} · {metricLabel}
            </h2>
            <span className="ranking-panel-meta">
              {rankingRows.length > 0 ? `총 ${rankingRows.length.toLocaleString()}명` : "데이터 없음"}
            </span>
          </div>

          {error ? <div className="round-list-empty">{error}</div> : null}

          {!error && rankingRows.length === 0 ? (
            <div className="round-list-empty">선택한 종목의 랭킹 데이터가 없습니다.</div>
          ) : null}

          {!error && rankingRows.length > 0 ? (
            <RankingTable
              rows={rankingRows}
              metric={metric}
              onSelectRow={(row, index) => {
                setSelectedRecord({ record: toRecord(row), rank: index + 1 });
              }}
            />
          ) : null}
        </section>
      )}

      <RecordDetailModal
        selected={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        formatTimeValue={formatTimeValue}
        getAttemptValue={getAttemptValue}
      />
    </div>
  );
};
