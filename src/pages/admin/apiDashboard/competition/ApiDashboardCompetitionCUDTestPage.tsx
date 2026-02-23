import { useState } from "react";
import { createCompetition, updateCompetition, deleteCompetition, type CompetitionCreateDTO, type CompetitionUpdateDTO } from "@/features/competition";
import { createApiHandler } from "@/shared";
import { OverlayToast } from "@/widgets";

export const ApiDashboardCompetitionCUDTestPage = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 핸들러 생성
  const handleApi = createApiHandler(setLoading, setError, setResult);

  // Create Form State
  const [createForm, setCreateForm] = useState<CompetitionCreateDTO>({
    compName: "테스트 대회",
    compDateStart: "2026-03-01",
    compDateEnd: "2026-03-02",
    joinDateStart: "2026-02-01T09:00:00",
    joinDateEnd: "2026-02-28T23:59:59",
    baseFee: 10000,
    location: "서울",
    maxParticipate: 100,
    eventFeeList: [{ eventName: "3x3x3", eventFee: 7000 }],
  });

  // Update Form State
  const [updateForm, setUpdateForm] = useState<CompetitionUpdateDTO>({
    idx: 1,
    compName: "수정된 대회",
    compDateStart: "2026-04-01",
    compDateEnd: "2026-04-02",
    joinDateStart: "2026-03-01T09:00:00",
    joinDateEnd: "2026-03-31T23:59:59",
    baseFee: 15000,
    location: "부산",
    maxParticipate: 150,
    eventFeeList: [{ eventName: "3x3x3", eventFee: 7000 }],
  });

  // Delete State
  const [deleteIdx, setDeleteIdx] = useState<number>(1);

  const handleCreate = () =>
    handleApi(async () => {
      await createCompetition(createForm);
    }, "대회 생성 성공!");

  const handleUpdate = () =>
    handleApi(async () => {
      await updateCompetition(updateForm);
    }, "대회 수정 성공!");

  const handleDelete = () => handleApi(() => deleteCompetition(deleteIdx), `대회 ${deleteIdx} 삭제 성공!`);

  const toast = error
    ? { variant: "error" as const, message: error, onClose: () => setError(null) }
    : result
      ? { variant: "success" as const, message: result, onClose: () => setResult(null) }
      : null;

  return (
    <div className="dashboard-test-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ""}
        onClose={toast?.onClose}
      />
      <h1 className="dashboard-test-title">Competition CUD API 테스트</h1>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">➕ 대회 생성 (Create)</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">compName (대회명)</label>
            <input
              type="text"
              value={createForm.compName}
              onChange={(e) => setCreateForm({ ...createForm, compName: e.target.value })}
              placeholder="테스트 대회"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">compDateStart (대회 시작일)</label>
              <input
                type="date"
                value={createForm.compDateStart}
                onChange={(e) => setCreateForm({ ...createForm, compDateStart: e.target.value })}
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">compDateEnd (대회 종료일)</label>
              <input
                type="date"
                value={createForm.compDateEnd}
                onChange={(e) => setCreateForm({ ...createForm, compDateEnd: e.target.value })}
                className="dashboard-test-input"
              />
            </div>
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">joinDateStart (참가 신청 시작)</label>
              <input
                type="datetime-local"
                value={createForm.joinDateStart}
                onChange={(e) => setCreateForm({ ...createForm, joinDateStart: e.target.value + ":00" })}
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">joinDateEnd (참가 신청 마감)</label>
              <input
                type="datetime-local"
                value={createForm.joinDateEnd}
                onChange={(e) => setCreateForm({ ...createForm, joinDateEnd: e.target.value + ":00" })}
                className="dashboard-test-input"
              />
            </div>
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-3">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">baseFee (기본 참가비)</label>
              <input
                type="number"
                value={createForm.baseFee}
                onChange={(e) => setCreateForm({ ...createForm, baseFee: Number(e.target.value) })}
                placeholder="10000"
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">location (장소)</label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="서울"
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">maxParticipate (최대 참가자)</label>
              <input
                type="number"
                value={createForm.maxParticipate}
                onChange={(e) => setCreateForm({ ...createForm, maxParticipate: Number(e.target.value) })}
                placeholder="100"
                className="dashboard-test-input"
              />
            </div>
          </div>

          <div className="dashboard-test-subsection">
            <div className="dashboard-test-card-header">
              <h4 className="dashboard-test-card-title">이벤트별 참가비</h4>
              <button
                onClick={() =>
                  setCreateForm({
                    ...createForm,
                    eventFeeList: [...(createForm.eventFeeList || []), { eventName: "", eventFee: 0 }],
                  })
                }
                className="dashboard-test-button dashboard-test-button--subtle"
              >
                + 추가
              </button>
            </div>
            {createForm.eventFeeList?.map((eventFee, index) => (
              <div key={index} className="dashboard-test-row">
                <input
                  type="text"
                  value={eventFee.eventName}
                  onChange={(e) => {
                    const newList = [...(createForm.eventFeeList || [])];
                    newList[index] = { ...newList[index], eventName: e.target.value };
                    setCreateForm({ ...createForm, eventFeeList: newList });
                  }}
                  placeholder="이벤트명"
                  className="dashboard-test-input"
                />
                <input
                  type="number"
                  value={eventFee.eventFee}
                  onChange={(e) => {
                    const newList = [...(createForm.eventFeeList || [])];
                    newList[index] = { ...newList[index], eventFee: Number(e.target.value) };
                    setCreateForm({ ...createForm, eventFeeList: newList });
                  }}
                  placeholder="참가비"
                  className="dashboard-test-input"
                />
                <button
                  onClick={() => {
                    const newList = createForm.eventFeeList?.filter((_, i) => i !== index);
                    setCreateForm({ ...createForm, eventFeeList: newList });
                  }}
                  className="dashboard-test-button dashboard-test-button--danger"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--success"
          >
            대회 생성
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">✏️ 대회 수정 (Update)</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">idx (대회 ID)</label>
            <input
              type="number"
              value={updateForm.idx}
              onChange={(e) => setUpdateForm({ ...updateForm, idx: Number(e.target.value) })}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">compName (대회명)</label>
            <input
              type="text"
              value={updateForm.compName}
              onChange={(e) => setUpdateForm({ ...updateForm, compName: e.target.value })}
              placeholder="수정된 대회"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">compDateStart (대회 시작일)</label>
              <input
                type="date"
                value={updateForm.compDateStart}
                onChange={(e) => setUpdateForm({ ...updateForm, compDateStart: e.target.value })}
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">compDateEnd (대회 종료일)</label>
              <input
                type="date"
                value={updateForm.compDateEnd}
                onChange={(e) => setUpdateForm({ ...updateForm, compDateEnd: e.target.value })}
                className="dashboard-test-input"
              />
            </div>
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-2">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">joinDateStart (참가 신청 시작)</label>
              <input
                type="datetime-local"
                value={updateForm.joinDateStart}
                onChange={(e) => setUpdateForm({ ...updateForm, joinDateStart: e.target.value + ":00" })}
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">joinDateEnd (참가 신청 마감)</label>
              <input
                type="datetime-local"
                value={updateForm.joinDateEnd}
                onChange={(e) => setUpdateForm({ ...updateForm, joinDateEnd: e.target.value + ":00" })}
                className="dashboard-test-input"
              />
            </div>
          </div>
          <div className="dashboard-test-grid dashboard-test-grid-3">
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">baseFee (기본 참가비)</label>
              <input
                type="number"
                value={updateForm.baseFee}
                onChange={(e) => setUpdateForm({ ...updateForm, baseFee: Number(e.target.value) })}
                placeholder="15000"
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">location (장소)</label>
              <input
                type="text"
                value={updateForm.location}
                onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                placeholder="부산"
                className="dashboard-test-input"
              />
            </div>
            <div className="dashboard-test-field">
              <label className="dashboard-test-label">maxParticipate (최대 참가자)</label>
              <input
                type="number"
                value={updateForm.maxParticipate}
                onChange={(e) => setUpdateForm({ ...updateForm, maxParticipate: Number(e.target.value) })}
                placeholder="150"
                className="dashboard-test-input"
              />
            </div>
          </div>

          <div className="dashboard-test-subsection">
            <div className="dashboard-test-card-header">
              <h4 className="dashboard-test-card-title">이벤트별 참가비</h4>
              <button
                onClick={() =>
                  setUpdateForm({
                    ...updateForm,
                    eventFeeList: [...(updateForm.eventFeeList || []), { eventName: "", eventFee: 0 }],
                  })
                }
                className="dashboard-test-button dashboard-test-button--subtle"
              >
                + 추가
              </button>
            </div>
            {updateForm.eventFeeList?.map((eventFee, index) => (
              <div key={index} className="dashboard-test-row">
                <input
                  type="text"
                  value={eventFee.eventName}
                  onChange={(e) => {
                    const newList = [...(updateForm.eventFeeList || [])];
                    newList[index] = { ...newList[index], eventName: e.target.value };
                    setUpdateForm({ ...updateForm, eventFeeList: newList });
                  }}
                  placeholder="이벤트명"
                  className="dashboard-test-input"
                />
                <input
                  type="number"
                  value={eventFee.eventFee}
                  onChange={(e) => {
                    const newList = [...(updateForm.eventFeeList || [])];
                    newList[index] = { ...newList[index], eventFee: Number(e.target.value) };
                    setUpdateForm({ ...updateForm, eventFeeList: newList });
                  }}
                  placeholder="참가비"
                  className="dashboard-test-input"
                />
                <button
                  onClick={() => {
                    const newList = updateForm.eventFeeList?.filter((_, i) => i !== index);
                    setUpdateForm({ ...updateForm, eventFeeList: newList });
                  }}
                  className="dashboard-test-button dashboard-test-button--danger"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--primary"
          >
            대회 수정
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">🗑️ 대회 삭제 (Delete)</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">idx (대회 ID)</label>
            <input
              type="number"
              value={deleteIdx}
              onChange={(e) => setDeleteIdx(Number(e.target.value))}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--danger"
          >
            대회 삭제
          </button>
        </div>
      </div>

    </div>
  );
};
