import type { Record } from "@/entities/record";

type RecordTableProps = {
  records: Record[];
  emptyMessage: string;
  advanceCount?: number;
  formatTimeValue: (value?: number) => string;
  getAttemptValue: (attempts: Record["attempts"], attemptTry: number) => string;
  onSelect?: (record: Record, rank: number) => void;
  selectedRecordIdx?: number;
};

export const RecordTable = ({
  records,
  emptyMessage,
  advanceCount,
  formatTimeValue,
  getAttemptValue,
  onSelect,
  selectedRecordIdx,
}: RecordTableProps) => {
  if (records.length === 0) {
    return <div className="round-ranking-empty">{emptyMessage}</div>;
  }

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
      <table className="record-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>이름</th>
            <th>평균</th>
            <th>싱글</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const rank = record.ranking ?? index + 1;
            const isAdvance = advanceCount ? rank <= advanceCount : false;
            const { bestValue, worstValue, negativeTimes } = getHighlightValues(record.attempts);
            const isSelected = selectedRecordIdx === record.idx;
            return (
              <tr
                key={record.idx}
                className={[
                  isAdvance ? "round-table-row-advance" : "",
                  "record-table-row",
                  isSelected ? "record-table-row-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelect?.(record, rank)}
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
                <td className="round-rank-cell">{rank}</td>
                <td className="round-name-cell">
                  <div className="round-name">
                    {record.enName ? `${record.name} (${record.enName})` : record.name}
                  </div>
                </td>
                <td className="round-score">{formatTimeValue(record.average)}</td>
                <td className="round-score">{formatTimeValue(record.single)}</td>
                {[1, 2, 3, 4, 5].map((attemptTry) => (
                  <td key={attemptTry} className="round-attempt-cell">
                    {(() => {
                      const attempt = record.attempts.find((item) => item.attemptTry === attemptTry);
                      const time = attempt?.time;
                      if (time === undefined) {
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
