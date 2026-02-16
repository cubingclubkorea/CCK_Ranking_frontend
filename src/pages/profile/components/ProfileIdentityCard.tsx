type ProfileIdentityCardProps = {
  koreanName: string;
  englishName: string;
  cckId: string;
  gender: string;
  region: string;
  isOrganizer: boolean;
  onOpenOrganizerInfo: () => void;
};

export const ProfileIdentityCard = ({
  koreanName,
  englishName,
  cckId,
  gender,
  region,
  isOrganizer,
  onOpenOrganizerInfo,
}: ProfileIdentityCardProps) => (
  <section className="profile-identity-card">
    <div className="profile-avatar-block" aria-hidden="true" />
    <div className="profile-identity-main">
      <div className="profile-identity-top">
        <h2 className="profile-name">{koreanName}</h2>
        {isOrganizer ? (
          <div className="profile-role-wrap">
            <span className="profile-badge profile-badge--organizer">ORGANIZER</span>
            <button type="button" className="profile-role-info-btn" onClick={onOpenOrganizerInfo} aria-label="ORGANIZER 안내">
              i
            </button>
          </div>
        ) : (
          <span className="profile-badge">COMPETITOR</span>
        )}
      </div>
      <p className="profile-name-en">{englishName}</p>
      <div className="profile-meta-grid">
        <div>
          <span className="profile-meta-key">CCK ID</span>
          <span className="profile-meta-value">{cckId || "-"}</span>
        </div>
        <div>
          <span className="profile-meta-key">성별</span>
          <span className="profile-meta-value">{gender}</span>
        </div>
        <div>
          <span className="profile-meta-key">지역</span>
          <span className="profile-meta-value">{region}</span>
        </div>
      </div>
    </div>
  </section>
);

