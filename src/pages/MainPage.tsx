import { useEffect, useState } from "react";
import { CompList, type CompListItem } from "@/widgets";
import {
  getCompetitionFuture,
  getCompetitionNow,
  getCompetitionPast,
} from "@/entities/competition";

export const MainPage = () => {
  const [upcoming, setUpcoming] = useState<CompListItem[]>([]);
  const [ongoing, setOngoing] = useState<CompListItem[]>([]);
  const [ended, setEnded] = useState<CompListItem[]>([]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDDay = (date: Date) => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `D-${Math.max(diff, 0)}`;
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [future, now, past] = await Promise.all([
          getCompetitionFuture({ page: 0, size: 1 }),
          getCompetitionNow({ page: 0, size: 1 }),
          getCompetitionPast({ page: 0, size: 1 }),
        ]);

        if (!mounted) return;

        setUpcoming(
          future.content.map(item => ({
            title: item.compName,
            meta: `${formatDate(item.compDateStart)} · ${item.location}`,
            badge: getDDay(item.compDateStart),
          }))
        );

        setOngoing(
          now.content.map(item => ({
            title: item.compName,
            meta: `${formatDate(item.compDateStart)} · ${item.location}`,
            badge: "Now",
            variant: "ongoing",
          }))
        );

        setEnded(
          past.content.map(item => ({
            title: item.compName,
            meta: `${formatDate(item.compDateStart)} · ${item.location}`,
            badge: "종료",
            variant: "ended",
          }))
        );
      } catch (error) {
        console.error("메인 대회 목록 조회 실패:", error);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return(
    <div className="main-page">
      <div className="main-section">
        <h2 className="main-section-title">다가오는 대회</h2>
        <CompList items={upcoming} emptyText="다가오는 대회가 없습니다." />
      </div>
      <div className="main-section">
        <h2 className="main-section-title">진행중인 대회</h2>
        <CompList items={ongoing} emptyText="진행중인 대회가 없습니다." />
      </div>
      <div className="main-section">
        <h2 className="main-section-title">지나간 대회</h2>
        <CompList items={ended} emptyText="지나간 대회가 없습니다." />
      </div>
    </div>
  )
}
