import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCompetition, type CompetitionCreateDTO } from "@/features/competition";
import { getCubeEventList } from "@/entities/cubeEvent";
import type { CubeEvent } from "@/entities/cubeEvent";
import { CompetitionFormFields, type CompetitionFormShape } from "../shared/CompetitionFormFields";
import { CompetitionCreateHeader } from "./components/CompetitionCreateHeader";
import {
  RoundManagementSection,
  type NewRoundForm,
} from "../shared/RoundManagementSection";
import { createRound } from "@/features/round";
import type { RoundCreateDTO } from "@/features/round";

export const CompetitionCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventOptions, setEventOptions] = useState<CubeEvent[]>([]);
  const [newRounds, setNewRounds] = useState<NewRoundForm[]>([]);
  const [section, setSection] = useState<"competition" | "round">("competition");
  const navigate = useNavigate();

  const [form, setForm] = useState<CompetitionFormShape>({
    compName: "",
    compDateStart: "",
    compDateEnd: "",
    joinDateStart: "",
    joinDateEnd: "",
    location: "",
    maxParticipate: 0,
    baseFee: 0,
    eventFeeList: [{ eventName: "", eventFee: 0 }],
  });

  const addSeconds = (value: string) => (value ? `${value}:00` : "");
  const noop = () => {};

  const parseDateInput = (value: string): Date | null => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const parseDateTimeInput = (value: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const getDayStart = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  const getDayEnd = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return "알 수 없는 에러";
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      try {
        const data = await getCubeEventList();
        if (mounted) setEventOptions(data);
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err));
        }
      }
    };

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!form.compName || !form.compDateStart || !form.compDateEnd) {
      setError("대회명과 대회 기간을 입력해주세요.");
      return;
    }

    const compStart = parseDateInput(form.compDateStart);
    const compEnd = parseDateInput(form.compDateEnd);
    if (!compStart || !compEnd) {
      setError("대회 날짜 형식이 올바르지 않습니다.");
      return;
    }
    if (compEnd < compStart) {
      setError("대회 종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    if (form.joinDateStart && form.joinDateEnd) {
      const joinStart = parseDateTimeInput(form.joinDateStart);
      const joinEnd = parseDateTimeInput(form.joinDateEnd);
      if (!joinStart || !joinEnd) {
        setError("참가 신청 날짜 형식이 올바르지 않습니다.");
        return;
      }
      if (joinEnd < joinStart) {
        setError("참가 신청 마감일은 시작일보다 빠를 수 없습니다.");
        return;
      }
    }

    const compRangeStart = getDayStart(compStart);
    const compRangeEnd = getDayEnd(compEnd);
    const invalidOrderRounds = newRounds.filter((round) => {
      if (!round.eventStart || !round.eventEnd) return true;
      const eventStart = parseDateTimeInput(round.eventStart);
      const eventEnd = parseDateTimeInput(round.eventEnd);
      if (!eventStart || !eventEnd) return true;
      return eventEnd < eventStart;
    });
    if (invalidOrderRounds.length > 0) {
      setError("라운드 종료 시간은 시작 시간보다 빠를 수 없습니다.");
      return;
    }

    const outOfRangeRounds = newRounds.filter((round) => {
      const eventStart = parseDateTimeInput(round.eventStart);
      const eventEnd = parseDateTimeInput(round.eventEnd);
      if (!eventStart || !eventEnd) return true;
      return eventStart < compRangeStart || eventEnd > compRangeEnd;
    });
    if (outOfRangeRounds.length > 0) {
      setError("대회 기간 밖의 라운드가 있어 저장할 수 없습니다.");
      return;
    }

    const payload: CompetitionCreateDTO = {
      ...form,
      joinDateStart: addSeconds(form.joinDateStart),
      joinDateEnd: addSeconds(form.joinDateEnd),
    };

    setLoading(true);
    setError(null);
    try {
      const created = await createCompetition(payload);
      const compId = created?.idx;
      if (!compId) {
        throw new Error("대회 생성 결과에서 ID를 찾을 수 없습니다.");
      }
      if (newRounds.length > 0) {
        const roundPayload: RoundCreateDTO[] = newRounds.map((round) => ({
          comp: compId,
          cubeEvent: round.cubeEvent,
          roundName: round.roundName,
          eventStart: addSeconds(round.eventStart),
          eventEnd: addSeconds(round.eventEnd),
          groupList: round.groupList
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          cutoff: round.cutoff || undefined,
          timeLimit: round.timeLimit || undefined,
          advance: round.advance || undefined,
        }));
        await createRound(roundPayload);
      }
      navigate(`/admin/competition/${compId}`, {
        state: { notice: "대회가 생성되었습니다!" },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {error && (
        <div className="dashboard-test-status dashboard-test-status--error">
          <img className="status-icon" src="/icon/info/error.svg" alt="" aria-hidden="true" />
          {error}
        </div>
      )}
      {loading && <div className="dashboard-test-status">로딩 중...</div>}

      <CompetitionCreateHeader />

      <div className="round-day-tabs">
        <button
          className={`round-day-tab ${section === "competition" ? "active" : ""}`.trim()}
          type="button"
          onClick={() => setSection("competition")}
        >
          <span className="round-day-tab-label">대회 정보 입력</span>
        </button>
        <button
          className={`round-day-tab ${section === "round" ? "active" : ""}`.trim()}
          type="button"
          onClick={() => setSection("round")}
        >
          <span className="round-day-tab-label">라운드 생성</span>
        </button>
      </div>

      {section === "competition" ? (
        <CompetitionFormFields
          form={form}
          eventOptions={eventOptions}
          onChange={setForm}
          showCopyButtons
        />
      ) : null}

      {section === "round" ? (
        <RoundManagementSection
          rounds={[]}
          newRounds={newRounds}
          eventOptions={eventOptions}
          onRoundsChange={noop}
          onNewRoundsChange={setNewRounds}
          onRoundSave={noop}
          onRoundCreate={noop}
          onRoundDelete={noop}
          saving={loading}
          title="라운드 생성"
          showExisting={false}
          showSaveButton={false}
          showCreateButton={false}
        />
      ) : null}

      <div className="dashboard-test-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--primary"
        >
          대회 만들기
        </button>
      </div>
    </div>
  );
};
