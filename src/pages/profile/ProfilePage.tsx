import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileData } from "@/features/profile";
import { shouldUseRequestErrorPage } from "@/shared";
import { PageHeader } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";
import {
  ProfileIdentityCard,
  ProfilePageSkeleton,
  ProfileRankingSection,
  ProfileStatisticsSection,
} from "./components";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { cckId } = useParams();
  const profile = useProfileData(cckId);
  const normalizedCckId = (cckId ?? "").trim();
  const isLegacyProfile = useMemo(
    () => Boolean(normalizedCckId) && !/^CCK[A-Za-z0-9]{8}$/.test(normalizedCckId),
    [normalizedCckId]
  );
  const profileActions = useMemo(
    () =>
      profile.isMyProfile
        ? [
            {
              label: "프로필 수정",
              iconSrc: "/icon/sidebar/pencil.svg",
              iconClassName: "page-action-icon profile-page-action-icon--black",
              onClick: () => navigate("/settings"),
            },
            {
              label: "계정 설정",
              iconSrc: "/icon/button/settings.svg",
              iconClassName: "page-action-icon profile-page-action-icon--black",
              onClick: () => navigate("/settings"),
            },
          ]
        : [],
    [navigate, profile.isMyProfile]
  );

  if (profile.loading) return <ProfilePageSkeleton />;

  if (profile.error && shouldUseRequestErrorPage(profile.error)) {
    return <RequestErrorPage message={profile.error} />;
  }

  if (profile.error) return <div className="round-page">{profile.error}</div>;

  return (
    <div className="main-page profile-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/sidebar/person.svg"
        title="선수 정보"
        subtitle="Competitor Profile"
        actions={profileActions}
      />

      {isLegacyProfile ? (
        <section className="profile-legacy-banner" role="status" aria-live="polite">
          <h3 className="profile-legacy-banner-title">프로필 안내</h3>
          <p className="profile-legacy-banner-text">
            현재 표시 중인 프로필은 회원 시스템 연동 이전 데이터로 생성된 계정입니다.
            일부 항목(이름, 지역, 회원 조회 정보)이 최신 정보와 다를 수 있습니다.
            동일 인물 기준으로 계정이 분리되어 조회될 수 있으므로 계정 통합을 권장드립니다.
          </p>
          <p className="profile-legacy-banner-footnote">
            정확한 정보 반영과 계정 통합이 필요한 경우{" "}
            <button
              type="button"
              className="profile-legacy-inline-link"
              onClick={() => navigate("/transfer-record")}
            >
              기록 이전 신청
            </button>
            을 이용해 주세요.
          </p>
        </section>
      ) : null}

      <ProfileIdentityCard
        koreanName={profile.koreanName}
        englishName={profile.englishName}
        cckId={cckId ?? ""}
        gender={profile.gender}
        region={profile.region}
        isOrganizer={profile.isOrganizer}
      />

      <ProfileRankingSection cckId={cckId ?? ""} eventRankings={profile.eventRankings} />
      {/*<ProfileCompetitionsSection />*/}
      <ProfileStatisticsSection
        judgeCount={profile.judgeCount}
        scramblerCount={profile.scramblerCount}
        totalStaffCount={profile.totalStaffCount}
        competitionCount={profile.competitionCount}
        completeCount={profile.completeCount}
        eventCount={profile.eventRankings.length}
      />
    </div>
  );
};
