# Features Layer

**비즈니스 로직 레이어** - 데이터 변경(CUD) 및 복잡한 비즈니스 로직

## 📁 구조

```
features/
├── README.md (이 파일)
├── index.ts            # 배럴 export
├── auth/               # 인증
│   └── README.md
├── competition/        # 대회 관리
│   └── README.md
├── round/              # 라운드 관리
│   └── README.md
├── record/             # 기록 관리
│   └── README.md
├── cubeEvent/          # 큐브 종목 관리
│   └── README.md
└── scramble/           # 스크램블 발급
    └── README.md
```

## 🎯 역할

Feature 레이어는 다음을 담당합니다:

1. **Create (생성)** - 새 데이터 생성
2. **Update (수정)** - 기존 데이터 수정
3. **Delete (삭제)** - 데이터 삭제
4. **비즈니스 로직** - 복잡한 도메인 로직

### ✅ Feature가 하는 것

```typescript
// CUD 작업
export const createCompetition = () => { ... }
export const updateCompetition = () => { ... }
export const deleteCompetition = () => { ... }

// 비즈니스 로직
export const advancePlayer = () => { ... }
export const addExtra = () => { ... }
```

### ❌ Feature가 하지 않는 것

```typescript
// Read는 Entities에서 ❌
export const getCompetition = () => { ... }  // → entities
export const getCompetitions = () => { ... }  // → entities
```

## 📂 표준 피처 구조

### 간단한 피처

```
features/competition/
├── README.md              # 이 피처의 가이드
├── index.ts               # Public API
├── create/
│   └── api/
│       ├── createCompetition.ts
│       └── dto/
│           └── competitionCreate.dto.ts
├── update/
│   └── api/
│       ├── updateCompetition.ts
│       └── dto/
│           └── competitionUpdate.dto.ts
└── delete/
    └── deleteCompetition.ts
```

### 복잡한 피처

```
features/record/
├── README.md
├── index.ts
├── type.ts
├── addPlayer/           # 플레이어 추가
│   └── api/
├── update/              # 기록 수정
│   └── api/
├── delete/              # 기록 삭제
│   └── api/
├── advance/             # 플레이어 진출
│   └── api/
├── extra/               # 추가 시도
│   └── api/
└── quit/                # 기록 포기
    └── api/
```

## 🔧 API 함수 작성 패턴

### CREATE

```typescript
// features/competition/create/api/createCompetition.ts
import { apiClient } from '@/shared/api/base';
import type { CompetitionCreateDTO } from './dto/competitionCreate.dto';

const BASE_URL = '/comp';

export const createCompetition = async (
  dto: CompetitionCreateDTO
): Promise<void> => {
  await apiClient.post<void, CompetitionCreateDTO>(BASE_URL, dto);
};
```

### UPDATE (PUT)

```typescript
// features/competition/update/api/updateCompetition.ts
import { apiClient } from '@/shared/api/base';
import type { CompetitionUpdateDTO } from './dto/competitionUpdate.dto';

const BASE_URL = '/comp';

export const updateCompetition = async (
  dto: CompetitionUpdateDTO
): Promise<void> => {
  await apiClient.put<void, CompetitionUpdateDTO>(BASE_URL, dto);
};
```

### UPDATE (PATCH)

```typescript
// features/record/update/api/updateRecord.ts
import { apiClient } from '@/shared/api/base';
import type { RecordUpdateDTO } from './dto/recordUpdate.dto';

const BASE_URL = '/record';

export const updateRecord = async (
  dto: RecordUpdateDTO
): Promise<void> => {
  await apiClient.patch<void, RecordUpdateDTO>(BASE_URL, dto);
};
```

### DELETE

```typescript
// features/competition/delete/deleteCompetition.ts
import { apiClient } from '@/shared/api/base';

const BASE_URL = '/comp';

export const deleteCompetition = async (id: number): Promise<void> => {
  await apiClient.delete<void>(`${BASE_URL}/${id}`);
};
```

## 📋 피처별 가이드

각 피처의 상세 가이드:

- [Auth (인증)](./auth/README.md)
- [Competition (대회 관리)](./competition/README.md)
- [Round (라운드 관리)](./round/README.md)
- [Record (기록 관리)](./record/README.md)
- [CubeEvent (큐브 종목 관리)](./cubeEvent/README.md)

## 🚀 새 피처 추가하기

### 1. 폴더 생성

```bash
mkdir -p features/newFeature/{create,update,delete}/api/dto
```

### 2. Create DTO 정의

```typescript
// features/newFeature/create/api/dto/newFeatureCreate.dto.ts
export interface NewFeatureCreateDTO {
  // ID는 서버가 생성하므로 없음
  name: string;
  description?: string;
}
```

### 3. Create API 작성

```typescript
// features/newFeature/create/api/createNewFeature.ts
import { apiClient } from '@/shared/api/base';
import type { NewFeatureCreateDTO } from './dto/newFeatureCreate.dto';

const BASE_URL = '/new-feature';

export const createNewFeature = async (
  dto: NewFeatureCreateDTO
): Promise<void> => {
  await apiClient.post<void, NewFeatureCreateDTO>(BASE_URL, dto);
};
```

### 4. Update/Delete도 동일한 패턴

### 5. 배럴 Export

```typescript
// features/newFeature/index.ts
export { createNewFeature } from './create/api/createNewFeature';
export { updateNewFeature } from './update/api/updateNewFeature';
export { deleteNewFeature } from './delete/deleteNewFeature';
```

### 6. README 작성

`features/newFeature/README.md` 파일 생성

## ✅ 체크리스트

새 Feature API 추가 시:

- [ ] 적절한 폴더 구조 (create/update/delete)
- [ ] DTO 타입 정의 (`dto/` 폴더)
- [ ] HTTP 메서드 선택 (POST/PUT/PATCH/DELETE)
- [ ] 함수명: `create/update/delete{Feature}`
- [ ] 반환 타입: 대부분 `Promise<void>`
- [ ] `index.ts`에 배럴 export 추가
- [ ] JSDoc 주석 작성
- [ ] README.md 작성

## 🔗 관련 문서

- [아키텍처 가이드](../../docs/guides/ARCHITECTURE.md)
- [Entities Layer](../entities/README.md) - Read API
- [Shared Layer](../shared/README.md) - API 클라이언트

## 💡 베스트 프랙티스

### 1. CRUD vs 비즈니스 로직 분리

```
features/record/
├── create/           ← 표준 CRUD
├── update/           ← 표준 CRUD
├── delete/           ← 표준 CRUD
├── advance/          ← 비즈니스 로직
├── extra/            ← 비즈니스 로직
└── quit/             ← 비즈니스 로직
```

### 2. 배치 작업

여러 항목을 한 번에 처리:

```typescript
// 배열로 받아서 한 번에 처리
export const createRounds = async (
  rounds: RoundCreateDTO[]
): Promise<void> => {
  await apiClient.post<void, RoundCreateDTO[]>(BASE_URL, rounds);
};
```

### 3. POST vs PUT vs PATCH

| 메서드 | 용도 | DTO |
|--------|------|-----|
| POST | 생성 | ID 없음, 필수 필드만 |
| PUT | 전체 교체 | ID + 모든 필드 |
| PATCH | 부분 수정 | ID + 수정할 필드만 |
| DELETE | 삭제 | 파라미터로 ID만 |
