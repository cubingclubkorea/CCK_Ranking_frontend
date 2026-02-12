import type { CubeEvent } from "@/entities/cubeEvent";

type EventFeeItem = {
  eventName: string;
  eventFee: number;
};

export type CompetitionFormShape = {
  compName: string;
  compDateStart: string;
  compDateEnd: string;
  joinDateStart: string;
  joinDateEnd: string;
  location: string;
  maxParticipate: number;
  baseFee: number;
  eventFeeList: EventFeeItem[];
};

type CompetitionFormFieldsProps = {
  form: CompetitionFormShape;
  eventOptions: CubeEvent[];
  onChange: (next: CompetitionFormShape) => void;
  showCopyButtons?: boolean;
};

export const CompetitionFormFields = ({
  form,
  eventOptions,
  onChange,
  showCopyButtons = false,
}: CompetitionFormFieldsProps) => {
  void showCopyButtons;

  const update = (patch: Partial<CompetitionFormShape>) => {
    onChange({ ...form, ...patch });
  };

  const updateEventFee = (index: number, patch: Partial<EventFeeItem>) => {
    const next = [...(form.eventFeeList || [])];
    next[index] = { ...next[index], ...patch };
    update({ eventFeeList: next });
  };

  const pad2 = (value: number) => `${value}`.padStart(2, "0");
  const toDateInputNow = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  };
  const toDateTimeInputNow = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}T${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  };

  return (
    <>
      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">기본 정보</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">대회 이름</label>
            <input
              type="text"
              value={form.compName}
              onChange={(e) => update({ compName: e.target.value })}
              placeholder="예: CCK Spring Open"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">대회 장소</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update({ location: e.target.value })}
              placeholder="예: 서울 COEX"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">대회 시작 날짜</label>
              <div className="dashboard-test-inline">
                <input
                  type="date"
                  value={form.compDateStart}
                  onChange={(e) => update({ compDateStart: e.target.value })}
                  className="dashboard-test-input"
                />
                <button
                  type="button"
                  className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                  onClick={() => update({ compDateStart: toDateInputNow() })}
                >
                  현재 시간으로 입력
                </button>
              </div>
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">대회 종료 날짜</label>
              <div className="dashboard-test-inline">
                <input
                  type="date"
                  value={form.compDateEnd}
                  onChange={(e) => update({ compDateEnd: e.target.value })}
                  className="dashboard-test-input"
                />
                <button
                  type="button"
                  className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                  onClick={() => update({ compDateEnd: form.compDateStart })}
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
              <div className="dashboard-test-inline">
                <input
                  type="datetime-local"
                  value={form.joinDateStart}
                  onChange={(e) => update({ joinDateStart: e.target.value })}
                  className="dashboard-test-input"
                />
                <button
                  type="button"
                  className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                  onClick={() => update({ joinDateStart: toDateTimeInputNow() })}
                >
                  현재 시간으로 입력
                </button>
              </div>
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">참가 신청 마감</label>
              <div className="dashboard-test-inline">
                <input
                  type="datetime-local"
                  value={form.joinDateEnd}
                  onChange={(e) => update({ joinDateEnd: e.target.value })}
                  className="dashboard-test-input"
                />
                <button
                  type="button"
                  className="dashboard-test-button dashboard-test-button--subtle dashboard-test-button--mini"
                  onClick={() => update({ joinDateEnd: form.joinDateStart })}
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
                onChange={(e) => update({ maxParticipate: Number(e.target.value) })}
                placeholder="예: 120"
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">기본 참가비</label>
              <input
                type="number"
                value={form.baseFee}
                onChange={(e) => update({ baseFee: Number(e.target.value) })}
                placeholder="예: 10000"
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
              update({
                eventFeeList: [...(form.eventFeeList || []), { eventName: "", eventFee: 0 }],
              })
            }
          >
            + 종목 추가
          </button>
        </div>
        <div className="dashboard-test-grid">
          {form.eventFeeList?.map((eventFee, index) => (
            <div key={`${eventFee.eventName}-${index}`} className="dashboard-test-row">
              <select
                value={eventFee.eventName}
                onChange={(e) => updateEventFee(index, { eventName: e.target.value })}
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
                onChange={(e) => updateEventFee(index, { eventFee: Number(e.target.value) })}
                placeholder="참가비"
                className="dashboard-test-input"
              />
              <button
                type="button"
                className="dashboard-test-button dashboard-test-button--danger"
                onClick={() => {
                  const next = form.eventFeeList?.filter((_, i) => i !== index);
                  update({ eventFeeList: next || [] });
                }}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
