import { useEffect, useRef } from "react";
import type { Record } from "@/entities/record";

type RecordTableProps = {
  records: Record[];
  emptyMessage: string;
  advanceCount?: number;
  formatTimeValue: (value?: number | null) => string;
  getAttemptValue: (attempts: Record["attempts"], attemptTry: number) => string;
  compactAttempts?: boolean;
  onSelect?: (record: Record, rank: number) => void;
  onContextMenu?: (record: Record, rank: number, position: { x: number; y: number }) => void;
  selectedRecordIdx?: number;
};

export const RecordTable = ({
  records,
  emptyMessage,
  advanceCount,
  formatTimeValue,
  getAttemptValue,
  compactAttempts = false,
  onSelect,
  onContextMenu,
  selectedRecordIdx,
}: RecordTableProps) => {
  const rowRefMap = useRef<Map<number, HTMLTableRowElement>>(new Map());

  useEffect(() => {
    if (!selectedRecordIdx) return;
    const row = rowRefMap.current.get(selectedRecordIdx);
    if (!row) return;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selectedRecordIdx]);

  if (records.length === 0) {
    return <div className="round-ranking-empty">{emptyMessage}</div>;
  }

  const hasCompleteMainAttempts = (record: Record) => {
    return [1, 2, 3, 4, 5].every((attemptTry) =>
      record.attempts.some(
        (attempt) =>
          attempt.attemptTry === attemptTry &&
          attempt.time !== undefined &&
          attempt.time !== null
      )
    );
  };

  const hasComputedAverage = (record: Record) => typeof record.average === "number";

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

  return (
    <div className="record-table-wrap">
      <table className={`record-table ${compactAttempts ? "record-table--compact" : ""}`}>
        <thead>
          <tr>
            <th>순위</th>
            <th>이름</th>
            <th>평균</th>
            <th>최고</th>
            {!compactAttempts && (
              <>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const rank = record.ranking ?? index + 1;
            const hasAllAttempts = hasCompleteMainAttempts(record);
            const isRanked = hasAllAttempts && hasComputedAverage(record);
            const isAdvanceEligible = hasAllAttempts && isRanked;
            const isAdvance = advanceCount ? rank <= advanceCount && isAdvanceEligible : false;
            const prevRecord = index > 0 ? records[index - 1] : null;
            const prevRank = prevRecord ? (prevRecord.ranking ?? index) : null;
            const prevHasAllAttempts = prevRecord ? hasCompleteMainAttempts(prevRecord) : false;
            const prevIsAdvanceEligible = prevRecord ? prevHasAllAttempts && hasComputedAverage(prevRecord) : false;
            const prevIsAdvance = !!(advanceCount && prevRank !== null && prevRank <= advanceCount && prevIsAdvanceEligible);
            const isCutlineStart = !isAdvance && prevIsAdvance;
            const { bestValue, worstValue, negativeTimes } = getHighlightValues(record.attempts);
            const isSelected = selectedRecordIdx === record.idx;
            return (
              <tr
                key={record.idx}
                ref={(node) => {
                  if (node) {
                    rowRefMap.current.set(record.idx, node);
                    return;
                  }
                  rowRefMap.current.delete(record.idx);
                }}
                className={[
                  isAdvance ? "round-table-row-advance" : "",
                  isCutlineStart ? "round-table-row-cutline" : "",
                  "record-table-row",
                  isSelected ? "record-table-row-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelect?.(record, rank)}
                onContextMenu={(event) => {
                  if (!onContextMenu) return;
                  event.preventDefault();
                  onContextMenu(record, rank, { x: event.clientX, y: event.clientY });
                }}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onKeyDown={(event) => {
                  if (!onSelect) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(record, rank);
                  }
                }}
              >
                <td className="round-rank-cell">{isRanked ? rank : "-"}</td>
                <td className="round-name-cell">
                  <div className="round-name" title={record.enName ? `${record.name} (${record.enName})` : record.name}>
                    {record.enName ? `${record.name} (${record.enName})` : record.name}
                  </div>
                </td>
                <td className="round-score">{hasAllAttempts ? formatTimeValue(record.average) : "-"}</td>
                <td className="round-score">{hasAllAttempts ? formatTimeValue(record.single) : "-"}</td>
                {!compactAttempts &&
                  [1, 2, 3, 4, 5].map((attemptTry) => (
                    <td key={attemptTry} className="round-attempt-cell">
                      {(() => {
                        const attempt = record.attempts.find((item) => item.attemptTry === attemptTry);
                        const time = attempt?.time;
                        if (time === undefined || time === null) {
                          return "-";
                        }
                        let highlightClass = "";
                        if (negativeTimes.length > 0 && time < 0) {
                          highlightClass = "attempt-worst";
                        } else if (time === bestValue) {
                          highlightClass = "attempt-best";
                        } else if (time === worstValue) {
                          highlightClass = "attempt-worst";
                        }
                        return (
                          <span className={highlightClass || undefined}>{getAttemptValue(record.attempts, attemptTry)}</span>
                        );
                      })()}
                    </td>
                  ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
