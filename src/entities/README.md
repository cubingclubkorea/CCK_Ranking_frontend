# Entities Layer

**도메인 모델 레이어** - 비즈니스 엔티티의 타입 정의 및 Read(조회) API

## 📁 구조

```
entities/
├── README.md (이 파일)
├── index.tsx           # 배럴 export
├── competition/        # 대회 엔티티
│   ├── README.md
│   ├── index.ts
│   ├── types.ts
│   ├── model/
│   └── api/
├── round/              # 라운드 엔티티
│   ├── README.md
│   └── ...
├── record/             # 기록 엔티티
│   ├── README.md
│   └── ...
├── cubeEvent/          # 큐브 종목 엔티티
│   ├── README.md
│   └── ...
└── scramble/           # 스크램블 엔티티
    ├── README.md
    └── ...
```

## 🎯 역할

Entity 레이어는 다음만 담당합니다:

1. **도메인 모델 정의** - 비즈니스 엔티티의 TypeScript 타입
2. **Read (조회) API** - 데이터를 가져오는 GET 요청만
3. **DTO → Model 변환** - 백엔드 응답을 프론트엔드 형식으로 변환

### ✅ Entity가 하는 것

```typescript
// 도메인 모델
export interface Competition { ... }

// Read API
export const getCompetition = (id) => { ... }
export const getCompetitions = () => { ... }

// DTO → Model 변환
export const CompetitionMapper = (dto) => ({ ... })
```

### ❌ Entity가 하지 않는 것

```typescript
// CUD 작업은 Features에서 ❌
export const createCompetition = () => { ... }  // → features
export const updateCompetition = () => { ... }  // → features
export const deleteCompetition = () => { ... }  // → features

// 비즈니스 로직도 Features에서 ❌
export const isCompetitionActive = () => { ... }  // → features
```

## 📂 표준 엔티티 구조

```
entities/competition/
├── README.md              # 이 엔티티의 가이드
├── index.ts               # Public API (배럴 export)
├── types.ts               # 공통 타입, 열거형
├── model/                 # 도메인 모델 (프론트엔드 사용)
│   ├── competition.ts
│   └── eventFee.ts
└── api/                   # API 함수
    ├── getCompetition.ts  # Read API 함수
    ├── dto/               # DTO (백엔드 응답 형식)
    │   ├── competition.dto.ts
    │   └── eventFee.dto.ts
    └── mapper/            # DTO → Model 변환
        ├── competitionMapper.ts
        └── eventFeeMapper.ts
```

## 🔧 API 함수 작성 패턴

### 기본 템플릿

```typescript
// entities/competition/api/getCompetition.ts
import { apiClient } from '@/shared/api/base';
import type { CompetitionDTO } from './dto/competition.dto';
import type { Competition } from '../model/competition';
import { CompetitionMapper } from './mapper/competitionMapper';

const BASE_URL = '/comp';

/**
 * 단일 대회 조회
 */
export const getCompetition = async (id: number): Promise<Competition> => {
  // 1. API 호출
  const data = await apiClient.get<CompetitionDTO>(`${BASE_URL}/${id}`);
  
  // 2. DTO를 Model로 변환
  return CompetitionMapper(data);
};
```

### 목록 조회 (페이지네이션)

```typescript
import type { Page } from '@/shared/model/page';
import type { PageQuery } from '@/shared/query/pageQuery';
import { mapPageableToParams } from '@/shared/query/pageQueryMapper';

export const getCompetitions = async (
  params?: PageQuery
): Promise<Page<Competition>> => {
  const data = await apiClient.get<Page<CompetitionDTO>>(
    BASE_URL,
    mapPageableToParams(params)
  );
  
  return {
    content: data.content.map(CompetitionMapper),
    page: data.page,
  };
};
```

## 🔄 DTO와 Model 분리

### DTO (백엔드 응답)

```typescript
// api/dto/competition.dto.ts
export interface CompetitionDTO {
  idx: number;
  compName: string;
  compDateStart: string;    // ISO 8601 문자열
  compDateEnd: string;      // ISO 8601 문자열
  createdAt: string;        // ISO 8601 문자열
  updatedAt: string;        // ISO 8601 문자열
}
```

### Model (프론트엔드 사용)

```typescript
// model/competition.ts
export interface Competition {
  idx: number;
  compName: string;
  compDateStart: Date;      // Date 객체
  compDateEnd: Date;        // Date 객체
  createdAt: Date;          // Date 객체
  updatedAt: Date;          // Date 객체
}
```

### Mapper (변환)

```typescript
// api/mapper/competitionMapper.ts
export const CompetitionMapper = (dto: CompetitionDTO): Competition => ({
  idx: dto.idx,
  compName: dto.compName,
  compDateStart: new Date(dto.compDateStart),
  compDateEnd: new Date(dto.compDateEnd),
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});
```

## 📋 엔티티별 가이드

각 엔티티의 상세 가이드:

- [Competition (대회)](./competition/README.md)
- [Round (라운드)](./round/README.md)
- [Record (기록)](./record/README.md)
- [CubeEvent (큐브 종목)](./cubeEvent/README.md)
- [Scramble (스크램블)](./scramble/README.md)

## 🚀 새 엔티티 추가하기

### 1. 폴더 생성

```bash
mkdir -p entities/newEntity/{model,api/{dto,mapper}}
```

### 2. 도메인 모델 정의

```typescript
// entities/newEntity/model/newEntity.ts
export interface NewEntity {
  idx: number;
  name: string;
  createdAt: Date;
}
```

### 3. DTO 정의

```typescript
// entities/newEntity/api/dto/newEntity.dto.ts
export interface NewEntityDTO {
  idx: number;
  name: string;
  createdAt: string;  // ISO 문자열
}
```

### 4. Mapper 작성

```typescript
// entities/newEntity/api/mapper/newEntityMapper.ts
import type { NewEntityDTO } from '../dto/newEntity.dto';
import type { NewEntity } from '../../model/newEntity';

export const NewEntityMapper = (dto: NewEntityDTO): NewEntity => ({
  idx: dto.idx,
  name: dto.name,
  createdAt: new Date(dto.createdAt),
});
```

### 5. API 함수 작성

```typescript
// entities/newEntity/api/getNewEntity.ts
import { apiClient } from '@/shared/api/base';
import type { NewEntityDTO } from './dto/newEntity.dto';
import type { NewEntity } from '../model/newEntity';
import { NewEntityMapper } from './mapper/newEntityMapper';

const BASE_URL = '/new-entity';

export const getNewEntity = async (id: number): Promise<NewEntity> => {
  const data = await apiClient.get<NewEntityDTO>(`${BASE_URL}/${id}`);
  return NewEntityMapper(data);
};
```

### 6. 배럴 Export

```typescript
// entities/newEntity/index.ts
export { getNewEntity } from './api/getNewEntity';
export type { NewEntity } from './model/newEntity';
```

### 7. README 작성

`entities/newEntity/README.md` 파일 생성

## ✅ 체크리스트

새 Entity API 추가 시:

- [ ] `model/` 폴더에 도메인 모델 정의
- [ ] `api/dto/` 폴더에 DTO 타입 정의
- [ ] `api/mapper/` 폴더에 Mapper 함수 작성
- [ ] `api/getXXX.ts`에 조회 함수 작성
- [ ] 함수명은 `getXXX` 패턴
- [ ] 반환 타입은 `Promise<Entity>` 또는 `Promise<Page<Entity>>`
- [ ] `index.ts`에 배럴 export 추가
- [ ] JSDoc 주석 작성
- [ ] README.md 작성

## 🔗 관련 문서

- [아키텍처 가이드](../../docs/guides/ARCHITECTURE.md)
- [Shared Layer](../shared/README.md) - API 클라이언트 사용법
- [Features Layer](../features/README.md) - CUD 작업

## 💡 베스트 프랙티스

### 1. 일관된 네이밍

```typescript
// ✅ 좋음
getCompetition()      // 단일 조회
getCompetitions()     // 목록 조회
getCompetitionPast()  // 조건부 조회
```

### 2. 타입 명시

```typescript
// ✅ 좋음
export const getCompetition = async (id: number): Promise<Competition> => {
  // ...
};
```

### 3. Mapper 재사용

```typescript
// ✅ 좋음
export const getCompetitions = async (): Promise<Competition[]> => {
  const data = await apiClient.get<CompetitionDTO[]>('/comp');
  return data.map(CompetitionMapper);  // 동일한 Mapper 사용
};
```

### 4. 에러는 throw

```typescript
// ✅ 좋음 - 에러를 던지기만 함
export const getCompetition = async (id: number): Promise<Competition> => {
  const data = await apiClient.get<CompetitionDTO>(`/comp/${id}`);
  return CompetitionMapper(data);
};

// ❌ 나쁨 - Entity에서 에러 처리
try {
  // ...
} catch (error) {
  console.error(error);
  return null;  // null 반환은 좋지 않음
}
```
