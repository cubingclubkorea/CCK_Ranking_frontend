export const NewRecordListSkeleton = () => (
  <div className="new-record-list">
    {Array.from({ length: 6 }).map((_, index) => (
      <article className="new-record-item" key={`record-skeleton-${index}`}>
        <div className="ui-skeleton new-record-skeleton-badge" aria-hidden="true" />
        <div className="new-record-content">
          <div className="ui-skeleton new-record-skeleton-title" aria-hidden="true" />
          <div className="ui-skeleton new-record-skeleton-subtitle" aria-hidden="true" />
        </div>
      </article>
    ))}
  </div>
);
