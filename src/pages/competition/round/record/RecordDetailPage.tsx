import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRecordByIdx } from "@/entities/record";
import type { Record } from "@/entities/record";
import {
  getEventIconSrc,
  getMainAttempts,
  getNewRecordBadgeSrc,
  getWorstAttemptTrySet,
  getRegionLogoSrc,
  isBo3AvgCalc,
  isSingleAvgCalc,
  mapRegionName,
  resolveAverageValue,
  getErrorMessage,
  shouldUseRequestErrorPage,
} from "@/shared";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage.tsx";

const formatTimeValue = (value?: number | null): string => {
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

export const RecordDetailPage = () => {
  const { recordIdx } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const attemptMeasureRef = useRef<HTMLDivElement | null>(null);
  const [useSplitAttempts, setUseSplitAttempts] = useState(false);

  useEffect(() => {
    if (!recordIdx) {
      setError("기록 정보가 없습니다.");
      setLoading(false);
      return;
    }

    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecordByIdx(Number(recordIdx));
        if (!mounted) return;
        setRecord(data);
      } catch (fetchError) {
        if (!mounted) return;
        setError(getErrorMessage(fetchError, "기록 정보를 불러올 수 없습니다."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [recordIdx]);

  useEffect(() => {
    const node = attemptMeasureRef.current;
    if (!node) return;

    const checkOverflow = () => {
      const shouldSplit = node.scrollWidth > node.clientWidth + 1;
      setUseSplitAttempts(shouldSplit);
    };

    checkOverflow();
    const observer = new ResizeObserver(() => checkOverflow());
    observer.observe(node);
    window.addEventListener("resize", checkOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [record?.idx]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  };

  if (loading) {
    return (
      <div className="main-page">
        <div className="record-detail-page record-detail-page--loading">
          <div className="record-modal record-modal--detail record-modal--page">
            <div className="record-modal-header">
              <div className="record-modal-title skeleton-text" style={{ width: "60%", height: "1.4rem", background: "var(--skeleton-bg, #e0e0e0)", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (shouldUseRequestErrorPage(error)) {
      return <RequestErrorPage message={error} />;
    }
    return <div className="main-page"><div className="record-detail-page">{error}</div></div>;
  }

  if (!record) {
    return <div className="main-page"><div className="record-detail-page">기록 정보를 불러올 수 없습니다.</div></div>;
  }

  const mainAttempts = getMainAttempts(record.attempts, record.avgCalc);
  const hideAverage = isSingleAvgCalc(record.avgCalc) || isBo3AvgCalc(record.avgCalc);
  const displayAverage = resolveAverageValue(record.attempts, record.avgCalc, record.average);
  const regionLabel = mapRegionName(record.state) ?? record.state ?? "-";
  const regionLogoSrc = getRegionLogoSrc(record.state);
  const singleBestTypeBadgeSrc = getNewRecordBadgeSrc(record.singleBestType);
  const averageBestTypeBadgeSrc = getNewRecordBadgeSrc(record.averageBestType);
  const attemptTries = mainAttempts.map((attempt) => attempt.attemptTry);

  const times = mainAttempts.map((a) => a.time).filter((t): t is number => typeof t === "number");
  const positiveTimes = times.filter((t) => t >= 0);
  const bestValue = positiveTimes.length > 0 ? Math.min(...positiveTimes) : undefined;
  const worstTrySet = getWorstAttemptTrySet(record.attempts, record.avgCalc, record.eventName);

  const renderAttempt = (attemptTry: number, showSeparator: boolean) => {
    const attempt = mainAttempts.find((item) => item.attemptTry === attemptTry);
    const time = attempt?.time;
    let highlightClass = "";
    if (time !== undefined && time !== null) {
      if (time === bestValue) highlightClass = "attempt-best";
      else if (worstTrySet.has(attemptTry)) highlightClass = "attempt-worst";
    }
    return (
      <span key={attemptTry} className={["record-modal-attempt", highlightClass].filter(Boolean).join(" ")}>
        {formatTimeValue(time)}
        {showSeparator ? <span className="record-modal-attempt-sep" /> : null}
      </span>
    );
  };

  return (
    <div className="main-page">
      <div className="record-detail-page">
        <div className="record-modal record-modal--detail record-modal--page">
          <div className="record-modal-header">
            <div className="record-modal-title">
              {record.ranking != null ? `#${record.ranking} ` : ""}{record.name}
            </div>
            <div className="record-modal-actions">
              <button
                type="button"
                className="record-modal-profile-btn"
                onClick={() => navigate(`/profile/${encodeURIComponent(record.cckId)}`)}
                aria-label="선수 프로필로 이동"
              >
                <img src="/icon/sidebar/person.svg" alt="" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="record-modal-profile-btn"
                onClick={handleCopyLink}
                aria-label="링크 복사"
                title="링크 복사"
              >
                <img src="/icon/button/share.svg" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="record-modal-body">
            <div className="record-modal-row">
              <div className="record-modal-label">CCK ID</div>
              <div className="record-modal-value">{record.cckId}</div>
            </div>
            <div className="record-modal-row">
              <div className="record-modal-label">지역</div>
              <div className="record-modal-value record-modal-region region-inline">
                {regionLogoSrc ? <img className="region-logo" src={regionLogoSrc} alt="" aria-hidden="true" /> : null}
                <span>{regionLabel}</span>
              </div>
            </div>
            {!hideAverage ? (
              <div className="record-modal-row">
                <div className="record-modal-label">평균</div>
                <div className="record-modal-value record-modal-score">
                  <span className="record-value-with-badge record-value-with-badge--floating record-value-with-badge--modal">
                    <span className="record-value-with-badge-text">{formatTimeValue(displayAverage)}</span>
                    {averageBestTypeBadgeSrc ? (
                      <img
                        className={`new-record-badge${record.averageBestType === "CCR" ? " new-record-badge--ccr" : ""}`}
                        src={averageBestTypeBadgeSrc}
                        alt={String(record.averageBestType)}
                      />
                    ) : null}
                  </span>
                </div>
              </div>
            ) : null}
            <div className="record-modal-row">
              <div className="record-modal-label">최고</div>
              <div className="record-modal-value record-modal-score record-modal-highlight">
                <span className="record-value-with-badge record-value-with-badge--floating record-value-with-badge--modal">
                  <span className="record-value-with-badge-text">{formatTimeValue(record.single)}</span>
                  {singleBestTypeBadgeSrc ? (
                    <img
                      className={`new-record-badge${record.singleBestType === "CCR" ? " new-record-badge--ccr" : ""}`}
                      src={singleBestTypeBadgeSrc}
                      alt={String(record.singleBestType)}
                    />
                  ) : null}
                </span>
              </div>
            </div>
            <div className="record-modal-row">
              <div className="record-modal-label">시도</div>
              <div className="record-modal-value record-modal-attempts-wrap">
                {!useSplitAttempts ? (
                  <div className="record-modal-attempts record-modal-attempts--single">
                    {attemptTries.map((attemptTry, index) => renderAttempt(attemptTry, index < attemptTries.length - 1))}
                  </div>
                ) : (
                  <div className="record-modal-attempts record-modal-attempts--split">
                    <div className="record-modal-attempt-row">
                      {attemptTries.slice(0, Math.ceil(attemptTries.length / 2)).map((attemptTry, index, list) =>
                        renderAttempt(attemptTry, index < list.length - 1)
                      )}
                    </div>
                    <div className="record-modal-attempt-row">
                      {attemptTries.slice(Math.ceil(attemptTries.length / 2)).map((attemptTry, index, list) =>
                        renderAttempt(attemptTry, index < list.length - 1)
                      )}
                    </div>
                  </div>
                )}
                <div
                  ref={attemptMeasureRef}
                  className="record-modal-attempts record-modal-attempts--single record-modal-attempts--measure"
                  aria-hidden="true"
                >
                  {attemptTries.map((attemptTry, index) => renderAttempt(attemptTry, index < attemptTries.length - 1))}
                </div>
              </div>
            </div>
            <div className="record-modal-divider" aria-hidden="true" />
            <div className="record-modal-round-info">
              <div className="record-modal-round-icon" aria-hidden="true">
                <img
                  src={getEventIconSrc(record.eventName)}
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
              <div className="record-modal-round-text">
                <button
                  type="button"
                  className="record-modal-link-button record-modal-round-title"
                  onClick={() => navigate(`/competition/${record.compIdx}/round/${record.roundIdx}`)}
                >
                  {record.eventName} {record.roundName}
                </button>
                <button
                  type="button"
                  className="record-modal-link-button record-modal-round-subtitle"
                  onClick={() => navigate(`/competition/${record.compIdx}`)}
                >
                  {record.compName}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
