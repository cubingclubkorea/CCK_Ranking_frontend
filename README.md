# CCK Ranking Frontend

큐브 대회 관리 및 순위 시스템 프론트엔드

## 🚀 빠른 시작

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

### 환경 변수

`.env.development` 파일:

```bash
VITE_API_URL=http://localhost:8080/api
VITE_SSO_URL=http://localhost:8081
VITE_LOGIN_URL=http://localhost:8081/login
```

---

## 📚 문서 구조

이 프로젝트는 **각 레이어와 기능별로 문서가 분산**되어 있습니다. 코드와 가까운 곳에서 필요한 문서를 바로 찾을 수 있습니다.

### 핵심 가이드

- **[컨벤션 가이드](./docs/guides/CONVENTION.md)** - 코드 작성 규칙, 네이밍, 스타일
- **[아키텍처 가이드](./docs/guides/ARCHITECTURE.md)** - FSD 구조, 의존성 규칙

### 레이어별 문서

| 레이어 | 문서 위치 | 설명 |
|--------|----------|------|
| **App** | [src/app/README.md](./src/app/README.md) | 앱 초기화, 라우터 설정 |
| **Shared** | [src/shared/README.md](./src/shared/README.md) | API 클라이언트, 유틸리티, 공통 타입 |
| **Entities** | [src/entities/README.md](./src/entities/README.md) | 도메인 모델, Read API |
| **Features** | [src/features/README.md](./src/features/README.md) | 비즈니스 로직, CUD API |
| **Pages** | [src/pages/README.md](./src/pages/README.md) | 페이지 컴포넌트 |
| **Widgets** | [src/widgets/README.md](./src/widgets/README.md) | 재사용 UI 컴포넌트 |

### 개별 기능 문서

각 엔티티와 피처는 자신의 README를 가지고 있습니다:

**Entities (Read)**
- [Competition](./src/entities/competition/README.md) - 대회 조회
- [Round](./src/entities/round/README.md) - 라운드 조회
- [Record](./src/entities/record/README.md) - 기록 조회
- [CubeEvent](./src/entities/cubeEvent/README.md) - 큐브 종목 조회
- [Scramble](./src/entities/scramble/README.md) - 스크램블 조회

**Features (CUD)**
- [Auth](./src/features/auth/README.md) - 인증
- [Competition](./src/features/competition/README.md) - 대회 관리
- [Round](./src/features/round/README.md) - 라운드 관리
- [Record](./src/features/record/README.md) - 기록 관리
- [CubeEvent](./src/features/cubeEvent/README.md) - 큐브 종목 생성
- [Scramble](./src/features/scramble/README.md) - 스크램블 발급

---

## 🏗️ 프로젝트 구조

```
src/
├── app/              → 앱 초기화, 라우터
├── pages/            → 페이지 컴포넌트
├── widgets/          → 재사용 UI
├── features/         → 비즈니스 로직 (CUD)
│   ├── auth/         → 인증 [📖](./src/features/auth/README.md)
│   ├── competition/  → 대회 관리 [📖](./src/features/competition/README.md)
│   ├── round/        → 라운드 관리 [📖](./src/features/round/README.md)
│   ├── record/       → 기록 관리 [📖](./src/features/record/README.md)
│   ├── cubeEvent/    → 큐브 종목 생성 [📖](./src/features/cubeEvent/README.md)
│   └── scramble/     → 스크램블 발급 [📖](./src/features/scramble/README.md)
├── entities/         → 도메인 모델 (Read)
│   ├── competition/  → 대회 [📖](./src/entities/competition/README.md)
│   ├── round/        → 라운드 [📖](./src/entities/round/README.md)
│   ├── record/       → 기록 [📖](./src/entities/record/README.md)
│   ├── cubeEvent/    → 큐브 종목 [📖](./src/entities/cubeEvent/README.md)
│   └── scramble/     → 스크램블 [📖](./src/entities/scramble/README.md)
└── shared/           → 공통 기능 [📖](./src/shared/README.md)
    ├── api/          → API 클라이언트
    ├── config/       → 환경 설정
    ├── model/        → 공통 타입
    └── utils/        → 유틸리티
```

---

## 📖 문서 탐색 가이드

### 처음 시작하는 경우

1. [컨벤션 가이드](./docs/guides/CONVENTION.md) - 코드 작성 규칙
2. [아키텍처 가이드](./docs/guides/ARCHITECTURE.md) - FSD 구조 이해
3. [Shared Layer](./src/shared/README.md) - API 통신 방법

### API 연동이 필요한 경우

1. **[Shared API 가이드](./src/shared/README.md)** - ApiClient 사용법 ⭐
2. **[Entity 가이드](./src/entities/README.md)** - Read API 작성
3. **[Feature 가이드](./src/features/README.md)** - CUD API 작성

### 특정 기능 개발

해당 엔티티나 피처의 README를 직접 참고:
- `src/entities/{entity}/README.md`
- `src/features/{feature}/README.md`

---

## 📦 기술 스택

- **React 19.2** + **TypeScript 5.9**
- **Vite 7.2** - 빌드 도구
- **React Router 7.13** - 라우팅
- **Axios 1.13** - HTTP 클라이언트
- **ESLint 9.39** - 코드 품질

---

## 🔑 주요 기능

- 대회 관리 (생성, 수정, 삭제, 조회)
- 라운드 관리 및 배치 생성
- 기록 관리 및 플레이어 진출
- OAuth 2.0 SSO 인증
- JWT 토큰 자동 갱신

---

## 🛠️ 개발 가이드

### 새 기능 개발

1. **Entity 추가**: [entities/README.md](./src/entities/README.md) 참고
2. **Feature 추가**: [features/README.md](./src/features/README.md) 참고
3. **페이지 추가**: [pages/README.md](./src/pages/README.md) 참고

### 코드 작성 전 체크

- [ ] [컨벤션 가이드](./docs/guides/CONVENTION.md) 확인
- [ ] [아키텍처 가이드](./docs/guides/ARCHITECTURE.md) 확인
- [ ] 해당 레이어의 README 확인
- [ ] TypeScript 타입 명시 (any 금지)

---

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 작업, 패키지 설정
```

---

## 📄 라이선스

MIT License

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 빌드

```bash
npm run build
```

---

## 📦 기술 스택

### Core

- **React 19.2** - UI 라이브러리
- **TypeScript 5.9** - 타입 안정성
- **Vite 7.2** - 빌드 도구

### 라우팅

- **React Router DOM 7.13** - 클라이언트 사이드 라우팅

### HTTP 통신

- **Axios 1.13** - HTTP 클라이언트
- 커스텀 `ApiClient` / `SSOClient` 래퍼

### 코드 품질

- **ESLint 9.39** - 린팅
- **TypeScript ESLint** - TypeScript 린팅

---

## 🔑 주요 기능

### 1. 대회 관리 (Competition)
- 대회 생성, 수정, 삭제
- 진행 상태별 조회 (종료/진행중/예정)
- 참가비 및 종목별 수수료 관리

### 2. 라운드 관리 (Round)
- 라운드 생성, 수정, 삭제
- 배치 생성 지원
- 진행 상태별 조회

### 3. 기록 관리 (Record)
- 플레이어 추가 (배치)
- 기록 업데이트
- 다음 라운드 진출
- 추가 시도 관리
- 기록 포기 처리

### 4. 인증 (Authentication)
- OAuth 2.0 SSO 인증
- JWT 토큰 관리
- 자동 토큰 갱신
- CSRF 보호

---

## 🔐 인증 플로우

```
1. 사용자가 로그인 버튼 클릭
   ↓
2. SSO 서버로 리다이렉트
   ↓
3. SSO 로그인 완료
   ↓
4. /auth/confirm으로 리다이렉트 (code 파라미터)
   ↓
5. code로 access_token 발급
   ↓
6. localStorage에 토큰 저장
   ↓
7. axios interceptor가 자동으로 Authorization 헤더 추가
   ↓
8. 401 에러 시 자동 토큰 갱신
```

---

## 🌐 API 구조

### Shared Layer

**ApiClient** (메인 API)
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

**SSOClient** (인증 API)
```typescript
import { ssoClient } from '@/shared/api/auth_base';

const data = await ssoClient.get<TokenResponse>('/auth/token');
```

### Entity Layer (Read)

```typescript
import { getCompetition, getCompetitions } from '@/entities/competition';

// 단일 조회
const competition = await getCompetition(123);

// 목록 조회 (페이지네이션)
const competitions = await getCompetitions({
  page: 0,
  size: 10,
  sort: [{ property: 'compName', direction: 'asc' }],
});
```

### Feature Layer (CUD)

```typescript
import { 
  createCompetition, 
  updateCompetition, 
  deleteCompetition 
} from '@/features/competition';

// 생성
await createCompetition({
  compName: '2026 CCK Championship',
  compDateStart: '2026-05-01',
  // ...
});

// 수정
await updateCompetition({
  idx: 123,
  compName: 'Updated Name',
  // ...
});

// 삭제
await deleteCompetition(123);
```

---

## 🛠️ 개발 가이드

### 새로운 Entity 추가

1. `src/entities/{entity}` 폴더 생성
2. `model/` 폴더에 도메인 모델 정의
3. `api/dto/` 폴더에 DTO 타입 정의
4. `api/mapper/` 폴더에 Mapper 함수 작성
5. `api/get{Entity}.ts`에 조회 함수 작성
6. `index.ts`에 배럴 export 추가

자세한 내용은 [Entity API 가이드](./docs/API_GUIDE_ENTITY.md) 참조

### 새로운 Feature 추가

1. `src/features/{feature}` 폴더 생성
2. 작업 유형별 폴더 생성 (`create/`, `update/`, `delete/` 등)
3. `api/dto/` 폴더에 DTO 타입 정의
4. API 함수 작성
5. `index.ts`에 배럴 export 추가

자세한 내용은 [Feature API 가이드](./docs/API_GUIDE_FEATURE.md) 참조

### 컴포넌트 작성

```typescript
// 프레젠테이셔널 컴포넌트
interface CompetitionCardProps {
  competition: Competition;
  onSelect: (idx: number) => void;
}

const CompetitionCard = ({ competition, onSelect }: CompetitionCardProps) => {
  return (
    <div onClick={() => onSelect(competition.idx)}>
      <h3>{competition.compName}</h3>
      <p>{competition.location}</p>
    </div>
  );
};

// 컨테이너 컴포넌트
const CompetitionPage = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadCompetitions();
  }, []);
  
  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const data = await getCompetitions();
      setCompetitions(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 에러');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>로딩중...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      {competitions.map(comp => (
        <CompetitionCard 
          key={comp.idx} 
          competition={comp}
          onSelect={(idx) => console.log(idx)}
        />
      ))}
    </div>
  );
};
```

---

## 📋 체크리스트

### 새 기능 개발 시

- [ ] [컨벤션 가이드](./docs/CONVENTION.md) 준수
- [ ] [디자인 가이드](./docs/DESIGN.md)의 아키텍처 패턴 따르기
- [ ] Entity는 Read만, Feature는 CUD만
- [ ] DTO와 Model 분리
- [ ] Mapper 작성
- [ ] 타입 명시 (any 금지)
- [ ] JSDoc 주석 작성
- [ ] 에러 처리 구현

### API 호출 시

- [ ] `apiClient` 또는 `ssoClient` 사용
- [ ] 적절한 HTTP 메서드 선택
- [ ] DTO 타입 정의
- [ ] 에러 처리 (try-catch)
- [ ] 로딩 상태 관리

---

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 작업, 패키지 매니저 설정
```

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 🔗 관련 링크

- [React 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Axios 공식 문서](https://axios-http.com/)
- [React Router 공식 문서](https://reactrouter.com/)
- [FSD 아키텍처](https://feature-sliced.design/)

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.
