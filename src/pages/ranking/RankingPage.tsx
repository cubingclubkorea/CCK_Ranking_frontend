import { useEffect, useState } from "react";
import { getCubeEventList } from "@/entities/cubeEvent";
import {
  getGlobalAverageRanking,
  getGlobalSingleRanking,
  type GlobalSingleRankingRecord,
} from "@/entities/statistics";
import type { BestType, Record as RoundRecord } from "@/entities/record";
import { RecordDetailModal } from "@/pages/round/components/RecordDetailModal";

const formatTime = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)}`;
};

type RankingMetric = "single" | "average";
type MetricEventKey = `${RankingMetric}:${string}`;

const EVENT_ORDER_CANDIDATES: string[][] = [
  ["3x3x3"],
  ["2x2x2"],
  ["4x4x4"],
  ["5x5x5"],
  ["6x6x6"],
  ["7x7x7"],
  ["Pyraminx"],
  ["Megaminx"],
  ["Skewb"],
  ["Clock"],
  ["Square-1"],
  ["3x3x3 OH"],
  ["3x3x3 BLD"],
  ["4x4x4 BLD"],
  ["3x3x3 MULTIBLD", "3x3x3 MULBLD"],
  ["5x5x5 BLD"],
  ["3x3x3 Ao12"],
  ["2x2x2 Ao12"],
  ["3x3x3 BA5"],
  ["4x4x4 BA5"],
  ["Pyraminx BA5"],
  ["Clock BA5"],
  ["Magic"],
  ["FTO"],
  ["234 Relay"],
  ["Mini-Guildford"],
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "랭킹 데이터를 불러오지 못했습니다.";
};

const sortEventNames = (rawEventNames: string[]) => {
  const nameSet = new Set(rawEventNames.filter((name) => name !== "Event Round"));
  const ordered: string[] = [];

  for (const candidateGroup of EVENT_ORDER_CANDIDATES) {
    const matched = candidateGroup.find((candidate) => nameSet.has(candidate));
    if (!matched) continue;
    ordered.push(matched);
    nameSet.delete(matched);
  }

  const remains = Array.from(nameSet.values()).sort((a, b) => a.localeCompare(b));
  return [...ordered, ...remains];
};

const sortRanking = (rows: GlobalSingleRankingRecord[], metric: RankingMetric) =>
  [...rows].sort((a, b) => {
    const aValue = (metric === "single" ? a.single : a.average) ?? Number.POSITIVE_INFINITY;
    const bValue = (metric === "single" ? b.single : b.average) ?? Number.POSITIVE_INFINITY;
    if (aValue !== bValue) return aValue - bValue;
    if (a.ranking !== b.ranking) return a.ranking - b.ranking;
    return a.name.localeCompare(b.name);
  });

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

const getAttemptValue = (attempts: RoundRecord["attempts"], attemptTry: number) => {
  const attempt = attempts?.find((item) => item.attemptTry === attemptTry);
  return attempt ? formatTimeValue(attempt.time) : "-";
};

const toBestType = (value: string | null): BestType | undefined => {
  if (value === "PR" || value === "SR" || value === "CCR") return value;
  return undefined;
};

const toRecord = (row: GlobalSingleRankingRecord): RoundRecord => ({
  idx: row.idx,
  pdx: row.pdx ?? 0,
  name: row.name,
  state: row.state ?? "",
  cckId: row.cckId,
  roundIdx: row.roundIdx,
  roundName: row.roundName,
  roundGroup: row.roundGroup ?? "",
  roundAdvance: row.roundAdvance ?? undefined,
  compIdx: row.compIdx,
  compName: row.compName,
  eventName: row.eventName,
  avgCalc: row.avgCalc,
  attempts: row.attempts.map((attempt) => ({
    idx: attempt.idx,
    recordIdx: attempt.recordIdx,
    attemptTry: attempt.attemptTry,
    time: attempt.time,
    scramblerName: "",
    scramblerCckId: "",
    judgeName: "",
    judgeCckId: "",
    extra: undefined,
    exReason: undefined,
    delegateName: undefined,
    delegateCckId: undefined,
    exScramblerName: undefined,
    exScramblerCckId: undefined,
  })),
  single: row.single ?? undefined,
  average: row.average ?? undefined,
  ranking: row.ranking,
  stateRanking: row.stateRanking ?? undefined,
  singleBestType: toBestType(row.singleBestType),
  averageBestType: toBestType(row.averageBestType),
  note: row.note ?? undefined,
});

const RankingPanelSkeleton = () => (
  <section className="ranking-panel ranking-panel--skeleton" aria-hidden="true">
    <div className="ranking-controls ranking-controls--skeleton">
      <div className="ranking-control-block">
        <div className="ui-skeleton ranking-skeleton-control-title" />
        <div className="ranking-event-tabs">
          {Array.from({ length: 16 }).map((_, index) => (
            <div key={`event-skeleton-${index}`} className="ui-skeleton ranking-skeleton-event-tab" />
          ))}
        </div>
      </div>
      <div className="ranking-control-block">
        <div className="ui-skeleton ranking-skeleton-control-title" />
        <div className="ranking-metric-tabs ranking-metric-tabs--skeleton">
          <div className="ui-skeleton ranking-skeleton-metric-tab" />
          <div className="ui-skeleton ranking-skeleton-metric-tab" />
        </div>
      </div>
    </div>

    <div className="ranking-panel-head">
      <div className="ui-skeleton ranking-skeleton-panel-title" />
      <div className="ui-skeleton ranking-skeleton-panel-meta" />
    </div>

    <div className="ranking-table-wrap">
      <div className="ranking-chart-skeleton ranking-chart-skeleton--table">
        <div className="ui-skeleton ui-skeleton-table-head" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
        <div className="ui-skeleton ui-skeleton-table-row" />
      </div>
    </div>
  </section>
);

export const RankingPage = () => {
  const [orderedEventNames, setOrderedEventNames] = useState<string[]>([]);
  const [visibleEventNames, setVisibleEventNames] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [metric, setMetric] = useState<RankingMetric>("single");
  const [eventLoading, setEventLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rankingCache, setRankingCache] = useState<Record<MetricEventKey, GlobalSingleRankingRecord[]>>({});
  const [selectedRecord, setSelectedRecord] = useState<{ record: RoundRecord; rank: number } | null>(null);

  const cacheKey = `${metric}:${selectedEvent}` as MetricEventKey;

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      setEventLoading(true);
      setError(null);

      try {
        const events = await getCubeEventList();
        if (!mounted) return;

        const uniqueNames = Array.from(new Set(events.map((event) => event.eventName)));
        setOrderedEventNames(sortEventNames(uniqueNames));
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setEventLoading(false);
      }
    };

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchAvailability = async () => {
      if (orderedEventNames.length === 0) {
        setVisibleEventNames([]);
        setSelectedEvent("");
        return;
      }
      setRankingLoading(true);
      setError(null);

      try {
        const rowsByEvent = await Promise.all(
          orderedEventNames.map(async (eventName) => {
            const key = `${metric}:${eventName}` as MetricEventKey;
            const cached = rankingCache[key];
            if (cached) {
              return { eventName, key, rows: cached };
            }

            const fetchedRows = metric === "single"
              ? await getGlobalSingleRanking(eventName)
              : await getGlobalAverageRanking(eventName);
            return { eventName, key, rows: sortRanking(fetchedRows, metric) };
          })
        );

        if (!mounted) return;

        setRankingCache((prev) => {
          const next = { ...prev };
          for (const item of rowsByEvent) {
            next[item.key] = item.rows;
          }
          return next;
        });

        const nextVisible = rowsByEvent
          .filter((item) => item.rows.length > 0)
          .map((item) => item.eventName);
        setVisibleEventNames(nextVisible);
        setSelectedRecord(null);

        if (nextVisible.length === 0) {
          setSelectedEvent("");
        } else if (!nextVisible.includes(selectedEvent)) {
          setSelectedEvent(nextVisible[0]);
        }
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setRankingLoading(false);
      }
    };

    fetchAvailability();

    return () => {
      mounted = false;
    };
  }, [metric, orderedEventNames]);

  const rankingRows = selectedEvent ? rankingCache[cacheKey] ?? [] : [];
  const metricLabel = metric === "single" ? "최고" : "평균";

  if (eventLoading) {
    return (
      <div className="main-page ranking-page">
        <div className="comp-header ranking-header">
          <div className="page-title-area round-title-area">
            <div className="page-title-icon" aria-hidden="true">
              <img src="/icon/sidebar/trophy.svg" alt="" loading="lazy" />
            </div>
            <div className="round-title-text">
              <h1 className="page-title">랭킹</h1>
              <div className="page-title-meta">CCK Ranking</div>
            </div>
          </div>
        </div>
        <RankingPanelSkeleton />
      </div>
    );
  }

  return (
    <div className="main-page ranking-page">
      <div className="comp-header ranking-header">
        <div className="page-title-area round-title-area">
          <div className="page-title-icon" aria-hidden="true">
            <img src="/icon/sidebar/trophy.svg" alt="" loading="lazy" />
          </div>
          <div className="round-title-text">
            <h1 className="page-title">랭킹</h1>
            <div className="page-title-meta">CCK Ranking</div>
          </div>
        </div>
      </div>

      {rankingLoading ? (
        <RankingPanelSkeleton />
      ) : (
        <section className="ranking-panel">
        <div className="ranking-controls">
          <div className="ranking-control-block">
            <div className="ranking-control-title">종목</div>
            <div className="ranking-event-tabs" role="tablist" aria-label="종목 선택">
              {visibleEventNames.map((eventName) => (
                <button
                  key={eventName}
                  type="button"
                  className={`ranking-event-tab ${eventName === selectedEvent ? "active" : ""}`.trim()}
                  onClick={() => setSelectedEvent(eventName)}
                  title={eventName}
                  aria-label={eventName}
                >
                  <img
                    className="ranking-event-icon"
                    src={`/icon/events/${encodeURIComponent(eventName)}.svg`}
                    alt=""
                    aria-hidden="true"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.dataset.fallback === "true") {
                        target.style.display = "none";
                        return;
                      }
                      target.dataset.fallback = "true";
                      target.src = "/icon/events/Question.svg";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="ranking-control-block">
            <div className="ranking-control-title">유형</div>
            <div className="ranking-metric-tabs" role="tablist" aria-label="기록 유형 선택">
              <button
                type="button"
                className={`ranking-metric-tab ${metric === "single" ? "active" : ""}`.trim()}
                onClick={() => setMetric("single")}
              >
                최고
              </button>
              <button
                type="button"
                className={`ranking-metric-tab ${metric === "average" ? "active" : ""}`.trim()}
                onClick={() => setMetric("average")}
              >
                평균
              </button>
            </div>
          </div>
        </div>

        <div className="ranking-panel-head">
          <h2 className="ranking-panel-title">
            {selectedEvent || "-"} · {metricLabel}
          </h2>
          <span className="ranking-panel-meta">
            {rankingRows.length > 0 ? `총 ${rankingRows.length.toLocaleString()}명` : "데이터 없음"}
          </span>
        </div>

        {error ? <div className="round-list-empty">{error}</div> : null}
        {rankingLoading ? (
          <div className="ranking-chart-skeleton">
            <div className="ui-skeleton ui-skeleton-table-head" aria-hidden="true" />
            <div className="ui-skeleton ui-skeleton-table-row" aria-hidden="true" />
            <div className="ui-skeleton ui-skeleton-table-row" aria-hidden="true" />
            <div className="ui-skeleton ui-skeleton-table-row" aria-hidden="true" />
          </div>
        ) : null}

        {!rankingLoading && !error && rankingRows.length === 0 ? (
          <div className="round-list-empty">선택한 종목의 랭킹 데이터가 없습니다.</div>
        ) : null}

        {!rankingLoading && !error && rankingRows.length > 0 ? (
          <div className="ranking-table-wrap">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>선수</th>
                  <th>기록</th>
                  <th>대회</th>
                  <th>라운드</th>
                  <th>지역</th>
                </tr>
              </thead>
              <tbody>
                {rankingRows.map((row, index) => (
                  <tr
                    key={`${row.idx}-${row.cckId}-${index}`}
                    className="ranking-table-row--clickable"
                    onClick={() => setSelectedRecord({ record: toRecord(row), rank: index + 1 })}
                  >
                    <td>#{index + 1}</td>
                    <td className="ranking-player-cell">
                      <div className="ranking-player-name">{row.name}</div>
                      <div className="ranking-player-id">{row.cckId}</div>
                    </td>
                    <td>{formatTime(metric === "single" ? row.single : row.average)}</td>
                    <td>{row.compName}</td>
                    <td>{row.roundName}</td>
                    <td>{row.state ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        </section>
      )}
      <RecordDetailModal
        selected={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        formatTimeValue={formatTimeValue}
        getAttemptValue={getAttemptValue}
      />
    </div>
  );
};
