# 코드 컨벤션 가이드

## 목차
1. [프로젝트 구조](#프로젝트-구조)
2. [네이밍 컨벤션](#네이밍-컨벤션)
3. [파일 및 폴더 구조](#파일-및-폴더-구조)
4. [TypeScript 규칙](#typescript-규칙)
5. [React 컴포넌트 규칙](#react-컴포넌트-규칙)
6. [Import 규칙](#import-규칙)
7. [코드 스타일](#코드-스타일)

---

## 프로젝트 구조

이 프로젝트는 **FSD (Feature-Sliced Design)** 아키텍처를 따릅니다.

```
src/
├── app/          # 앱 엔트리포인트, 전역 설정, 라우터
├── pages/        # 라우트별 페이지 컴포넌트
├── widgets/      # 재사용 가능한 UI 컴포넌트 (프레젠테이셔널)
├── features/     # 도메인 기능 단위 (비즈니스 로직)
├── entities/     # 도메인 모델, 타입, 기본 API
└── shared/       # 공통 유틸, 설정, API 클라이언트
```

### 계층별 책임

- **app**: 애플리케이션 초기화, 라우터 설정, 전역 스타일
- **pages**: URL 라우트와 1:1 매핑되는 페이지 컴포넌트
- **widgets**: 여러 페이지에서 재사용되는 독립적인 UI 컴포넌트
- **features**: 특정 기능(Create, Update, Delete 등)의 비즈니스 로직
- **entities**: 도메인 엔티티의 타입 정의, 기본 CRUD API
- **shared**: 프로젝트 전반에서 사용되는 유틸리티, API 클라이언트, 설정

---

## 네이밍 컨벤션

### 파일명

| 타입 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `DashboardPage.tsx`, `CompetitionCard.tsx` |
| 타입/인터페이스 파일 | camelCase + `.ts` | `types.ts`, `competition.ts` |
| API 함수 파일 | camelCase | `getCompetition.ts`, `createRound.ts` |
| 유틸리티 | camelCase | `apiHandler.ts`, `tokenStorage.ts` |
| DTO | camelCase + `.dto.ts` | `competition.dto.ts` |
| Mapper | camelCase + `Mapper.ts` | `competitionMapper.ts` |
| 설정 파일 | lowercase | `index.ts`, `config.ts` |

### 변수 및 함수명

```typescript
// 변수: camelCase
const userId = 123;
const isAuthenticated = true;
const competitionList = [];

// 상수: UPPER_SNAKE_CASE (환경변수, 설정값)
const API_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// 함수: camelCase, 동사로 시작
const getCompetition = () => {};
const createRound = () => {};
const handleSubmit = () => {};
const isValidToken = () => {};

// React 컴포넌트: PascalCase
const DashboardPage = () => {};
const CompetitionCard = () => {};
```

### 타입/인터페이스명

```typescript
// 인터페이스: PascalCase
interface Competition {
  idx: number;
  compName: string;
}

// 타입: PascalCase
type PageQuery = {
  page?: number;
  size?: number;
};

// DTO: PascalCase + DTO 접미사
interface CompetitionDTO {
  idx: number;
  compName: string;
}

// Generic 타입: 단일 대문자 또는 PascalCase
type Page<T> = {
  content: T[];
};
```

---

## 파일 및 폴더 구조

### Entity 구조

```
entities/
└── competition/
    ├── index.ts              # 배럴 export
    ├── types.ts              # 타입 정의
    ├── model/                # 도메인 모델
    │   ├── competition.ts
    │   └── eventFee.ts
    └── api/                  # API 함수
        ├── getCompetition.ts
        ├── dto/              # DTO 타입
        │   ├── competition.dto.ts
        │   └── eventFee.dto.ts
        └── mapper/           # DTO → Model 매퍼
            ├── competitionMapper.ts
            └── eventFeeMapper.ts
```

### Feature 구조

```
features/
└── competition/
    ├── index.ts              # 배럴 export
    ├── create/
    │   └── api/
    │       └── createCompetition.ts
    ├── update/
    │   └── api/
    │       └── updateCompetition.ts
    └── delete/
        └── deleteCompetition.ts
```

### Shared 구조

```
shared/
├── index.ts                  # 배럴 export
├── api/
│   ├── base.ts              # ApiClient
│   └── auth_base.ts         # SSOClient
├── config/
│   └── index.ts             # 환경변수
├── model/
│   ├── error.ts
│   ├── page.ts
│   └── pagination.ts
├── query/
│   ├── pageQuery.ts
│   ├── pageQueryMapper.ts
│   └── sort.ts
└── utils/
    └── apiHandler.ts
```

---

## TypeScript 규칙

### 1. 타입 우선 사용

```typescript
// ✅ 좋음: type 사용
type PageQuery = {
  page?: number;
  size?: number;
};

// ✅ 좋음: interface 사용 (확장이 필요한 경우)
interface Competition {
  idx: number;
  compName: string;
}

interface DetailedCompetition extends Competition {
  description: string;
}
```

### 2. any 금지

```typescript
// ❌ 나쁨
const data: any = await fetchData();

// ✅ 좋음
const data: Competition = await fetchData();

// ✅ 좋음: 타입을 모르는 경우 unknown 사용
const data: unknown = await fetchData();
```

### 3. Optional과 Nullable 구분

```typescript
// Optional: 속성이 있을 수도, 없을 수도
type User = {
  name: string;
  email?: string;  // undefined 가능
};

// Nullable: 속성은 있지만 null 가능
type User = {
  name: string;
  email: string | null;
};
```

### 4. 제네릭 활용

```typescript
// API 응답 타입
interface Page<T> {
  content: T[];
  page: Pagination;
}

// API 함수
const getCompetitions = async (): Promise<Page<Competition>> => {
  // ...
};
```

---

## React 컴포넌트 규칙

### 1. 함수형 컴포넌트 사용

```typescript
// ✅ 좋음
const DashboardPage = () => {
  return <div>Dashboard</div>;
};

export default DashboardPage;
```

### 2. Props 타입 정의

```typescript
// Props 타입 정의
interface CompetitionCardProps {
  competition: Competition;
  onSelect?: (idx: number) => void;
}

const CompetitionCard = ({ competition, onSelect }: CompetitionCardProps) => {
  return (
    <div onClick={() => onSelect?.(competition.idx)}>
      {competition.compName}
    </div>
  );
};
```

### 3. 상태 관리

```typescript
const CompetitionPage = () => {
  // 단순 타입 추론 가능
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 복잡한 타입은 명시
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  
  return <div>...</div>;
};
```

### 4. 이벤트 핸들러

```typescript
// ✅ 좋음: handleXxx 패턴
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ...
};

const handleClick = () => {
  // ...
};
```

---

## Import 규칙

### 1. Import 순서

```typescript
// 1. React 관련
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 외부 라이브러리
import axios from 'axios';

// 3. 내부 모듈 (절대 경로)
import { Competition } from '@/entities';
import { createCompetition } from '@/features';
import { apiClient, API_URL } from '@/shared';

// 4. 상대 경로
import { CompetitionCard } from './CompetitionCard';
import type { Props } from './types';

// 5. 스타일
import './styles.css';
```

### 2. 절대 경로 사용

```typescript
// ❌ 나쁨
import { Competition } from '../../../entities/competition';

// ✅ 좋음
import { Competition } from '@/entities';
```

### 3. 배럴 Export 활용

```typescript
// entities/index.tsx
export * from './competition';
export * from './cubeEvent';
export * from './record';

// 사용하는 곳
import { Competition, CubeEvent, Record } from '@/entities';
```

### 4. Type Import

```typescript
// ✅ 좋음: type만 import할 때는 type 키워드 사용
import type { Competition } from '@/entities';
import type { PageQuery } from '@/shared';

// ✅ 좋음: 혼합된 경우
import { apiClient, type ApiResponse } from '@/shared';
```

---

## 코드 스타일

### 1. 들여쓰기 및 공백

- 들여쓰기: **2 스페이스**
- 세미콜론: **사용**
- 따옴표: **싱글 쿼트(`'`)**

```typescript
const example = {
  name: 'example',
  value: 123,
};
```

### 2. 줄바꿈

```typescript
// ✅ 좋음: 한 줄이 너무 길면 줄바꿈
const competition = await getCompetition(
  competitionId,
  {
    includeEvents: true,
    includeRecords: false,
  }
);

// ✅ 좋음: 체이닝은 줄바꿈
const result = competitions
  .filter(comp => comp.isActive)
  .map(comp => comp.name)
  .sort();
```

### 3. 화살표 함수

```typescript
// ✅ 좋음: 단일 표현식은 중괄호 생략
const double = (x: number) => x * 2;

// ✅ 좋음: 여러 줄은 중괄호 사용
const processCompetition = (comp: Competition) => {
  const processed = transform(comp);
  return processed;
};

// ✅ 좋음: 객체 반환 시 괄호로 감싸기
const createUser = (name: string) => ({
  name,
  createdAt: new Date(),
});
```

### 4. 주석

```typescript
/**
 * 대회 목록을 조회합니다.
 * 
 * @param params - 페이지네이션 파라미터
 * @returns 대회 목록과 페이지 정보
 */
export const getCompetitions = async (params?: PageQuery): Promise<Page<Competition>> => {
  // API 호출
  const data = await apiClient.get<Page<CompetitionDTO>>('/comp', params);
  
  // DTO를 모델로 변환
  return {
    content: data.content.map(CompetitionMapper),
    page: data.page,
  };
};
```

### 5. 에러 처리

```typescript
// ✅ 좋음: try-catch 사용
const fetchCompetition = async (id: number) => {
  try {
    const data = await getCompetition(id);
    setCompetition(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 에러';
    setError(message);
    console.error('대회 조회 실패:', error);
  }
};
```

### 6. 조건부 렌더링

```typescript
// ✅ 좋음: && 연산자
{loading && <div>로딩중...</div>}

// ✅ 좋음: 삼항 연산자
{error ? <div>{error}</div> : <div>성공</div>}

// ✅ 좋음: early return
if (loading) return <div>로딩중...</div>;
if (error) return <div>{error}</div>;
return <div>내용</div>;
```

---

## ESLint 규칙

프로젝트는 다음 ESLint 설정을 따릅니다:

```javascript
// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // ... 설정
]);
```

주요 규칙:
- `react-hooks/rules-of-hooks`: 훅 규칙 강제
- `react-hooks/exhaustive-deps`: 의존성 배열 검사
- `react-refresh/only-export-components`: HMR을 위한 컴포넌트 export 규칙

---

## Git 커밋 메시지

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 작업, 패키지 매니저 설정 등

예시:
feat: 대회 생성 API 연동
fix: 로그인 토큰 갱신 오류 수정
docs: API 연동 가이드 작성
```

---

## 추가 참고사항

1. **코드 품질**
   - 함수는 한 가지 일만 하도록 작성
   - 매직 넘버 사용 금지, 상수로 정의
   - 변수명은 의미를 명확하게 표현

2. **성능 최적화**
   - 불필요한 리렌더링 방지 (`React.memo`, `useMemo`, `useCallback`)
   - 이미지 최적화
   - 코드 스플리팅 고려

3. **접근성**
   - 시맨틱 HTML 사용
   - alt 텍스트 제공
   - 키보드 접근성 고려

4. **보안**
   - XSS 공격 방지
   - CSRF 토큰 사용
   - 민감한 정보는 환경변수로 관리
