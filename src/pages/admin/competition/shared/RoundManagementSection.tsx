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
  onRoundCreate: () => void;
  onRoundDelete: (roundIdx: number) => void;
  saving: boolean;
  title?: string;
  showExisting?: boolean;
  showSaveButton?: boolean;
  showCreateButton?: boolean;
};

const updateOptionalNumber = (value: string) =>
  value === "" ? undefined : Number(value);

export const RoundManagementSection = ({
  rounds,
  newRounds,
  eventOptions,
  onRoundsChange,
  onNewRoundsChange,
  onRoundSave,
  onRoundCreate,
  onRoundDelete,
  saving,
  title = "라운드 편집",
  showExisting = true,
  showSaveButton = true,
  showCreateButton = true,
}: RoundManagementSectionProps) => (
  <div className="dashboard-test-section">
    <div className="dashboard-test-card-header">
      <h2 className="dashboard-test-section-title">{title}</h2>
      <button
        type="button"
        className="dashboard-test-button dashboard-test-button--subtle"
        onClick={() =>
          onNewRoundsChange([
            ...newRounds,
            {
              cubeEvent: "",
              roundName: "",
              eventStart: "",
              eventEnd: "",
              groupList: "",
              cutoff: undefined,
              timeLimit: undefined,
              advance: undefined,
            },
          ])
        }
      >
        + 라운드 추가
      </button>
    </div>

    {showExisting ? (
      rounds.length === 0 ? (
        <div className="dashboard-test-status">등록된 라운드가 없습니다.</div>
      ) : (
        rounds.map((round, index) => (
          <div key={round.idx} className="dashboard-test-subsection">
            <div className="dashboard-test-grid dashboard-test-grid-3">
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">종목</label>
                <select
                  value={round.cubeEvent}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = { ...next[index], cubeEvent: e.target.value };
                    onRoundsChange(next);
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
                  value={round.roundName}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = { ...next[index], roundName: e.target.value };
                    onRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">그룹</label>
                <input
                  type="text"
                  value={round.groupList}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = { ...next[index], groupList: e.target.value };
                    onRoundsChange(next);
                  }}
                  placeholder="예: A, B, C"
                  className="dashboard-test-input"
                />
              </div>
            </div>
            <div className="dashboard-test-grid dashboard-test-grid-2">
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">시작</label>
                <input
                  type="datetime-local"
                  value={round.eventStart}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = { ...next[index], eventStart: e.target.value };
                    onRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">종료</label>
                <input
                  type="datetime-local"
                  value={round.eventEnd}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = { ...next[index], eventEnd: e.target.value };
                    onRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
            </div>
            <div className="dashboard-test-grid dashboard-test-grid-3">
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">컷오프</label>
                <input
                  type="number"
                  value={round.cutoff ?? ""}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = {
                      ...next[index],
                      cutoff: updateOptionalNumber(e.target.value),
                    };
                    onRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">시간 제한</label>
                <input
                  type="number"
                  value={round.timeLimit ?? ""}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = {
                      ...next[index],
                      timeLimit: updateOptionalNumber(e.target.value),
                    };
                    onRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">진출 인원</label>
                <input
                  type="number"
                  value={round.advance ?? ""}
                  onChange={(e) => {
                    const next = [...rounds];
                    next[index] = {
                      ...next[index],
                      advance: updateOptionalNumber(e.target.value),
                    };
                    onRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
            </div>
            <div className="dashboard-test-actions">
              <button
                type="button"
                className="dashboard-test-button dashboard-test-button--danger"
                onClick={() => onRoundDelete(round.idx)}
                disabled={saving}
              >
                라운드 삭제
              </button>
            </div>
          </div>
        ))
      )
    ) : null}

    {newRounds.length > 0 ? (
      <div className="dashboard-test-card">
        <div className="dashboard-test-card-header">
          <h3 className="dashboard-test-card-title">새 라운드</h3>
          <button
            type="button"
            className="dashboard-test-button dashboard-test-button--subtle"
            onClick={() => onNewRoundsChange([])}
          >
            초기화
          </button>
        </div>
        {newRounds.map((round, index) => (
          <div key={`new-${index}`} className="dashboard-test-subsection">
            <div className="dashboard-test-grid dashboard-test-grid-3">
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">종목</label>
                <select
                  value={round.cubeEvent}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = { ...next[index], cubeEvent: e.target.value };
                    onNewRoundsChange(next);
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
                  value={round.roundName}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = { ...next[index], roundName: e.target.value };
                    onNewRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">그룹</label>
                <input
                  type="text"
                  value={round.groupList}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = { ...next[index], groupList: e.target.value };
                    onNewRoundsChange(next);
                  }}
                  placeholder="예: A, B, C"
                  className="dashboard-test-input"
                />
              </div>
            </div>
            <div className="dashboard-test-grid dashboard-test-grid-2">
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">시작</label>
                <input
                  type="datetime-local"
                  value={round.eventStart}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = { ...next[index], eventStart: e.target.value };
                    onNewRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">종료</label>
                <input
                  type="datetime-local"
                  value={round.eventEnd}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = { ...next[index], eventEnd: e.target.value };
                    onNewRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
            </div>
            <div className="dashboard-test-grid dashboard-test-grid-3">
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">컷오프</label>
                <input
                  type="number"
                  value={round.cutoff ?? ""}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = {
                      ...next[index],
                      cutoff: updateOptionalNumber(e.target.value),
                    };
                    onNewRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">시간 제한</label>
                <input
                  type="number"
                  value={round.timeLimit ?? ""}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = {
                      ...next[index],
                      timeLimit: updateOptionalNumber(e.target.value),
                    };
                    onNewRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">진출 인원</label>
                <input
                  type="number"
                  value={round.advance ?? ""}
                  onChange={(e) => {
                    const next = [...newRounds];
                    next[index] = {
                      ...next[index],
                      advance: updateOptionalNumber(e.target.value),
                    };
                    onNewRoundsChange(next);
                  }}
                  className="dashboard-test-input"
                />
              </div>
            </div>
            <button
              type="button"
              className="dashboard-test-button dashboard-test-button--danger dashboard-test-button--mini"
              onClick={() =>
                onNewRoundsChange(newRounds.filter((_, i) => i !== index))
              }
            >
              새 라운드 삭제
            </button>
          </div>
        ))}
        {showCreateButton ? (
          <div className="dashboard-test-actions">
            <button
              type="button"
              className="dashboard-test-button dashboard-test-button--success"
              onClick={onRoundCreate}
              disabled={saving}
            >
              새 라운드 저장
            </button>
          </div>
        ) : null}
      </div>
    ) : null}

    {showSaveButton ? (
      <div className="dashboard-test-actions">
        <button
          type="button"
          className="dashboard-test-button dashboard-test-button--primary"
          onClick={onRoundSave}
          disabled={saving || rounds.length === 0}
        >
          라운드 변경 저장
        </button>
      </div>
    ) : null}
  </div>
);
