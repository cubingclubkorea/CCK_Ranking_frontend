import { useState } from 'react';
import {
  addPlayer,
  updateRecord,
  deleteRecord,
  quitRecord,
  advancePlayer,
  addExtra,
  deleteExtra,
  type PlayerAddDTO,
  type RecordUpdateDTO,
  type AdvanceRequestDTO,
  type ExtraDTO,
} from '@/features/record';
import { createApiHandler } from '@/shared';

export const ApiDashboardRecordCUDTestPage = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 핸들러 생성
  const handleApi = createApiHandler(setLoading, setError, setResult);

  // Add Player Form State (리스트)
  const [playerList, setPlayerList] = useState<PlayerAddDTO[]>([
    {
      pdx: 1,
      name: '홍길동',
      state: 'KOR',
      cckId: 'test123',
      roundIdx: 1,
      roundGroup: 'A',
      note: '',
    },
  ]);

  // Update Record Form State
  const [updateForm, setUpdateForm] = useState<RecordUpdateDTO>({
    recordIdx: 1,
    times: [12.34, 13.45, 14.56, 15.67, 16.78],
  });

  // Delete State
  const [deleteIdx, setDeleteIdx] = useState<number>(1);

  // Quit State
  const [quitList, setQuitList] = useState<string>('1,2,3');

  // Advance State
  const [advanceForm, setAdvanceForm] = useState<AdvanceRequestDTO>({
    pastRoundIdx: 1,
    advanceRoundIdx: 2,
  });

  // Extra State
  const [extraForm, setExtraForm] = useState<ExtraDTO>({
    recordIdx: 1,
    extraNum: 1,
    extraTry: 1,
    extraReason: '추가 시도 사유',
  });

  const [deleteExtraRecordIdx, setDeleteExtraRecordIdx] = useState<number>(1);
  const [deleteExtraNum, setDeleteExtraNum] = useState<number>(1);

  const handleAddPlayer = () => handleApi(
    () => addPlayer(playerList),
    '플레이어 추가 성공!'
  );

  const handleUpdateRecord = () => handleApi(
    () => updateRecord(updateForm),
    '기록 업데이트 성공!'
  );

  const handleDeleteRecord = () => handleApi(
    () => deleteRecord(deleteIdx),
    `기록 ${deleteIdx} 삭제 성공!`
  );

  const handleQuitRecord = () => {
    const partList = quitList.split(',').map(num => Number(num.trim())).filter(n => !isNaN(n));
    return handleApi(
      () => quitRecord(partList),
      '기권 처리 성공!'
    );
  };

  const handleAdvancePlayer = () => handleApi(
    () => advancePlayer(advanceForm),
    '어드밴스 성공!'
  );

  const handleAddExtra = () => handleApi(
    () => addExtra(extraForm),
    '추가 시도 추가 성공!'
  );

  const handleDeleteExtra = () => handleApi(
    () => deleteExtra(deleteExtraRecordIdx, deleteExtraNum),
    `추가 시도 삭제 성공!`
  );

  const addPlayerItem = () => {
    setPlayerList([
      ...playerList,
      {
        pdx: 1,
        name: '',
        state: '',
        cckId: '',
        roundIdx: 1,
        roundGroup: '',
        note: '',
      },
    ]);
  };

  const removePlayerItem = (index: number) => {
    setPlayerList(playerList.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard-test-page">
      <h1 className="dashboard-test-title">Record CUD API 테스트</h1>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">➕ 플레이어 추가 (Add Player)</h2>
        <button onClick={addPlayerItem} className="dashboard-test-button dashboard-test-button--subtle">
          + 플레이어 추가
        </button>
        {playerList.map((player, index) => (
          <div key={index} className="dashboard-test-card">
            <div className="dashboard-test-card-header">
              <h4 className="dashboard-test-card-title">플레이어 #{index + 1}</h4>
              <button
                onClick={() => removePlayerItem(index)}
                className="dashboard-test-button dashboard-test-button--danger"
              >
                삭제
              </button>
            </div>
            <div className="dashboard-test-grid">
              <div className="dashboard-test-grid dashboard-test-grid-3">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">pdx (플레이어 ID)</label>
                  <input
                    type="number"
                    value={player.pdx}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], pdx: Number(e.target.value) };
                      setPlayerList(newList);
                    }}
                    placeholder="1"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">name (이름)</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], name: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="홍길동"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">state (국가)</label>
                  <input
                    type="text"
                    value={player.state}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], state: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="KOR"
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-grid dashboard-test-grid-3">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">cckId (CCK 아이디)</label>
                  <input
                    type="text"
                    value={player.cckId}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], cckId: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="test123"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">roundIdx (라운드 ID)</label>
                  <input
                    type="number"
                    value={player.roundIdx}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], roundIdx: Number(e.target.value) };
                      setPlayerList(newList);
                    }}
                    placeholder="1"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">roundGroup (그룹)</label>
                  <input
                    type="text"
                    value={player.roundGroup}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], roundGroup: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="A"
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">note (비고)</label>
                <input
                  type="text"
                  value={player.note || ''}
                  onChange={(e) => {
                    const newList = [...playerList];
                    newList[index] = { ...newList[index], note: e.target.value };
                    setPlayerList(newList);
                  }}
                  placeholder="비고 사항"
                  className="dashboard-test-input"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleAddPlayer}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--success"
        >
          플레이어 추가
        </button>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">✏️ 기록 업데이트 (Update Record)</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">recordIdx (기록 ID)</label>
            <input
              type="number"
              value={updateForm.recordIdx ?? ''}
              onChange={(e) => setUpdateForm({ ...updateForm, recordIdx: Number(e.target.value) })}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">times (기록 타임 배열)</label>
            <input
              type="text"
              value={updateForm.times.join(', ')}
              onChange={(e) => {
                const times = e.target.value.split(',').map(t => parseFloat(t.trim())).filter(n => !isNaN(n));
                setUpdateForm({ ...updateForm, times });
              }}
              placeholder="12.34, 13.45, 14.56, 15.67, 16.78"
              className="dashboard-test-input"
            />
          </div>
          <button
            onClick={handleUpdateRecord}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--primary"
          >
            기록 업데이트
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">🗑️ 기록 삭제 (Delete Record)</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">idx (기록 ID)</label>
            <input
              type="number"
              value={deleteIdx}
              onChange={(e) => setDeleteIdx(Number(e.target.value))}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <button
            onClick={handleDeleteRecord}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--danger"
          >
            기록 삭제
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">🚫 기권 처리 (Quit Record)</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">partList (기록 ID 목록)</label>
            <input
              type="text"
              value={quitList}
              onChange={(e) => setQuitList(e.target.value)}
              placeholder="1,2,3"
              className="dashboard-test-input"
            />
          </div>
          <button
            onClick={handleQuitRecord}
            disabled={loading}
            className="dashboard-test-button"
          >
            기권 처리
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">⬆️ 어드밴스 처리 (Advance Player)</h2>
        <div className="dashboard-test-grid dashboard-test-grid-2">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">pastRoundIdx (이전 라운드 ID)</label>
            <input
              type="number"
              value={advanceForm.pastRoundIdx}
              onChange={(e) => setAdvanceForm({ ...advanceForm, pastRoundIdx: Number(e.target.value) })}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">advanceRoundIdx (다음 라운드 ID)</label>
            <input
              type="number"
              value={advanceForm.advanceRoundIdx}
              onChange={(e) => setAdvanceForm({ ...advanceForm, advanceRoundIdx: Number(e.target.value) })}
              placeholder="2"
              className="dashboard-test-input"
            />
          </div>
        </div>
        <button
          onClick={handleAdvancePlayer}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--primary"
        >
          어드밴스 처리
        </button>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">➕ 추가 시도 (Add Extra)</h2>
        <div className="dashboard-test-grid dashboard-test-grid-2">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">recordIdx (기록 ID)</label>
            <input
              type="number"
              value={extraForm.recordIdx}
              onChange={(e) => setExtraForm({ ...extraForm, recordIdx: Number(e.target.value) })}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">extraNum (추가 시도 번호)</label>
            <input
              type="number"
              value={extraForm.extraNum}
              onChange={(e) => setExtraForm({ ...extraForm, extraNum: Number(e.target.value) })}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
        </div>
        <div className="dashboard-test-grid dashboard-test-grid-2">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">extraTry (시도 횟수)</label>
            <input
              type="number"
              value={extraForm.extraTry}
              onChange={(e) => setExtraForm({ ...extraForm, extraTry: Number(e.target.value) })}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">extraReason (추가 사유)</label>
            <input
              type="text"
              value={extraForm.extraReason}
              onChange={(e) => setExtraForm({ ...extraForm, extraReason: e.target.value })}
              placeholder="추가 시도 사유"
              className="dashboard-test-input"
            />
          </div>
        </div>
        <button
          onClick={handleAddExtra}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--success"
        >
          추가 시도 추가
        </button>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">❌ 추가 시도 삭제 (Delete Extra)</h2>
        <div className="dashboard-test-grid dashboard-test-grid-2">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">recordIdx (기록 ID)</label>
            <input
              type="number"
              value={deleteExtraRecordIdx}
              onChange={(e) => setDeleteExtraRecordIdx(Number(e.target.value))}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">extraNum (추가 시도 번호)</label>
            <input
              type="number"
              value={deleteExtraNum}
              onChange={(e) => setDeleteExtraNum(Number(e.target.value))}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
        </div>
        <button
          onClick={handleDeleteExtra}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--danger"
        >
          추가 시도 삭제
        </button>
      </div>

      {loading && <div className="dashboard-test-status">로딩 중...</div>}
      {error && <div className="dashboard-test-status dashboard-test-status--error">에러: {error}</div>}
      {result && <div className="dashboard-test-status dashboard-test-status--success">✅ {result}</div>}
    </div>
  );
};
