import type { Record } from "@/entities/record";
import { createPortal } from "react-dom";

type RecordInfoForm = {
  recordIdx: number | null;
  pdx: number;
  roundGroup: string;
};

type RecordInfoEditModalProps = {
  open: boolean;
  record: Record | null;
  form: RecordInfoForm;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  onFormChange: (next: RecordInfoForm) => void;
  onClose: () => void;
  onDelete: () => void;
  onSubmit: () => void;
};

export const RecordInfoEditModal = ({
  open,
  record,
  form,
  saving,
  deleting,
  error,
  onFormChange,
  onClose,
  onDelete,
  onSubmit,
}: RecordInfoEditModalProps) => {
  if (!open) return null;

  const modal = (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div className="record-modal record-extra-modal" onClick={(event) => event.stopPropagation()}>
        <div className="record-modal-header">
          <div className="record-modal-title">선수 편집</div>
          <button type="button" className="record-modal-close" onClick={onClose} aria-label="닫기">
            <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
          </button>
        </div>
        <div className="record-modal-body">
          <div className="record-edit-field">
            <label className="record-edit-label">이름</label>
            <input className="record-edit-input" type="text" value={record?.name ?? ""} readOnly />
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">CCK ID</label>
            <input className="record-edit-input" type="text" value={record?.cckId ?? ""} readOnly />
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">PDX</label>
            <input
              className="record-edit-input"
              type="number"
              min={1}
              value={form.pdx}
              onChange={(event) => onFormChange({ ...form, pdx: Number(event.target.value) })}
            />
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">그룹</label>
            <input
              className="record-edit-input"
              type="text"
              value={form.roundGroup}
              onChange={(event) => onFormChange({ ...form, roundGroup: event.target.value })}
              placeholder="예: A"
            />
          </div>

          {error && <div className="record-edit-status record-edit-status--error">{error}</div>}
        </div>
        <div className="record-edit-actions record-extra-actions">
          <button
            type="button"
            className="record-edit-btn record-edit-btn--danger"
            onClick={onDelete}
            disabled={saving || deleting || !form.recordIdx}
          >
            {deleting ? "삭제 중..." : "선수 삭제"}
          </button>
          <button
            type="button"
            className="record-edit-btn record-edit-btn--primary"
            onClick={onSubmit}
            disabled={saving || deleting || !form.recordIdx}
          >
            {saving ? "반영 중..." : "반영"}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
};
