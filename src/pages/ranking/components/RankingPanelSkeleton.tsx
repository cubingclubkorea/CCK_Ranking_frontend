export const RankingPanelSkeleton = () => (
  <section className="ranking-panel ranking-panel--skeleton" aria-hidden="true">
    <div className="ranking-controls ranking-controls--skeleton">
      <div className="ranking-control-block">
        <div className="ui-skeleton ranking-skeleton-control-title" />
        <div className="ranking-event-tabs">
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={`event-skeleton-${index}`} className="ui-skeleton ranking-skeleton-event-tab" />
          ))}
        </div>
      </div>
      <div className="ranking-control-block">
        <div className="ui-skeleton ranking-skeleton-control-title" />
        <div className="ranking-metric-tabs ranking-metric-tabs--skeleton">
          <div className="ui-skeleton ranking-skeleton-metric-tab" />
          <div className="ui-skeleton ranking-skeleton-metric-tab" />
        </div>
      </div>
    </div>

    <div className="ranking-panel-head">
      <div className="ui-skeleton ranking-skeleton-panel-title" />
      <div className="ui-skeleton ranking-skeleton-panel-meta" />
    </div>

    <div className="ranking-table-wrap">
      <div className="ranking-chart-skeleton ranking-chart-skeleton--table">
        <div className="ui-skeleton ui-skeleton-table-head" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
      </div>
    </div>
  </section>
);
