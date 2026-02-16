import { PageHeader } from "@/widgets";

export const ProfilePageSkeleton = () => (
  <div className="main-page profile-page">
    <PageHeader
      containerClassName="comp-header"
      iconSrc="/icon/sidebar/person-data.svg"
      title="선수 정보"
      subtitle="Competitor Information"
    />
    <div className="round-panel">
      <div className="ui-skeleton ui-skeleton-title" aria-hidden="true" />
      <div className="ui-skeleton ui-skeleton-table-row" aria-hidden="true" />
      <div className="ui-skeleton ui-skeleton-table-row" aria-hidden="true" />
      <div className="ui-skeleton ui-skeleton-table-row" aria-hidden="true" />
    </div>
  </div>
);

