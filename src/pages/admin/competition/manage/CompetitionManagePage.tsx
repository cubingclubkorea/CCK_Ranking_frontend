import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCompetition } from "@/entities/competition";
import type { Competition } from "@/entities/competition";
import { getRoundByDayCount } from "@/entities/round";
import type { Round } from "@/entities/round";
import { getCubeEventList } from "@/entities/cubeEvent";
import type { CubeEvent } from "@/entities/cubeEvent";
import {
  updateCompetition,
  deleteCompetition,
  type CompetitionUpdateDTO,
} from "@/features/competition";
import { createRound, updateRound, deleteRound } from "@/features/round";
import type { RoundCreateDTO, RoundUpdateDTO } from "@/features/round";
import {
  CompetitionFormFields,
  type CompetitionFormShape,
} from "../shared/CompetitionFormFields";
import {
  RoundManagementSection,
  type NewRoundForm,
  type RoundForm,
} from "../shared/RoundManagementSection";
import { CompetitionManageHeader } from "./components/CompetitionManageHeader";

const pad2 = (value: number) => `${value}`.padStart(2, "0");

const isValidDate = (value?: Date | null) =>
  value instanceof Date && !Number.isNaN(value.getTime());

const formatDateInput = (date?: Date | null) =>
  isValidDate(date)
    ? `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
    : "";

const formatDateTimeInput = (date?: Date | null) =>
  isValidDate(date)
    ? `${formatDateInput(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
    : "";

const withSeconds = (value: string) => (value ? `${value}:00` : "");

const parseGroupList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const mapRoundToForm = (round: Round): RoundForm => ({
  idx: round.idx,
  cubeEvent: round.cubeEventName,
  roundName: round.roundName,
  eventStart: formatDateTimeInput(round.eventStart),
  eventEnd: formatDateTimeInput(round.eventEnd),
  groupList: round.roundGroupList?.join(", ") ?? "",
  cutoff: round.cutoff,
  timeLimit: round.timeLimit,
  advance: round.advance,
});

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (!err) return "알 수 없는 에러";
  if (typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return "알 수 없는 에러";
  }
};

export const CompetitionManagePage = () => {
  const { compIdx } = useParams();
  const navigate = useNavigate();
  const competitionId = useMemo(() => Number(compIdx), [compIdx]);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [form, setForm] = useState<CompetitionFormShape | null>(null);
  const [rounds, setRounds] = useState<RoundForm[]>([]);
  const [newRounds, setNewRounds] = useState<NewRoundForm[]>([]);
  const [eventOptions, setEventOptions] = useState<CubeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [roundLoading, setRoundLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roundSaving, setRoundSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [section, setSection] = useState<"competition" | "round">("competition");

  useEffect(() => {
    if (!competitionId) return;
    let mounted = true;

    const fetchCompetition = async () => {
      setLoading(true);
      setError(null);
      try {
        const competitionData = await getCompetition(competitionId);
        if (!mounted) return;
        setCompetition(competitionData);
        setForm({
          compName: competitionData.compName ?? "",
          compDateStart: formatDateInput(competitionData.compDateStart),
          compDateEnd: formatDateInput(competitionData.compDateEnd),
          joinDateStart: formatDateTimeInput(competitionData.joinDateStart),
          joinDateEnd: formatDateTimeInput(competitionData.joinDateEnd),
          location: competitionData.location ?? "",
          maxParticipate: competitionData.maxParticipate ?? 0,
          baseFee: competitionData.baseFee ?? 0,
          eventFeeList: competitionData.eventFeeList?.length
            ? competitionData.eventFeeList.map((eventFee) => ({
                eventName: eventFee.eventName,
                eventFee: eventFee.eventFee,
              }))
            : [{ eventName: "", eventFee: 0 }],
        });
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const events = await getCubeEventList();
        if (mounted) setEventOptions(events);
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      }
    };

    fetchCompetition();
    fetchEvents();

    return () => {
      mounted = false;
    };
  }, [competitionId]);

  const fetchAllRounds = async () => {
    if (!competitionId || !competition) return;
    setRoundLoading(true);
    setRoundError(null);
    try {
      const start = new Date(
        competition.compDateStart.getFullYear(),
        competition.compDateStart.getMonth(),
        competition.compDateStart.getDate()
      );
      const end = new Date(
        competition.compDateEnd.getFullYear(),
        competition.compDateEnd.getMonth(),
        competition.compDateEnd.getDate()
      );
      const dayCount = Math.max(
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        1
      );

      const dayRequests = Array.from({ length: dayCount }, (_, index) =>
        getRoundByDayCount(competitionId, index)
      );
      const dayResults = await Promise.all(dayRequests);
      const roundList = dayResults
        .flatMap((day) => [...day.past, ...day.now, ...day.future])
        .sort(
        (a, b) => a.eventStart.getTime() - b.eventStart.getTime()
      );
      setRounds(roundList.map(mapRoundToForm));
      setNewRounds([]);
    } catch (err) {
      setRoundError(getErrorMessage(err));
      setRounds([]);
    } finally {
      setRoundLoading(false);
    }
  };

  useEffect(() => {
    if (!competition || section !== "round") return;
    fetchAllRounds();
  }, [competition?.idx, section]);

  const handleCompetitionSave = async () => {
    if (!form || !competition) return;
    if (!form.compName || !form.compDateStart || !form.compDateEnd) {
      setError("대회명과 대회 기간을 입력해주세요.");
      return;
    }

    const payload: CompetitionUpdateDTO = {
      idx: competition.idx,
      compName: form.compName,
      compDateStart: form.compDateStart,
      compDateEnd: form.compDateEnd,
      joinDateStart: withSeconds(form.joinDateStart),
      joinDateEnd: withSeconds(form.joinDateEnd),
      baseFee: form.baseFee,
      location: form.location,
      maxParticipate: form.maxParticipate,
      eventFeeList: form.eventFeeList?.filter((item) => item.eventName) ?? [],
    };

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await updateCompetition(payload);
      setNotice("대회 정보가 저장되었습니다.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRoundSave = async () => {
    if (!rounds.length) return;
    setRoundSaving(true);
    setRoundError(null);
    setNotice(null);

    const payload: RoundUpdateDTO[] = rounds.map((round) => ({
      idx: round.idx,
      comp: competitionId,
      cubeEvent: round.cubeEvent,
      roundName: round.roundName,
      eventStart: withSeconds(round.eventStart),
      eventEnd: withSeconds(round.eventEnd),
      groupList: parseGroupList(round.groupList),
      cutoff: round.cutoff || undefined,
      timeLimit: round.timeLimit || undefined,
      advance: round.advance || undefined,
    }));

    try {
      await updateRound(payload);
      setNotice("라운드 정보가 저장되었습니다.");
    } catch (err) {
      setRoundError(getErrorMessage(err));
    } finally {
      setRoundSaving(false);
    }
  };

  const handleRoundCreate = async () => {
    if (!newRounds.length) return;
    setRoundSaving(true);
    setRoundError(null);
    setNotice(null);

    const payload: RoundCreateDTO[] = newRounds.map((round) => ({
      comp: competitionId,
      cubeEvent: round.cubeEvent,
      roundName: round.roundName,
      eventStart: withSeconds(round.eventStart),
      eventEnd: withSeconds(round.eventEnd),
      groupList: parseGroupList(round.groupList),
      cutoff: round.cutoff || undefined,
      timeLimit: round.timeLimit || undefined,
      advance: round.advance || undefined,
    }));

    try {
      await createRound(payload);
      setNotice("새 라운드가 추가되었습니다.");
      await fetchAllRounds();
    } catch (err) {
      setRoundError(getErrorMessage(err));
    } finally {
      setRoundSaving(false);
    }
  };

  const handleRoundDelete = async (roundIdx: number) => {
    const confirmed = window.confirm("정말로 이 라운드를 삭제할까요?");
    if (!confirmed) return;
    setRoundSaving(true);
    setRoundError(null);
    setNotice(null);
    try {
      await deleteRound(roundIdx);
      setRounds((prev) => prev.filter((round) => round.idx !== roundIdx));
      setNotice("라운드가 삭제되었습니다.");
    } catch (err) {
      setRoundError(getErrorMessage(err));
    } finally {
      setRoundSaving(false);
    }
  };

  const handleDeleteCompetition = async () => {
    if (!competition) return;
    const confirmed = window.confirm("정말로 이 대회를 삭제할까요?");
    if (!confirmed) return;
    setSaving(true);
    setError(null);
    try {
      await deleteCompetition(competition.idx);
      navigate("/admin/competition", { state: { notice: "대회가 삭제되었습니다." } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!competitionId || Number.isNaN(competitionId)) {
    return (
      <div className="admin-page">
        <div className="dashboard-test-status dashboard-test-status--error">
          잘못된 대회 ID입니다.
        </div>
      </div>
    );
  }


  return (
    <div className="admin-page">
      <CompetitionManageHeader
        title={competition?.compName ?? "대회 편집"}
        subtitle="대회 편집"
        iconSrc="/icon/button/hammer.svg"
        onViewCompetition={competition ? () => navigate(`/competition/${competition.idx}`) : undefined}
        saving={saving || roundSaving}
      />

      {notice && <div className="dashboard-test-status dashboard-test-status--success">✅ {notice}</div>}
      {loading && <div className="dashboard-test-status">로딩 중...</div>}
      {error && <div className="dashboard-test-status dashboard-test-status--error">에러: {error}</div>}
      {section === "round" && roundError && (
        <div className="dashboard-test-status dashboard-test-status--error">
          라운드 에러: {roundError}
        </div>
      )}

      <div className="round-day-tabs">
        <button
          className={`round-day-tab ${section === "competition" ? "active" : ""}`.trim()}
          type="button"
          onClick={() => setSection("competition")}
        >
          <span className="round-day-tab-label">대회 정보 편집</span>
        </button>
        <button
          className={`round-day-tab ${section === "round" ? "active" : ""}`.trim()}
          type="button"
          onClick={() => setSection("round")}
        >
          <span className="round-day-tab-label">라운드 편집</span>
        </button>
      </div>

      {section === "competition" && form ? (
        <>
          <div className="dashboard-test-card-header">
            <h2 className="dashboard-test-section-title">대회 정보 편집</h2>
          </div>
          <CompetitionFormFields
            form={form}
            eventOptions={eventOptions}
            onChange={setForm}
            showCopyButtons
          />
        </>
      ) : null}

      {section === "round" ? (
        <>
          <RoundManagementSection
            rounds={rounds}
            newRounds={newRounds}
            eventOptions={eventOptions}
            onRoundsChange={setRounds}
            onNewRoundsChange={setNewRounds}
            onRoundSave={handleRoundSave}
            onRoundCreate={handleRoundCreate}
            onRoundDelete={handleRoundDelete}
            saving={roundSaving || roundLoading}
            title="라운드 편집"
          />
        </>
      ) : null}

      <div className="competition-manage-footer">
        <button
          type="button"
          className="competition-manage-action-btn"
          onClick={() => {
            if (section === "competition") {
              handleCompetitionSave();
            } else {
              handleRoundSave();
            }
          }}
          disabled={saving || roundSaving || (section === "round" && rounds.length === 0)}
        >
          <img className="competition-manage-action-icon" src="/icon/button/save.svg" alt="" aria-hidden="true" />
          저장
        </button>
        <button
          type="button"
          className="competition-manage-action-btn competition-manage-action-btn--danger"
          onClick={handleDeleteCompetition}
          disabled={saving || roundSaving}
        >
          <img className="competition-manage-action-icon" src="/icon/button/delete.svg" alt="" aria-hidden="true" />
          대회 삭제
        </button>
      </div>
    </div>
  );
};
