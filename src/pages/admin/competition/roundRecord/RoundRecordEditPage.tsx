import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getRound, getRoundByDayCount } from "@/entities/round";
import { getCompetition } from "@/entities/competition";
import { getRecordList } from "@/entities/record";
import { addExtra, updateRecord } from "@/features/record";
import type { Round } from "@/entities/round";
import type { Record } from "@/entities/record";
import { RoundRecordHeader } from "./components/RoundRecordHeader";
import { ExtraAddModal } from "./components/ExtraAddModal";
import { RecordContextMenu } from "./components/RecordContextMenu";
import { RecordEditPanel } from "./components/RecordEditPanel";
import { RecordTablePanel } from "./components/RecordTablePanel";
import { RoundManagementPanel } from "./components/RoundManagementPanel";
import {
  formatTimeInput,
  formatTimeValue,
  normalizeAttemptInput,
  parseTimeInput,
} from "./utils/recordTime";

type ExtraFormState = {
  recordIdx: number | null;
  extraNum: number;
  extraTry: number;
  extraReason: string;
};

type DayItem = {
  dayCount: number;
  date: Date;
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

const getAttemptValue = (attempts: Record["attempts"], attemptTry: number) => {
  const attempt = attempts?.find((item) => item.attemptTry === attemptTry);
  return attempt ? formatTimeValue(attempt.time) : "-";
};

const getAttemptTime = (record: Record, attemptTry: number) => {
  const attempt = record.attempts.find((item) => item.attemptTry === attemptTry);
  return attempt?.time;
};

const getBaseAttemptTries = (record: Record): number[] => {
  const tries = Array.from(
    new Set(
      record.attempts
        .filter((attempt) => typeof attempt.extra !== "number")
        .map((attempt) => attempt.attemptTry)
    )
  ).sort((a, b) => a - b);

  if (tries.length > 0) {
    return tries;
  }

  return [1, 2, 3, 4, 5];
};

const normalizeTimeValue = (value: number) => {
  if (value < 0) return value;
  return Math.round(value * 100) / 100;
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "기록 반영에 실패했습니다.";
};

const isSameTimeValue = (actual: number | undefined, expected: number | null) => {
  if (expected === null) {
    return actual === undefined;
  }
  if (actual === undefined) {
    return false;
  }
  if (actual < 0 || expected < 0) {
    return actual === expected;
  }
  return Math.abs(actual - expected) < 0.005;
};

export const RoundRecordEditPage = () => {
  const { compIdx, roundIdx } = useParams();
  const [round, setRound] = useState<Round | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [roundOptions, setRoundOptions] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameQuery, setNameQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [attemptTries, setAttemptTries] = useState<number[]>([1, 2, 3, 4, 5]);
  const [attemptInputs, setAttemptInputs] = useState<string[]>(Array.from({ length: 5 }, () => ""));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    open: boolean;
    position: { x: number; y: number } | null;
    record: Record | null;
  }>({ open: false, position: null, record: null });
  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [extraSearchQuery, setExtraSearchQuery] = useState("");
  const [extraForm, setExtraForm] = useState<ExtraFormState>({
    recordIdx: null,
    extraNum: 1,
    extraTry: 1,
    extraReason: "",
  });
  const [extraSaving, setExtraSaving] = useState(false);
  const [extraError, setExtraError] = useState<string | null>(null);

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
        const roundData = await getRound(Number(roundIdx));
        const [recordData, competition] = await Promise.all([
          getRecordList(Number(roundIdx)),
          getCompetition(roundData.compIdx),
        ]);
        if (!mounted) return;
        setRound(roundData);
        setRecords(recordData);
        try {
          const dayItems = getDayRange(competition.compDateStart, competition.compDateEnd);
          const dayResults = await Promise.all(
            dayItems.map((item) =>
              getRoundByDayCount(roundData.compIdx, item.dayCount).catch(() => ({
                past: [],
                now: [],
                future: [],
              }))
            )
          );
          const dayMerged = dayResults.flatMap((item) => [...item.past, ...item.now, ...item.future]);
          const daySeen = new Set<number>();
          const dayUnique = dayMerged.filter((item) => {
            if (daySeen.has(item.idx)) return false;
            daySeen.add(item.idx);
            return true;
          });
          setRoundOptions(dayUnique);
        } catch (roundListError) {
          console.error("라운드 목록 추가 조회 실패:", roundListError);
          setRoundOptions([]);
        }
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

  const extraSearchResults = useMemo(() => {
    const keyword = extraSearchQuery.trim().toLowerCase();
    if (!keyword) return [];
    return sortedRecords.filter((record) => {
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.cckId.toLowerCase().includes(keyword)
      );
    }).slice(0, 8);
  }, [extraSearchQuery, sortedRecords]);

  const extraAttempts = useMemo(() => {
    if (!selectedRecord) return [];
    return selectedRecord.attempts.filter((attempt) => typeof attempt.extra === "number");
  }, [selectedRecord]);

  const applyRecordSelection = (record: Record) => {
    const baseAttemptTries = getBaseAttemptTries(record);
    setSelectedRecord(record);
    setNameQuery(record.name);
    setAttemptTries(baseAttemptTries);
    setAttemptInputs(baseAttemptTries.map((attemptTry) => formatTimeInput(getAttemptTime(record, attemptTry))));
    setSearchOpen(false);
    setFormError(null);
    setFormStatus(null);
  };

  const openExtraModal = (record: Record) => {
    setExtraModalOpen(true);
    setExtraSearchQuery(record.name);
    setExtraForm((prev) => ({
      ...prev,
      recordIdx: record.idx,
    }));
    setExtraError(null);
  };

  const refreshRecords = async () => {
    if (!roundIdx) return [];
    const latestRecords = await getRecordList(Number(roundIdx));
    setRecords(latestRecords);
    return latestRecords;
  };

  const handleSave = async () => {
    if (!roundIdx || !selectedRecord) {
      setFormError("수정할 기록을 먼저 선택하세요.");
      return;
    }

    const resolvedTimes: Array<number | null> = [];
    for (let index = 0; index < attemptTries.length; index += 1) {
      const raw = attemptInputs[index];
      const parsed = parseTimeInput(raw);
      const attemptTry = attemptTries[index];
      if (parsed === null) {
        setFormError(`시도 ${attemptTry} 입력값이 올바르지 않습니다.`);
        return;
      }
      if (parsed === undefined) {
        resolvedTimes.push(null);
      } else {
        resolvedTimes.push(normalizeTimeValue(parsed));
      }
    }

    setSaving(true);
    setFormError(null);
    setFormStatus(null);

    try {
      const requestRecordIdx = selectedRecord.attempts[0]?.recordIdx ?? selectedRecord.idx;
      await updateRecord({ recordIdx: requestRecordIdx, times: resolvedTimes });
      const latestRecords = await refreshRecords();
      const updatedRecord = latestRecords.find((record) => record.idx === selectedRecord.idx) ?? null;
      const isApplied =
        !!updatedRecord &&
        attemptTries.every((attemptTry, index) =>
          isSameTimeValue(getAttemptTime(updatedRecord, attemptTry), resolvedTimes[index])
        );

      if (!isApplied) {
        throw new Error("요청은 성공했지만 기록이 실제로 변경되지 않았습니다. record idx를 다시 확인해주세요.");
      }

      if (updatedRecord) {
        applyRecordSelection(updatedRecord);
      }
      setFormStatus("기록이 반영되었습니다.");
    } catch (saveError) {
      console.error("기록 업데이트 실패:", saveError);
      setFormError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedRecord(null);
    setAttemptTries([1, 2, 3, 4, 5]);
    setNameQuery("");
    setAttemptInputs(Array.from({ length: 5 }, () => ""));
    setFormError(null);
    setFormStatus(null);
  };

  const handleExtraSubmit = async () => {
    if (!extraForm.recordIdx) {
      setExtraError("선수를 선택하세요.");
      return;
    }
    if (!extraForm.extraReason.trim()) {
      setExtraError("엑스트라 사유를 입력하세요.");
      return;
    }

    setExtraSaving(true);
    setExtraError(null);

    try {
      await addExtra({
        recordIdx: extraForm.recordIdx,
        extraNum: extraForm.extraNum,
        extraTry: extraForm.extraTry,
        extraReason: extraForm.extraReason.trim(),
      });
      const latestRecords = await refreshRecords();
      const updatedRecord = latestRecords.find((record) => record.idx === extraForm.recordIdx) ?? null;
      if (updatedRecord) {
        applyRecordSelection(updatedRecord);
      }
      setExtraModalOpen(false);
      setExtraForm((prev) => ({ ...prev, extraReason: "" }));
    } catch (saveError) {
      console.error("엑스트라 추가 실패:", saveError);
      setExtraError("엑스트라 추가에 실패했습니다.");
    } finally {
      setExtraSaving(false);
    }
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
        <RoundRecordHeader
          title={round.roundName}
          eventName={round.cubeEventName}
          subtitle={round.compName}
          compIdx={Number(backTarget)}
          roundIdx={Number(round.idx)}
        />
      </div>

      <section className="round-panel round-edit-layout">
        <RecordEditPanel
          nameQuery={nameQuery}
          searchOpen={searchOpen}
          searchResults={searchResults}
          selectedRecord={selectedRecord}
          attemptTries={attemptTries}
          attemptInputs={attemptInputs}
          extraAttempts={extraAttempts}
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
          onOpenExtra={() => {
            if (selectedRecord) {
              openExtraModal(selectedRecord);
            } else {
              setExtraModalOpen(true);
            }
          }}
        />

        <RecordTablePanel
          records={sortedRecords}
          emptyMessage={records.length === 0 ? "아직 기록이 없습니다." : "검색 결과가 없습니다."}
          advanceCount={round.advance}
          formatTimeValue={formatTimeValue}
          getAttemptValue={getAttemptValue}
          onSelect={applyRecordSelection}
          selectedRecordIdx={selectedRecord?.idx}
          onContextMenu={(record, _rank, position) => {
            setContextMenu({ open: true, position, record });
          }}
        />
      </section>

      <section className="round-panel">
        <RoundManagementPanel
          round={round}
          records={records}
          rounds={roundOptions}
          onRecordsRefresh={async () => {
            await refreshRecords();
          }}
          onAdvanceUpdated={(advance) => {
            setRound((prev) => (prev ? { ...prev, advance } : prev));
          }}
        />
      </section>

      <RecordContextMenu
        open={contextMenu.open}
        position={contextMenu.position}
        onClose={() => setContextMenu({ open: false, position: null, record: null })}
        onEdit={() => {
          if (contextMenu.record) {
            applyRecordSelection(contextMenu.record);
          }
          setContextMenu({ open: false, position: null, record: null });
        }}
        onExtra={() => {
          if (contextMenu.record) {
            openExtraModal(contextMenu.record);
          }
          setContextMenu({ open: false, position: null, record: null });
        }}
      />

      <ExtraAddModal
        open={extraModalOpen}
        records={records}
        searchQuery={extraSearchQuery}
        searchResults={extraSearchResults}
        selectedRecord={records.find((record) => record.idx === extraForm.recordIdx) ?? null}
        form={extraForm}
        saving={extraSaving}
        error={extraError}
        onSearchChange={(value) => setExtraSearchQuery(value)}
        onSelectRecord={(record) => {
          setExtraForm((prev) => ({ ...prev, recordIdx: record.idx }));
          setExtraSearchQuery(record.name);
        }}
        onFormChange={(next) => setExtraForm(next)}
        onClose={() => setExtraModalOpen(false)}
        onSubmit={handleExtraSubmit}
      />
    </div>
  );
};
