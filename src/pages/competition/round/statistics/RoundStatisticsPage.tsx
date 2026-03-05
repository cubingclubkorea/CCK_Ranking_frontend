import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getRound } from "@/entities/round";
import type { Round } from "@/entities/round";
import {
  getDnfCountByRound,
  getGlobalSingleAverage,
  getStateSingleAverage,
  type RoundDnfCount,
  type RoundGlobalSingleAverage,
  type RoundStateSingleAverage,
} from "@/entities/statistics";
import { getRegionLogoSrc, mapRegionName } from "@/shared";
import { PageHeader, RoundPageSkeleton } from "@/widgets";

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

export const RoundStatisticsPage = () => {
  const { compIdx, roundIdx } = useParams();
  const [round, setRound] = useState<Round | null>(null);
  const [globalStats, setGlobalStats] = useState<RoundGlobalSingleAverage>({
    singleAvg: 0,
    averageAvg: 0,
    count: 0,
  });
  const [stateStats, setStateStats] = useState<RoundStateSingleAverage[]>([]);
  const [dnfStats, setDnfStats] = useState<RoundDnfCount>({
    dnfCount: 0,
    successCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsWarning, setStatsWarning] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!roundIdx) {
        setError("라운드 정보가 없습니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setStatsWarning(null);

      try {
        const roundData = await getRound(Number(roundIdx));
        if (!mounted) return;
        setRound(roundData);

        const [globalResult, stateResult, dnfResult] = await Promise.allSettled([
          getGlobalSingleAverage(Number(roundIdx)),
          getStateSingleAverage(Number(roundIdx)),
          getDnfCountByRound(Number(roundIdx)),
        ]);
        if (!mounted) return;

        setGlobalStats(
          globalResult.status === "fulfilled"
            ? globalResult.value
            : { singleAvg: 0, averageAvg: 0, count: 0 }
        );
        setStateStats(
          stateResult.status === "fulfilled"
            ? [...stateResult.value].sort((a, b) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.singleAvg - b.singleAvg;
              })
            : []
        );
        setDnfStats(
          dnfResult.status === "fulfilled"
            ? dnfResult.value
            : { dnfCount: 0, successCount: 0, totalCount: 0 }
        );

        const hasStatsError =
          globalResult.status === "rejected" ||
          stateResult.status === "rejected" ||
          dnfResult.status === "rejected";
        if (hasStatsError) {
          setStatsWarning("일부 라운드 통계를 불러오지 못했습니다.");
        }
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "라운드 통계를 불러오지 못했습니다.";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [roundIdx]);

  const dnfRate = useMemo(() => {
    if (dnfStats.totalCount <= 0) return "0.00%";
    return `${((dnfStats.dnfCount / dnfStats.totalCount) * 100).toFixed(2)}%`;
  }, [dnfStats]);

  if (loading) {
    return <RoundPageSkeleton />;
  }

  if (error || !round) {
    return <div className="round-page">{error ?? "라운드 정보를 불러올 수 없습니다."}</div>;
  }

  const backComp = compIdx ?? String(round.compIdx);

  return (
    <div className="main-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/button/statistics.svg"
        title={`${round.cubeEventName} ${round.roundName}`}
        subtitle={
          <>
            <span>라운드 통계</span>
            <span className="page-title-meta-divider">·</span>
            <span>{round.compName}</span>
          </>
        }
        actions={[
          {
            label: "전체 기록",
            iconSrc: "/icon/button/back.svg",
            to: `/competition/${Number(backComp)}/round/${Number(round.idx)}`,
          },
          {
            label: "대회 페이지",
            iconSrc: "/icon/button/home.svg",
            to: `/competition/${Number(backComp)}`,
          },
        ]}
      />

      <div className="comp-content comp-stat-content">
        <section className="comp-stat-panel">
          <div className="comp-stat-panel-head">
            <h2>라운드 통계 요약</h2>
          </div>
          <div className="comp-stat-card-grid">
            <article className="profile-stat-card">
              <h5>전체 단일 평균</h5>
              <p>{formatTimeValue(globalStats.singleAvg)}</p>
            </article>
            <article className="profile-stat-card">
              <h5>전체 평균 평균</h5>
              <p>{formatTimeValue(globalStats.averageAvg)}</p>
            </article>
            <article className="profile-stat-card">
              <h5>집계 인원</h5>
              <p>{globalStats.count.toLocaleString()}명</p>
            </article>
            <article className="profile-stat-card">
              <h5>성공 시도</h5>
              <p>{dnfStats.successCount.toLocaleString()}회</p>
            </article>
            <article className="profile-stat-card">
              <h5>DNF 비율 / 횟수</h5>
              <p className="comp-stat-card-inline">
                <span>{dnfRate}</span>
                <span className="comp-stat-card-inline-sub">{` / ${dnfStats.dnfCount.toLocaleString()}회`}</span>
              </p>
            </article>
          </div>
        </section>

        <section className="comp-stat-panel">
          <div className="comp-stat-panel-head">
            <h2>지역별 평균 최고기록</h2>
          </div>
          {stateStats.length === 0 ? (
            <div className="round-list-empty">지역 통계 데이터가 없습니다.</div>
          ) : (
            <div className="round-stat-state-grid">
              {stateStats.map((item) => {
                const regionLabel = mapRegionName(item.state) ?? item.state ?? "-";
                const regionLogoSrc = getRegionLogoSrc(item.state);
                return (
                  <article className="round-stat-state-item" key={`${item.state}-${item.count}`}>
                    <div className="round-stat-state-head">
                      <span className="region-inline">
                        {regionLogoSrc ? <img className="region-logo" src={regionLogoSrc} alt="" aria-hidden="true" /> : null}
                        <strong>{regionLabel}</strong>
                      </span>
                      <em>{item.count.toLocaleString()}명</em>
                    </div>
                    <div className="round-stat-state-values">
                      <span>{`단일 ${formatTimeValue(item.singleAvg)}`}</span>
                      <span>{`평균 ${formatTimeValue(item.averageAvg)}`}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {statsWarning ? <div className="round-list-empty round-stat-warning">{statsWarning}</div> : null}
      </div>
    </div>
  );
};
