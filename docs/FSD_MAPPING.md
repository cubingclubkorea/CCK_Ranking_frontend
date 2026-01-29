# FSD Mapping Proposal

요약: `src/` 내부에서 FSD(Feature-Sliced Design)를 따르는 재배치를 준비합니다. 루트의 설정 파일과 `index.html`은 그대로 두고, `src` 내부에서만 바렐 및 구조 정리를 진행합니다.

폴더 매핑 제안
- `src/app` : 앱 엔트리, 전역 레이아웃, `App` 컴포넌트
- `src/pages` : 라우트별 페이지 컴포넌트
- `src/widgets` : 재사용 가능한 UI 컴포넌트(무상태/프레젠테이셔널)
- `src/features` : 도메인 기능 단위(상태관리, 서비스, 훅)
- `src/entities` : 도메인 모델 타입/어댑터
- `src/shared` : 유틸, 스타일 토큰, 공통 훅

현재 변경 사항
- `src` 루트 바렐(`src/index.ts`) 추가 — 각 모듈 바렐을 재수출
- 각 서브폴더에 바렐(`index.ts`) 파일 생성 (초기 상태)

다음 단계 제안
1. 각 폴더에 실제 컴포넌트/유틸을 옮기지 않고, 파일 단위로 `export`를 정리합니다.
2. 타입 검사(`tsc --noEmit`)를 실행하여 깨지는 import가 없는지 확인합니다.
3. 필요한 경우 코드베이스별 점진적 리팩토링 계획을 수립합니다.