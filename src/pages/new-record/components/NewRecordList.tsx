import type { NewRecordItem } from "@/features/newRecord";
import { getNewRecordBadgeSrc, getRegionLogoSrc, mapRegionName } from "@/shared";

type NewRecordListProps = {
  records: NewRecordItem[];
  onSelect: (item: NewRecordItem) => void;
};

export const NewRecordList = ({ records, onSelect }: NewRecordListProps) => (
  <div className="new-record-list">
    {records.map((item) => {
      const badgeSrc = getNewRecordBadgeSrc(item.bestType);
      const regionLabel = mapRegionName(item.state) ?? item.state ?? "-";
      const regionLogoSrc = getRegionLogoSrc(item.state);
      return (
        <article
          className="new-record-item"
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
          <div className="new-record-badge-wrap">
            {badgeSrc ? (
              <img
                className={`new-record-badge-image${item.bestType === "CCR" ? " new-record-badge-image--ccr" : ""}`}
                src={badgeSrc}
                alt={item.bestType}
              />
            ) : null}
          </div>
          <div className="new-record-content">
            <p className="new-record-title">
              {item.eventName} {item.metric === "single" ? "최고" : "평균"} {item.value}
            </p>
            <p className="new-record-subtitle">
              {item.name} ·{" "}
              <span className="region-inline">
                {regionLogoSrc ? <img className="region-logo" src={regionLogoSrc} alt="" aria-hidden="true" /> : null}
                <span>{regionLabel}</span>
              </span>
              <span className="new-record-subtitle-comp">{item.compName}</span>
            </p>
          </div>
        </article>
      );
    })}
  </div>
);
