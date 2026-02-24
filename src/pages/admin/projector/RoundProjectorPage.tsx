import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRound } from "@/entities/round";
import { getRecordList } from "@/entities/record";
import type { Round } from "@/entities/round";
import type { Record } from "@/entities/record";
import {
  getErrorMessage,
  getEventIconSrc,
  getMainAttempts,
  getRequiredAttemptCount,
  getWorstAttemptTrySet,
  isAo12AvgCalc,
  isBo3AvgCalc,
  isSingleAvgCalc,
  resolveAverageValue,
  shouldUseRequestErrorPage,
} from "@/shared";
import { RoundPageSkeleton } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";

const PROJECTOR_PAGE_DURATION_MS = 10000;
const PROJECTOR_MIN_ROWS = 5;

type ProjectorMetrics = {
  rowsPerPage: number;
  rowHeight: number;
};

const isValidDate = (value?: Date): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

const formatTimePart = (date: Date) => {
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
};

const formatRoundDateTime = (eventStart?: Date, eventEnd?: Date) => {
  if (!isValidDate(eventStart)) {
    return null;
  }
  if (!isValidDate(eventEnd)) {
    return formatTimePart(eventStart);
  }
  return `${formatTimePart(eventStart)}~${formatTimePart(eventEnd)}`;
};

const formatTimeValue = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (value === -1) {
    return "DNF";
  }
  if (value === -2) {
    return "DNS";
  }
  const absValue = Math.abs(value);
  if (absValue >= 60) {
    const minutes = Math.floor(absValue / 60);
    const seconds = absValue - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return value.toFixed(2);
};

const resolveProjectorMetrics = (headerHeight: number, tableHeadHeight: number): ProjectorMetrics => {
  const rowHeight = window.innerWidth <= 1200 ? 50 : 56;
  const tableGap = 44;
  const availableRowsHeight = Math.max(0, window.innerHeight - headerHeight - tableHeadHeight - tableGap);
  const rowsPerPage = Math.max(PROJECTOR_MIN_ROWS, Math.floor(availableRowsHeight / rowHeight));
  return { rowsPerPage, rowHeight };
};

const resolveRevealDelay = (rowIndex: number) => {
  const rowDelay = rowIndex * 0.055;
  return `${rowDelay.toFixed(3)}s`;
};

export const RoundProjectorPage = () => {
  const navigate = useNavigate();
  const { compIdx, roundIdx } = useParams();
  const [round, setRound] = useState<Round | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectorPaused, setProjectorPaused] = useState(false);
  const [projectorPage, setProjectorPage] = useState(0);
  const [projectorMetrics, setProjectorMetrics] = useState<ProjectorMetrics>({ rowsPerPage: 12, rowHeight: 56 });
  const projectorHeaderRef = useRef<HTMLDivElement | null>(null);
  const projectorTableHeadRef = useRef<HTMLTableSectionElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!roundIdx) {
        if (mounted) {
          setError("라운드 정보가 없습니다.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [roundData, recordData] = await Promise.all([
          getRound(Number(roundIdx)),
          getRecordList(Number(roundIdx)),
        ]);
        if (!mounted) return;
        setRound(roundData);
        setRecords(recordData);
      } catch (fetchError) {
        console.error("프로젝터 라운드 조회 실패:", fetchError);
        if (mounted) setError(getErrorMessage(fetchError, "랭킹 정보를 불러올 수 없습니다."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [roundIdx]);

  const syncProjectorMetrics = useCallback(() => {
    const headerHeight = projectorHeaderRef.current?.getBoundingClientRect().height ?? 120;
    const tableHeadHeight = projectorTableHeadRef.current?.getBoundingClientRect().height ?? 52;
    setProjectorMetrics(resolveProjectorMetrics(headerHeight, tableHeadHeight));
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onResize = () => {
      syncProjectorMetrics();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      navigate(`/admin/competition/${Number(compIdx)}/round/${Number(roundIdx)}`);
    };

    window.setTimeout(() => {
      syncProjectorMetrics();
    }, 0);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [compIdx, navigate, roundIdx, syncProjectorMetrics]);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const rankA = a.ranking ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.ranking ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      const avgA = resolveAverageValue(a.attempts, a.avgCalc, a.average) ?? Number.MAX_SAFE_INTEGER;
      const avgB = resolveAverageValue(b.attempts, b.avgCalc, b.average) ?? Number.MAX_SAFE_INTEGER;
      if (avgA !== avgB) return avgA - avgB;
      const singleA = a.single ?? Number.MAX_SAFE_INTEGER;
      const singleB = b.single ?? Number.MAX_SAFE_INTEGER;
      return singleA - singleB;
    });
  }, [records]);

  const tableAvgCalc = sortedRecords[0]?.avgCalc;
  const singleMode = isSingleAvgCalc(tableAvgCalc);
  const bo3Mode = isBo3AvgCalc(tableAvgCalc);
  const ao12Mode = isAo12AvgCalc(tableAvgCalc);
  const showAverageColumn = !singleMode && !bo3Mode;
  const showAttemptColumns = !ao12Mode;
  const attemptCount = singleMode
    ? 1
    : sortedRecords.reduce((max, record) => Math.max(max, getRequiredAttemptCount(record.avgCalc)), 1);
  const attemptTries = Array.from({ length: attemptCount }, (_, index) => index + 1);
  const hasComputedAverage = (record: Record) =>
    typeof resolveAverageValue(record.attempts, record.avgCalc, record.average) === "number";

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / projectorMetrics.rowsPerPage));
  const startIndex = projectorPage * projectorMetrics.rowsPerPage;
  const pageRecords = sortedRecords.slice(startIndex, startIndex + projectorMetrics.rowsPerPage);
  const columnCount = 3 + (showAverageColumn ? 1 : 0) + (showAttemptColumns ? attemptCount : 0);
  const emptyRows = Math.max(0, projectorMetrics.rowsPerPage - pageRecords.length);

  useEffect(() => {
    if (projectorPaused || totalPages <= 1) return;
    const timer = window.setInterval(() => {
      setProjectorPage((prev) => (prev + 1) % totalPages);
    }, PROJECTOR_PAGE_DURATION_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [projectorPaused, totalPages]);

  useEffect(() => {
    if (projectorPage < totalPages) return;
    setProjectorPage(0);
  }, [projectorPage, totalPages]);

  if (loading) {
    return <RoundPageSkeleton />;
  }

  if (error) {
    if (shouldUseRequestErrorPage(error)) {
      return <RequestErrorPage message={error} />;
    }
    return <div className="round-page">{error}</div>;
  }

  if (!round) {
    return <div className="round-page">라운드 정보를 불러올 수 없습니다.</div>;
  }

  const backTarget = compIdx ?? String(round.compIdx);
  const roundDateTime = formatRoundDateTime(round.eventStart, round.eventEnd);

  return (
    <div
      className="projector-mode-overlay"
      style={{ "--projector-row-height": `${projectorMetrics.rowHeight}px` } as CSSProperties}
    >
      <div className="projector-mode-header" ref={projectorHeaderRef}>
        <div className="projector-mode-title-wrap">
          <div className="page-title-icon" aria-hidden="true">
            <img
              src={getEventIconSrc(round.cubeEventName)}
              alt=""
              loading="lazy"
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
          </div>
          <div className="projector-mode-title-text">
            <h2>{`${round.cubeEventName} ${round.roundName}`}</h2>
            <p>
              <span>{round.compName}</span>
              {roundDateTime ? (
                <>
                  <span className="projector-mode-divider">·</span>
                  <span>{roundDateTime}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="projector-mode-controls">
          <button
            type="button"
            className="projector-mode-btn"
            onClick={() => setProjectorPaused((prev) => !prev)}
          >
            {projectorPaused ? "재생" : "일시정지"}
          </button>
          <button
            type="button"
            className="projector-mode-btn projector-mode-btn--danger projector-mode-btn--icon"
            aria-label="종료"
            onClick={() => navigate(`/admin/competition/${Number(backTarget)}/round/${Number(round.idx)}`)}
          >
            <img className="projector-mode-btn-icon" src="/icon/modal/close.svg" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="projector-mode-table-wrap">
        <table className="projector-mode-table">
          <thead ref={projectorTableHeadRef}>
            <tr>
              <th>#</th>
              <th>이름</th>
              {showAverageColumn ? <th>평균</th> : null}
              <th>최고</th>
              {showAttemptColumns ? attemptTries.map((attemptTry) => <th key={attemptTry}>{attemptTry}</th>) : null}
            </tr>
          </thead>
          <tbody key={`page-${projectorPage}`}>
            {pageRecords.map((record, index) => {
              const globalIndex = startIndex + index;
              const rank = record.ranking ?? globalIndex + 1;
              const prevRecord = globalIndex > 0 ? sortedRecords[globalIndex - 1] : null;
              const prevRank = prevRecord ? (prevRecord.ranking ?? globalIndex) : null;
              const prevAttempts = prevRecord ? getMainAttempts(prevRecord.attempts, prevRecord.avgCalc) : [];
              const prevHasAllAttempts = prevAttempts.every((attempt) => attempt.time !== undefined && attempt.time !== null);
              const prevIsRanked = prevRecord
                ? prevHasAllAttempts && (singleMode ? typeof prevRecord.single === "number" : hasComputedAverage(prevRecord))
                : false;
              const prevIsAdvance = !!(round.advance && prevRank !== null && prevRank <= round.advance && prevIsRanked);
            const attempts = getMainAttempts(record.attempts, record.avgCalc);
            const hasAllAttempts = attempts.every((attempt) => attempt.time !== undefined && attempt.time !== null);
              const isRanked = hasAllAttempts && (singleMode ? typeof record.single === "number" : hasComputedAverage(record));
              const isAdvance = !!(round.advance && rank <= round.advance && isRanked);
              const isCutlineStart = !isAdvance && prevIsAdvance;
            const displayAverage = resolveAverageValue(record.attempts, record.avgCalc, record.average);
            const nameText = record.enName ? `${record.name} (${record.enName})` : record.name;
              const times = attempts
                .map((attempt) => attempt.time)
                .filter((time) => typeof time === "number");
              const positiveTimes = times.filter((time) => time >= 0);
              const bestValue = positiveTimes.length > 0 ? Math.min(...positiveTimes) : undefined;
              const worstTrySet = getWorstAttemptTrySet(record.attempts, record.avgCalc, record.eventName);

              return (
                <tr
                  key={record.idx}
                  className={[
                    "projector-mode-row",
                    isAdvance ? "round-table-row-advance" : "",
                    isCutlineStart ? "round-table-row-cutline" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                <td>
                  <span
                    className="projector-mode-cell-text"
                    style={{ "--projector-reveal-delay": resolveRevealDelay(index) } as CSSProperties}
                  >
                      {isRanked ? rank : "-"}
                  </span>
                </td>
                <td className="projector-mode-name">
                  <span
                    className="projector-mode-cell-text"
                    style={{ "--projector-reveal-delay": resolveRevealDelay(index) } as CSSProperties}
                  >
                    {nameText}
                  </span>
                </td>
                {showAverageColumn ? (
                  <td className="projector-mode-score">
                    <span
                      className="projector-mode-cell-text"
                      style={{ "--projector-reveal-delay": resolveRevealDelay(index) } as CSSProperties}
                    >
                      {hasAllAttempts ? formatTimeValue(displayAverage) : "-"}
                    </span>
                  </td>
                ) : null}
                <td className="projector-mode-score">
                  <span
                    className="projector-mode-cell-text"
                    style={{ "--projector-reveal-delay": resolveRevealDelay(index) } as CSSProperties}
                  >
                    {hasAllAttempts ? formatTimeValue(record.single) : "-"}
                  </span>
                </td>
                  {showAttemptColumns
                    ? attemptTries.map((attemptTry) => {
                        const attempt = attempts.find((item) => item.attemptTry === attemptTry);
                        const time = attempt?.time;
                        let attemptClassName = "projector-mode-cell-text";
                        if (typeof time === "number") {
                          if (time === bestValue) {
                            attemptClassName = "projector-mode-cell-text attempt-best";
                          } else if (worstTrySet.has(attemptTry)) {
                            attemptClassName = "projector-mode-cell-text attempt-worst";
                          }
                        }
                        return (
                          <td key={attemptTry}>
                            <span
                              className={attemptClassName}
                              style={{ "--projector-reveal-delay": resolveRevealDelay(index) } as CSSProperties}
                            >
                              {formatTimeValue(time)}
                            </span>
                          </td>
                        );
                      })
                    : null}
                </tr>
              );
            })}
            {Array.from({ length: emptyRows }, (_, index) => (
              <tr key={`empty-${index}`} className="projector-mode-row projector-mode-row--empty">
                <td colSpan={columnCount} aria-hidden="true">
                  &nbsp;
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="projector-mode-footer">
        <span>{`${projectorPage + 1} / ${totalPages}`}</span>
      </div>
    </div>
  );
};
