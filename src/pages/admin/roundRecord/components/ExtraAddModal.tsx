import type { Record } from "@/entities/record";
import { createPortal } from "react-dom";

type ExtraForm = {
  recordIdx: number | null;
  extraNum: number;
  extraTry: number;
  extraReasonType: string;
  extraReasonCustom: string;
};

type ExtraAddModalProps = {
  open: boolean;
  selectedRecord: Record | null;
  form: ExtraForm;
  saving: boolean;
  onFormChange: (next: ExtraForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export const ExtraAddModal = ({
  open,
  selectedRecord,
  form,
  saving,
  onFormChange,
  onClose,
  onSubmit,
}: ExtraAddModalProps) => {
  if (!open) return null;

  const modal = (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div className="record-modal record-extra-modal" onClick={(event) => event.stopPropagation()}>
        <div className="record-modal-header">
          <div className="record-modal-title">엑스트라 추가</div>
          <button type="button" className="record-modal-close" onClick={onClose} aria-label="닫기">
            <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
          </button>
        </div>
        <div className="record-modal-body">
          <div className="record-edit-field">
            <label className="record-edit-label">선수</label>
            <input
              className="record-edit-input"
              type="text"
              value={selectedRecord ? selectedRecord.name : ""}
              placeholder="선수를 선택하세요"
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
              readOnly
            />
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">시도 번호</label>
            <select
              className="record-edit-input"
              value={form.extraTry}
              onChange={(event) =>
                onFormChange({ ...form, extraTry: Number(event.target.value) })
              }
            >
              {[1, 2, 3, 4, 5].map((tryNum) => (
                <option key={tryNum} value={tryNum}>
                  {tryNum}
                </option>
              ))}
            </select>
          </div>

          <div className="record-edit-field">
            <label className="record-edit-label">사유</label>
            <select
              className="record-edit-input"
              value={form.extraReasonType}
              onChange={(event) =>
                onFormChange({ ...form, extraReasonType: event.target.value })
              }
            >
              <option value="">사유 선택</option>
              <option value="0.07초 이내 타이머 정지">0.07초 이내 타이머 정지</option>
              <option value="Recorder 오류">Recorder 오류</option>
              <option value="스크램블 오류">스크램블 오류</option>
              <option value="타이머 오류">타이머 오류</option>
              <option value="관중 개입">관중 개입</option>
              <option value="초심자 찬스">초심자 찬스</option>
              <option value="환경적 요인">환경적 요인</option>
              <option value="심판 실수">심판 실수</option>
              <option value="기타">기타</option>
            </select>
          </div>
          {form.extraReasonType === "기타" && (
            <div className="record-edit-field">
              <label className="record-edit-label">기타 사유 입력</label>
              <input
                className="record-edit-input"
                type="text"
                value={form.extraReasonCustom}
                onChange={(event) =>
                  onFormChange({ ...form, extraReasonCustom: event.target.value })
                }
                placeholder="기타 사유를 입력하세요"
              />
            </div>
          )}
        </div>
        <div className="record-edit-actions record-extra-actions">
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

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
};
