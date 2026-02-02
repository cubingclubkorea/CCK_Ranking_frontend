# CubeEvent Entity

**큐브 종목 엔티티** - 큐브 종목 정보 및 조회 API

## 📋 모델 구조

```typescript
interface CubeEvent {
  idx: number;
  eventName: string;
  iconPath: string;
  format: string;
}
```

## 🔧 API 함수

### getCubeEventList

전체 큐브 종목 목록 조회

```typescript
const events = await getCubeEventList();
```

**반환값**: `CubeEvent[]` (페이지네이션 없음, 전체 목록)

## 📖 사용 예시

```typescript
import { getCubeEventList } from '@/entities/cubeEvent';
import type { CubeEvent } from '@/entities/cubeEvent';

const EventSelectorPage = () => {
  const [events, setEvents] = useState<CubeEvent[]>([]);
  
  useEffect(() => {
    loadEvents();
  }, []);
  
  const loadEvents = async () => {
    try {
      const data = await getCubeEventList();
      setEvents(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      <h2>큐브 종목 선택</h2>
      {events.map(event => (
        <div key={event.idx}>
          <img src={event.iconPath} alt={event.eventName} />
          <span>{event.eventName}</span>
          <span>({event.format})</span>
        </div>
      ))}
    </div>
  );
};
```

## 🔗 관련 기능

- **CUD 작업**: [features/cubeEvent](../../features/cubeEvent/README.md)
- **상위 레이어**: [Entities Layer](../README.md)

## 📝 API 엔드포인트

| 함수 | HTTP | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `getCubeEventList` | GET | `/event` | 전체 종목 목록 |
