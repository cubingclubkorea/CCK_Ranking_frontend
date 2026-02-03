# App Layer

**애플리케이션 레이어** - 앱 초기화, 전역 설정, 라우터

## 📁 구조

```
app/
├── README.md (이 파일)
├── App.css          # 전역 스타일
├── App.tsx          # 루트 컴포넌트
├── index.css        # CSS 리셋, 기본 스타일
├── main.tsx         # 앱 엔트리포인트
└── router.tsx       # 라우트 설정
```

---

## 🎯 역할

App 레이어는 애플리케이션의 **최상위 레이어**로 다음을 담당합니다:

1. **앱 초기화** - React 앱 마운트
2. **라우터 설정** - URL과 페이지 매핑
3. **전역 설정** - 전역 스타일, 프로바이더
4. **앱 진입점** - 모든 것의 시작점

---

## 📄 파일 설명

### main.tsx - 앱 엔트리포인트

앱의 진입점으로 React 앱을 DOM에 마운트합니다.

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**역할:**
- DOM 요소 찾기 (`#root`)
- React 루트 생성
- StrictMode로 감싸기 (개발 모드 검증)
- App 컴포넌트 렌더링

---

### App.tsx - 루트 컴포넌트

라우터를 제공하는 최상위 컴포넌트입니다.

```typescript
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './App.css';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

**역할:**
- `RouterProvider`로 라우터 제공
- 전역 CSS 로드
- 향후 전역 프로바이더 추가 위치

**확장 예시:**

```typescript
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { queryClient } from '@/shared/query';
import './App.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

---

### router.tsx - 라우트 설정

URL과 페이지 컴포넌트를 매핑합니다.

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { 
  DashboardPage,
  CompetitionTestPage, 
  CompetitionCUDTestPage,
  // ...
} from '@/pages';
import { LOGIN_URL } from '@/shared/config';
import { useEffect } from 'react';

const LoginRedirect = () => {
  useEffect(() => {
    window.location.href = LOGIN_URL;
  }, []);
  return null;
};

export const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/competition', element: <CompetitionTestPage /> },
  { path: '/login', element: <LoginRedirect /> },
  // ...
]);
```

**주요 라우트:**

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | DashboardPage | 대시보드 (홈) |
| `/competition` | CompetitionTestPage | 대회 조회 테스트 |
| `/competition/cud` | CompetitionCUDTestPage | 대회 CUD 테스트 |
| `/event` | CubeEventTestPage | 큐브 종목 테스트 |
| `/round` | RoundTestPage | 라운드 조회 테스트 |
| `/round/cud` | RoundCUDTestPage | 라운드 CUD 테스트 |
| `/record` | RecordTestPage | 기록 조회 테스트 |
| `/record/cud` | RecordCUDTestPage | 기록 CUD 테스트 |
| `/scramble` | ScrambleTestPage | 스크램블 테스트 |
| `/confirm` | ConfirmPage | OAuth 인증 콜백 |
| `/logout` | LogoutPage | 로그아웃 |
| `/login` | LoginRedirect | 로그인 (외부 SSO로 리다이렉트) |

---

## 🔧 라우터 상세

### createBrowserRouter

React Router v6의 **데이터 라우터**를 사용합니다.

**장점:**
- 타입 안전성
- 데이터 로딩 지원 (loader)
- 에러 바운더리 (errorElement)
- 중첩 라우트
- 레이아웃 공유

**기본 구조:**

```typescript
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
]);
```

### LoginRedirect 컴포넌트

외부 SSO 로그인 페이지로 리다이렉트하는 특수 컴포넌트입니다.

```typescript
const LoginRedirect = () => {
  useEffect(() => {
    window.location.href = LOGIN_URL;
  }, []);
  return null;
};
```

**동작:**
1. `/login` 접근
2. `useEffect`로 외부 URL 리다이렉트
3. SSO 로그인 페이지로 이동
4. 로그인 성공 후 `/confirm`으로 돌아옴

**OAuth 흐름:**

```
1. /login → SSO 로그인 페이지
2. SSO 로그인 성공 → /confirm?code=xxx
3. ConfirmPage에서 code로 토큰 발급
4. 토큰 저장 후 / (홈)으로 이동
```

---

## 💡 라우터 확장

### 1. 레이아웃 추가

공통 레이아웃(헤더, 사이드바)을 여러 페이지에서 공유:

```typescript
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div>
      <Header />
      <Sidebar />
      <main>
        <Outlet />  {/* 자식 라우트 렌더링 */}
      </main>
      <Footer />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'competition', element: <CompetitionPage /> },
      { path: 'round', element: <RoundPage /> },
    ],
  },
]);
```

### 2. 중첩 라우트

URL 계층 구조를 라우트에 반영:

```typescript
export const router = createBrowserRouter([
  {
    path: '/competition',
    element: <CompetitionLayout />,
    children: [
      { index: true, element: <CompetitionListPage /> },
      { path: ':id', element: <CompetitionDetailPage /> },
      { path: ':id/edit', element: <CompetitionEditPage /> },
      { path: 'new', element: <CompetitionCreatePage /> },
    ],
  },
]);
```

**URL 매핑:**
- `/competition` → 대회 목록
- `/competition/123` → 대회 상세
- `/competition/123/edit` → 대회 수정
- `/competition/new` → 대회 생성

### 3. 데이터 로더

페이지 렌더링 전에 데이터를 미리 로드:

```typescript
import { getCompetition } from '@/entities/competition';

export const router = createBrowserRouter([
  {
    path: '/competition/:id',
    element: <CompetitionDetailPage />,
    loader: async ({ params }) => {
      const competition = await getCompetition(Number(params.id));
      return { competition };
    },
  },
]);

// 페이지에서 사용
const CompetitionDetailPage = () => {
  const { competition } = useLoaderData();
  
  return <div>{competition.compName}</div>;
};
```

### 4. 에러 바운더리

라우트별 에러 처리:

```typescript
const ErrorPage = () => {
  const error = useRouteError();
  
  return (
    <div>
      <h1>오류가 발생했습니다</h1>
      <p>{error.message}</p>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      // ...
    ],
  },
]);
```

### 5. 인증 가드

보호된 라우트 구현:

```typescript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('access_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
]);
```

---

## 🎨 전역 스타일

### index.css - CSS 리셋

기본 브라우저 스타일을 초기화합니다.

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
}
```

### App.css - 앱 전역 스타일

애플리케이션 전체에 적용되는 스타일입니다.

```css
:root {
  /* 컬러 팔레트 */
  --primary: #0066cc;
  --secondary: #6c757d;
  --success: #28a745;
  --danger: #dc3545;
  --warning: #ffc107;
  
  /* 간격 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 4px;
  font-weight: 500;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-danger {
  background: var(--danger);
  color: white;
}
```

---

## 🚀 앱 실행 흐름

```
1. index.html 로드
   └─ <div id="root"></div>

2. main.tsx 실행
   └─ ReactDOM.createRoot(#root)
   └─ <StrictMode><App /></StrictMode> 렌더링

3. App.tsx 실행
   └─ <RouterProvider router={router} />

4. router.tsx 실행
   └─ 현재 URL 확인
   └─ 매칭되는 라우트의 element 렌더링

5. 페이지 컴포넌트 렌더링
   └─ DashboardPage (/)
   └─ CompetitionTestPage (/competition)
   └─ ...
```

---

## 🔍 개발 팁

### 1. 라우트 네비게이션

```typescript
import { useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  
  const goToCompetition = () => {
    navigate('/competition');
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <>
      <button onClick={goToCompetition}>대회 목록</button>
      <button onClick={goBack}>뒤로</button>
    </>
  );
};
```

### 2. 현재 라우트 정보

```typescript
import { useLocation, useParams } from 'react-router-dom';

const Component = () => {
  const location = useLocation();
  const params = useParams();
  
  console.log(location.pathname);  // '/competition/123'
  console.log(params.id);          // '123'
};
```

### 3. 쿼리 파라미터

```typescript
import { useSearchParams } from 'react-router-dom';

const Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = searchParams.get('page') || '0';
  const size = searchParams.get('size') || '10';
  
  const updatePage = (newPage: number) => {
    setSearchParams({ page: String(newPage), size });
  };
};
```

---

## 📚 관련 문서

- **[Pages Layer](../pages/README.md)** - 페이지 컴포넌트
- **[Shared Config](../shared/README.md)** - 환경 변수
- **[Architecture](../../docs/guides/ARCHITECTURE.md)** - FSD 구조
- **[React Router 공식 문서](https://reactrouter.com/)** - 라우터 API

---

## ✅ 베스트 프랙티스

### 1. 라우트 타입 안전성

```typescript
// routes.ts - 라우트 상수
export const ROUTES = {
  HOME: '/',
  COMPETITION: '/competition',
  COMPETITION_DETAIL: (id: number) => `/competition/${id}`,
} as const;

// 사용
navigate(ROUTES.COMPETITION_DETAIL(123));
```

### 2. 레이지 로딩

```typescript
import { lazy, Suspense } from 'react';

const CompetitionPage = lazy(() => import('@/pages/competition'));

export const router = createBrowserRouter([
  {
    path: '/competition',
    element: (
      <Suspense fallback={<Loading />}>
        <CompetitionPage />
      </Suspense>
    ),
  },
]);
```

### 3. 404 페이지

```typescript
export const router = createBrowserRouter([
  // ... 다른 라우트들
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
```
