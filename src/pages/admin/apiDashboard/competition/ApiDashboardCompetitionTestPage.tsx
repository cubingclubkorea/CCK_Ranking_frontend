import { useState } from 'react';
import {
  getCompetitionPast,
  getCompetitionNow,
  getCompetitionFuture,
  getCompetition,
} from '@/entities/competition';
import { OverlayToast } from '@/widgets';

export const ApiDashboardCompetitionTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compIdx, setCompIdx] = useState<number>(1);

  const handleTest = async (apiFunction: () => Promise<any>, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFunction();
      setResult(data);
      console.log(`${name} 결과:`, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error(`${name} 오류:`, err);
    } finally {
      setLoading(false);
    }
  };

  const toast = error
    ? { variant: 'error' as const, message: error, onClose: () => setError(null) }
    : loading
      ? { variant: 'info' as const, message: '로딩 중...', onClose: undefined }
      : null;

  return (
    <div className="dashboard-test-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ''}
        onClose={toast?.onClose}
      />
      <h1 className="dashboard-test-title">Competition API 테스트</h1>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">페이지네이션 API 테스트</h2>
        <div className="dashboard-test-actions">
          <button
            onClick={() =>
              handleTest(
                () => getCompetitionPast({ page: 0, size: 10 }),
                'getCompetitionPast'
              )
            }
            disabled={loading}
            className="dashboard-test-button"
          >
            종료된 대회 조회
          </button>
          <button
            onClick={() =>
              handleTest(
                () => getCompetitionNow({ page: 0, size: 10 }),
                'getCompetitionNow'
              )
            }
            disabled={loading}
            className="dashboard-test-button"
          >
            진행중 대회 조회
          </button>
          <button
            onClick={() =>
              handleTest(
                () => getCompetitionFuture({ page: 0, size: 10 }),
                'getCompetitionFuture'
              )
            }
            disabled={loading}
            className="dashboard-test-button"
          >
            예정 대회 조회
          </button>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">단일 대회 조회</h2>
        <div className="dashboard-test-inline">
          <input
            type="number"
            value={compIdx}
            onChange={(e) => setCompIdx(Number(e.target.value))}
            className="dashboard-test-input"
            placeholder="대회 ID"
          />
          <button
            onClick={() => handleTest(() => getCompetition(compIdx), 'getCompetition')}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--primary"
          >
            대회 조회
          </button>
        </div>
      </div>

      {result && (
        <div className="dashboard-test-section dashboard-test-result">
          <h3 className="dashboard-test-section-title">결과</h3>
          <pre className="dashboard-test-pre">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
