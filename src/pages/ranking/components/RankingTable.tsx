import type { GlobalSingleRankingRecord } from "@/entities/statistics";
import { formatTime, type RankingMetric } from "@/features/ranking";
import {
  getMainAttempts,
  getWorstAttemptTrySet,
  getRegionLogoSrc,
  isAo12AvgCalc,
  isSingleAvgCalc,
  mapRegionName,
  resolveAverageValue,
} from "@/shared";

type RankingTableProps = {
  rows: GlobalSingleRankingRecord[];
  metric: RankingMetric;
  onSelectRow: (row: GlobalSingleRankingRecord, index: number) => void;
};

const renderAttemptValue = (time: number | null | undefined) => {
  if (time === null || time === undefined) return "-";
  if (time === -1) return "DNF";
  if (time === -2) return "DNS";
  return formatTime(time);
};

export const RankingTable = ({ rows, metric, onSelectRow }: RankingTableProps) => {
  const tableAvgCalc = rows[0]?.avgCalc;
  const singleMode = isSingleAvgCalc(tableAvgCalc);
  const ao12Mode = isAo12AvgCalc(tableAvgCalc);
  const showAttemptsColumn = metric === "average" && !singleMode && !ao12Mode;

  return (
    <div className="ranking-table-wrap">
      <table className={`ranking-table ranking-table--${metric} ${singleMode ? "ranking-table--single-avgcalc" : ""}`.trim()}>
        <colgroup>
          <col className="ranking-col-rank" />
          <col className="ranking-col-player" />
          <col className="ranking-col-record" />
          {singleMode ? <col className="ranking-col-attempt-single" /> : null}
          {!singleMode ? <col className="ranking-col-region" /> : null}
          {!singleMode ? <col className="ranking-col-comp" /> : null}
          {showAttemptsColumn ? <col className="ranking-col-attempts" /> : null}
        </colgroup>
        <thead>
          <tr>
            <th>순위</th>
            <th>선수</th>
            <th>{singleMode ? "최고" : "기록"}</th>
            {singleMode ? <th>1</th> : null}
            {!singleMode ? <th>지역</th> : null}
            {!singleMode ? <th>대회</th> : null}
            {showAttemptsColumn ? <th>전체 시도</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const displayAverage = resolveAverageValue(row.attempts, row.avgCalc, row.average);
            const displayRecord = singleMode ? row.single : metric === "single" ? row.single : displayAverage;
            const mainAttempts = getMainAttempts(row.attempts, row.avgCalc);
            const bestValue = mainAttempts
              .map((attempt) => attempt.time)
              .filter((time): time is number => typeof time === "number" && time >= 0)
              .reduce<number | undefined>((best, value) => (best === undefined || value < best ? value : best), undefined);
            const worstTrySet = getWorstAttemptTrySet(row.attempts, row.avgCalc, row.eventName);
            const firstAttempt = mainAttempts.find((attempt) => attempt.attemptTry === 1);
            const regionLabel = mapRegionName(row.state) ?? row.state ?? "-";
            const regionLogoSrc = getRegionLogoSrc(row.state);

            return (
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
                <td className="ranking-record-cell">
                  {formatTime(displayRecord)}
                </td>
                {singleMode ? <td>{renderAttemptValue(firstAttempt?.time)}</td> : null}
                {!singleMode ? (
                  <td>
                    <span className="region-inline">
                      {regionLogoSrc ? <img className="region-logo" src={regionLogoSrc} alt="" aria-hidden="true" /> : null}
                      <span>{regionLabel}</span>
                    </span>
                  </td>
                ) : null}
                {!singleMode ? <td className="ranking-comp-cell" title={row.compName}>{row.compName}</td> : null}
                {showAttemptsColumn ? (
                  <td className="ranking-attempts-cell">
                    <div className="ranking-attempts-inline">
                      {mainAttempts.map((attempt) => {
                        let highlightClass = "";
                        if (typeof attempt.time === "number" && attempt.time === bestValue) {
                          highlightClass = "attempt-best";
                        } else if (worstTrySet.has(attempt.attemptTry)) {
                          highlightClass = "attempt-worst";
                        }

                        return (
                          <span
                            key={`${row.idx}-${attempt.attemptTry}`}
                            className={["ranking-attempt-item", highlightClass].filter(Boolean).join(" ")}
                          >
                            {renderAttemptValue(attempt.time)}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
