# 📰 뉴스 페이지 종합 개발 계획서

## 🎯 프로젝트 개요
7개 핵심 뉴스 페이지를 전문 분석 시스템으로 완전 재구축

### 📋 개발 대상 페이지
1. **AI 요약** (/news/ai-summary) - Explainable AI 기반 신뢰도 높은 뉴스 브리핑
2. **리서치 보고서** (/news/research) - 기관급 심층 분석 & TVL/온체인 메트릭
3. **감성 분석** (/news/sentiment) - 멀티소스 감성 점수 & FUD/FOMO 지표
4. **시장 분석** (/news/analysis) - 섹터별 전문가 분석 (DeFi, NFT, Layer2)
5. **파트너십** (/news/partnerships) - 네트워크 그래프 & 영향도 자동 계산
6. **규제 뉴스** (/news/regulation) - 국가별 규제 맵 & 다국어 지원
7. **해킹 알림** (/news/hacks) - Certik/Chainalysis API 연동 리스크 모니터링

## 🏗️ 기술 아키텍처

### 📁 디렉토리 구조
```
/frontend/
├── app/news/
│   ├── ai-summary/
│   │   ├── page.tsx
│   │   ├── AISummaryModule.tsx
│   │   └── components/
│   ├── research/
│   │   ├── page.tsx
│   │   ├── ResearchModule.tsx
│   │   └── components/
│   └── [기타 페이지들...]
├── lib/
│   ├── services/
│   │   ├── newsDataService.ts
│   │   ├── sentimentAnalyzer.ts
│   │   └── explainableAI.ts
│   └── components/
│       ├── news/
│       │   ├── CoinSelector.tsx
│       │   ├── NewsCard.tsx
│       │   └── TradingSignal.tsx
│       └── charts/
│           ├── SentimentGauge.tsx
│           ├── NetworkGraph.tsx
│           └── HeatMap.tsx
```

### 💻 기술 스택
- **Frontend**: Next.js 15.5, React 18, TypeScript
- **스타일링**: Tailwind CSS, Framer Motion
- **차트**: Recharts, Lightweight Charts, D3.js
- **실시간 데이터**: WebSocket, Server-Sent Events
- **상태 관리**: React Hooks, Context API
- **API 통합**:
  - Binance WebSocket (실시간 가격)
  - CryptoCompare API (뉴스/소셜)
  - Alternative.me (Fear & Greed)
  - Certik/Chainalysis (보안)

## 📊 Phase별 구현 계획

### Phase 1: 인프라 구축 (2일)

#### 1.1 데이터 정제 파이프라인
- 중복 제거 알고리즘 (Cosine Similarity)
- 신뢰도 스코어링 시스템 (0-100)
- Fallback API 체인 구현
- 팩트 체킹 모듈

#### 1.2 WebSocket Manager 안정화
- 자동 재연결 로직 (최대 5회)
- 연결 상태 모니터링
- 메시지 큐잉 시스템
- 에러 핸들링

#### 1.3 Rate Limiter & Circuit Breaker
- API 호출 제한 관리
- 큐잉 시스템
- Circuit Breaker 패턴
- 장애 격리

#### 1.4 공통 컴포넌트 개발
- CoinSelector (technical/indicators 스타일)
- NewsCard (확장 가능한 카드)
- SentimentGauge (감성 게이지)
- TradingSignal (시그널 표시)

### Phase 2: AI 시스템 구현 (2일)

#### 2.1 Explainable AI 모듈
- Confidence Score 계산
- 근거 문장 하이라이트
- 출처 추적 시스템
- 반박 의견 제공

#### 2.2 AI 요약 페이지
**핵심 기능:**
- GPT-4 기반 실시간 요약
- 10개 코인별 맞춤 분석
- 영향도 예측 (상승/하락/중립)
- 신뢰도 점수 표시

**차트 구현 (15개):**
1. 실시간 가격 차트 (TradingView)
2. 뉴스 빈도 히트맵
3. 감성 트렌드 라인
4. 키워드 워드클라우드
5. 영향도 점수 게이지
6. 소스별 신뢰도 바
7. 시간대별 뉴스 분포
8. 코인별 언급 빈도
9. AI 예측 정확도 추이
10. 상관관계 매트릭스
11. 뉴스 카테고리 분포
12. 실시간 알림 타임라인
13. 소셜 미디어 언급량
14. 가격 변동 예측 차트
15. 종합 대시보드

#### 2.3 감성 분석 페이지
**핵심 기능:**
- Twitter, Reddit, Discord 통합
- Fear & Greed Index 실시간
- 7가지 감정 분류
- FUD/FOMO 경고 시스템

**차트 구현 (10개):**
1. 감성 게이지 (공포-탐욕)
2. 소셜 볼륨 차트
3. 감정별 분포 도넛차트
4. 워드클라우드 (실시간)
5. 인플루언서 센티멘트
6. 커뮤니티별 감성 비교
7. FUD/FOMO 타임라인
8. 감성 변화율 스파크라인
9. 예측 vs 실제 감성
10. 감성-가격 상관관계

### Phase 3: 분석 시스템 (2일)

#### 3.1 리서치 보고서 페이지
**핵심 기능:**
- Messari, Glassnode 통합
- 토크노믹스 자동 분석
- TVL & 온체인 메트릭
- 밸류에이션 모델

**차트 구현 (10개):**
1. TVL 추이 차트
2. 온체인 활동 지표
3. 토큰 분배 파이차트
4. 밸류에이션 컴패리슨
5. 개발 활동 그래프
6. 홀더 분포도
7. 유동성 풀 현황
8. 프로토콜 수익 차트
9. 경쟁사 비교 매트릭스
10. 성장률 예측 모델

#### 3.2 시장 분석 페이지
**핵심 기능:**
- 전문가 의견 AI 종합
- 섹터별 분석 (DeFi, NFT, L2)
- 시장 사이클 포지션
- 매매 전략 자동 생성

**차트 구현 (10개):**
1. 시장 사이클 위치
2. 섹터 로테이션 맵
3. 볼륨 프로파일
4. 지지/저항 레벨
5. 상관관계 히트맵
6. 변동성 콘
7. 시장 깊이 차트
8. 펀딩 레이트 추이
9. 옵션 스큐
10. 리스크/리워드 매트릭스

### Phase 4: 네트워크 & 규제 (1일)

#### 4.1 파트너십 페이지
**핵심 기능:**
- 실시간 파트너십 추적
- 네트워크 효과 계산
- 생태계 확장 지표
- M&A 가능성 예측

**차트 구현 (10개):**
1. 네트워크 그래프 (3D)
2. 파트너십 타임라인
3. 영향력 점수 바
4. 생태계 성장 차트
5. 협력 밀도 히트맵
6. 산업별 분포도
7. 지역별 파트너 맵
8. 기술 스택 호환성
9. 시너지 효과 계산
10. 경쟁사 네트워크 비교

#### 4.2 규제 뉴스 페이지
**핵심 기능:**
- 국가별 규제 추적
- 정책 영향도 평가
- 컴플라이언스 체크
- 다국어 번역 (5개국어)

**차트 구현 (10개):**
1. 글로벌 규제 맵
2. 규제 타임라인
3. 영향도 매트릭스
4. 국가별 친화도 점수
5. 정책 변화 추이
6. 규제 리스크 히트맵
7. 컴플라이언스 대시보드
8. 벌금/제재 통계
9. 입법 진행 상황
10. 산업별 규제 비교

### Phase 5: 보안 & 최적화 (1일)

#### 5.1 해킹 알림 페이지
**핵심 기능:**
- Certik, Chainalysis API 연동
- 실시간 취약점 스캐닝
- 손실 규모 자동 계산
- 보안 점수 업데이트

**차트 구현 (10개):**
1. 보안 사고 타임라인
2. 손실 규모 바차트
3. 프로토콜별 리스크 맵
4. 해킹 유형 분포
5. 복구율 통계
6. 취약점 트렌드
7. 보안 감사 현황
8. TVL 대비 손실률
9. 체인별 사고 빈도
10. 보안 점수 랭킹

#### 5.2 성능 최적화
- 코드 스플리팅
- Lazy Loading
- 이미지 최적화
- 캐싱 전략
- 번들 사이즈 최적화

## 🎨 UI/UX 디자인 가이드

### 디자인 원칙
- **모바일 우선**: 터치 친화적 인터페이스
- **다크 테마**: technical/indicators 스타일 적용
- **반응형**: 모든 디바이스 지원
- **접근성**: WCAG 2.1 AA 준수

### 컴포넌트 스타일
```css
/* 기본 색상 팔레트 */
--primary: #8B5CF6 (보라색)
--success: #10B981 (녹색)
--danger: #EF4444 (빨간색)
--warning: #F59E0B (노란색)
--info: #3B82F6 (파란색)

/* 배경 그라데이션 */
background: linear-gradient(to br, from-gray-900, via-black, to-gray-900)

/* 카드 스타일 */
bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700
```

## 📈 트레이딩 전략 제공

### 각 페이지별 전략
1. **AI 요약**: 뉴스 기반 단기 트레이딩
2. **리서치**: 펀더멘털 기반 장기 투자
3. **감성 분석**: 역발상 트레이딩
4. **시장 분석**: 섹터 로테이션 전략
5. **파트너십**: 이벤트 기반 트레이딩
6. **규제**: 리스크 헤지 전략
7. **해킹**: 보안 리스크 관리

### 동적 분석 요소
- 실시간 신호 생성
- 진입/청산 가격 제시
- 리스크/리워드 비율
- 포지션 사이징 추천
- 손절/익절 레벨

## 🚀 구현 체크리스트

### Phase 1 체크리스트
- [ ] 데이터 정제 파이프라인 구축
- [ ] WebSocket Manager 구현
- [ ] Rate Limiter 적용
- [ ] Circuit Breaker 패턴 구현
- [ ] CoinSelector 컴포넌트
- [ ] NewsCard 컴포넌트
- [ ] SentimentGauge 컴포넌트
- [ ] TradingSignal 컴포넌트

### Phase 2 체크리스트
- [ ] Explainable AI 모듈
- [ ] Confidence Score 시스템
- [ ] AI 요약 페이지 구현
- [ ] 감성 분석 페이지 구현
- [ ] 15개 차트 구현 (AI 요약)
- [ ] 10개 차트 구현 (감성 분석)

### Phase 3 체크리스트
- [ ] 리서치 보고서 페이지
- [ ] 시장 분석 페이지
- [ ] TVL/온체인 자동화
- [ ] 섹터별 분석 모듈
- [ ] 20개 차트 구현

### Phase 4 체크리스트
- [ ] 파트너십 페이지
- [ ] 규제 뉴스 페이지
- [ ] 네트워크 그래프 구현
- [ ] 다국어 지원
- [ ] 20개 차트 구현

### Phase 5 체크리스트
- [ ] 해킹 알림 페이지
- [ ] 보안 API 연동
- [ ] 성능 최적화
- [ ] 테스트 및 디버깅
- [ ] 배포 준비

## 📝 개발 노트

### 주의사항
- CLAUDE.md 규칙 엄격 준수
- 모든 데이터는 실제 API 사용
- Mock 데이터 절대 금지
- 모듈화 필수
- 에러 바운더리 적용

### 성공 지표
- 페이지 로딩 시간 < 2초
- WebSocket 재연결률 > 95%
- API 응답 캐싱률 > 90%
- 모바일 사용성 점수 > 95
- 차트 렌더링 FPS > 30

## 🔄 업데이트 로그

### 2025-09-15
- 초기 계획서 작성
- Phase별 구현 계획 수립
- 13개 TODO 항목 생성

---

**총 예상 기간**: 8일
**우선순위**: AI 요약 → 감성 분석 → 리서치 → 시장 분석 → 파트너십 → 규제 → 해킹
**목표**: 전문 트레이더를 위한 종합 뉴스 분석 플랫폼 구축