# Round Entity

**라운드 엔티티** - 대회 라운드 정보 및 조회 API

## 📋 모델 구조

```typescript
interface Round {
  idx: number;
  compIdx: number;
  eventIdx: number;
  roundName: string;
  roundDateStart: Date;
  roundDateEnd: Date;
  maxParticipate: number;
  scrambleSet: number;
  cutoff: number | null;
  timeLimit: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 API 함수

### getRound

단일 라운드 조회

```typescript
const round = await getRound(456);
```

### getRoundPast

특정 대회의 종료된 라운드 목록 (페이지네이션)

```typescript
const pastRounds = await getRoundPast(compIdx, {
  page: 0,
  size: 10,
});
```

### getRoundNow

특정 대회의 진행중인 라운드 목록 (페이지네이션)

```typescript
const activeRounds = await getRoundNow(compIdx, {
  page: 0,
  size: 10,
});
```

### getRoundFuture

특정 대회의 예정된 라운드 목록 (페이지네이션)

```typescript
const futureRounds = await getRoundFuture(compIdx, {
  page: 0,
  size: 10,
});
```

## 📖 사용 예시

```typescript
import { getRound, getRoundNow } from '@/entities/round';
import type { Round } from '@/entities/round';

const RoundPage = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const compIdx = 123;  // 대회 ID
  
  useEffect(() => {
    loadRounds();
  }, []);
  
  const loadRounds = async () => {
    try {
      const data = await getRoundNow(compIdx, { page: 0, size: 10 });
      setRounds(data.content);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      {rounds.map(round => (
        <div key={round.idx}>
          <h3>{round.roundName}</h3>
          <p>시작: {round.roundDateStart.toLocaleString()}</p>
          <p>종료: {round.roundDateEnd.toLocaleString()}</p>
          <p>최대 참가: {round.maxParticipate}명</p>
        </div>
      ))}
    </div>
  );
};
```

## 🔗 관련 기능

- **CUD 작업**: [features/round](../../features/round/README.md)
- **상위 레이어**: [Entities Layer](../README.md)

## 📝 API 엔드포인트

| 함수 | HTTP | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `getRound` | GET | `/round/{id}` | 단일 조회 |
| `getRoundPast` | GET | `/round/past/{compIdx}` | 종료된 라운드 |
| `getRoundNow` | GET | `/round/now/{compIdx}` | 진행중인 라운드 |
| `getRoundFuture` | GET | `/round/future/{compIdx}` | 예정된 라운드 |
