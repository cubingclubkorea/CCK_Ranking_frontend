import { useState } from 'react';
import {
  createCompetition,
  updateCompetition,
  deleteCompetition,
  type CompetitionCreateDTO,
  type CompetitionUpdateDTO,
} from '@/features/competition';
import { createApiHandler } from '@/shared';

export const CompetitionCUDTestPage = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 핸들러 생성
  const handleApi = createApiHandler(setLoading, setError, setResult);

  // Create Form State
  const [createForm, setCreateForm] = useState<CompetitionCreateDTO>({
    compName: '테스트 대회',
    compDateStart: '2026-03-01',
    compDateEnd: '2026-03-02',
    joinDateStart: '2026-02-01T09:00:00',
    joinDateEnd: '2026-02-28T23:59:59',
    baseFee: 10000,
    location: '서울',
    maxParticipate: 100,
    eventFeeList: [
      { eventName: '3x3x3', eventFee: 7000 },
    ],
  });

  // Update Form State
  const [updateForm, setUpdateForm] = useState<CompetitionUpdateDTO>({
    idx: 1,
    compName: '수정된 대회',
    compDateStart: '2026-04-01',
    compDateEnd: '2026-04-02',
    joinDateStart: '2026-03-01T09:00:00',
    joinDateEnd: '2026-03-31T23:59:59',
    baseFee: 15000,
    location: '부산',
    maxParticipate: 150,
    eventFeeList: [
      { eventName: '3x3x3', eventFee: 7000 },
    ],
  });

  // Delete State
  const [deleteIdx, setDeleteIdx] = useState<number>(1);

  const handleCreate = () => handleApi(
    () => createCompetition(createForm),
    '대회 생성 성공!'
  );

  const handleUpdate = () => handleApi(
    () => updateCompetition(updateForm),
    '대회 수정 성공!'
  );

  const handleDelete = () => handleApi(
    () => deleteCompetition(deleteIdx),
    `대회 ${deleteIdx} 삭제 성공!`
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <h1>Competition CUD API 테스트</h1>

      {/* CREATE */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>➕ 대회 생성 (Create)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>compName (대회명)</label>
            <input
              type="text"
              value={createForm.compName}
              onChange={(e) => setCreateForm({ ...createForm, compName: e.target.value })}
              placeholder="테스트 대회"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>compDateStart (대회 시작일)</label>
              <input
                type="date"
                value={createForm.compDateStart}
                onChange={(e) => setCreateForm({ ...createForm, compDateStart: e.target.value })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>compDateEnd (대회 종료일)</label>
              <input
                type="date"
                value={createForm.compDateEnd}
                onChange={(e) => setCreateForm({ ...createForm, compDateEnd: e.target.value })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>joinDateStart (참가 신청 시작)</label>
              <input
                type="datetime-local"
                value={createForm.joinDateStart}
                onChange={(e) => setCreateForm({ ...createForm, joinDateStart: e.target.value + ':00' })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>joinDateEnd (참가 신청 마감)</label>
              <input
                type="datetime-local"
                value={createForm.joinDateEnd}
                onChange={(e) => setCreateForm({ ...createForm, joinDateEnd: e.target.value + ':00' })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>baseFee (기본 참가비)</label>
              <input
                type="number"
                value={createForm.baseFee}
                onChange={(e) => setCreateForm({ ...createForm, baseFee: Number(e.target.value) })}
                placeholder="10000"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>location (장소)</label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="서울"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>maxParticipate (최대 참가자)</label>
              <input
                type="number"
                value={createForm.maxParticipate}
                onChange={(e) => setCreateForm({ ...createForm, maxParticipate: Number(e.target.value) })}
                placeholder="100"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          
          {/* EventFeeList for Create */}
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>이벤트별 참가비</h4>
              <button
                onClick={() => setCreateForm({
                  ...createForm,
                  eventFeeList: [...(createForm.eventFeeList || []), { eventName: '', eventFee: 0 }]
                })}
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                + 추가
              </button>
            </div>
            {createForm.eventFeeList?.map((eventFee, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                <input
                  type="text"
                  value={eventFee.eventName}
                  onChange={(e) => {
                    const newList = [...(createForm.eventFeeList || [])];
                    newList[index] = { ...newList[index], eventName: e.target.value };
                    setCreateForm({ ...createForm, eventFeeList: newList });
                  }}
                  placeholder="이벤트명"
                  style={{ padding: '5px', flex: 1 }}
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
                  style={{ padding: '5px', width: '120px' }}
                />
                <button
                  onClick={() => {
                    const newList = createForm.eventFeeList?.filter((_, i) => i !== index);
                    setCreateForm({ ...createForm, eventFeeList: newList });
                  }}
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            대회 생성
          </button>
        </div>
      </div>

      {/* UPDATE */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>✏️ 대회 수정 (Update)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>idx (대회 ID)</label>
            <input
              type="number"
              value={updateForm.idx}
              onChange={(e) => setUpdateForm({ ...updateForm, idx: Number(e.target.value) })}
              placeholder="1"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>compName (대회명)</label>
            <input
              type="text"
              value={updateForm.compName}
              onChange={(e) => setUpdateForm({ ...updateForm, compName: e.target.value })}
              placeholder="수정된 대회"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>compDateStart (대회 시작일)</label>
              <input
                type="date"
                value={updateForm.compDateStart}
                onChange={(e) => setUpdateForm({ ...updateForm, compDateStart: e.target.value })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>compDateEnd (대회 종료일)</label>
              <input
                type="date"
                value={updateForm.compDateEnd}
                onChange={(e) => setUpdateForm({ ...updateForm, compDateEnd: e.target.value })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>joinDateStart (참가 신청 시작)</label>
              <input
                type="datetime-local"
                value={updateForm.joinDateStart}
                onChange={(e) => setUpdateForm({ ...updateForm, joinDateStart: e.target.value + ':00' })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>joinDateEnd (참가 신청 마감)</label>
              <input
                type="datetime-local"
                value={updateForm.joinDateEnd}
                onChange={(e) => setUpdateForm({ ...updateForm, joinDateEnd: e.target.value + ':00' })}
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>baseFee (기본 참가비)</label>
              <input
                type="number"
                value={updateForm.baseFee}
                onChange={(e) => setUpdateForm({ ...updateForm, baseFee: Number(e.target.value) })}
                placeholder="15000"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>location (장소)</label>
              <input
                type="text"
                value={updateForm.location}
                onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })}
                placeholder="부산"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>maxParticipate (최대 참가자)</label>
              <input
                type="number"
                value={updateForm.maxParticipate}
                onChange={(e) => setUpdateForm({ ...updateForm, maxParticipate: Number(e.target.value) })}
                placeholder="150"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          
          {/* EventFeeList for Update */}
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>이벤트별 참가비</h4>
              <button
                onClick={() => setUpdateForm({
                  ...updateForm,
                  eventFeeList: [...(updateForm.eventFeeList || []), { eventName: '', eventFee: 0 }]
                })}
                style={{ padding: '5px 10px', fontSize: '12px' }}
              >
                + 추가
              </button>
            </div>
            {updateForm.eventFeeList?.map((eventFee, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                <input
                  type="text"
                  value={eventFee.eventName}
                  onChange={(e) => {
                    const newList = [...(updateForm.eventFeeList || [])];
                    newList[index] = { ...newList[index], eventName: e.target.value };
                    setUpdateForm({ ...updateForm, eventFeeList: newList });
                  }}
                  placeholder="이벤트명"
                  style={{ padding: '5px', flex: 1 }}
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
                  style={{ padding: '5px', width: '120px' }}
                />
                <button
                  onClick={() => {
                    const newList = updateForm.eventFeeList?.filter((_, i) => i !== index);
                    setUpdateForm({ ...updateForm, eventFeeList: newList });
                  }}
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            대회 수정
          </button>
        </div>
      </div>

      {/* DELETE */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>🗑️ 대회 삭제 (Delete)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>idx (대회 ID)</label>
            <input
              type="number"
              value={deleteIdx}
              onChange={(e) => setDeleteIdx(Number(e.target.value))}
              placeholder="1"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            대회 삭제
          </button>
        </div>
      </div>

      {/* STATUS */}
      {loading && <p style={{ color: 'blue', fontWeight: 'bold' }}>⏳ 로딩 중...</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>❌ 에러: {error}</p>}
      {result && <p style={{ color: 'green', fontWeight: 'bold', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '5px' }}>✅ {result}</p>}
    </div>
  );
};
