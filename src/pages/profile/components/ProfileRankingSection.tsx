import type { PlayerEventRanking } from "@/entities/statistics";
import { getEventIconSrc } from "@/shared";

type ProfileRankingSectionProps = {
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

export const ProfileRankingSection = ({ eventRankings }: ProfileRankingSectionProps) => (
  <section className="profile-section">
    <div className="profile-section-head">
      <h3 className="profile-main-section-title">큐브 개인 기록</h3>
    </div>
    <div className="profile-event-grid">
      {eventRankings.map((item) => (
        <article className="profile-event-card" key={item.eventName}>
          <div className="profile-event-head">
            <img className="profile-event-icon" src={getEventIconSrc(item.eventName)} alt="" aria-hidden="true" />
            <strong className="profile-event-title">{item.eventName}</strong>
          </div>
          <div className="profile-event-row">
            <span>싱글</span>
            <span>{formatTime(item.bestSingle)}</span>
            <em>#{item.rankSingle ?? "-"}</em>
          </div>
          <div className="profile-event-row">
            <span>평균</span>
            <span>{formatTime(item.bestAverage)}</span>
            <em>#{item.rankAverage ?? "-"}</em>
          </div>
        </article>
      ))}
      {eventRankings.length === 0 ? <div className="round-list-empty">표시할 종목 기록이 없습니다.</div> : null}
    </div>
  </section>
);
