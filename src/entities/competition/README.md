# Competition Entity

**대회 엔티티** - 큐브 대회 정보 및 조회 API

## 📋 모델 구조

```typescript
interface Competition {
  idx: number;
  compName: string;
  compDateStart: Date;
  compDateEnd: Date;
  joinDateStart: Date;
  joinDateEnd: Date;
  baseFee: number;
  location: string;
  maxParticipate: number;
  createdAt: Date;
  updatedAt: Date;
  eventFeeList: EventFee[];
}

interface EventFee {
  idx: number;
  eventIdx: number;
  eventName: string;
  fee: number;
}
```

## 🔧 API 함수

### getCompetition

단일 대회 조회

```typescript
const competition = await getCompetition(123);
```

### getCompetitionPast

종료된 대회 목록 조회 (페이지네이션)

```typescript
const pastCompetitions = await getCompetitionPast({
  page: 0,
  size: 10,
  sort: [{ property: 'compName', direction: 'asc' }],
});

// 결과
{
  content: Competition[],
  page: {
    size: 10,
    number: 0,
    totalElements: 100,
    totalPages: 10
  }
}
```

### getCompetitionNow

진행중인 대회 목록 조회 (페이지네이션)

```typescript
const currentCompetitions = await getCompetitionNow({
  page: 0,
  size: 10,
});
```

### getCompetitionFuture

예정된 대회 목록 조회 (페이지네이션)

```typescript
const futureCompetitions = await getCompetitionFuture({
  page: 0,
  size: 10,
});
```

## 📖 사용 예시

### 컴포넌트에서 사용

```typescript
import { getCompetition, getCompetitionNow } from '@/entities/competition';
import type { Competition } from '@/entities/competition';

const CompetitionPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadCompetitions();
  }, []);
  
  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const data = await getCompetitionNow({ page: 0, size: 10 });
      setCompetitions(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 에러');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      {competitions.map(comp => (
        <div key={comp.idx}>
          <h3>{comp.compName}</h3>
          <p>{comp.location}</p>
          <p>{comp.compDateStart.toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};
```

## 🔄 DTO와 Model

### CompetitionDTO (백엔드 응답)

```typescript
interface CompetitionDTO {
  idx: number;
  compName: string;
  compDateStart: string;      // "2026-05-01"
  compDateEnd: string;        // "2026-05-02"
  joinDateStart: string;      // "2026-04-01T00:00:00"
  joinDateEnd: string;        // "2026-04-30T23:59:59"
  baseFee: number;
  location: string;
  maxParticipate: number;
  createdAt: string;          // "2026-01-01T10:00:00"
  updatedAt: string;          // "2026-01-01T10:00:00"
  eventFeeList: EventFeeDTO[];
}
```

### Competition (프론트엔드 사용)

```typescript
interface Competition {
  idx: number;
  compName: string;
  compDateStart: Date;        // Date 객체
  compDateEnd: Date;
  joinDateStart: Date;
  joinDateEnd: Date;
  baseFee: number;
  location: string;
  maxParticipate: number;
  createdAt: Date;
  updatedAt: Date;
  eventFeeList: EventFee[];
}
```

## 🔗 관련 기능

- **CUD 작업**: [features/competition](../../features/competition/README.md)
- **상위 레이어**: [Entities Layer](../README.md)

## 📝 API 엔드포인트

| 함수 | HTTP | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `getCompetition` | GET | `/comp/{id}` | 단일 조회 |
| `getCompetitionPast` | GET | `/comp/past` | 종료된 대회 |
| `getCompetitionNow` | GET | `/comp/now` | 진행중인 대회 |
| `getCompetitionFuture` | GET | `/comp/future` | 예정된 대회 |
