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

    const requestFullscreen = async () => {
      if (document.fullscreenElement) return;
      try {
        await document.documentElement.requestFullscreen();
      } catch (fullscreenError) {
        console.error("프로젝터 전체화면 진입 실패:", fullscreenError);
      }
    };

    void requestFullscreen();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch((fullscreenError) => {
          console.error("프로젝터 전체화면 종료 실패:", fullscreenError);
        });
      }
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
          <span className="projector-mode-icon-wrap" aria-hidden="true">
            <img
              className="projector-mode-icon"
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
          </span>
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
            className="projector-mode-btn projector-mode-btn--danger"
            onClick={() => navigate(`/admin/competition/${Number(backTarget)}/round/${Number(round.idx)}`)}
          >
            종료
          </button>
        </div>
      </div>

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
        <tbody>
          {pageRecords.map((record, index) => {
            const rank = record.ranking ?? startIndex + index + 1;
            const attempts = getMainAttempts(record.attempts, record.avgCalc);
            const hasAllAttempts = attempts.every((attempt) => attempt.time !== undefined && attempt.time !== null);
            const displayAverage = resolveAverageValue(record.attempts, record.avgCalc, record.average);

            return (
              <tr key={record.idx} className="projector-mode-row">
                <td>{hasAllAttempts ? rank : "-"}</td>
                <td className="projector-mode-name">
                  {record.enName ? `${record.name} (${record.enName})` : record.name}
                </td>
                {showAverageColumn ? (
                  <td className="projector-mode-score">{hasAllAttempts ? formatTimeValue(displayAverage) : "-"}</td>
                ) : null}
                <td className="projector-mode-score">{hasAllAttempts ? formatTimeValue(record.single) : "-"}</td>
                {showAttemptColumns
                  ? attemptTries.map((attemptTry) => {
                      const attempt = attempts.find((item) => item.attemptTry === attemptTry);
                      return <td key={attemptTry}>{formatTimeValue(attempt?.time)}</td>;
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

      <div className="projector-mode-footer">
        <span>{`${projectorPage + 1} / ${totalPages}`}</span>
      </div>
    </div>
  );
};
