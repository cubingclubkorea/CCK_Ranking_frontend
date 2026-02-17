import { formatTimeValue } from "@/features/ranking";
import type { TrendPoint } from "../types";

type RecordHistoryTableProps = {
  points: TrendPoint[];
  onSelectPoint: (point: TrendPoint) => void;
};

export const RecordHistoryTable = ({ points, onSelectPoint }: RecordHistoryTableProps) => (
  <div className="profile-record-history-table-wrap">
    <table className="profile-record-history-table">
      <thead>
        <tr>
          <th>#</th>
          <th>대회</th>
          <th>라운드</th>
          <th>싱글</th>
          <th>평균</th>
        </tr>
      </thead>
      <tbody>
        {points
          .slice()
          .reverse()
          .map((point) => (
            <tr
              key={`${point.compIdx}-${point.roundIdx}-${point.idx}`}
              className="profile-record-history-row--clickable"
              role="button"
              tabIndex={0}
              onClick={() => onSelectPoint(point)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectPoint(point);
                }
              }}
            >
              <td>{point.label}</td>
              <td className="profile-record-history-comp">{point.compName}</td>
              <td className="profile-record-history-round">{point.roundName}</td>
              <td className="profile-record-history-value">{formatTimeValue(point.single)}</td>
              <td className="profile-record-history-value">{formatTimeValue(point.average)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);
