import type { Round, RoundDayCount } from "@/entities/round";

type RoundListProps = {
  schedule: RoundDayCount | null;
  loading: boolean;
};

type RoundStatus = "past" | "now" | "future";

type RoundItem = {
  round: Round;
  status: RoundStatus;
};

const formatTime = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

const formatTimeRange = (start: Date, end: Date) => {
  return `${formatTime(start)} ~ ${formatTime(end)}`;
};

const getMetaText = (round: Round) => {
  const parts: string[] = [];
  const isFinal = round.roundName.toLowerCase().includes("final");

  if (round.advance) {
    if (isFinal) {
      parts.push(`상위 ${round.advance}명에 대해 수상이 진행됩니다`);
    } else {
      parts.push(`상위 ${round.advance}명이 다음 라운드로 진출합니다`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : "라운드 정보";
};

const toItems = (rounds: Round[], status: RoundStatus): RoundItem[] => {
  return rounds.map((round) => ({ round, status }));
};

export const RoundList = ({ schedule, loading }: RoundListProps) => {
  if (loading) {
    return <div className="round-list-empty">로딩중...</div>;
  }

  if (!schedule) {
    return <div className="round-list-empty">라운드 정보를 불러올 수 없습니다.</div>;
  }

  const items = [
    ...toItems(schedule.past, "past"),
    ...toItems(schedule.now, "now"),
    ...toItems(schedule.future, "future"),
  ].sort((a, b) => a.round.eventStart.getTime() - b.round.eventStart.getTime());

  if (items.length === 0) {
    return <div className="round-list-empty">해당 날짜에 라운드가 없습니다.</div>;
  }

  return (
    <div className="round-list">
      {items.map(({ round, status }) => (
        <div className={`round-card ${status}`} key={round.idx}>
          <div className="round-card-icon" aria-hidden="true">
            <img
              className="round-card-icon-img"
              src={`/icon/events/${encodeURIComponent(round.cubeEventName)}.svg`}
              alt=""
              loading="lazy"
              onError={(event) => {
                const target = event.currentTarget;
                target.style.display = "none";
              }}
            />
          </div>
          <div className="round-card-body">
            <div className="round-card-title">
              {round.cubeEventName} {round.roundName}
            </div>
            <div className="round-card-meta">{getMetaText(round)}</div>
          </div>
          <div className={`round-card-time ${status}`}>
            {formatTimeRange(round.eventStart, round.eventEnd)}
          </div>
        </div>
      ))}
    </div>
  );
};
