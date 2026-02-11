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
      <CompetitionCreateHeader />

      {error && <div className="dashboard-test-status dashboard-test-status--error">에러: {error}</div>}
      {loading && <div className="dashboard-test-status">로딩 중...</div>}

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
