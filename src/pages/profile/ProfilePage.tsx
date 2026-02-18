import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileData } from "@/features/profile";
import { shouldUseRequestErrorPage } from "@/shared";
import { PageHeader } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";
import {
  ProfileCompetitionsSection,
  ProfileIdentityCard,
  ProfilePageSkeleton,
  ProfileRankingSection,
  ProfileStatisticsSection,
} from "./components";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { cckId } = useParams();
  const profile = useProfileData(cckId);
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
