type ProfileStatisticsSectionProps = {
  judgeCount: number;
  scramblerCount: number;
  totalStaffCount: number;
  eventCount: number;
};

export const ProfileStatisticsSection = ({
  judgeCount,
  scramblerCount,
  totalStaffCount,
  eventCount,
}: ProfileStatisticsSectionProps) => (
  <section className="profile-section">
    <div className="profile-section-head">
      <h3 className="profile-main-section-title">통계</h3>
    </div>

    <div className="profile-stats-subsection">
      <h4 className="profile-stats-subtitle">스태프 활동</h4>
      <div className="profile-stats-grid">
        <article className="profile-stat-card">
          <h5>심판 수</h5>
          <p>{judgeCount.toLocaleString()}번</p>
        </article>
        <article className="profile-stat-card">
          <h5>스크램블러 수</h5>
          <p>{scramblerCount.toLocaleString()}번</p>
        </article>
        <article className="profile-stat-card">
          <h5>총 스태프 활동</h5>
          <p>{totalStaffCount.toLocaleString()}번</p>
        </article>
      </div>
    </div>

    <div className="profile-stats-subsection">
      <h4 className="profile-stats-subtitle">기록 요약</h4>
      <div className="profile-stats-grid">
        <article className="profile-stat-card">
          <h5>기록 종목 수</h5>
          <p>{eventCount.toLocaleString()}종목</p>
        </article>
      </div>
    </div>
  </section>
);
