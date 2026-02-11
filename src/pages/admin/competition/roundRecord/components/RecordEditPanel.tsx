import type { Record } from "@/entities/record";
import type { Attempt } from "@/entities/record/model/attempt";

type RecordEditPanelProps = {
  nameQuery: string;
  searchOpen: boolean;
  searchResults: Record[];
  selectedRecord: Record | null;
  attemptInputs: string[];
  extraAttempts: Attempt[];
  saving: boolean;
  formError: string | null;
  formStatus: string | null;
  formatTimeValue: (value?: number) => string;
  onNameChange: (value: string) => void;
  onNameFocus: () => void;
  onNameBlur: () => void;
  onSelectRecord: (record: Record) => void;
  onAttemptChange: (index: number, value: string) => void;
  onReset: () => void;
  onSave: () => void;
  onOpenExtra: () => void;
};

export const RecordEditPanel = ({
  nameQuery,
  searchOpen,
  searchResults,
  selectedRecord,
  attemptInputs,
  extraAttempts,
  saving,
  formError,
  formStatus,
  formatTimeValue,
  onNameChange,
  onNameFocus,
  onNameBlur,
  onSelectRecord,
  onAttemptChange,
  onReset,
  onSave,
  onOpenExtra,
}: RecordEditPanelProps) => {
  return (
    <div className="record-edit-panel">
      <div className="round-panel-title">
        <h2>기록 편집</h2>
      </div>

      <div className="record-edit-form">
        <div className="record-edit-field record-edit-search">
          <label className="record-edit-label" htmlFor="record-search-input">
            이름
          </label>
          <div className="record-edit-input-wrap">
            <input
              id="record-search-input"
              className="record-edit-input"
              type="search"
              placeholder="이름 또는 CCK ID 입력"
              value={nameQuery}
              onChange={(event) => onNameChange(event.target.value)}
              onFocus={onNameFocus}
              onBlur={onNameBlur}
              autoFocus
            />
            <span className="record-edit-search-icon" aria-hidden="true">
              <img src="/icon/input/search.svg" alt="" aria-hidden="true" />
            </span>
          </div>
          {searchOpen && searchResults.length > 0 && (
            <div className="record-edit-suggestions" role="listbox">
              {searchResults.map((record) => (
                <button
                  key={record.idx}
                  type="button"
                  className="record-edit-suggestion"
                  onMouseDown={() => onSelectRecord(record)}
                >
                  <span className="record-edit-suggestion-name">
                    {record.enName ? `${record.name} (${record.enName})` : record.name}
                  </span>
                  <span className="record-edit-suggestion-meta">{record.cckId}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="record-edit-field">
          <label className="record-edit-label">CCK ID</label>
          <input
            className="record-edit-input"
            type="text"
            value={selectedRecord?.cckId ?? ""}
            placeholder="선수를 선택하세요"
            readOnly
          />
        </div>
        <div className="record-edit-field">
          <label className="record-edit-label">그룹</label>
          <input
            className="record-edit-input"
            type="text"
            value={selectedRecord?.roundGroup ?? ""}
            placeholder="-"
            readOnly
          />
        </div>
        <div className="record-edit-field">
          <label className="record-edit-label">평균</label>
          <input
            className="record-edit-input"
            type="text"
            value={selectedRecord ? formatTimeValue(selectedRecord.average) : ""}
            placeholder="-"
            readOnly
          />
        </div>
        <div className="record-edit-field">
          <label className="record-edit-label">싱글</label>
          <input
            className="record-edit-input"
            type="text"
            value={selectedRecord ? formatTimeValue(selectedRecord.single) : ""}
            placeholder="-"
            readOnly
          />
        </div>

        <div className="record-edit-section">
          <div className="record-edit-section-title">시도 기록</div>
          <div className="record-edit-help">형식: 1:23.45 / 12345 / DNF / DNS</div>
          <div className="record-edit-attempts">
            {[1, 2, 3, 4, 5].map((attemptTry, index) => (
              <div className="record-edit-field" key={attemptTry}>
                <label className="record-edit-label" htmlFor={`attempt-${attemptTry}`}>
                  시도 {attemptTry}
                </label>
                <input
                  id={`attempt-${attemptTry}`}
                  className="record-edit-input"
                  type="text"
                  inputMode="numeric"
                  value={attemptInputs[index]}
                  onChange={(event) => onAttemptChange(index, event.target.value)}
                  placeholder="-"
                  disabled={!selectedRecord}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="record-edit-section">
          <div className="record-edit-section-title record-edit-section-title-row">
            <span>엑스트라</span>
            <button type="button" className="record-edit-mini-btn" onClick={onOpenExtra}>
              엑스트라 추가
            </button>
          </div>
          {extraAttempts.length === 0 ? (
            <div className="record-edit-empty">엑스트라가 없습니다.</div>
          ) : (
            <div className="record-extra-list">
              {extraAttempts.map((attempt) => (
                <div key={attempt.idx} className="record-extra-item">
                  <div className="record-extra-title">
                    Extra {attempt.extra} / Try {attempt.attemptTry}
                  </div>
                  <div className="record-extra-reason">{attempt.exReason || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {formError && <div className="record-edit-status record-edit-status--error">{formError}</div>}
        {formStatus && <div className="record-edit-status record-edit-status--success">{formStatus}</div>}

        <div className="record-edit-actions">
          <button className="record-edit-btn record-edit-btn--ghost" type="button" onClick={onReset}>
            선택 초기화
          </button>
          <button
            className="record-edit-btn record-edit-btn--primary"
            type="button"
            onClick={onSave}
            disabled={!selectedRecord || saving}
          >
            {saving ? "반영 중..." : "반영"}
          </button>
        </div>
      </div>
    </div>
  );
};
