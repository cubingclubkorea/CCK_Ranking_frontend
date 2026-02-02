# Feature: CubeEvent

큐브 종목 생성을 담당하는 Feature입니다.

> **Feature의 역할**: CUD 전담 (생성, 수정, 삭제)  
> **Entity 문서**: [CubeEvent Entity](../../entities/cubeEvent/README.md) - 종목 조회

---

## 📁 디렉토리 구조

```
cubeEvent/
├── index.ts            # Public API
└── create/
    └── api/
        ├── createCubeEvent.ts          # 종목 생성
        └── dto/
            └── cubeEventCreate.dto.ts  # 생성 요청 DTO
```

---

## 🎯 주요 기능

### 1. 큐브 종목 생성

새로운 큐브 종목을 생성합니다. 이미지 파일을 포함한 멀티파트 요청을 사용합니다.

**API 함수:**

```typescript
/**
 * 큐브 이벤트 생성
 * @param params - 종목 생성 정보
 */
export const createCubeEvent = async (
  params: CreateCubeEventParams
): Promise<void>
```

**DTO 구조:**

```typescript
interface CreateCubeEventParams {
  eventName: string;      // 종목 이름 (예: "3x3x3", "Pyraminx")
  avgCalc: string;        // 평균 계산 방식
  colorType: ColorType;   // 색상 타입
  file?: File;            // 종목 아이콘 이미지 (선택)
}

type ColorType = 
  | 'WHITE'
  | 'YELLOW'
  | 'GREEN'
  | 'BLUE'
  | 'RED'
  | 'ORANGE';
```

**사용 예시:**

```typescript
import { createCubeEvent } from '@/features/cubeEvent';

// 기본 종목 생성
await createCubeEvent({
  eventName: '3x3x3',
  avgCalc: 'ao5',
  colorType: 'WHITE',
});

// 이미지 포함 종목 생성
const file = new File([blob], 'pyraminx.png', { type: 'image/png' });

await createCubeEvent({
  eventName: 'Pyraminx',
  avgCalc: 'mo3',
  colorType: 'GREEN',
  file: file,
});
```

---

## 📡 HTTP 요청 상세

### POST /event

**요청 형식**: `multipart/form-data`

**Form Data:**
- `eventName` (string, required): 종목 이름
- `avgCalc` (string, required): 평균 계산 방식
- `colorType` (string, required): 색상 타입
- `file` (File, optional): 종목 아이콘 이미지

**응답:**
- 성공: `204 No Content`
- 실패: 에러 응답

**구현 코드:**

```typescript
export const createCubeEvent = async (
  params: CreateCubeEventParams
): Promise<void> => {
  const formData = new FormData();
  formData.append('eventName', params.eventName);
  formData.append('avgCalc', params.avgCalc);
  formData.append('colorType', params.colorType);
  
  if (params.file) {
    formData.append('file', params.file);
  }
  
  await apiClient.post<void, FormData>(BASE_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
```

---

## 💡 사용 가이드

### 종목 생성 폼 컴포넌트

```typescript
import { useState } from 'react';
import { createCubeEvent } from '@/features/cubeEvent';
import { apiHandler } from '@/shared/utils/apiHandler';
import type { ColorType } from '@/entities/cubeEvent';

export const CubeEventCreateForm = () => {
  const [eventName, setEventName] = useState('');
  const [avgCalc, setAvgCalc] = useState('ao5');
  const [colorType, setColorType] = useState<ColorType>('WHITE');
  const [file, setFile] = useState<File | null>(null);
  
  const handleSubmit = apiHandler(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      await createCubeEvent({
        eventName,
        avgCalc,
        colorType,
        file: file || undefined,
      });
      
      alert('종목이 생성되었습니다!');
      
      // 폼 초기화
      setEventName('');
      setAvgCalc('ao5');
      setColorType('WHITE');
      setFile(null);
    }
  );
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>종목 이름:</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>평균 계산:</label>
        <select value={avgCalc} onChange={(e) => setAvgCalc(e.target.value)}>
          <option value="ao5">Average of 5</option>
          <option value="mo3">Mean of 3</option>
          <option value="bo1">Best of 1</option>
        </select>
      </div>
      
      <div>
        <label>색상 타입:</label>
        <select 
          value={colorType} 
          onChange={(e) => setColorType(e.target.value as ColorType)}
        >
          <option value="WHITE">화이트</option>
          <option value="YELLOW">옐로우</option>
          <option value="GREEN">그린</option>
          <option value="BLUE">블루</option>
          <option value="RED">레드</option>
          <option value="ORANGE">오렌지</option>
        </select>
      </div>
      
      <div>
        <label>아이콘 이미지 (선택):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      
      <button type="submit">종목 생성</button>
    </form>
  );
};
```

### 이미지 업로드 주의사항

```typescript
// ✅ 올바른 파일 처리
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  
  if (selectedFile) {
    // 파일 크기 체크 (5MB 제한)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }
    
    // 이미지 타입 체크
    if (!selectedFile.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    
    setFile(selectedFile);
  }
};

// 이미지 미리보기
const previewUrl = file ? URL.createObjectURL(file) : null;

return (
  <>
    <input type="file" onChange={handleFileChange} />
    {previewUrl && <img src={previewUrl} alt="미리보기" />}
  </>
);
```

---

## 🔍 에러 처리

```typescript
import { createCubeEvent } from '@/features/cubeEvent';
import { apiHandler } from '@/shared/utils/apiHandler';

// apiHandler를 사용한 자동 에러 처리
const handleCreate = apiHandler(async () => {
  await createCubeEvent({
    eventName: '3x3x3',
    avgCalc: 'ao5',
    colorType: 'WHITE',
  });
  
  console.log('종목 생성 완료');
});

// 수동 에러 처리
const handleCreateManual = async () => {
  try {
    await createCubeEvent({
      eventName: '3x3x3',
      avgCalc: 'ao5',
      colorType: 'WHITE',
    });
    
    alert('종목이 생성되었습니다!');
  } catch (error) {
    console.error('종목 생성 실패:', error);
    alert('종목 생성에 실패했습니다.');
  }
};
```

---

## 🎨 컬러 타입 가이드

```typescript
const COLOR_LABELS: Record<ColorType, string> = {
  WHITE: '화이트',
  YELLOW: '옐로우',
  GREEN: '그린',
  BLUE: '블루',
  RED: '레드',
  ORANGE: '오렌지',
};

const COLOR_HEX: Record<ColorType, string> = {
  WHITE: '#FFFFFF',
  YELLOW: '#FFD500',
  GREEN: '#009B48',
  BLUE: '#0051BA',
  RED: '#C41E3A',
  ORANGE: '#FF5800',
};

// 컬러 선택기
const ColorPicker = () => {
  const [colorType, setColorType] = useState<ColorType>('WHITE');
  
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {Object.entries(COLOR_HEX).map(([type, hex]) => (
        <button
          key={type}
          onClick={() => setColorType(type as ColorType)}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: hex,
            border: colorType === type ? '3px solid black' : '1px solid gray',
          }}
          title={COLOR_LABELS[type as ColorType]}
        />
      ))}
    </div>
  );
};
```

---

## 📚 관련 문서

- **[CubeEvent Entity](../../entities/cubeEvent/README.md)** - 종목 조회
- **[Features Layer](../README.md)** - CUD 패턴 개요
- **[Shared API](../../shared/README.md)** - ApiClient 사용법
- **[Architecture](../../../docs/guides/ARCHITECTURE.md)** - FSD 구조
