import type { GlobalSingleRankingRecord } from "@/entities/statistics";
import { formatTime, type RankingMetric } from "@/features/ranking";

type RankingTableProps = {
  rows: GlobalSingleRankingRecord[];
  metric: RankingMetric;
  onSelectRow: (row: GlobalSingleRankingRecord, index: number) => void;
};

const getAttemptHighlights = (row: GlobalSingleRankingRecord) => {
  const times = row.attempts
    .map((attempt) => attempt.time)
    .filter((time): time is number => typeof time === "number");
  const positives = times.filter((time) => time >= 0);
  const negatives = times.filter((time) => time < 0);

  const bestValue = positives.length > 0 ? Math.min(...positives) : undefined;
  const worstValue =
    negatives.length > 0
      ? Math.min(...negatives)
      : positives.length > 0
        ? Math.max(...positives)
        : undefined;

  return { bestValue, worstValue, hasNegative: negatives.length > 0 };
};

const renderAttemptValue = (time: number | null | undefined) => {
  if (time === null || time === undefined) return "-";
  if (time === -1) return "DNF";
  if (time === -2) return "DNS";
  return formatTime(time);
};

export const RankingTable = ({ rows, metric, onSelectRow }: RankingTableProps) => (
  <div className="ranking-table-wrap">
    <table className={`ranking-table ranking-table--${metric}`}>
      <colgroup>
        <col className="ranking-col-rank" />
        <col className="ranking-col-player" />
        <col className="ranking-col-record" />
        <col className="ranking-col-region" />
        <col className="ranking-col-comp" />
        {metric === "average" ? <col className="ranking-col-attempts" /> : null}
      </colgroup>
      <thead>
        <tr>
          <th>순위</th>
          <th>선수</th>
          <th>기록</th>
          <th>지역</th>
          <th>대회</th>
          {metric === "average" ? <th>전체 시도</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={`${row.idx}-${row.cckId}-${index}`}
            className="ranking-table-row--clickable"
            onClick={() => onSelectRow(row, index)}
          >
            <td>#{index + 1}</td>
            <td className="ranking-player-cell">
              <div className="ranking-player-name">{row.name}</div>
              <div className="ranking-player-id">{row.cckId}</div>
            </td>
            <td className="ranking-record-cell">{formatTime(metric === "single" ? row.single : row.average)}</td>
            <td>{row.state || "-"}</td>
            <td className="ranking-comp-cell" title={row.compName}>{row.compName}</td>
            {metric === "average" ? (
              <td className="ranking-attempts-cell">
                <div className="ranking-attempts-inline">
                  {(() => {
                    const sortedAttempts = [...row.attempts].sort((a, b) => a.attemptTry - b.attemptTry);
                    const { bestValue, worstValue, hasNegative } = getAttemptHighlights(row);

                    return sortedAttempts.map((attempt) => {
                      let highlightClass = "";
                      if (typeof attempt.time === "number" && hasNegative && attempt.time < 0) {
                        highlightClass = "attempt-worst";
                      } else if (typeof attempt.time === "number" && attempt.time === bestValue) {
                        highlightClass = "attempt-best";
                      } else if (typeof attempt.time === "number" && attempt.time === worstValue) {
                        highlightClass = "attempt-worst";
                      }

                      return (
                        <span
                          key={`${row.idx}-${attempt.idx}-${attempt.attemptTry}`}
                          className={["ranking-attempt-item", highlightClass].filter(Boolean).join(" ")}
                        >
                          {renderAttemptValue(attempt.time)}
                        </span>
                      );
                    });
                  })()}
                </div>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
