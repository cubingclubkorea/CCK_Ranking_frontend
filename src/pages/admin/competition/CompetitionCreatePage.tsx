import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCompetition, type CompetitionCreateDTO } from "@/features/competition";
import { getCubeEventList } from "@/entities/cubeEvent";
import type { CubeEvent } from "@/entities/cubeEvent";

export const CompetitionCreatePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventOptions, setEventOptions] = useState<CubeEvent[]>([]);
  const navigate = useNavigate();

  const [form, setForm] = useState<CompetitionCreateDTO>({
    compName: "",
    compDateStart: "",
    compDateEnd: "",
    joinDateStart: "",
    joinDateEnd: "",
    location: "",
    maxParticipate: 0,
    baseFee: 0,
    eventFeeList: [{ eventName: "", eventFee: 0 }],
  });

  const addSeconds = (value: string) => (value ? `${value}:00` : "");

  useEffect(() => {
    let mounted = true;

    const fetchEvents = async () => {
      try {
        const data = await getCubeEventList();
        if (mounted) setEventOptions(data);
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : "알 수 없는 에러";
          setError(errorMessage);
        }
      }
    };

    fetchEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!form.compName || !form.compDateStart || !form.compDateEnd) {
      setError("대회명과 대회 기간을 입력해주세요.");
      return;
    }

    const payload: CompetitionCreateDTO = {
      ...form,
      joinDateStart: addSeconds(form.joinDateStart),
      joinDateEnd: addSeconds(form.joinDateEnd),
    };

    setLoading(true);
    setError(null);
    try {
      await createCompetition(payload);
      navigate("/admin/competition", { state: { notice: "대회가 생성되었습니다!" } });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 에러";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">대회 만들기</h1>
          <p className="admin-subtitle">기본 정보와 종목별 참가비를 등록하세요.</p>
        </div>
        <div className="admin-actions">
          <Link className="dashboard-test-button" to="/admin/competition">
            <img className="admin-back-icon" src="/icon/button/back.svg" alt="" aria-hidden="true" />
            목록으로
          </Link>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">기본 정보</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">대회 이름</label>
            <input
              type="text"
              value={form.compName}
              onChange={(e) => setForm({ ...form, compName: e.target.value })}
              placeholder="예: CCK Spring Open"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">대회 장소</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="예: 서울 COEX"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">대회 시작 날짜</label>
              <input
                type="date"
                value={form.compDateStart}
                onChange={(e) => setForm({ ...form, compDateStart: e.target.value })}
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">대회 종료 날짜</label>
              <div className="dashboard-test-inline">
                <input
                  type="date"
                  value={form.compDateEnd}
                  onChange={(e) => setForm({ ...form, compDateEnd: e.target.value })}
                  className="dashboard-test-input"
                />
                <button
                  type="button"
                  className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                  onClick={() => setForm({ ...form, compDateEnd: form.compDateStart })}
                  disabled={!form.compDateStart}
                >
                  시작일 복사
                </button>
              </div>
            </div>
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">참가 신청 시작</label>
            <input
              type="datetime-local"
              value={form.joinDateStart}
              onChange={(e) => setForm({ ...form, joinDateStart: e.target.value })}
              className="dashboard-test-input"
            />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">참가 신청 마감</label>
              <div className="dashboard-test-inline">
                <input
                  type="datetime-local"
                  value={form.joinDateEnd}
                  onChange={(e) => setForm({ ...form, joinDateEnd: e.target.value })}
                  className="dashboard-test-input"
                />
                <button
                  type="button"
                  className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                  onClick={() => setForm({ ...form, joinDateEnd: form.joinDateStart })}
                  disabled={!form.joinDateStart}
                >
                  시작일 복사
                </button>
              </div>
            </div>
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">최대 참가 인원</label>
              <input
                type="number"
                value={form.maxParticipate}
                onChange={(e) => setForm({ ...form, maxParticipate: Number(e.target.value) })}
                placeholder="예: 120"
                className="dashboard-test-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-test-section">
        <div className="dashboard-test-card-header">
          <h2 className="dashboard-test-section-title">참가비</h2>
          <button
            type="button"
            className="dashboard-test-button dashboard-test-button--subtle"
            onClick={() =>
              setForm({
                ...form,
                eventFeeList: [...(form.eventFeeList || []), { eventName: "", eventFee: 0 }],
              })
            }
          >
            + 종목 추가
          </button>
        </div>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">기본 참가비</label>
            <input
              type="number"
              value={form.baseFee}
              onChange={(e) => setForm({ ...form, baseFee: Number(e.target.value) })}
              placeholder="예: 10000"
              className="dashboard-test-input"
            />
          </div>
          {form.eventFeeList?.map((eventFee, index) => (
            <div key={`${eventFee.eventName}-${index}`} className="dashboard-test-row">
              <select
                value={eventFee.eventName}
                onChange={(e) => {
                  const next = [...(form.eventFeeList || [])];
                  next[index] = { ...next[index], eventName: e.target.value };
                  setForm({ ...form, eventFeeList: next });
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
              <input
                type="number"
                value={eventFee.eventFee}
                onChange={(e) => {
                  const next = [...(form.eventFeeList || [])];
                  next[index] = { ...next[index], eventFee: Number(e.target.value) };
                  setForm({ ...form, eventFeeList: next });
                }}
                placeholder="참가비"
                className="dashboard-test-input"
              />
              <button
                type="button"
                className="dashboard-test-button dashboard-test-button--danger"
                onClick={() => {
                  const next = form.eventFeeList?.filter((_, i) => i !== index);
                  setForm({ ...form, eventFeeList: next });
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-test-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--primary"
        >
          대회 만들기
        </button>
      </div>

      {loading && <div className="dashboard-test-status">로딩 중...</div>}
      {error && <div className="dashboard-test-status dashboard-test-status--error">에러: {error}</div>}
    </div>
  );
};
