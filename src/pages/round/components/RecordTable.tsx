import { useEffect, useRef } from "react";
import type { Record } from "@/entities/record";
import {
  getMainAttempts,
  getRequiredAttemptCount,
  isAo12AvgCalc,
  isBo3AvgCalc,
  isSingleAvgCalc,
  getNewRecordBadgeSrc,
  resolveAverageValue,
} from "@/shared";

type RecordTableProps = {
  records: Record[];
  emptyMessage: string;
  advanceCount?: number;
  formatTimeValue: (value?: number | null) => string;
  getAttemptValue?: (attempts: Record["attempts"], attemptTry: number) => string;
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

  const tableAvgCalc = records[0]?.avgCalc;
  const singleMode = isSingleAvgCalc(tableAvgCalc);
  const bo3Mode = isBo3AvgCalc(tableAvgCalc);
  const ao12Mode = isAo12AvgCalc(tableAvgCalc);
  const showAttemptColumns = !compactAttempts && !ao12Mode;

  const maxAttemptCount = singleMode
    ? 1
    : records.reduce((max, record) => {
        return Math.max(max, getRequiredAttemptCount(record.avgCalc));
      }, 1);
  const attemptTries = Array.from({ length: maxAttemptCount }, (_, index) => index + 1);

  const hasCompleteMainAttempts = (record: Record) => {
    const mainAttempts = getMainAttempts(record.attempts, record.avgCalc);
    return mainAttempts.every((attempt) => attempt.time !== undefined && attempt.time !== null);
  };

  const hasComputedAverage = (record: Record) =>
    typeof resolveAverageValue(record.attempts, record.avgCalc, record.average) === "number";

  const getHighlightValues = (record: Record) => {
    const mainAttempts = getMainAttempts(record.attempts, record.avgCalc);
    const times = mainAttempts
      .map((attempt) => attempt.time)
      .filter((time) => typeof time === "number");
    const positiveTimes = times.filter((time) => time >= 0);
    const bestValue = positiveTimes.length > 0 ? Math.min(...positiveTimes) : undefined;
    return { bestValue };
  };

  return (
    <div className="record-table-wrap">
      <table className={`record-table ${compactAttempts ? "record-table--compact" : ""}`}>
        <thead>
          <tr>
            <th>순위</th>
            <th>이름</th>
            {!singleMode && !bo3Mode ? <th>평균</th> : null}
            <th>최고</th>
            {showAttemptColumns && (
              <>
                {attemptTries.map((attemptTry) => (
                  <th key={attemptTry}>{attemptTry}</th>
                ))}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const rank = record.ranking ?? index + 1;
            const hasAllAttempts = hasCompleteMainAttempts(record);
            const isRanked = hasAllAttempts && (singleMode ? typeof record.single === "number" : hasComputedAverage(record));
            const isAdvanceEligible = hasAllAttempts && isRanked;
            const isAdvance = advanceCount ? rank <= advanceCount && isAdvanceEligible : false;
            const prevRecord = index > 0 ? records[index - 1] : null;
            const prevRank = prevRecord ? (prevRecord.ranking ?? index) : null;
            const prevHasAllAttempts = prevRecord ? hasCompleteMainAttempts(prevRecord) : false;
            const prevIsAdvanceEligible = prevRecord ? prevHasAllAttempts && hasComputedAverage(prevRecord) : false;
            const prevIsAdvance = !!(advanceCount && prevRank !== null && prevRank <= advanceCount && prevIsAdvanceEligible);
            const isCutlineStart = !isAdvance && prevIsAdvance;
            const { bestValue } = getHighlightValues(record);
            const displayAverage = resolveAverageValue(record.attempts, record.avgCalc, record.average);
            const singleBestTypeBadgeSrc = getNewRecordBadgeSrc(record.singleBestType);
            const averageBestTypeBadgeSrc = getNewRecordBadgeSrc(record.averageBestType);
            const mainAttempts = getMainAttempts(record.attempts, record.avgCalc);
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
                {!singleMode && !bo3Mode ? (
                  <td className="round-score">
                    <span className="record-value-with-badge record-value-with-badge--floating">
                      <span className="record-value-with-badge-text">{hasAllAttempts ? formatTimeValue(displayAverage) : "-"}</span>
                      {hasAllAttempts && averageBestTypeBadgeSrc ? (
                        <img className="new-record-badge" src={averageBestTypeBadgeSrc} alt={String(record.averageBestType)} />
                      ) : null}
                    </span>
                  </td>
                ) : null}
                <td className="round-score">
                  <span className="record-value-with-badge record-value-with-badge--floating">
                    <span className="record-value-with-badge-text">{hasAllAttempts ? formatTimeValue(record.single) : "-"}</span>
                    {hasAllAttempts && singleBestTypeBadgeSrc ? (
                      <img className="new-record-badge" src={singleBestTypeBadgeSrc} alt={String(record.singleBestType)} />
                    ) : null}
                  </span>
                </td>
                {showAttemptColumns &&
                  attemptTries.map((attemptTry) => (
                    <td key={attemptTry} className="round-attempt-cell">
                      {(() => {
                        const attempt = mainAttempts.find((item) => item.attemptTry === attemptTry);
                        const time = attempt?.time;
                        if (time === undefined || time === null) {
                          return "-";
                        }
                        let highlightClass = "";
                        if (time === bestValue) {
                          highlightClass = "attempt-best";
                        }
                        return (
                          <span className={highlightClass || undefined}>{formatTimeValue(time)}</span>
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
