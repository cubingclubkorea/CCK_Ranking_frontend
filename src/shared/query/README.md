# Shared/Query - 페이지네이션 쿼리

**페이지네이션 요청을 위한 타입과 변환 함수**

## 📁 구조

```
query/
├── README.md (이 파일)
├── pageQuery.ts          # 페이지 쿼리 타입
├── pageQueryMapper.ts    # 쿼리 파라미터 변환
└── sort.ts               # 정렬 타입
```

---

## 🎯 역할

- 페이지네이션 요청 파라미터 정의
- Spring Pageable 형식으로 변환
- 정렬 조건 타입 제공

---

## 📖 타입 상세

### Sort (sort.ts)

정렬 조건을 나타내는 타입입니다.

```typescript
export type SortDirection = 'asc' | 'desc';

export interface Sort {
  field: string;          // 정렬 필드명
  direction: SortDirection; // 정렬 방향
}
```

**사용 예시:**

```typescript
import type { Sort } from '@/shared/query/sort';

// 단일 정렬
const sort: Sort = {
  field: 'compName',
  direction: 'asc',
};

// 다중 정렬
const sorts: Sort[] = [
  { field: 'compDateStart', direction: 'desc' },  // 1차: 최신순
  { field: 'compName', direction: 'asc' },        // 2차: 이름순
];
```

**Spring 형식으로 변환:**

```typescript
// { field: 'compName', direction: 'asc' }
// → "compName,asc"
```

---

### PageQuery (pageQuery.ts)

페이지네이션 요청 파라미터입니다.

```typescript
import type { Sort } from "./sort";

export interface PageQuery {
  page?: number;    // 페이지 번호 (0부터 시작, 기본값: 0)
  size?: number;    // 페이지 크기 (기본값: 10)
  sort?: Sort[];    // 정렬 조건 (선택)
}
```

**필드 설명:**
- `page`: 요청할 페이지 번호 (0-based)
- `size`: 한 페이지에 표시할 항목 수
- `sort`: 정렬 조건 배열 (여러 조건 가능)

**사용 예시:**

```typescript
import type { PageQuery } from '@/shared/query/pageQuery';

// 첫 페이지, 10개씩
const query1: PageQuery = {
  page: 0,
  size: 10,
};

// 2페이지, 20개씩, 이름순 정렬
const query2: PageQuery = {
  page: 1,
  size: 20,
  sort: [{ field: 'compName', direction: 'asc' }],
};

// 다중 정렬
const query3: PageQuery = {
  page: 0,
  size: 10,
  sort: [
    { field: 'compDateStart', direction: 'desc' },
    { field: 'compName', direction: 'asc' },
  ],
};
```

---

## 🔧 Mapper 함수

### mapPageableToParams (pageQueryMapper.ts)

`PageQuery`를 Spring Pageable 형식의 쿼리 파라미터로 변환합니다.

```typescript
import type { PageQuery } from './pageQuery';

export const mapPageableToParams = (pageable?: PageQuery) => {
  if (!pageable) return {};

  const params: Record<string, any> = {};

  if (pageable.page !== undefined) params.page = pageable.page;
  if (pageable.size !== undefined) params.size = pageable.size;

  if (pageable.sort?.length) {
    params.sort = pageable.sort.map(s => `${s.field},${s.direction}`);
  }

  return params;
};
```

**변환 예시:**

```typescript
// 입력
const pageQuery: PageQuery = {
  page: 0,
  size: 10,
  sort: [
    { field: 'compName', direction: 'asc' },
    { field: 'createdAt', direction: 'desc' }
  ],
};

// 출력
const params = mapPageableToParams(pageQuery);
// {
//   page: 0,
//   size: 10,
//   sort: ['compName,asc', 'createdAt,desc']
// }
```

**URL 쿼리 스트링:**

```
GET /comp?page=0&size=10&sort=compName,asc&sort=createdAt,desc
```

---

## 💡 사용 패턴

### 1. Entity API에서 페이지네이션 조회

```typescript
import { apiClient } from '@/shared/api/base';
import type { Page } from '@/shared/model/page';
import type { PageQuery } from '@/shared/query/pageQuery';
import { mapPageableToParams } from '@/shared/query/pageQueryMapper';
import type { CompetitionDTO } from './dto/competition.dto';
import { CompetitionMapper } from './mapper/competitionMapper';
import type { Competition } from '../model/competition';

export const getCompetitions = async (
  pageQuery: PageQuery
): Promise<Page<Competition>> => {
  // PageQuery → 쿼리 파라미터 변환
  const params = mapPageableToParams(pageQuery);
  
  // API 호출
  const response = await apiClient.get<Page<CompetitionDTO>>(
    '/comp',
    params
  );
  
  // DTO → Model 변환
  return {
    content: response.content.map(CompetitionMapper),
    page: response.page,
  };
};

// 사용
const result = await getCompetitions({
  page: 0,
  size: 10,
  sort: [{ field: 'compName', direction: 'asc' }],
});
```

---

### 2. 컴포넌트에서 페이지네이션

```typescript
import { useState, useEffect } from 'react';
import { getCompetitions } from '@/entities/competition';
import type { PageQuery } from '@/shared/query/pageQuery';
import type { Page } from '@/shared/model/page';
import type { Competition } from '@/entities/competition';

export const CompetitionListPage = () => {
  const [data, setData] = useState<Page<Competition> | null>(null);
  const [pageQuery, setPageQuery] = useState<PageQuery>({
    page: 0,
    size: 10,
    sort: [{ field: 'compDateStart', direction: 'desc' }],
  });
  
  useEffect(() => {
    const fetchData = async () => {
      const result = await getCompetitions(pageQuery);
      setData(result);
    };
    fetchData();
  }, [pageQuery]);
  
  const handlePageChange = (newPage: number) => {
    setPageQuery({ ...pageQuery, page: newPage });
  };
  
  const handleSizeChange = (newSize: number) => {
    setPageQuery({ ...pageQuery, page: 0, size: newSize });
  };
  
  const handleSortChange = (field: string) => {
    setPageQuery({
      ...pageQuery,
      page: 0,
      sort: [{ field, direction: 'asc' }],
    });
  };
  
  if (!data) return <div>로딩 중...</div>;
  
  return (
    <div>
      {/* 페이지 크기 선택 */}
      <select 
        value={pageQuery.size} 
        onChange={(e) => handleSizeChange(Number(e.target.value))}
      >
        <option value={10}>10개씩</option>
        <option value={20}>20개씩</option>
        <option value={50}>50개씩</option>
      </select>
      
      {/* 정렬 선택 */}
      <select onChange={(e) => handleSortChange(e.target.value)}>
        <option value="compName">이름순</option>
        <option value="compDateStart">날짜순</option>
        <option value="createdAt">생성일순</option>
      </select>
      
      {/* 데이터 목록 */}
      <ul>
        {data.content.map((comp) => (
          <li key={comp.idx}>{comp.compName}</li>
        ))}
      </ul>
      
      {/* 페이지네이션 */}
      <Pagination 
        pagination={data.page} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
};
```

---

### 3. URL 쿼리 파라미터와 동기화

```typescript
import { useSearchParams } from 'react-router-dom';
import type { PageQuery } from '@/shared/query/pageQuery';

export const usePageQuery = (): [PageQuery, (query: PageQuery) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL → PageQuery
  const pageQuery: PageQuery = {
    page: Number(searchParams.get('page') || 0),
    size: Number(searchParams.get('size') || 10),
    sort: searchParams.getAll('sort').map(s => {
      const [field, direction] = s.split(',');
      return { field, direction: direction as 'asc' | 'desc' };
    }),
  };
  
  // PageQuery → URL
  const setPageQuery = (query: PageQuery) => {
    const params = new URLSearchParams();
    params.set('page', String(query.page || 0));
    params.set('size', String(query.size || 10));
    query.sort?.forEach(s => {
      params.append('sort', `${s.field},${s.direction}`);
    });
    setSearchParams(params);
  };
  
  return [pageQuery, setPageQuery];
};

// 사용
const Component = () => {
  const [pageQuery, setPageQuery] = usePageQuery();
  
  // URL: /competitions?page=1&size=20&sort=compName,asc
  
  const handleNextPage = () => {
    setPageQuery({ ...pageQuery, page: (pageQuery.page || 0) + 1 });
  };
};
```

---

### 4. 정렬 토글

```typescript
import type { PageQuery } from '@/shared/query/pageQuery';
import type { SortDirection } from '@/shared/query/sort';

export const toggleSort = (
  currentQuery: PageQuery,
  field: string
): PageQuery => {
  const currentSort = currentQuery.sort?.find(s => s.field === field);
  
  let newDirection: SortDirection;
  if (!currentSort) {
    newDirection = 'asc';
  } else {
    newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
  }
  
  return {
    ...currentQuery,
    page: 0,  // 정렬 변경 시 첫 페이지로
    sort: [{ field, direction: newDirection }],
  };
};

// 사용
const handleHeaderClick = (field: string) => {
  const newQuery = toggleSort(pageQuery, field);
  setPageQuery(newQuery);
};

// 테이블 헤더
<th onClick={() => handleHeaderClick('compName')}>
  대회명 
  {getSortIcon('compName', pageQuery)}
</th>
```

---

### 5. 기본 페이지 쿼리

```typescript
import type { PageQuery } from '@/shared/query/pageQuery';

// 기본 쿼리 상수
export const DEFAULT_PAGE_QUERY: PageQuery = {
  page: 0,
  size: 10,
  sort: [],
};

// 기본 쿼리 생성 함수
export const createPageQuery = (
  overrides?: Partial<PageQuery>
): PageQuery => {
  return {
    ...DEFAULT_PAGE_QUERY,
    ...overrides,
  };
};

// 사용
const query1 = createPageQuery();  
// { page: 0, size: 10, sort: [] }

const query2 = createPageQuery({ 
  size: 20,
  sort: [{ field: 'compName', direction: 'asc' }] 
});
// { page: 0, size: 20, sort: [...] }
```

---

## 🎯 베스트 프랙티스

### 1. 항상 Mapper 사용

```typescript
// ✅ 좋음 - Mapper 사용
const params = mapPageableToParams(pageQuery);
await apiClient.get('/comp', params);

// ❌ 나쁨 - 수동 변환
await apiClient.get('/comp', {
  page: pageQuery.page,
  size: pageQuery.size,
  sort: pageQuery.sort?.map(s => `${s.field},${s.direction}`),
});
```

---

### 2. 정렬 변경 시 첫 페이지로

```typescript
// ✅ 좋음 - 정렬 변경 시 page: 0
setPageQuery({
  ...pageQuery,
  page: 0,
  sort: newSort,
});

// ❌ 나쁨 - 현재 페이지 유지 (데이터가 없을 수 있음)
setPageQuery({
  ...pageQuery,
  sort: newSort,
});
```

---

### 3. undefined vs null

```typescript
// ✅ 좋음 - undefined 사용 (선택적 필드)
const query: PageQuery = {
  page: 0,
  size: 10,
  sort: undefined,  // 또는 생략
};

// ❌ 나쁨 - null 사용
const query: PageQuery = {
  page: 0,
  size: 10,
  sort: null,  // 타입 에러
};
```

---

### 4. 타입 안전한 정렬 필드

```typescript
// 엔티티별 정렬 가능 필드 정의
type CompetitionSortField = 
  | 'idx'
  | 'compName'
  | 'compDateStart'
  | 'compDateEnd'
  | 'createdAt';

interface CompetitionSort {
  field: CompetitionSortField;
  direction: SortDirection;
}

interface CompetitionPageQuery {
  page?: number;
  size?: number;
  sort?: CompetitionSort[];
}

// 사용
const query: CompetitionPageQuery = {
  page: 0,
  size: 10,
  sort: [
    { field: 'compName', direction: 'asc' },  // ✅ OK
    // { field: 'invalid', direction: 'asc' },  // ❌ 타입 에러
  ],
};
```

---

### 5. 페이지네이션 유틸리티

```typescript
// shared/query/utils.ts
import type { PageQuery } from './pageQuery';

export const nextPage = (query: PageQuery): PageQuery => ({
  ...query,
  page: (query.page || 0) + 1,
});

export const previousPage = (query: PageQuery): PageQuery => ({
  ...query,
  page: Math.max((query.page || 0) - 1, 0),
});

export const firstPage = (query: PageQuery): PageQuery => ({
  ...query,
  page: 0,
});

export const setSize = (query: PageQuery, size: number): PageQuery => ({
  ...query,
  page: 0,  // 크기 변경 시 첫 페이지로
  size,
});

// 사용
const query = { page: 5, size: 10 };
const next = nextPage(query);      // { page: 6, size: 10 }
const prev = previousPage(query);  // { page: 4, size: 10 }
const first = firstPage(query);    // { page: 0, size: 10 }
const bigger = setSize(query, 20); // { page: 0, size: 20 }
```

---

## 📚 관련 문서

- **[Shared Layer](../README.md)** - Shared 레이어 개요
- **[Model](../model/README.md)** - Page, Pagination 타입
- **[API](../api/README.md)** - ApiClient 사용법
- **[Entities](../../entities/README.md)** - 페이지네이션 API
