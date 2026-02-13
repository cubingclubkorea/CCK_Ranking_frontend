import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCubeEventList } from "@/entities/cubeEvent";
import type { CubeEvent, ColorType } from "@/entities/cubeEvent/model/cubeEvent";
import { ColorType as ColorTypeValue } from "@/entities/cubeEvent/model/cubeEvent";
import { createCubeEvent } from "@/features/cubeEvent";

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
  [ColorTypeValue.tetra]: "정사면체 (피라밍크스류)",
  [ColorTypeValue.dode]: "정십이면체 (메가밍크스류)",
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
    return "알 수 없는 에러";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <div className="admin-page">
      {notice && (
        <div className="dashboard-test-status dashboard-test-status--success">
          <img className="status-icon" src="/icon/info/check.svg" alt="" aria-hidden="true" />
          {notice}
        </div>
      )}
      {loading && <div className="dashboard-test-status">로딩 중...</div>}
      {error && (
        <div className="dashboard-test-status dashboard-test-status--error">
          <img className="status-icon" src="/icon/info/error.svg" alt="" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="admin-header">
        <div className="page-title-area round-title-area">
          <div className="page-title-icon" aria-hidden="true">
            <img src="/icon/sidebar/cube.svg" alt="" loading="lazy" />
          </div>
          <div className="round-title-text">
            <h1 className="page-title">큐브 종목 관리</h1>
            <div className="page-title-meta">
              <span>Manage Cube Events</span>
              <span className="page-title-meta-divider">·</span>
              <span>총 {events.length}개</span>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="page-action-btn"
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
          >
            <img className="page-action-icon" src="/icon/button/plus.svg" alt="" aria-hidden="true" />
            종목 추가
          </button>
        </div>
      </div>

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
                onClick={() => setSelectedEvent(event)}
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
                {createError && (
                  <div className="dashboard-test-status dashboard-test-status--error">
                    <img className="status-icon" src="/icon/info/error.svg" alt="" aria-hidden="true" />
                    {createError}
                  </div>
                )}
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
                    src={`/icon/events/${encodeURIComponent(selectedEvent.eventName || "Question")}.svg`}
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

                <div className="record-modal-row">
                  <span className="record-modal-label">종목명</span>
                  <span className="record-modal-value">{selectedEvent.eventName}</span>
                </div>
                <div className="record-modal-row">
                  <span className="record-modal-label">평균 계산 방식</span>
                  <span className="record-modal-value">{selectedEvent.avgCalc}</span>
                </div>
                <div className="record-modal-row">
                  <span className="record-modal-label">큐브 구분</span>
                  <span className="record-modal-value">{colorTypeLabelMap[selectedEvent.colorType]}</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
