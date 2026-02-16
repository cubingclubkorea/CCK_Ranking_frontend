import { useState } from "react";
import { type RecentRecordItem, useRecentRecords } from "@/features/recentRecord";
import { formatTimeValue } from "@/features/ranking";
import { RecordDetailModal } from "@/pages/round/components/RecordDetailModal";
import { PageHeader } from "@/widgets";
import { RecentRecordList } from "./components/RecentRecordList";
import { RecentRecordListSkeleton } from "./components/RecentRecordListSkeleton";

export const RecordPage = () => {
  const { loading, error, records } = useRecentRecords();
  const [selected, setSelected] = useState<{ rank: number; record: RecentRecordItem["record"] } | null>(null);

  return (
    <div className="main-page recent-record-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/sidebar/record.svg"
        title="신기록"
        subtitle="Recent Records"
      />

      <section className="recent-record-panel">
        <div className="recent-record-panel-head">
          <h2 className="recent-record-panel-title">최근 신기록</h2>
          {!loading ? <span className="recent-record-panel-meta">총 {records.length.toLocaleString()}개</span> : null}
        </div>

        {loading ? <RecentRecordListSkeleton /> : null}
        {!loading && error ? <div className="round-list-empty">{error}</div> : null}
        {!loading && !error && records.length === 0 ? (
          <div className="round-list-empty">최근 신기록 데이터가 없습니다.</div>
        ) : null}
        {!loading && !error && records.length > 0 ? (
          <RecentRecordList
            records={records}
            onSelect={(item) => {
              setSelected({
                rank: item.rank,
                record: item.record,
              });
            }}
          />
        ) : null}
      </section>

      <RecordDetailModal
        selected={selected}
        onClose={() => setSelected(null)}
        formatTimeValue={formatTimeValue}
      />
    </div>
  );
};
