export const RecentRecordListSkeleton = () => (
  <div className="recent-record-list">
    {Array.from({ length: 6 }).map((_, index) => (
      <article className="recent-record-item" key={`record-skeleton-${index}`}>
        <div className="ui-skeleton recent-record-skeleton-badge" aria-hidden="true" />
        <div className="recent-record-content">
          <div className="ui-skeleton recent-record-skeleton-title" aria-hidden="true" />
          <div className="ui-skeleton recent-record-skeleton-subtitle" aria-hidden="true" />
        </div>
      </article>
    ))}
  </div>
);
