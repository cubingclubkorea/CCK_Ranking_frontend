import type { RecentRecordItem } from "@/features/recentRecord";
import { getNewRecordBadgeSrc, mapRegionName } from "@/shared";

type RecentRecordListProps = {
  records: RecentRecordItem[];
  onSelect: (item: RecentRecordItem) => void;
};

export const RecentRecordList = ({ records, onSelect }: RecentRecordListProps) => (
  <div className="recent-record-list">
    {records.map((item) => {
      const badgeSrc = getNewRecordBadgeSrc(item.bestType);
      return (
        <article
          className="recent-record-item"
          key={item.id}
          onClick={() => onSelect(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(item);
            }
          }}
        >
          <div className="recent-record-badge-wrap">
            {badgeSrc ? <img className="recent-record-badge-image" src={badgeSrc} alt={item.bestType} /> : null}
          </div>
          <div className="recent-record-content">
            <p className="recent-record-title">
              {item.eventName} {item.metric === "single" ? "최고" : "평균"} {item.value}
            </p>
            <p className="recent-record-subtitle">
              {item.name} ({item.cckId}) · {mapRegionName(item.state) || "-"} · {item.compName}
            </p>
          </div>
        </article>
      );
    })}
  </div>
);
