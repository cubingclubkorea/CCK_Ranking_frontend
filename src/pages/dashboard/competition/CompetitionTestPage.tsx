import { useState } from 'react';
import {
  getCompetitionPast,
  getCompetitionNow,
  getCompetitionFuture,
  getCompetition,
} from '@/entities/competition';

export const CompetitionTestPage = () => {
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
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error(`${name} 에러:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Competition API 테스트</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>페이지네이션 API 테스트</h2>
        <button
          onClick={() =>
            handleTest(
              () => getCompetitionPast({ page: 0, size: 10 }),
              'getCompetitionPast'
            )
          }
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
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
          style={{ marginRight: '10px', padding: '10px' }}
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
          style={{ marginRight: '10px', padding: '10px' }}
        >
          예정 대회 조회
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>단일 대회 조회</h2>
        <input
          type="number"
          value={compIdx}
          onChange={(e) => setCompIdx(Number(e.target.value))}
          style={{ marginRight: '10px', padding: '8px' }}
          placeholder="대회 ID"
        />
        <button
          onClick={() =>
            handleTest(() => getCompetition(compIdx), 'getCompetition')
          }
          disabled={loading}
          style={{ padding: '10px' }}
        >
          대회 조회
        </button>
      </div>

      {loading && <p style={{ color: 'blue' }}>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>에러: {error}</p>}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>결과:</h3>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '15px',
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '500px',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
