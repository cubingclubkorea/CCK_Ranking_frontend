import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { Round } from "@/entities/round";
import type { Record } from "@/entities/record";
import { addPlayer, advancePlayer, deleteRecord } from "@/features/record";
import { updateAdvance } from "@/features/round";
import type { PlayerAddDTO } from "@/features/record";
import { OverlayToast } from "@/widgets";

type RoundManagementPanelProps = {
  round: Round;
  records: Record[];
  rounds: Round[];
  onRecordsRefresh: () => Promise<void>;
  onAdvanceUpdated: (advance: number) => void;
};

type ManageModalKey = "add" | "dns" | "advance" | "auto" | null;

type ActionModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions: React.ReactNode;
};

const ActionModal = ({ title, open, onClose, children, actions }: ActionModalProps) => {
  if (!open) return null;
  const modal = (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div className="record-modal record-extra-modal" onClick={(event) => event.stopPropagation()}>
        <div className="record-modal-header">
          <div className="record-modal-title">{title}</div>
          <button type="button" className="record-modal-close" onClick={onClose} aria-label="닫기">
            <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
          </button>
        </div>
        <div className="record-modal-body round-manage-modal-body">{children}</div>
        <div className="record-edit-actions record-extra-actions">{actions}</div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
};

const hasCompleteMainAttempts = (record: Record) => {
  return [1, 2, 3, 4, 5].every((attemptTry) =>
    record.attempts.some(
      (attempt) =>
        attempt.attemptTry === attemptTry &&
        attempt.time !== undefined &&
        attempt.time !== null
    )
  );
};

const hasComputedAverage = (record: Record) => typeof record.average === "number";

export const RoundManagementPanel = ({
  round,
  records,
  rounds,
  onRecordsRefresh,
  onAdvanceUpdated,
}: RoundManagementPanelProps) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<ManageModalKey>(null);
  const [addForm, setAddForm] = useState<PlayerAddDTO>({
    pdx: 0,
    name: "",
    state: "",
    cckId: "",
    roundIdx: round.idx,
    roundGroup: "",
    note: "",
  });
  const [advanceValue, setAdvanceValue] = useState(round.advance ?? 0);
  const [noShowSelected, setNoShowSelected] = useState<Set<number>>(new Set());
  const [advanceTarget, setAdvanceTarget] = useState<number | "">("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = error
    ? { variant: "error" as const, message: error, onClose: () => setError(null) }
    : status
      ? { variant: "success" as const, message: status, onClose: () => setStatus(null) }
      : null;

  const noShowCandidates = useMemo(() => {
    return records.filter((record) => {
      if (!record.attempts || record.attempts.length === 0) return true;
      return record.attempts.every((attempt) => attempt.time === undefined || attempt.time === null);
    });
  }, [records]);

  const availableRounds = useMemo(() => {
    return rounds.filter((item) => item.idx !== round.idx);
  }, [rounds, round.idx]);

  const resolvedAdvance = useMemo(() => {
    if (round.advance !== undefined && round.advance !== null) {
      return round.advance;
    }
    const fallback = records.find((record) => typeof record.roundAdvance === "number")?.roundAdvance;
    return fallback ?? 0;
  }, [records, round.advance]);

  const advanceCandidates = useMemo(() => {
    const eligible = records.filter((record) => hasCompleteMainAttempts(record) && hasComputedAverage(record));
    const sorted = [...eligible].sort((a, b) => {
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
    const limit = advanceValue;
    if (limit <= 0) return [];
    return sorted.slice(0, limit);
  }, [records, advanceValue]);

  const handleAddPlayer = async () => {
    if (addForm.pdx <= 0 || !addForm.name.trim() || !addForm.cckId.trim()) {
      setError("PDX, 이름, CCK ID는 필수입니다.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      await addPlayer([{ ...addForm, roundIdx: round.idx }]);
      setStatus("선수를 추가했습니다.");
      await onRecordsRefresh();
      setAddForm((prev) => ({
        ...prev,
        pdx: 0,
        name: "",
        cckId: "",
        roundGroup: "",
        note: "",
      }));
    } catch (saveError) {
      console.error("선수 추가 실패:", saveError);
      setError("선수 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNoShow = async () => {
    if (noShowSelected.size === 0) {
      setError("삭제할 선수를 선택하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      for (const recordId of noShowSelected) {
        await deleteRecord(recordId);
      }
      setStatus("노쇼 기록을 제거했습니다.");
      await onRecordsRefresh();
      setNoShowSelected(new Set());
    } catch (saveError) {
      console.error("노쇼 삭제 실패:", saveError);
      setError("노쇼 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceUpdate = async () => {
    if (advanceValue < 0) {
      setError("진출 인원은 0 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      await updateAdvance(round.idx, advanceValue);
      onAdvanceUpdated(advanceValue);
      setStatus("진출 인원을 변경했습니다.");
    } catch (saveError) {
      console.error("진출 인원 변경 실패:", saveError);
      setError("진출 인원 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancePlayers = async () => {
    if (!advanceTarget) {
      setError("진출 라운드 ID를 입력하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      await advancePlayer({ pastRoundIdx: round.idx, advanceRoundIdx: Number(advanceTarget) });
      setStatus("라운드 자동 진출을 완료했습니다.");
    } catch (saveError) {
      console.error("라운드 자동 진출 실패:", saveError);
      setError("라운드 자동 진출에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="round-manage-panel">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ""}
        onClose={toast?.onClose}
      />
      <div className="round-panel-title">
        <h2>라운드 관리</h2>
      </div>

      <div className="record-manage-actions">
        <button
          type="button"
          className="record-edit-btn record-edit-btn--primary"
          onClick={() => navigate(`/admin/competition/${round.compIdx}/round/${round.idx}/add-competitior`)}
        >
          선수 추가
        </button>
        <button type="button" className="record-edit-btn record-edit-btn--primary" onClick={() => setOpenModal("dns")}>
          노쇼 삭제
        </button>
        <button
          type="button"
          className="record-edit-btn record-edit-btn--primary"
          onClick={() => {
            setAdvanceValue(resolvedAdvance);
            setOpenModal("advance");
          }}
        >
          진출 인원 변경
        </button>
        <button
          type="button"
          className="record-edit-btn record-edit-btn--primary"
          onClick={() => {
            if (!advanceTarget && availableRounds.length > 0) {
              setAdvanceTarget(availableRounds[0].idx);
            }
            setAdvanceValue(resolvedAdvance);
            setOpenModal("auto");
          }}
        >
          라운드 자동 진출
        </button>
      </div>

      <ActionModal
        title="선수 추가"
        open={openModal === "add"}
        onClose={() => setOpenModal(null)}
        actions={
          <>
            <button
              type="button"
              className="record-edit-btn record-edit-btn--primary"
              onClick={handleAddPlayer}
              disabled={loading}
            >
              {loading ? "추가 중..." : "선수 추가"}
            </button>
          </>
        }
      >
        <div className="record-manage-fields">
          <div className="record-edit-field">
            <label className="record-edit-label">PDX</label>
            <input
              className="record-edit-input"
              type="number"
              min={0}
              value={addForm.pdx}
              onChange={(event) => setAddForm({ ...addForm, pdx: Number(event.target.value) })}
            />
          </div>
          <div className="record-edit-field">
            <label className="record-edit-label">이름</label>
            <input
              className="record-edit-input"
              type="text"
              value={addForm.name}
              onChange={(event) => setAddForm({ ...addForm, name: event.target.value })}
            />
          </div>
          <div className="record-edit-field">
            <label className="record-edit-label">CCK ID</label>
            <input
              className="record-edit-input"
              type="text"
              value={addForm.cckId}
              onChange={(event) => setAddForm({ ...addForm, cckId: event.target.value })}
            />
          </div>
          <div className="record-edit-field">
            <label className="record-edit-label">지역</label>
            <input
              className="record-edit-input"
              type="text"
              value={addForm.state}
              onChange={(event) => setAddForm({ ...addForm, state: event.target.value })}
            />
          </div>
          <div className="record-edit-field">
            <label className="record-edit-label">그룹</label>
            <input
              className="record-edit-input"
              type="text"
              value={addForm.roundGroup}
              onChange={(event) => setAddForm({ ...addForm, roundGroup: event.target.value })}
            />
          </div>
        </div>
      </ActionModal>

      <ActionModal
        title="노쇼 삭제"
        open={openModal === "dns"}
        onClose={() => setOpenModal(null)}
        actions={
          <>
            <button
              type="button"
              className="record-edit-btn record-edit-btn--primary"
              onClick={handleDeleteNoShow}
              disabled={loading || noShowSelected.size === 0}
            >
              {loading ? "삭제 중..." : "노쇼 삭제"}
            </button>
          </>
        }
      >
        <div className="record-no-show-table">
          <div className="record-no-show-header">
            <span />
            <span>이름</span>
            <span>ID</span>
          </div>
          {noShowCandidates.length === 0 ? (
            <div className="record-no-show-empty">노쇼 대상이 없습니다.</div>
          ) : (
            noShowCandidates.map((record) => (
              <label key={record.idx} className="record-no-show-row">
                <input
                  type="checkbox"
                  checked={noShowSelected.has(record.idx)}
                  onChange={(event) => {
                    const next = new Set(noShowSelected);
                    if (event.target.checked) {
                      next.add(record.idx);
                    } else {
                      next.delete(record.idx);
                    }
                    setNoShowSelected(next);
                  }}
                />
                <span>{record.name}</span>
                <span>{record.cckId}</span>
              </label>
            ))
          )}
        </div>
      </ActionModal>

      <ActionModal
        title="진출 인원 변경"
        open={openModal === "advance"}
        onClose={() => setOpenModal(null)}
        actions={
          <>
            <button
              type="button"
              className="record-edit-btn record-edit-btn--primary"
              onClick={handleAdvanceUpdate}
              disabled={loading}
            >
              {loading ? "변경 중..." : "저장"}
            </button>
          </>
        }
      >
        <div className="record-edit-section">
          <div className="record-manage-fields">
            <div className="record-edit-field">
              <label className="record-edit-label">진출 인원</label>
              <input
                className="record-edit-input"
                type="number"
                min={0}
                value={advanceValue}
                onChange={(event) => setAdvanceValue(Number(event.target.value))}
              />
            </div>
          </div>
        </div>
      </ActionModal>

      <ActionModal
        title="라운드 자동 진출"
        open={openModal === "auto"}
        onClose={() => setOpenModal(null)}
        actions={
          <>
            <button
              type="button"
              className="record-edit-btn record-edit-btn--primary"
              onClick={handleAdvancePlayers}
              disabled={loading}
            >
              {loading ? "진행 중..." : "라운드 자동 진출"}
            </button>
          </>
        }
      >
        <div className="record-edit-section">
          <div className="record-edit-section-title">진출 라운드 선택</div>
          {availableRounds.length === 0 ? (
            <div className="record-no-show-empty">
              이동 가능한 라운드가 없습니다. 라운드 ID를 직접 입력하세요.
            </div>
          ) : (
            <div className="record-round-list">
              {availableRounds.map((item) => (
                <label key={item.idx} className="record-round-row">
                  <input
                    type="radio"
                    name="advance-round"
                    checked={advanceTarget === item.idx}
                    onChange={() => setAdvanceTarget(item.idx)}
                  />
                  <span>{item.cubeEventName}</span>
                  <span>{item.roundName}</span>
                  <span>#{item.idx}</span>
                </label>
              ))}
            </div>
          )}
          {availableRounds.length === 0 && (
            <div className="record-manage-fields">
              <div className="record-edit-field">
                <label className="record-edit-label">진출 라운드 ID</label>
                <input
                  className="record-edit-input"
                  type="number"
                  min={1}
                  value={advanceTarget}
                  onChange={(event) => {
                    const value = event.target.value;
                    setAdvanceTarget(value === "" ? "" : Number(value));
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="record-edit-section">
          <div className="record-edit-section-title">진출 대상 ({advanceCandidates.length}명)</div>
          {advanceCandidates.length === 0 ? (
            <div className="record-no-show-empty">진출 대상이 없습니다.</div>
          ) : (
            <div className="record-round-list">
              {advanceCandidates.map((record) => (
                <div key={record.idx} className="record-round-row record-round-row--plain">
                  <span>{record.name}</span>
                  <span>{record.cckId}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ActionModal>
    </div>
  );
};
