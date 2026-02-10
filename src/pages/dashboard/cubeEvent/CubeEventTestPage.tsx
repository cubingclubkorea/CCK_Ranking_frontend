import { useState } from 'react';
import { getCubeEventList } from '@/entities/cubeEvent';
import { createCubeEvent } from '@/features/cubeEvent';
import { ColorType } from '@/entities/cubeEvent/model/cubeEvent';

export const CubeEventTestPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 생성 폼 상태
  const [eventName, setEventName] = useState('');
  const [avgCalc, setAvgCalc] = useState('');
  const [colorType, setColorType] = useState<ColorType>(ColorType.cube);
  const [file, setFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreate = async () => {
    if (!eventName || !avgCalc) {
      setError('이벤트명과 평균 계산 방식을 입력해주세요.');
      return;
    }

    await handleTest(
      () => createCubeEvent({ eventName, avgCalc, colorType, file: file || undefined }),
      '큐브 이벤트 생성'
    );
    
    // 생성 후 폼 초기화
    setEventName('');
    setAvgCalc('');
    setColorType(ColorType.cube);
    setFile(null);
  };

  return (
    <div className="dashboard-test-page">
      <h1 className="dashboard-test-title">CubeEvent API 테스트</h1>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">조회 API 테스트</h2>
        <button
          onClick={() => handleTest(() => getCubeEventList(), '큐브 이벤트 목록 조회')}
          disabled={loading}
          className="dashboard-test-button dashboard-test-button--primary"
        >
          큐브 이벤트 목록 조회
        </button>
      </div>

      <div className="dashboard-test-section">
        <h2 className="dashboard-test-section-title">➕ 큐브 이벤트 생성</h2>
        <div className="dashboard-test-grid">
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">eventName (이벤트명)</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="3x3x3"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">avgCalc (평균 계산 방식)</label>
            <input
              type="text"
              value={avgCalc}
              onChange={(e) => setAvgCalc(e.target.value)}
              placeholder="ao5"
              className="dashboard-test-input"
            />
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">colorType (색상 타입)</label>
            <select
              value={colorType}
              onChange={(e) => setColorType(e.target.value as ColorType)}
              className="dashboard-test-select"
            >
              <option value={ColorType.cube}>cube</option>
              <option value={ColorType.tetra}>tetra</option>
              <option value={ColorType.dode}>dode</option>
              <option value={ColorType.skewb}>skewb</option>
              <option value={ColorType.clock}>clock</option>
              <option value={ColorType.square}>square</option>
              <option value={ColorType.none}>none</option>
            </select>
          </div>
          <div className="dashboard-test-field">
            <label className="dashboard-test-label">file (이미지 파일)</label>
            <input type="file" onChange={handleFileChange} className="dashboard-test-input" />
            {file && <span className="dashboard-test-helper">선택됨: {file.name}</span>}
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="dashboard-test-button dashboard-test-button--success"
          >
            큐브 이벤트 생성
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
