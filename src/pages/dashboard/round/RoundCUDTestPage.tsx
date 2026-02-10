import { useState } from 'react';
import {
  createRound,
  updateRound,
  deleteRound,
  updateAdvance,
  type RoundCreateDTO,
  type RoundUpdateDTO,
} from '@/features/round';

export const RoundCUDTestPage = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Form State (리스트)
  const [createList, setCreateList] = useState<RoundCreateDTO[]>([
    {
      comp: 1,
      cubeEvent: '3x3x3',
      roundName: '1라운드',
      eventStart: '2026-03-01T09:00:00',
      eventEnd: '2026-03-01T12:00:00',
      groupList: ['A', 'B'],
      cutoff: 120,
      timeLimit: 600,
      advance: 10,
    },
  ]);

  // Update Form State (리스트)
  const [updateList, setUpdateList] = useState<RoundUpdateDTO[]>([
    {
      idx: 1,
      comp: 1,
      cubeEvent: '3x3x3',
      roundName: '결승',
      eventStart: '2026-03-01T13:00:00',
      eventEnd: '2026-03-01T16:00:00',
      groupList: ['A'],
      cutoff: 90,
      timeLimit: 600,
      advance: 3,
    },
  ]);

  // Delete State
  const [deleteIdx, setDeleteIdx] = useState<number>(1);

  // Update Advance State
  const [advanceRoundIdx, setAdvanceRoundIdx] = useState<number>(1);
  const [advanceCount, setAdvanceCount] = useState<number>(10);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await createRound(createList);
      setResult('라운드 생성 성공!');
      console.log('생성 성공:', createList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error('생성 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await updateRound(updateList);
      setResult('라운드 수정 성공!');
      console.log('수정 성공:', updateList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error('수정 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await deleteRound(deleteIdx);
      setResult(`라운드 ${deleteIdx} 삭제 성공!`);
      console.log('삭제 성공:', deleteIdx);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error('삭제 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdvance = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await updateAdvance(advanceRoundIdx, advanceCount);
      setResult(`라운드 ${advanceRoundIdx}의 advance를 ${advanceCount}로 변경 성공!`);
      console.log('Advance 변경 성공:', { advanceRoundIdx, advanceCount });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error('Advance 변경 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const addCreateItem = () => {
    setCreateList([
      ...createList,
      {
        comp: 1,
        cubeEvent: '',
        roundName: '',
        eventStart: '',
        eventEnd: '',
        groupList: [],
        advance: 0,
      },
    ]);
  };

  const removeCreateItem = (index: number) => {
    setCreateList(createList.filter((_, i) => i !== index));
  };

  const addUpdateItem = () => {
    setUpdateList([
      ...updateList,
      {
        idx: 1,
        comp: 1,
        cubeEvent: '',
        roundName: '',
        eventStart: '',
        eventEnd: '',
        groupList: [],
        advance: 0,
      },
    ]);
  };

  const removeUpdateItem = (index: number) => {
    setUpdateList(updateList.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard-test-page">
      <h1 className="dashboard-test-title">Round CUD API 테스트</h1>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">➕ 라운드 생성 (Create)</h2>
        <button onClick={addCreateItem} className="dashboard-test-button dashboard-test-button--subtle">
          + 라운드 추가
        </button>
        {createList.map((item, index) => (
          <div key={index} className="dashboard-test-card">
            <div className="dashboard-test-card-header">
              <h4 className="dashboard-test-card-title">라운드 #{index + 1}</h4>
              <button
                onClick={() => removeCreateItem(index)}
                className="dashboard-test-button dashboard-test-button--danger"
              >
                삭제
              </button>
            </div>
            <div className="dashboard-test-grid">
              <div className="dashboard-test-grid dashboard-test-grid-4">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">comp (대회 ID)</label>
                  <input
                    type="number"
                    value={item.comp}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], comp: Number(e.target.value) };
                      setCreateList(newList);
                    }}
                    placeholder="1"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">cubeEvent (대회 종목)</label>
                  <input
                    type="text"
                    value={item.cubeEvent}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], cubeEvent: e.target.value };
                      setCreateList(newList);
                    }}
                    placeholder="3x3x3"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">roundName (라운드명)</label>
                  <input
                    type="text"
                    value={item.roundName}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], roundName: e.target.value };
                      setCreateList(newList);
                    }}
                    placeholder="1라운드"
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-grid dashboard-test-grid-2">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">eventStart (시작 시간)</label>
                  <input
                    type="datetime-local"
                    value={item.eventStart}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], eventStart: e.target.value + ':00' };
                      setCreateList(newList);
                    }}
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">eventEnd (종료 시간)</label>
                  <input
                    type="datetime-local"
                    value={item.eventEnd}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], eventEnd: e.target.value + ':00' };
                      setCreateList(newList);
                    }}
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-grid dashboard-test-grid-3">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">cutoff (컷오프)</label>
                  <input
                    type="number"
                    value={item.cutoff || ''}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], cutoff: e.target.value ? Number(e.target.value) : undefined };
                      setCreateList(newList);
                    }}
                    placeholder="120"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">timeLimit (시간 제한)</label>
                  <input
                    type="number"
                    value={item.timeLimit || ''}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], timeLimit: e.target.value ? Number(e.target.value) : undefined };
                      setCreateList(newList);
                    }}
                    placeholder="600"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">advance (통과 인원)</label>
                  <input
                    type="number"
                    value={item.advance || ''}
                    onChange={(e) => {
                      const newList = [...createList];
                      newList[index] = { ...newList[index], advance: e.target.value ? Number(e.target.value) : undefined };
                      setCreateList(newList);
                    }}
                    placeholder="10"
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">groupList (그룹 리스트)</label>
                <input
                  type="text"
                  value={item.groupList?.join(', ') || ''}
                  onChange={(e) => {
                    const newList = [...createList];
                    newList[index] = { ...newList[index], groupList: e.target.value ? e.target.value.split(',').map(g => g.trim()) : [] };
                    setCreateList(newList);
                  }}
                  placeholder="A, B, C"
                  className="dashboard-test-input"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--success"
        >
          라운드 생성
        </button>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">✏️ 라운드 수정 (Update)</h2>
        <button onClick={addUpdateItem} className="dashboard-test-button dashboard-test-button--subtle">
          + 라운드 추가
        </button>
        {updateList.map((item, index) => (
          <div key={index} className="dashboard-test-card">
            <div className="dashboard-test-card-header">
              <h4 className="dashboard-test-card-title">라운드 #{index + 1}</h4>
              <button
                onClick={() => removeUpdateItem(index)}
                className="dashboard-test-button dashboard-test-button--danger"
              >
                삭제
              </button>
            </div>
            <div className="dashboard-test-grid">
              <div className="dashboard-test-grid dashboard-test-grid-3">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">idx (라운드 ID)</label>
                  <input
                    type="number"
                    value={item.idx}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], idx: Number(e.target.value) };
                      setUpdateList(newList);
                    }}
                    placeholder="1"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">comp (대회 ID)</label>
                  <input
                    type="number"
                    value={item.comp}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], comp: Number(e.target.value) };
                      setUpdateList(newList);
                    }}
                    placeholder="1"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">cubeEvent (대회 종목)</label>
                  <input
                    type="text"
                    value={item.cubeEvent}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], cubeEvent: e.target.value };
                      setUpdateList(newList);
                    }}
                    placeholder="3x3x3"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">roundName (라운드명)</label>
                  <input
                    type="text"
                    value={item.roundName}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], roundName: e.target.value };
                      setUpdateList(newList);
                    }}
                    placeholder="결승"
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-grid dashboard-test-grid-2">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">eventStart (시작 시간)</label>
                  <input
                    type="datetime-local"
                    value={item.eventStart}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], eventStart: e.target.value + ':00' };
                      setUpdateList(newList);
                    }}
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">eventEnd (종료 시간)</label>
                  <input
                    type="datetime-local"
                    value={item.eventEnd}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], eventEnd: e.target.value + ':00' };
                      setUpdateList(newList);
                    }}
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-grid dashboard-test-grid-3">
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">cutoff (컷오프)</label>
                  <input
                    type="number"
                    value={item.cutoff || ''}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], cutoff: e.target.value ? Number(e.target.value) : undefined };
                      setUpdateList(newList);
                    }}
                    placeholder="90"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">timeLimit (시간 제한)</label>
                  <input
                    type="number"
                    value={item.timeLimit || ''}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], timeLimit: e.target.value ? Number(e.target.value) : undefined };
                      setUpdateList(newList);
                    }}
                    placeholder="600"
                    className="dashboard-test-input"
                  />
                </div>
                <div className="dashboard-test-field">
                  <label className="dashboard-test-label">advance (통과 인원)</label>
                  <input
                    type="number"
                    value={item.advance || ''}
                    onChange={(e) => {
                      const newList = [...updateList];
                      newList[index] = { ...newList[index], advance: e.target.value ? Number(e.target.value) : undefined };
                      setUpdateList(newList);
                    }}
                    placeholder="3"
                    className="dashboard-test-input"
                  />
                </div>
              </div>
              <div className="dashboard-test-field">
                <label className="dashboard-test-label">groupList (그룹 리스트)</label>
                <input
                  type="text"
                  value={item.groupList?.join(', ') || ''}
                  onChange={(e) => {
                    const newList = [...updateList];
                    newList[index] = { ...newList[index], groupList: e.target.value ? e.target.value.split(',').map(g => g.trim()) : [] };
                    setUpdateList(newList);
                  }}
                  placeholder="A, B, C"
                  className="dashboard-test-input"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--primary"
        >
          라운드 수정
        </button>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">🗑️ 라운드 삭제 (Delete)</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">idx (라운드 ID)</label>
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
            라운드 삭제
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">🎯 Advance 인원 조정 (Update Advance)</h2>
        <div className="dashboard-test-grid dashboard-test-grid-2">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">advanceRoundIdx (라운드 ID)</label>
            <input
              type="number"
              value={advanceRoundIdx}
              onChange={(e) => setAdvanceRoundIdx(Number(e.target.value))}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">advanceCount (통과 인원)</label>
            <input
              type="number"
              value={advanceCount}
              onChange={(e) => setAdvanceCount(Number(e.target.value))}
              placeholder="10"
              className="dashboard-test-input"
            />
          </div>
        </div>
        <button
          onClick={handleUpdateAdvance}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--primary"
        >
          Advance 변경
        </button>
      </div>

      {loading && <div className="dashboard-test-status">로딩 중...</div>}
      {error && <div className="dashboard-test-status dashboard-test-status--error">에러: {error}</div>}
      {result && <div className="dashboard-test-status dashboard-test-status--success">✅ {result}</div>}
    </div>
  );
};
