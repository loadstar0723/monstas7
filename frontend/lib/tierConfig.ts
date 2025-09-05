// 등급별 메뉴 접근 권한 설정
export type SubscriptionTier = 'Starter' | 'Advance' | 'Platinum' | 'Signature' | 'Master' | 'Infinity'

// 등급별 레벨 (높을수록 더 많은 권한)
export const tierLevels: Record<SubscriptionTier, number> = {
  'Starter': 1,
  'Advance': 2,
  'Platinum': 3,
  'Signature': 4,
  'Master': 5,
  'Infinity': 6
}

// 등급별 접근 가능 메뉴 비율
export const tierAccessRatio = {
  'Starter': 0.25,     // 25% (75개 메뉴)
  'Advance': 0.40,     // 40% (120개 메뉴)
  'Platinum': 0.60,    // 60% (180개 메뉴)
  'Signature': 0.75,   // 75% (225개 메뉴)
  'Master': 0.90,      // 90% (270개 메뉴)
  'Infinity': 1.00     // 100% (301개 메뉴)
}

// 카테고리별 기본 등급 요구사항
export const categoryMinTiers: Record<string, SubscriptionTier> = {
  // 기본 카테고리 (Starter 접근 가능)
  'crypto': 'Starter',
  'news': 'Starter',
  'education': 'Starter',
  
  // 중급 카테고리 (Advance 이상)
  'signals': 'Advance',
  'technical': 'Advance',
  'macro': 'Advance',
  'events': 'Advance',
  
  // 고급 카테고리 (Platinum 이상)
  'quant': 'Platinum',
  'ai': 'Platinum',
  'portfolio': 'Platinum',
  'risk': 'Platinum',
  
  // 전문가 카테고리 (Signature 이상)
  'microstructure': 'Signature',
  'automation': 'Signature',
  'analytics': 'Signature',
  
  // 프로 카테고리 (Master 이상)
  'gaming': 'Master',
  'payment': 'Master',
  'marketing': 'Master',
  
  // 관리자 카테고리 (Infinity)
  'system': 'Infinity',
  'members': 'Infinity',
  
  // 커뮤니티 (등급별 차등)
  'telegram': 'Advance',
  'subscription': 'Starter'
}

// 메뉴별 등급 오버라이드 (특정 메뉴에 대한 개별 설정)
export const menuTierOverrides: Record<string, SubscriptionTier> = {
  // Signals 카테고리 개별 설정
  '/signals/smart-money': 'Advance',
  '/signals/whale-tracker': 'Platinum',
  '/signals/insider-flow': 'Signature',
  '/signals/liquidation': 'Advance',
  '/signals/dex-flow': 'Platinum',
  '/signals/funding-rate': 'Starter',
  '/signals/unusual-options': 'Master',
  '/signals/social-sentiment': 'Starter',
  '/signals/fear-greed': 'Starter',
  '/signals/arbitrage': 'Signature',
  
  // Quant 카테고리 개별 설정
  '/quant/backtesting': 'Platinum',
  '/quant/grid-bot': 'Platinum',
  '/quant/pair-trading': 'Signature',
  '/quant/market-making': 'Master',
  '/quant/dca': 'Advance',
  '/quant/mean-reversion': 'Platinum',
  '/quant/momentum': 'Advance',
  '/quant/options': 'Signature',
  '/quant/arbitrage': 'Master',
  '/quant/defi-strategies': 'Infinity',
  
  // Microstructure 카테고리 개별 설정
  '/microstructure/orderbook': 'Signature',
  '/microstructure/orderflow': 'Signature',
  '/microstructure/block-trades': 'Signature',
  '/microstructure/footprint': 'Master',
  '/microstructure/market-depth': 'Platinum',
  '/microstructure/time-sales': 'Master',
  '/microstructure/vwap': 'Advance',
  '/microstructure/execution-heatmap': 'Master',
  '/microstructure/liquidity-pools': 'Signature',
  '/microstructure/lambda-quality': 'Infinity',
  
  // Technical 카테고리 개별 설정
  '/technical/profile': 'Platinum',
  '/technical/market-profile': 'Signature',
  '/technical/tpo': 'Master',
  '/technical/delta': 'Platinum',
  '/technical/cvd': 'Signature',
  '/technical/gamma': 'Master',
  '/technical/open-interest': 'Advance',
  '/technical/volume-delta': 'Platinum',
  '/technical/market-cipher': 'Signature',
  '/technical/wyckoff': 'Master',
  
  // AI 카테고리 개별 설정
  '/ai/predictions': 'Platinum',
  '/ai/sentiment': 'Advance',
  '/ai/pattern': 'Platinum',
  '/ai/llm': 'Signature',
  '/ai/neural': 'Master',
  '/ai/reinforcement': 'Master',
  '/ai/quantum': 'Infinity',
  '/ai/alphazero': 'Infinity',
  '/ai/gpt-trading': 'Signature',
  '/ai/deep-learning': 'Master',
  
  // Automation 카테고리 개별 설정
  '/automation/builder': 'Signature',
  '/automation/webhook': 'Advance',
  '/automation/api': 'Platinum',
  '/automation/script': 'Signature',
  '/automation/scheduler': 'Advance',
  '/automation/alert': 'Starter',
  '/automation/condition': 'Platinum',
  '/automation/multi-account': 'Master',
  '/automation/copy-trading': 'Signature',
  '/automation/bot-management': 'Master',
  
  // Risk 카테고리 개별 설정
  '/risk/var': 'Platinum',
  '/risk/stress-test': 'Signature',
  '/risk/drawdown': 'Advance',
  '/risk/kelly': 'Platinum',
  '/risk/monte-carlo': 'Signature',
  '/risk/black-swan': 'Master',
  '/risk/correlation': 'Platinum',
  '/risk/beta': 'Advance',
  '/risk/sharpe': 'Advance',
  '/risk/max-pain': 'Signature',
  
  // Portfolio 카테고리 개별 설정
  '/portfolio/optimizer': 'Platinum',
  '/portfolio/rebalance': 'Advance',
  '/portfolio/efficient-frontier': 'Signature',
  '/portfolio/factor': 'Master',
  '/portfolio/risk-parity': 'Signature',
  '/portfolio/black-litterman': 'Master',
  '/portfolio/correlation-matrix': 'Platinum',
  '/portfolio/performance': 'Advance',
  '/portfolio/attribution': 'Signature',
  '/portfolio/benchmark': 'Platinum'
}

// 등급별 혜택 설명
export const tierBenefits = {
  'Starter': {
    features: [
      '기본 차트 도구',
      '실시간 뉴스',
      '기초 교육 콘텐츠',
      '커뮤니티 접근',
      '기본 대시보드'
    ],
    menuCount: 75,
    price: '무료'
  },
  'Advance': {
    features: [
      'Starter 모든 기능 +',
      '기술적 지표 20개',
      '시그널 알림',
      'API 접근',
      '백테스팅 기본',
      '자동화 기초'
    ],
    menuCount: 120,
    price: '₩29,900/월'
  },
  'Platinum': {
    features: [
      'Advance 모든 기능 +',
      'AI 분석 도구',
      '퀀트 전략',
      '포트폴리오 최적화',
      '볼륨 프로파일',
      '리스크 관리'
    ],
    menuCount: 180,
    price: '₩59,900/월'
  },
  'Signature': {
    features: [
      'Platinum 모든 기능 +',
      '마이크로구조 분석',
      '인사이더 플로우',
      '전략 빌더',
      '고급 자동화',
      '멀티 계정 관리'
    ],
    menuCount: 225,
    price: '₩99,900/월'
  },
  'Master': {
    features: [
      'Signature 모든 기능 +',
      '마켓 메이킹',
      '풋프린트 차트',
      'HFT 전략',
      '고래 추적 프로',
      'VIP 전용 채널'
    ],
    menuCount: 270,
    price: '₩199,900/월'
  },
  'Infinity': {
    features: [
      '모든 기능 무제한',
      '양자 컴퓨팅 분석',
      '1:1 전문가 컨설팅',
      '커스텀 봇 개발',
      '조기 액세스',
      '무제한 API 호출'
    ],
    menuCount: 301,
    price: '₩499,900/월'
  }
}