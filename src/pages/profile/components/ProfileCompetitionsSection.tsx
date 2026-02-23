export const ProfileCompetitionsSection = () => (
  <section className="profile-section">
    <div className="profile-section-head">
      <h3 className="profile-main-section-title">출전 대회</h3>
    </div>
    <div className="profile-competition-board">
      <div className="profile-competition-head">
        <span>출전 대회 목록</span>
        <span className="profile-competition-count">준비 중</span>
      </div>
      <div className="profile-competition-list">
        <article className="profile-competition-item">
          <div>
            <strong>출전 대회 API 연동 대기</strong>
            <p>연동 즉시 최신 참가 이력을 카드형 목록으로 제공합니다.</p>
          </div>
          <span className="profile-competition-item-tag">PENDING</span>
        </article>
      </div>
    </div>
  </section>
);
