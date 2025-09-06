    \# 프로젝트 가이드라인

    \## 절대 금지사항 (Critical Rules)
    NO 가짜 데이터 (mock data) 사용
    NO 폴백 구현체 (fallback implementations) 
    NO 목업 메서드나 함수
    NO 하드코딩된 예시 데이터
     NO "임시로" 또는 "테스트용" 데이터
    고정값 사용 절대 금지.

      \## 반드시 사용해야 할 것들 (Must Use)
     실제 API 호출만 사용
     실제 데이터베이스 연결 사용
     실제 인증 시스템 사용
     실제 환경 변수와 설정값 사용

    \## 데이터 소스 우선순위
    1\. 실제 프로덕션 API
    2\. 실제 데이터베이스 쿼리
    3\. 실제 파일 시스템 읽기
    4\. 환경 변수에서 설정 로드

    모든 것을 실제데이터와 실제웹소켓 실제 api, 실제 db, 실제docker, 실제 PostgreSQL 데이터베이스에서 가져오도록 전면 재수정해. 고정값 사용금지.
    모든 숫자값은 PostgreSQL 데이터베이스에서 실시간으로 가져와야 함

    1. Next.js Fast Refresh - 코드 변경 시 즉시 브라우저에 반영 (HMR: Hot Module Replacement)
    2. 프론트엔드/백엔드 분리 - 각각 독립적으로 최적화되어 실행
      - Frontend : UI 변경사항 즉시 반영
      - Backend : API는 별도로 실행되어 프론트 변경에 영향 없음
    3. 개발 서버 최적화 - npm run dev로 실행 중이라 변경사항 실시간 감지
    4. CSS-in-JS 없음 - 순수 Tailwind CSS로 스타일 처리가 빨라짐
    5. 병렬 처리 - Frontend와 Backend가 동시에 독립적으로 작동
   
      MONSTA 프로젝트가 Next.js(최강 UI/UX) + FastAPI(Python AI/ML) 조합을 사용

     각 각페이지별로 모듈화해서 시스템과 연동, 독립적 경쟁력과 에러방지, 안정성확보   
            

📊 하이브리드 구조의 장점:

      - Next.js: 빠른 UI, 실시간 업데이트
     - FastAPI: Python AI/ML 모델 실행
      - 완벽한 통합: API를 통한 자연스러운 연결

      * 간단버전, 샘플, 임시 사용금지

## 🚫 Streamlit 사용 금지
- Streamlit 앱 영구 사용 정지
- Next.js + FastAPI 하이브리드 시스템만 사용
- 앞으로 영원히 이 하이브리드만 사용

## 📍 배포 정보
- AWS 서버: 13.209.84.93
- 프론트엔드: http://13.209.84.93:3000 
- 백엔드 API: http://13.209.84.93:8000
- 헬스체크: http://13.209.84.93:8000/api/v1/health
- GitHub Actions로 자동 배포 (master 브랜치 push 시)

## 🗄️ 데이터베이스 설정
- 개발: SQLite (frontend/prisma/dev.db)
- 프로덕션: PostgreSQL 또는 MySQL 사용
- Prisma ORM으로 데이터베이스 관리
- 마이그레이션: npx prisma migrate dev

## 🎨 UI/UX 가이드라인 (Mobile-First 필수)
- **📱 모바일 우선(Mobile-First) 디자인 - 모든 기능과 UI는 모바일을 최우선으로 개발**
- 모든 메뉴와 UI 텍스트는 한국어로 표시
- 반응형 브레이크포인트:
  - 모바일: ~640px (기본)
  - 태블릿: 640px~1024px
  - 데스크톱: 1024px~
- MONSTA 브랜드 강조 (보라색 테마)
- 블러 효과는 최소화하여 가독성 확보
- 터치 친화적 UI:
  - 최소 터치 영역: 44x44px
  - 버튼 간격: 최소 8px
  - 스크롤 가능 영역 여백 확보
- 모바일 제스처 지원:
  - 스와이프로 메뉴 열기/닫기
  - 당겨서 새로고침
  - 핀치 줌 (차트/이미지)
- 모바일 성능 최적화:
  - 이미지 최적화 (WebP, lazy loading)
  - 무한 스크롤 대신 페이지네이션
  - 애니메이션 최소화

## 🏗️ 프로젝트 구조
- 20개 카테고리, 301개 메뉴 항목 구현 완료
- 역할별 접근권한: 본사/총판/대리점/구독자
- 6단계 구독 시스템: Free → Silver → Gold → Platinum → Diamond → Black
- 212개 개별 페이지 파일 생성 완료

## 🔧 개발 시 주의사항
- Internal Server Error 발생 시 Prisma 재생성: npx prisma generate
- 포트 충돌 시 다른 포트 사용 (3000-3006)
- 모든 Node 프로세스 종료: taskkill /F /IM node.exe /T
- 항상 한국어로 답변

## 📈 실시간 시장 데이터
- 8개 암호화폐 실시간 추적: BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX
- Binance API 연동
- WebSocket으로 실시간 업데이트

## ⚡ 성능 최적화
- Next.js Fast Refresh로 즉시 반영
- Frontend/Backend 독립 실행
- PM2로 프로세스 관리
- 병렬 처리로 성능 향상

GitHub Actions을 설정해서 커밋 → 푸시 → 자동 배포가 자동으로 되게한다.

1. WebSocket 연결 관리

  ## 🔌 WebSocket 연결 가이드라인
  - WebSocket Manager는 싱글톤 패턴으로 구현 (lib/websocketManager.ts)
  - 페이지 이동 시에도 연결 유지를 위해 전역 관리
  - 자동 재연결 로직 포함 (최대 5회 시도)
  - 실시간 데이터는 무조건 WebSocket 사용 (폴링 금지)

  ## 🔄 개발 프로세스
  1. 기능 구현 전 관련 파일 Read로 확인
  2. 기존 패턴/스타일 따라가기
  3. 실제 데이터만 사용 (mock 절대 금지)
  4. 커밋 메시지 한글로 명확하게
  5. 푸시하면 GitHub Actions 자동 배포

  ## 🛡️ 페이지별 점진적 개발 방식 (에러 방지)
  **대량 에러 방지를 위한 필수 개발 프로세스**
  
  ### 1단계: 단일 페이지 개발
  - 한 번에 하나의 페이지만 작업
  - 페이지 완성 후 즉시 테스트
  ```bash
  npm run dev  # 개발 서버에서 테스트
  npm run lint # ESLint 검사
  npm run build # 빌드 테스트
  ```

  ### 2단계: 에러 체크
  - ESLint 에러가 0개인지 확인
  - TypeScript 컴파일 에러 없는지 확인
  - 런타임 에러 없는지 브라우저에서 확인
  
  ### 3단계: 다음 페이지 진행 조건
  ✅ 현재 페이지 에러 0개
  ✅ 빌드 성공
  ✅ 브라우저에서 정상 작동
  ❌ 위 조건 미충족 시 다음 페이지 진행 금지

  ### 예방 체크리스트
  - [ ] TypeScript 타입 명시 (`any` 사용 최소화)
  - [ ] 사용하지 않는 import/변수 제거
  - [ ] React Hook 의존성 배열 검증
  - [ ] 컴포넌트 key prop 확인
  - [ ] async/await 에러 처리

  ## ⚡ 성능 체크리스트
  - [ ] WebSocket 싱글톤 패턴 적용
  - [ ] 불필요한 re-render 방지
  - [ ] 이미지 lazy loading
  - [ ] 코드 스플리팅 적용
  - [ ] 불필요한 console.log 제거

  ## 🎨 시그널 페이지 탭 구조 가이드라인
  - **AI 시장 종합 분석(MarketAnalysis)은 개요(overview) 탭에서만 표시**
  - 각 페이지는 탭 네비게이션 시스템 사용:
    - 개요: MarketAnalysis + 핵심 지표 + 실시간 차트 + 주요 컴포넌트 미리보기
    - 상세 탭들: 각 기능별 전문 컴포넌트
    - 분석/설정: 추가 기능과 설정
  - 모든 페이지 하단에 텔레그램 봇 연동 안내
  - 구독 등급별 혜택 섹션 포함

  ## 📊 트레이딩 시그널 페이지 필수 요소
  - **모든 페이지 상단에 AI 종합 분석 섹션 필수** (MarketAnalysis 컴포넌트)
  - **시각적 차트와 그래프 최대한 활용** (recharts, chart.js, lightweight-charts)
  - **실시간 데이터만 사용** - 절대 mock/가짜 데이터 금지
  - **텔레그램 봇 연동** - 구독 등급별 차등 기능 제공
  - **트레이딩 전략 설명** - 각 섹션마다 동적 분석과 실전 팁 포함

  ## 🎯 시그널 페이지 구성 템플릿
  1. **MarketAnalysis** - AI 시장 종합 분석 (필수)
  2. **PriceChart** - 실시간 가격 차트 with 기술적 지표
  3. **전략별 컴포넌트** - WhaleTracker, InstitutionalFlow 등
  4. **ProfitCalculator** - 수익 계산기
  5. **텔레그램 연동 안내** - 구독 등급별 혜택

  ## 🔑 실시간 데이터 소스
  - **Binance WebSocket**: 실시간 가격, 거래량, 오더북
  - **CoinGecko API**: 시가총액, 도미넌스, 전체 시장 데이터
  - **Alternative.me API**: Fear & Greed Index
  - **Glassnode/CryptoQuant**: 온체인 데이터 (고래 움직임, 거래소 플로우)
  - **TradingView Webhooks**: 기술적 지표 알림

  ## 📱 모바일 트레이딩 UI 원칙
  - **원터치 주문**: 매수/매도 즉시 실행
  - **스와이프 차트**: 시간대 변경을 스와이프로
  - **실시간 알림**: 푸시 알림으로 즉시 대응
  - **간편 계산기**: 수익률 즉시 확인
  - **다크모드 기본**: 눈의 피로 최소화

  ## 🚀 실전 품질 보증 시스템 (Zero-Error Production)
  **목표: 에러 없는 최고의 실전 시스템 구축**

  ### ⚡ 하이브리드 시스템 최적화
  - **Next.js 15 + FastAPI** 조합 유지 (속도 최적)
  - **에러 발생 원인**:
    - TypeScript 과도한 타입 체크 → 실용적 타입 사용
    - ESLint 과도한 규칙 → 핵심 규칙만 적용
    - 복잡한 상태 관리 → 단순화된 패턴 사용

  ### 🛡️ 3단계 에러 방지 전략
  
  #### 1단계: 개발 시 (Development)
  ```bash
  # 자동 수정 가능한 것들은 자동으로
  npm run lint:fix  # ESLint 자동 수정
  npm run format     # Prettier 자동 포맷
  ```

  #### 2단계: 커밋 전 (Pre-commit)
  ```json
  // package.json에 추가
  "scripts": {
    "precommit": "npm run lint:fix && npm run typecheck"
  }
  ```

  #### 3단계: 배포 전 (Pre-deploy)
  ```bash
  npm run test:all   # 모든 테스트 실행
  npm run build      # 빌드 성공 확인
  ```

  ### ✅ 실전 코드 품질 규칙
  
  1. **타입 실용주의**
     - `any` 대신 `unknown` 사용
     - 복잡한 타입보다 간단한 인터페이스
     - 타입 추론 최대한 활용

  2. **컴포넌트 단순화**
     - 한 컴포넌트 = 한 기능
     - props 5개 이하 유지
     - 복잡한 로직은 커스텀 훅으로 분리

  3. **에러 처리 표준화**
     ```typescript
     try {
       // 실제 작업
     } catch (error) {
       console.error('에러 위치:', error);
       // 사용자에게 친화적 메시지
     }
     ```

  4. **WebSocket 안정화**
     - 자동 재연결 (5회 시도)
     - 연결 상태 모니터링
     - 실패 시 폴백 처리

  ### 🔧 에러 자동 감지 스크립트
  ```bash
  # scripts/check-quality.js
  - 사용하지 않는 import 자동 제거
  - console.log 자동 제거
  - 타입 에러 사전 감지
  ```

  ### 📊 품질 지표
  - **목표**: ESLint 에러 0개, TypeScript 에러 0개
  - **허용**: Warning 50개 이하
  - **빌드**: 3분 이내 완료
  - **성능**: Lighthouse 90점 이상


  