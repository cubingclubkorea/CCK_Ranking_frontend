# Feature: Record

기록 관리(플레이어 추가, 기록 수정, 삭제, 진출, 추가 시도)를 담당하는 Feature입니다.

> **Feature의 역할**: CUD 전담 (생성, 수정, 삭제)  
> **Entity 문서**: [Record Entity](../../entities/record/README.md) - 기록 조회

---

## 📁 디렉토리 구조

```
record/
├── index.ts            # Public API
├── type.ts             # 타입 정의
├── addPlayer/
│   └── api/
│       ├── addPlayer.ts              # 플레이어 추가 (배치)
│       └── dto/
│           └── playerAdd.dto.ts      # 플레이어 추가 DTO
├── update/
│   └── api/
│       ├── updateRecord.ts           # 기록 수정 (PATCH)
│       └── dto/
│           └── recordUpdate.dto.ts   # 기록 수정 DTO
├── delete/
│   └── api/
│       └── deleteRecord.ts           # 기록 삭제
├── advance/
│   └── api/
│       ├── advancePlayer.ts          # 플레이어 진출
│       └── dto/
│           └── advanceRequest.dto.ts # 진출 요청 DTO
├── extra/
│   └── api/
│       ├── addExtra.ts               # 추가 시도 추가
│       ├── deleteExtra.ts            # 추가 시도 삭제
│       └── dto/
│           └── extra.dto.ts          # 추가 시도 DTO
└── quit/
    └── api/
        └── quitRecord.ts             # 기록 기권
```

---

## 🎯 주요 기능

### 1. 플레이어 추가 (배치)

라운드에 여러 플레이어를 한 번에 추가합니다.

**API 함수:**

```typescript
/**
 * 플레이어 추가 (리스트)
 * @param playerList - 추가할 플레이어 목록
 */
export const addPlayer = async (playerList: PlayerAddDTO[]): Promise<void>
```

**DTO 구조:**

```typescript
interface PlayerAddDTO {
  pdx: number;          // 플레이어 인덱스
  name: string;         // 플레이어 이름
  state: string;        // 상태
  cckId: string;        // CCK ID
  roundIdx: number;     // 라운드 ID
  roundGroup: string;   // 라운드 그룹 (예: "A", "Final")
  note?: string;        // 비고 (선택)
}
```

**사용 예시:**

```typescript
import { addPlayer } from '@/features/record';

// 여러 플레이어 한 번에 추가
await addPlayer([
  {
    pdx: 1,
    name: '홍길동',
    state: 'ACTIVE',
    cckId: 'hong123',
    roundIdx: 10,
    roundGroup: 'A',
  },
  {
    pdx: 2,
    name: '김철수',
    state: 'ACTIVE',
    cckId: 'kim456',
    roundIdx: 10,
    roundGroup: 'A',
    note: '신규 참가자',
  },
]);
```

---

### 2. 기록 수정

특정 기록을 수정합니다 (PATCH 요청).

**API 함수:**

```typescript
/**
 * 기록 업데이트
 * @param dto - 수정할 기록 정보
 */
export const updateRecord = async (dto: RecordUpdateDTO): Promise<void>
```

**DTO 구조:**

```typescript
interface RecordUpdateDTO {
  idx: number;              // 기록 ID
  attempt1?: number;        // 1차 시도 (밀리초)
  attempt2?: number;        // 2차 시도
  attempt3?: number;        // 3차 시도
  attempt4?: number;        // 4차 시도
  attempt5?: number;        // 5차 시도
  penalty1?: string;        // 1차 패널티 (예: "+2", "DNF")
  penalty2?: string;
  penalty3?: string;
  penalty4?: string;
  penalty5?: string;
  // 수정하고 싶은 필드만 포함
}
```

**사용 예시:**

```typescript
import { updateRecord } from '@/features/record';

// 1차, 2차 시도만 수정
await updateRecord({
  idx: 100,
  attempt1: 12345,  // 12.345초
  penalty1: '+2',
  attempt2: 11890,  // 11.890초
});
```

---

### 3. 기록 삭제

특정 기록을 삭제합니다.

**API 함수:**

```typescript
/**
 * 기록 삭제
 * @param idx - 기록 ID
 */
export const deleteRecord = async (idx: number): Promise<void>
```

**사용 예시:**

```typescript
import { deleteRecord } from '@/features/record';

await deleteRecord(100);
```

---

### 4. 플레이어 진출

어드밴스 인원을 다음 라운드로 진출시킵니다.

**API 함수:**

```typescript
/**
 * 어드밴스 인원을 다음 라운드로 넘기기
 * @param dto - 진출 요청 정보
 */
export const advancePlayer = async (dto: AdvanceRequestDTO): Promise<void>
```

**DTO 구조:**

```typescript
interface AdvanceRequestDTO {
  roundIdx: number;       // 현재 라운드 ID
  nextRoundIdx: number;   // 다음 라운드 ID
  advance: number;        // 진출 인원 수
}
```

**사용 예시:**

```typescript
import { advancePlayer } from '@/features/record';

// 상위 16명을 다음 라운드로 진출
await advancePlayer({
  roundIdx: 10,
  nextRoundIdx: 11,
  advance: 16,
});
```

---

### 5. 추가 시도 관리

#### 5-1. 추가 시도 추가

**API 함수:**

```typescript
/**
 * 추가 시도 추가
 * @param dto - 추가 시도 정보
 */
export const addExtra = async (dto: ExtraDTO): Promise<void>
```

**DTO 구조:**

```typescript
interface ExtraDTO {
  recordIdx: number;    // 기록 ID
  extraNum: number;     // 추가 시도 번호 (1, 2, 3, ...)
  attempt: number;      // 시도 시간 (밀리초)
  penalty?: string;     // 패널티 (선택)
}
```

**사용 예시:**

```typescript
import { addExtra } from '@/features/record';

// 추가 시도 1회차 추가
await addExtra({
  recordIdx: 100,
  extraNum: 1,
  attempt: 13456,
  penalty: '+2',
});
```

#### 5-2. 추가 시도 삭제

**API 함수:**

```typescript
/**
 * 추가 시도 삭제
 * @param recordIdx - 기록 ID
 * @param extraNum - 추가 시도 번호
 */
export const deleteExtra = async (
  recordIdx: number, 
  extraNum: number
): Promise<void>
```

**사용 예시:**

```typescript
import { deleteExtra } from '@/features/record';

// 추가 시도 1회차 삭제
await deleteExtra(100, 1);
```

---

### 6. 기록 기권

여러 기록을 기권 처리합니다.

**API 함수:**

```typescript
/**
 * 여러 기록 기권 처리
 * @param partList - 기권 처리할 기록 ID 목록
 */
export const quitRecord = async (partList: number[]): Promise<void>
```

**사용 예시:**

```typescript
import { quitRecord } from '@/features/record';

// 기록 ID 100, 101, 102를 기권 처리
await quitRecord([100, 101, 102]);
```

---

## 📡 HTTP 요청 상세

### POST /record

**요청 본문**: `PlayerAddDTO[]`

### PATCH /record

**요청 본문**: `RecordUpdateDTO` (부분 수정)

### DELETE /record/:idx

**경로 파라미터**: `idx`

### POST /record/advance

**요청 본문**: `AdvanceRequestDTO`

### PATCH /record/extra

**요청 본문**: `ExtraDTO`

### DELETE /record/:recordIdx/extra/:extraNum

**경로 파라미터**: `recordIdx`, `extraNum`

### DELETE /record/quit

**요청 본문**: `number[]` (기록 ID 배열)

---

## 💡 사용 가이드

### 플레이어 추가 폼

```typescript
import { useState } from 'react';
import { addPlayer } from '@/features/record';
import { apiHandler } from '@/shared/utils/apiHandler';
import type { PlayerAddDTO } from '@/features/record/type';

export const PlayerAddForm = ({ 
  roundIdx, 
  roundGroup 
}: { 
  roundIdx: number; 
  roundGroup: string; 
}) => {
  const [players, setPlayers] = useState<PlayerAddDTO[]>([]);
  
  const handleSubmit = apiHandler(async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addPlayer(players);
    
    alert('플레이어가 추가되었습니다!');
    setPlayers([]);
  });
  
  const addPlayerRow = () => {
    setPlayers([
      ...players,
      {
        pdx: players.length + 1,
        name: '',
        state: 'ACTIVE',
        cckId: '',
        roundIdx,
        roundGroup,
      },
    ]);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {players.map((player, index) => (
        <div key={index}>
          <input
            placeholder="이름"
            value={player.name}
            onChange={(e) => {
              const newPlayers = [...players];
              newPlayers[index].name = e.target.value;
              setPlayers(newPlayers);
            }}
          />
          <input
            placeholder="CCK ID"
            value={player.cckId}
            onChange={(e) => {
              const newPlayers = [...players];
              newPlayers[index].cckId = e.target.value;
              setPlayers(newPlayers);
            }}
          />
        </div>
      ))}
      
      <button type="button" onClick={addPlayerRow}>
        플레이어 추가
      </button>
      <button type="submit">모두 등록</button>
    </form>
  );
};
```

### 기록 수정 (타이머 입력)

```typescript
import { useState } from 'react';
import { updateRecord } from '@/features/record';
import { apiHandler } from '@/shared/utils/apiHandler';

export const RecordEditor = ({ recordIdx }: { recordIdx: number }) => {
  const [attempts, setAttempts] = useState<string[]>(['', '', '', '', '']);
  const [penalties, setPenalties] = useState<string[]>(['', '', '', '', '']);
  
  // 시간 문자열을 밀리초로 변환 (예: "12.34" → 12340)
  const timeToMillis = (time: string): number => {
    const parsed = parseFloat(time);
    return parsed * 1000;
  };
  
  const handleSubmit = apiHandler(async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateRecord({
      idx: recordIdx,
      attempt1: attempts[0] ? timeToMillis(attempts[0]) : undefined,
      attempt2: attempts[1] ? timeToMillis(attempts[1]) : undefined,
      attempt3: attempts[2] ? timeToMillis(attempts[2]) : undefined,
      attempt4: attempts[3] ? timeToMillis(attempts[3]) : undefined,
      attempt5: attempts[4] ? timeToMillis(attempts[4]) : undefined,
      penalty1: penalties[0] || undefined,
      penalty2: penalties[1] || undefined,
      penalty3: penalties[2] || undefined,
      penalty4: penalties[3] || undefined,
      penalty5: penalties[4] || undefined,
    });
    
    alert('기록이 수정되었습니다!');
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i}>
          <label>시도 {i + 1}:</label>
          <input
            type="text"
            placeholder="12.34"
            value={attempts[i]}
            onChange={(e) => {
              const newAttempts = [...attempts];
              newAttempts[i] = e.target.value;
              setAttempts(newAttempts);
            }}
          />
          <select
            value={penalties[i]}
            onChange={(e) => {
              const newPenalties = [...penalties];
              newPenalties[i] = e.target.value;
              setPenalties(newPenalties);
            }}
          >
            <option value="">정상</option>
            <option value="+2">+2</option>
            <option value="DNF">DNF</option>
          </select>
        </div>
      ))}
      
      <button type="submit">기록 저장</button>
    </form>
  );
};
```

### 플레이어 진출 버튼

```typescript
import { advancePlayer } from '@/features/record';
import { apiHandler } from '@/shared/utils/apiHandler';

export const AdvanceButton = ({
  roundIdx,
  nextRoundIdx,
  advance,
}: {
  roundIdx: number;
  nextRoundIdx: number;
  advance: number;
}) => {
  const handleAdvance = apiHandler(async () => {
    if (!confirm(`상위 ${advance}명을 다음 라운드로 진출시키시겠습니까?`)) {
      return;
    }
    
    await advancePlayer({ roundIdx, nextRoundIdx, advance });
    
    alert('플레이어가 진출되었습니다!');
  });
  
  return (
    <button onClick={handleAdvance}>
      상위 {advance}명 진출
    </button>
  );
};
```

### 추가 시도 관리

```typescript
import { addExtra, deleteExtra } from '@/features/record';
import { apiHandler } from '@/shared/utils/apiHandler';

export const ExtraAttemptsManager = ({ 
  recordIdx 
}: { 
  recordIdx: number 
}) => {
  const [extraAttempts, setExtraAttempts] = useState<
    { num: number; time: string; penalty: string }[]
  >([]);
  
  const handleAddExtra = apiHandler(async (
    num: number, 
    time: string, 
    penalty: string
  ) => {
    const millis = parseFloat(time) * 1000;
    
    await addExtra({
      recordIdx,
      extraNum: num,
      attempt: millis,
      penalty: penalty || undefined,
    });
    
    alert('추가 시도가 추가되었습니다!');
  });
  
  const handleDeleteExtra = apiHandler(async (num: number) => {
    if (!confirm(`추가 시도 ${num}을(를) 삭제하시겠습니까?`)) {
      return;
    }
    
    await deleteExtra(recordIdx, num);
    
    alert('추가 시도가 삭제되었습니다!');
  });
  
  return (
    <div>
      <h4>추가 시도</h4>
      {extraAttempts.map((extra) => (
        <div key={extra.num}>
          <span>Extra {extra.num}: {extra.time}s</span>
          {extra.penalty && <span> ({extra.penalty})</span>}
          <button onClick={() => handleDeleteExtra(extra.num)}>
            삭제
          </button>
        </div>
      ))}
      {/* 추가 시도 입력 폼... */}
    </div>
  );
};
```

---

## 🎯 베스트 프랙티스

### 1. 시간 형식 변환

```typescript
// 시간 문자열 → 밀리초
const timeToMillis = (time: string): number => {
  const parsed = parseFloat(time);
  if (isNaN(parsed)) {
    throw new Error('유효하지 않은 시간 형식입니다.');
  }
  return Math.round(parsed * 1000);
};

// 밀리초 → 시간 문자열
const millisToTime = (millis: number): string => {
  return (millis / 1000).toFixed(2);
};
```

### 2. 패널티 처리

```typescript
type Penalty = '' | '+2' | 'DNF';

const calculateFinalTime = (
  attempt: number, 
  penalty: Penalty
): number | 'DNF' => {
  if (penalty === 'DNF') {
    return 'DNF';
  }
  
  if (penalty === '+2') {
    return attempt + 2000; // +2초
  }
  
  return attempt;
};
```

### 3. 배치 작업 최적화

```typescript
// ✅ 여러 플레이어를 한 번에 추가
await addPlayer([player1, player2, player3]);

// ❌ 하나씩 추가하지 말 것
// await addPlayer([player1]);
// await addPlayer([player2]);
// await addPlayer([player3]);
```

---

## 📚 관련 문서

- **[Record Entity](../../entities/record/README.md)** - 기록 조회
- **[Features Layer](../README.md)** - CUD 패턴 개요
- **[Shared API](../../shared/README.md)** - ApiClient 사용법
- **[Architecture](../../../docs/guides/ARCHITECTURE.md)** - FSD 구조
