import type { GlobalSingleRankingRecord } from "@/entities/statistics";
import { formatTime, type RankingMetric } from "@/features/ranking";

type RankingTableProps = {
  rows: GlobalSingleRankingRecord[];
  metric: RankingMetric;
  onSelectRow: (row: GlobalSingleRankingRecord, index: number) => void;
};

export const RankingTable = ({ rows, metric, onSelectRow }: RankingTableProps) => (
  <div className="ranking-table-wrap">
    <table className="ranking-table">
      <thead>
        <tr>
          <th>순위</th>
          <th>선수</th>
          <th>기록</th>
          <th>대회</th>
          <th>라운드</th>
          <th>지역</th>
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
            <td>{formatTime(metric === "single" ? row.single : row.average)}</td>
            <td>{row.compName}</td>
            <td>{row.roundName}</td>
            <td>{row.state ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
