# Feature: Scramble

스크램블 발급(업데이트)을 담당하는 Feature입니다.

> **Feature의 역할**: CUD 전담 (스크램블 발급)  
> **Entity 문서**: [Scramble Entity](../../entities/scramble/README.md) - 스크램블 조회

---

## 📁 디렉토리 구조

```
scramble/
├── index.ts            # Public API
├── type.ts             # 타입 정의
└── api/
    ├── updateScrambler.ts          # 스크램블 발급
    └── dto/
        └── scramblerUpdate.dto.ts  # 발급 요청 DTO
```

---

## 🎯 주요 기능

### 스크램블 발급 (업데이트)

스크램블러가 특정 플레이어에게 스크램블을 발급합니다.

**API 함수:**

```typescript
/**
 * 스크램블러 업데이트 (스크램블 발급)
 * @param dto - 스크램블 발급 요청 정보
 * @returns 발급된 스크램블 정보
 */
export const updateScrambler = async (
  dto: ScramblerUpdateDTO
): Promise<ScrambleResponse>
```

**DTO 구조:**

```typescript
interface ScramblerUpdateDTO {
  compIdx: number;        // 대회 ID
  playerUid: string;      // 플레이어 UID
  scramblerUid: string;   // 스크램블러 UID
}
```

**반환 타입:**

```typescript
interface ScrambleResponse {
  idx: number;              // 스크램블 ID
  attemptIdx: number;       // 시도 ID
  name: string;             // 플레이어 이름
  cckId: string;            // 플레이어 CCK ID
  roundIdx: number;         // 라운드 ID
  compName: string;         // 대회 이름
  eventName: string;        // 종목 이름
  roundName: string;        // 라운드 이름
  roundGroup: string;       // 라운드 그룹
  seq: string;              // 시퀀스
  scramble: string;         // 스크램블 문자열 (예: "R U R' U' ...")
  svg: string;              // SVG 이미지 (큐브 상태 시각화)
}
```

**사용 예시:**

```typescript
import { updateScrambler } from '@/features/scramble';

const scrambleData = await updateScrambler({
  compIdx: 1,
  playerUid: 'player_abc123',
  scramblerUid: 'scrambler_xyz789',
});

console.log(scrambleData.scramble);  // "R U R' U' F' ..."
console.log(scrambleData.svg);       // "<svg>...</svg>"
```

---

## 📡 HTTP 요청 상세

### PATCH /scramble

**요청 본문**: `ScramblerUpdateDTO`

```json
{
  "compIdx": 1,
  "playerUid": "player_abc123",
  "scramblerUid": "scrambler_xyz789"
}
```

**응답**: `ScrambleResponseDTO`

```json
{
  "idx": 500,
  "attemptIdx": 1001,
  "name": "홍길동",
  "cckId": "hong123",
  "roundIdx": 10,
  "compName": "2026 CCK 춘계대회",
  "eventName": "3x3x3",
  "roundName": "1라운드",
  "roundGroup": "A",
  "seq": "1",
  "scramble": "R U R' U' F' U F R U' R'",
  "svg": "<svg width=\"200\" height=\"200\">...</svg>"
}
```

---

## 💡 사용 가이드

### 스크램블 발급 컴포넌트

```typescript
import { useState } from 'react';
import { updateScrambler } from '@/features/scramble';
import { apiHandler } from '@/shared/utils/apiHandler';
import type { ScrambleResponse } from '@/entities/scramble';

export const ScramblerStation = ({
  compIdx,
  scramblerUid,
}: {
  compIdx: number;
  scramblerUid: string;
}) => {
  const [playerUid, setPlayerUid] = useState('');
  const [scramble, setScramble] = useState<ScrambleResponse | null>(null);
  
  const handleGenerateScramble = apiHandler(async () => {
    const result = await updateScrambler({
      compIdx,
      playerUid,
      scramblerUid,
    });
    
    setScramble(result);
  });
  
  return (
    <div>
      <h2>스크램블 발급</h2>
      
      <div>
        <input
          type="text"
          placeholder="플레이어 UID"
          value={playerUid}
          onChange={(e) => setPlayerUid(e.target.value)}
        />
        <button onClick={handleGenerateScramble}>
          스크램블 발급
        </button>
      </div>
      
      {scramble && (
        <div className="scramble-display">
          <h3>{scramble.compName}</h3>
          <p>
            {scramble.eventName} - {scramble.roundName} ({scramble.roundGroup})
          </p>
          <p>
            플레이어: {scramble.name} ({scramble.cckId})
          </p>
          
          <div className="scramble-text">
            {scramble.scramble}
          </div>
          
          <div 
            className="scramble-image"
            dangerouslySetInnerHTML={{ __html: scramble.svg }}
          />
        </div>
      )}
    </div>
  );
};
```

### QR 코드로 플레이어 식별

```typescript
import { useState } from 'react';
import { updateScrambler } from '@/features/scramble';
import { apiHandler } from '@/shared/utils/apiHandler';

export const QRScramblerStation = ({
  compIdx,
  scramblerUid,
}: {
  compIdx: number;
  scramblerUid: string;
}) => {
  const [isScanning, setIsScanning] = useState(false);
  
  const handleQRScan = apiHandler(async (playerUid: string) => {
    const scramble = await updateScrambler({
      compIdx,
      playerUid,
      scramblerUid,
    });
    
    // 스크램블 출력 또는 표시
    printScramble(scramble);
    
    setIsScanning(false);
  });
  
  return (
    <div>
      <button onClick={() => setIsScanning(true)}>
        QR 스캔 시작
      </button>
      
      {isScanning && (
        <QRScanner onScan={handleQRScan} />
      )}
    </div>
  );
};
```

### 스크램블 출력 (프린터)

```typescript
import { updateScrambler } from '@/features/scramble';
import type { ScrambleResponse } from '@/entities/scramble';

const printScramble = (scramble: ScrambleResponse) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  
  if (!printWindow) {
    alert('팝업이 차단되었습니다.');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>스크램블 출력</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .scramble {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
          }
          .image {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${scramble.compName}</h1>
          <h2>${scramble.eventName} - ${scramble.roundName}</h2>
          <p>플레이어: ${scramble.name} (${scramble.cckId})</p>
          <p>그룹: ${scramble.roundGroup} | 순번: ${scramble.seq}</p>
        </div>
        
        <div class="scramble">
          ${scramble.scramble}
        </div>
        
        <div class="image">
          ${scramble.svg}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// 사용
const handlePrintScramble = apiHandler(async () => {
  const scramble = await updateScrambler({
    compIdx: 1,
    playerUid: 'player123',
    scramblerUid: 'scrambler456',
  });
  
  printScramble(scramble);
});
```

### 스크램블 히스토리 관리

```typescript
import { useState, useEffect } from 'react';
import { updateScrambler } from '@/features/scramble';
import type { ScrambleResponse } from '@/entities/scramble';

export const ScramblerStationWithHistory = ({
  compIdx,
  scramblerUid,
}: {
  compIdx: number;
  scramblerUid: string;
}) => {
  const [history, setHistory] = useState<ScrambleResponse[]>([]);
  
  // 로컬 스토리지에서 히스토리 복원
  useEffect(() => {
    const saved = localStorage.getItem(`scramble_history_${compIdx}`);
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, [compIdx]);
  
  const handleGenerateScramble = async (playerUid: string) => {
    const scramble = await updateScrambler({
      compIdx,
      playerUid,
      scramblerUid,
    });
    
    // 히스토리에 추가
    const newHistory = [scramble, ...history].slice(0, 50); // 최근 50개만
    setHistory(newHistory);
    
    // 로컬 스토리지에 저장
    localStorage.setItem(
      `scramble_history_${compIdx}`,
      JSON.stringify(newHistory)
    );
    
    return scramble;
  };
  
  return (
    <div>
      <div className="scramble-station">
        {/* 스크램블 발급 UI */}
      </div>
      
      <div className="history">
        <h3>최근 발급된 스크램블</h3>
        {history.map((scramble) => (
          <div key={scramble.idx} className="history-item">
            <span>{scramble.name}</span>
            <span>{scramble.scramble}</span>
            <button onClick={() => printScramble(scramble)}>
              재출력
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🎯 베스트 프랙티스

### 1. UID 검증

```typescript
const isValidUid = (uid: string): boolean => {
  return uid.length > 0 && /^[a-zA-Z0-9_-]+$/.test(uid);
};

// 사용
if (!isValidUid(playerUid)) {
  alert('유효하지 않은 플레이어 UID입니다.');
  return;
}
```

### 2. SVG 안전하게 렌더링

```typescript
import DOMPurify from 'dompurify';

const SafeSVG = ({ svg }: { svg: string }) => {
  const cleanSvg = DOMPurify.sanitize(svg);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: cleanSvg }} />
  );
};
```

### 3. 스크램블 복사 기능

```typescript
const copyScrambleToClipboard = async (scramble: string) => {
  try {
    await navigator.clipboard.writeText(scramble);
    alert('스크램블이 클립보드에 복사되었습니다!');
  } catch (error) {
    console.error('복사 실패:', error);
    
    // 폴백: 텍스트 선택
    const textarea = document.createElement('textarea');
    textarea.value = scramble;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};
```

---

## 🔒 보안 고려사항

### 스크램블러 인증

```typescript
// 스크램블러 UID는 서버에서 발급받은 것만 사용
// 하드코딩하지 말 것
const scramblerUid = await getScramblerUid(); // 서버에서 가져오기

await updateScrambler({
  compIdx,
  playerUid,
  scramblerUid, // 인증된 스크램블러
});
```

### 플레이어 정보 보호

```typescript
// 스크램블 출력 시 민감 정보 제외
const printScramblePublic = (scramble: ScrambleResponse) => {
  // 이름과 CCK ID는 표시하되, 다른 개인 정보는 제외
  const publicData = {
    name: scramble.name,
    scramble: scramble.scramble,
    svg: scramble.svg,
  };
  
  // ...
};
```

---

## 📚 관련 문서

- **[Scramble Entity](../../entities/scramble/README.md)** - 스크램블 조회
- **[Features Layer](../README.md)** - CUD 패턴 개요
- **[Shared API](../../shared/README.md)** - ApiClient 사용법
- **[Architecture](../../../docs/guides/ARCHITECTURE.md)** - FSD 구조
