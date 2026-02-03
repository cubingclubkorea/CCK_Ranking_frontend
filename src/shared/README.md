# Shared Layer

**공통 기능 레이어** - 프로젝트 전반에서 사용되는 유틸리티, API 클라이언트, 설정

## 📁 구조

```
shared/
├── README.md (이 파일)
├── api/
│   ├── README.md         # API 클라이언트 상세 문서
│   ├── base.ts           # ApiClient - 메인 API 통신
│   └── auth_base.ts      # SSOClient - 인증 API 통신
├── config/
│   ├── README.md         # 환경 변수 상세 문서
│   └── index.ts          # 환경 변수
├── model/
│   ├── README.md         # 공통 타입 상세 문서
│   ├── error.ts          # 에러 타입
│   ├── page.ts           # 페이지 타입
│   └── pagination.ts     # 페이지네이션 타입
├── query/
│   ├── README.md         # 페이지네이션 쿼리 상세 문서
│   ├── pageQuery.ts      # 페이지 쿼리 타입
│   ├── pageQueryMapper.ts # 쿼리 파라미터 변환
│   └── sort.ts           # 정렬 타입
└── utils/
    ├── README.md         # 유틸리티 상세 문서
    └── apiHandler.ts     # API 호출 헬퍼
```

---

## 📚 하위 문서

각 디렉토리의 상세 문서를 참고하세요:

- **[API 클라이언트](./api/README.md)** - ApiClient, SSOClient 상세 가이드
- **[환경 변수](./config/README.md)** - 환경 설정 관리
- **[공통 타입](./model/README.md)** - ErrorResponse, Page, Pagination
- **[페이지네이션 쿼리](./query/README.md)** - PageQuery, Sort, Mapper
- **[유틸리티](./utils/README.md)** - apiHandler 사용법

## 🎯 역할

Shared 레이어는 모든 상위 레이어에서 사용할 수 있는 **범용적인 기능**을 제공합니다:

- API 통신 클라이언트
- 환경 변수 관리
- 공통 타입 정의
- 유틸리티 함수

## 🔧 주요 기능

### 1. API 클라이언트

#### ApiClient (메인 API)

```typescript
import { apiClient } from '@/shared/api/base';

// GET 요청
const data = await apiClient.get<CompetitionDTO>('/comp/123');

// POST 요청
await apiClient.post<void, CreateDTO>('/comp', createData);

// PUT 요청
await apiClient.put<void, UpdateDTO>('/comp', updateData);

// PATCH 요청
await apiClient.patch<void, PatchDTO>('/comp', patchData);

// DELETE 요청
await apiClient.delete<void>('/comp/123');
```

**특징:**
- 자동 Authorization 헤더 추가
- 401 에러 시 토큰 삭제
- 에러 메시지 자동 파싱
- CSRF 쿠키 전송 지원

#### SSOClient (인증 API)

```typescript
import { ssoClient } from '@/shared/api/auth_base';

const token = await ssoClient.post<TokenResponse>('/auth/token', { code });
```

### 2. 환경 변수

```typescript
import { API_URL, SSO_URL, LOGIN_URL } from '@/shared/config';

console.log(API_URL);  // http://localhost:8080/api
```

**사용 가능한 변수:**
- `API_URL` - 메인 API 서버 URL
- `SSO_URL` - 인증 서버 URL
- `LOGIN_URL` - 로그인 페이지 URL
- `MODE` - 실행 모드 (development/production)

### 3. 공통 타입

#### 페이지네이션

```typescript
import type { Page, PageQuery, Pagination } from '@/shared';

// 페이지 쿼리
const query: PageQuery = {
  page: 0,
  size: 10,
  sort: [{ property: 'name', direction: 'asc' }],
};

// 페이지 응답
const response: Page<Competition> = {
  content: [...],
  page: {
    size: 10,
    number: 0,
    totalElements: 100,
    totalPages: 10,
  },
};
```

#### 에러

```typescript
import type { ErrorResponse } from '@/shared';

const error: ErrorResponse = {
  code: 'COMP_001',
  name: 'CompetitionNotFoundException',
  message: '대회를 찾을 수 없습니다',
  detailMessage: 'idx: 999는 존재하지 않는 대회입니다',
};
```

### 4. 유틸리티

#### API 핸들러

API 호출의 공통 로직(로딩, 에러, 성공)을 추상화합니다.

```typescript
import { createApiHandler } from '@/shared/utils/apiHandler';

const Component = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const apiHandler = createApiHandler(setLoading, setError, setResult);
  
  const handleCreate = async () => {
    await apiHandler(
      () => createCompetition(data),
      '대회가 생성되었습니다.'
    );
  };
  
  return (
    <div>
      {loading && <div>처리중...</div>}
      {error && <div className="error">{error}</div>}
      {result && <div className="success">{result}</div>}
    </div>
  );
};
```

## 📖 상세 가이드

### ApiClient 내부 동작

#### 요청 인터셉터

모든 요청에 자동으로 Access Token을 추가합니다.

```typescript
// 자동으로 추가됨
headers: {
  'Authorization': 'Bearer {access_token}'
}
```

**구현 코드:**

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

#### 응답 인터셉터

에러를 일관되게 처리합니다.

```typescript
// 401 에러 → 토큰 삭제
if (status === 401) {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// 백엔드 에러 메시지 파싱
const message = `${error.message}: ${error.detailMessage} [${error.code}]`;
throw new Error(message);
```

**구현 코드:**

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 401: 인증 실패 → 토큰 삭제
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      
      // 백엔드 ErrorResponse 파싱
      if (data?.code && data?.message) {
        const message = data.detailMessage 
          ? `${data.message}: ${data.detailMessage} [${data.code}]`
          : `${data.message} [${data.code}]`;
        throw new Error(message);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### CSRF 보호

민감한 작업(CUD)에 CSRF 토큰을 사용합니다.

```typescript
// Axios 설정
withCredentials: true  // 쿠키 전송 활성화
```

서버는 CSRF 토큰을 쿠키로 전송하고, Axios가 자동으로 요청에 포함시킵니다.

### 페이지네이션 사용법

#### 쿼리 파라미터 변환

```typescript
import { mapPageableToParams } from '@/shared/query/pageQueryMapper';

const params = mapPageableToParams({
  page: 0,
  size: 10,
  sort: [
    { property: 'compName', direction: 'asc' },
    { property: 'createdAt', direction: 'desc' }
  ],
});

// 결과:
// {
//   page: 0,
//   size: 10,
//   sort: ['compName,asc', 'createdAt,desc']
// }
```

**Mapper 구현:**

```typescript
export const mapPageableToParams = (pageable: PageQuery) => {
  const params: Record<string, any> = {
    page: pageable.page,
    size: pageable.size,
  };
  
  if (pageable.sort && pageable.sort.length > 0) {
    params.sort = pageable.sort.map(
      (s) => `${s.property},${s.direction}`
    );
  }
  
  return params;
};
```

#### API 호출 예시

```typescript
const response = await apiClient.get<Page<CompetitionDTO>>(
  '/comp',
  mapPageableToParams(pageQuery)
);

// GET /comp?page=0&size=10&sort=compName,asc&sort=createdAt,desc
```

#### 페이지 응답 처리

```typescript
import type { Page } from '@/shared/model/page';

const handlePageResponse = (response: Page<CompetitionDTO>) => {
  const { content, page } = response;
  
  console.log(`총 ${page.totalElements}개 중 ${content.length}개 조회`);
  console.log(`현재 페이지: ${page.number + 1}/${page.totalPages}`);
  
  // content를 도메인 모델로 변환
  const competitions = content.map(CompetitionMapper);
  
  return {
    items: competitions,
    totalPages: page.totalPages,
    totalItems: page.totalElements,
    currentPage: page.number,
  };
};
```

### 환경 변수 설정

#### .env 파일 구조

```bash
# .env.development
VITE_API_URL=http://localhost:8080/api
VITE_SSO_URL=http://localhost:8081
VITE_LOGIN_URL=http://localhost:8081/login

# .env.production
VITE_API_URL=https://api.example.com/api
VITE_SSO_URL=https://sso.example.com
VITE_LOGIN_URL=https://sso.example.com/login
```

#### config/index.ts 구현

```typescript
export const API_URL = import.meta.env.VITE_API_URL;
export const SSO_URL = import.meta.env.VITE_SSO_URL;
export const LOGIN_URL = import.meta.env.VITE_LOGIN_URL;
export const MODE = import.meta.env.MODE;

// 타입 안전성
if (!API_URL || !SSO_URL || !LOGIN_URL) {
  throw new Error('필수 환경 변수가 설정되지 않았습니다.');
}
```

### API Handler 상세

#### createApiHandler 구현

```typescript
export const createApiHandler = (
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setResult: (result: string | null) => void
) => {
  return async <T>(
    apiCall: () => Promise<T>,
    successMessage?: string
  ): Promise<T | undefined> => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const result = await apiCall();
      
      if (successMessage) {
        setResult(successMessage);
      }
      
      return result;
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : '알 수 없는 오류가 발생했습니다.';
      setError(message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };
};
```

#### 단순 버전 (apiHandler)

```typescript
export const apiHandler = <T>(
  apiCall: () => Promise<T>
): (() => Promise<void>) => {
  return async () => {
    try {
      await apiCall();
    } catch (error) {
      console.error('API 에러:', error);
      alert(error instanceof Error ? error.message : '오류가 발생했습니다.');
    }
  };
};
```

#### 사용 예시 비교

```typescript
// 1. createApiHandler - 상태 관리 필요 시
const Component1 = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const apiHandler = createApiHandler(setLoading, setError, setResult);
  
  const handleClick = async () => {
    await apiHandler(
      () => createCompetition(data),
      '대회가 생성되었습니다!'
    );
  };
  
  return (
    <>
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {result && <SuccessAlert message={result} />}
      <button onClick={handleClick}>생성</button>
    </>
  );
};

// 2. apiHandler - 간단한 alert만 필요 시
const Component2 = () => {
  const handleClick = apiHandler(async () => {
    await createCompetition(data);
    alert('대회가 생성되었습니다!');
  });
  
  return <button onClick={handleClick}>생성</button>;
};
```

## 🚨 주의사항

### 1. 비즈니스 로직 금지

Shared는 **범용적인 기능**만 제공해야 합니다.

```typescript
// ❌ 나쁨 - 비즈니스 로직
export const isCompetitionActive = (comp: Competition) => {
  const now = new Date();
  return comp.compDateStart <= now && now <= comp.compDateEnd;
};

// ✅ 좋음 - 범용 유틸리티
export const isDateInRange = (date: Date, start: Date, end: Date) => {
  return start <= date && date <= end;
};
```

### 2. 도메인 타입 금지

도메인 특화 타입은 entities에 정의합니다.

```typescript
// ❌ shared/model/competition.ts
export interface Competition { ... }

// ✅ entities/competition/model/competition.ts
export interface Competition { ... }
```

### 3. 상위 레이어 의존 금지

Shared는 다른 레이어에 의존하면 안 됩니다.

```typescript
// ❌ shared에서 entities import
import { Competition } from '@/entities/competition';

// ✅ shared는 독립적
import type { Page } from './model/page';
```

## 🔗 관련 문서

- [아키텍처 가이드](../../docs/guides/ARCHITECTURE.md)
- [Entities Layer](../entities/README.md)
- [Features Layer](../features/README.md)

## ✅ 체크리스트

새 shared 기능 추가 시:

- [ ] 범용적인 기능인가? (도메인 특화 X)
- [ ] 다른 레이어에 의존하지 않는가?
- [ ] 재사용 가능한가?
- [ ] 타입이 명확한가?
- [ ] JSDoc 주석 작성했는가?
