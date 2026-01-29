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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>CubeEvent API 테스트</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>조회 API 테스트</h2>
        <button
          onClick={() => handleTest(() => getCubeEventList(), '큐브 이벤트 목록 조회')}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          큐브 이벤트 목록 조회
        </button>
      </div>

      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
        <h2>➕ 큐브 이벤트 생성</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>eventName (이벤트명)</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="3x3x3"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>avgCalc (평균 계산 방식)</label>
            <input
              type="text"
              value={avgCalc}
              onChange={(e) => setAvgCalc(e.target.value)}
              placeholder="ao5"
              style={{ padding: '8px', width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>colorType (색상 타입)</label>
            <select
              value={colorType}
              onChange={(e) => setColorType(e.target.value as ColorType)}
              style={{ padding: '8px', width: '100%' }}
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
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>file (이미지 파일)</label>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ padding: '8px', width: '100%' }}
            />
            {file && <span style={{ marginTop: '5px', display: 'block', color: '#28a745' }}>✅ 선택됨: {file.name}</span>}
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            큐브 이벤트 생성
          </button>
        </div>
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
