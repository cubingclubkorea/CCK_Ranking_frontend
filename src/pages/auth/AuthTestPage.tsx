import { useState } from 'react';
import { getPlayerInfo, getSearchInfo } from '@/entities/auth';

export const AuthTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
      <h1>Auth API 테스트</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>RFID 플레이어 정보 조회</h2>
        <input
          type="text"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          style={{ marginRight: '10px', padding: '8px', width: '300px' }}
          placeholder="RFID UID 입력"
        />
        <button
          onClick={() =>
            handleTest(() => getPlayerInfo(uid), 'getPlayerInfo')
          }
          disabled={loading || !uid}
          style={{ padding: '10px' }}
        >
          플레이어 정보 조회
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>플레이어 검색</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: '10px', padding: '8px', width: '300px' }}
          placeholder="이름 또는 ID 검색"
        />
        <button
          onClick={() =>
            handleTest(() => getSearchInfo(searchTerm), 'getSearchInfo')
          }
          disabled={loading || !searchTerm}
          style={{ padding: '10px' }}
        >
          검색
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
