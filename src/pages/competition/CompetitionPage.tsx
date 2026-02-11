import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "@/entities/competition";
import { getRoundByDayCount } from "@/entities/round";
import type { Competition } from "@/entities/competition";
import type { RoundDayCount } from "@/entities/round";
import { CompetitionHeader } from "./components/CompetitionHeader";
import { RoundList } from "./components/RoundList";

type DayItem = {
  dayCount: number;
  date: Date;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDayRange = (start: Date, end: Date): DayItem[] => {
  const items: DayItem[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  let dayCount = 0;

  while (current <= last) {
    items.push({ dayCount, date: new Date(current) });
    current.setDate(current.getDate() + 1);
    dayCount += 1;
  }

  return items;
};

export const CompetitionPage = () => {
  const { compIdx } = useParams();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [dayCount, setDayCount] = useState(0);
  const [roundSchedule, setRoundSchedule] = useState<RoundDayCount | null>(null);
  const [roundLoading, setRoundLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!compIdx) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCompetition(Number(compIdx));
        if (!mounted) return;
        setCompetition(data);
      } catch (error) {
        console.error("대회 상세 조회 실패:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [compIdx]);

  useEffect(() => {
    let mounted = true;

    const fetchRounds = async () => {
      if (!compIdx) return;
      setRoundLoading(true);

      try {
        const data = await getRoundByDayCount(Number(compIdx), dayCount);
        if (!mounted) return;
        setRoundSchedule(data);
      } catch (error) {
        console.error("대회 라운드 조회 실패:", error);
        if (mounted) setRoundSchedule(null);
      } finally {
        if (mounted) setRoundLoading(false);
      }
    };

    fetchRounds();

    return () => {
      mounted = false;
    };
  }, [compIdx, dayCount]);

  useEffect(() => {
    setDayCount(0);
  }, [competition?.idx]);

  if (loading) {
    return <div>로딩중...</div>;
  }

  if (!competition) {
    return <div>대회 정보를 불러올 수 없습니다.</div>;
  }

  const dayItems = getDayRange(competition.compDateStart, competition.compDateEnd);

  return (
    <div className="main-page">
      <div className="comp-header">
        <CompetitionHeader
          title={competition.compName}
          dateStart={competition.compDateStart}
          location={competition.location}
          compIdx={competition.idx}
        />
      </div>
      <div className="comp-content">
        <div className="round-schedule">
          <div className="round-day-tabs">
            {dayItems.map((item) => (
              <button
                className={`round-day-tab ${item.dayCount === dayCount ? "active" : ""}`.trim()}
                key={`${competition.idx}-${item.dayCount}`}
                type="button"
                onClick={() => setDayCount(item.dayCount)}
              >
                <span className="round-day-tab-label">
                  {item.dayCount + 1}일차 · {formatDate(item.date)}
                </span>
              </button>
            ))}
          </div>
          <RoundList schedule={roundSchedule} loading={roundLoading} />
        </div>
      </div>
    </div>
  );
};
