import { useEffect, useMemo, useState } from "react";
import { getPlayerCount, getPlayerRanking, getPlayerStaffCount, type PlayerEventRanking } from "@/entities/statistics";
import { getAuthInfo, useAuthInfo } from "@/entities/authInfo";
import { getAuthUserProfile, hasAdminRole } from "@/features/auth/utils/tokenStorage";
import { mapRegionName } from "@/shared";

type ProfileData = {
  loading: boolean;
  error: string | null;
  isMyProfile: boolean;
  eventRankings: PlayerEventRanking[];
  judgeCount: number;
  scramblerCount: number;
  totalStaffCount: number;
  competitionCount: number;
  completeCount: number;
  isOrganizer: boolean;
  koreanName: string;
  englishName: string;
  gender: string;
  region: string;
};

const organizerPattern = /ADMIN|ORGANIZER|ROOT|관리자|운영/i;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "선수 정보를 불러오지 못했습니다.";
};

const normalizeText = (value?: string) => (value && value.trim() ? value.trim() : "-");
const normalizeName = (value?: string) => (value && value.trim() ? value.trim() : "사용자");

export const useProfileData = (cckId?: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventRankings, setEventRankings] = useState<PlayerEventRanking[]>([]);
  const [judgeCount, setJudgeCount] = useState(0);
  const [scramblerCount, setScramblerCount] = useState(0);
  const [totalStaffCount, setTotalStaffCount] = useState(0);
  const [competitionCount, setCompetitionCount] = useState(0);
  const [completeCount, setCompleteCount] = useState(0);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [resolvedKoreanName, setResolvedKoreanName] = useState<string | null>(null);
  const [resolvedEnglishName, setResolvedEnglishName] = useState<string | null>(null);
  const [resolvedGender, setResolvedGender] = useState<string | null>(null);
  const [resolvedRegion, setResolvedRegion] = useState<string | null>(null);

  const authProfile = useMemo(() => getAuthUserProfile(), []);
  const { authInfo: myAuthInfo } = useAuthInfo();
  const normalizedCckId = cckId?.trim() ?? "";
  const isMyProfile = !!normalizedCckId && normalizedCckId === (authProfile?.cckId ?? "");

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!normalizedCckId) {
        setError("CCK ID가 없습니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [rankingData, staffData, playerCountData] = await Promise.all([
          getPlayerRanking(normalizedCckId),
          getPlayerStaffCount(normalizedCckId),
          getPlayerCount(normalizedCckId),
        ]);
        if (!mounted) return;

        setEventRankings(rankingData);
        setJudgeCount(staffData.judgeCount ?? 0);
        setScramblerCount(staffData.scramblerCount ?? 0);
        setTotalStaffCount(staffData.totalCount ?? 0);
        setCompetitionCount(playerCountData.competitionCount ?? 0);
        setCompleteCount(playerCountData.completeCount ?? 0);

        const roleLabel = staffData.role ?? authProfile?.role ?? "";
        const detectedOrganizer = Boolean(staffData.isOrganizer || organizerPattern.test(roleLabel));
        setIsOrganizer(detectedOrganizer || (isMyProfile && hasAdminRole()));
      } catch (fetchError) {
        if (!mounted) return;
        setError(getErrorMessage(fetchError));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [authProfile?.role, isMyProfile, normalizedCckId]);

  // 본인 프로필: context에서 가져오기
  useEffect(() => {
    if (!isMyProfile || !myAuthInfo) return;
    setResolvedKoreanName(myAuthInfo.name?.trim() || null);
    setResolvedEnglishName(myAuthInfo.enName?.trim() || null);
    setResolvedGender(myAuthInfo.gender?.trim() || null);
    setResolvedRegion(myAuthInfo.state?.trim() || null);
  }, [isMyProfile, myAuthInfo]);

  // 타인 프로필: 별도 API 호출
  useEffect(() => {
    if (isMyProfile) return;

    let mounted = true;

    setResolvedKoreanName(null);
    setResolvedEnglishName(null);
    setResolvedGender(null);
    setResolvedRegion(null);
    if (!normalizedCckId) return;

    const fetchAuthInfo = async () => {
      try {
        const authInfo = await getAuthInfo(normalizedCckId);
        if (!mounted) return;
        setResolvedKoreanName(authInfo.name?.trim() || null);
        setResolvedEnglishName(authInfo.enName?.trim() || null);
        setResolvedGender(authInfo.gender?.trim() || null);
        setResolvedRegion(authInfo.state?.trim() || null);
      } catch {
        if (!mounted) return;
        setResolvedKoreanName(null);
        setResolvedEnglishName(null);
        setResolvedGender(null);
        setResolvedRegion(null);
      }
    };

    fetchAuthInfo();
    return () => {
      mounted = false;
    };
  }, [isMyProfile, normalizedCckId]);

  const koreanName = normalizeName(resolvedKoreanName ?? (isMyProfile ? authProfile?.name : undefined));
  const englishName = normalizeText(resolvedEnglishName ?? (isMyProfile ? authProfile?.englishName : undefined) ?? "User");
  const gender = normalizeText(resolvedGender ?? (isMyProfile ? authProfile?.gender : undefined));
  const region = normalizeText(mapRegionName(resolvedRegion ?? (isMyProfile ? authProfile?.region : undefined)) ?? undefined);

  const data: ProfileData = {
    loading,
    error,
    isMyProfile,
    eventRankings,
    judgeCount,
    scramblerCount,
    totalStaffCount,
    competitionCount,
    completeCount,
    isOrganizer,
    koreanName,
    englishName,
    gender,
    region,
  };

  return data;
};
