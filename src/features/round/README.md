# Feature: Round

라운드 생성, 수정, 삭제, 진출 인원 조정을 담당하는 Feature입니다.

> **Feature의 역할**: CUD 전담 (생성, 수정, 삭제)  
> **Entity 문서**: [Round Entity](../../entities/round/README.md) - 라운드 조회

---

## 📁 디렉토리 구조

```
round/
├── index.ts            # Public API
├── type.ts             # 타입 정의
├── create/
│   └── api/
│       ├── createRound.ts          # 라운드 생성 (배치)
│       └── dto/
│           └── roundCreate.dto.ts  # 생성 요청 DTO
├── update/
│   └── api/
│       ├── updateRound.ts          # 라운드 수정 (배치)
│       └── dto/
│           └── roundUpdate.dto.ts  # 수정 요청 DTO
├── delete/
│   └── api/
│       └── deleteRound.ts          # 라운드 삭제
└── advance/
    └── api/
        └── updateAdvance.ts        # 진출 인원 조정
```

---

## 🎯 주요 기능

### 1. 라운드 생성 (배치)

여러 라운드를 한 번에 생성합니다.

**API 함수:**

```typescript
/**
 * 라운드 생성 (리스트)
 * @param roundList - 생성할 라운드 목록
 */
export const createRound = async (roundList: RoundCreateDTO[]): Promise<void>
```

**DTO 구조:**

```typescript
interface RoundCreateDTO {
  comp: number;           // 대회 ID
  cubeEvent: string;      // 큐브 종목 이름
  roundName: string;      // 라운드 이름 (예: "1라운드", "결승")
  eventStart: string;     // 시작 시간 (LocalDateTime 문자열)
  eventEnd: string;       // 종료 시간 (LocalDateTime 문자열)
  groupList?: string[];   // 그룹 목록 (예: ["A", "B", "C"])
  cutoff?: number;        // 컷오프 시간 (초)
  timeLimit?: number;     // 제한 시간 (초)
  advance?: number;       // 진출 인원
}
```

**사용 예시:**

```typescript
import { createRound } from '@/features/round';

// 여러 라운드 한 번에 생성
await createRound([
  {
    comp: 1,
    cubeEvent: '3x3x3',
    roundName: '1라운드',
    eventStart: '2026-02-10T10:00:00',
    eventEnd: '2026-02-10T12:00:00',
    groupList: ['A', 'B', 'C'],
    cutoff: 120,
    timeLimit: 600,
    advance: 16,
  },
  {
    comp: 1,
    cubeEvent: '3x3x3',
    roundName: '결승',
    eventStart: '2026-02-10T14:00:00',
    eventEnd: '2026-02-10T16:00:00',
    groupList: ['Final'],
    timeLimit: 600,
  },
]);
```

---

### 2. 라운드 수정 (배치)

여러 라운드를 한 번에 수정합니다.

**API 함수:**

```typescript
/**
 * 라운드 수정 (리스트)
 * @param roundList - 수정할 라운드 목록
 */
export const updateRound = async (roundList: RoundUpdateDTO[]): Promise<void>
```

**DTO 구조:**

```typescript
interface RoundUpdateDTO {
  idx: number;            // 라운드 ID (필수)
  comp: number;
  cubeEvent: string;
  roundName: string;
  eventStart: string;
  eventEnd: string;
  groupList?: string[];
  cutoff?: number;
  timeLimit?: number;
  advance?: number;
}
```

**사용 예시:**

```typescript
import { updateRound } from '@/features/round';

// 시간 변경
await updateRound([
  {
    idx: 10,
    comp: 1,
    cubeEvent: '3x3x3',
    roundName: '1라운드',
    eventStart: '2026-02-10T11:00:00',  // 시간 변경
    eventEnd: '2026-02-10T13:00:00',    // 시간 변경
    groupList: ['A', 'B', 'C'],
    cutoff: 120,
    timeLimit: 600,
    advance: 16,
  },
]);
```

---

### 3. 라운드 삭제

특정 라운드를 삭제합니다.

**API 함수:**

```typescript
/**
 * 라운드 삭제
 * @param roundIdx - 라운드 ID
 */
export const deleteRound = async (roundIdx: number): Promise<void>
```

**사용 예시:**

```typescript
import { deleteRound } from '@/features/round';

// 라운드 삭제
await deleteRound(10);
```

---

### 4. 진출 인원 조정

라운드의 진출 인원을 조정합니다.

**API 함수:**

```typescript
/**
 * 라운드 어드밴스 인원 조정
 * @param roundIdx - 라운드 ID
 * @param advance - 진출 인원 수
 */
export const updateAdvance = async (
  roundIdx: number,
  advance: number
): Promise<void>
```

**사용 예시:**

```typescript
import { updateAdvance } from '@/features/round';

// 진출 인원을 8명으로 조정
await updateAdvance(10, 8);
```

---

## 📡 HTTP 요청 상세

### POST /round

**요청 본문**: `RoundCreateDTO[]`

```json
[
  {
    "comp": 1,
    "cubeEvent": "3x3x3",
    "roundName": "1라운드",
    "eventStart": "2026-02-10T10:00:00",
    "eventEnd": "2026-02-10T12:00:00",
    "groupList": ["A", "B", "C"],
    "cutoff": 120,
    "timeLimit": 600,
    "advance": 16
  }
]
```

### PUT /round

**요청 본문**: `RoundUpdateDTO[]` (idx 포함)

### DELETE /round/:roundIdx

**경로 파라미터**: `roundIdx`

### PATCH /round/:roundIdx/advance/:advance

**경로 파라미터**: `roundIdx`, `advance`

---

## 💡 사용 가이드

### 라운드 생성 폼

```typescript
import { useState } from 'react';
import { createRound } from '@/features/round';
import { apiHandler } from '@/shared/utils/apiHandler';
import type { RoundCreateDTO } from '@/features/round/type';

export const RoundCreateForm = ({ compIdx }: { compIdx: number }) => {
  const [rounds, setRounds] = useState<RoundCreateDTO[]>([
    {
      comp: compIdx,
      cubeEvent: '3x3x3',
      roundName: '1라운드',
      eventStart: '',
      eventEnd: '',
      groupList: ['A'],
      cutoff: 120,
      timeLimit: 600,
      advance: 16,
    },
  ]);
  
  const handleSubmit = apiHandler(async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createRound(rounds);
    
    alert('라운드가 생성되었습니다!');
  });
  
  const addRound = () => {
    setRounds([
      ...rounds,
      {
        comp: compIdx,
        cubeEvent: '3x3x3',
        roundName: `${rounds.length + 1}라운드`,
        eventStart: '',
        eventEnd: '',
        groupList: ['A'],
      },
    ]);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {rounds.map((round, index) => (
        <div key={index}>
          <h3>라운드 {index + 1}</h3>
          <input
            type="text"
            placeholder="라운드 이름"
            value={round.roundName}
            onChange={(e) => {
              const newRounds = [...rounds];
              newRounds[index].roundName = e.target.value;
              setRounds(newRounds);
            }}
          />
          {/* 다른 필드들... */}
        </div>
      ))}
      
      <button type="button" onClick={addRound}>
        라운드 추가
      </button>
      <button type="submit">모두 생성</button>
    </form>
  );
};
```

### 진출 인원 조정

```typescript
import { updateAdvance } from '@/features/round';
import { apiHandler } from '@/shared/utils/apiHandler';

export const AdvanceAdjuster = ({ 
  roundIdx, 
  currentAdvance 
}: { 
  roundIdx: number; 
  currentAdvance: number; 
}) => {
  const [advance, setAdvance] = useState(currentAdvance);
  
  const handleUpdate = apiHandler(async () => {
    await updateAdvance(roundIdx, advance);
    alert('진출 인원이 조정되었습니다!');
  });
  
  return (
    <div>
      <label>진출 인원:</label>
      <input
        type="number"
        min="1"
        value={advance}
        onChange={(e) => setAdvance(Number(e.target.value))}
      />
      <button onClick={handleUpdate}>적용</button>
    </div>
  );
};
```

### 라운드 삭제 확인

```typescript
import { deleteRound } from '@/features/round';
import { apiHandler } from '@/shared/utils/apiHandler';

export const RoundDeleteButton = ({ 
  roundIdx, 
  roundName 
}: { 
  roundIdx: number; 
  roundName: string; 
}) => {
  const handleDelete = apiHandler(async () => {
    if (!confirm(`"${roundName}"을(를) 삭제하시겠습니까?`)) {
      return;
    }
    
    await deleteRound(roundIdx);
    alert('라운드가 삭제되었습니다!');
  });
  
  return (
    <button onClick={handleDelete} className="danger">
      삭제
    </button>
  );
};
```

---

## 🔍 배치 작업 패턴

### 여러 라운드 한 번에 처리

```typescript
import { createRound, updateRound } from '@/features/round';

// 대회의 모든 라운드를 한 번에 설정
const setupTournamentRounds = async (compIdx: number) => {
  const rounds = [
    {
      comp: compIdx,
      cubeEvent: '3x3x3',
      roundName: '1라운드',
      eventStart: '2026-02-10T10:00:00',
      eventEnd: '2026-02-10T12:00:00',
      groupList: ['A', 'B', 'C', 'D'],
      advance: 32,
    },
    {
      comp: compIdx,
      cubeEvent: '3x3x3',
      roundName: '2라운드',
      eventStart: '2026-02-10T13:00:00',
      eventEnd: '2026-02-10T14:30:00',
      groupList: ['Semi'],
      advance: 16,
    },
    {
      comp: compIdx,
      cubeEvent: '3x3x3',
      roundName: '결승',
      eventStart: '2026-02-10T15:00:00',
      eventEnd: '2026-02-10T16:00:00',
      groupList: ['Final'],
    },
  ];
  
  await createRound(rounds);
};
```

---

## 🎯 베스트 프랙티스

### 1. 시간 형식 검증

```typescript
const isValidDateTime = (dateTime: string): boolean => {
  const date = new Date(dateTime);
  return !isNaN(date.getTime());
};

// 사용
if (!isValidDateTime(eventStart)) {
  throw new Error('유효하지 않은 시작 시간입니다.');
}
```

### 2. 그룹 이름 생성

```typescript
const generateGroups = (count: number): string[] => {
  return Array.from({ length: count }, (_, i) => 
    String.fromCharCode(65 + i) // 'A', 'B', 'C', ...
  );
};

// 사용
const roundData = {
  // ...
  groupList: generateGroups(4), // ['A', 'B', 'C', 'D']
};
```

### 3. 라운드 시간 검증

```typescript
const validateRoundTime = (start: string, end: string): boolean => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  
  if (endTime <= startTime) {
    throw new Error('종료 시간은 시작 시간보다 늦어야 합니다.');
  }
  
  return true;
};
```

---

## 📚 관련 문서

- **[Round Entity](../../entities/round/README.md)** - 라운드 조회
- **[Features Layer](../README.md)** - CUD 패턴 개요
- **[Shared API](../../shared/README.md)** - ApiClient 사용법
- **[Architecture](../../../docs/guides/ARCHITECTURE.md)** - FSD 구조
