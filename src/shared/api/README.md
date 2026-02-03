# Shared/API - HTTP 클라이언트

HTTP 통신을 위한 **Axios 기반 API 클라이언트**

## 📁 구조

```
api/
├── README.md (이 파일)
├── base.ts           # ApiClient - 메인 API
└── auth_base.ts      # SSOClient - 인증 API
```

---

## 🎯 클라이언트 종류

### 1. ApiClient (base.ts)

**메인 비즈니스 API** 클라이언트입니다.

```typescript
import { apiClient } from '@/shared/api/base';

const data = await apiClient.get('/comp/123');
```

**특징:**
- ✅ JWT 토큰 자동 추가
- ✅ 401 에러 시 토큰 자동 삭제
- ✅ 백엔드 에러 메시지 파싱
- ✅ CSRF 쿠키 전송 지원

---

### 2. SSOClient (auth_base.ts)

**인증 전용 API** 클라이언트입니다.

```typescript
import { ssoClient } from '@/shared/api/auth_base';

const token = await ssoClient.post('/auth/token', { code });
```

**특징:**
- ✅ 인증 서버 전용
- ✅ 토큰 자동 추가 없음 (인증 전이므로)
- ✅ CSRF 쿠키 전송 지원

---

## 📖 ApiClient 상세

### 기본 설정

```typescript
export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(url: string) {
    this.axiosInstance = axios.create({
      baseURL: url,                    // API_URL
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,           // CSRF 쿠키 전송
    });
    
    // 인터셉터 등록...
  }
}

export const apiClient = new ApiClient(API_URL);
```

---

### 요청 인터셉터

모든 요청에 Access Token을 자동으로 추가합니다.

```typescript
this.axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**동작:**
1. localStorage에서 `access_token` 조회
2. 토큰이 있으면 `Authorization` 헤더에 추가
3. `Bearer {token}` 형식으로 전송

**결과:**
```http
GET /comp/123 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

### 응답 인터셉터

에러를 일관되게 처리하고 메시지를 파싱합니다.

```typescript
this.axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorData: ErrorResponse | undefined = error.response.data;
      
      // 401 에러 → 토큰 삭제
      if (error.response.status === 401) {
        console.warn('401 Unauthorized: 토큰 제거');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      
      // 백엔드 에러 메시지 파싱
      let customMessage = '';
      if (errorData?.message) {
        customMessage = errorData.message;
        if (errorData.detailMessage) {
          customMessage += `: ${errorData.detailMessage}`;
        }
        customMessage += ` [${errorData.code}]`;
      } else {
        customMessage = error.response.statusText || '알 수 없는 에러';
      }
      
      // 파싱된 메시지로 Error 객체 생성
      const customError = new Error(customMessage);
      return Promise.reject(customError);
    }
    
    // 네트워크 에러 또는 요청 에러 처리
    // ...
  }
);
```

**에러 처리 흐름:**

```
1. 서버 응답 에러 (error.response)
   ├─ 401 Unauthorized → 토큰 삭제
   ├─ ErrorResponse 파싱 → 메시지 구성
   └─ Error 객체로 변환

2. 네트워크 에러 (error.request)
   └─ "네트워크 오류: 서버로부터 응답이 없습니다"

3. 요청 설정 에러 (error.message)
   └─ "요청 오류: {message}"
```

**백엔드 에러 응답 예시:**

```json
{
  "status": 404,
  "name": "CompetitionNotFoundException",
  "code": "COMP_001",
  "message": "대회를 찾을 수 없습니다",
  "detailMessage": "idx: 999는 존재하지 않는 대회입니다"
}
```

**파싱된 에러 메시지:**
```
"대회를 찾을 수 없습니다: idx: 999는 존재하지 않는 대회입니다 [COMP_001]"
```

---

### HTTP 메서드

#### GET

```typescript
public async get<TResult = unknown>(
  endpoint: string,
  queryParams?: Record<string, any>
): Promise<TResult> {
  const { data } = await this.axiosInstance.get<TResult>(endpoint, {
    params: queryParams,
  });
  return data;
}
```

**사용 예시:**

```typescript
import { apiClient } from '@/shared/api/base';

// 단순 조회
const comp = await apiClient.get<Competition>('/comp/123');

// 쿼리 파라미터
const comps = await apiClient.get<Competition[]>('/comp', {
  page: 0,
  size: 10,
  sort: ['compName,asc'],
});

// GET /comp?page=0&size=10&sort=compName,asc
```

---

#### POST

```typescript
public async post<TResult = unknown, TData = unknown>(
  endpoint: string,
  requestBody: TData,
  options?: AxiosRequestConfig
): Promise<TResult> {
  const { data } = await this.axiosInstance.post<TResult>(
    endpoint,
    requestBody,
    options
  );
  return data;
}
```

**사용 예시:**

```typescript
// JSON 전송 (기본)
await apiClient.post<void, CreateCompetitionDTO>('/comp', {
  compName: '2026 CCK 춘계대회',
  compDateStart: '2026-03-01',
  compDateEnd: '2026-03-02',
});

// FormData 전송
const formData = new FormData();
formData.append('file', file);

await apiClient.post<void, FormData>('/event', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

---

#### PUT

```typescript
public async put<TResult = unknown, TData = unknown>(
  endpoint: string,
  requestBody: TData
): Promise<TResult> {
  const { data } = await this.axiosInstance.put<TResult>(
    endpoint,
    requestBody
  );
  return data;
}
```

**사용 예시:**

```typescript
// 전체 수정
await apiClient.put<void, UpdateCompetitionDTO>('/comp', {
  idx: 123,
  compName: '수정된 대회명',
  compDateStart: '2026-03-01',
  compDateEnd: '2026-03-02',
  // 모든 필드 포함
});
```

---

#### PATCH

```typescript
public async patch<TResult = unknown, TData = unknown>(
  endpoint: string,
  requestBody: TData
): Promise<TResult> {
  const { data } = await this.axiosInstance.patch<TResult>(
    endpoint,
    requestBody
  );
  return data;
}
```

**사용 예시:**

```typescript
// 부분 수정
await apiClient.patch<void, Partial<RecordUpdateDTO>>('/record', {
  idx: 100,
  attempt1: 12345,  // 이 필드만 수정
  penalty1: '+2',
});
```

---

#### DELETE

```typescript
public async delete<TResult = unknown, TData = unknown>(
  endpoint: string,
  requestBody?: TData
): Promise<TResult> {
  const { data } = await this.axiosInstance.delete<TResult>(endpoint, {
    data: requestBody,
  });
  return data;
}
```

**사용 예시:**

```typescript
// 단순 삭제 (URL 파라미터)
await apiClient.delete<void>('/comp/123');

// 요청 본문 포함 삭제
await apiClient.delete<void, number[]>('/record/quit', [100, 101, 102]);
```

---

## 📖 SSOClient 상세

### 기본 설정

```typescript
export class SSOClient {
  private axiosInstance: AxiosInstance;

  constructor(url: string) {
    this.axiosInstance = axios.create({
      baseURL: url,                    // SSO_URL
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,           // 쿠키 전송
    });
    
    // 응답 인터셉터만 등록 (토큰 추가 없음)
  }
}

export const ssoClient = new SSOClient(SSO_URL);
```

**ApiClient와의 차이점:**
- ❌ 요청 인터셉터 없음 (토큰 자동 추가 X)
- ✅ 응답 인터셉터만 있음 (에러 처리)

**이유:**
- SSO API는 인증 전에 호출되므로 토큰이 없음
- 인증 후 받은 토큰은 ApiClient에서 사용

---

### HTTP 메서드

SSOClient도 동일한 메서드를 제공합니다:
- `get<TResult>(endpoint, queryParams?)`
- `post<TResult, TData>(endpoint, requestBody)`
- `put<TResult, TData>(endpoint, requestBody)`
- `patch<TResult, TData>(endpoint, requestBody)`
- `delete<TResult, TData>(endpoint, requestBody?)`

**사용 예시:**

```typescript
import { ssoClient } from '@/shared/api/auth_base';

// OAuth 토큰 발급
const tokenResponse = await ssoClient.post<TokenResponse>('/auth/token', {
  code: authCode,
});

// 토큰 갱신
const newToken = await ssoClient.post<TokenResponse>('/auth/refresh', {
  refresh_token: refreshToken,
});

// 로그아웃
await ssoClient.post<void>('/auth/logout', {});
```

---

## 💡 사용 패턴

### Entity Layer (Read)

```typescript
import { apiClient } from '@/shared/api/base';
import type { CompetitionDTO } from './dto/competition.dto';
import { CompetitionMapper } from './mapper/competitionMapper';

export const getCompetition = async (idx: number): Promise<Competition> => {
  const dto = await apiClient.get<CompetitionDTO>(`/comp/${idx}`);
  return CompetitionMapper(dto);
};
```

---

### Feature Layer (CUD)

```typescript
import { apiClient } from '@/shared/api/base';
import type { CreateCompetitionDTO } from './dto/competitionCreate.dto';

export const createCompetition = async (
  dto: CreateCompetitionDTO
): Promise<void> => {
  await apiClient.post<void, CreateCompetitionDTO>('/comp', dto);
};
```

---

### Auth Feature

```typescript
import { ssoClient } from '@/shared/api/auth_base';
import type { TokenResponse } from '../model/tokenResponse';

export const confirm = async (code: string): Promise<void> => {
  const response = await ssoClient.post<TokenResponse>('/auth/token', {
    code,
  });
  
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('refresh_token', response.refresh_token);
};
```

---

## 🔒 CSRF 보호

### 동작 방식

```typescript
withCredentials: true  // 쿠키 전송 활성화
```

**흐름:**
1. 서버가 `XSRF-TOKEN` 쿠키 전송
2. Axios가 자동으로 `X-XSRF-TOKEN` 헤더에 포함
3. 서버가 쿠키와 헤더 값 비교하여 검증

**요청 예시:**
```http
POST /comp HTTP/1.1
Host: localhost:8080
Cookie: XSRF-TOKEN=abc123
X-XSRF-TOKEN: abc123
Authorization: Bearer eyJhbG...
Content-Type: application/json
```

---

## 🚨 에러 처리

### try-catch 패턴

```typescript
try {
  const data = await apiClient.get('/comp/123');
  console.log(data);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);  // 파싱된 메시지
    alert(error.message);
  }
}
```

### apiHandler 활용

```typescript
import { apiHandler } from '@/shared/utils/apiHandler';

const handleClick = apiHandler(async () => {
  await apiClient.post('/comp', data);
  alert('성공!');
});
```

---

## 🎯 베스트 프랙티스

### 1. 타입 명시

```typescript
// ✅ 좋음 - 타입 명시
const comp = await apiClient.get<Competition>('/comp/123');

// ❌ 나쁨 - any 사용
const comp = await apiClient.get('/comp/123');
```

### 2. DTO 사용

```typescript
// ✅ 좋음 - DTO 타입 명시
await apiClient.post<void, CreateCompetitionDTO>('/comp', dto);

// ❌ 나쁨 - 객체 리터럴
await apiClient.post('/comp', { compName: '...' });
```

### 3. Mapper 사용

```typescript
// ✅ 좋음 - DTO → Model 변환
const dto = await apiClient.get<CompetitionDTO>('/comp/123');
return CompetitionMapper(dto);

// ❌ 나쁨 - DTO를 직접 사용
const comp = await apiClient.get('/comp/123');
return comp;
```

---

## 📚 관련 문서

- **[Shared Layer](../README.md)** - Shared 레이어 개요
- **[Config](../config/README.md)** - API_URL, SSO_URL 설정
- **[Utils](../utils/README.md)** - apiHandler 사용법
- **[Entities](../../entities/README.md)** - Read API 패턴
- **[Features](../../features/README.md)** - CUD API 패턴
