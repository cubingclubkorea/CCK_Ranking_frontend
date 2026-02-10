import type { Record } from "@/entities/record";

type RecordTableProps = {
  records: Record[];
  emptyMessage: string;
  formatTimeValue: (value?: number) => string;
  getAttemptValue: (attempts: Record["attempts"], attemptTry: number) => string;
};

export const RecordTable = ({
  records,
  emptyMessage,
  formatTimeValue,
  getAttemptValue,
}: RecordTableProps) => {
  if (records.length === 0) {
    return <div className="round-ranking-empty">{emptyMessage}</div>;
  }

  return (
    <div className="round-table-wrap">
      <table className="round-table">
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
          {records.map((record, index) => (
            <tr key={record.idx}>
              <td className="round-rank-cell">{record.ranking ?? index + 1}</td>
              <td className="round-name-cell">
                <div className="round-name">{record.name}</div>
                <div className="round-sub">{record.cckId}</div>
              </td>
              <td className="round-score">{formatTimeValue(record.average)}</td>
              <td className="round-score">{formatTimeValue(record.single)}</td>
              {[1, 2, 3, 4, 5].map((attemptTry) => (
                <td key={attemptTry} className="round-attempt-cell">
                  {getAttemptValue(record.attempts, attemptTry)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
