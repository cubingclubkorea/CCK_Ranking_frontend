import type { PlayerEventRanking } from "@/entities/statistics";
import { getEventIconSrc } from "@/shared";
import { useNavigate } from "react-router-dom";

type ProfileRankingSectionProps = {
  cckId: string;
  eventRankings: PlayerEventRanking[];
};

const formatTime = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  if (value < 0) return "DNF";
  if (value >= 60) {
    const minutes = Math.floor(value / 60);
    const seconds = value - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return value.toFixed(2);
};

const formatCcrRank = (value?: number | null) => {
  if (value === null || value === undefined || value <= 0) return "CCR -";
  return `CCR #${value}`;
};

export const ProfileRankingSection = ({ cckId, eventRankings }: ProfileRankingSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="profile-section">
      <div className="profile-section-head">
        <h3 className="profile-main-section-title">큐브 개인 기록</h3>
      </div>
      <div className="profile-event-grid">
        {eventRankings.map((item) => (
          <article
            className="profile-event-card profile-event-card--clickable"
            key={item.eventName}
            role="button"
            tabIndex={0}
            onClick={() =>
              navigate(`/profile/${encodeURIComponent(cckId)}/new-record/${encodeURIComponent(item.eventName)}`)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(`/profile/${encodeURIComponent(cckId)}/new-record/${encodeURIComponent(item.eventName)}`);
              }
            }}
          >
            <div className="profile-event-head">
              <img className="profile-event-icon" src={getEventIconSrc(item.eventName)} alt="" aria-hidden="true" />
              <strong className="profile-event-title">{item.eventName}</strong>
            </div>
            <div className="profile-event-row">
              <span className="profile-event-row-key">최고</span>
              <span className="profile-event-row-value">{formatTime(item.bestSingle)}</span>
              <em>{formatCcrRank(item.rankSingle)}</em>
            </div>
            <div className="profile-event-row">
              <span className="profile-event-row-key">평균</span>
              <span className="profile-event-row-value">{formatTime(item.bestAverage)}</span>
              <em>{formatCcrRank(item.rankAverage)}</em>
            </div>
          </article>
        ))}
        {eventRankings.length === 0 ? <div className="round-list-empty">표시할 종목 기록이 없습니다.</div> : null}
      </div>
    </section>
  );
};
