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
  getRegionLogoSrc,
  getWorstAttemptTrySet,
  isAo12AvgCalc,
  isBo3AvgCalc,
  isSingleAvgCalc,
  mapRegionName,
  resolveAverageValue,
  shouldUseRequestErrorPage,
} from "@/shared";
import { RoundPageSkeleton } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";

const PROJECTOR_PAGE_DURATION_MS = 10000;
const PROJECTOR_MIN_ROWS = 5;
const PROJECTOR_MIN_DURATION_SEC = 3;
const PROJECTOR_MAX_DURATION_SEC = 60;

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

const resolveProjectorMetrics = (tableWrapHeight: number, tableHeadHeight: number, headerHeight: number): ProjectorMetrics => {
  const rowHeight = window.innerWidth <= 1200 ? 50 : 56;
  const fallbackGap = 44;
  const fallbackRowsHeight = Math.max(0, window.innerHeight - headerHeight - tableHeadHeight - fallbackGap);
  const availableRowsHeight = tableWrapHeight > 0
    ? Math.max(0, tableWrapHeight - tableHeadHeight)
    : fallbackRowsHeight;
  const rowsPerPage = Math.max(PROJECTOR_MIN_ROWS, Math.floor(availableRowsHeight / rowHeight));
  return { rowsPerPage, rowHeight };
};

const resolveRevealDelay = (rowIndex: number) => {
  const rowDelay = rowIndex * 0.055;
  return `${rowDelay.toFixed(3)}s`;
};

const normalizeDurationSec = (value: number) => {
  if (!Number.isFinite(value)) return PROJECTOR_PAGE_DURATION_MS / 1000;
  return Math.min(PROJECTOR_MAX_DURATION_SEC, Math.max(PROJECTOR_MIN_DURATION_SEC, Math.round(value)));
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
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pageDurationSec, setPageDurationSec] = useState(PROJECTOR_PAGE_DURATION_MS / 1000);
  const [draftPageDurationSec, setDraftPageDurationSec] = useState(PROJECTOR_PAGE_DURATION_MS / 1000);
  const [projectorMetrics, setProjectorMetrics] = useState<ProjectorMetrics>({ rowsPerPage: 12, rowHeight: 56 });
  const projectorHeaderRef = useRef<HTMLDivElement | null>(null);
  const projectorTableWrapRef = useRef<HTMLDivElement | null>(null);
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
    const tableWrapHeight = projectorTableWrapRef.current?.getBoundingClientRect().height ?? 0;
    const tableHeadHeight = projectorTableHeadRef.current?.getBoundingClientRect().height ?? 52;
    setProjectorMetrics(resolveProjectorMetrics(tableWrapHeight, tableHeadHeight, headerHeight));
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onResize = () => syncProjectorMetrics();
    const onFullscreenChange = () => syncProjectorMetrics();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (settingsOpen) {
        event.preventDefault();
        setSettingsOpen(false);
        return;
      }
      if (document.fullscreenElement) {
        return;
      }
      event.preventDefault();
      navigate(`/competition/${Number(compIdx)}/round/${Number(roundIdx)}`);
    };

    const resizeObserver = new ResizeObserver(() => {
      syncProjectorMetrics();
    });
    if (projectorHeaderRef.current) {
      resizeObserver.observe(projectorHeaderRef.current);
    }
    if (projectorTableWrapRef.current) {
      resizeObserver.observe(projectorTableWrapRef.current);
    }
    if (projectorTableHeadRef.current) {
      resizeObserver.observe(projectorTableHeadRef.current);
    }

    window.setTimeout(syncProjectorMetrics, 0);
    window.setTimeout(syncProjectorMetrics, 180);
    if ("fonts" in document) {
      void (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => {
        syncProjectorMetrics();
      });
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [compIdx, navigate, roundIdx, settingsOpen, syncProjectorMetrics]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

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
  const columnCount = 4 + (showAverageColumn ? 1 : 0) + (showAttemptColumns ? attemptCount : 0);
  const emptyRows = Math.max(0, projectorMetrics.rowsPerPage - pageRecords.length);

  useEffect(() => {
    if (projectorPaused || totalPages <= 1) return;
    const timer = window.setInterval(() => {
      setProjectorPage((prev) => (prev + 1) % totalPages);
    }, pageDurationSec * 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [pageDurationSec, projectorPaused, totalPages]);

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
  const applyProjectorSettings = () => {
    const normalized = normalizeDurationSec(draftPageDurationSec);
    setPageDurationSec(normalized);
    setDraftPageDurationSec(normalized);
    setSettingsOpen(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await document.documentElement.requestFullscreen();
    } catch (fullscreenError) {
      console.error("프로젝터 전체화면 토글 실패:", fullscreenError);
    }
  };

  return (
    <div
      className="projector-mode-overlay"
      style={{ "--projector-row-height": `${projectorMetrics.rowHeight}px` } as CSSProperties}
    >
      <div className="projector-mode-header" ref={projectorHeaderRef}>
        <div className="projector-mode-title-wrap page-title-area round-title-area">
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
                target.src = `${import.meta.env.VITE_EVENT_ICON_BASE_URL}/Question.svg`;
              }}
            />
          </div>
          <div className="projector-mode-title-text round-title-text">
            <h1 className="page-title projector-mode-title">{`${round.cubeEventName} ${round.roundName}`}</h1>
            <div className="page-title-meta projector-mode-title-meta">
              <span>{round.compName}</span>
              {roundDateTime ? (
                <>
                  <span className="projector-mode-divider">·</span>
                  <span>{roundDateTime}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="projector-mode-controls">
          <button
            type="button"
            className="projector-mode-control-icon-btn"
            aria-label={projectorPaused ? "재생" : "일시정지"}
            onClick={() => setProjectorPaused((prev) => !prev)}
          >
            <img
              className="projector-mode-control-icon"
              src={projectorPaused ? "/icon/button/play.svg" : "/icon/button/pause.svg"}
              alt=""
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            className="projector-mode-control-icon-btn"
            aria-label={isFullscreen ? "전체화면 종료" : "전체화면"}
            onClick={() => {
              void toggleFullscreen();
            }}
          >
            <img
              className="projector-mode-control-icon"
              src={isFullscreen ? "/icon/button/fullscreen-exit.svg" : "/icon/button/fullscreen.svg"}
              alt=""
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            className="projector-mode-control-icon-btn"
            aria-label="설정"
            onClick={() => {
              setDraftPageDurationSec(pageDurationSec);
              setSettingsOpen(true);
            }}
          >
            <img className="projector-mode-control-icon" src="/icon/button/settings.svg" alt="" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="projector-mode-control-icon-btn"
            aria-label="종료"
            onClick={() => navigate(`/competition/${Number(backTarget)}/round/${Number(round.idx)}`)}
          >
            <img className="projector-mode-control-icon" src="/icon/modal/close.svg" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="projector-mode-table-wrap" ref={projectorTableWrapRef}>
        <table className="projector-mode-table">
          <thead ref={projectorTableHeadRef}>
            <tr>
              <th>#</th>
              <th>이름</th>
              <th>지역</th>
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
              const regionLabel = mapRegionName(record.state) ?? record.state ?? "-";
              const regionLogoSrc = getRegionLogoSrc(record.state);
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
                <td className="projector-mode-region-cell">
                  <span
                    className="projector-mode-cell-text projector-mode-region-inline"
                    style={{ "--projector-reveal-delay": resolveRevealDelay(index) } as CSSProperties}
                  >
                    {regionLogoSrc ? <img className="projector-mode-region-logo" src={regionLogoSrc} alt="" aria-hidden="true" /> : null}
                    <span>{regionLabel}</span>
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

      {settingsOpen ? (
        <div className="projector-settings-backdrop" role="presentation" onClick={() => setSettingsOpen(false)}>
          <div
            className="projector-settings-modal"
            role="dialog"
            aria-modal="true"
            aria-label="프로젝터 설정"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="projector-settings-header">
              <h3>프로젝터 설정</h3>
              <button
                type="button"
                className="projector-settings-close"
                aria-label="설정 닫기"
                onClick={() => setSettingsOpen(false)}
              >
                <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
              </button>
            </div>

            <label className="projector-settings-field">
              <span>페이지 전환 속도</span>
              <div className="projector-settings-input-row">
                <input
                  type="range"
                  min={PROJECTOR_MIN_DURATION_SEC}
                  max={PROJECTOR_MAX_DURATION_SEC}
                  value={draftPageDurationSec}
                  onChange={(event) => setDraftPageDurationSec(normalizeDurationSec(Number(event.target.value)))}
                />
                <input
                  type="number"
                  min={PROJECTOR_MIN_DURATION_SEC}
                  max={PROJECTOR_MAX_DURATION_SEC}
                  value={draftPageDurationSec}
                  onChange={(event) => setDraftPageDurationSec(normalizeDurationSec(Number(event.target.value)))}
                />
                <strong>초</strong>
              </div>
            </label>

            <div className="projector-settings-actions">
              <button type="button" className="projector-settings-btn" onClick={() => setSettingsOpen(false)}>
                취소
              </button>
              <button type="button" className="projector-settings-btn projector-settings-btn--primary" onClick={applyProjectorSettings}>
                적용
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
