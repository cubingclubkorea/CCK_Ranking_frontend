# Entity: Scramble

스크램블 정보 조회를 담당하는 엔티티입니다.

> **Entity의 역할**: Read 전담 (조회, 검색, 필터링)  
> **Feature 문서**: [Scramble Feature](../../features/scramble/README.md) - 스크램블 업데이트(발급)

---

## 📁 디렉토리 구조

```
scramble/
├── index.ts            # Public API
├── types.ts            # 타입 정의
├── api/
│   ├── dto/
│   │   └── scramble.dto.ts       # 서버 응답 DTO
│   └── mapper/
│       └── scrambleMapper.ts     # DTO → Model 변환
└── model/
    └── scramble.ts     # 도메인 모델
```

---

## 🎯 모델 구조

### ScrambleResponse

스크램블 정보를 나타내는 모델입니다.

```typescript
interface ScrambleResponse {
  idx: number;              // 스크램블 ID
  attemptIdx: number;       // 시도 ID
  name: string;             // 플레이어 이름
  cckId: string;            // 플레이어 CCK ID
  roundIdx: number;         // 라운드 ID
  compName: string;         // 대회 이름
  eventName: string;        // 종목 이름
  roundName: string;        // 라운드 이름
  roundGroup: string;       // 라운드 그룹
  seq: string;              // 시퀀스
  scramble: string;         // 스크램블 문자열
  svg: string;              // SVG 이미지
}
```

---

## 📡 API 함수

현재 Entity 레이어에는 조회 API가 없습니다. 스크램블은 Feature 레이어의 `updateScrambler`를 통해 발급됩니다.

### 스크램블 발급 (Feature)

스크램블을 발급받으려면 Feature 레이어를 사용하세요:

```typescript
import { updateScrambler } from '@/features/scramble';

const scramble = await updateScrambler({
  compIdx: 1,
  playerUid: 'player123',
  scramblerUid: 'scrambler456'
});

console.log(scramble.scramble);  // "R U R' U' ..."
console.log(scramble.svg);       // "<svg>...</svg>"
```

> Feature 문서: [Scramble Feature](../../features/scramble/README.md)

---

## 🔄 DTO와 Mapper

### ScrambleResponseDTO

서버에서 받는 스크램블 정보:

```typescript
interface ScrambleResponseDTO {
  idx: number;
  attemptIdx: number;
  name: string;
  cckId: string;
  roundIdx: number;
  compName: string;
  eventName: string;
  roundName: string;
  roundGroup: string;
  seq: string;
  scramble: string;
  svg: string;
}
```

### ScrambleResponseMapper

DTO를 도메인 모델로 변환:

```typescript
export const ScrambleResponseMapper = (
  dto: ScrambleResponseDTO
): ScrambleResponse => ({
  idx: dto.idx,
  attemptIdx: dto.attemptIdx,
  name: dto.name,
  cckId: dto.cckId,
  roundIdx: dto.roundIdx,
  compName: dto.compName,
  eventName: dto.eventName,
  roundName: dto.roundName,
  roundGroup: dto.roundGroup,
  seq: dto.seq,
  scramble: dto.scramble,
  svg: dto.svg,
});
```

---

## 💡 사용 예시

### 스크램블 발급 후 표시

```typescript
import { updateScrambler } from '@/features/scramble';
import type { ScrambleResponse } from '@/entities/scramble';

const displayScramble = async (
  compIdx: number,
  playerUid: string,
  scramblerUid: string
) => {
  const scramble: ScrambleResponse = await updateScrambler({
    compIdx,
    playerUid,
    scramblerUid
  });
  
  return (
    <div>
      <h3>{scramble.compName} - {scramble.eventName}</h3>
      <p>플레이어: {scramble.name} ({scramble.cckId})</p>
      <p>라운드: {scramble.roundName} - {scramble.roundGroup}</p>
      
      <div className="scramble-text">
        {scramble.scramble}
      </div>
      
      <div 
        className="scramble-image"
        dangerouslySetInnerHTML={{ __html: scramble.svg }}
      />
    </div>
  );
};
```

---

## 📚 관련 문서

- **[Features Layer](../../features/README.md)** - CUD 패턴 개요
- **[Scramble Feature](../../features/scramble/README.md)** - 스크램블 발급
- **[Shared API](../../shared/README.md)** - ApiClient 사용법
- **[Architecture](../../../docs/guides/ARCHITECTURE.md)** - FSD 구조
