import type { Record } from "@/entities/record";
import { createPortal } from "react-dom";

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

  const modal = (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div
        className="record-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="record-modal-header">
          <div className="record-modal-title">
            #{selected.rank} {selected.record.name}
          </div>
          <button type="button" className="record-modal-close" onClick={onClose} aria-label="닫기">
            <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
          </button>
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
            <div className="record-modal-value">{formatTimeValue(selected.record.average)}</div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">최고</div>
            <div className="record-modal-value record-modal-highlight">
              {formatTimeValue(selected.record.single)}
            </div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">시도</div>
            <div className="record-modal-value record-modal-attempts">
              {[1, 2, 3, 4, 5].map((attemptTry, index) => {
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
                  <span key={attemptTry}>
                    {index > 0 ? " · " : ""}
                    <span className={highlightClass || undefined}>
                      {getAttemptValue(selected.record.attempts, attemptTry)}
                    </span>
                  </span>
                );
              })}
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
