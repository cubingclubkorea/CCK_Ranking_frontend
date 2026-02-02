# Auth Feature

**인증 피처** - 로그인, 로그아웃, 토큰 관리

## 🔧 API 함수

### getToken

OAuth 인증 코드로 토큰 발급

```typescript
import { getToken } from '@/features/auth';

const tokenResponse = await getToken('authorization_code_from_sso');

// 결과
{
  access_token: 'eyJhbGciOiJIUzI1NiIs...',
  token_type: 'Bearer',
  expires_in: 3600,
  scope: 'read write'
}
```

### refreshAccessToken

만료된 Access Token 갱신

```typescript
import { refreshAccessToken } from '@/features/auth';

const newToken = await refreshAccessToken();
```

### logout

로그아웃

```typescript
import { logout } from '@/features/auth';

await logout();
// localStorage의 토큰 자동 삭제
```

## 📖 인증 플로우

### 1. 로그인

```
사용자 → 로그인 버튼 클릭
      ↓
프론트엔드 → SSO 서버로 리다이렉트 (LOGIN_URL)
      ↓
SSO → 사용자 인증
      ↓
SSO → /auth/confirm?code={code}로 리다이렉트
      ↓
프론트엔드 → getToken(code) 호출
      ↓
프론트엔드 → access_token을 localStorage에 저장
      ↓
프론트엔드 → 메인 페이지로 이동
```

### 2. API 호출

```
프론트엔드 → API 요청
      ↓
Axios 인터셉터 → Authorization 헤더에 토큰 자동 추가
      ↓
백엔드 → 토큰 검증
      ↓
백엔드 → 응답
```

### 3. 토큰 갱신

```
프론트엔드 → API 요청
      ↓
백엔드 → 401 Unauthorized
      ↓
Axios 인터셉터 → 토큰 삭제, localStorage에서 제거
      ↓
프론트엔드 → refreshAccessToken() 호출 (필요시)
```

## 📖 사용 예시

### 로그인 페이지

```typescript
import { LOGIN_URL } from '@/shared/config';

const LoginPage = () => {
  const handleLogin = () => {
    // SSO 서버로 리다이렉트
    window.location.href = LOGIN_URL;
  };
  
  return (
    <button onClick={handleLogin}>
      로그인
    </button>
  );
};
```

### 인증 확인 페이지

```typescript
import { getToken } from '@/features/auth';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleConfirm(code);
    }
  }, []);
  
  const handleConfirm = async (code: string) => {
    try {
      const tokenResponse = await getToken(code);
      
      // 토큰 저장
      localStorage.setItem('access_token', tokenResponse.access_token);
      
      // 메인 페이지로 이동
      navigate('/');
    } catch (error) {
      console.error('토큰 발급 실패:', error);
      navigate('/login');
    }
  };
  
  return <div>인증 처리중...</div>;
};
```

### 로그아웃 페이지

```typescript
import { logout } from '@/features/auth';
import { useNavigate } from 'react-router-dom';

const LogoutPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    handleLogout();
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 토큰은 이미 삭제됨
      navigate('/login');
    }
  };
  
  return <div>로그아웃 중...</div>;
};
```

## 🔐 토큰 관리

### 토큰 저장

```typescript
// 자동으로 저장됨
const tokenResponse = await getToken(code);
localStorage.setItem('access_token', tokenResponse.access_token);
```

### 토큰 자동 추가

axios 인터셉터가 자동으로 처리:

```typescript
// 모든 요청에 자동으로 추가됨
headers: {
  'Authorization': 'Bearer {access_token}'
}
```

### 토큰 삭제

```typescript
// logout() 호출 시 자동으로 삭제
await logout();

// 또는 직접 삭제
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

## 🚨 CSRF 보호

로그아웃과 토큰 갱신 시 CSRF 토큰 사용:

```typescript
// CSRF 토큰 가져오기
const csrfToken = await getCsrfToken();

// POST 요청 시 포함
await apiClient.post('/auth/logout', {}, {
  headers: {
    'X-XSRF-TOKEN': csrfToken,
  },
});
```

## 🔗 관련 문서

- [Shared API 가이드](../../shared/README.md) - ApiClient, 인터셉터
- [Features Layer](../README.md)

## 📝 API 엔드포인트

| 함수 | HTTP | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `getToken` | POST | `/auth/token?code={code}` | 토큰 발급 |
| `refreshAccessToken` | POST | `/auth/refresh` | 토큰 갱신 |
| `logout` | POST | `/auth/logout` | 로그아웃 |
| `getCsrfToken` | GET | `/auth/csrf` | CSRF 토큰 |
