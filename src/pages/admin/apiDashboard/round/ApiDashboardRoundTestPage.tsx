import { useState } from 'react';
import {
  getRoundPast,
  getRoundNow,
  getRoundFuture,
  getRound,
} from '@/entities/round';

export const ApiDashboardRoundTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compIdx, setCompIdx] = useState<number>(1);
  const [roundIdx, setRoundIdx] = useState<number>(1);

  const handleTest = async (apiFunction: () => Promise<any>, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFunction();
      setResult(data);
      console.log(`${name} 결과:`, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error(`${name} 에러:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <h1 className="dashboard-test-title">Round API 테스트</h1>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">조회 대상</h2>
        <div className="dashboard-test-inline">
          <label className="dashboard-test-label">
            대회 ID
            <input
              type="number"
              value={compIdx}
              onChange={(e) => setCompIdx(Number(e.target.value))}
              className="dashboard-test-input"
            />
          </label>
          <label className="dashboard-test-label">
            라운드 ID
            <input
              type="number"
              value={roundIdx}
              onChange={(e) => setRoundIdx(Number(e.target.value))}
              className="dashboard-test-input"
            />
          </label>
          <button
            onClick={() => handleTest(() => getRound(roundIdx), 'getRound')}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--primary"
          >
            라운드 단일 조회
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">페이지네이션 API 테스트</h2>
        <div className="dashboard-test-actions">
          <button
            onClick={() =>
              handleTest(
                () => getRoundPast(compIdx, { page: 0, size: 10 }),
                'getRoundPast'
              )
            }
            disabled={loading}
            className="dashboard-test-button"
          >
            종료된 라운드 조회
          </button>
          <button
            onClick={() =>
              handleTest(
                () => getRoundNow(compIdx, { page: 0, size: 10 }),
                'getRoundNow'
              )
            }
            disabled={loading}
            className="dashboard-test-button"
          >
            진행중인 라운드 조회
          </button>
          <button
            onClick={() =>
              handleTest(
                () => getRoundFuture(compIdx, { page: 0, size: 10 }),
                'getRoundFuture'
              )
            }
            disabled={loading}
            className="dashboard-test-button"
          >
            예정된 라운드 조회
          </button>
        </div>
      </div>

      {loading && <div className="dashboard-test-status">로딩 중...</div>}

      {error && <div className="dashboard-test-status dashboard-test-status--error">에러: {error}</div>}

      {result && (
        <div className="dashboard-test-section dashboard-test-result">
          <h3 className="dashboard-test-section-title">결과</h3>
          <pre className="dashboard-test-pre">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
