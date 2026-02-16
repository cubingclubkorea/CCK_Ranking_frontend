import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/widgets";
import { useProfileData } from "./hooks/useProfileData";
import {
  OrganizerInfoModal,
  ProfileCompetitionsSection,
  ProfileIdentityCard,
  ProfilePageSkeleton,
  ProfileRankingSection,
  ProfileStatisticsSection,
} from "./components";

export const ProfilePage = () => {
  const { cckId } = useParams();
  const [organizerInfoOpen, setOrganizerInfoOpen] = useState(false);
  const profile = useProfileData(cckId);

  if (profile.loading) return <ProfilePageSkeleton />;

  if (profile.error) return <div className="round-page">{profile.error}</div>;

  return (
    <div className="main-page profile-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/sidebar/person-data.svg"
        title="선수 정보"
        subtitle="Competitor Information"
      />

      <ProfileIdentityCard
        koreanName={profile.koreanName}
        englishName={profile.englishName}
        cckId={cckId ?? ""}
        gender={profile.gender}
        region={profile.region}
        isOrganizer={profile.isOrganizer}
        onOpenOrganizerInfo={() => setOrganizerInfoOpen(true)}
      />

      <ProfileRankingSection eventRankings={profile.eventRankings} />
      <ProfileCompetitionsSection />
      <ProfileStatisticsSection
        judgeCount={profile.judgeCount}
        scramblerCount={profile.scramblerCount}
        totalStaffCount={profile.totalStaffCount}
        eventCount={profile.eventRankings.length}
      />
      <OrganizerInfoModal open={organizerInfoOpen} onClose={() => setOrganizerInfoOpen(false)} />
    </div>
  );
};
