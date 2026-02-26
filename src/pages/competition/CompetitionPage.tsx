import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "@/entities/competition";
import { getRoundByDayCount } from "@/entities/round";
import type { Competition } from "@/entities/competition";
import type { Round, RoundDayCount } from "@/entities/round";
import { CompetitionPageSkeleton, PageHeader } from "@/widgets";
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

const resolveRoundStatus = (round: Round): "past" | "now" | "future" => {
  const now = Date.now();
  const start = round.eventStart.getTime();
  const end = round.eventEnd.getTime();

  if (end <= now) return "past";
  if (start <= now && end > now) return "now";
  return "future";
};

const mergeRoundSchedules = (schedules: RoundDayCount[]): RoundDayCount => {
  const uniqueRoundMap = new Map<number, Round>();

  for (const schedule of schedules) {
    for (const round of [...schedule.past, ...schedule.now, ...schedule.future]) {
      uniqueRoundMap.set(round.idx, round);
    }
  }

  const merged = Array.from(uniqueRoundMap.values()).sort(
    (a, b) => a.eventStart.getTime() - b.eventStart.getTime()
  );

  const past: Round[] = [];
  const now: Round[] = [];
  const future: Round[] = [];

  for (const round of merged) {
    const status = resolveRoundStatus(round);
    if (status === "past") past.push(round);
    if (status === "now") now.push(round);
    if (status === "future") future.push(round);
  }

  return { past, now, future };
};

const isOverlappingDate = (start: Date, end: Date, selectedDate: Date) => {
  const dayStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    0,
    0,
    0,
    0
  );
  const dayEnd = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate() + 1,
    0,
    0,
    0,
    0
  );

  return start < dayEnd && end > dayStart;
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
      if (!compIdx || !competition) return;
      setRoundLoading(true);

      try {
        const dayItems = getDayRange(competition.compDateStart, competition.compDateEnd);
        const daySchedules = await Promise.all(
          dayItems.map((item) => getRoundByDayCount(Number(compIdx), item.dayCount))
        );
        if (!mounted) return;
        setRoundSchedule(mergeRoundSchedules(daySchedules));
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
  }, [compIdx, competition]);

  useEffect(() => {
    setDayCount(0);
  }, [competition?.idx]);

  const dayItems = useMemo(() => {
    if (!competition) return [];
    return getDayRange(competition.compDateStart, competition.compDateEnd);
  }, [competition]);

  const visibleDayItems = useMemo(() => {
    if (!roundSchedule) return dayItems;

    const allRounds = [...roundSchedule.past, ...roundSchedule.now, ...roundSchedule.future];
    if (allRounds.length === 0) return dayItems;

    return dayItems.filter((item) =>
      allRounds.some((round) => isOverlappingDate(round.eventStart, round.eventEnd, item.date))
    );
  }, [dayItems, roundSchedule]);

  useEffect(() => {
    if (visibleDayItems.length === 0) return;
    const exists = visibleDayItems.some((item) => item.dayCount === dayCount);
    if (!exists) {
      setDayCount(visibleDayItems[0].dayCount);
    }
  }, [visibleDayItems, dayCount]);

  if (loading) {
    return <CompetitionPageSkeleton />;
  }

  if (!competition) {
    return <div>대회 정보를 불러올 수 없습니다.</div>;
  }

  const selectedDay = visibleDayItems.find((item) => item.dayCount === dayCount) ?? null;

  return (
    <div className="main-page">
      <PageHeader
        containerClassName="comp-header"
        title={competition.compName}
        subtitle={
          <>
            <span>{formatDate(competition.compDateStart)}</span>
            {competition.location ? (
              <>
                <span className="page-title-meta-divider">·</span>
                <span>{competition.location}</span>
              </>
            ) : null}
          </>
        }
        actions={[
          {
            label: "스크램블",
            iconSrc: "/icon/button/cube.svg",
            to: `/admin/competition/${competition.idx}/scramble`,
            adminOnly: true,
          },
          {
            label: "대회 관리",
            iconSrc: "/icon/button/hammer.svg",
            to: `/admin/competition/${competition.idx}`,
            adminOnly: true,
          },
          {
            label: "대회 통계",
            iconSrc: "/icon/button/statistics.svg",
            to: `/competition/${competition.idx}/statistics`,
          },
          {
            label: "대회 정보",
            iconSrc: "/logo/cck-logo.png",
            iconClassName: "page-action-icon page-action-icon--logo",
            href: "https://cubingclub.com/pages/competition",
          },
          {
            label: "랭킹 홈",
            iconSrc: "/icon/button/home.svg",
            to: "/",
          },
        ]}
      />
      <div className="comp-content">
        <div className="round-schedule">
          <div className="round-day-tabs">
            {visibleDayItems.map((item) => (
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
          <RoundList schedule={roundSchedule} loading={roundLoading} selectedDate={selectedDay?.date ?? null} />
        </div>
      </div>
    </div>
  );
};
