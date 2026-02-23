import { useState } from 'react';
import { getRecordList } from '@/entities/record';
import { OverlayToast } from '@/widgets';

export const ApiDashboardRecordTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roundIdx, setRoundIdx] = useState<number>(1);

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
      console.error(`${name} 에러:`, err);
    } finally {
      setLoading(false);
    }
  };

  const toast = error
    ? { variant: 'error' as const, message: error, onClose: () => setError(null) }
    : null;

  return (
    <div className="dashboard-test-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ''}
        onClose={toast?.onClose}
      />
      <h1 className="dashboard-test-title">Record API 테스트</h1>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">조회 대상</h2>
        <div className="dashboard-test-inline">
          <label className="dashboard-test-label">
            라운드 ID
            <input
              type="number"
              value={roundIdx}
              onChange={(e) => setRoundIdx(Number(e.target.value))}
              className="dashboard-test-input"
            />
          </label>
        </div>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">기록 조회</h2>
        <button
          onClick={() => handleTest(() => getRecordList(roundIdx), '기록 목록 조회')}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--primary"
        >
          라운드별 기록 조회
        </button>
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
