# 📝 MONSTA 페이지별 상세 기획서

## 🎯 우선순위 TOP 15 페이지 상세 기획

### 1. 시그널 대시보드 (/signals/dashboard)
**목적**: AI 시그널의 중앙 허브, 실시간 시그널 제공 및 성과 추적

#### 주요 기능
- [ ] 7개 AI 모델 종합 신호 표시
- [ ] 신뢰도별 시그널 분류 (70-95%)
- [ ] 실시간 시그널 성과 추적
- [ ] 원클릭 실행 버튼
- [ ] 시그널 히스토리

#### UI 컴포넌트
```typescript
- SignalCard: 개별 시그널 카드
- ConfidenceBar: 신뢰도 표시 바
- PerformanceChart: 성과 차트
- QuickExecute: 빠른 실행 버튼
- SignalHistory: 과거 시그널 테이블
```

#### 데이터 요구사항
- WebSocket: 실시간 시그널 스트리밍
- API: GET /api/signals/latest
- API: GET /api/signals/performance
- Cache: Redis 5초 캐싱

#### 접근 권한
- FREE: 1일 1개, 24시간 지연
- SILVER: 1일 3개, 1시간 지연
- GOLD+: 실시간 무제한

---

### 2. 실시간 차트 (/trading/chart)
**목적**: 전문 트레이딩 차트 제공

#### 주요 기능
- [ ] TradingView 위젯 통합
- [ ] 다중 시간대 지원
- [ ] 100+ 기술 지표
- [ ] 드로잉 도구
- [ ] 멀티 차트 레이아웃

#### UI 컴포넌트
```typescript
- TradingViewWidget: 차트 위젯
- IndicatorPanel: 지표 패널
- DrawingTools: 드로잉 도구
- TimeframeSelector: 시간대 선택
- LayoutManager: 레이아웃 관리
```

#### 데이터 요구사항
- WebSocket: 실시간 가격 데이터
- API: GET /api/ohlcv/:symbol/:timeframe
- API: GET /api/indicators/:symbol
- TradingView Datafeed

#### 접근 권한
- FREE: 1분, 5분 차트만
- SILVER: 모든 시간대
- GOLD+: 고급 지표 포함

---

### 3. 포트폴리오 관리 (/portfolio/overview)
**목적**: 사용자 자산 통합 관리 및 분석

#### 주요 기능
- [ ] 실시간 포트폴리오 가치
- [ ] 손익 계산 (PnL)
- [ ] 자산 배분 차트
- [ ] 성과 분석
- [ ] 거래 내역

#### UI 컴포넌트
```typescript
- PortfolioSummary: 요약 카드
- AssetAllocation: 자산 배분 파이차트
- PnLChart: 손익 차트
- HoldingsTable: 보유 자산 테이블
- TransactionHistory: 거래 내역
```

#### 데이터 요구사항
- API: GET /api/portfolio/:userId
- API: POST /api/portfolio/transaction
- WebSocket: 실시간 가격 업데이트
- PostgreSQL: 거래 내역 저장

#### 접근 권한
- FREE: 읽기 전용
- SILVER: 5개 포트폴리오
- GOLD+: 무제한

---

### 4. AI 예측 시그널 (/ai/prediction)
**목적**: AI 모델의 가격 예측 제공

#### 주요 기능
- [ ] 단기/중기/장기 예측
- [ ] 예측 신뢰도 표시
- [ ] 시나리오별 분석
- [ ] 백테스팅 결과
- [ ] 예측 근거 설명

#### UI 컴포넌트
```typescript
- PredictionChart: 예측 차트
- ConfidenceGauge: 신뢰도 게이지
- ScenarioAnalysis: 시나리오 분석
- BacktestResults: 백테스트 결과
- ExplanationCard: 설명 카드
```

#### 데이터 요구사항
- API: GET /api/ai/prediction/:symbol
- API: GET /api/ai/backtest/:modelId
- ML Model API: TensorFlow Serving
- 실시간 모델 업데이트

#### 접근 권한
- GOLD: 기본 예측
- PLATINUM: 고급 예측
- DIAMOND+: 모든 모델

---

### 5. 자동매매 봇 (/automation/bot-create)
**목적**: 자동매매 봇 생성 및 관리

#### 주요 기능
- [ ] 봇 템플릿 선택
- [ ] 전략 파라미터 설정
- [ ] 백테스팅
- [ ] 실시간 성과 모니터링
- [ ] 리스크 관리 설정

#### UI 컴포넌트
```typescript
- BotWizard: 봇 생성 마법사
- StrategyBuilder: 전략 빌더
- BacktestEngine: 백테스트 엔진
- PerformanceMonitor: 성과 모니터
- RiskControls: 리스크 컨트롤
```

#### 데이터 요구사항
- API: POST /api/bot/create
- API: GET /api/bot/:botId/performance
- WebSocket: 봇 상태 실시간 업데이트
- Queue: Celery 작업 큐

#### 접근 권한
- GOLD: 1개 봇
- PLATINUM: 3개 봇
- DIAMOND: 10개 봇
- BLACK: 무제한

---

### 6. 회원가입/로그인 (/auth/signup)
**목적**: 사용자 인증 및 계정 생성

#### 주요 기능
- [ ] 이메일/소셜 로그인
- [ ] 2단계 인증 (2FA)
- [ ] KYC 인증
- [ ] 추천인 코드
- [ ] 약관 동의

#### UI 컴포넌트
```typescript
- SignupForm: 회원가입 폼
- LoginForm: 로그인 폼
- SocialAuth: 소셜 로그인 버튼
- TwoFactorAuth: 2FA 입력
- KYCUpload: KYC 서류 업로드
```

#### 데이터 요구사항
- API: POST /api/auth/signup
- API: POST /api/auth/login
- JWT 토큰 관리
- Session 관리

#### 접근 권한
- PUBLIC: 모두 접근 가능

---

### 7. 구독 결제 (/payment/subscription)
**목적**: 구독 플랜 선택 및 결제

#### 주요 기능
- [ ] 6단계 플랜 비교
- [ ] 결제 수단 선택
- [ ] 프로모션 코드
- [ ] 자동 갱신 설정
- [ ] 결제 내역

#### UI 컴포넌트
```typescript
- PricingTable: 가격표
- PaymentForm: 결제 폼
- PlanComparison: 플랜 비교
- PromoCode: 프로모션 입력
- BillingHistory: 결제 내역
```

#### 데이터 요구사항
- Stripe API 연동
- API: POST /api/payment/subscribe
- API: GET /api/payment/history
- Webhook: 결제 상태 업데이트

#### 접근 권한
- FREE: 업그레이드 유도
- ALL: 플랜 변경 가능

---

### 8. 실시간 뉴스 (/news/realtime)
**목적**: 시장 영향 뉴스 실시간 제공

#### 주요 기능
- [ ] AI 중요도 분류
- [ ] 감성 분석
- [ ] 가격 영향 예측
- [ ] 뉴스 필터링
- [ ] 북마크 기능

#### UI 컴포넌트
```typescript
- NewsFeed: 뉴스 피드
- SentimentIndicator: 감성 지표
- ImpactAnalysis: 영향 분석
- NewsFilter: 필터 패널
- BookmarkManager: 북마크 관리
```

#### 데이터 요구사항
- API: GET /api/news/latest
- WebSocket: 실시간 뉴스 스트림
- NLP API: 감성 분석
- RSS/API: 뉴스 소스 연동

#### 접근 권한
- FREE: 기본 뉴스
- SILVER+: AI 분석 포함

---

### 9. 커뮤니티 포럼 (/community/forum)
**목적**: 사용자간 정보 공유 및 토론

#### 주요 기능
- [ ] 게시글 작성/댓글
- [ ] 투표/설문
- [ ] 시그널 공유
- [ ] 전문가 인증
- [ ] 보상 시스템

#### UI 컴포넌트
```typescript
- ForumList: 포럼 목록
- PostEditor: 게시글 에디터
- CommentSection: 댓글 섹션
- VotingSystem: 투표 시스템
- RewardBadges: 보상 뱃지
```

#### 데이터 요구사항
- API: GET/POST /api/forum
- PostgreSQL: 게시글 저장
- Redis: 조회수 캐싱
- 실시간 댓글 알림

#### 접근 권한
- FREE: 읽기 전용
- SILVER+: 작성 가능

---

### 10. 리더보드 (/gaming/leaderboard)
**목적**: 트레이더 순위 및 경쟁 유도

#### 주요 기능
- [ ] 실시간 순위
- [ ] 수익률 랭킹
- [ ] 시즌별 리셋
- [ ] 보상 지급
- [ ] 프로필 공개

#### UI 컴포넌트
```typescript
- RankingTable: 순위 테이블
- UserStats: 사용자 통계
- SeasonTimer: 시즌 타이머
- RewardDisplay: 보상 표시
- ProfileCard: 프로필 카드
```

#### 데이터 요구사항
- API: GET /api/leaderboard
- Redis: 실시간 순위 캐싱
- Cron: 시즌 리셋
- 보상 지급 시스템

#### 접근 권한
- FREE: 조회 가능
- SILVER+: 참여 가능

---

### 11. 백테스팅 (/automation/backtest)
**목적**: 전략 과거 성과 검증

#### 주요 기능
- [ ] 전략 코드 에디터
- [ ] 히스토리 데이터 선택
- [ ] 성과 지표 분석
- [ ] 최적화 도구
- [ ] 리포트 생성

#### UI 컴포넌트
```typescript
- StrategyEditor: 전략 에디터
- DateRangePicker: 기간 선택
- BacktestResults: 결과 분석
- OptimizationTool: 최적화 도구
- ReportGenerator: 리포트 생성
```

#### 데이터 요구사항
- Historical Data API
- Python Backtesting Engine
- Queue: 백테스트 작업
- S3: 결과 저장

#### 접근 권한
- GOLD: 기본 백테스트
- PLATINUM+: 고급 기능

---

### 12. 가격 알림 (/notifications/price-alerts)
**목적**: 목표가 도달 시 알림

#### 주요 기능
- [ ] 다중 조건 설정
- [ ] 알림 채널 선택
- [ ] 알림 히스토리
- [ ] 스마트 알림
- [ ] 일괄 관리

#### UI 컴포넌트
```typescript
- AlertBuilder: 알림 빌더
- ChannelSelector: 채널 선택
- AlertHistory: 알림 내역
- SmartAlerts: 스마트 알림
- BulkManager: 일괄 관리
```

#### 데이터 요구사항
- API: POST /api/alerts/create
- WebSocket: 실시간 가격 체크
- Push Notification Service
- Telegram Bot API

#### 접근 권한
- FREE: 5개 알림
- SILVER: 20개
- GOLD+: 무제한

---

### 13. 온체인 분석 (/crypto/onchain)
**목적**: 블록체인 데이터 분석

#### 주요 기능
- [ ] 고래 움직임 추적
- [ ] 거래소 유입/유출
- [ ] 네트워크 활동
- [ ] 스마트머니 추적
- [ ] DeFi TVL

#### UI 컴포넌트
```typescript
- WhaleTracker: 고래 추적기
- ExchangeFlow: 거래소 플로우
- NetworkMetrics: 네트워크 지표
- SmartMoneyFlow: 스마트머니
- DeFiDashboard: DeFi 대시보드
```

#### 데이터 요구사항
- Blockchain API (Etherscan, etc)
- Graph Protocol
- Dune Analytics API
- Glassnode API

#### 접근 권한
- GOLD: 기본 데이터
- PLATINUM+: 고급 분석

---

### 14. 교육 센터 (/education/beginner)
**목적**: 트레이딩 교육 제공

#### 주요 기능
- [ ] 단계별 커리큘럼
- [ ] 비디오 강의
- [ ] 퀴즈/테스트
- [ ] 수료증 발급
- [ ] 1:1 멘토링

#### UI 컴포넌트
```typescript
- CourseList: 코스 목록
- VideoPlayer: 비디오 플레이어
- QuizSystem: 퀴즈 시스템
- ProgressTracker: 진도 추적
- CertificateGen: 수료증 생성
```

#### 데이터 요구사항
- Video Streaming CDN
- API: GET /api/courses
- Progress Tracking DB
- Certificate Generation

#### 접근 권한
- FREE: 기초 과정
- SILVER: 중급 과정
- GOLD+: 전체 과정

---

### 15. 시스템 설정 (/account/settings)
**목적**: 개인 설정 관리

#### 주요 기능
- [ ] 프로필 편집
- [ ] 보안 설정
- [ ] 알림 설정
- [ ] API 키 관리
- [ ] 테마 설정

#### UI 컴포넌트
```typescript
- ProfileEditor: 프로필 편집
- SecuritySettings: 보안 설정
- NotificationPrefs: 알림 설정
- APIKeyManager: API 키 관리
- ThemeSelector: 테마 선택
```

#### 데이터 요구사항
- API: PUT /api/user/settings
- localStorage: 테마 저장
- 2FA 설정
- API 키 생성/관리

#### 접근 권한
- ALL: 모든 사용자

---

## 📋 추가 35개 페이지 요약 (Phase 2)

### 16-20: AI & 분석
16. /ai/sentiment - 감성 분석
17. /ai/pattern-recognition - 패턴 인식
18. /ai/gpt-assistant - GPT 어시스턴트
19. /technical/indicators - 기술 지표
20. /technical/patterns - 차트 패턴

### 21-25: 자동화 & 봇
21. /automation/grid-bot - 그리드 봇
22. /automation/dca-bot - DCA 봇
23. /automation/strategy-builder - 전략 빌더
24. /automation/performance - 성과 모니터링
25. /automation/bot-marketplace - 봇 마켓플레이스

### 26-30: 커뮤니티 & 소셜
26. /community/chat - 실시간 채팅
27. /social/copy-traders - 카피 트레이딩
28. /social/signals-rating - 시그널 평가
29. /community/mentoring - 멘토링
30. /social/feed - 소셜 피드

### 31-35: 시장 데이터
31. /crypto/defi-monitor - DeFi 모니터
32. /crypto/nft-tracker - NFT 트래커
33. /macro/indicators - 경제 지표
34. /events/calendar - 이벤트 캘린더
35. /events/airdrops - 에어드랍

### 36-40: 리스크 & 포트폴리오
36. /risk/calculator - 포지션 계산기
37. /risk/stop-loss - 손절 설정
38. /portfolio/analytics - 포트폴리오 분석
39. /portfolio/rebalancing - 리밸런싱
40. /portfolio/tax-report - 세금 리포트

### 41-45: 게임화
41. /gaming/trading-battle - 트레이딩 배틀
42. /gaming/achievements - 업적 시스템
43. /gaming/rewards - 리워드 센터
44. /gaming/daily-quest - 일일 퀘스트
45. /gaming/season-pass - 시즌 패스

### 46-50: 고급 기능
46. /quant/arbitrage - 차익거래
47. /microstructure/order-book - 오더북 분석
48. /telegram/bot-setup - 텔레그램 봇
49. /api/documentation - API 문서
50. /admin/dashboard - 관리자 대시보드

## 🔧 공통 컴포넌트 라이브러리

### 데이터 시각화
```typescript
- PriceChart: 가격 차트
- CandlestickChart: 캔들스틱 차트
- LineChart: 라인 차트
- AreaChart: 영역 차트
- PieChart: 파이 차트
- HeatMap: 히트맵
```

### UI 컴포넌트
```typescript
- Card: 카드 컴포넌트
- Table: 테이블 컴포넌트
- Modal: 모달 다이얼로그
- Tabs: 탭 컴포넌트
- Dropdown: 드롭다운 메뉴
- Toast: 토스트 알림
```

### 폼 컴포넌트
```typescript
- Input: 입력 필드
- Select: 선택 박스
- DatePicker: 날짜 선택
- RangeSlider: 범위 슬라이더
- Toggle: 토글 스위치
- FileUpload: 파일 업로드
```

### 특수 컴포넌트
```typescript
- TradingWidget: 거래 위젯
- SignalCard: 시그널 카드
- StrategyBuilder: 전략 빌더
- BacktestEngine: 백테스트 엔진
- PortfolioTracker: 포트폴리오 추적기
```

## 📈 구현 우선순위 매트릭스

| 우선순위 | 영향도 | 복잡도 | 페이지 |
|---------|--------|--------|--------|
| P0 | 높음 | 낮음 | 로그인, 회원가입, 설정 |
| P1 | 높음 | 중간 | 시그널 대시보드, 차트, 포트폴리오 |
| P2 | 높음 | 높음 | AI 예측, 자동매매, 백테스팅 |
| P3 | 중간 | 중간 | 커뮤니티, 교육, 뉴스 |
| P4 | 중간 | 높음 | 온체인, 퀀트, 마이크로구조 |
| P5 | 낮음 | 낮음 | 게임화, 소셜, 이벤트 |

---

*최종 업데이트: 2025.01.05*
*총 페이지 수: 250개*
*상세 기획 완료: 50개*