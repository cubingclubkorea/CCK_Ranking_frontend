import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getRound } from "@/entities/round";
import { getRecordList } from "@/entities/record";
import type { Round } from "@/entities/round";
import type { Record } from "@/entities/record";
import { RoundHeader } from "./components/RoundHeader";
import { RecordTable } from "./components/RecordTable";
import { RecordDetailModal } from "./components/RecordDetailModal";

const formatTimeValue = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (value === -1) {
    return "DNF";
  }
  if (value === -2) {
    return "DNS";
  }
  const absValue = Math.abs(value);
  if (absValue >= 60) {
    const minutes = Math.floor(absValue / 60);
    const seconds = absValue - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return value.toFixed(2);
};

const getAttemptValue = (attempts: Record["attempts"], attemptTry: number) => {
  const attempt = attempts?.find((item) => item.attemptTry === attemptTry);
  return attempt ? formatTimeValue(attempt.time) : "-";
};

export const RoundPage = () => {
  const { compIdx, roundIdx } = useParams();
  const [round, setRound] = useState<Round | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<{ record: Record; rank: number } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!roundIdx) {
        if (mounted) {
          setError("라운드 정보가 없습니다.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [roundData, recordData] = await Promise.all([
          getRound(Number(roundIdx)),
          getRecordList(Number(roundIdx)),
        ]);
        if (!mounted) return;
        setRound(roundData);
        setRecords(recordData);
      } catch (fetchError) {
        console.error("라운드 랭킹 조회 실패:", fetchError);
        if (mounted) setError("랭킹 정보를 불러올 수 없습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [roundIdx]);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const rankA = a.ranking ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.ranking ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      const avgA = a.average ?? Number.MAX_SAFE_INTEGER;
      const avgB = b.average ?? Number.MAX_SAFE_INTEGER;
      if (avgA !== avgB) return avgA - avgB;
      const singleA = a.single ?? Number.MAX_SAFE_INTEGER;
      const singleB = b.single ?? Number.MAX_SAFE_INTEGER;
      return singleA - singleB;
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sortedRecords;
    return sortedRecords.filter((record) => {
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.cckId.toLowerCase().includes(keyword)
      );
    });
  }, [search, sortedRecords]);

  if (loading) {
    return <div className="round-page">로딩중...</div>;
  }

  if (error) {
    return <div className="round-page">{error}</div>;
  }

  if (!round) {
    return <div className="round-page">라운드 정보를 불러올 수 없습니다.</div>;
  }

  const backTarget = compIdx ?? String(round.compIdx);

  return (
    <div className="main-page">
      <div className="comp-header">
        <RoundHeader
          title={round.roundName}
          eventName={round.cubeEventName}
          subtitle={round.compName}
          eventStart={round.eventStart}
          eventEnd={round.eventEnd}
          compIdx={Number(backTarget)}
          roundIdx={Number(round.idx)}
        />
      </div>

      <section className="round-panel">
        <div className="round-panel-top">
          <label className="round-search">
            <span className="round-search-icon" aria-hidden="true">
              <img src="/icon/input/search.svg" alt="" aria-hidden="true" />
            </span>
            <input
              type="search"
              placeholder="이름 또는 CCK ID로 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <RecordTable
          records={filteredRecords}
          emptyMessage={records.length === 0 ? "아직 기록이 없습니다." : "검색 결과가 없습니다."}
          advanceCount={round.advance}
          formatTimeValue={formatTimeValue}
          getAttemptValue={getAttemptValue}
          onSelect={(record, rank) => setSelectedRecord({ record, rank })}
        />
      </section>

      <RecordDetailModal
        selected={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        formatTimeValue={formatTimeValue}
        getAttemptValue={getAttemptValue}
      />
    </div>
  );
};
