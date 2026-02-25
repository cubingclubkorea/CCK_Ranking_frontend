import { getEventIconSrc } from "@/shared";
import type { RankingMetric } from "@/features/ranking";

type RankingControlsProps = {
  events: string[];
  selectedEvent: string;
  onSelectEvent: (eventName: string) => void;
  metric: RankingMetric;
  onSelectMetric: (metric: RankingMetric) => void;
  averageDisabled?: boolean;
  regionOptions: string[];
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
};

export const RankingControls = ({
  events,
  selectedEvent,
  onSelectEvent,
  metric,
  onSelectMetric,
  averageDisabled = false,
  regionOptions,
  selectedRegion,
  onSelectRegion,
}: RankingControlsProps) => (
  <div className="ranking-controls">
    <div className="ranking-control-block">
      <div className="ranking-control-title">종목</div>
      <div className="ranking-event-tabs" role="tablist" aria-label="종목 선택">
        {events.map((eventName) => (
          <button
            key={eventName}
            type="button"
            className={`ranking-event-tab ${eventName === selectedEvent ? "active" : ""}`.trim()}
            onClick={() => onSelectEvent(eventName)}
            title={eventName}
            aria-label={eventName}
          >
            <img
              className="ranking-event-icon"
              src={getEventIconSrc(eventName)}
              alt=""
              aria-hidden="true"
              onError={(event) => {
                const target = event.currentTarget;
                if (target.dataset.fallback === "true") {
                  target.style.display = "none";
                  return;
                }
                target.dataset.fallback = "true";
                target.src = `${import.meta.env.VITE_EVENT_ICON_BASE_URL}/Question.svg`;
              }}
            />
          </button>
        ))}
      </div>
    </div>
    <div className="ranking-control-row">
      <div className="ranking-control-block">
        <div className="ranking-control-title">구분</div>
        <div className="ranking-metric-tabs" role="tablist" aria-label="기록 유형 선택">
          <button
            type="button"
            className={`ranking-metric-tab ${metric === "single" ? "active" : ""}`.trim()}
            onClick={() => onSelectMetric("single")}
          >
            최고
          </button>
          <button
            type="button"
            className={`ranking-metric-tab ${metric === "average" ? "active" : ""}`.trim()}
            onClick={() => onSelectMetric("average")}
            disabled={averageDisabled}
            aria-disabled={averageDisabled}
          >
            평균
          </button>
        </div>
      </div>
      <div className="ranking-control-block">
        <div className="ranking-control-title">지역</div>
        <select
          className="ranking-region-select"
          value={selectedRegion}
          onChange={(event) => onSelectRegion(event.target.value)}
          aria-label="지역 선택"
        >
          {regionOptions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);
