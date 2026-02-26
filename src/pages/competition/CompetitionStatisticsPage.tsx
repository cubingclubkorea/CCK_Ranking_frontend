import {
  getCompExtraList,
  getCompBreakCount,
  getCompetition,
  getDnfCountByComp,
  getJudgeCount,
  getScramblerCount,
  type CompDnfCount,
  type CompExtraItem,
  type CompStaffCountItem,
  type Competition,
} from "@/entities";
import { getRecordList } from "@/entities/record";
import { getRoundByDayCount, type Round } from "@/entities/round";
import { PageHeader } from "@/widgets";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDayRange = (start: Date, end: Date): number[] => {
  const items: number[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  let dayCount = 0;

  while (current <= last) {
    items.push(dayCount);
    current.setDate(current.getDate() + 1);
    dayCount += 1;
  }

  return items;
};

const getUniqueRounds = (schedules: Array<{ past: Round[]; now: Round[]; future: Round[] }>): Round[] => {
  const roundMap = new Map<number, Round>();
  schedules.forEach((schedule) => {
    [...schedule.past, ...schedule.now, ...schedule.future].forEach((round) => {
      roundMap.set(round.idx, round);
    });
  });
  return Array.from(roundMap.values());
};

const computeCompetitionParticipantCount = async (competition: Competition) => {
  const dayCounts = getDayRange(competition.compDateStart, competition.compDateEnd);
  const schedules = await Promise.all(dayCounts.map((dayCount) => getRoundByDayCount(competition.idx, dayCount)));
  const rounds = getUniqueRounds(schedules);

  if (rounds.length === 0) {
    return 0;
  }

  const recordLists = await Promise.allSettled(rounds.map((round) => getRecordList(round.idx)));
  const participantIds = new Set<string>();

  recordLists.forEach((result) => {
    if (result.status !== "fulfilled") return;
    result.value.forEach((record) => {
      if (record.cckId) {
        participantIds.add(record.cckId);
      }
    });
  });

  return participantIds.size;
};

type StaffRankingSectionProps = {
  title: string;
  rows: CompStaffCountItem[];
  emptyMessage: string;
};

const StaffRankingSection = ({ title, rows, emptyMessage }: StaffRankingSectionProps) => {
  const maxCount = rows[0]?.count ?? 0;

  return (
    <section className="comp-stat-panel">
      <div className="comp-stat-panel-head">
        <h2>{title}</h2>
      </div>
      <div className="comp-stat-ranking-list">
        {rows.length === 0 ? (
          <div className="round-list-empty">{emptyMessage}</div>
        ) : (
          rows.map((row, index) => {
            const ratio = maxCount > 0 ? Math.max((row.count / maxCount) * 100, 4) : 0;
            return (
              <article className="comp-stat-ranking-item" key={`${row.staffCckId ?? row.staffName}-${index}`}>
                <div className="comp-stat-ranking-row">
                  <span className="comp-stat-ranking-rank">#{index + 1}</span>
                  <div className="comp-stat-ranking-user">
                    <strong>{row.staffName}</strong>
                    <span>{row.staffCckId ?? "-"}</span>
                  </div>
                  <strong className="comp-stat-ranking-count">{row.count.toLocaleString()}회</strong>
                </div>
                <div className="comp-stat-bar-track">
                  <span className="comp-stat-bar-fill" style={{ width: `${ratio}%` }} />
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export const CompetitionStatisticsPage = () => {
  const { compIdx } = useParams();
  const compId = Number(compIdx);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [extraList, setExtraList] = useState<CompExtraItem[]>([]);
  const [judgeCountList, setJudgeCountList] = useState<CompStaffCountItem[]>([]);
  const [scramblerCountList, setScramblerCountList] = useState<CompStaffCountItem[]>([]);
  const [dnfCount, setDnfCount] = useState<CompDnfCount>({ dnfCount: 0, successCount: 0, totalCount: 0 });
  const [participantCount, setParticipantCount] = useState(0);
  const [renewedRecordCount, setRenewedRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partialError, setPartialError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!compIdx || Number.isNaN(compId)) {
        setError("대회 ID가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setPartialError(null);

      try {
        const competitionData = await getCompetition(compId);
        const [extrasResult, judgesResult, scramblersResult, dnfResult] = await Promise.allSettled([
          getCompExtraList(compId),
          getJudgeCount(compId),
          getScramblerCount(compId),
          getDnfCountByComp(compId),
        ]);

        if (!mounted) return;
        setCompetition(competitionData);
        setExtraList(extrasResult.status === "fulfilled" ? extrasResult.value : []);
        setJudgeCountList(
          judgesResult.status === "fulfilled" ? [...judgesResult.value].sort((a, b) => b.count - a.count) : []
        );
        setScramblerCountList(
          scramblersResult.status === "fulfilled" ? [...scramblersResult.value].sort((a, b) => b.count - a.count) : []
        );
        setDnfCount(
          dnfResult.status === "fulfilled" ? dnfResult.value : { dnfCount: 0, successCount: 0, totalCount: 0 }
        );

        const [participantCountResult, breakCountResult] = await Promise.allSettled([
          computeCompetitionParticipantCount(competitionData),
          getCompBreakCount(compId),
        ]);
        if (!mounted) return;
        setParticipantCount(participantCountResult.status === "fulfilled" ? participantCountResult.value : 0);
        setRenewedRecordCount(breakCountResult.status === "fulfilled" ? breakCountResult.value : 0);

        const hasFailedStatApi =
          extrasResult.status === "rejected" ||
          judgesResult.status === "rejected" ||
          scramblersResult.status === "rejected" ||
          dnfResult.status === "rejected" ||
          participantCountResult.status === "rejected" ||
          breakCountResult.status === "rejected";
        if (hasFailedStatApi) {
          setPartialError("일부 통계 API를 찾을 수 없어 표시 가능한 데이터만 보여줍니다.");
        }
      } catch (fetchError) {
        if (!mounted) return;
        const message = fetchError instanceof Error ? fetchError.message : "대회 통계를 불러오지 못했습니다.";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [compId, compIdx]);

  const extraSum = useMemo(
    () => extraList.reduce((sum, item) => sum + (Number.isFinite(item.extra) ? item.extra : 0), 0),
    [extraList]
  );
  const dnfRate = useMemo(() => {
    if (dnfCount.totalCount <= 0) return "0.00%";
    return `${((dnfCount.dnfCount / dnfCount.totalCount) * 100).toFixed(2)}%`;
  }, [dnfCount]);

  const headerTitle = competition ? `${competition.compName} 통계` : "대회 통계";
  const headerSubtitle = competition ? (
    <>
      <span>{formatDate(competition.compDateStart)}</span>
      {competition.location ? (
        <>
          <span className="page-title-meta-divider">·</span>
          <span>{competition.location}</span>
        </>
      ) : null}
    </>
  ) : (
    <span>대회 ID {compIdx ?? "-"}</span>
  );
  const competitionPath = competition ? `/competition/${competition.idx}` : "/competition";

  return (
    <div className="main-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/button/statistics.svg"
        title={headerTitle}
        subtitle={headerSubtitle}
        actions={[
          {
            label: "대회 페이지",
            iconSrc: "/icon/button/back.svg",
            to: competitionPath,
          },
          {
            label: "랭킹 홈",
            iconSrc: "/icon/button/home.svg",
            to: "/",
          },
        ]}
      />

      <div className="comp-content comp-stat-content">
        {loading ? <div className="round-list-empty">통계를 불러오는 중입니다.</div> : null}
        {error ? <div className="round-list-empty">{error}</div> : null}
        {partialError && !error ? <div className="round-list-empty">{partialError}</div> : null}
        {!competition && !loading ? (
          <div className="round-list-empty">대회 정보를 불러올 수 없습니다.</div>
        ) : null}
        {!competition || loading || error ? null : (
          <>
        <section className="comp-stat-panel">
          <div className="comp-stat-panel-head">
            <h2>대회 통계 요약</h2>
          </div>
          <div className="comp-stat-card-grid">
            <article className="profile-stat-card">
              <h5>성공 시도</h5>
              <p>{dnfCount.successCount.toLocaleString()}회</p>
            </article>
            <article className="profile-stat-card">
              <h5>참가자 수</h5>
              <p>{participantCount.toLocaleString()}명</p>
            </article>
            <article className="profile-stat-card">
              <h5>DNF 비율 / 횟수</h5>
              <p className="comp-stat-card-inline">
                <span>{dnfRate}</span>
                <span className="comp-stat-card-inline-sub">{` / ${dnfCount.dnfCount.toLocaleString()}회`}</span>
              </p>
            </article>
            <article className="profile-stat-card">
              <h5>엑스트라 수</h5>
              <p>{extraSum.toLocaleString()}회</p>
            </article>
            <article className="profile-stat-card">
              <h5>갱신된 신기록 수</h5>
              <p>{renewedRecordCount.toLocaleString()}건</p>
            </article>
          </div>
        </section>

        <div className="comp-stat-staff-grid">
          <StaffRankingSection title="심판 횟수 순위" rows={judgeCountList} emptyMessage="심판 데이터가 없습니다." />
          <StaffRankingSection
            title="스크램블러 횟수 순위"
            rows={scramblerCountList}
            emptyMessage="스크램블러 데이터가 없습니다."
          />
        </div>

          </>
        )}
      </div>
    </div>
  );
};
