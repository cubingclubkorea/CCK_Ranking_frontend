import { useState } from 'react';
import { updateScrambler, type ScramblerUpdateDTO } from '@/features/scramble';

export const ScrambleTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 스크램블러 업데이트 폼
  const [scramblerForm, setScramblerForm] = useState<ScramblerUpdateDTO>({
    compIdx: 1,
    playerUid: '',
    scramblerUid: '',
  });

  const handleUpdateScrambler = async () => {
    if (!scramblerForm.playerUid || !scramblerForm.scramblerUid) {
      setError('플레이어 UID와 스크램블러 UID를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await updateScrambler(scramblerForm);
      setResult(data);
      console.log('스크램블 발급 결과:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error('스크램블 발급 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <h1>Scramble API 테스트</h1>

      {/* UPDATE SCRAMBLER */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>🎲 스크램블 발급</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input
            type="number"
            value={scramblerForm.compIdx}
            onChange={(e) => setScramblerForm({ ...scramblerForm, compIdx: Number(e.target.value) })}
            placeholder="대회 ID"
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            value={scramblerForm.playerUid}
            onChange={(e) => setScramblerForm({ ...scramblerForm, playerUid: e.target.value })}
            placeholder="플레이어 UID (RFID)"
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            value={scramblerForm.scramblerUid}
            onChange={(e) => setScramblerForm({ ...scramblerForm, scramblerUid: e.target.value })}
            placeholder="스크램블러 UID (RFID)"
            style={{ padding: '8px' }}
          />
          <button
            onClick={handleUpdateScrambler}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            스크램블 발급
          </button>
        </div>
      </div>

      {/* STATUS */}
      {loading && <p style={{ color: 'blue', fontWeight: 'bold' }}>⏳ 로딩 중...</p>}
      {error && <p style={{ color: 'red', fontWeight: 'bold', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>❌ 에러: {error}</p>}
      
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>결과:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto', borderRadius: '5px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {/* SVG 표시 (스크램블 발급 결과인 경우) */}
          {result.svg && (
            <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
              <h4>스크램블 이미지:</h4>
              <div dangerouslySetInnerHTML={{ __html: result.svg }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
