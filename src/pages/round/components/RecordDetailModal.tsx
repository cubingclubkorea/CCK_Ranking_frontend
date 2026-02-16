import type { Record } from "@/entities/record";
import { getEventIconSrc } from "@/shared";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

type RecordDetailModalProps = {
  selected: { record: Record; rank: number } | null;
  onClose: () => void;
  formatTimeValue: (value?: number | null) => string;
  getAttemptValue: (attempts: Record["attempts"], attemptTry: number) => string;
};

export const RecordDetailModal = ({
  selected,
  onClose,
  formatTimeValue,
  getAttemptValue,
}: RecordDetailModalProps) => {
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

  const getHighlightValues = (attempts: Record["attempts"]) => {
    const times = attempts
      .map((attempt) => attempt.time)
      .filter((time) => typeof time === "number");
    const positiveTimes = times.filter((time) => time >= 0);
    const negativeTimes = times.filter((time) => time < 0);
    const bestValue = positiveTimes.length > 0 ? Math.min(...positiveTimes) : undefined;
    const worstValue =
      negativeTimes.length > 0
        ? Math.min(...negativeTimes)
        : positiveTimes.length > 0
          ? Math.max(...positiveTimes)
          : undefined;
    return { bestValue, worstValue, negativeTimes };
  };

  const { bestValue, worstValue, negativeTimes } = getHighlightValues(selected.record.attempts);
  const attemptTries = [1, 2, 3, 4, 5] as const;

  const renderAttempt = (attemptTry: number, showSeparator: boolean) => {
    const attempt = selected.record.attempts.find((item) => item.attemptTry === attemptTry);
    const time = attempt?.time;
    let highlightClass = "";
    if (time !== undefined && time !== null) {
      if (negativeTimes.length > 0 && time < 0) {
        highlightClass = "attempt-worst";
      } else if (time === bestValue) {
        highlightClass = "attempt-best";
      } else if (time === worstValue) {
        highlightClass = "attempt-worst";
      }
    }

    return (
      <span
        key={attemptTry}
        className={["record-modal-attempt", highlightClass].filter(Boolean).join(" ")}
      >
        {getAttemptValue(selected.record.attempts, attemptTry)}
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
            <div className="record-modal-value">{selected.record.state ?? "-"}</div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">평균</div>
            <div className="record-modal-value record-modal-score">{formatTimeValue(selected.record.average)}</div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">최고</div>
            <div className="record-modal-value record-modal-score record-modal-highlight">
              {formatTimeValue(selected.record.single)}
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
                    {[1, 2, 3].map((attemptTry) => renderAttempt(attemptTry, true))}
                  </div>
                  <div className="record-modal-attempt-row">
                    {[4, 5].map((attemptTry, index) => renderAttempt(attemptTry, index === 0))}
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
                  target.src = "/icon/events/Question.svg";
                }}
              />
            </div>
            <div className="record-modal-round-text">
              <div className="record-modal-round-title">
                {selected.record.eventName} {selected.record.roundName}
              </div>
              <div className="record-modal-round-subtitle">{selected.record.compName}</div>
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
