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
    <section
      className={`profile-identity-card${isOrganizer ? " profile-identity-card--organizer" : " profile-identity-card--competitor"}`}
    >
      {isOrganizer ? (
        <span className="profile-identity-organizer-mark" aria-hidden="true">
          ORGANIZER
        </span>
      ) : (
        <span className="profile-identity-competitor-mark" aria-hidden="true">
          COMPETITOR
        </span>
      )}
      {isOrganizer ? (
        <div className="profile-organizer-info-wrap">
          <button
            type="button"
            className={`profile-role-info-btn profile-role-info-btn--identity-card${organizerTipOpen ? " profile-role-info-btn--active" : ""}`}
            onClick={() => setOrganizerTipOpen((prev) => !prev)}
            aria-expanded={organizerTipOpen}
            aria-controls="organizer-info-tip"
            aria-label="ORGANIZER 안내 보기"
          >
            i
          </button>
          {organizerTipOpen && (
            <div
              id="organizer-info-tip"
              className="profile-role-tip profile-role-tip--identity-card"
              role="status"
              aria-live="polite"
            >
              해당 선수는 공식 인증된 큐빙 클럽 코리아 조직위원입니다
            </div>
          )}
        </div>
      ) : null}
      <div className="profile-identity-main">
        <div className="profile-identity-top">
          <h2 className="profile-name">{koreanName}</h2>
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
