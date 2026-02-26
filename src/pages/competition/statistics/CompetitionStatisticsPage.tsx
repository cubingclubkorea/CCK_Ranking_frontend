import {
  getCompBreakList,
  getCompExtraList,
  getCompetition,
  getDnfCountByComp,
  getJudgeCount,
  getScramblerCount,
  type CompDnfCount,
  type CompExtraItem,
  type CompStaffCountItem,
  type Competition,
} from "@/entities";
import { getRecordList, type Record } from "@/entities/record";
import { getRoundByDayCount, type Round } from "@/entities/round";
import { getNewRecordBadgeSrc } from "@/shared";
import { PageHeader } from "@/widgets";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { RecordDetailModal } from "@/pages/round/components/RecordDetailModal.tsx";

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

const isMajorBreakType = (value: unknown): value is "SR" | "CCR" => value === "SR" || value === "CCR";

type CompBreakEntry = {
  id: string;
  bestType: "SR" | "CCR";
  eventName: string;
  metric: "평균" | "최고";
  value: number | null;
  name: string;
  roundName: string;
  record: Record;
};

const formatRecordValue = (value: number | null) => {
  if (value === null) return "-";
  if (value < 0) return "DNF";
  if (value >= 60) {
    const minutes = Math.floor(value / 60);
    const seconds = value - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return value.toFixed(2);
};

const formatTimeValue = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  if (value === -1) return "DNF";
  if (value === -2) return "DNS";
  const absValue = Math.abs(value);
  if (absValue >= 60) {
    const minutes = Math.floor(absValue / 60);
    const seconds = absValue - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return value.toFixed(2);
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

const CompetitionStatisticsPageSkeleton = () => (
  <div className="main-page ui-skeleton-page">
    <div className="comp-header ui-skeleton-comp-header">
      <div className="ui-skeleton-comp-head-left">
        <div className="ui-skeleton ui-skeleton-comp-title" />
        <div className="ui-skeleton ui-skeleton-comp-meta" />
      </div>
      <div className="ui-skeleton-comp-head-actions">
        <div className="ui-skeleton ui-skeleton-action-btn" />
        <div className="ui-skeleton ui-skeleton-action-btn" />
      </div>
    </div>

    <div className="comp-content comp-stat-content" aria-hidden="true">
      <section className="comp-stat-panel">
        <div className="comp-stat-panel-head">
          <div className="ui-skeleton comp-stat-skeleton-title" />
        </div>
        <div className="comp-stat-card-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <article className="profile-stat-card" key={`comp-stat-summary-skeleton-${index}`}>
              <div className="ui-skeleton comp-stat-skeleton-label" />
              <div className="ui-skeleton comp-stat-skeleton-value" />
            </article>
          ))}
        </div>
      </section>

      <section className="comp-stat-panel">
        <div className="comp-stat-panel-head comp-stat-panel-head--between">
          <div className="ui-skeleton comp-stat-skeleton-title" />
          <div className="ui-skeleton comp-stat-skeleton-toggle" />
        </div>
        <div className="new-record-list comp-break-list">
          {Array.from({ length: 5 }).map((_, index) => (
            <article className="new-record-item comp-break-item" key={`comp-stat-break-skeleton-${index}`}>
              <div className="ui-skeleton new-record-skeleton-badge" />
              <div className="new-record-content">
                <div className="ui-skeleton new-record-skeleton-title" />
                <div className="ui-skeleton comp-stat-skeleton-record" />
                <div className="ui-skeleton new-record-skeleton-subtitle" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="comp-stat-staff-grid">
        {Array.from({ length: 2 }).map((_, panelIndex) => (
          <section className="comp-stat-panel" key={`comp-stat-staff-skeleton-panel-${panelIndex}`}>
            <div className="comp-stat-panel-head">
              <div className="ui-skeleton comp-stat-skeleton-title" />
            </div>
            <div className="comp-stat-ranking-list">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <article className="comp-stat-ranking-item" key={`comp-stat-staff-skeleton-${panelIndex}-${rowIndex}`}>
                  <div className="comp-stat-ranking-row">
                    <div className="ui-skeleton comp-stat-skeleton-rank" />
                    <div className="comp-stat-ranking-user">
                      <div className="ui-skeleton comp-stat-skeleton-user" />
                      <div className="ui-skeleton comp-stat-skeleton-user-sub" />
                    </div>
                    <div className="ui-skeleton comp-stat-skeleton-count" />
                  </div>
                  <div className="ui-skeleton comp-stat-skeleton-bar" />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  </div>
);

export const CompetitionStatisticsPage = () => {
  const { compIdx } = useParams();
  const compId = Number(compIdx);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [extraList, setExtraList] = useState<CompExtraItem[]>([]);
  const [breakEntries, setBreakEntries] = useState<CompBreakEntry[]>([]);
  const [judgeCountList, setJudgeCountList] = useState<CompStaffCountItem[]>([]);
  const [scramblerCountList, setScramblerCountList] = useState<CompStaffCountItem[]>([]);
  const [dnfCount, setDnfCount] = useState<CompDnfCount>({ dnfCount: 0, successCount: 0, totalCount: 0 });
  const [participantCount, setParticipantCount] = useState(0);
  const [renewedRecordCount, setRenewedRecordCount] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<{ record: Record; rank: number } | null>(null);
  const [breakExpanded, setBreakExpanded] = useState(false);
  const [breakPreviewCount, setBreakPreviewCount] = useState(4);
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
          getCompBreakList(compId),
        ]);
        if (!mounted) return;
        setParticipantCount(participantCountResult.status === "fulfilled" ? participantCountResult.value : 0);
        const majorBreaks =
          breakCountResult.status === "fulfilled"
            ? breakCountResult.value.filter(
                (item) => isMajorBreakType(item.singleBestType) || isMajorBreakType(item.averageBestType)
              )
            : [];
        const entries = majorBreaks
          .flatMap((item) => {
            const mapped: CompBreakEntry[] = [];
            if (isMajorBreakType(item.averageBestType) && item.average !== null) {
              const record: Record = {
                idx: item.idx,
                pdx: item.pdx ?? 0,
                name: item.name,
                state: item.state ?? "",
                cckId: item.cckId,
                roundIdx: item.roundIdx,
                roundName: item.roundName,
                roundGroup: item.roundGroup ?? "",
                roundAdvance: item.roundAdvance ?? undefined,
                compIdx: item.compIdx,
                compName: item.compName,
                eventName: item.eventName,
                avgCalc: item.avgCalc,
                attempts: item.attempts.map((attempt) => ({
                  idx: attempt.idx,
                  recordIdx: attempt.recordIdx,
                  attemptTry: attempt.attemptTry,
                  time: attempt.time,
                  scramblerName: attempt.scramblerName ?? "",
                  scramblerCckId: attempt.scramblerCckId ?? "",
                  judgeName: attempt.judgeName ?? "",
                  judgeCckId: attempt.judgeCckId ?? "",
                  extra: attempt.extra,
                  exReason: attempt.exReason ?? undefined,
                  delegateName: attempt.delegateName ?? undefined,
                  delegateCckId: attempt.delegateCckId ?? undefined,
                  exScramblerName: attempt.exScramblerName ?? undefined,
                  exScramblerCckId: attempt.exScramblerCckId ?? undefined,
                })),
                single: item.single ?? undefined,
                average: item.average ?? undefined,
                ranking: item.ranking ?? undefined,
                stateRanking: item.stateRanking ?? undefined,
                singleBestType: item.singleBestType ?? undefined,
                averageBestType: item.averageBestType ?? undefined,
                note: item.note ?? undefined,
              };
              mapped.push({
                id: `${item.idx}-average-${item.averageBestType}`,
                bestType: item.averageBestType,
                eventName: item.eventName,
                metric: "평균",
                value: item.average,
                name: item.name,
                roundName: item.roundName,
                record,
              });
            }
            if (isMajorBreakType(item.singleBestType) && item.single !== null) {
              const record: Record = {
                idx: item.idx,
                pdx: item.pdx ?? 0,
                name: item.name,
                state: item.state ?? "",
                cckId: item.cckId,
                roundIdx: item.roundIdx,
                roundName: item.roundName,
                roundGroup: item.roundGroup ?? "",
                roundAdvance: item.roundAdvance ?? undefined,
                compIdx: item.compIdx,
                compName: item.compName,
                eventName: item.eventName,
                avgCalc: item.avgCalc,
                attempts: item.attempts.map((attempt) => ({
                  idx: attempt.idx,
                  recordIdx: attempt.recordIdx,
                  attemptTry: attempt.attemptTry,
                  time: attempt.time,
                  scramblerName: attempt.scramblerName ?? "",
                  scramblerCckId: attempt.scramblerCckId ?? "",
                  judgeName: attempt.judgeName ?? "",
                  judgeCckId: attempt.judgeCckId ?? "",
                  extra: attempt.extra,
                  exReason: attempt.exReason ?? undefined,
                  delegateName: attempt.delegateName ?? undefined,
                  delegateCckId: attempt.delegateCckId ?? undefined,
                  exScramblerName: attempt.exScramblerName ?? undefined,
                  exScramblerCckId: attempt.exScramblerCckId ?? undefined,
                })),
                single: item.single ?? undefined,
                average: item.average ?? undefined,
                ranking: item.ranking ?? undefined,
                stateRanking: item.stateRanking ?? undefined,
                singleBestType: item.singleBestType ?? undefined,
                averageBestType: item.averageBestType ?? undefined,
                note: item.note ?? undefined,
              };
              mapped.push({
                id: `${item.idx}-single-${item.singleBestType}`,
                bestType: item.singleBestType,
                eventName: item.eventName,
                metric: "최고",
                value: item.single,
                name: item.name,
                roundName: item.roundName,
                record,
              });
            }
            return mapped;
          })
          .sort((a, b) => {
            if (a.bestType !== b.bestType) return a.bestType === "CCR" ? -1 : 1;
            return b.id.localeCompare(a.id);
          });
        setBreakEntries(entries);
        setRenewedRecordCount(entries.length);

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

  useEffect(() => {
    const syncPreviewCount = () => {
      const width = window.innerWidth;
      if (width <= 760) {
        setBreakPreviewCount(1);
        return;
      }
      if (width <= 1100) {
        setBreakPreviewCount(2);
        return;
      }
      setBreakPreviewCount(5);
    };

    syncPreviewCount();
    window.addEventListener("resize", syncPreviewCount);
    return () => window.removeEventListener("resize", syncPreviewCount);
  }, []);

  const extraSum = useMemo(
    () => extraList.reduce((sum, item) => sum + (Number.isFinite(item.extra) ? item.extra : 0), 0),
    [extraList]
  );
  const dnfRate = useMemo(() => {
    if (dnfCount.totalCount <= 0) return "0.00%";
    return `${((dnfCount.dnfCount / dnfCount.totalCount) * 100).toFixed(2)}%`;
  }, [dnfCount]);

  const headerTitle = competition ? competition.compName : "대회";
  const competitionPath = competition ? `/competition/${competition.idx}` : "/competition";
  const visibleBreakEntries = breakExpanded ? breakEntries : breakEntries.slice(0, breakPreviewCount);
  const canToggleBreakEntries = breakEntries.length > breakPreviewCount;

  if (loading) {
    return <CompetitionStatisticsPageSkeleton />;
  }

  return (
    <div className="main-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/button/statistics.svg"
        title={headerTitle}
        subtitle="대회 통계"
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

        <section className="comp-stat-panel">
          <div className="comp-stat-panel-head comp-stat-panel-head--between">
            <h2>갱신된 신기록</h2>
            {canToggleBreakEntries ? (
              <button
                type="button"
                className="comp-stat-toggle-btn"
                onClick={() => setBreakExpanded((prev) => !prev)}
              >
                {breakExpanded ? "접기" : "전체보기"}
              </button>
            ) : null}
          </div>
          {breakEntries.length === 0 ? (
            <div className="round-list-empty">표시할 CCR/SR 신기록이 없습니다.</div>
          ) : (
            <div className={`new-record-list comp-break-list ${!breakExpanded && canToggleBreakEntries ? "comp-break-list--collapsed" : ""}`.trim()}>
              {visibleBreakEntries.map((item) => {
                const badgeSrc = getNewRecordBadgeSrc(item.bestType);
                return (
                  <article
                    className="new-record-item comp-break-item"
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRecord({ record: item.record, rank: item.record.ranking ?? 0 })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedRecord({ record: item.record, rank: item.record.ranking ?? 0 });
                      }
                    }}
                  >
                    <div className="new-record-badge-wrap">
                      {badgeSrc ? (
                        <img
                          className={`new-record-badge-image${item.bestType === "CCR" ? " new-record-badge-image--ccr" : ""}`}
                          src={badgeSrc}
                          alt={item.bestType}
                        />
                      ) : null}
                    </div>
                    <div className="new-record-content">
                      <p className="new-record-title">{item.eventName}</p>
                      <p className="comp-break-record">{`${item.metric} ${formatRecordValue(item.value)}`}</p>
                      <p className="new-record-subtitle">{`${item.name} · ${item.roundName}`}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {!breakExpanded && canToggleBreakEntries ? (
            <div className="comp-break-more-hint">
              <span>{`${breakEntries.length - visibleBreakEntries.length}개의 항목이 더 있습니다`}</span>
            </div>
          ) : null}
        </section>

        <div className="comp-stat-staff-grid">
          <StaffRankingSection title="심판 횟수" rows={judgeCountList} emptyMessage="심판 데이터가 없습니다." />
          <StaffRankingSection
            title="스크램블러 횟수"
            rows={scramblerCountList}
            emptyMessage="스크램블러 데이터가 없습니다."
          />
        </div>

          </>
        )}
      </div>
      <RecordDetailModal selected={selectedRecord} onClose={() => setSelectedRecord(null)} formatTimeValue={formatTimeValue} />
    </div>
  );
};
