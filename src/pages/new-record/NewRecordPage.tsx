import { useState } from "react";
import { NEW_RECORD_DAYS, type NewRecordItem, useNewRecords } from "@/features/newRecord";
import { formatTimeValue } from "@/features/ranking";
import { shouldUseRequestErrorPage } from "@/shared";
import { RecordDetailModal } from "@/pages/competition/round/components/RecordDetailModal";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";
import { PageHeader } from "@/widgets";
import { NewRecordList } from "./components/NewRecordList";
import { NewRecordListSkeleton } from "./components/NewRecordListSkeleton";

export const NewRecordPage = () => {
  const { loading, error, records } = useNewRecords();
  const [selected, setSelected] = useState<{ rank: number; record: NewRecordItem["record"] } | null>(null);

  if (!loading && error && shouldUseRequestErrorPage(error)) {
    return <RequestErrorPage message={error} />;
  }

  return (
    <div className="main-page new-record-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/sidebar/record.svg"
        title="신기록"
        subtitle="New Record"
      />

      <section className="new-record-panel">
        <div className="new-record-panel-head">
          <h2 className="new-record-panel-title">최근 신기록</h2>
          {!loading ? (
            <span className="new-record-panel-meta">
              최근 {NEW_RECORD_DAYS}일 기준 · 총 {records.length.toLocaleString()}개
            </span>
          ) : null}
        </div>

        {loading ? <NewRecordListSkeleton /> : null}
        {!loading && error ? <div className="round-list-empty">{error}</div> : null}
        {!loading && !error && records.length === 0 ? (
          <div className="round-list-empty">최근 신기록 데이터가 없습니다.</div>
        ) : null}
        {!loading && !error && records.length > 0 ? (
          <NewRecordList
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
