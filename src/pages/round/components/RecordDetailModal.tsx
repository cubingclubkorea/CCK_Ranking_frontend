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
} from "@/shared";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type RecordDetailModalProps = {
  selected: { record: Record; rank: number } | null;
  onClose: () => void;
  formatTimeValue: (value?: number | null) => string;
};

export const RecordDetailModal = ({
  selected,
  onClose,
  formatTimeValue,
}: RecordDetailModalProps) => {
  const navigate = useNavigate();
  const attemptMeasureRef = useRef<HTMLDivElement | null>(null);
  const [useSplitAttempts, setUseSplitAttempts] = useState(false);

  useEffect(() => {
    const node = attemptMeasureRef.current;
    if (!node) return;

    const checkOverflow = () => {
      const shouldSplit = node.scrollWidth > node.clientWidth + 1;
      setUseSplitAttempts(shouldSplit);
    };

    checkOverflow();

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });
    observer.observe(node);
    window.addEventListener("resize", checkOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [selected?.record.idx]);

  if (!selected) return null;

  const mainAttempts = getMainAttempts(selected.record.attempts, selected.record.avgCalc);
  const hideAverage = isSingleAvgCalc(selected.record.avgCalc) || isBo3AvgCalc(selected.record.avgCalc);

  const getHighlightValues = () => {
    const times = mainAttempts
      .map((attempt) => attempt.time)
      .filter((time) => typeof time === "number");
    const positiveTimes = times.filter((time) => time >= 0);
    const bestValue = positiveTimes.length > 0 ? Math.min(...positiveTimes) : undefined;
    const worstTrySet = getWorstAttemptTrySet(
      selected.record.attempts,
      selected.record.avgCalc,
      selected.record.eventName
    );
    return { bestValue, worstTrySet };
  };

  const { bestValue, worstTrySet } = getHighlightValues();
  const attemptTries = mainAttempts.map((attempt) => attempt.attemptTry);
  const displayAverage = resolveAverageValue(
    selected.record.attempts,
    selected.record.avgCalc,
    selected.record.average
  );
  const regionLabel = mapRegionName(selected.record.state) ?? selected.record.state ?? "-";
  const regionLogoSrc = getRegionLogoSrc(selected.record.state);
  const singleBestTypeBadgeSrc = getNewRecordBadgeSrc(selected.record.singleBestType);
  const averageBestTypeBadgeSrc = getNewRecordBadgeSrc(selected.record.averageBestType);

  const renderAttempt = (attemptTry: number, showSeparator: boolean) => {
    const attempt = mainAttempts.find((item) => item.attemptTry === attemptTry);
    const time = attempt?.time;
    let highlightClass = "";
    if (time !== undefined && time !== null) {
      if (time === bestValue) {
        highlightClass = "attempt-best";
      } else if (worstTrySet.has(attemptTry)) {
        highlightClass = "attempt-worst";
      }
    }

    return (
      <span
        key={attemptTry}
        className={["record-modal-attempt", highlightClass].filter(Boolean).join(" ")}
      >
        {formatTimeValue(time)}
        {showSeparator ? <span className="record-modal-attempt-sep"></span> : null}
      </span>
    );
  };

  const modal = (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div
        className="record-modal record-modal--detail"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="record-modal-header">
          <div className="record-modal-title">
            #{selected.rank} {selected.record.name}
          </div>
          <div className="record-modal-actions">
            <button
              type="button"
              className="record-modal-profile-btn"
              onClick={() => navigate(`/profile/${encodeURIComponent(selected.record.cckId)}`)}
              aria-label="선수 프로필로 이동"
            >
              <img src="/icon/sidebar/person.svg" alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="record-modal-close"
              onClick={onClose}
              aria-label="닫기"
            >
              <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="record-modal-body">
          <div className="record-modal-row">
            <div className="record-modal-label">CCK ID</div>
            <div className="record-modal-value">{selected.record.cckId}</div>
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
                      className={`new-record-badge${selected.record.averageBestType === "CCR" ? " new-record-badge--ccr" : ""}`}
                      src={averageBestTypeBadgeSrc}
                      alt={String(selected.record.averageBestType)}
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
                <span className="record-value-with-badge-text">{formatTimeValue(selected.record.single)}</span>
                {singleBestTypeBadgeSrc ? (
                  <img
                    className={`new-record-badge${selected.record.singleBestType === "CCR" ? " new-record-badge--ccr" : ""}`}
                    src={singleBestTypeBadgeSrc}
                    alt={String(selected.record.singleBestType)}
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
                    {attemptTries
                      .slice(0, Math.ceil(attemptTries.length / 2))
                      .map((attemptTry, index, list) =>
                        renderAttempt(attemptTry, index < list.length - 1)
                      )}
                  </div>
                  <div className="record-modal-attempt-row">
                    {attemptTries
                      .slice(Math.ceil(attemptTries.length / 2))
                      .map((attemptTry, index, list) =>
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
                src={getEventIconSrc(selected.record.eventName)}
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
                onClick={() => navigate(`/competition/${selected.record.compIdx}/round/${selected.record.roundIdx}`)}
              >
                {selected.record.eventName} {selected.record.roundName}
              </button>
              <button
                type="button"
                className="record-modal-link-button record-modal-round-subtitle"
                onClick={() => navigate(`/competition/${selected.record.compIdx}`)}
              >
                {selected.record.compName}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
};
