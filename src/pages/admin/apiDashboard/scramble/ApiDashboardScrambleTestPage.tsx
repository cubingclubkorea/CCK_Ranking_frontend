import { useState } from 'react';
import { updateScrambler, type ScramblerUpdateDTO } from '@/features/scramble';

export const ApiDashboardScrambleTestPage = () => {
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
    <div className="dashboard-test-page">
      <h1 className="dashboard-test-title">Scramble API 테스트</h1>

      {/* UPDATE SCRAMBLER */}
      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">🎲 스크램블 발급</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">compIdx (대회 ID)</label>
            <input
              type="number"
              value={scramblerForm.compIdx}
              onChange={(e) => setScramblerForm({ ...scramblerForm, compIdx: Number(e.target.value) })}
              placeholder="1"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">playerUid (플레이어 UID)</label>
            <input
              type="text"
              value={scramblerForm.playerUid}
              onChange={(e) => setScramblerForm({ ...scramblerForm, playerUid: e.target.value })}
              placeholder="RFID 태그"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">scramblerUid (스크램블러 UID)</label>
            <input
              type="text"
              value={scramblerForm.scramblerUid}
              onChange={(e) => setScramblerForm({ ...scramblerForm, scramblerUid: e.target.value })}
              placeholder="RFID 태그"
              className="dashboard-test-input"
            />
          </div>
          <button
            onClick={handleUpdateScrambler}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--success"
          >
            스크램블 발급
          </button>
        </div>
      </div>

      {/* STATUS */}
      {loading && <div className="dashboard-test-status">로딩 중...</div>}
      {error && (
        <div className="dashboard-test-status dashboard-test-status--error">
          <img className="status-icon" src="/icon/info/error.svg" alt="" aria-hidden="true" />
          {error}
        </div>
      )}
      
      {result && (
        <div className="dashboard-test-section dashboard-test-result">
          <h3 className="dashboard-test-section-title">결과</h3>
          <pre className="dashboard-test-pre">{JSON.stringify(result, null, 2)}</pre>
          
          {/* SVG 표시 (스크램블 발급 결과인 경우) */}
          {result.svg && (
            <div className="dashboard-test-subsection">
              <h4 className="dashboard-test-section-title">스크램블 이미지</h4>
              <div dangerouslySetInnerHTML={{ __html: result.svg }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
