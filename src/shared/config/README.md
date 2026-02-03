# Shared/Config - 환경 변수

**환경별 설정 관리**

## 📁 구조

```
config/
├── README.md (이 파일)
└── index.ts           # 환경 변수 export
```

---

## 🎯 역할

Vite 환경 변수(`import.meta.env`)를 **중앙 집중식**으로 관리하고 타입 안전하게 export합니다.

---

## 📖 코드 구조

### index.ts

```typescript
// Centralized environment wrapper for public VITE_ variables
// Keep secrets out of client-side env; only expose non-sensitive values prefixed with VITE_

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? '',
  SSO_URL: import.meta.env.VITE_SSO_URL ?? '',
  LOGIN_URL: import.meta.env.VITE_LOGIN_URL ?? '',
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID ?? '',
  MODE: import.meta.env.MODE ?? 'development',
} as const;

export const API_URL = env.API_URL;
export const SSO_URL = env.SSO_URL;
export const LOGIN_URL = env.LOGIN_URL;
export const ANALYTICS_ID = env.ANALYTICS_ID;
export const MODE = env.MODE;
```

**특징:**
- `env` 객체로 모든 환경 변수를 그룹화
- 개별 상수로도 export (편의성)
- `?? ''` 로 undefined 방지
- `as const`로 타입 안전성 보장

---

## 🔧 사용 가능한 변수

### API_URL

메인 API 서버 URL

```typescript
import { API_URL } from '@/shared/config';

console.log(API_URL);  // "http://localhost:8080/api"
```

**용도:**
- `ApiClient` 초기화
- API 엔드포인트 구성

---

### SSO_URL

인증(SSO) 서버 URL

```typescript
import { SSO_URL } from '@/shared/config';

console.log(SSO_URL);  // "http://localhost:8081"
```

**용도:**
- `SSOClient` 초기화
- OAuth 토큰 발급/갱신

---

### LOGIN_URL

외부 로그인 페이지 URL

```typescript
import { LOGIN_URL } from '@/shared/config';

// 로그인 페이지로 리다이렉트
window.location.href = LOGIN_URL;
```

**용도:**
- 사용자 로그인 리다이렉트
- OAuth 인증 흐름 시작

---

### ANALYTICS_ID

분석 도구 ID (Google Analytics 등)

```typescript
import { ANALYTICS_ID } from '@/shared/config';

if (ANALYTICS_ID) {
  initializeAnalytics(ANALYTICS_ID);
}
```

**용도:**
- 웹 분석 초기화
- 사용자 추적

---

### MODE

실행 모드

```typescript
import { MODE } from '@/shared/config';

console.log(MODE);  // "development" | "production"

if (MODE === 'development') {
  console.log('개발 모드입니다');
}
```

**값:**
- `development` - 개발 환경
- `production` - 프로덕션 환경

---

## 📄 환경 파일 설정

### .env.development

개발 환경 설정:

```bash
# API 서버 (로컬)
VITE_API_URL=http://localhost:8080/api

# SSO 서버 (로컬)
VITE_SSO_URL=http://localhost:8081

# 로그인 페이지
VITE_LOGIN_URL=http://localhost:8081/login

# 분석 ID (개발 환경에서는 비활성화)
VITE_ANALYTICS_ID=
```

---

### .env.production

프로덕션 환경 설정:

```bash
# API 서버 (실서버)
VITE_API_URL=https://api.example.com/api

# SSO 서버 (실서버)
VITE_SSO_URL=https://sso.example.com

# 로그인 페이지
VITE_LOGIN_URL=https://sso.example.com/login

# 분석 ID
VITE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

### .env.local

로컬 개발자별 설정 (Git 제외):

```bash
# 특정 개발자만 다른 API 서버 사용
VITE_API_URL=http://192.168.1.100:8080/api

# 디버그 모드
VITE_DEBUG=true
```

**우선순위:**
```
.env.local > .env.{mode} > .env
```

---

## 💡 사용 패턴

### 1. API Client 초기화

```typescript
import { API_URL } from '@/shared/config';
import axios from 'axios';

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,  // 환경 변수 사용
      // ...
    });
  }
}
```

---

### 2. 조건부 기능 활성화

```typescript
import { MODE, ANALYTICS_ID } from '@/shared/config';

// 프로덕션에서만 분석 활성화
if (MODE === 'production' && ANALYTICS_ID) {
  ReactGA.initialize(ANALYTICS_ID);
}

// 개발 모드에서만 디버그 로그
if (MODE === 'development') {
  console.log('API Response:', data);
}
```

---

### 3. 외부 링크 생성

```typescript
import { LOGIN_URL } from '@/shared/config';

export const LoginButton = () => {
  return (
    <a href={LOGIN_URL}>
      로그인
    </a>
  );
};
```

---

## 🚨 주의사항

### 1. VITE_ 접두사 필수

Vite는 `VITE_` 접두사가 있는 환경 변수만 클라이언트에 노출합니다.

```bash
# ✅ 노출됨
VITE_API_URL=http://localhost:8080/api

# ❌ 노출 안 됨
API_URL=http://localhost:8080/api
```

---

### 2. 민감 정보 제외

클라이언트 코드에 번들링되므로 **민감 정보를 포함하지 마세요**.

```bash
# ❌ 위험 - API 키 노출
VITE_SECRET_KEY=my-secret-key-123

# ✅ 안전 - 공개 정보만
VITE_API_URL=http://localhost:8080/api
```

**민감 정보는 서버에서만 사용:**
- API 시크릿 키
- 데이터베이스 비밀번호
- Private 토큰

---

### 3. 빌드 시점에 고정

환경 변수는 **빌드 시점에 결정**되며, 런타임에 변경할 수 없습니다.

```typescript
// ❌ 런타임 변경 불가
import.meta.env.VITE_API_URL = 'http://new-url';  // 작동 안 함

// ✅ 빌드 시점에 결정됨
console.log(API_URL);  // 빌드 시 설정된 값
```

---

## 🔍 디버깅

### 환경 변수 확인

```typescript
import { env } from '@/shared/config';

console.log('Environment Variables:', env);
// {
//   API_URL: "http://localhost:8080/api",
//   SSO_URL: "http://localhost:8081",
//   LOGIN_URL: "http://localhost:8081/login",
//   ANALYTICS_ID: "",
//   MODE: "development"
// }
```

---

### 누락된 환경 변수 검증

```typescript
import { API_URL, SSO_URL, LOGIN_URL } from '@/shared/config';

if (!API_URL || !SSO_URL || !LOGIN_URL) {
  throw new Error('필수 환경 변수가 설정되지 않았습니다.');
}

// 또는 개별 검증
if (!API_URL) {
  console.error('VITE_API_URL이 설정되지 않았습니다!');
}
```

---

## 🎯 베스트 프랙티스

### 1. 환경 변수 중앙 집중화

```typescript
// ✅ 좋음 - config에서 import
import { API_URL } from '@/shared/config';

// ❌ 나쁨 - 직접 접근
const url = import.meta.env.VITE_API_URL;
```

**이유:**
- 타입 안전성
- 변경 용이성
- 일관성

---

### 2. 타입 정의

```typescript
// shared/config/index.ts
type Environment = {
  readonly API_URL: string;
  readonly SSO_URL: string;
  readonly LOGIN_URL: string;
  readonly ANALYTICS_ID: string;
  readonly MODE: 'development' | 'production';
};

export const env: Environment = {
  API_URL: import.meta.env.VITE_API_URL ?? '',
  SSO_URL: import.meta.env.VITE_SSO_URL ?? '',
  LOGIN_URL: import.meta.env.VITE_LOGIN_URL ?? '',
  ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID ?? '',
  MODE: import.meta.env.MODE ?? 'development',
} as const;
```

---

### 3. 기본값 제공

```typescript
// ✅ 좋음 - 기본값 제공
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

// ❌ 나쁨 - undefined 가능성
export const API_URL = import.meta.env.VITE_API_URL;
```

---

### 4. .env.example 제공

프로젝트 루트에 `.env.example` 파일 생성:

```bash
# .env.example
# 개발자들이 복사해서 사용할 템플릿

# API 서버 URL
VITE_API_URL=http://localhost:8080/api

# SSO 서버 URL
VITE_SSO_URL=http://localhost:8081

# 로그인 페이지 URL
VITE_LOGIN_URL=http://localhost:8081/login

# 분석 ID (선택)
VITE_ANALYTICS_ID=
```

**사용법:**
```bash
cp .env.example .env.local
# 그리고 .env.local 수정
```

---

## 📚 관련 문서

- **[Shared Layer](../README.md)** - Shared 레이어 개요
- **[API](../api/README.md)** - ApiClient, SSOClient
- **[Vite 환경 변수 문서](https://vitejs.dev/guide/env-and-mode.html)** - 공식 가이드
