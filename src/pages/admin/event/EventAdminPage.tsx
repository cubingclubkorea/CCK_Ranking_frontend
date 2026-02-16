import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCubeEventList } from "@/entities/cubeEvent";
import type { CubeEvent, ColorType } from "@/entities/cubeEvent/model/cubeEvent";
import { ColorType as ColorTypeValue } from "@/entities/cubeEvent/model/cubeEvent";
import { createCubeEvent, deleteCubeEvent, updateCubeEvent } from "@/features/cubeEvent";
import { getEventIconSrc } from "@/shared";
import { OverlayToast, PageHeader } from "@/widgets";

const colorTypeOptions: ColorType[] = [
  ColorTypeValue.cube,
  ColorTypeValue.tetra,
  ColorTypeValue.dode,
  ColorTypeValue.skewb,
  ColorTypeValue.clock,
  ColorTypeValue.square,
  ColorTypeValue.none,
];

const avgCalcOptions = ["ao5", "bo3", "ao12", "single", "mo3"] as const;

const colorTypeLabelMap: Record<ColorType, string> = {
  [ColorTypeValue.cube]: "정육면체",
  [ColorTypeValue.tetra]: "정사면체",
  [ColorTypeValue.dode]: "정십이면체",
  [ColorTypeValue.skewb]: "스큐브",
  [ColorTypeValue.clock]: "Clock",
  [ColorTypeValue.square]: "스퀘어",
  [ColorTypeValue.none]: "해당 없음",
};

type EventFormState = {
  eventName: string;
  avgCalc: string;
  colorType: ColorType;
  file: File | null;
};

const initialForm: EventFormState = {
  eventName: "",
  avgCalc: "",
  colorType: ColorTypeValue.cube,
  file: null,
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "알 수 없는 오류가 발생했습니다.";
  }
};

export const EventAdminPage = () => {
  const [events, setEvents] = useState<CubeEvent[]>([]);
  const [form, setForm] = useState<EventFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CubeEvent | null>(null);
  const [editForm, setEditForm] = useState<EventFormState>(initialForm);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCubeEventList();
      setEvents(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async () => {
    if (!form.eventName.trim() || !form.avgCalc.trim()) {
      setCreateError("종목명과 평균 계산 방식을 입력해주세요.");
      return;
    }

    setSaving(true);
    setCreateError(null);
    setError(null);
    setNotice(null);
    try {
      await createCubeEvent({
        eventName: form.eventName.trim(),
        avgCalc: form.avgCalc.trim(),
        colorType: form.colorType,
        file: form.file ?? undefined,
      });
      await fetchEvents();
      setForm(initialForm);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setCreateModalOpen(false);
      setNotice("큐브 종목이 추가되었습니다.");
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openDetailModal = (event: CubeEvent) => {
    setSelectedEvent(event);
    setEditError(null);
    setEditForm({
      eventName: event.eventName,
      avgCalc: event.avgCalc,
      colorType: event.colorType,
      file: null,
    });
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent) return;
    if (!editForm.eventName.trim() || !editForm.avgCalc.trim()) {
      setEditError("종목명과 평균 계산 방식을 입력해주세요.");
      return;
    }

    setSaving(true);
    setEditError(null);
    setError(null);
    setNotice(null);
    try {
      await updateCubeEvent({
        eventName: editForm.eventName.trim(),
        avgCalc: editForm.avgCalc.trim(),
        colorType: editForm.colorType,
        file: editForm.file ?? undefined,
      });
      await fetchEvents();
      setSelectedEvent(null);
      setNotice("큐브 종목이 수정되었습니다.");
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    const confirmed = window.confirm(`"${selectedEvent.eventName}" 종목을 삭제할까요?`);
    if (!confirmed) return;

    setDeleting(true);
    setEditError(null);
    setError(null);
    setNotice(null);
    try {
      await deleteCubeEvent(selectedEvent.eventName);
      await fetchEvents();
      setSelectedEvent(null);
      setNotice("큐브 종목이 삭제되었습니다.");
    } catch (err) {
      setEditError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const toast = error
    ? { variant: "error" as const, message: error, onClose: () => setError(null) }
    : notice
      ? { variant: "success" as const, message: notice, onClose: () => setNotice(null) }
      : null;
  const modalToast = createError
    ? { variant: "error" as const, message: createError, onClose: () => setCreateError(null) }
    : editError
      ? { variant: "error" as const, message: editError, onClose: () => setEditError(null) }
    : null;

  return (
    <div className="admin-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ""}
        onClose={toast?.onClose}
      />
      <OverlayToast
        open={!!modalToast}
        variant={modalToast?.variant}
        message={modalToast?.message ?? ""}
        onClose={modalToast?.onClose}
      />

      <PageHeader
        containerClassName="admin-header"
        iconSrc="/icon/sidebar/cube.svg"
        title="큐브 종목 관리"
        subtitle="Manage Cube Events"
        actions={[
          {
            label: "종목 추가",
            iconSrc: "/icon/button/plus.svg",
            onClick: () => {
              setCreateError(null);
              setCreateModalOpen(true);
            },
          },
        ]}
      />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>종목명</th>
              <th>평균 계산 방식</th>
              <th>큐브 구분</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={`${event.eventName}-${event.avgCalc}`}
                className="admin-table-row--clickable"
                onClick={() => openDetailModal(event)}
              >
                <td className="admin-name">{event.eventName}</td>
                <td>{event.avgCalc}</td>
                <td>{colorTypeLabelMap[event.colorType]}</td>
              </tr>
            ))}
            {!loading && events.length === 0 && (
              <tr>
                <td className="admin-empty" colSpan={3}>
                  등록된 큐브 종목이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {createModalOpen &&
        createPortal(
          <div className="record-modal-backdrop" onClick={() => setCreateModalOpen(false)}>
            <div className="record-modal record-extra-modal" onClick={(event) => event.stopPropagation()}>
              <div className="record-modal-header">
                <div className="record-modal-title">큐브 종목 추가</div>
                <button
                  type="button"
                  className="record-modal-close"
                  onClick={() => setCreateModalOpen(false)}
                  aria-label="닫기"
                >
                  <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
                </button>
              </div>
              <div className="record-modal-body">
                <div className="dashboard-test-grid">
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">종목명</label>
                    <input
                      type="text"
                      value={form.eventName}
                      onChange={(e) => setForm((prev) => ({ ...prev, eventName: e.target.value }))}
                      placeholder="예: 3x3x3"
                      className="dashboard-test-input"
                    />
                  </div>
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">평균 계산 방식</label>
                    <select
                      value={form.avgCalc}
                      onChange={(e) => setForm((prev) => ({ ...prev, avgCalc: e.target.value }))}
                      className="dashboard-test-select"
                    >
                      <option value="">평균 계산 방식 선택</option>
                      {avgCalcOptions.map((avgCalc) => (
                        <option key={avgCalc} value={avgCalc}>
                          {avgCalc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">큐브 구분 (섞기 방식)</label>
                    <select
                      value={form.colorType}
                      onChange={(e) => setForm((prev) => ({ ...prev, colorType: e.target.value as ColorType }))}
                      className="dashboard-test-select"
                    >
                      {colorTypeOptions.map((colorType) => (
                        <option key={colorType} value={colorType}>
                          {colorTypeLabelMap[colorType]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">아이콘 파일 (선택)</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          file: e.target.files && e.target.files[0] ? e.target.files[0] : null,
                        }))
                      }
                      className="dashboard-test-input"
                    />
                  </div>
                </div>
                <div className="dashboard-test-actions">
                  <button
                    type="button"
                    className="dashboard-test-button dashboard-test-button--primary"
                    onClick={handleCreate}
                    disabled={saving || loading}
                  >
                    종목 추가
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {selectedEvent &&
        createPortal(
          <div className="record-modal-backdrop" onClick={() => setSelectedEvent(null)}>
            <div className="record-modal" onClick={(event) => event.stopPropagation()}>
              <div className="record-modal-header">
                <div className="record-modal-title">종목 상세</div>
                <button
                  type="button"
                  className="record-modal-close"
                  onClick={() => setSelectedEvent(null)}
                  aria-label="닫기"
                >
                  <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
                </button>
              </div>
              <div className="record-modal-body">
                <div className="event-detail-icon-wrap" aria-hidden="true">
                  <img
                    className="event-detail-icon"
                    src={getEventIconSrc(editForm.eventName || selectedEvent.eventName)}
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
                </div>

                <div className="dashboard-test-grid">
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">종목명</label>
                    <input
                      type="text"
                      value={editForm.eventName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, eventName: e.target.value }))}
                      placeholder="예: 3x3x3"
                      className="dashboard-test-input"
                    />
                  </div>
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">평균 계산 방식</label>
                    <select
                      value={editForm.avgCalc}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, avgCalc: e.target.value }))}
                      className="dashboard-test-select"
                    >
                      <option value="">평균 계산 방식 선택</option>
                      {avgCalcOptions.map((avgCalc) => (
                        <option key={avgCalc} value={avgCalc}>
                          {avgCalc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">큐브 구분 (섞기 방식)</label>
                    <select
                      value={editForm.colorType}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, colorType: e.target.value as ColorType }))
                      }
                      className="dashboard-test-select"
                    >
                      {colorTypeOptions.map((colorType) => (
                        <option key={colorType} value={colorType}>
                          {colorTypeLabelMap[colorType]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="dashboard-test-field">
                    <label className="dashboard-test-label">아이콘 파일 (선택)</label>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          file: e.target.files && e.target.files[0] ? e.target.files[0] : null,
                        }))
                      }
                      className="dashboard-test-input"
                    />
                  </div>
                </div>

                <div className="dashboard-test-actions">
                  <button
                    type="button"
                    className="dashboard-test-button dashboard-test-button--primary"
                    onClick={handleUpdate}
                    disabled={saving || deleting}
                  >
                    {saving ? "수정 중..." : "종목 수정"}
                  </button>
                  <button
                    type="button"
                    className="dashboard-test-button dashboard-test-button--danger"
                    onClick={handleDelete}
                    disabled={saving || deleting}
                  >
                    {deleting ? "삭제 중..." : "종목 삭제"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
