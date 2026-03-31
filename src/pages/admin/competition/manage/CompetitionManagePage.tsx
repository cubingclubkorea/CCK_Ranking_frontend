import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OverlayToast, PageHeader } from "@/widgets";
import { getCompetition } from "@/entities/competition";
import type { Competition } from "@/entities/competition";
import { getRoundByDayCount, getRoundGroups } from "@/entities/round";
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

const pad2 = (value: number) => `${value}`.padStart(2, "0");

const isValidDate = (value?: Date | null): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

const formatDateInput = (date?: Date | null) => {
  if (!isValidDate(date)) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const formatDateTimeInput = (date?: Date | null) => {
  if (!isValidDate(date)) return "";
  return `${formatDateInput(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

const withSeconds = (value: string) => (value ? `${value}:00` : "");

const parseGroupList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const mapRoundToForm = (round: Round, groups: string[]): RoundForm => ({
  idx: round.idx,
  cubeEvent: round.cubeEventName,
  roundName: round.roundName,
  eventStart: formatDateTimeInput(round.eventStart),
  eventEnd: formatDateTimeInput(round.eventEnd),
  groupList: groups.join(", "),
  cutoff: round.cutoff,
  timeLimit: round.timeLimit,
  advance: round.advance,
});

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
  if (!err) return "알 수 없는 오류가 발생했습니다.";
  if (typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return "알 수 없는 오류가 발생했습니다.";
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
  const [deletedRoundIds, setDeletedRoundIds] = useState<number[]>([]);
  const [eventOptions, setEventOptions] = useState<CubeEvent[]>([]);
  const [roundLoading, setRoundLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roundSaving, setRoundSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [section, setSection] = useState<"competition" | "round">("competition");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const scrollToTop = () => {
    const scrollContainer = document.querySelector<HTMLElement>(".content-area");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!competitionId) return;
    let mounted = true;

    const fetchCompetition = async () => {
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
      const mergedRounds = dayResults.flatMap((day) => [...day.past, ...day.now, ...day.future]);
      const uniqueRounds = mergedRounds.filter((round, index, list) => {
        return list.findIndex((item) => item.idx === round.idx) === index;
      });
      const roundList = uniqueRounds.sort((a, b) => a.eventStart.getTime() - b.eventStart.getTime());
      const roundGroups = await Promise.all(
        roundList.map(async (round) => {
          try {
            const groups = await getRoundGroups(round.idx);
            return [round.idx, groups] as const;
          } catch {
            return [round.idx, [] as string[]] as const;
          }
        })
      );
      const roundGroupMap = new Map<number, string[]>(roundGroups);

      setRounds(roundList.map((round) => mapRoundToForm(round, roundGroupMap.get(round.idx) ?? [])));
      setNewRounds([]);
      setDeletedRoundIds([]);
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
    scrollToTop();
    if (!form || !competition) return;
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
    scrollToTop();
    if (!rounds.length && !newRounds.length && !deletedRoundIds.length) return;

    const compStartDate =
      parseDateInput(form?.compDateStart ?? "") ??
      (competition ? getDayStart(competition.compDateStart) : null);
    const compEndDate =
      parseDateInput(form?.compDateEnd ?? "") ??
      (competition ? getDayEnd(competition.compDateEnd) : null);

    if (!compStartDate || !compEndDate) {
      setRoundError("대회 날짜 정보가 없어 라운드를 저장할 수 없습니다.");
      return;
    }

    const compRangeStart = getDayStart(compStartDate);
    const compRangeEnd = getDayEnd(compEndDate);
    const allRounds = [...rounds, ...newRounds];
    const invalidOrderRounds = allRounds.filter((round) => {
      if (!round.eventStart || !round.eventEnd) return true;
      const eventStart = parseDateTimeInput(round.eventStart);
      const eventEnd = parseDateTimeInput(round.eventEnd);
      if (!eventStart || !eventEnd) return true;
      return eventEnd < eventStart;
    });

    if (invalidOrderRounds.length > 0) {
      const names = invalidOrderRounds
        .slice(0, 3)
        .map((round) => `${round.cubeEvent} ${round.roundName}`.trim() || "이름 없는 라운드");
      const suffix = invalidOrderRounds.length > 3 ? " 외 추가 라운드" : "";
      setRoundError(
        `라운드 종료 시간은 시작 시간보다 빠를 수 없습니다: ${names.join(", ")}${suffix}`
      );
      return;
    }

    const invalidRounds = allRounds.filter((round) => {
      const eventStart = parseDateTimeInput(round.eventStart);
      const eventEnd = parseDateTimeInput(round.eventEnd);
      if (!eventStart || !eventEnd) return true;
      return eventStart < compRangeStart || eventEnd > compRangeEnd;
    });

    if (invalidRounds.length > 0) {
      const names = invalidRounds
        .slice(0, 3)
        .map((round) => `${round.cubeEvent} ${round.roundName}`.trim() || "이름 없는 라운드");
      const suffix = invalidRounds.length > 3 ? " 외 추가 라운드" : "";
      setRoundError(
        `대회 기간(${formatDateInput(compRangeStart)} ~ ${formatDateInput(compRangeEnd)}) 밖의 라운드가 있어 저장할 수 없습니다: ${names.join(", ")}${suffix}`
      );
      return;
    }

    setRoundSaving(true);
    setRoundError(null);
    setNotice(null);

    try {
      if (rounds.length > 0) {
        const updatePayload: RoundUpdateDTO[] = rounds.map((round) => ({
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
        await updateRound(updatePayload);
      }

      if (newRounds.length > 0) {
        const createPayload: RoundCreateDTO[] = newRounds.map((round) => ({
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
        await createRound(createPayload);
      }

      if (deletedRoundIds.length > 0) {
        await Promise.all(deletedRoundIds.map((roundIdx) => deleteRound(roundIdx)));
      }

      await fetchAllRounds();

      const messages: string[] = [];
      if (rounds.length > 0) messages.push("라운드 수정");
      if (newRounds.length > 0) messages.push("라운드 추가");
      if (deletedRoundIds.length > 0) messages.push("라운드 삭제");
      setNotice(messages.length > 0 ? `변경 사항이 저장되었습니다. (${messages.join(", ")})` : "라운드 정보가 저장되었습니다.");
    } catch (err) {
      setRoundError(getErrorMessage(err));
    } finally {
      setRoundSaving(false);
    }
  };

  const handleRoundDelete = async (roundIdx: number) => {
    const confirmed = window.confirm("정말로 이 라운드를 삭제할까요?");
    if (!confirmed) return;
    setRoundError(null);
    setNotice(null);
    setDeletedRoundIds((prev) => (prev.includes(roundIdx) ? prev : [...prev, roundIdx]));
    setRounds((prev) => prev.filter((round) => round.idx !== roundIdx));
    setNotice("라운드가 목록에서 제거되었습니다. 저장하면 삭제가 반영됩니다.");
  };

  const openDeleteConfirmModal = () => {
    if (!competition) return;
    setDeleteConfirmInput("");
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    if (saving) return;
    setDeleteConfirmOpen(false);
    setDeleteConfirmInput("");
  };

  const handleDeleteCompetition = async () => {
    if (!competition) return;
    if (deleteConfirmInput !== competition.compName) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await deleteCompetition(competition.idx);
      setDeleteConfirmOpen(false);
      setDeleteConfirmInput("");
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
        <OverlayToast
          open={true}
          variant="error"
          message="잘못된 대회 ID입니다."
          onClose={() => navigate("/admin/competition")}
        />
      </div>
    );
  }

  const toast = section === "round" && roundError
    ? { variant: "error" as const, message: roundError, onClose: () => setRoundError(null) }
    : error
      ? { variant: "error" as const, message: error, onClose: () => setError(null) }
        : notice
          ? { variant: "success" as const, message: notice, onClose: () => setNotice(null) }
          : null;
  const isDeleteNameMatched = !!competition && deleteConfirmInput === competition.compName;


  return (
    <div className="admin-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ""}
        onClose={toast?.onClose}
      />

      <PageHeader
        containerClassName="admin-header"
        iconSrc="/icon/button/hammer.svg"
        title={competition?.compName ?? "대회 편집"}
        subtitle="대회 편집"
        actions={[
          {
            label: "대회 목록",
            iconSrc: "/icon/button/back.svg",
            to: "/admin/competition",
          },
          {
            label: "대회 페이지 보기",
            iconSrc: "/icon/button/home.svg",
            onClick: competition ? () => navigate(`/competition/${competition.idx}`) : undefined,
            disabled: !competition,
          },
        ]}
      />

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
            onRoundDelete={handleRoundDelete}
            saving={roundSaving || roundLoading}
            title="라운드 편집"
          />
        </>
      ) : null}

      <div className="competition-manage-footer">
        <div className="competition-manage-footer-left">
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
            disabled={
              saving ||
              roundSaving ||
              (section === "round" &&
                rounds.length === 0 &&
                newRounds.length === 0 &&
                deletedRoundIds.length === 0)
            }
          >
            <img className="competition-manage-action-icon" src="/icon/button/save.svg" alt="" aria-hidden="true" />
            저장
          </button>
        </div>
        <div className="competition-manage-footer-right">
          <button
            type="button"
            className="competition-manage-action-btn competition-manage-action-btn--danger"
            onClick={openDeleteConfirmModal}
            disabled={saving || roundSaving}
          >
            <img className="competition-manage-action-icon" src="/icon/button/delete.svg" alt="" aria-hidden="true" />
            대회 삭제
          </button>
        </div>
      </div>

      {deleteConfirmOpen && competition ? (
        <div className="record-modal-backdrop" onClick={closeDeleteConfirmModal}>
          <div
            className="record-modal record-extra-modal competition-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="competition-delete-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="record-modal-header">
              <div id="competition-delete-confirm-title" className="record-modal-title">대회 삭제 확인</div>
              <button
                type="button"
                className="record-modal-close"
                onClick={closeDeleteConfirmModal}
                aria-label="닫기"
                disabled={saving}
              >
                <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
              </button>
            </div>

            <form
              className="record-modal-body"
              onSubmit={(event) => {
                event.preventDefault();
                void handleDeleteCompetition();
              }}
            >
              <p className="competition-delete-modal-desc">
                대회를 삭제하려면 아래 입력칸에 대회명을 정확히 입력하세요.
              </p>
              <p className="competition-delete-modal-target">
                입력 대상: <strong>{competition.compName}</strong>
              </p>
              <div className="dashboard-test-status dashboard-test-status--error">
                이 작업은 되돌릴 수 없습니다.
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">
                  대회명 확인 입력
                  <input
                    type="text"
                    className="dashboard-test-input"
                    value={deleteConfirmInput}
                    onChange={(event) => setDeleteConfirmInput(event.target.value)}
                    placeholder="대회명을 그대로 입력"
                    autoFocus
                    disabled={saving}
                  />
                </label>
              </div>
              <div className="dashboard-test-actions">
                <button
                  type="button"
                  className="dashboard-test-button"
                  onClick={closeDeleteConfirmModal}
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="dashboard-test-button dashboard-test-button--danger"
                  disabled={!isDeleteNameMatched || saving}
                >
                  {saving ? "삭제 중..." : "대회 삭제"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};
