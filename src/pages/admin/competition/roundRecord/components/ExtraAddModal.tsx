import type { Record } from "@/entities/record";

type ExtraForm = {
  recordIdx: number | null;
  extraNum: number;
  extraTry: number;
  extraReason: string;
};

type ExtraAddModalProps = {
  open: boolean;
  records: Record[];
  searchQuery: string;
  searchResults: Record[];
  selectedRecord: Record | null;
  form: ExtraForm;
  saving: boolean;
  error: string | null;
  onSearchChange: (value: string) => void;
  onSelectRecord: (record: Record) => void;
  onFormChange: (next: ExtraForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export const ExtraAddModal = ({
  open,
  records,
  searchQuery,
  searchResults,
  selectedRecord,
  form,
  saving,
  error,
  onSearchChange,
  onSelectRecord,
  onFormChange,
  onClose,
  onSubmit,
}: ExtraAddModalProps) => {
  if (!open) return null;

  return (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div className="record-modal record-extra-modal" onClick={(event) => event.stopPropagation()}>
        <div className="record-modal-header">
          <div className="record-modal-title">엑스트라 추가</div>
          <button type="button" className="record-modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="record-modal-body">
          <div className="record-edit-field record-edit-search">
            <label className="record-edit-label" htmlFor="extra-search-input">
              선수 검색
            </label>
            <div className="record-edit-input-wrap">
              <input
                id="extra-search-input"
                className="record-edit-input"
                type="search"
                placeholder="이름 또는 CCK ID 입력"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                autoFocus
              />
              <span className="record-edit-search-icon" aria-hidden="true">
                <img src="/icon/input/search.svg" alt="" aria-hidden="true" />
              </span>
            </div>
            {searchQuery.trim().length > 0 && searchResults.length > 0 && (
              <div className="record-edit-suggestions record-edit-suggestions--modal" role="listbox">
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
            <label className="record-edit-label">선수</label>
            <input
              className="record-edit-input"
              type="text"
              value={selectedRecord ? selectedRecord.name : ""}
              placeholder={records.length ? "선수를 선택하세요" : "선수 목록이 없습니다"}
              readOnly
            />
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">엑스트라 번호</label>
            <input
              className="record-edit-input"
              type="number"
              min={1}
              value={form.extraNum}
              onChange={(event) =>
                onFormChange({ ...form, extraNum: Number(event.target.value) })
              }
            />
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">시도 번호</label>
            <input
              className="record-edit-input"
              type="number"
              min={1}
              value={form.extraTry}
              onChange={(event) =>
                onFormChange({ ...form, extraTry: Number(event.target.value) })
              }
            />
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">사유</label>
            <input
              className="record-edit-input"
              type="text"
              value={form.extraReason}
              onChange={(event) =>
                onFormChange({ ...form, extraReason: event.target.value })
              }
              placeholder="엑스트라 사유"
            />
          </div>

          {error && <div className="record-edit-status record-edit-status--error">{error}</div>}
        </div>
        <div className="record-edit-actions record-extra-actions">
          <button type="button" className="record-edit-btn record-edit-btn--ghost" onClick={onClose}>
            닫기
          </button>
          <button
            type="button"
            className="record-edit-btn record-edit-btn--primary"
            onClick={onSubmit}
            disabled={saving || !form.recordIdx}
          >
            {saving ? "추가 중..." : "엑스트라 주기"}
          </button>
        </div>
      </div>
    </div>
  );
};
