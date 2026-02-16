const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <div className={`ui-skeleton ${className}`.trim()} aria-hidden="true" />
);

const SkeletonCardRow = () => (
  <div className="ui-skeleton-card-row">
    <div className="ui-skeleton-card-body">
      <SkeletonLine className="ui-skeleton-card-title" />
      <SkeletonLine className="ui-skeleton-card-meta" />
    </div>
    <SkeletonLine className="ui-skeleton-card-pill" />
  </div>
);

export const MainPageSkeleton = () => {
  return (
    <div className="main-page ui-skeleton-page ui-skeleton-main-page">
      {["다가오는 대회", "진행중인 대회", "지나간 대회"].map((section) => (
        <div className="main-section" key={section}>
          <SkeletonLine className="ui-skeleton-main-title" />
          <div className="card-list-group">
            <SkeletonCardRow />
            <SkeletonCardRow />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CompetitionPageSkeleton = () => {
  return (
    <div className="main-page ui-skeleton-page">
      <div className="comp-header ui-skeleton-comp-header">
        <div className="ui-skeleton-comp-head-left">
          <SkeletonLine className="ui-skeleton-comp-title" />
          <SkeletonLine className="ui-skeleton-comp-meta" />
        </div>
        <div className="ui-skeleton-comp-head-actions">
          <SkeletonLine className="ui-skeleton-action-btn" />
          <SkeletonLine className="ui-skeleton-action-btn" />
        </div>
      </div>

      <div className="comp-content">
        <div className="round-schedule">
          <div className="round-day-tabs">
            <SkeletonLine className="ui-skeleton-day-tab" />
            <SkeletonLine className="ui-skeleton-day-tab" />
            <SkeletonLine className="ui-skeleton-day-tab" />
          </div>
          <RoundListSkeleton />
        </div>
      </div>
    </div>
  );
};

export const RoundPageSkeleton = () => {
  return (
    <div className="main-page ui-skeleton-page">
      <div className="comp-header ui-skeleton-comp-header">
        <div className="ui-skeleton-comp-head-left">
          <SkeletonLine className="ui-skeleton-comp-title" />
          <SkeletonLine className="ui-skeleton-comp-meta" />
        </div>
      </div>
      <section className="round-panel">
        <div className="round-panel-top">
          <SkeletonLine className="ui-skeleton-search" />
        </div>
        <div className="record-table-wrap">
          <SkeletonLine className="ui-skeleton-table-head" />
          <SkeletonLine className="ui-skeleton-table-row" />
          <SkeletonLine className="ui-skeleton-table-row" />
          <SkeletonLine className="ui-skeleton-table-row" />
          <SkeletonLine className="ui-skeleton-table-row" />
        </div>
      </section>
    </div>
  );
};

export const RoundRecordEditPageSkeleton = () => {
  return (
    <div className="admin-page ui-skeleton-page">
      <div className="comp-header ui-skeleton-comp-header">
        <div className="ui-skeleton-comp-head-left">
          <SkeletonLine className="ui-skeleton-comp-title" />
          <SkeletonLine className="ui-skeleton-comp-meta" />
        </div>
      </div>
      <section className="round-panel round-edit-layout">
        <div className="record-edit-panel">
          <SkeletonLine className="ui-skeleton-search" />
          <SkeletonLine className="ui-skeleton-input" />
          <SkeletonLine className="ui-skeleton-input" />
          <SkeletonLine className="ui-skeleton-input" />
          <SkeletonLine className="ui-skeleton-input" />
          <SkeletonLine className="ui-skeleton-input" />
          <div className="ui-skeleton-actions">
            <SkeletonLine className="ui-skeleton-chip" />
            <SkeletonLine className="ui-skeleton-chip" />
          </div>
        </div>
        <div className="record-table-panel">
          <SkeletonLine className="ui-skeleton-table-head" />
          <SkeletonLine className="ui-skeleton-table-row" />
          <SkeletonLine className="ui-skeleton-table-row" />
          <SkeletonLine className="ui-skeleton-table-row" />
        </div>
      </section>
    </div>
  );
};

export const RoundListSkeleton = () => {
  return (
    <div className="ui-skeleton-list">
      <SkeletonLine className="ui-skeleton-round-card" />
      <SkeletonLine className="ui-skeleton-round-card" />
      <SkeletonLine className="ui-skeleton-round-card" />
    </div>
  );
};
