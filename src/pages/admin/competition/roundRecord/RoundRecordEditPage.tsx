import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getRound } from "@/entities/round";
import { getRecordList } from "@/entities/record";
import { updateRecord } from "@/features/record";
import type { Round } from "@/entities/round";
import type { Record } from "@/entities/record";
import { RoundHeader } from "@/pages/round/components/RoundHeader";
import { RecordEditPanel } from "./components/RecordEditPanel";
import { RecordTablePanel } from "./components/RecordTablePanel";
import {
  formatTimeInput,
  formatTimeValue,
  normalizeAttemptInput,
  parseTimeInput,
} from "./utils/recordTime";

const getAttemptValue = (attempts: Record["attempts"], attemptTry: number) => {
  const attempt = attempts?.find((item) => item.attemptTry === attemptTry);
  return attempt ? formatTimeValue(attempt.time) : "-";
};

const getAttemptTime = (record: Record, attemptTry: number) => {
  const attempt = record.attempts.find((item) => item.attemptTry === attemptTry);
  return attempt?.time;
};

export const RoundRecordEditPage = () => {
  const { compIdx, roundIdx } = useParams();
  const [round, setRound] = useState<Round | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameQuery, setNameQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [attemptInputs, setAttemptInputs] = useState<string[]>(Array.from({ length: 5 }, () => ""));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<string | null>(null);

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
        console.error("라운드 기록 조회 실패:", fetchError);
        if (mounted) setError("기록 정보를 불러올 수 없습니다.");
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

  const searchResults = useMemo(() => {
    const keyword = nameQuery.trim().toLowerCase();
    if (!keyword) return [];
    return sortedRecords.filter((record) => {
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.cckId.toLowerCase().includes(keyword)
      );
    }).slice(0, 8);
  }, [nameQuery, sortedRecords]);

  const applyRecordSelection = (record: Record) => {
    setSelectedRecord(record);
    setNameQuery(record.name);
    setAttemptInputs(
      [1, 2, 3, 4, 5].map((attemptTry) => formatTimeInput(getAttemptTime(record, attemptTry)))
    );
    setSearchOpen(false);
    setFormError(null);
    setFormStatus(null);
  };

  const handleSave = async () => {
    if (!roundIdx || !selectedRecord) {
      setFormError("수정할 기록을 먼저 선택하세요.");
      return;
    }

    const resolvedTimes: number[] = [];
    for (let index = 0; index < attemptInputs.length; index += 1) {
      const raw = attemptInputs[index];
      const parsed = parseTimeInput(raw);
      if (parsed === null) {
        setFormError(`시도 ${index + 1} 입력값이 올바르지 않습니다.`);
        return;
      }
      if (parsed === undefined) {
        const fallback = getAttemptTime(selectedRecord, index + 1);
        resolvedTimes.push(fallback ?? -2);
      } else {
        resolvedTimes.push(parsed);
      }
    }

    setSaving(true);
    setFormError(null);
    setFormStatus(null);

    try {
      await updateRecord({ idx: selectedRecord.idx, times: resolvedTimes });
      const latestRecords = await getRecordList(Number(roundIdx));
      setRecords(latestRecords);
      const updatedRecord = latestRecords.find((record) => record.idx === selectedRecord.idx) ?? null;
      if (updatedRecord) {
        applyRecordSelection(updatedRecord);
      }
      setFormStatus("기록이 반영되었습니다.");
    } catch (saveError) {
      console.error("기록 업데이트 실패:", saveError);
      setFormError("기록 반영에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedRecord(null);
    setNameQuery("");
    setAttemptInputs(Array.from({ length: 5 }, () => ""));
    setFormError(null);
    setFormStatus(null);
  };

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
          compIdx={Number(backTarget)}
          roundIdx={Number(round.idx)}
          adminActionLabel="라운드로 돌아가기"
          adminActionPath={`/competition/${backTarget}/round/${round.idx}`}
          adminActionIcon="/icon/button/back.svg"
        />
      </div>

      <section className="round-panel round-edit-layout">
        <RecordEditPanel
          nameQuery={nameQuery}
          searchOpen={searchOpen}
          searchResults={searchResults}
          selectedRecord={selectedRecord}
          attemptInputs={attemptInputs}
          saving={saving}
          formError={formError}
          formStatus={formStatus}
          formatTimeValue={formatTimeValue}
          onNameChange={(value) => {
            setNameQuery(value);
            setSearchOpen(true);
          }}
          onNameFocus={() => setSearchOpen(true)}
          onNameBlur={() => {
            window.setTimeout(() => setSearchOpen(false), 120);
          }}
          onSelectRecord={applyRecordSelection}
          onAttemptChange={(index, value) => {
            const next = [...attemptInputs];
            next[index] = normalizeAttemptInput(value);
            setAttemptInputs(next);
          }}
          onReset={handleReset}
          onSave={handleSave}
        />

        <RecordTablePanel
          records={sortedRecords}
          emptyMessage={records.length === 0 ? "아직 기록이 없습니다." : "검색 결과가 없습니다."}
          advanceCount={round.advance}
          formatTimeValue={formatTimeValue}
          getAttemptValue={getAttemptValue}
          onSelect={applyRecordSelection}
          selectedRecordIdx={selectedRecord?.idx}
        />
      </section>
    </div>
  );
};
