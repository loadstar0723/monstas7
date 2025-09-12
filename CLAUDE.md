---
description: when start new chat use this rule for checkout project summary
globs:
alwaysApply: true
---



   \# 프로젝트 가이드라인

## 🚨 절대 금지사항 (Critical Rules) - 위반 시 즉시 중단

### ❌ 절대 사용 금지 목록

- **NO 가짜 데이터 (mock data)**
- **NO 폴백 구현체 (fallback implementations)**
- **NO 목업 메서드나 함수**
- **NO 하드코딩된 예시 데이터**
- **NO "임시로" 또는 "테스트용" 데이터**
- **NO 고정값 사용 (0.1, 0.5, 2% 등)**
- **NO 가정된 값 ("~라고 가정")**
- **NO 예제 데이터 배열**
- **NO 샘플 JSON 객체**
- **NO 더미 함수 구현**
- **NO 시뮬레이션 데이터 (simulated data)**
- **NO setTimeout으로 생성한 가짜 거래**
- **NO 테스트용 트랜잭션 데이터**
- **NO sampleTransactions 같은 예시 데이터**
- **NO simulateWhaleTransactions 같은 시뮬레이션 함수**

### 🔍 코드 작성 전 필수 체크리스트

- [ ] 이 값은 실제 API에서 오는가?
- [ ] 이 계산은 실제 데이터 기반인가?
- [ ] 하드코딩된 숫자가 있는가? (있다면 중단)
- [ ] "임시", "테스트", "예시" 단어가 있는가? (있다면 중단)
- [ ] DB나 API 없이 동작하는가? (그렇다면 잘못됨)

### ⚠️ 위반 감지 키워드 (이 단어가 있으면 즉시 중단)

   ```
   mock, dummy, fake, sample, example, test, temp, 
   hardcoded, fallback, placeholder, stub, 가정, 
   임시, 예시, 테스트용, 샘플, simulate, simulation,
   simulateWhale, sampleTransaction, testData, 
   setTimeout으로_만든_데이터, 시뮬레이션
   ```

### 🛑 코드 작성 시 자동 중단 트리거

## 🔴 모든 파일 수정 시 절대 규칙 (2025-09-12 추가)

### ❌ 절대 금지 - 파일 손상 방지 (모든 파일에 적용)

1. **코드 삭제 절대 금지**
   - 기존 코드를 함부로 삭제하지 않기
   - 기능을 제거하지 않기
   - 작동하는 코드를 없애지 않기

2. **파일 크기 축소 금지**
   - 수정 후 파일 크기가 줄어들면 = 코드가 삭제됨
   - 예: 37KB → 21KB = 즉시 중단하고 복원

3. **임의 수정 금지**
   - 요청하지 않은 부분 건드리지 않기
   - 요청한 것만 정확히 수정 (예: selectedCoin → selectedSymbol)

### ✅ 필수 프로세스 - 모든 파일 수정 시

```bash
# 1. 수정 전 백업 생성 (필수!)
cp 파일명.tsx 파일명.tsx.backup

# 2. 요청한 부분만 최소한으로 수정

# 3. 파일 크기 확인 (필수!)
ls -lh 파일명.tsx*

# 4. 크기가 줄었다면 → 즉시 백업에서 복원
cp 파일명.tsx.backup 파일명.tsx
```

### 🚨 즉시 복원 트리거
- 파일 크기가 10% 이상 줄어들면 → 즉시 복원
- 기능이 사라지면 → 즉시 복원  
- 섹션이 없어지면 → 즉시 복원
- 차트가 안 보이면 → 즉시 복원

### 📝 기억할 것
**모든 파일은 심혈을 기울여 개발된 중요한 자산이므로 절대 함부로 삭제하거나 축소하지 않는다!**
**특히 Ultimate, Module, Component 등 모든 기능 파일들은 절대 보호 대상이다!**

## 🎯 문제 해결 접근 방식 (2025-09-07 추가)

### ⚡ 핵심 원칙: "간단하게 해결하지 않기"

**사용자의 중요한 피드백**: 문제를 간단하게만 해결하려고 하지 말고, 근본적이고 완전한 해결책을 찾을 것.

### ✅ 올바른 문제 해결 방식

1. **근본 원인 분석**
   - 에러의 표면적 증상이 아닌 근본 원인 찾기
   - 시스템 전체 구조를 이해하고 접근
   - 연관된 모든 컴포넌트 확인

2. **완전한 솔루션 제공**
   - 임시방편(mockData, 기능 제거) 절대 금지
   - 기존 기능을 모두 유지하면서 문제 해결
   - 장기적으로 유지보수 가능한 코드 작성

3. **실제 데이터 사용**
   - Mock 데이터나 더미 데이터 사용 금지
   - 실제 API, 실제 데이터베이스 연결 유지
   - 프로덕션 환경과 동일한 조건에서 작동

4. **문제 해결 체크리스트**
   - [ ] 에러의 근본 원인을 파악했는가?
   - [ ] 모든 기존 기능이 유지되는가?
   - [ ] 실제 데이터와 연동되는가?
   - [ ] 프로덕션에서도 작동하는가?
   - [ ] 향후 확장 가능한 구조인가?

### ❌ 잘못된 예시 (절대 하지 말 것)

- NextAuth 에러 → 데이터베이스 연결 제거하고 mockUsers 사용 ❌
- WebSocket 연결 실패 → 가짜 데이터 생성 ❌
- API 에러 → API 호출 제거하고 하드코딩 ❌
- 복잡한 기능 → 기능 단순화 또는 제거 ❌

### ✅ 올바른 예시 (이렇게 해결할 것)

- NextAuth 에러 → 데이터베이스 연결 문제 해결, 환경변수 확인 ✅
- WebSocket 연결 실패 → 연결 재시도 로직, 에러 핸들링 개선 ✅
- API 에러 → CORS 설정, 인증 토큰 확인, 엔드포인트 수정 ✅
- 복잡한 기능 → 모든 기능 유지하면서 구조 개선 ✅

### 💡 기억하라
>
> "빠른 해결보다 올바른 해결이 중요하다"
> "기능을 제거하는 것은 해결이 아니다"
> "실제 프로덕션에서 작동하지 않으면 의미가 없다"

### 🛑 코드 작성 시 자동 중단 트리거

   **다음 중 하나라도 감지되면 즉시 중단하고 수정:**

   1. `* 0.1`, `* 0.5` 등 하드코딩된 계산
   2. `currentPrice - 100`, `price + 500` 등 고정값 연산
   3. `[{id: 1, ...}]` 형태의 하드코딩된 배열
   4. `confidence: 65`, `risk: 'high'` 등 고정 속성값
   5. `// 임시`, `// TODO`, `// 테스트` 등의 주석
   6. `setTimeout(() => simulate..., 3000)` 등 시뮬레이션 타이머
   7. `sampleTransactions = [{...}]` 등 샘플 데이터 배열
   8. `simulateWhaleTransactions()` 등 시뮬레이션 함수

### ✅ 올바른 데이터 소스 사용법

   ```typescript
   // ❌ 잘못된 예시 (절대 금지)
   const stopLoss = currentPrice * 0.95  // 하드코딩
   const data = [{id: 1, name: 'test'}]  // 가짜 데이터
   const sampleTransactions = [{symbol: 'BTC', amount: 2.5}]  // 시뮬레이션
   setTimeout(() => simulateWhaleTransactions(), 3000)  // 시뮬레이션
   
   // ✅ 올바른 예시 (반드시 이렇게)
   const config = await fetch('/api/trading-config')
   const stopLoss = currentPrice * config.stopLossRatio
   const data = await fetch('https://api.binance.com/...')
   // WebSocket이나 실제 API로 실시간 거래만 받기
   ```

### 📝 코드 리뷰 전 필수 실행 명령

   ```bash
   # 규칙 위반 검증 (반드시 0개여야 함)
   node scripts/validate-no-mock.js
   
   # 하드코딩 검색
   grep -r "* 0\." --include="*.tsx" --include="*.ts"
   
   # 금지 키워드 검색  
   grep -r "mock\|fake\|dummy\|임시\|simulate\|sample" --include="*.tsx"
   
   # 시뮬레이션 검색
   grep -r "setTimeout.*simulate\|sampleTransaction" --include="*.tsx"
   
   # 실전 동작 검증
   grep -r "WebSocket\|fetch.*binance\|api\.binance" --include="*.tsx"
   
   # 하드코딩된 데이터 검증
   grep -r "price: [0-9]\|amount: [0-9]\|value: [0-9]" --include="*.tsx"
   ```

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

## 🔥 실전 운영 필수 규칙 (Production-Ready Requirements)

### 모든 페이지 기능 실전 작동 원칙

1. **실시간 데이터 연동 필수**
   - Binance WebSocket 실시간 가격 스트리밍
   - 실제 거래소 API 데이터만 사용
   - PostgreSQL DB에서 실시간 데이터 조회
   - Redis 캐싱으로 성능 최적화

2. **각 페이지별 필수 실전 기능**

   **🐋 고래 추적 (Whale Tracker)**
   - Binance WebSocket 실시간 거래 감지
   - 실제 온체인 데이터 (Etherscan, BSCscan API)
   - 실제 거래소 입출금 플로우 모니터링
   - 최소 임계값: BTC 1개, ETH 10개 이상 실제 거래

   **💰 스마트 머니 (Smart Money)**
   - 실제 기관 지갑 주소 추적
   - Nansen, Glassnode API 연동
   - 실시간 포지션 변화 감지

   **📊 청산 맵 (Liquidation)**
   - Binance Futures 실시간 청산 데이터
   - Coinglass API 청산 히트맵
   - 실제 레버리지 포지션 추적

   **🌡️ 공포 탐욕 지수 (Fear & Greed)**
   - Alternative.me API 실시간 지수
   - CoinGecko 시장 데이터
   - 실제 소셜 센티먼트 분석

   **💸 펀딩 비율 (Funding Rate)**
   - Binance Futures 실시간 펀딩
   - 전 거래소 펀딩 집계
   - 실제 금리 차익거래 기회

   **🔄 차익거래 (Arbitrage)**
   - 멀티 거래소 실시간 가격 비교
   - 실제 거래 가능한 페어만 표시
   - 수수료 포함 실제 수익률 계산

   **🌊 DEX 플로우 (DEX Flow)**
   - Uniswap, PancakeSwap 실시간 스왑
   - 실제 유동성 풀 데이터
   - MEV 봇 활동 추적

   **💎 비정상 옵션 (Unusual Options)**
   - Deribit 옵션 데이터
   - 실제 대규모 옵션 거래
   - 만기별 OI 변화 추적

   **📱 소셜 센티먼트 (Social Sentiment)**
   - Twitter API 실시간 분석
   - Reddit API 트렌딩
   - 실제 멘션 카운트와 센티먼트 점수

   **🏦 인사이더 플로우 (Insider Flow)**
   - 실제 프로젝트 팀 지갑 추적
   - 토큰 언락 스케줄 모니터링
   - VC 지갑 움직임 감지

3. **필수 API 연동 체크리스트**
   - [ ] Binance REST API & WebSocket
   - [ ] CoinGecko API
   - [ ] Alternative.me Fear & Greed API
   - [ ] Etherscan/BSCscan API
   - [ ] Glassnode/CryptoQuant (온체인)
   - [ ] Twitter/Reddit API (소셜)
   - [ ] Deribit API (옵션)
   - [ ] PostgreSQL 실시간 쿼리
   - [ ] Redis 캐싱 레이어

4. **실전 데이터 검증 규칙**

   ```typescript
   // ✅ 올바른 실전 데이터 사용
   const ws = new WebSocket('wss://stream.binance.com:9443/ws')
   const price = await fetch('https://api.binance.com/api/v3/ticker/price')
   const onchain = await fetch('https://api.etherscan.io/api')
   
   // ❌ 절대 금지
   const fakePrice = 100000  // 하드코딩
   const mockTrades = generateFakeTrades()  // 시뮬레이션
   setTimeout(() => addSampleData(), 1000)  // 테스트 데이터
   ```

5. **성능 최적화 필수사항**
   - WebSocket 연결 풀링 (최대 5개)
   - API 호출 Rate Limiting 준수
   - Redis 캐싱 (TTL 1-5분)
   - 데이터 배치 처리
   - 비동기 로딩과 스켈레톤 UI

6. **에러 처리 및 폴백**
   - API 실패 시 재시도 (최대 3회)
   - WebSocket 자동 재연결
   - 에러 로깅 및 모니터링
   - 사용자 친화적 에러 메시지
   - 절대 가짜 데이터로 폴백 금지

7. **보안 및 인증**
   - API 키 환경변수 관리
   - CORS 정책 준수
   - Rate Limiting 구현
   - SQL Injection 방지
   - XSS 방어

## 📋 페이지별 실전 동작 체크리스트

### 모든 페이지 공통 체크

- [ ] WebSocket 연결 상태 표시 (🟢 연결됨 / 🔴 끊김)
- [ ] 실시간 가격 업데이트 (1초 간격)
- [ ] 에러 발생 시 ErrorBoundary로 격리
- [ ] 로딩 중 스켈레톤 UI 표시
- [ ] 모바일 반응형 완벽 지원

### 페이지별 필수 동작 확인

**고래 추적 페이지**

- [ ] Binance WebSocket 실시간 거래 스트림
- [ ] BTC 1개 이상 거래만 표시
- [ ] 거래 타입별 색상 구분 (매수:녹색, 매도:빨강)
- [ ] 24시간 거래량 실시간 누적
- [ ] 거래 영향도 계산 (low/medium/high)

**스마트 머니 페이지**

- [ ] 기관 지갑 실시간 모니터링
- [ ] 포지션 변화 알림
- [ ] 누적 수익률 계산
- [ ] Top 10 기관 순위

**청산 맵 페이지**

- [ ] Binance Futures 실시간 청산
- [ ] 가격대별 청산 규모 히트맵
- [ ] 대규모 청산 알림 (>$1M)
- [ ] 롱/숏 청산 비율

**공포 탐욕 페이지**

- [ ] Alternative.me API 실시간 지수
- [ ] 히스토리 차트 (30일)
- [ ] 구성 요소별 분석
- [ ] 시장 단계 판단

**펀딩 비율 페이지**

- [ ] 전 거래소 펀딩 집계
- [ ] 실시간 펀딩 변화
- [ ] 차익거래 기회 표시
- [ ] 히스토리 트렌드

**차익거래 페이지**

- [ ] 멀티 거래소 가격 비교
- [ ] 수수료 포함 실제 수익률
- [ ] 거래 가능 여부 체크
- [ ] 자동 새로고침 (5초)

**DEX 플로우 페이지**

- [ ] Uniswap/PancakeSwap 실시간
- [ ] 대규모 스왑 감지 (>$100k)
- [ ] 유동성 변화 추적
- [ ] MEV 봇 활동 표시

**비정상 옵션 페이지**

- [ ] Deribit 실시간 옵션 데이터
- [ ] 대규모 포지션 변화
- [ ] 만기별 OI 분석
- [ ] IV 스큐 차트

**소셜 센티먼트 페이지**

- [ ] Twitter 실시간 멘션
- [ ] Reddit 트렌딩 분석
- [ ] 센티먼트 점수 계산
- [ ] 인플루언서 추적

**인사이더 플로우 페이지**

- [ ] 팀 지갑 모니터링
- [ ] 토큰 언락 알림
- [ ] VC 움직임 추적
- [ ] 의심스러운 활동 감지

## ⚡ Next.js Fast Refresh 실시간 반영 설정

### 🚀 Fast Refresh 작동 원리

1. **Next.js Fast Refresh** - 코드 변경 시 즉시 브라우저에 반영 (HMR: Hot Module Replacement)
   - 파일 저장 시 **1초 이내** 자동 반영
   - 컴포넌트 상태 유지하면서 UI만 업데이트
   - 에러 발생 시 즉시 브라우저에 표시
   - 수정 후 새로고침 불필요

### 🔧 개발 서버 실행 방법

```bash
# 검증 스크립트 우회하여 직접 실행 (규칙 위반이 많을 때)
cd frontend && npx next dev -H 0.0.0.0 -p 3000

# 또는 정상 실행 (규칙 검증 후)
cd frontend && npm run dev
```

### ✅ Fast Refresh 확인 방법

1. 개발 서버 실행 후 <http://localhost:3000> 접속
2. 컴포넌트 파일 수정 후 저장 (Ctrl+S)
3. 브라우저가 **자동으로 업데이트** (새로고침 없이)
4. Console에 `[Fast Refresh] done` 메시지 확인

### 📌 Fast Refresh 최적화 설정

2. **프론트엔드/백엔드 분리** - 각각 독립적으로 최적화되어 실행
   - Frontend: UI 변경사항 즉시 반영
   - Backend: API는 별도로 실행되어 프론트 변경에 영향 없음
3. **개발 서버 최적화** - npm run dev로 실행 중이라 변경사항 실시간 감지
4. **CSS 최적화** - 순수 Tailwind CSS로 스타일 처리가 빨라짐
5. **병렬 처리** - Frontend와 Backend가 동시에 독립적으로 작동

### 🛠️ 문제 해결

- **Fast Refresh 안 될 때**:
  1. 여러 개발 서버가 실행 중인지 확인: `netstat -ano | findstr :3000`
  2. 모든 Node 프로세스 종료: `taskkill /F /IM node.exe /T`
  3. 개발 서버 재시작: `cd frontend && npx next dev -p 3000`
  
- **포트 충돌 시**:
  - 다른 포트 사용: `npx next dev -p 3001`
  - 또는 기존 프로세스 종료 후 재시작

     MONSTA 프로젝트가 Next.js(최강 UI/UX) + FastAPI(Python AI/ML) 조합을 사용

## 🧩 모듈화 개발 필수 원칙 (Zero-Error Development)

**앞으로 모든 개발은 모듈화로 진행하여 에러 없는 시스템 구축**

### 1. 페이지별 완전 독립 구조

```typescript
// 각 페이지는 독립적 모듈로 개발
export default function PageModule() {
  try {
    // 페이지 로직
    return <PageComponent />
  } catch (error) {
    // 에러는 해당 페이지만 영향
    return <ErrorFallback />
  }
}
```

### 2. 에러 격리 필수 적용

- **Error Boundary**: 모든 페이지에 필수 적용
- **Try-Catch**: 모든 API 호출에 에러 처리
- **Fallback UI**: 에러 시 대체 UI 표시
- **독립 WebSocket**: 페이지별 별도 연결

### 3. 동적 임포트로 성능 최적화

```typescript
const Component = dynamic(
  () => import('./Component').catch(() => import('./ErrorFallback')),
  { loading: () => <Skeleton />, ssr: false }
)
```

### 4. 모듈별 독립 데이터 소스

- 각 모듈은 자체 API 연결
- 독립적 상태 관리 (useState, useReducer)
- 다른 모듈 의존성 최소화
- 공통 코드는 utils에만 배치

### 5. 테스트 주도 개발

```bash
# 모든 모듈은 테스트 후 배포
npm run test:module  # 모듈 단위 테스트
npm run test:e2e     # 통합 테스트
npm run lint         # 코드 품질 체크
```

### 6. 점진적 개발 프로세스

1. **단일 모듈 개발** → 테스트 → 배포
2. **에러 0개 확인** 후 다음 모듈 진행
3. **독립 배포** 가능한 구조 유지

### 7. 모듈화 체크리스트

- [ ] Error Boundary 적용
- [ ] Try-Catch 에러 처리
- [ ] 독립적 데이터 소스
- [ ] 동적 임포트 사용
- [ ] Fallback UI 구현
- [ ] 모듈 단위 테스트
- [ ] 다른 모듈 영향 없음

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
- 프론트엔드: <http://13.209.84.93:3000>
- 백엔드 API: <http://13.209.84.93:8000>
- 헬스체크: <http://13.209.84.93:8000/api/v1/health>
- GitHub Actions로 자동 배포 (master 브랜치 push 시)

## 🗄️ 데이터베이스 설정

- 개발: SQLite (frontend/prisma/dev.db)
- 프로덕션: PostgreSQL 또는 MySQL 사용
- Prisma ORM으로 데이터베이스 관리
- 마이그레이션: npx prisma migrate dev

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
4. **ComprehensiveAnalysis** - 종합 트레이딩 전략 분석 (필수)
5. **ProfitCalculator** - 수익 계산기
6. **텔레그램 연동 안내** - 구독 등급별 혜택

## 🚀 종합분석 탭 필수 구성요소 (모든 시그널 페이지)

### 1. 거래 전략 (Trading Strategy)

- **방향성 판단**: Long/Short/Neutral 자동 분석
- **신뢰도 표시**: 0-100% 신뢰도 계산
- **진입/손절/목표가**: 실시간 가격 기반 자동 계산
- **손익비**: Risk/Reward 비율 표시

### 2. 레버리지 전략 (Leverage Strategy)

- **권장 레버리지**: 시장 상황별 1-5x 자동 계산
- **최대 레버리지**: 리스크 수준별 한도 설정
- **리스크 수준**: Low/Medium/High 자동 평가
- **분석 근거**: Fear & Greed, 변동성 기반

### 3. 자본금 대비 전략 (Capital Strategy)

- **포지션 크기**: 전체 자본의 3-10% 자동 계산
- **분할 진입**: 3-5회 나누어 진입 전략
- **예비 자금**: 40-80% 리스크 대비 보유
- **복리 전략**: 수익 재투자 vs 수익 실현

### 4. 시간대별 전략 (Timeframe Strategy)

- **단기 (1-24시간)**: 스캘핑/데이트레이딩 전략
- **중기 (1-7일)**: 스윙 트레이딩 전략
- **장기 (1개월+)**: 포지션 트레이딩 전략
- **각 시간대별**: 액션, 확률, 목표가 제시

### 5. 시그널 종합 (Signal Integration)

- **기술적 시그널**: RSI, MACD, 볼린저밴드 종합
- **펀더멘털 시그널**: 온체인, 거래소 플로우
- **센티먼트 시그널**: Fear & Greed, 소셜 미디어
- **온체인 시그널**: 고래 활동, 스마트머니 동향
- **종합 점수**: -100 ~ +100 스코어링

### 6. 리스크 평가 (Risk Assessment)

- **리스크 레벨**: Low/Medium/High 자동 평가
- **리스크 점수**: 0-100점 계산
- **리스크 요인**: 시장 과열, 높은 펀딩, 고래 매도 등
- **헤지 전략**: 리스크별 대응 방안 제시

### 7. 실행 권장사항 (Action Items)

- **현재 시장 상태**: 극도의 공포/공포/중립/탐욕/극도의 탐욕
- **추천 포지션**: 구체적 진입 전략
- **최적 레버리지**: 실시간 계산값
- **자본 배분**: 구체적 % 제시
- **주의사항**: 리스크 경고 및 대응방안

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

- 역할별 접근권한: 본사/총판/대리점/구독자
- 6단계 구독 시스템: Free → Silver → Gold → Platinum → Diamond → Black

## 🔧 개발 시 주의사항

- Internal Server Error 발생 시 Prisma 재생성: npx prisma generate
- 포트 충돌 시 다른 포트 사용 (3000-3006)
- 모든 Node 프로세스 종료: taskkill /F /IM node.exe /T
- **🇰🇷 필수: 항상 한국어로 답변 (영어 사용 절대 금지)**
- **모든 커뮤니케이션은 100% 한국어로만 진행**

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

## 🔄 개발 프로세스 (필수 단계)

  1. **코드 작성 전 검증**
     - 금지 키워드 체크
     - 하드코딩 값 체크
     - API 연결 확인
  2. **기존 패턴 확인**
     - 관련 파일 Read
     - 패턴/스타일 분석
  3. **실제 데이터 연결**
     - API 엔드포인트 확인
     - DB 쿼리 작성
     - WebSocket 연결
  4. **코드 작성 후 검증**
     - 하드코딩된 값 검색: grep -r "0\." --include="*.tsx"
     - 금지 키워드 검색: grep -r "mock\|fake\|dummy" --include="*.tsx"
     - 가정 표현 검색: grep -r "가정\|임시\|예시" --include="*.tsx"
  5. **커밋 전 최종 확인**
     - 모든 숫자값이 변수/API에서 오는지 확인
     - 테스트 데이터 제거 확인
  6. **배포**
     - 커밋 메시지 한글로 명확하게
     - 푸시하면 GitHub Actions 자동 배포

## ⚡ 성능 체크리스트

- [ ] WebSocket 싱글톤 패턴 적용
- [ ] 불필요한 re-render 방지
- [ ] 이미지 lazy loading
- [ ] 코드 스플리팅 적용
- [ ] 불필요한 console.log 제거

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

## 🤖 자동 규칙 검증 시스템 (2025.09 강화)

### 🛡️ 7단계 방어 시스템 (무조건 규칙 준수)

1. **개발 시작 전 자동 검증** (`predev` hook)
   - `npm run dev` 실행 시 자동으로 검증 실행
   - 규칙 위반 시 개발 서버 시작 차단

2. **빌드 전 자동 검증** (`prebuild` hook)
   - `npm run build` 실행 시 자동 검증
   - 규칙 위반 시 빌드 차단

3. **Git 커밋 차단** (`.githooks/pre-commit`)
   - 커밋 시도 시 자동 검증
   - 규칙 위반 시 커밋 차단

4. **GitHub Actions CI/CD** (`.github/workflows/enforce-rules.yml`)
   - Push/PR 시 자동 검증
   - 규칙 위반 시 배포 차단

5. **ESLint 실시간 경고** (`.eslintrc.custom.js`)
   - IDE에서 실시간 경고 표시
   - Math.random(), mock 변수명 등 즉시 감지

6. **실시간 감시 모드** (`npm run validate:watch`)
   - 파일 변경 시 자동 검증
   - 규칙 위반 즉시 알림

7. **강력한 검증 스크립트** (`scripts/enforce-no-fake-data.js`)
   - 모든 금지 패턴 자동 감지
   - 라인별 상세 에러 리포트

### 📋 검증 명령어

```bash
# 기본 검증
npm run validate:strict    # 엄격한 검증 (Math.random 등)
npm run validate:all       # 전체 검증 (ESLint + TypeScript + 규칙)

# 개발/빌드 (자동 검증 포함)
npm run dev               # 개발 시작 (검증 후 실행)
npm run build             # 빌드 (검증 후 빌드)

# 우회 명령어 (긴급 시에만)
npm run dev:unsafe        # 검증 없이 개발 실행 (절대 권장 안함)
npm run build:unsafe      # 검증 없이 빌드 (절대 권장 안함)

# 검사 도구
npm run check:random      # Math.random 사용 카운트
npm run detect:mock       # Mock 데이터 감지
```

### ⚠️ 위반 시 차단되는 것들

- ❌ `npm run dev` 실행 불가
- ❌ `npm run build` 실행 불가  
- ❌ `git commit` 불가
- ❌ GitHub PR/Push 불가
- ❌ 자동 배포 차단

### 🔥 규칙 위반 해결 방법

1. **Math.random() 발견 시**

   ```typescript
   // ❌ 잘못된 코드
   const value = Math.random() * 100
   
   // ✅ 올바른 코드
   const response = await fetch('/api/market-data')
   const { value } = await response.json()
   ```

2. **Mock/Fake 데이터 발견 시**

   ```typescript
   // ❌ 잘못된 코드
   const mockData = [{...}]
   
   // ✅ 올바른 코드
   const data = await prisma.transaction.findMany()
   ```

3. **하드코딩 값 발견 시**

   ```typescript
   // ❌ 잘못된 코드
   const fee = price * 0.1
   
   // ✅ 올바른 코드
   const { feeRate } = await getConfig()
   const fee = price * feeRate
   ```

## 🛡️ 에러 처리 표준

### 모든 컴포넌트는 에러 경계로 보호

```typescript
// 필수: 에러 시 기본값 설정
catch (error) {
  console.error('모듈명:', error)
  // 반드시 기본값으로 폴백
  setData(defaultValues)
  setLoading(false)
}
```

- ErrorBoundary로 모듈별 격리
- 한 모듈 오류가 전체 앱을 중단시키지 않음

## 📊 실시간 데이터 원칙

- **WebSocket 우선**: 실시간 데이터는 무조건 WebSocket
- **Binance WebSocket**: wss://stream.binance.com:9443/ws
- **폴링 금지**: setInterval 대신 WebSocket 사용
- **재연결 로직 필수**: 최대 5회 자동 재연결

## 🧩 모듈화 아키텍처 원칙

### 각 페이지는 독립 모듈로 구성

- WhaleTrackerModule, SmartMoneyModule 등
- 모듈별 독립 WebSocket 연결
- 모듈별 에러 격리 (ErrorBoundary)
- 모듈 간 의존성 최소화
- lib/moduleUtils.ts 활용

## 🔌 WebSocket 다중 심볼 처리 필수 규칙

### 심볼 전환 시 필수 구현

```typescript
// 1. 기존 연결 완전 종료
if (wsRef.current) {
  wsRef.current.close(1000)
  wsRef.current = null
}

// 2. 연결 지연 적용 (빠른 전환 방지)
clearTimeout(connectionDelayRef.current)
connectionDelayRef.current = setTimeout(() => {
  connectWebSocket(newSymbol)
}, 500)

// 3. 심볼별 초기값 설정
const initialPrices = {
  'BTCUSDT': 98000,
  'ETHUSDT': 3500,
  'BNBUSDT': 700
}
setCurrentPrice(initialPrices[newSymbol])
```

## ⚛️ React Hook 규칙 - 절대 위반 금지

```typescript
// ❌ 절대 금지 - IIFE 내부 useState
{(() => {
  const [filter, setFilter] = useState('all') // 에러!
})()}

// ✅ 필수 - 컴포넌트 최상위 레벨
const Component = () => {
  const [filter, setFilter] = useState('all')
  const [historyFilter, setHistoryFilter] = useState('all')
  // 모든 state는 여기에
}
```

## 📊 차트 구현 체크리스트

- **ResponsiveContainer**: width="100%" height={400} (숫자 또는 문자열만)
- **Binance API 심볼**: BTCUSDT 형식 (USDT 포함 필수)
- **초기 데이터 로드**: /api/binance/klines 프록시 사용
- **SVG viewBox**: "0 0 100 100" preserveAspectRatio="none"

## 💾 심볼별 데이터 영속성 패턴

```typescript
// 코인 전환 시에도 데이터 유지
const [transactionsBySymbol, setTransactionsBySymbol] = useState<Record<string, Transaction[]>>({
  'BTCUSDT': [],
  'ETHUSDT': [],
  // 각 심볼별 저장
})

// 심볼 전환 시 복원
useEffect(() => {
  setTransactions(transactionsBySymbol[selectedSymbol] || [])
}, [selectedSymbol])
```

## 🎨 재사용 가능 트레이딩 컴포넌트

### 공통 컴포넌트 위치: `/frontend/components/signals/`

- `TabGuide`: 탭별 트레이딩 가이드
- `SystemOverview`: 시스템 개요 설명
- `SimplePriceChart`: 실시간 가격 차트
- `ComprehensiveAnalysis`: AI 종합 분석

### 사용 예시

```typescript
import TabGuide, { tabGuides } from '@/components/signals/TabGuide'
import SystemOverview, { whaleTrackingOverview } from '@/components/signals/SystemOverview'

<TabGuide {...tabGuides.wallets} />
<SystemOverview {...whaleTrackingOverview} />
```

- Glassnode/CryptoQuant (온체인)
- Alternative.me (Fear & Greed)

  2. 페이지 필수 구성요소

- MarketAnalysis (AI 종합분석)
- PriceChart (실시간 차트)
- 전략별 컴포넌트
- ProfitCalculator
- 텔레그램 연동 안내

  3. 차트 라이브러리 사용

- recharts (기본)
- chart.js (고급)
- lightweight-charts (트레이딩뷰)

  4. 모바일 최적화

- 스와이프 제스처
- 터치 친화적 UI
- 반응형 차트

  5. 구독 등급별 차등화

- Starter: 지연 데이터
- Platinum: 실시간
- Infinity: VIP 전용

## 🔌 데이터 서비스 아키텍처 (2025.09 업데이트)

### 최적화된 하이브리드 데이터 서비스 구조

- **Binance WebSocket**: 실시간 가격 스트리밍 (무료, 무제한)
- **CryptoCompare API**: 뉴스/소셜 데이터 (무료, 월 100,000 호출)
- **Alternative.me**: Fear & Greed Index (무료)
- **캐싱 전략**: NodeCache 30초 TTL로 API 호출 90% 감소

### API 키 설정

```bash
# .env.local
NEXT_PUBLIC_CRYPTOCOMPARE_API_KEY=57f89e8ea43da615e49a75d31d9e64742063d53553dc16bb7b832a8ea359422b
CRYPTOCOMPARE_API_KEY=57f89e8ea43da615e49a75d31d9e64742063d53553dc16bb7b832a8ea359422b
CRYPTOCOMPARE_BASE_URL=https://min-api.cryptocompare.com
```

### 데이터 서비스 사용법

```typescript
import { dataService } from '@/lib/services/finalDataService'
import { useRealtimePrice } from '@/lib/hooks/useRealtimePrice'

// 실시간 가격 구독
const { price, change24h, isConnected } = useRealtimePrice('BTCUSDT')

// WebSocket 직접 사용
dataService.subscribeToPrice('BTCUSDT', (data) => {
  console.log('실시간 가격:', data.price)
})

// 뉴스 데이터 (캐싱됨)
const news = await dataService.getNews(['BTC'])
```

## ⚡ API Rate Limit 방지 전략

### 문제

- Binance API: 분당 1200 요청 제한
- 다수 페이지 동시 접속 시 429 에러 발생

### 해결책

1. **WebSocket 우선**: REST API 대신 WebSocket 스트리밍 사용
2. **캐싱 레이어**: 30초 TTL로 중복 요청 방지
3. **Rate Limiter**: 초당 10 요청으로 제한
4. **연결 풀링**: WebSocket 연결 재사용

### 마이그레이션 도구

```bash
# 기존 Binance API 코드를 자동으로 최적화 서비스로 교체
node scripts/migrate-to-optimized-api.js
```

## 📊 주요 데이터 서비스 파일

- `/lib/services/finalDataService.ts` - 통합 데이터 서비스
- `/lib/services/optimizedDataService.ts` - 최적화 구현
- `/lib/hooks/useRealtimePrice.ts` - 실시간 가격 훅
- `/lib/hooks/useOptimizedMarketData.ts` - 최적화된 마켓 데이터 훅
- `/lib/services/migrationHelper.ts` - 마이그레이션 헬퍼

## 🚨 자주 발생하는 프로덕션 에러 패턴과 해결법

### 1. undefined 변수 에러 패턴

```typescript
// ❌ 에러 발생 패턴
"ilRisk is not defined"
"price is not defined"
"slippage is not defined"

// ✅ 해결 방법
// 1. Optional Chaining 사용
${safeFixed(orderbook?.spread, 2)}

// 2. 기본값 설정
const price = data?.price || 0

// 3. 안전한 접근
${safeFixed(depthLevels?.find(l => l.percentage === selectedPercentage)?.bidPrice, 2)}
```

### 2. safeFixed 함수 사용 패턴

```typescript
// ❌ 잘못된 사용 (메서드로 호출)
${object?.safeFixed(property, 2)}

// ✅ 올바른 사용 (함수로 호출)
${safeFixed(object?.property, 2)}
```

### 3. API 응답 구조 불일치

```typescript
// ❌ 배열 기대하지만 객체 수신
const klines = result // 객체
klines.slice(-50) // 에러!

// ✅ 안전한 처리
const klines = result.data || result.klines || []
const recentKlines = Array.isArray(klines) ? klines.slice(-50) : []
```

## 📊 API 제공업체 선택 가이드

### 최종 선택: 하이브리드 구조

```
Binance WebSocket (무료) + CryptoCompare Free (무료) = 완벽한 솔루션
- 실시간 가격: Binance WebSocket
- 뉴스/소셜: CryptoCompare
- 공포탐욕지수: Alternative.me
- 총 비용: $0/월
```

## 🎯 프로덕션 운영 노하우

### 서버 다운 시 긴급 복구

```bash
# SSH 접속
ssh -i monsta-key.pem ubuntu@13.209.84.93

# 프로세스 확인
pm2 list

# 재시작
cd ~/monstas7/frontend
npm run build
pm2 restart monsta-prod

# 로그 확인
pm2 logs monsta-prod --lines 100
```

## 🔍 트러블슈팅 가이드

### 문제: "페이지가 작동하지 않습니다. ERR_EMPTY_RESPONSE"

```bash
# 원인: 코드 문법 에러로 서버 크래시
# 해결:
1. 에러 파일 찾기: grep -r "unexpected token" 
2. 문법 수정 (주로 중괄호 불일치)
3. 빌드 & 재시작: npm run build && pm2 restart
```

### 문제: "WebSocket 연결 실패"

```javascript
// 원인: 너무 많은 동시 연결
// 해결: 연결 지연 및 재사용
setTimeout(() => {
  connectWebSocket(symbol)
}, delay * 100) // 심볼별 100ms 간격
```

### 문제: "캐시 데이터 오래됨"

```javascript
// 해결: TTL 동적 조정
const getTTL = (dataType) => {
  switch(dataType) {
    case 'price': return 30 // 30초
    case 'news': return 3600 // 1시간
    default: return 60
  }
}
```



  📋 수정된 추천안

  // 1. CryptoCompare (메인 데이터)
  - 무료: 월 100,000 호출
  - 실시간 가격, 오더북, 거래량
  - 뉴스, 소셜 데이터 포함
  - WebSocket 실시간 스트리밍

  // 2. Binance WebSocket (실시간 보조)
  - 무료, 무제한
  - 초단위 가격 업데이트
  - 오더북 실시간 변화

  // 3. Alternative.me (공포탐욕지수)
  - 무료 API
  - Fear & Greed Index
  