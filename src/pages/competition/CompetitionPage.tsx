import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompetition } from "@/entities/competition";
import type { Competition } from "@/entities/competition";
import { CompetitionHeader } from "./components/CompetitionHeader";
import { CompetitionActions } from "./components/CompetitionActions";

export const CompetitionPage = () => {
  const { compIdx } = useParams();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>로딩중...</div>;
  }

  if (!competition) {
    return <div>대회 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="comp-page">
      <div className="comp-header">
        <CompetitionHeader
          title={competition.compName}
          dateStart={competition.compDateStart}
          location={competition.location}
        />
        <CompetitionActions />
      </div>
      <div className="comp-content" />
    </div>
  );
};
