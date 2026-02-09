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

export const RecordCUDTestPage = () => {
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
    idx: 1,
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px' }}>
      <h1>Record CUD API 테스트</h1>

      {/* ADD PLAYER */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>➕ 플레이어 추가 (Add Player)</h2>
        <button onClick={addPlayerItem} style={{ marginBottom: '10px', padding: '5px 10px' }}>
          + 플레이어 추가
        </button>
        {playerList.map((player, index) => (
          <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>플레이어 #{index + 1}</h4>
              <button onClick={() => removePlayerItem(index)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}>
                삭제
              </button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>pdx (플레이어 ID)</label>
                  <input
                    type="number"
                    value={player.pdx}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], pdx: Number(e.target.value) };
                      setPlayerList(newList);
                    }}
                    placeholder="1"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>name (이름)</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], name: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="홍길동"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>state (국가)</label>
                  <input
                    type="text"
                    value={player.state}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], state: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="KOR"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>cckId (CCK 아이디)</label>
                  <input
                    type="text"
                    value={player.cckId}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], cckId: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="test123"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>roundIdx (라운드 ID)</label>
                  <input
                    type="number"
                    value={player.roundIdx}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], roundIdx: Number(e.target.value) };
                      setPlayerList(newList);
                    }}
                    placeholder="1"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>roundGroup (그룹)</label>
                  <input
                    type="text"
                    value={player.roundGroup}
                    onChange={(e) => {
                      const newList = [...playerList];
                      newList[index] = { ...newList[index], roundGroup: e.target.value };
                      setPlayerList(newList);
                    }}
                    placeholder="A"
                    style={{ padding: '8px', width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>note (비고)</label>
                <input
                  type="text"
                  value={player.note || ''}
                  onChange={(e) => {
                    const newList = [...playerList];
                    newList[index] = { ...newList[index], note: e.target.value };
                    setPlayerList(newList);
                  }}
                  placeholder="비고 사항"
                  style={{ padding: '8px', width: '100%' }}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleAddPlayer}
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
        >
          플레이어 추가
        </button>
      </div>

      {/* UPDATE RECORD */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>✏️ 기록 업데이트 (Update Record)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>idx (기록 ID)</label>
            <input
              type="number"
              value={updateForm.idx}
              onChange={(e) => setUpdateForm({ ...updateForm, idx: Number(e.target.value) })}
              placeholder="1"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>times (기록 타임 배열)</label>
            <input
              type="text"
              value={updateForm.times.join(', ')}
              onChange={(e) => {
                const times = e.target.value.split(',').map(t => parseFloat(t.trim())).filter(n => !isNaN(n));
                setUpdateForm({ ...updateForm, times });
              }}
              placeholder="12.34, 13.45, 14.56, 15.67, 16.78"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <button
            onClick={handleUpdateRecord}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            기록 업데이트
          </button>
        </div>
      </div>

      {/* DELETE RECORD */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>🗑️ 기록 삭제 (Delete Record)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>idx (기록 ID)</label>
            <input
              type="number"
              value={deleteIdx}
              onChange={(e) => setDeleteIdx(Number(e.target.value))}
              placeholder="1"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <button
            onClick={handleDeleteRecord}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            기록 삭제
          </button>
        </div>
      </div>

      {/* QUIT RECORD */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>🚫 기권 처리 (Quit Record)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>partList (기록 ID 목록)</label>
            <input
              type="text"
              value={quitList}
              onChange={(e) => setQuitList(e.target.value)}
              placeholder="1,2,3"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <button
            onClick={handleQuitRecord}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            기권 처리
          </button>
        </div>
      </div>

      {/* ADVANCE PLAYER */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>⬆️ 어드밴스 처리 (Advance Player)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>pastRoundIdx (이전 라운드 ID)</label>
              <input
                type="number"
                value={advanceForm.pastRoundIdx}
                onChange={(e) => setAdvanceForm({ ...advanceForm, pastRoundIdx: Number(e.target.value) })}
                placeholder="1"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>advanceRoundIdx (다음 라운드 ID)</label>
              <input
                type="number"
                value={advanceForm.advanceRoundIdx}
                onChange={(e) => setAdvanceForm({ ...advanceForm, advanceRoundIdx: Number(e.target.value) })}
                placeholder="2"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <button
            onClick={handleAdvancePlayer}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            어드밴스 처리
          </button>
        </div>
      </div>

      {/* ADD EXTRA */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>➕ 추가 시도 (Add Extra)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>recordIdx (기록 ID)</label>
              <input
                type="number"
                value={extraForm.recordIdx}
                onChange={(e) => setExtraForm({ ...extraForm, recordIdx: Number(e.target.value) })}
                placeholder="1"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>extraNum (추가 시도 번호)</label>
              <input
                type="number"
                value={extraForm.extraNum}
                onChange={(e) => setExtraForm({ ...extraForm, extraNum: Number(e.target.value) })}
                placeholder="1"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>extraTry (시도 횟수)</label>
              <input
                type="number"
                value={extraForm.extraTry}
                onChange={(e) => setExtraForm({ ...extraForm, extraTry: Number(e.target.value) })}
                placeholder="1"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>extraReason (추가 사유)</label>
              <input
                type="text"
                value={extraForm.extraReason}
                onChange={(e) => setExtraForm({ ...extraForm, extraReason: e.target.value })}
                placeholder="추가 시도 사유"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <button
            onClick={handleAddExtra}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            추가 시도 추가
          </button>
        </div>
      </div>

      {/* DELETE EXTRA */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>❌ 추가 시도 삭제 (Delete Extra)</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>recordIdx (기록 ID)</label>
              <input
                type="number"
                value={deleteExtraRecordIdx}
                onChange={(e) => setDeleteExtraRecordIdx(Number(e.target.value))}
                placeholder="1"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>extraNum (추가 시도 번호)</label>
              <input
                type="number"
                value={deleteExtraNum}
                onChange={(e) => setDeleteExtraNum(Number(e.target.value))}
                placeholder="1"
                style={{ padding: '8px', width: '100%' }}
              />
            </div>
          </div>
          <button
            onClick={handleDeleteExtra}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            추가 시도 삭제
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
