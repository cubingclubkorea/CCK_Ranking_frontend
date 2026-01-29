import { useState } from 'react';
import { getRecordList } from '@/entities/record';

export const RecordTestPage = () => {
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
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error(`${name} 에러:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Record API 테스트</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          라운드 ID:
          <input
            type="number"
            value={roundIdx}
            onChange={(e) => setRoundIdx(Number(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>기록 조회</h2>
        <button
          onClick={() => handleTest(() => getRecordList(roundIdx), '기록 목록 조회')}
          disabled={loading}
          style={{ padding: '10px' }}
        >
          라운드별 기록 조회
        </button>
      </div>

      {loading && (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0' }}>
          로딩 중...
        </div>
      )}

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffcccc', color: '#cc0000' }}>
          에러: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>결과:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
