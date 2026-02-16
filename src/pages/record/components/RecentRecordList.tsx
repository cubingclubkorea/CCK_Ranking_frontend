import type { RecentRecordItem } from "@/features/recentRecord";
import { getNewRecordBadgeSrc, mapRegionName } from "@/shared";

type RecentRecordListProps = {
  records: RecentRecordItem[];
};

export const RecentRecordList = ({ records }: RecentRecordListProps) => (
  <div className="recent-record-list">
    {records.map((item) => {
      const badgeSrc = getNewRecordBadgeSrc(item.bestType);
      return (
        <article className="recent-record-item" key={item.id}>
          <div className="recent-record-badge-wrap">
            {badgeSrc ? <img className="recent-record-badge-image" src={badgeSrc} alt={item.bestType} /> : null}
          </div>
          <div className="recent-record-content">
            <p className="recent-record-title">
              {item.eventName} {item.metric === "single" ? "single" : "average"} of {item.value}
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
