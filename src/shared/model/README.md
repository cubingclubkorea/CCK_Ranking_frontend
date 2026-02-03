# Shared/Model - 공통 타입

**프로젝트 전반에서 사용되는 공통 타입 정의**

## 📁 구조

```
model/
├── README.md (이 파일)
├── error.ts          # 에러 타입
├── page.ts           # 페이지 응답 타입
└── pagination.ts     # 페이지네이션 정보 타입
```

---

## 🎯 역할

- API 응답의 공통 구조 정의
- 에러 처리를 위한 타입
- 페이지네이션 타입
- **도메인 독립적인 범용 타입**

---

## 📖 타입 상세

### ErrorResponse (error.ts)

백엔드에서 반환하는 에러 응답 구조입니다.

```typescript
/**
 * 백엔드 에러 응답 타입
 */
export interface ErrorResponse {
  status: number;        // HTTP 상태 코드
  name: string;          // 에러 이름 (예: CompetitionNotFoundException)
  code: string;          // 에러 코드 (예: COMP_001)
  message: string;       // 사용자 메시지
  detailMessage: string; // 상세 메시지
}
```

**사용 예시:**

```typescript
import type { ErrorResponse } from '@/shared/model/error';

try {
  await apiClient.get('/comp/999');
} catch (error) {
  if (error instanceof Error) {
    // ApiClient가 ErrorResponse를 파싱하여 메시지를 만듦
    console.error(error.message);
    // "대회를 찾을 수 없습니다: idx: 999는 존재하지 않는 대회입니다 [COMP_001]"
  }
}
```

**백엔드 응답 예시:**

```json
{
  "status": 404,
  "name": "CompetitionNotFoundException",
  "code": "COMP_001",
  "message": "대회를 찾을 수 없습니다",
  "detailMessage": "idx: 999는 존재하지 않는 대회입니다"
}
```

**ApiClient 파싱 로직:**

```typescript
if (errorData?.message) {
  let customMessage = errorData.message;
  if (errorData.detailMessage) {
    customMessage += `: ${errorData.detailMessage}`;
  }
  customMessage += ` [${errorData.code}]`;
  throw new Error(customMessage);
}
```

---

### Pagination (pagination.ts)

Spring의 Page 응답 중 페이지 정보 부분입니다.

```typescript
export interface Pagination {
  size: number;          // 페이지 크기 (예: 10)
  number: number;        // 현재 페이지 번호 (0부터 시작)
  totalElements: number; // 전체 데이터 개수
  totalPages: number;    // 전체 페이지 수
}
```

**Spring Pageable 응답과 매핑:**

```
Spring Pageable         →  Pagination
──────────────────────────────────────
pageable.pageSize       →  size
pageable.pageNumber     →  number
page.totalElements      →  totalElements
page.totalPages         →  totalPages
```

**사용 예시:**

```typescript
import type { Pagination } from '@/shared/model/pagination';

const renderPagination = (pagination: Pagination) => {
  return (
    <div>
      <p>
        {pagination.number + 1} / {pagination.totalPages} 페이지
      </p>
      <p>
        전체 {pagination.totalElements}개
      </p>
      <p>
        페이지당 {pagination.size}개씩 표시
      </p>
    </div>
  );
};
```

**계산 예시:**

```typescript
const pagination: Pagination = {
  size: 10,
  number: 0,
  totalElements: 47,
  totalPages: 5,
};

// 현재 페이지 (사용자 표시용, 1부터 시작)
const currentPage = pagination.number + 1;  // 1

// 마지막 페이지인지 확인
const isLastPage = pagination.number === pagination.totalPages - 1;  // false

// 현재 페이지의 시작/끝 번호
const startIndex = pagination.number * pagination.size;        // 0
const endIndex = Math.min(startIndex + pagination.size, 
                          pagination.totalElements);           // 10

// 다음 페이지 존재 여부
const hasNext = pagination.number < pagination.totalPages - 1;  // true
```

---

### Page (page.ts)

Spring Page 응답의 전체 구조입니다.

```typescript
import type { Pagination } from "./pagination";

export interface Page<T> {
  content: T[];         // 데이터 배열
  page: Pagination;     // 페이지 정보
}
```

**제네릭 타입 `T`:**
- 페이지네이션되는 데이터의 타입
- DTO 또는 도메인 모델

**사용 예시:**

```typescript
import type { Page } from '@/shared/model/page';
import type { CompetitionDTO } from '@/entities/competition/api/dto';

const response = await apiClient.get<Page<CompetitionDTO>>(
  '/comp',
  { page: 0, size: 10 }
);

// content: CompetitionDTO[]
console.log(response.content.length);  // 10

// page: Pagination
console.log(response.page.totalElements);  // 47
```

**백엔드 응답 예시:**

```json
{
  "content": [
    {
      "idx": 1,
      "compName": "2026 CCK 춘계대회",
      "compDateStart": "2026-03-01",
      "compDateEnd": "2026-03-02"
    },
    // ... 9개 더
  ],
  "page": {
    "size": 10,
    "number": 0,
    "totalElements": 47,
    "totalPages": 5
  }
}
```

---

## 💡 사용 패턴

### 1. Entity API에서 페이지 응답 처리

```typescript
import { apiClient } from '@/shared/api/base';
import type { Page } from '@/shared/model/page';
import type { CompetitionDTO } from './dto/competition.dto';
import { CompetitionMapper } from './mapper/competitionMapper';
import type { Competition } from '../model/competition';
import type { PageQuery } from '@/shared/query/pageQuery';
import { mapPageableToParams } from '@/shared/query/pageQueryMapper';

export const getCompetitions = async (
  pageQuery: PageQuery
): Promise<Page<Competition>> => {
  const response = await apiClient.get<Page<CompetitionDTO>>(
    '/comp',
    mapPageableToParams(pageQuery)
  );
  
  // content를 도메인 모델로 변환
  return {
    content: response.content.map(CompetitionMapper),
    page: response.page,
  };
};
```

---

### 2. 페이지네이션 컴포넌트

```typescript
import type { Pagination } from '@/shared/model/pagination';

interface PaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export const PaginationComponent = ({ 
  pagination, 
  onPageChange 
}: PaginationProps) => {
  const currentPage = pagination.number + 1;
  const { totalPages } = pagination;
  
  return (
    <div className="pagination">
      <button
        disabled={pagination.number === 0}
        onClick={() => onPageChange(pagination.number - 1)}
      >
        이전
      </button>
      
      <span>{currentPage} / {totalPages}</span>
      
      <button
        disabled={pagination.number === totalPages - 1}
        onClick={() => onPageChange(pagination.number + 1)}
      >
        다음
      </button>
      
      <p className="total">
        전체 {pagination.totalElements}개
      </p>
    </div>
  );
};
```

---

### 3. 에러 처리

```typescript
import type { ErrorResponse } from '@/shared/model/error';

// ApiClient 인터셉터에서 사용
this.axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorData: ErrorResponse | undefined = error.response.data;
      
      if (errorData?.code) {
        // ErrorResponse 타입의 데이터 처리
        const message = `${errorData.message}: ${errorData.detailMessage} [${errorData.code}]`;
        throw new Error(message);
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 4. 페이지 정보 표시

```typescript
import type { Page } from '@/shared/model/page';
import type { Competition } from '@/entities/competition';

const CompetitionList = ({ data }: { data: Page<Competition> }) => {
  const { content, page } = data;
  const startIndex = page.number * page.size + 1;
  const endIndex = Math.min(startIndex + content.length - 1, page.totalElements);
  
  return (
    <div>
      <div className="info">
        전체 {page.totalElements}개 중 {startIndex}~{endIndex}번째
      </div>
      
      <ul>
        {content.map((comp) => (
          <li key={comp.idx}>{comp.compName}</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🎯 베스트 프랙티스

### 1. DTO와 Model 분리

```typescript
// ✅ 좋음 - DTO에서 Model로 변환
const response = await apiClient.get<Page<CompetitionDTO>>('/comp');
return {
  content: response.content.map(CompetitionMapper),
  page: response.page,
};

// ❌ 나쁨 - DTO를 직접 사용
const response = await apiClient.get<Page<Competition>>('/comp');
return response;  // DTO와 Model이 혼재
```

---

### 2. 페이지 번호 주의

```typescript
// ✅ 좋음 - 0-based → 1-based 변환
const displayPage = pagination.number + 1;

// ❌ 나쁨 - 0부터 표시
const displayPage = pagination.number;  // 0, 1, 2, ... (사용자 혼란)
```

---

### 3. 타입 가드

```typescript
// ErrorResponse 타입 가드
function isErrorResponse(data: any): data is ErrorResponse {
  return (
    typeof data === 'object' &&
    'status' in data &&
    'code' in data &&
    'message' in data
  );
}

// 사용
if (isErrorResponse(error.response?.data)) {
  console.error(error.response.data.code);
}
```

---

### 4. 페이지네이션 유틸리티

```typescript
// shared/utils/pagination.ts
import type { Pagination } from '@/shared/model/pagination';

export const getPaginationInfo = (pagination: Pagination) => {
  const currentPage = pagination.number + 1;
  const startIndex = pagination.number * pagination.size + 1;
  const endIndex = Math.min(
    startIndex + pagination.size - 1,
    pagination.totalElements
  );
  
  return {
    currentPage,
    totalPages: pagination.totalPages,
    startIndex,
    endIndex,
    totalElements: pagination.totalElements,
    hasNext: pagination.number < pagination.totalPages - 1,
    hasPrevious: pagination.number > 0,
  };
};

// 사용
const info = getPaginationInfo(pagination);
console.log(`${info.startIndex}~${info.endIndex} / ${info.totalElements}`);
```

---

## 📚 관련 문서

- **[Shared Layer](../README.md)** - Shared 레이어 개요
- **[Query](../query/README.md)** - PageQuery, Sort
- **[API](../api/README.md)** - ApiClient 에러 처리
- **[Entities](../../entities/README.md)** - 페이지네이션 API
