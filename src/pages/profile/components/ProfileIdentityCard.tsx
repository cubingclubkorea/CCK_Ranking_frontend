import { useState } from "react";
import { getRegionLogoSrc, mapRegionName } from "@/shared";

type ProfileIdentityCardProps = {
  koreanName: string;
  englishName: string;
  cckId: string;
  gender: string;
  region: string;
  isOrganizer: boolean;
};

export const ProfileIdentityCard = ({
  koreanName,
  englishName,
  cckId,
  gender,
  region,
  isOrganizer,
}: ProfileIdentityCardProps) => {
  const [organizerTipOpen, setOrganizerTipOpen] = useState(false);
  const regionLabel = mapRegionName(region) ?? region ?? "-";
  const regionLogoSrc = getRegionLogoSrc(region);

  return (
    <section className="profile-identity-card">
      <div className="profile-avatar-block" aria-hidden="true" />
      <div className="profile-identity-main">
        <div className="profile-identity-top">
          <h2 className="profile-name">{koreanName}</h2>
          {isOrganizer ? (
            <div className="profile-role-wrap">
              <span className="profile-badge profile-badge--organizer">
                ORGANIZER
                <button
                  type="button"
                  className="profile-role-info-btn"
                  onClick={() => setOrganizerTipOpen((prev) => !prev)}
                  aria-expanded={organizerTipOpen}
                  aria-controls="organizer-info-tip"
                  aria-label="ORGANIZER 안내 보기"
                >
                  i
                </button>
              </span>
              {organizerTipOpen && (
                <div id="organizer-info-tip" className="profile-role-tip" role="status" aria-live="polite">
                  해당 선수는 공식 인증된 큐빙 클럽 코리아 조직위원입니다
                </div>
              )}
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
            <span className="profile-meta-value profile-region-value region-inline">
              {regionLogoSrc ? <img className="region-logo" src={regionLogoSrc} alt="" aria-hidden="true" /> : null}
              <span>{regionLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
