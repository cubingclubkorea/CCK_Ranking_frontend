# Record Entity

**기록 엔티티** - 참가자 기록 정보 및 조회 API

## 📋 모델 구조

```typescript
interface Record {
  idx: number;
  roundIdx: number;
  playerName: string;
  ranking: number;
  bestValue: number;
  bestType: BestType;
  average: number | null;
  createdAt: Date;
  updatedAt: Date;
  attemptList: Attempt[];
}

interface Attempt {
  attemptNum: number;
  attemptValue: number;
  penalty: number;
}

type BestType = 'SINGLE' | 'AVERAGE' | 'MEAN';
```

## 🔧 API 함수

### getRecordList

특정 라운드의 모든 기록 조회

```typescript
const records = await getRecordList(roundIdx);
```

**반환값**: `Record[]` (페이지네이션 없음)

## 📖 사용 예시

```typescript
import { getRecordList } from '@/entities/record';
import type { Record } from '@/entities/record';

const RecordPage = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const roundIdx = 789;  // 라운드 ID
  
  useEffect(() => {
    loadRecords();
  }, []);
  
  const loadRecords = async () => {
    try {
      const data = await getRecordList(roundIdx);
      setRecords(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>순위</th>
            <th>선수명</th>
            <th>베스트</th>
            <th>평균</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.idx}>
              <td>{record.ranking}</td>
              <td>{record.playerName}</td>
              <td>{record.bestValue.toFixed(2)}</td>
              <td>{record.average?.toFixed(2) ?? 'DNF'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 🔗 관련 기능

- **CUD 작업**: [features/record](../../features/record/README.md)
- **상위 레이어**: [Entities Layer](../README.md)

## 📝 API 엔드포인트

| 함수 | HTTP | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `getRecordList` | GET | `/record/{roundIdx}` | 라운드별 기록 목록 |
