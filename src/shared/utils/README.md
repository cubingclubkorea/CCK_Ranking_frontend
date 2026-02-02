# Shared/Utils - 유틸리티 함수

**공통으로 사용되는 헬퍼 함수**

## 📁 구조

```
utils/
├── README.md (이 파일)
└── apiHandler.ts      # API 호출 헬퍼
```

---

## 🎯 역할

- API 호출의 반복적인 패턴 추상화
- 로딩, 에러, 성공 상태 관리 자동화
- 에러 처리 일관성 보장

---

## 📖 함수 상세

### createApiHandler

상태 관리가 필요한 API 호출을 위한 고차 함수입니다.

```typescript
/**
 * API 호출을 위한 공통 핸들러
 * loading, error, result 상태를 자동으로 관리합니다
 */
export const createApiHandler = <T = void>(
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setResult: (result: string | null) => void
) => {
  return async (
    apiFunction: () => Promise<T>,
    successMessage: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await apiFunction();
      setResult(successMessage);
      console.log(successMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error('에러:', err);
    } finally {
      setLoading(false);
    }
  };
};
```

**파라미터:**
- `setLoading`: 로딩 상태를 설정하는 함수
- `setError`: 에러 메시지를 설정하는 함수
- `setResult`: 성공 메시지를 설정하는 함수

**반환값:**
- API 호출을 실행하는 함수
  - `apiFunction`: 실행할 비동기 함수
  - `successMessage`: 성공 시 표시할 메시지

---

## 💡 사용 패턴

### 1. 기본 사용법

```typescript
import { useState } from 'react';
import { createApiHandler } from '@/shared/utils/apiHandler';
import { createCompetition } from '@/features/competition';

export const CompetitionCreateForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  // API 핸들러 생성
  const apiHandler = createApiHandler(setLoading, setError, setResult);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // API 호출 실행
    await apiHandler(
      () => createCompetition(formData),
      '대회가 생성되었습니다!'
    );
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 입력 필드들... */}
      
      <button type="submit" disabled={loading}>
        {loading ? '처리 중...' : '생성'}
      </button>
      
      {/* 에러 표시 */}
      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}
      
      {/* 성공 메시지 */}
      {result && (
        <div className="success-alert">
          {result}
        </div>
      )}
    </form>
  );
};
```

---

### 2. 여러 API 호출에 재사용

```typescript
export const CompetitionManagePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const apiHandler = createApiHandler(setLoading, setError, setResult);
  
  const handleCreate = async () => {
    await apiHandler(
      () => createCompetition(data),
      '대회가 생성되었습니다!'
    );
  };
  
  const handleUpdate = async () => {
    await apiHandler(
      () => updateCompetition(data),
      '대회가 수정되었습니다!'
    );
  };
  
  const handleDelete = async (idx: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    await apiHandler(
      () => deleteCompetition(idx),
      '대회가 삭제되었습니다!'
    );
  };
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}
      {result && <SuccessAlert message={result} />}
      
      <button onClick={handleCreate}>생성</button>
      <button onClick={handleUpdate}>수정</button>
      <button onClick={() => handleDelete(123)}>삭제</button>
    </div>
  );
};
```

---

### 3. 커스텀 훅으로 추상화

```typescript
import { useState } from 'react';
import { createApiHandler } from '@/shared/utils/apiHandler';

export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const apiHandler = createApiHandler(setLoading, setError, setResult);
  
  const resetState = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };
  
  return {
    loading,
    error,
    result,
    apiHandler,
    resetState,
  };
};

// 사용
export const Component = () => {
  const { loading, error, result, apiHandler } = useApiState();
  
  const handleClick = async () => {
    await apiHandler(
      () => createCompetition(data),
      '대회가 생성되었습니다!'
    );
  };
  
  return (
    <div>
      {loading && <div>로딩 중...</div>}
      {error && <div className="error">{error}</div>}
      {result && <div className="success">{result}</div>}
      <button onClick={handleClick}>생성</button>
    </div>
  );
};
```

---

### 4. 성공 후 콜백 실행

```typescript
const handleCreate = async () => {
  await apiHandler(
    async () => {
      await createCompetition(data);
      // 성공 후 목록 새로고침
      await refreshList();
    },
    '대회가 생성되었습니다!'
  );
};
```

---

### 5. 반환값 활용

```typescript
const handleCreate = async () => {
  await apiHandler(
    async () => {
      const newComp = await createCompetition(data);
      // 생성된 대회로 이동
      navigate(`/competition/${newComp.idx}`);
    },
    '대회가 생성되었습니다!'
  );
};
```

---

## 🎨 UI 컴포넌트 예시

### 알림 컴포넌트

```typescript
import type { ReactNode } from 'react';

interface AlertProps {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert = ({ type, message, onClose }: AlertProps) => {
  const colors = {
    error: 'bg-red-100 border-red-500 text-red-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };
  
  return (
    <div className={`border-l-4 p-4 ${colors[type]}`}>
      <div className="flex items-center justify-between">
        <p>{message}</p>
        {onClose && (
          <button onClick={onClose}>&times;</button>
        )}
      </div>
    </div>
  );
};

// 사용
export const Component = () => {
  const { error, result } = useApiState();
  
  return (
    <div>
      {error && <Alert type="error" message={error} />}
      {result && <Alert type="success" message={result} />}
    </div>
  );
};
```

---

### 로딩 스피너

```typescript
export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

// 사용
export const Component = () => {
  const { loading } = useApiState();
  
  return (
    <div>
      {loading && <LoadingSpinner />}
    </div>
  );
};
```

---

### 상태 표시 오버레이

```typescript
interface ApiStateOverlayProps {
  loading: boolean;
  error: string | null;
  result: string | null;
  children: ReactNode;
}

export const ApiStateOverlay = ({
  loading,
  error,
  result,
  children,
}: ApiStateOverlayProps) => {
  return (
    <div className="relative">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
      
      {/* 에러/성공 메시지 */}
      <div className="space-y-2">
        {error && <Alert type="error" message={error} />}
        {result && <Alert type="success" message={result} />}
      </div>
      
      {/* 실제 콘텐츠 */}
      {children}
    </div>
  );
};

// 사용
export const Component = () => {
  const { loading, error, result, apiHandler } = useApiState();
  
  return (
    <ApiStateOverlay loading={loading} error={error} result={result}>
      <form onSubmit={handleSubmit}>
        {/* 폼 내용 */}
      </form>
    </ApiStateOverlay>
  );
};
```

---

## 🔧 고급 패턴

### 1. 타입 안전한 핸들러

```typescript
export const useTypedApiHandler = <T>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  
  const execute = async (
    apiFunction: () => Promise<T>,
    successMessage?: string
  ): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await apiFunction();
      setResult(data);
      
      if (successMessage) {
        console.log(successMessage);
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(message);
      return undefined;
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, error, result, execute };
};

// 사용
const { result, execute } = useTypedApiHandler<Competition>();

const comp = await execute(
  () => createCompetition(data),
  '대회가 생성되었습니다!'
);

if (comp) {
  navigate(`/competition/${comp.idx}`);
}
```

---

### 2. 자동 알림 제거

```typescript
export const useApiStateWithTimeout = (timeout = 3000) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const apiHandler = createApiHandler(
    setLoading,
    (error) => {
      setError(error);
      if (error) {
        setTimeout(() => setError(null), timeout);
      }
    },
    (result) => {
      setResult(result);
      if (result) {
        setTimeout(() => setResult(null), timeout);
      }
    }
  );
  
  return { loading, error, result, apiHandler };
};

// 3초 후 자동으로 알림 사라짐
```

---

### 3. 전역 에러 핸들러

```typescript
import { createContext, useContext, useState } from 'react';
import { createApiHandler } from '@/shared/utils/apiHandler';

interface ApiStateContextType {
  loading: boolean;
  error: string | null;
  result: string | null;
  apiHandler: ReturnType<typeof createApiHandler>;
}

const ApiStateContext = createContext<ApiStateContextType | null>(null);

export const ApiStateProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const apiHandler = createApiHandler(setLoading, setError, setResult);
  
  return (
    <ApiStateContext.Provider value={{ loading, error, result, apiHandler }}>
      {/* 전역 알림 */}
      {error && <GlobalErrorAlert message={error} />}
      {result && <GlobalSuccessAlert message={result} />}
      {loading && <GlobalLoadingOverlay />}
      
      {children}
    </ApiStateContext.Provider>
  );
};

export const useGlobalApiHandler = () => {
  const context = useContext(ApiStateContext);
  if (!context) {
    throw new Error('ApiStateProvider 내부에서 사용해야 합니다');
  }
  return context.apiHandler;
};

// 사용
const Component = () => {
  const apiHandler = useGlobalApiHandler();
  
  const handleClick = async () => {
    await apiHandler(
      () => createCompetition(data),
      '대회가 생성되었습니다!'
    );
  };
};
```

---

## 🎯 베스트 프랙티스

### 1. 에러 메시지 사용자 친화적으로

```typescript
// ✅ 좋음 - 구체적인 메시지
await apiHandler(
  () => createCompetition(data),
  '대회 "2026 CCK 춘계대회"가 생성되었습니다!'
);

// ❌ 나쁨 - 모호한 메시지
await apiHandler(
  () => createCompetition(data),
  '성공'
);
```

---

### 2. 로딩 중 중복 클릭 방지

```typescript
<button onClick={handleClick} disabled={loading}>
  {loading ? '처리 중...' : '생성'}
</button>
```

---

### 3. 성공 후 상태 초기화

```typescript
const handleCreate = async () => {
  await apiHandler(
    async () => {
      await createCompetition(data);
      // 폼 초기화
      resetForm();
    },
    '대회가 생성되었습니다!'
  );
};
```

---

### 4. 조건부 성공 메시지

```typescript
const handleSave = async (isDraft: boolean) => {
  await apiHandler(
    () => saveCompetition(data, isDraft),
    isDraft ? '임시 저장되었습니다' : '대회가 생성되었습니다!'
  );
};
```

---

## 📚 관련 문서

- **[Shared Layer](../README.md)** - Shared 레이어 개요
- **[API](../api/README.md)** - ApiClient 에러 처리
- **[Features](../../features/README.md)** - CUD API 사용
