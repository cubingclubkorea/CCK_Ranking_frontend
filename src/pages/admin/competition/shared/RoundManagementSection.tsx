import { useEffect, useMemo, useState } from "react";
import type { CubeEvent } from "@/entities/cubeEvent";

export type RoundForm = {
  idx: number;
  cubeEvent: string;
  roundName: string;
  eventStart: string;
  eventEnd: string;
  groupList: string;
  cutoff?: number;
  timeLimit?: number;
  advance?: number;
};

export type NewRoundForm = Omit<RoundForm, "idx">;

type RoundManagementSectionProps = {
  rounds: RoundForm[];
  newRounds: NewRoundForm[];
  eventOptions: CubeEvent[];
  onRoundsChange: (next: RoundForm[]) => void;
  onNewRoundsChange: (next: NewRoundForm[]) => void;
  onRoundSave: () => void;
  onRoundCreate?: () => void;
  onRoundDelete: (roundIdx: number) => void;
  saving: boolean;
  title?: string;
  showExisting?: boolean;
  showSaveButton?: boolean;
  showCreateButton?: boolean;
};

const updateOptionalNumber = (value: string) =>
  value === "" ? undefined : Number(value);

const pad2 = (value: number) => `${value}`.padStart(2, "0");
const toDateTimeInputNow = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}T${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
};

const createEmptyRound = (): NewRoundForm => ({
  cubeEvent: "",
  roundName: "",
  eventStart: "",
  eventEnd: "",
  groupList: "",
  cutoff: undefined,
  timeLimit: undefined,
  advance: undefined,
});

const formatDateTimeLabel = (value: string) => {
  if (!value) return "미설정";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())} ${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
};

const buildRoundTitle = (cubeEvent: string, roundName: string, fallback: string) => {
  const eventName = cubeEvent.trim();
  const name = roundName.trim();
  if (!eventName && !name) return fallback;
  return `${eventName} ${name}`.trim();
};

const toSortTime = (value: string) => {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

type EditorItem =
  | { kind: "existing"; key: string; index: number; round: RoundForm }
  | { kind: "new"; key: string; index: number; round: NewRoundForm };

export const RoundManagementSection = ({
  rounds,
  newRounds,
  eventOptions,
  onRoundsChange,
  onNewRoundsChange,
  onRoundSave: _onRoundSave,
  onRoundCreate: _onRoundCreate,
  onRoundDelete,
  saving,
  title: _title = "라운드 편집",
  showExisting = true,
  showSaveButton: _showSaveButton = true,
  showCreateButton: _showCreateButton = true,
}: RoundManagementSectionProps) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const items = useMemo<EditorItem[]>(() => {
    const mapped: EditorItem[] = [
      ...(showExisting
        ? rounds.map((round, index) => ({
            kind: "existing" as const,
            key: `existing-${round.idx}`,
            index,
            round,
          }))
        : []),
      ...newRounds.map((round, index) => ({
        kind: "new" as const,
        key: `new-${index}`,
        index,
        round,
      })),
    ];

    return mapped.sort((left, right) => {
      const timeDiff = toSortTime(left.round.eventStart) - toSortTime(right.round.eventStart);
      if (timeDiff !== 0) return timeDiff;
      if (left.kind !== right.kind) return left.kind === "existing" ? -1 : 1;
      return left.index - right.index;
    });
  }, [newRounds, rounds]);

  useEffect(() => {
    if (expandedKey === null) return;
    if (!items.some((item) => item.key === expandedKey)) {
      setExpandedKey(null);
    }
  }, [expandedKey, items]);

  const updateExisting = (index: number, patch: Partial<RoundForm>) => {
    const next = [...rounds];
    next[index] = { ...next[index], ...patch };
    onRoundsChange(next);
  };

  const updateNew = (index: number, patch: Partial<NewRoundForm>) => {
    const next = [...newRounds];
    next[index] = { ...next[index], ...patch };
    onNewRoundsChange(next);
  };

  const addNewRound = () => {
    onNewRoundsChange([...newRounds, createEmptyRound()]);
    setExpandedKey(`new-${newRounds.length}`);
  };

  const deleteNewRound = (index: number) => {
    onNewRoundsChange(newRounds.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="dashboard-test-section round-editor-section">
      <div className="round-editor-toolbar">
        <h2 className="dashboard-test-section-title">라운드 목록</h2>
        <button
          type="button"
          className="dashboard-test-button dashboard-test-button--subtle"
          onClick={addNewRound}
        >
          + 라운드 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="round-editor-empty">등록된 라운드가 없습니다.</div>
      ) : (
        <div className="round-editor-list">
          {items.map((item) => {
            const isOpen = expandedKey === item.key;
            return (
              <article
                key={item.key}
                className={`round-editor-card ${isOpen ? "open" : ""}`.trim()}
              >
                  <button
                    type="button"
                    className="round-editor-card-head"
                    onClick={() => setExpandedKey(isOpen ? null : item.key)}
                  >
                    <div className="round-editor-summary">
                      <span className="round-editor-icon" aria-hidden="true">
                      <img
                        className="round-editor-icon-img"
                        src={`/icon/events/${encodeURIComponent(item.round.cubeEvent || "Question")}.svg`}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (target.dataset.fallback === "true") {
                            target.style.display = "none";
                            return;
                          }
                          target.dataset.fallback = "true";
                          target.src = "/icon/events/Question.svg";
                          }}
                        />
                      </span>
                      <div className="round-editor-summary-text">
                        <strong className="round-editor-title">
                          {buildRoundTitle(item.round.cubeEvent, item.round.roundName, "이름 없는 라운드")}
                        </strong>
                      </div>
                    </div>
                    <div className="round-editor-head-right">
                      <span className={`round-editor-chevron ${isOpen ? "open" : ""}`.trim()} aria-hidden="true">
                        ▾
                      </span>
                  </div>
                </button>

                {isOpen ? (
                  <div className="round-editor-body">
                    <div className="dashboard-test-grid dashboard-test-grid-3">
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">종목</label>
                        <select
                          value={item.round.cubeEvent}
                          onChange={(e) => {
                            const patch = { cubeEvent: e.target.value };
                            if (item.kind === "existing") {
                              updateExisting(item.index, patch);
                              return;
                            }
                            updateNew(item.index, patch);
                          }}
                          className="dashboard-test-select"
                        >
                          <option value="">종목 선택</option>
                          {eventOptions.map((event) => (
                            <option key={event.eventName} value={event.eventName}>
                              {event.eventName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">라운드명</label>
                        <input
                          type="text"
                          value={item.round.roundName}
                          onChange={(e) => {
                            const patch = { roundName: e.target.value };
                            if (item.kind === "existing") {
                              updateExisting(item.index, patch);
                              return;
                            }
                            updateNew(item.index, patch);
                          }}
                          className="dashboard-test-input"
                        />
                      </div>
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">그룹</label>
                        <input
                          type="text"
                          value={item.round.groupList}
                          onChange={(e) => {
                            const patch = { groupList: e.target.value };
                            if (item.kind === "existing") {
                              updateExisting(item.index, patch);
                              return;
                            }
                            updateNew(item.index, patch);
                          }}
                          placeholder="예: A, B, C"
                          className="dashboard-test-input"
                        />
                      </div>
                    </div>

                    <div className="dashboard-test-grid dashboard-test-grid-2">
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">시작</label>
                        <div className="dashboard-test-inline">
                          <input
                            type="datetime-local"
                            value={item.round.eventStart}
                            onChange={(e) => {
                              const patch = { eventStart: e.target.value };
                              if (item.kind === "existing") {
                                updateExisting(item.index, patch);
                                return;
                              }
                              updateNew(item.index, patch);
                            }}
                            className="dashboard-test-input"
                          />
                          <button
                            type="button"
                            className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                            onClick={() => {
                              const patch = { eventStart: toDateTimeInputNow() };
                              if (item.kind === "existing") {
                                updateExisting(item.index, patch);
                                return;
                              }
                              updateNew(item.index, patch);
                            }}
                          >
                            현재 시간으로 입력
                          </button>
                        </div>
                      </div>
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">종료</label>
                        <div className="dashboard-test-inline">
                          <input
                            type="datetime-local"
                            value={item.round.eventEnd}
                            onChange={(e) => {
                              const patch = { eventEnd: e.target.value };
                              if (item.kind === "existing") {
                                updateExisting(item.index, patch);
                                return;
                              }
                              updateNew(item.index, patch);
                            }}
                            className="dashboard-test-input"
                          />
                          <button
                            type="button"
                            className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                            onClick={() => {
                              const patch = { eventEnd: item.round.eventStart };
                              if (item.kind === "existing") {
                                updateExisting(item.index, patch);
                                return;
                              }
                              updateNew(item.index, patch);
                            }}
                            disabled={!item.round.eventStart}
                          >
                            시작일 복사
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-test-grid dashboard-test-grid-3">
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">컷오프</label>
                        <input
                          type="number"
                          value={item.round.cutoff ?? ""}
                          onChange={(e) => {
                            const patch = { cutoff: updateOptionalNumber(e.target.value) };
                            if (item.kind === "existing") {
                              updateExisting(item.index, patch);
                              return;
                            }
                            updateNew(item.index, patch);
                          }}
                          className="dashboard-test-input"
                        />
                      </div>
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">시간 제한</label>
                        <input
                          type="number"
                          value={item.round.timeLimit ?? ""}
                          onChange={(e) => {
                            const patch = { timeLimit: updateOptionalNumber(e.target.value) };
                            if (item.kind === "existing") {
                              updateExisting(item.index, patch);
                              return;
                            }
                            updateNew(item.index, patch);
                          }}
                          className="dashboard-test-input"
                        />
                      </div>
                      <div className="dashboard-test-field">
                        <label className="dashboard-test-label">진출 인원</label>
                        <input
                          type="number"
                          value={item.round.advance ?? ""}
                          onChange={(e) => {
                            const patch = { advance: updateOptionalNumber(e.target.value) };
                            if (item.kind === "existing") {
                              updateExisting(item.index, patch);
                              return;
                            }
                            updateNew(item.index, patch);
                          }}
                          className="dashboard-test-input"
                        />
                      </div>
                    </div>

                    <div className="round-editor-actions">
                      {item.kind === "existing" ? (
                        <button
                          type="button"
                          className="dashboard-test-button dashboard-test-button--danger"
                          onClick={() => onRoundDelete(item.round.idx)}
                          disabled={saving}
                        >
                          라운드 삭제
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="dashboard-test-button dashboard-test-button--danger"
                          onClick={() => deleteNewRound(item.index)}
                          disabled={saving}
                        >
                          라운드 삭제
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
