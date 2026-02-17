import { PageHeader } from "@/widgets";

export const ProfilePageSkeleton = () => (
  <div className="main-page profile-page">
    <PageHeader
      containerClassName="comp-header"
      iconSrc="/icon/sidebar/person.svg"
      title="선수 정보"
      subtitle="Competitor Information"
    />

    <section className="profile-identity-card" aria-hidden="true">
      <div className="ui-skeleton profile-skeleton-avatar" />
      <div className="profile-identity-main">
        <div className="profile-identity-top">
          <div className="ui-skeleton profile-skeleton-name" />
          <div className="ui-skeleton profile-skeleton-badge" />
        </div>
        <div className="ui-skeleton profile-skeleton-name-en" />
        <div className="profile-meta-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`profile-meta-skeleton-${index}`}>
              <div className="ui-skeleton profile-skeleton-meta-key" />
              <div className="ui-skeleton profile-skeleton-meta-value" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="profile-section" aria-hidden="true">
      <div className="profile-section-head">
        <div className="ui-skeleton profile-skeleton-section-title" />
      </div>
      <div className="profile-event-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <article className="profile-event-card" key={`profile-event-skeleton-${index}`}>
            <div className="profile-event-head">
              <div className="ui-skeleton profile-skeleton-event-icon" />
              <div className="ui-skeleton profile-skeleton-event-title" />
            </div>
            <div className="ui-skeleton profile-skeleton-event-row" />
            <div className="ui-skeleton profile-skeleton-event-row" />
          </article>
        ))}
      </div>
    </section>

    <section className="profile-section" aria-hidden="true">
      <div className="profile-section-head">
        <div className="ui-skeleton profile-skeleton-section-title" />
      </div>
      <div className="profile-competition-board">
        <div className="profile-competition-head">
          <div className="ui-skeleton profile-skeleton-competition-head" />
          <div className="ui-skeleton profile-skeleton-competition-count" />
        </div>
        <div className="profile-competition-list">
          {Array.from({ length: 2 }).map((_, index) => (
            <article className="profile-competition-item" key={`profile-competition-skeleton-${index}`}>
              <div className="profile-skeleton-competition-body">
                <div className="ui-skeleton profile-skeleton-competition-title" />
                <div className="ui-skeleton profile-skeleton-competition-subtitle" />
              </div>
              <div className="ui-skeleton profile-skeleton-competition-tag" />
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="profile-section" aria-hidden="true">
      <div className="profile-section-head">
        <div className="ui-skeleton profile-skeleton-section-title" />
      </div>

      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <div className="profile-stats-subsection" key={`profile-stats-section-skeleton-${sectionIndex}`}>
          <div className="ui-skeleton profile-skeleton-stats-subtitle" />
          <div className="profile-stats-grid">
            {Array.from({ length: 3 }).map((__, cardIndex) => (
              <article className="profile-stat-card" key={`profile-stat-skeleton-${sectionIndex}-${cardIndex}`}>
                <div className="ui-skeleton profile-skeleton-stat-title" />
                <div className="ui-skeleton profile-skeleton-stat-value" />
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  </div>
);
