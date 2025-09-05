const fs = require('fs');
const path = require('path');

// 모든 메뉴 항목 정의
const menuItems = [
  // 1. 프리미엄 시그널
  { path: 'signals/smart-money', title: 'Smart Money Signals', category: '프리미엄 시그널' },
  { path: 'signals/insider-flow', title: 'Insider Flow', category: '프리미엄 시그널' },
  { path: 'signals/whale-tracker', title: 'Whale Tracker', category: '프리미엄 시그널' },
  { path: 'signals/unusual-options', title: 'Unusual Options', category: '프리미엄 시그널' },
  { path: 'signals/funding-rate', title: 'Funding Rate Signals', category: '프리미엄 시그널' },
  { path: 'signals/liquidation', title: 'Liquidation Heatmap', category: '프리미엄 시그널' },
  { path: 'signals/arbitrage', title: 'Cross-Exchange Arbitrage', category: '프리미엄 시그널' },
  { path: 'signals/dex-flow', title: 'DEX Flow Analysis', category: '프리미엄 시그널' },
  { path: 'signals/fear-greed', title: 'Fear & Greed Index', category: '프리미엄 시그널' },
  { path: 'signals/social-sentiment', title: 'Social Sentiment', category: '프리미엄 시그널' },

  // 2. 퀀트 전략
  { path: 'quant/backtesting', title: '백테스팅 엔진', category: '퀀트 전략' },
  { path: 'quant/strategy-builder', title: '전략 빌더', category: '퀀트 전략' },
  { path: 'quant/pair-trading', title: '페어 트레이딩', category: '퀀트 전략' },
  { path: 'quant/grid-bot', title: '그리드 봇', category: '퀀트 전략' },
  { path: 'quant/dca', title: 'DCA 전략', category: '퀀트 전략' },
  { path: 'quant/mean-reversion', title: 'Mean Reversion', category: '퀀트 전략' },
  { path: 'quant/momentum', title: '모멘텀 전략', category: '퀀트 전략' },
  { path: 'quant/market-making', title: 'Market Making', category: '퀀트 전략' },
  { path: 'quant/arbitrage', title: '차익거래 봇', category: '퀀트 전략' },
  { path: 'quant/options', title: '옵션 전략', category: '퀀트 전략' },

  // 3. 시장 미시구조
  { path: 'microstructure/orderflow', title: '오더플로우 분석', category: '시장 미시구조' },
  { path: 'microstructure/footprint', title: 'Footprint Charts', category: '시장 미시구조' },
  { path: 'microstructure/liquidity', title: '유동성 분석', category: '시장 미시구조' },
  { path: 'microstructure/orderbook', title: '오더북 히트맵', category: '시장 미시구조' },
  { path: 'microstructure/tape-reading', title: 'Tape Reading', category: '시장 미시구조' },
  { path: 'microstructure/hft', title: 'HFT 패턴 감지', category: '시장 미시구조' },
  { path: 'microstructure/spoofing', title: 'Spoofing Detection', category: '시장 미시구조' },
  { path: 'microstructure/sweep', title: 'Sweep Analysis', category: '시장 미시구조' },
  { path: 'microstructure/imbalance', title: 'Order Imbalance', category: '시장 미시구조' },
  { path: 'microstructure/pin', title: 'Pin Risk Analysis', category: '시장 미시구조' },

  // 4. 기술적 분석
  { path: 'technical/patterns', title: '차트 패턴 인식', category: '기술적 분석' },
  { path: 'technical/indicators', title: '30+ 지표 대시보드', category: '기술적 분석' },
  { path: 'technical/elliott', title: '엘리엇 파동', category: '기술적 분석' },
  { path: 'technical/wyckoff', title: 'Wyckoff Method', category: '기술적 분석' },
  { path: 'technical/smc', title: 'Smart Money Concepts', category: '기술적 분석' },
  { path: 'technical/profile', title: 'Market Profile', category: '기술적 분석' },
  { path: 'technical/volume', title: 'Volume Profile', category: '기술적 분석' },
  { path: 'technical/cvd', title: 'CVD/Delta', category: '기술적 분석' },
  { path: 'technical/support', title: '지지/저항 자동탐지', category: '기술적 분석' },
  { path: 'technical/ofi', title: 'OFI Analysis', category: '기술적 분석' },
  { path: 'technical/liquidity', title: '유동성 사냥', category: '기술적 분석' },
  { path: 'technical/obituary', title: '오비추어리 패턴', category: '기술적 분석' },
  { path: 'technical/harmonic', title: 'Harmonic Patterns', category: '기술적 분석' },
  { path: 'technical/fibonacci', title: 'Fibonacci Tools', category: '기술적 분석' },

  // 5. AI/ML 분석
  { path: 'ai/predictions', title: 'AI 가격 예측', category: 'AI/ML 분석' },
  { path: 'ai/pattern-recognition', title: '패턴 인식 AI', category: 'AI/ML 분석' },
  { path: 'ai/sentiment', title: '감성 분석 AI', category: 'AI/ML 분석' },
  { path: 'ai/anomaly', title: '이상 탐지', category: 'AI/ML 분석' },
  { path: 'ai/clustering', title: '시장 클러스터링', category: 'AI/ML 분석' },
  { path: 'ai/reinforcement', title: '강화학습 봇', category: 'AI/ML 분석' },
  { path: 'ai/nlp', title: 'NLP 뉴스 분석', category: 'AI/ML 분석' },
  { path: 'ai/ensemble', title: '앙상블 모델', category: 'AI/ML 분석' },
  { path: 'ai/quantum', title: '퀀텀 AI', category: 'AI/ML 분석' },
  { path: 'ai/neural', title: 'Neural Prophet', category: 'AI/ML 분석' },
  { path: 'ai/gpt', title: 'GPT-4 분석', category: 'AI/ML 분석' },

  // 6. 자동매매
  { path: 'automation/builder', title: '전략 빌더', category: '자동매매' },
  { path: 'automation/marketplace', title: '봇 마켓플레이스', category: '자동매매' },
  { path: 'automation/copy-trading', title: '카피 트레이딩', category: '자동매매' },
  { path: 'automation/api-bot', title: 'API 봇 관리', category: '자동매매' },
  { path: 'automation/webhook', title: 'Webhook 트레이딩', category: '자동매매' },
  { path: 'automation/pine-script', title: 'Pine Script 연동', category: '자동매매' },
  { path: 'automation/performance', title: '성과 분석', category: '자동매매' },
  { path: 'automation/risk-management', title: '리스크 관리', category: '자동매매' },
  { path: 'automation/paper-trading', title: '모의 거래', category: '자동매매' },
  { path: 'automation/cloud', title: '클라우드 봇', category: '자동매매' },

  // 7. 텔레그램 봇
  { path: 'telegram/setup', title: '봇 설정', category: '텔레그램 봇' },
  { path: 'telegram/alerts', title: '알림 관리', category: '텔레그램 봇' },
  { path: 'telegram/trading', title: '거래 실행', category: '텔레그램 봇' },
  { path: 'telegram/groups', title: '그룹 관리', category: '텔레그램 봇' },
  { path: 'telegram/signals', title: '시그널 봇', category: '텔레그램 봇' },
  { path: 'telegram/stats', title: '통계 봇', category: '텔레그램 봇' },
  { path: 'telegram/commands', title: '명령어 설정', category: '텔레그램 봇' },
  { path: 'telegram/premium', title: '프리미엄 봇', category: '텔레그램 봇' },
  { path: 'telegram/games', title: '예측 게임', category: '텔레그램 봇' },
  { path: 'telegram/multi-language', title: '다국어 지원', category: '텔레그램 봇' },

  // 8. 게이밍&소셜
  { path: 'gaming/prediction', title: '예측 대회', category: '게이밍&소셜' },
  { path: 'gaming/trading-battle', title: '트레이딩 배틀', category: '게이밍&소셜' },
  { path: 'gaming/paper-competition', title: '모의 투자 대회', category: '게이밍&소셜' },
  { path: 'gaming/nft', title: 'NFT 컬렉션', category: '게이밍&소셜' },
  { path: 'gaming/achievements', title: '업적 시스템', category: '게이밍&소셜' },
  { path: 'gaming/leaderboard', title: '리더보드', category: '게이밍&소셜' },
  { path: 'gaming/guild', title: '길드 시스템', category: '게이밍&소셜' },
  { path: 'gaming/social-trading', title: '소셜 트레이딩', category: '게이밍&소셜' },
  { path: 'gaming/rewards', title: '보상 프로그램', category: '게이밍&소셜' },
  { path: 'gaming/metaverse', title: '메타버스', category: '게이밍&소셜' },

  // 9. 거시경제
  { path: 'macro/calendar', title: '경제 캘린더', category: '거시경제' },
  { path: 'macro/indicators', title: '경제 지표', category: '거시경제' },
  { path: 'macro/interest-rates', title: '금리 분석', category: '거시경제' },
  { path: 'macro/inflation', title: '인플레이션 대시보드', category: '거시경제' },
  { path: 'macro/central-banks', title: '중앙은행 정책', category: '거시경제' },
  { path: 'macro/dxy', title: 'DXY 상관관계', category: '거시경제' },
  { path: 'macro/commodities', title: '원자재 시장', category: '거시경제' },
  { path: 'macro/bonds', title: '채권 시장', category: '거시경제' },
  { path: 'macro/forex', title: '외환 시장', category: '거시경제' },
  { path: 'macro/geopolitics', title: '지정학 리스크', category: '거시경제' },

  // 10. 암호화폐 시장
  { path: 'crypto/live', title: '실시간 시세', category: '암호화폐 시장' },
  { path: 'crypto/marketcap', title: '시가총액 순위', category: '암호화폐 시장' },
  { path: 'crypto/dominance', title: 'BTC 도미넌스', category: '암호화폐 시장' },
  { path: 'crypto/altseason', title: 'Altseason Index', category: '암호화폐 시장' },
  { path: 'crypto/onchain', title: '온체인 데이터', category: '암호화폐 시장' },
  { path: 'crypto/defi', title: 'DeFi TVL', category: '암호화폐 시장' },
  { path: 'crypto/nft', title: 'NFT 마켓', category: '암호화폐 시장' },
  { path: 'crypto/layer2', title: 'Layer2 생태계', category: '암호화폐 시장' },
  { path: 'crypto/staking', title: '스테이킹 수익률', category: '암호화폐 시장' },
  { path: 'crypto/mining', title: '채굴 수익성', category: '암호화폐 시장' },

  // 11. 뉴스&인사이트
  { path: 'news/realtime', title: '실시간 뉴스', category: '뉴스&인사이트' },
  { path: 'news/analysis', title: '시장 분석', category: '뉴스&인사이트' },
  { path: 'news/research', title: '리서치 리포트', category: '뉴스&인사이트' },
  { path: 'news/influencers', title: '인플루언서 추적', category: '뉴스&인사이트' },
  { path: 'news/regulation', title: '규제 뉴스', category: '뉴스&인사이트' },
  { path: 'news/hacks', title: '해킹/사고 뉴스', category: '뉴스&인사이트' },
  { path: 'news/partnerships', title: '제휴 소식', category: '뉴스&인사이트' },
  { path: 'news/funding', title: '펀딩 뉴스', category: '뉴스&인사이트' },
  { path: 'news/ai-summary', title: 'AI 요약', category: '뉴스&인사이트' },
  { path: 'news/sentiment', title: '뉴스 감성분석', category: '뉴스&인사이트' },

  // 12. 이벤트&에어드랍
  { path: 'events/airdrops', title: '에어드랍 트래커', category: '이벤트&에어드랍' },
  { path: 'events/ieo', title: 'IEO/IDO 일정', category: '이벤트&에어드랍' },
  { path: 'events/conferences', title: '컨퍼런스 일정', category: '이벤트&에어드랍' },
  { path: 'events/ama', title: 'AMA 일정', category: '이벤트&에어드랍' },
  { path: 'events/mainnet', title: '메인넷 런칭', category: '이벤트&에어드랍' },
  { path: 'events/halving', title: '반감기 카운트다운', category: '이벤트&에어드랍' },
  { path: 'events/nft-drops', title: 'NFT 드롭', category: '이벤트&에어드랍' },
  { path: 'events/staking', title: 'Staking Rewards', category: '이벤트&에어드랍' },
  { path: 'events/yields', title: 'DeFi Yields', category: '이벤트&에어드랍' },
  { path: 'events/governance', title: 'Governance Votes', category: '이벤트&에어드랍' },
  { path: 'events/unlocks', title: 'Token Unlocks', category: '이벤트&에어드랍' },
  { path: 'events/upgrades', title: 'Protocol Upgrades', category: '이벤트&에어드랍' },

  // 13. 리스크 관리
  { path: 'risk/calculator', title: '포지션 계산기', category: '리스크 관리' },
  { path: 'risk/stop-loss', title: '손절/익절 설정', category: '리스크 관리' },
  { path: 'risk/position-sizing', title: '포지션 사이징', category: '리스크 관리' },
  { path: 'risk/kelly', title: 'Kelly Criterion', category: '리스크 관리' },
  { path: 'risk/var', title: 'VaR 분석', category: '리스크 관리' },
  { path: 'risk/drawdown', title: 'Drawdown 분석', category: '리스크 관리' },
  { path: 'risk/correlation', title: '상관관계 분석', category: '리스크 관리' },
  { path: 'risk/hedging', title: '헤징 전략', category: '리스크 관리' },
  { path: 'risk/scenario', title: '시나리오 분석', category: '리스크 관리' },
  { path: 'risk/stress-test', title: '스트레스 테스트', category: '리스크 관리' },

  // 14. 포트폴리오
  { path: 'portfolio/overview', title: '포트폴리오 현황', category: '포트폴리오' },
  { path: 'portfolio/tracking', title: '자산 추적', category: '포트폴리오' },
  { path: 'portfolio/pnl', title: 'P&L 분석', category: '포트폴리오' },
  { path: 'portfolio/rebalancing', title: '리밸런싱', category: '포트폴리오' },
  { path: 'portfolio/optimization', title: '포트폴리오 최적화', category: '포트폴리오' },
  { path: 'portfolio/tax', title: '세금 리포트', category: '포트폴리오' },
  { path: 'portfolio/export', title: '데이터 내보내기', category: '포트폴리오' },
  { path: 'portfolio/import', title: '거래소 연동', category: '포트폴리오' },
  { path: 'portfolio/history', title: '거래 히스토리', category: '포트폴리오' },
  { path: 'portfolio/sharpe', title: 'Sharpe Ratio', category: '포트폴리오' },
  { path: 'portfolio/var', title: 'VAR 계산', category: '포트폴리오' },
  { path: 'portfolio/correlation', title: 'Correlation Matrix', category: '포트폴리오' },
  { path: 'portfolio/allocation', title: 'Asset Allocation', category: '포트폴리오' },
  { path: 'portfolio/performance', title: 'Performance Analytics', category: '포트폴리오' },
  { path: 'portfolio/wallets', title: 'Wallet Tracker', category: '포트폴리오' },

  // 15. 회원 관리 (관리자용)
  { path: 'members/list', title: '회원 목록', category: '회원 관리' },
  { path: 'members/roles', title: '역할 관리', category: '회원 관리' },
  { path: 'members/permissions', title: '권한 설정', category: '회원 관리' },
  { path: 'members/kyc', title: 'KYC/AML', category: '회원 관리' },
  { path: 'members/activity', title: '활동 로그', category: '회원 관리' },
  { path: 'members/support', title: '고객 지원', category: '회원 관리' },
  { path: 'members/ban', title: '제재 관리', category: '회원 관리' },
  { path: 'members/referral', title: '추천인 관리', category: '회원 관리' },
  { path: 'members/vip', title: 'VIP 관리', category: '회원 관리' },
  { path: 'members/bulk', title: '일괄 작업', category: '회원 관리' },

  // 16. 결제/구독
  { path: 'payment/plans', title: '요금제 관리', category: '결제/구독' },
  { path: 'payment/history', title: '결제 내역', category: '결제/구독' },
  { path: 'payment/methods', title: '결제 수단', category: '결제/구독' },
  { path: 'payment/invoices', title: '인보이스', category: '결제/구독' },
  { path: 'payment/referral', title: '리퍼럴 정산', category: '결제/구독' },
  { path: 'payment/crypto', title: '암호화폐 결제', category: '결제/구독' },
  { path: 'payment/card', title: '카드 결제', category: '결제/구독' },
  { path: 'payment/withdrawal', title: '출금 관리', category: '결제/구독' },
  { path: 'payment/tax', title: '세금계산서', category: '결제/구독' },
  { path: 'payment/coupon', title: '쿠폰 시스템', category: '결제/구독' },

  // 17. 마케팅/프로모션 (관리자용)
  { path: 'marketing/campaigns', title: '캠페인 관리', category: '마케팅/프로모션' },
  { path: 'marketing/coupons', title: '쿠폰 발행', category: '마케팅/프로모션' },
  { path: 'marketing/referral', title: '추천인 프로그램', category: '마케팅/프로모션' },
  { path: 'marketing/events', title: '이벤트 관리', category: '마케팅/프로모션' },
  { path: 'marketing/social', title: 'SNS 연동', category: '마케팅/프로모션' },
  { path: 'marketing/email', title: '이메일 마케팅', category: '마케팅/프로모션' },
  { path: 'marketing/ab-test', title: 'A/B 테스팅', category: '마케팅/프로모션' },
  { path: 'marketing/rewards', title: '보상 시스템', category: '마케팅/프로모션' },
  { path: 'marketing/affiliate', title: '제휴 프로그램', category: '마케팅/프로모션' },
  { path: 'marketing/analytics', title: '마케팅 분석', category: '마케팅/프로모션' },

  // 18. 통계/분석
  { path: 'analytics/dashboard', title: '대시보드', category: '통계/분석' },
  { path: 'analytics/users', title: '사용자 분석', category: '통계/분석' },
  { path: 'analytics/revenue', title: '수익 분석', category: '통계/분석' },
  { path: 'analytics/funnel', title: '퍼널 분석', category: '통계/분석' },
  { path: 'analytics/retention', title: '리텐션 분석', category: '통계/분석' },
  { path: 'analytics/cohort', title: '코호트 분석', category: '통계/분석' },
  { path: 'analytics/ab-test', title: 'A/B 테스트 결과', category: '통계/분석' },
  { path: 'analytics/reports', title: '보고서 생성', category: '통계/분석' },
  { path: 'analytics/export', title: '데이터 내보내기', category: '통계/분석' },
  { path: 'analytics/predictive', title: '예측 분석', category: '통계/분석' },

  // 19. 교육센터
  { path: 'education/basics', title: '트레이딩 기초', category: '교육센터' },
  { path: 'education/technical', title: '기술적 분석', category: '교육센터' },
  { path: 'education/fundamental', title: '펀더멘털 분석', category: '교육센터' },
  { path: 'education/defi', title: 'DeFi 가이드', category: '교육센터' },
  { path: 'education/risk', title: '리스크 관리', category: '교육센터' },
  { path: 'education/strategies', title: '트레이딩 전략', category: '교육센터' },
  { path: 'education/psychology', title: '투자 심리학', category: '교육센터' },
  { path: 'education/webinar', title: '웨비나', category: '교육센터' },
  { path: 'education/certification', title: '인증 프로그램', category: '교육센터' },
  { path: 'education/glossary', title: '용어 사전', category: '교육센터' },

  // 20. 시스템 설정
  { path: 'system/account', title: '계정 설정', category: '시스템 설정' },
  { path: 'system/api', title: 'API 관리', category: '시스템 설정' },
  { path: 'system/notifications', title: '알림 설정', category: '시스템 설정' },
  { path: 'system/security', title: '보안 센터', category: '시스템 설정' },
  { path: 'system/theme', title: '테마/UI', category: '시스템 설정' },
  { path: 'system/language', title: '언어/지역', category: '시스템 설정' },
  { path: 'system/backup', title: '백업/복구', category: '시스템 설정' },
  { path: 'system/privacy', title: '개인정보', category: '시스템 설정' },
  { path: 'system/integrations', title: '연동 서비스', category: '시스템 설정' },
  { path: 'system/advanced', title: '고급 설정', category: '시스템 설정' }
];

// 페이지 템플릿 생성 함수
function createPageTemplate(title, category) {
  return `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: API 호출로 실제 데이터 가져오기
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Link href="/" className="hover:text-white">홈</Link>
          <span>/</span>
          <span>${category}</span>
          <span>/</span>
          <span className="text-white">${title}</span>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">${title}</h1>
        <p className="text-gray-400">카테고리: ${category}</p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="bg-gray-800/50 rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">데이터 로딩 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 카드 1 - 개발 예정 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">개발 예정</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                이 기능은 현재 개발 중입니다. 곧 업데이트될 예정입니다.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">예상 완료</span>
                  <span className="text-gray-300">2025 Q1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">우선순위</span>
                  <span className="text-purple-400">높음</span>
                </div>
              </div>
            </div>

            {/* 카드 2 - 기능 소개 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">주요 기능</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>실시간 데이터 분석</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>AI 기반 예측</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>자동화된 거래 실행</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>리스크 관리 도구</span>
                </li>
              </ul>
            </div>

            {/* 카드 3 - 통계 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">예상 성능</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">정확도</span>
                    <span className="text-green-400">87%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">처리 속도</span>
                    <span className="text-blue-400">95%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">사용자 만족도</span>
                    <span className="text-purple-400">92%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 개발 로드맵 */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">개발 로드맵</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-green-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 1: 기본 구조</h4>
                <p className="text-gray-400 text-sm">UI/UX 디자인, 데이터베이스 설계</p>
              </div>
              <span className="text-green-400 text-sm">완료</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 2: 핵심 기능</h4>
                <p className="text-gray-400 text-sm">API 연동, 실시간 데이터 처리</p>
              </div>
              <span className="text-yellow-400 text-sm">진행 중</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-gray-600 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 3: AI 통합</h4>
                <p className="text-gray-400 text-sm">머신러닝 모델, 예측 엔진</p>
              </div>
              <span className="text-gray-400 text-sm">예정</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 bg-gray-600 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Phase 4: 최적화</h4>
                <p className="text-gray-400 text-sm">성능 개선, 사용자 피드백 반영</p>
              </div>
              <span className="text-gray-400 text-sm">예정</span>
            </div>
          </div>
        </div>

        {/* TODO 리스트 */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
          <h3 className="text-xl font-bold text-white mb-4">📋 구현 예정 기능</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>실시간 WebSocket 연결</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>PostgreSQL 데이터베이스 연동</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>FastAPI 백엔드 통합</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>차트 라이브러리 구현</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>사용자 인증 시스템</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>구독 등급 체크</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>다국어 지원</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
                <span>모바일 반응형 최적화</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
`;
}

// 디렉토리 생성 함수
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 페이지 파일 생성
function createPages() {
  const appDir = path.join(__dirname, '..', 'app');
  let createdCount = 0;
  let skippedCount = 0;

  menuItems.forEach(item => {
    const pathParts = item.path.split('/');
    const fileName = pathParts.pop();
    const dirPath = path.join(appDir, ...pathParts, fileName);
    const filePath = path.join(dirPath, 'page.tsx');

    // 디렉토리 생성
    ensureDirectoryExists(dirPath);

    // 파일이 이미 존재하는지 확인
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  Skipped: ${item.path} (already exists)`);
      skippedCount++;
    } else {
      // 페이지 파일 생성
      const content = createPageTemplate(item.title, item.category);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created: ${item.path}`);
      createdCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${createdCount} pages`);
  console.log(`   Skipped: ${skippedCount} pages`);
  console.log(`   Total: ${menuItems.length} pages`);
}

// 실행
console.log('🚀 Creating page structure for MONSTA...\n');
createPages();
console.log('\n✨ Page creation complete!');