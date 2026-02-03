# Competition Feature

**대회 관리 피처** - 대회 생성, 수정, 삭제

## 🔧 API 함수

### createCompetition

새 대회 생성

```typescript
import { createCompetition } from '@/features/competition';

await createCompetition({
  compName: '2026 CCK Championship',
  compDateStart: '2026-05-01',
  compDateEnd: '2026-05-02',
  joinDateStart: '2026-04-01T00:00:00',
  joinDateEnd: '2026-04-30T23:59:59',
  baseFee: 10000,
  location: '서울',
  maxParticipate: 100,
  eventFeeList: [
    { eventIdx: 1, fee: 5000 },
    { eventIdx: 2, fee: 3000 },
  ],
});
```

### updateCompetition

기존 대회 수정 (전체 교체)

```typescript
await updateCompetition({
  idx: 123,
  compName: 'Updated Competition',
  compDateStart: '2026-06-01',
  compDateEnd: '2026-06-02',
  // ... 모든 필드 필요
});
```

### deleteCompetition

대회 삭제

```typescript
await deleteCompetition(123);
```

## 📖 사용 예시

```typescript
import { 
  createCompetition, 
  updateCompetition, 
  deleteCompetition 
} from '@/features/competition';
import { createApiHandler } from '@/shared/utils/apiHandler';

const CompetitionManagePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const apiHandler = createApiHandler(setLoading, setError, setResult);
  
  const handleCreate = async (formData) => {
    await apiHandler(
      () => createCompetition(formData),
      '대회가 생성되었습니다.'
    );
  };
  
  const handleUpdate = async (idx, formData) => {
    await apiHandler(
      () => updateCompetition({ idx, ...formData }),
      '대회가 수정되었습니다.'
    );
  };
  
  const handleDelete = async (idx) => {
    await apiHandler(
      () => deleteCompetition(idx),
      '대회가 삭제되었습니다.'
    );
  };
  
  return (
    <div>
      {loading && <div>처리중...</div>}
      {error && <div className="error">{error}</div>}
      {result && <div className="success">{result}</div>}
      
      <button onClick={() => handleCreate(formData)}>생성</button>
      <button onClick={() => handleUpdate(123, formData)}>수정</button>
      <button onClick={() => handleDelete(123)}>삭제</button>
    </div>
  );
};
```

## 📝 DTO 구조

### CompetitionCreateDTO

```typescript
interface CompetitionCreateDTO {
  compName: string;              // 필수
  compDateStart: string;         // 필수 (ISO 8601)
  compDateEnd: string;           // 필수
  joinDateStart: string;         // 필수
  joinDateEnd: string;           // 필수
  baseFee?: number;              // 선택
  location?: string;             // 선택
  maxParticipate?: number;       // 선택
  eventFeeList?: EventFeeDTO[];  // 선택
}
```

### CompetitionUpdateDTO

```typescript
interface CompetitionUpdateDTO {
  idx: number;                   // 필수
  compName: string;              // 모든 필드 필수
  compDateStart: string;
  compDateEnd: string;
  joinDateStart: string;
  joinDateEnd: string;
  baseFee: number;
  location: string;
  maxParticipate: number;
  eventFeeList: EventFeeDTO[];
}
```

## 🔗 관련 기능

- **Read API**: [entities/competition](../../entities/competition/README.md)
- **상위 레이어**: [Features Layer](../README.md)

## 📝 API 엔드포인트

| 함수 | HTTP | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `createCompetition` | POST | `/comp` | 대회 생성 |
| `updateCompetition` | PUT | `/comp` | 대회 수정 |
| `deleteCompetition` | DELETE | `/comp/{id}` | 대회 삭제 |
