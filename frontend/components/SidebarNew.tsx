'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FaHome, FaChartLine, FaRobot, FaBriefcase, FaHistory,
  FaTelegram, FaUsers, FaGraduationCap, FaNewspaper,
  FaUser, FaCog, FaBars, FaTimes, FaGlobe, FaChartPie,
  FaBrain, FaRocket, FaShieldAlt, FaWallet, FaGamepad,
  FaBook, FaUserTie, FaHandshake, FaStore, FaChartBar,
  FaCoins, FaExchangeAlt, FaMicrochip, FaLock, FaCrown,
  FaDna, FaAtom, FaFlask, FaLightbulb, FaNetworkWired,
  FaDatabase, FaServer, FaCloud, FaFingerprint, FaMagic,
  FaGem, FaDollarSign, FaBitcoin, FaEthereum, FaChartArea,
  FaBalanceScale, FaTrophy, FaMedal, FaAward, FaStar, FaKey,
  FaSignal, FaWaveSquare, FaSearch, FaVolumeUp, FaChessQueen,
  FaWater, FaEye, FaFire, FaSkull, FaBolt, FaRadiation,
  FaExclamationTriangle, FaUniversity, FaPiggyBank, FaMoneyBillWave,
  FaPercentage, FaCalculator, FaRing, FaSpaceShuttle, FaSatelliteDish,
  FaBroadcastTower, FaWifi, FaProjectDiagram, FaCodeBranch,
  FaLayerGroup, FaCubes, FaThLarge, FaStream, FaInfinity,
  FaChessKnight, FaBinoculars, FaCompass, FaAnchor, FaFlag,
  FaBullseye, FaCrosshairs, FaDice, FaChess, FaPuzzlePiece,
  FaTheaterMasks, FaTicketAlt, FaGift, FaBell, FaEnvelope,
  FaPaperPlane, FaComment, FaComments, FaVideo, FaMicrophone,
  FaHeadphones, FaKeyboard, FaMouse, FaDesktop, FaMobile,
  FaTablet, FaLaptop, FaTv, FaGamepad as FaController, 
  FaDiscord, FaSlack, FaWhatsapp, FaYoutube, FaTwitter
} from 'react-icons/fa'
import { 
  BiBot, BiAnalyse, BiTrendingUp, BiCoinStack, BiData,
  BiNetworkChart, BiPulse, BiRadar, BiTargetLock, BiGrid,
  BiStats, BiLineChart, BiBarChart, BiPieChart, BiScatterChart,
  BiCylinder, BiCube, BiPyramid, BiShapeCircle, BiShapePolygon,
  BiAlarm, BiTime, BiTimer, BiStopwatch, BiHourglass,
  BiCalendar, BiCalendarEvent, BiCalendarCheck, BiCalendarX, BiCalendarPlus
} from 'react-icons/bi'
import { 
  MdAutoGraph, MdAutorenew, MdSwapHoriz, MdTimeline,
  MdShowChart, MdCandlestickChart, MdStackedLineChart,
  MdMultilineChart, MdSignalCellularAlt, MdSpeed,
  MdWaterfall, MdBubbleChart, MdScatterPlot, MdPieChart,
  MdDonutLarge, MdBarChart, MdEqualizer, MdGraphicEq,
  MdLeaderboard, MdAnalytics, MdQueryStats, MdDataUsage
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

// 사용자 역할 정의
type UserRole = '본사' | '총판' | '대리점' | '구독자' | '게스트'

// 구독 등급 정의
type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Black'

// 메뉴 카테고리 정의 (20개로 확장)
type MenuCategory = 
  'signals' | 'quant' | 'microstructure' | 'technical' | 'ai' | 
  'automation' | 'telegram' | 'gaming' | 'macro' | 'crypto' | 
  'news' | 'events' | 'risk' | 'portfolio' | 'members' | 
  'payment' | 'marketing' | 'analytics' | 'education' | 'system'

// 메뉴 아이템 타입
interface MenuItem {
  icon: any
  label: string
  path: string
  badge?: string
  category: MenuCategory
  minRole?: UserRole[]
  minTier?: SubscriptionTier
  isNew?: boolean
  isPremium?: boolean
  isHot?: boolean
  isAlpha?: boolean
  description?: string
}

// 카테고리별 색상 테마 (20개)
const categoryThemes = {
  signals: { color: 'from-cyan-600 to-blue-600', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/30' },
  quant: { color: 'from-purple-600 to-indigo-600', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
  microstructure: { color: 'from-pink-600 to-rose-600', bgColor: 'bg-pink-500/20', borderColor: 'border-pink-500/30' },
  technical: { color: 'from-blue-600 to-indigo-600', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
  ai: { color: 'from-violet-600 to-purple-600', bgColor: 'bg-violet-500/20', borderColor: 'border-violet-500/30' },
  automation: { color: 'from-green-600 to-emerald-600', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
  telegram: { color: 'from-sky-600 to-blue-600', bgColor: 'bg-sky-500/20', borderColor: 'border-sky-500/30' },
  gaming: { color: 'from-orange-600 to-red-600', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' },
  macro: { color: 'from-teal-600 to-cyan-600', bgColor: 'bg-teal-500/20', borderColor: 'border-teal-500/30' },
  crypto: { color: 'from-yellow-600 to-amber-600', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
  news: { color: 'from-lime-600 to-green-600', bgColor: 'bg-lime-500/20', borderColor: 'border-lime-500/30' },
  events: { color: 'from-amber-600 to-orange-600', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
  risk: { color: 'from-red-600 to-rose-600', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
  portfolio: { color: 'from-indigo-600 to-blue-600', bgColor: 'bg-indigo-500/20', borderColor: 'border-indigo-500/30' },
  members: { color: 'from-slate-600 to-gray-600', bgColor: 'bg-slate-500/20', borderColor: 'border-slate-500/30' },
  payment: { color: 'from-emerald-600 to-green-600', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30' },
  marketing: { color: 'from-fuchsia-600 to-pink-600', bgColor: 'bg-fuchsia-500/20', borderColor: 'border-fuchsia-500/30' },
  analytics: { color: 'from-blue-700 to-indigo-700', bgColor: 'bg-blue-600/20', borderColor: 'border-blue-600/30' },
  education: { color: 'from-purple-700 to-pink-700', bgColor: 'bg-purple-600/20', borderColor: 'border-purple-600/30' },
  system: { color: 'from-gray-700 to-slate-700', bgColor: 'bg-gray-600/20', borderColor: 'border-gray-600/30' }
}

// 종합 메뉴 구조 (20개 카테고리, 300+ 항목)
const menuStructure: { [key in MenuCategory]: { title: string, items: MenuItem[] } } = {
  signals: {
    title: '📡 프리미엄 시그널',
    items: [
      { icon: FaSignal, label: 'Smart Money Signals', path: '/signals/smart-money', badge: 'HOT', category: 'signals', isHot: true },
      { icon: FaWater, label: 'Insider Flow', path: '/signals/insider', category: 'signals', minTier: 'Gold' },
      { icon: FaExchangeAlt, label: 'Cross-Exchange Arb', path: '/signals/arbitrage', category: 'signals', minTier: 'Platinum' },
      { icon: FaPercentage, label: 'Funding Rate Signals', path: '/signals/funding', category: 'signals' },
      { icon: BiTargetLock, label: 'Options Flow', path: '/signals/options', category: 'signals', minTier: 'Diamond' },
      { icon: FaCoins, label: 'DeFi TVL Signals', path: '/signals/defi-tvl', category: 'signals' },
      { icon: FaDollarSign, label: 'Stablecoin Flow', path: '/signals/stablecoin', category: 'signals' },
      { icon: FaMicrochip, label: 'Mining Pool Signals', path: '/signals/mining', category: 'signals', minTier: 'Silver' },
      { icon: FaSkull, label: 'Liquidation Alerts', path: '/signals/liquidation', badge: '위험', category: 'signals' },
      { icon: FaWhatsapp, label: 'Whale Alerts', path: '/signals/whale', category: 'signals', isPremium: true },
    ]
  },
  quant: {
    title: '🧠 퀀트 전략',
    items: [
      { icon: BiLineChart, label: 'Mean Reversion', path: '/quant/mean-reversion', category: 'quant' },
      { icon: FaRocket, label: 'Momentum Strategies', path: '/quant/momentum', badge: 'PRO', category: 'quant', minTier: 'Gold' },
      { icon: FaBalanceScale, label: 'Statistical Arbitrage', path: '/quant/stat-arb', category: 'quant', minTier: 'Platinum' },
      { icon: BiNetworkChart, label: 'Pairs Trading', path: '/quant/pairs', category: 'quant' },
      { icon: FaShieldAlt, label: 'Market Neutral', path: '/quant/neutral', category: 'quant', minTier: 'Diamond' },
      { icon: FaBolt, label: 'HFT Strategies', path: '/quant/hft', badge: '극속', category: 'quant', minTier: 'Black', isAlpha: true },
      { icon: FaBrain, label: 'ML Strategies', path: '/quant/ml', category: 'quant', minTier: 'Gold' },
      { icon: FaBitcoin, label: 'Crypto-Specific', path: '/quant/crypto', category: 'quant' },
      { icon: BiCube, label: 'Factor Models', path: '/quant/factor', category: 'quant', minTier: 'Platinum' },
      { icon: FaInfinity, label: 'Cointegration', path: '/quant/cointegration', category: 'quant' },
    ]
  },
  microstructure: {
    title: '🔮 시장 미시구조',
    items: [
      { icon: BiBarChart, label: 'Order Book Imbalance', path: '/micro/imbalance', category: 'microstructure' },
      { icon: FaWaveSquare, label: 'Microstructure Noise', path: '/micro/noise', category: 'microstructure', minTier: 'Gold' },
      { icon: BiPulse, label: 'Tick Data Analysis', path: '/micro/tick', category: 'microstructure' },
      { icon: BiScatterChart, label: 'Trade Size Distribution', path: '/micro/size', category: 'microstructure' },
      { icon: FaEye, label: 'Spoofing Detection', path: '/micro/spoofing', badge: '감지', category: 'microstructure' },
      { icon: FaRadiation, label: 'Wash Trading Detection', path: '/micro/wash', category: 'microstructure' },
      { icon: FaCrosshairs, label: 'Front-Running Analysis', path: '/micro/frontrun', category: 'microstructure', minTier: 'Diamond' },
      { icon: FaBullseye, label: 'Sandwich Attack Monitor', path: '/micro/sandwich', badge: 'MEV', category: 'microstructure' },
      { icon: BiRadar, label: 'Latency Arbitrage', path: '/micro/latency', category: 'microstructure', minTier: 'Black' },
      { icon: FaChess, label: 'Market Manipulation', path: '/micro/manipulation', category: 'microstructure' },
    ]
  },
  technical: {
    title: '📊 기술적 분석',
    items: [
      { icon: FaChartLine, label: 'Moving Averages', path: '/technical/ma', category: 'technical' },
      { icon: MdShowChart, label: 'RSI/MACD/Stoch', path: '/technical/indicators', category: 'technical' },
      { icon: MdCandlestickChart, label: 'Elliott Wave', path: '/technical/elliott', badge: 'PRO', category: 'technical', minTier: 'Gold' },
      { icon: FaWaveSquare, label: 'Wyckoff Method', path: '/technical/wyckoff', category: 'technical', minTier: 'Platinum' },
      { icon: FaChessQueen, label: 'Smart Money Concepts', path: '/technical/smc', badge: 'HOT', category: 'technical', isHot: true },
      { icon: BiGrid, label: 'Order Flow', path: '/technical/orderflow', category: 'technical', minTier: 'Gold' },
      { icon: FaChartArea, label: 'Market Profile', path: '/technical/profile', category: 'technical' },
      { icon: FaVolumeUp, label: 'Volume Profile', path: '/technical/volume', category: 'technical' },
      { icon: BiData, label: 'CVD/Delta', path: '/technical/cvd', category: 'technical' },
      { icon: FaAnchor, label: '지지/저항 자동탐지', path: '/technical/support', category: 'technical' },
      { icon: MdWaterfall, label: 'OFI Analysis', path: '/technical/ofi', badge: 'NEW', category: 'technical', isNew: true },
      { icon: FaFire, label: '유동성 사냥', path: '/technical/liquidity', category: 'technical', minTier: 'Diamond' },
      { icon: FaSkull, label: '오비추어리 패턴', path: '/technical/obituary', category: 'technical', minTier: 'Black', isAlpha: true },
      { icon: FaPuzzlePiece, label: 'Harmonic Patterns', path: '/technical/harmonic', category: 'technical' },
      { icon: BiShapePolygon, label: 'Fibonacci Tools', path: '/technical/fibonacci', category: 'technical' },
    ]
  },
  ai: {
    title: '🤖 AI/ML 분석',
    items: [
      { icon: FaRobot, label: 'GPT-4 분석', path: '/ai/gpt4', badge: 'AI', category: 'ai', isHot: true },
      { icon: FaBrain, label: 'Claude 요약', path: '/ai/claude', category: 'ai' },
      { icon: BiAnalyse, label: 'LSTM 예측', path: '/ai/lstm', category: 'ai', minTier: 'Gold' },
      { icon: BiStats, label: 'GRU 모델', path: '/ai/gru', category: 'ai' },
      { icon: MdTimeline, label: 'ARIMA 시계열', path: '/ai/arima', category: 'ai' },
      { icon: FaDna, label: 'Random Forest', path: '/ai/rf', category: 'ai' },
      { icon: FaAtom, label: 'XGBoost', path: '/ai/xgboost', category: 'ai', minTier: 'Silver' },
      { icon: FaMagic, label: 'LightGBM', path: '/ai/lightgbm', category: 'ai' },
      { icon: BiPyramid, label: 'BERT 감성분석', path: '/ai/bert', category: 'ai', minTier: 'Platinum' },
      { icon: FaInfinity, label: 'Transformer', path: '/ai/transformer', category: 'ai', minTier: 'Diamond' },
      { icon: FaSpaceShuttle, label: 'GAN 시나리오', path: '/ai/gan', badge: '최첨단', category: 'ai', minTier: 'Black' },
      { icon: BiCylinder, label: 'Freqtrade 통합', path: '/ai/freqtrade', category: 'ai' },
      { icon: MdAutoGraph, label: '앙상블 스코어', path: '/ai/ensemble', badge: '종합', category: 'ai' },
    ]
  },
  automation: {
    title: '⚡ 자동매매 봇',
    items: [
      { icon: BiBot, label: 'Grid Bot', path: '/bots/grid', category: 'automation' },
      { icon: MdAutorenew, label: 'DCA Bot', path: '/bots/dca', category: 'automation' },
      { icon: FaRocket, label: 'Sniper Bot', path: '/bots/sniper', badge: '극속', category: 'automation', minTier: 'Platinum' },
      { icon: FaMicrochip, label: 'MEV Bot', path: '/bots/mev', badge: 'PRO', category: 'automation', minTier: 'Diamond' },
      { icon: FaExchangeAlt, label: 'Arbitrage Bot', path: '/bots/arbitrage', category: 'automation', minTier: 'Gold' },
      { icon: FaBalanceScale, label: 'Market Making Bot', path: '/bots/market-making', category: 'automation', minTier: 'Black' },
      { icon: FaHistory, label: 'Backtesting', path: '/bots/backtest', category: 'automation' },
      { icon: BiTargetLock, label: 'Strategy Builder', path: '/bots/builder', category: 'automation' },
      { icon: FaFlask, label: 'Walk-Forward', path: '/bots/walk-forward', category: 'automation', minTier: 'Gold' },
      { icon: FaDice, label: 'Monte Carlo', path: '/bots/monte-carlo', category: 'automation' },
      { icon: FaShieldAlt, label: 'Risk Manager', path: '/bots/risk', category: 'automation' },
    ]
  },
  telegram: {
    title: '💬 텔레그램 봇',
    items: [
      { icon: FaTelegram, label: '실시간 시그널', path: '/telegram/signals', badge: 'LIVE', category: 'telegram', isHot: true },
      { icon: FaPaperPlane, label: '원클릭 자동매매', path: '/telegram/auto', category: 'telegram', minTier: 'Silver' },
      { icon: FaGamepad, label: '퀵배틀 게임', path: '/telegram/battle', badge: 'GAME', category: 'telegram', isNew: true },
      { icon: FaTrophy, label: '토너먼트', path: '/telegram/tournament', category: 'telegram' },
      { icon: FaChartPie, label: '예측 차트 이미지', path: '/telegram/charts', category: 'telegram' },
      { icon: FaGlobe, label: '10개 언어 지원', path: '/telegram/language', category: 'telegram' },
      { icon: FaBell, label: '커스텀 알림', path: '/telegram/alerts', category: 'telegram' },
      { icon: FaUsers, label: '그룹 관리', path: '/telegram/groups', category: 'telegram', minRole: ['본사', '총판'] },
      { icon: FaBroadcastTower, label: '방송 채널', path: '/telegram/broadcast', category: 'telegram' },
      { icon: FaRobot, label: '봇 설정', path: '/telegram/settings', category: 'telegram' },
    ]
  },
  gaming: {
    title: '🎮 게임화 & 소셜',
    items: [
      { icon: FaTrophy, label: '트레이딩 대회', path: '/gaming/competition', badge: 'LIVE', category: 'gaming' },
      { icon: FaGamepad, label: '퀵배틀', path: '/gaming/quick-battle', category: 'gaming', isNew: true },
      { icon: FaMedal, label: '리더보드', path: '/gaming/leaderboard', category: 'gaming' },
      { icon: FaAward, label: '업적 시스템', path: '/gaming/achievements', category: 'gaming' },
      { icon: FaStar, label: '레벨/경험치', path: '/gaming/levels', category: 'gaming' },
      { icon: FaGem, label: '뱃지 컬렉션', path: '/gaming/badges', category: 'gaming' },
      { icon: FaGift, label: '일일 퀘스트', path: '/gaming/quests', category: 'gaming' },
      { icon: BiNetworkChart, label: 'Copy Trading', path: '/gaming/copy', badge: '인기', category: 'gaming', minTier: 'Gold' },
      { icon: FaVideo, label: 'Live Streaming', path: '/gaming/streaming', category: 'gaming' },
      { icon: FaComments, label: 'Trading Rooms', path: '/gaming/rooms', category: 'gaming' },
      { icon: FaHandshake, label: 'Mentor Matching', path: '/gaming/mentor', category: 'gaming', minTier: 'Platinum' },
      { icon: FaTheaterMasks, label: 'VIP 라운지', path: '/gaming/vip', badge: 'VIP', category: 'gaming', minTier: 'Diamond' },
    ]
  },
  macro: {
    title: '🌐 글로벌 매크로',
    items: [
      { icon: FaUniversity, label: 'Fed Policy Tracker', path: '/macro/fed', category: 'macro' },
      { icon: FaMoneyBillWave, label: 'Global Liquidity', path: '/macro/liquidity', category: 'macro' },
      { icon: FaDollarSign, label: 'Dollar Strength', path: '/macro/dollar', category: 'macro' },
      { icon: FaChartBar, label: 'Inflation Expectations', path: '/macro/inflation', category: 'macro' },
      { icon: FaExclamationTriangle, label: 'Risk On/Off', path: '/macro/risk', badge: '중요', category: 'macro' },
      { icon: BiStats, label: 'Correlation Analysis', path: '/macro/correlation', category: 'macro', minTier: 'Gold' },
      { icon: FaFlag, label: 'Geopolitical Risk', path: '/macro/geopolitical', category: 'macro' },
      { icon: FaNewspaper, label: 'Regulatory Impact', path: '/macro/regulatory', category: 'macro' },
      { icon: FaCalculator, label: 'Interest Rates', path: '/macro/rates', category: 'macro' },
      { icon: FaPiggyBank, label: 'Central Bank Watch', path: '/macro/central-banks', category: 'macro' },
    ]
  },
  crypto: {
    title: '💎 크립토 네이티브',
    items: [
      { icon: BiLineChart, label: 'NVT Signal', path: '/crypto/nvt', category: 'crypto' },
      { icon: BiBarChart, label: 'MVRV Z-Score', path: '/crypto/mvrv', category: 'crypto', minTier: 'Silver' },
      { icon: BiPieChart, label: 'SOPR Analysis', path: '/crypto/sopr', category: 'crypto' },
      { icon: FaMicrochip, label: 'Puell Multiple', path: '/crypto/puell', category: 'crypto' },
      { icon: FaInfinity, label: 'Stock-to-Flow', path: '/crypto/s2f', category: 'crypto' },
      { icon: FaWaveSquare, label: 'HODL Waves', path: '/crypto/hodl', category: 'crypto', minTier: 'Gold' },
      { icon: FaExchangeAlt, label: 'Exchange Flows', path: '/crypto/exchange', category: 'crypto' },
      { icon: FaDollarSign, label: 'Stablecoin Ratio', path: '/crypto/stablecoin', category: 'crypto' },
      { icon: BiCoinStack, label: 'Bitcoin Dominance', path: '/crypto/dominance', category: 'crypto' },
      { icon: FaEthereum, label: 'ETH Burn Rate', path: '/crypto/eth-burn', category: 'crypto' },
      { icon: FaCoins, label: 'Altcoin Season', path: '/crypto/altseason', badge: 'HOT', category: 'crypto' },
    ]
  },
  news: {
    title: '📰 뉴스 & 미디어',
    items: [
      { icon: FaNewspaper, label: 'AI 크롤링 뉴스', path: '/news/ai-crawl', badge: '100+', category: 'news' },
      { icon: FaBrain, label: 'AI 재작성', path: '/news/ai-rewrite', category: 'news' },
      { icon: FaSearch, label: '투자자 관점 분석', path: '/news/investor', category: 'news' },
      { icon: FaYoutube, label: 'YouTube 통합', path: '/news/youtube', category: 'news' },
      { icon: FaTwitter, label: 'Twitter 센티멘트', path: '/news/twitter', category: 'news' },
      { icon: FaGlobe, label: '추천 사이트', path: '/news/sites', category: 'news' },
      { icon: FaEnvelope, label: '뉴스레터', path: '/news/newsletter', category: 'news' },
      { icon: FaMicrophone, label: '팟캐스트', path: '/news/podcast', category: 'news' },
      { icon: FaBook, label: '리서치 리포트', path: '/news/research', category: 'news', minTier: 'Gold' },
      { icon: FaComment, label: '전문가 의견', path: '/news/experts', category: 'news' },
    ]
  },
  events: {
    title: '⚡ 실시간 이벤트',
    items: [
      { icon: FaRocket, label: '거래소 상장', path: '/events/listings', badge: 'NEW', category: 'events', isNew: true },
      { icon: FaHandshake, label: '파트너십 발표', path: '/events/partnerships', category: 'events' },
      { icon: FaNetworkWired, label: '메인넷 런칭', path: '/events/mainnet', category: 'events' },
      { icon: FaGift, label: 'Fork/Airdrop', path: '/events/airdrop', category: 'events' },
      { icon: FaFire, label: 'Burning Events', path: '/events/burning', category: 'events' },
      { icon: FaCoins, label: 'Staking Rewards', path: '/events/staking', category: 'events' },
      { icon: FaPercentage, label: 'DeFi Yields', path: '/events/yields', category: 'events' },
      { icon: FaBallotCheck, label: 'Governance Votes', path: '/events/governance', category: 'events' },
      { icon: FaCalendar, label: 'Token Unlocks', path: '/events/unlocks', badge: '중요', category: 'events' },
      { icon: FaMicrochip, label: 'Protocol Upgrades', path: '/events/upgrades', category: 'events' },
    ]
  },
  risk: {
    title: '🔍 리스크 모니터',
    items: [
      { icon: FaFire, label: 'Liquidation Heatmap', path: '/risk/liquidation', badge: '위험', category: 'risk' },
      { icon: FaExclamationTriangle, label: 'Cascade Risk', path: '/risk/cascade', category: 'risk' },
      { icon: FaBolt, label: 'Flash Crash Alert', path: '/risk/flash', category: 'risk' },
      { icon: FaSkull, label: 'Rug Pull Detector', path: '/risk/rugpull', category: 'risk' },
      { icon: FaShieldAlt, label: 'Smart Contract Risk', path: '/risk/contract', category: 'risk' },
      { icon: FaNetworkWired, label: 'Bridge Hack Monitor', path: '/risk/bridge', category: 'risk' },
      { icon: FaUniversity, label: 'Exchange Solvency', path: '/risk/solvency', category: 'risk', minTier: 'Gold' },
      { icon: MdQueryStats, label: 'Systemic Risk Index', path: '/risk/systemic', category: 'risk', minTier: 'Platinum' },
      { icon: FaRadiation, label: 'Black Swan Alert', path: '/risk/blackswan', badge: '극한', category: 'risk', minTier: 'Diamond' },
      { icon: BiAlarm, label: 'Risk Dashboard', path: '/risk/dashboard', category: 'risk' },
    ]
  },
  portfolio: {
    title: '💼 포트폴리오',
    items: [
      { icon: FaBriefcase, label: '자산 대시보드', path: '/portfolio/assets', category: 'portfolio' },
      { icon: FaCalculator, label: 'Position Sizing', path: '/portfolio/sizing', category: 'portfolio' },
      { icon: FaBalanceScale, label: 'Risk/Reward', path: '/portfolio/risk-reward', category: 'portfolio' },
      { icon: FaChartBar, label: 'Max Drawdown', path: '/portfolio/drawdown', category: 'portfolio' },
      { icon: FaChartArea, label: 'Portfolio Heatmap', path: '/portfolio/heatmap', category: 'portfolio' },
      { icon: BiStats, label: 'VAR 계산', path: '/portfolio/var', category: 'portfolio', minTier: 'Gold' },
      { icon: BiNetworkChart, label: 'Correlation Matrix', path: '/portfolio/correlation', category: 'portfolio' },
      { icon: FaPieChart, label: 'Asset Allocation', path: '/portfolio/allocation', category: 'portfolio' },
      { icon: MdAnalytics, label: 'Performance Analytics', path: '/portfolio/performance', category: 'portfolio' },
      { icon: FaWallet, label: 'Wallet Tracker', path: '/portfolio/wallets', category: 'portfolio' },
    ]
  },
  members: {
    title: '👥 회원 관리',
    items: [
      { icon: FaUsers, label: '전체 회원 조회', path: '/members/all', category: 'members', minRole: ['본사'] },
      { icon: FaUserTie, label: '역할 관리', path: '/members/roles', category: 'members', minRole: ['본사'] },
      { icon: FaKey, label: '권한 설정', path: '/members/permissions', category: 'members', minRole: ['본사'] },
      { icon: FaStore, label: '총판 관리', path: '/members/distributors', category: 'members', minRole: ['본사'] },
      { icon: FaHandshake, label: '대리점 관리', path: '/members/agencies', category: 'members', minRole: ['본사', '총판'] },
      { icon: FaGem, label: '구독자 관리', path: '/members/subscribers', category: 'members', minRole: ['본사', '총판', '대리점'] },
      { icon: BiTimer, label: '활동 로그', path: '/members/logs', category: 'members', minRole: ['본사'] },
      { icon: FaEnvelope, label: '대량 메시지', path: '/members/broadcast', category: 'members', minRole: ['본사', '총판'] },
      { icon: FaSkull, label: '블랙리스트', path: '/members/blacklist', category: 'members', minRole: ['본사'] },
      { icon: FaCrown, label: 'VIP 관리', path: '/members/vip', category: 'members', minRole: ['본사'] },
    ]
  },
  payment: {
    title: '💰 결제 & 정산',
    items: [
      { icon: FaDollarSign, label: '매출 대시보드', path: '/payment/revenue', category: 'payment', minRole: ['본사'] },
      { icon: FaMoneyBillWave, label: '정산 관리', path: '/payment/settlement', category: 'payment', minRole: ['본사', '총판'] },
      { icon: FaPercentage, label: '수수료 설정', path: '/payment/commission', category: 'payment', minRole: ['본사'] },
      { icon: FaHandshake, label: '리퍼럴 정산', path: '/payment/referral', category: 'payment' },
      { icon: FaBitcoin, label: '암호화폐 결제', path: '/payment/crypto', category: 'payment' },
      { icon: FaCreditCard, label: '카드 결제', path: '/payment/card', category: 'payment' },
      { icon: FaWallet, label: '출금 관리', path: '/payment/withdrawal', category: 'payment' },
      { icon: FaReceipt, label: '세금계산서', path: '/payment/tax', category: 'payment', minRole: ['본사', '총판'] },
      { icon: FaGift, label: '쿠폰 시스템', path: '/payment/coupon', category: 'payment' },
      { icon: FaInfinity, label: '정기 구독', path: '/payment/subscription', category: 'payment' },
    ]
  },
  marketing: {
    title: '📢 마케팅',
    items: [
      { icon: FaBullhorn, label: '캠페인 관리', path: '/marketing/campaigns', category: 'marketing', minRole: ['본사', '총판'] },
      { icon: FaTicketAlt, label: '쿠폰 발행', path: '/marketing/coupons', category: 'marketing' },
      { icon: FaUsers, label: '추천인 프로그램', path: '/marketing/referral', category: 'marketing' },
      { icon: FaCalendarCheck, label: '이벤트 관리', path: '/marketing/events', category: 'marketing' },
      { icon: FaShare, label: 'SNS 연동', path: '/marketing/social', category: 'marketing' },
      { icon: FaEnvelope, label: '이메일 마케팅', path: '/marketing/email', category: 'marketing' },
      { icon: FaChartLine, label: 'A/B 테스팅', path: '/marketing/ab-test', category: 'marketing', minTier: 'Gold' },
      { icon: FaGift, label: '보상 시스템', path: '/marketing/rewards', category: 'marketing' },
      { icon: FaBroadcastTower, label: '푸시 알림', path: '/marketing/push', category: 'marketing' },
      { icon: FaAd, label: '광고 관리', path: '/marketing/ads', category: 'marketing', minRole: ['본사'] },
    ]
  },
  analytics: {
    title: '📊 비즈니스 분석',
    items: [
      { icon: MdAnalytics, label: '실시간 대시보드', path: '/analytics/dashboard', category: 'analytics', minRole: ['본사'] },
      { icon: BiStats, label: '가입 통계', path: '/analytics/signup', category: 'analytics', minRole: ['본사', '총판'] },
      { icon: FaChartBar, label: '이탈률 분석', path: '/analytics/churn', category: 'analytics', minRole: ['본사'] },
      { icon: FaDollarSign, label: 'LTV 분석', path: '/analytics/ltv', category: 'analytics', minRole: ['본사'] },
      { icon: BiPieChart, label: 'CAC 분석', path: '/analytics/cac', category: 'analytics', minRole: ['본사'] },
      { icon: MdTimeline, label: '코호트 분석', path: '/analytics/cohort', category: 'analytics', minRole: ['본사'] },
      { icon: FaFunnel, label: '퍼널 분석', path: '/analytics/funnel', category: 'analytics', minRole: ['본사'] },
      { icon: BiLineChart, label: '수익 예측', path: '/analytics/forecast', category: 'analytics', minRole: ['본사'] },
      { icon: FaRoute, label: 'Customer Journey', path: '/analytics/journey', category: 'analytics', minRole: ['본사'] },
      { icon: MdLeaderboard, label: '실적 순위', path: '/analytics/ranking', category: 'analytics' },
    ]
  },
  education: {
    title: '🎓 교육 센터',
    items: [
      { icon: FaGraduationCap, label: '트레이딩 아카데미', path: '/education/academy', category: 'education' },
      { icon: FaBook, label: '전략 가이드', path: '/education/strategy', category: 'education' },
      { icon: FaVideo, label: '웨비나', path: '/education/webinar', category: 'education' },
      { icon: FaUserGraduate, label: '1:1 멘토링', path: '/education/mentoring', category: 'education', minTier: 'Platinum' },
      { icon: FaCertificate, label: '인증서 발급', path: '/education/certificate', category: 'education' },
      { icon: FaChalkboardTeacher, label: '초급 코스', path: '/education/beginner', category: 'education' },
      { icon: FaUserTie, label: '중급 코스', path: '/education/intermediate', category: 'education', minTier: 'Silver' },
      { icon: FaCrown, label: '고급 코스', path: '/education/advanced', category: 'education', minTier: 'Gold' },
      { icon: FaRocket, label: '전문가 코스', path: '/education/expert', category: 'education', minTier: 'Diamond' },
      { icon: FaUsers, label: '커뮤니티', path: '/education/community', category: 'education' },
    ]
  },
  system: {
    title: '⚙️ 시스템 설정',
    items: [
      { icon: FaUser, label: '프로필', path: '/system/profile', category: 'system' },
      { icon: FaCog, label: '일반 설정', path: '/system/settings', category: 'system' },
      { icon: FaShieldAlt, label: '보안 설정', path: '/system/security', category: 'system' },
      { icon: FaKey, label: 'API 키 관리', path: '/system/api-keys', category: 'system' },
      { icon: FaExchangeAlt, label: '거래소 연동', path: '/system/exchanges', category: 'system' },
      { icon: FaDatabase, label: '백업 & 복구', path: '/system/backup', category: 'system', minTier: 'Silver' },
      { icon: FaServer, label: '서버 상태', path: '/system/status', category: 'system' },
      { icon: FaCloud, label: '클라우드 동기화', path: '/system/sync', category: 'system', minTier: 'Gold' },
      { icon: FaGlobe, label: '언어 설정', path: '/system/language', category: 'system' },
      { icon: FaMoon, label: '테마 설정', path: '/system/theme', category: 'system' },
    ]
  }
}

export default function SidebarNew() {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<MenuCategory[]>(['signals'])
  const pathname = usePathname()
  
  // 임시 사용자 정보 (나중에 실제 인증 시스템과 연동)
  const [currentUser] = useState({
    role: '본사' as UserRole,
    tier: 'Black' as SubscriptionTier,
    name: '관리자'
  })

  const toggleSidebar = () => setIsOpen(!isOpen)
  
  const toggleCategory = (category: MenuCategory) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }
  
  // 역할 기반 접근 권한 확인
  const hasRoleAccess = (minRole?: UserRole[]) => {
    if (!minRole) return true
    return minRole.includes(currentUser.role)
  }
  
  // 구독 등급 기반 접근 권한 확인
  const hasTierAccess = (minTier?: SubscriptionTier) => {
    if (!minTier) return true
    const tiers: SubscriptionTier[] = ['Free', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Black']
    const currentTierIndex = tiers.indexOf(currentUser.tier)
    const requiredTierIndex = tiers.indexOf(minTier)
    return currentTierIndex >= requiredTierIndex
  }
  
  // 메뉴 아이템 필터링
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter(item => 
      hasRoleAccess(item.minRole) && hasTierAccess(item.minTier)
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`
          fixed left-0 top-0 h-screen z-40
          bg-gradient-to-b from-gray-900 via-gray-900 to-black
          border-r border-gray-800
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <AnimatePresence>
              {(isOpen || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <span className="text-white font-bold text-xl">MONSTA</span>
                  <span className="text-gray-400 text-xs">World #1 Trading</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block absolute -right-3 top-9 w-6 h-6 bg-gray-800 rounded-full border border-gray-700 text-white text-xs hover:bg-gray-700 transition-colors"
        >
          {isOpen ? '◀' : '▶'}
        </button>

        {/* Main Menu */}
        <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="space-y-3">
            {Object.entries(menuStructure).map(([category, section]) => {
              const theme = categoryThemes[category as MenuCategory]
              const isExpanded = expandedCategories.includes(category as MenuCategory)
              const filteredItems = filterMenuItems(section.items)
              
              if (filteredItems.length === 0) return null
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category as MenuCategory)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all
                      ${theme.bgColor} ${theme.borderColor} border
                      hover:brightness-110 group
                    `}
                  >
                    <AnimatePresence>
                      {(isOpen || isHovered) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-bold text-white"
                        >
                          {section.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-gray-400 group-hover:text-white"
                    >
                      ▼
                    </motion.span>
                  </button>
                  
                  {/* Category Items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-1 pl-2"
                      >
                        {filteredItems.map((item, index) => {
                          const Icon = item.icon
                          const isActive = pathname === item.path
                          const isLocked = !hasTierAccess(item.minTier)
                          
                          return (
                            <motion.li
                              key={item.path}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                            >
                              <Link
                                href={isLocked ? '#' : item.path}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg
                                  transition-all duration-200 relative group
                                  ${isActive 
                                    ? `bg-gradient-to-r ${theme.color} text-white shadow-lg` 
                                    : isLocked
                                    ? 'text-gray-600 hover:text-gray-500 bg-gray-900/50 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                  }
                                `}
                                onClick={isLocked ? (e) => e.preventDefault() : undefined}
                              >
                                <div className="relative">
                                  <Icon size={18} className="flex-shrink-0" />
                                  {isLocked && (
                                    <FaLock size={10} className="absolute -bottom-1 -right-1 text-yellow-500" />
                                  )}
                                </div>
                                <AnimatePresence>
                                  {(isOpen || isHovered) && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="flex-1 flex items-center justify-between"
                                    >
                                      <span className={`font-medium text-sm ${
                                        isLocked ? 'opacity-50' : ''
                                      }`}>
                                        {item.label}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        {item.minTier && !hasTierAccess(item.minTier) && (
                                          <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full font-bold">
                                            {item.minTier}
                                          </span>
                                        )}
                                        {item.isAlpha && (
                                          <span className="px-1.5 py-0.5 text-xs bg-black text-yellow-400 border border-yellow-400 rounded-full font-bold">
                                            ALPHA
                                          </span>
                                        )}
                                        {item.badge && (
                                          <span className={`
                                            px-1.5 py-0.5 text-xs rounded-full font-bold
                                            ${item.badge === 'LIVE' ? 'bg-red-500 text-white animate-pulse' :
                                              item.badge === 'HOT' || item.isHot ? 'bg-orange-500 text-white' :
                                              item.badge === 'NEW' || item.isNew ? 'bg-green-500 text-white' :
                                              item.badge === 'PRO' ? 'bg-purple-500 text-white' :
                                              item.badge === 'VIP' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
                                              item.badge === 'AI' ? 'bg-blue-500 text-white' :
                                              item.badge === 'GAME' ? 'bg-pink-500 text-white' :
                                              item.badge === 'MEV' ? 'bg-red-600 text-white' :
                                              item.badge === '극속' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                                              item.badge === '최첨단' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                                              item.badge === '종합' ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' :
                                              item.badge === '위험' ? 'bg-red-600 text-white' :
                                              item.badge === '극한' ? 'bg-black text-red-500 border border-red-500' :
                                              item.badge === '중요' ? 'bg-yellow-500 text-black' :
                                              item.badge === '인기' ? 'bg-pink-500 text-white' :
                                              item.badge === '100+' ? 'bg-blue-600 text-white' :
                                              'bg-gray-700 text-gray-300'}
                                          `}>
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Link>
                            </motion.li>
                          )
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </nav>

        {/* User Info & Subscription */}
        <div className="p-4 border-t border-gray-800">
          <AnimatePresence>
            {(isOpen || isHovered) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* User Status */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      currentUser.tier === 'Black' ? 'from-black to-gray-800 border-2 border-yellow-400' :
                      currentUser.tier === 'Diamond' ? 'from-cyan-400 to-blue-500' :
                      currentUser.tier === 'Platinum' ? 'from-gray-300 to-gray-500' :
                      currentUser.tier === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                      currentUser.tier === 'Silver' ? 'from-gray-400 to-gray-600' :
                      'from-green-400 to-blue-500'
                    }`}>
                      <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium">{currentUser.name}</p>
                      <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded font-bold">
                        {currentUser.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold ${
                        currentUser.tier === 'Black' ? 'text-yellow-400' :
                        currentUser.tier === 'Diamond' ? 'text-cyan-400' :
                        currentUser.tier === 'Platinum' ? 'text-gray-300' :
                        currentUser.tier === 'Gold' ? 'text-yellow-500' :
                        currentUser.tier === 'Silver' ? 'text-gray-400' :
                        'text-green-400'
                      }`}>
                        {currentUser.tier} {currentUser.tier === 'Black' ? '∞' : 'Plan'}
                      </p>
                      {currentUser.tier === 'Black' && (
                        <span className="text-xs text-yellow-400">무제한</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Role & Tier Info */}
                <div className="text-xs space-y-1 p-2 bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-500">접근 권한:</span>
                    <span className="text-gray-400">{currentUser.role} 레벨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">구독 등급:</span>
                    <span className="text-gray-400">{currentUser.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">활성 메뉴:</span>
                    <span className="text-gray-400">300+ 기능</span>
                  </div>
                </div>
                
                {/* Upgrade Button (Black 등급이 아닌 경우만) */}
                {currentUser.tier !== 'Black' && (
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg">
                    ⚡ 업그레이드
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isOpen && !isHovered && (
            <div className="relative">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br mx-auto ${
                currentUser.tier === 'Black' ? 'from-black to-gray-800 border-2 border-yellow-400' :
                currentUser.tier === 'Diamond' ? 'from-cyan-400 to-blue-500' :
                currentUser.tier === 'Platinum' ? 'from-gray-300 to-gray-500' :
                currentUser.tier === 'Gold' ? 'from-yellow-400 to-yellow-600' :
                currentUser.tier === 'Silver' ? 'from-gray-400 to-gray-600' :
                'from-green-400 to-blue-500'
              }`}>
                <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs" />
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="lg:hidden fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>
    </>
  )
}