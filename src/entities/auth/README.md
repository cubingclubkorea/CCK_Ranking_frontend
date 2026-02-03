# Auth Entity

**인증 엔티티** - 플레이어 정보 조회 및 검색 API

## 📋 모델 구조

```typescript
interface PlayerInfo {
  name: string;
  state: string;
  cckId: string;
}

interface SearchInfo {
  name: string;
  enName: string;
  state: string;
  gender: Gender;
  cckId: string;
  wcaId: string;
}

type Gender = 'M' | 'F';
```

## 🔧 API 함수

### getPlayerInfo

RFID UID로 플레이어 정보 조회

```typescript
const playerInfo = await getPlayerInfo('UID123456');
```

**Parameters:**
- `uid`: string - RFID 카드의 고유 식별자

**Returns:** `Promise<PlayerInfo>`

**API Endpoint:** `GET /api/rfid/info/{uid}`

### getSearchInfo

검색어로 플레이어 상세 정보 조회

```typescript
const searchInfo = await getSearchInfo('홍길동');
```

**Parameters:**
- `searchTerm`: string - 검색할 플레이어 이름 또는 ID

**Returns:** `Promise<SearchInfo>`

**API Endpoint:** `GET /api/admin/search/{searchTerm}`

## 📖 사용 예시

### 컴포넌트에서 사용

```typescript
import { getPlayerInfo, getSearchInfo } from '@/entities/auth';
import type { PlayerInfo, SearchInfo } from '@/entities/auth';

const PlayerSearchPage = () => {
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleRfidScan = async (uid: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlayerInfo(uid);
      setPlayerInfo(data);
    } catch (err) {
      setError('플레이어 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSearchInfo(searchTerm);
      setSearchInfo(data);
    } catch (err) {
      setError('검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* RFID 스캔 */}
      <button onClick={() => handleRfidScan('UID123')}>
        RFID 스캔
      </button>
      
      {/* 검색 */}
      <input 
        type="text" 
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="이름 또는 ID 검색"
      />
      
      {loading && <p>로딩 중...</p>}
      {error && <p>{error}</p>}
      {playerInfo && <div>{playerInfo.name}</div>}
      {searchInfo && <div>{searchInfo.name} ({searchInfo.enName})</div>}
    </div>
  );
};
```

## 🔄 데이터 매핑

### PlayerInfo Mapper

DTO에서 도메인 모델로 변환

```typescript
const PlayerInfoMapper = (dto: PlayerInfoDTO): PlayerInfo => ({
  name: dto.name,
  state: dto.state,
  cckId: dto.cck_id,
});
```

### SearchInfo Mapper

DTO에서 도메인 모델로 변환 (snake_case → camelCase)

```typescript
const SearchInfoMapper = (dto: SearchInfoDTO): SearchInfo => ({
  name: dto.name,
  enName: dto.en_name,
  state: dto.state,
  gender: dto.gender,
  cckId: dto.cck_id,
  wcaId: dto.wca_id,
});
```

## 🧪 테스트

테스트 페이지: `/test/auth`

```bash
# 개발 서버 실행 후
# 브라우저에서 /test/auth 접속
```

## 📝 참고사항

- `getPlayerInfo`는 RFID 스캔 시 빠른 조회를 위해 최소한의 정보만 반환
- `getSearchInfo`는 관리자 검색 기능으로 더 상세한 정보 제공
- 두 API 모두 SSO 인증이 필요함 (`ssoClient` 사용)
- 실패 시 적절한 에러 핸들링 필요
