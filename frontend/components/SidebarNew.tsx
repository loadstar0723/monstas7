'use client'

import { useState, useMemo } from 'react'
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
  FaDiscord, FaSlack, FaWhatsapp, FaYoutube, FaTwitter,
  FaVoteYea, FaCalendar, FaCertificate, FaChalkboardTeacher, 
  FaUserGraduate, FaAd, FaBullhorn, FaRoute, FaReceipt, 
  FaShare, FaMoon, FaFilter, FaCreditCard, FaChevronDown, FaChevronRight, FaBan
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
  MdBubbleChart, MdScatterPlot, MdPieChart,
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

// 카테고리 그룹 정의 (새로운 그룹핑)
type CategoryGroup = 'trading' | 'analysis' | 'community' | 'management'

// 카테고리별 색상 테마 (20개)
const categoryThemes = {
  signals: { color: 'from-cyan-600 to-blue-600', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', icon: FaSignal },
  quant: { color: 'from-purple-600 to-indigo-600', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20', icon: FaChartBar },
  microstructure: { color: 'from-pink-600 to-rose-600', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20', icon: BiRadar },
  technical: { color: 'from-blue-600 to-indigo-600', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', icon: MdShowChart },
  ai: { color: 'from-violet-600 to-purple-600', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20', icon: FaBrain },
  automation: { color: 'from-green-600 to-emerald-600', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', icon: FaRobot },
  telegram: { color: 'from-sky-600 to-blue-600', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/20', icon: FaTelegram },
  gaming: { color: 'from-orange-600 to-red-600', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20', icon: FaGamepad },
  macro: { color: 'from-teal-600 to-cyan-600', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20', icon: FaGlobe },
  crypto: { color: 'from-yellow-600 to-amber-600', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', icon: FaBitcoin },
  news: { color: 'from-lime-600 to-green-600', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/20', icon: FaNewspaper },
  events: { color: 'from-amber-600 to-orange-600', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: FaCalendar },
  risk: { color: 'from-red-600 to-rose-600', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', icon: FaShieldAlt },
  portfolio: { color: 'from-indigo-600 to-blue-600', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20', icon: FaWallet },
  members: { color: 'from-slate-600 to-gray-600', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/20', icon: FaUsers },
  payment: { color: 'from-emerald-600 to-green-600', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: FaCreditCard },
  marketing: { color: 'from-fuchsia-600 to-pink-600', bgColor: 'bg-fuchsia-500/10', borderColor: 'border-fuchsia-500/20', icon: FaBullhorn },
  analytics: { color: 'from-blue-700 to-indigo-700', bgColor: 'bg-blue-600/10', borderColor: 'border-blue-600/20', icon: MdAnalytics },
  education: { color: 'from-rose-600 to-pink-600', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20', icon: FaGraduationCap },
  system: { color: 'from-gray-600 to-slate-600', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20', icon: FaCog }
}

// 카테고리 그룹 정의
const categoryGroups = {
  trading: {
    title: '🚀 트레이딩',
    categories: ['signals', 'quant', 'microstructure', 'technical', 'automation'],
    color: 'from-blue-600/20 to-purple-600/20',
    borderColor: 'border-blue-500/30'
  },
  analysis: {
    title: '📊 분석 & AI',
    categories: ['ai', 'risk', 'portfolio', 'macro', 'crypto'],
    color: 'from-purple-600/20 to-pink-600/20',
    borderColor: 'border-purple-500/30'
  },
  community: {
    title: '🌐 커뮤니티',
    categories: ['telegram', 'gaming', 'news', 'events', 'education'],
    color: 'from-green-600/20 to-teal-600/20',
    borderColor: 'border-green-500/30'
  },
  management: {
    title: '⚙️ 관리',
    categories: ['members', 'payment', 'marketing', 'analytics', 'system'],
    color: 'from-gray-600/20 to-slate-600/20',
    borderColor: 'border-gray-500/30'
  }
}

// 메뉴 구조 정의 (20개 카테고리, 301개 항목)
const menuStructure: { [key in MenuCategory]: { title: string, items: MenuItem[] } } = {
  signals: {
    title: '📡 프리미엄 시그널',
    items: [
      { icon: FaSignal, label: '스마트 머니 시그널', path: '/signals/smart-money', badge: 'HOT', category: 'signals', isHot: true },
      { icon: FaWhatsapp, label: '고래 추적기', path: '/signals/whale-tracker', category: 'signals' },
      { icon: FaBinoculars, label: '인사이더 플로우', path: '/signals/insider-flow', category: 'signals', isPremium: true },
      { icon: FaSkull, label: '청산 히트맵', path: '/signals/liquidation', category: 'signals' },
      { icon: FaExchangeAlt, label: 'DEX 플로우', path: '/signals/dex-flow', category: 'signals' },
      { icon: FaCalculator, label: '펀딩 비율', path: '/signals/funding-rate', category: 'signals' },
      { icon: BiTargetLock, label: '비정상 옵션', path: '/signals/unusual-options', category: 'signals' },
      { icon: FaVolumeUp, label: '소셜 감성', path: '/signals/social-sentiment', category: 'signals' },
      { icon: MdGraphicEq, label: '공포탐욕 지수', path: '/signals/fear-greed', category: 'signals' },
      { icon: FaDollarSign, label: '차익거래 기회', path: '/signals/arbitrage', category: 'signals', isNew: true }
    ]
  },
  quant: {
    title: '📈 퀀트 전략',
    items: [
      { icon: MdAutoGraph, label: '백테스팅', path: '/quant/backtesting', category: 'quant' },
      { icon: FaInfinity, label: '그리드 봇', path: '/quant/grid-bot', category: 'quant', isHot: true },
      { icon: MdSwapHoriz, label: '페어 트레이딩', path: '/quant/pair-trading', category: 'quant' },
      { icon: BiBot, label: '마켓 메이킹', path: '/quant/market-making', category: 'quant', isPremium: true },
      { icon: MdAutorenew, label: 'DCA 봇', path: '/quant/dca', category: 'quant' },
      { icon: FaChartArea, label: '평균회귀', path: '/quant/mean-reversion', category: 'quant' },
      { icon: BiTrendingUp, label: '모멘텀', path: '/quant/momentum', category: 'quant' },
      { icon: FaChartPie, label: '옵션 전략', path: '/quant/options', category: 'quant' },
      { icon: BiGrid, label: '차익거래 봇', path: '/quant/arbitrage', category: 'quant', isNew: true },
      { icon: FaRocket, label: '전략 빌더', path: '/quant/strategy-builder', category: 'quant' }
    ]
  },
  microstructure: {
    title: '🔬 마이크로 구조',
    items: [
      { icon: BiRadar, label: '오더플로우', path: '/microstructure/orderflow', category: 'microstructure', isHot: true },
      { icon: FaLayerGroup, label: '오더북 히트맵', path: '/microstructure/orderbook', category: 'microstructure' },
      { icon: FaWater, label: '유동성 풀', path: '/microstructure/liquidity', category: 'microstructure' },
      { icon: BiPulse, label: '풋프린트 차트', path: '/microstructure/footprint', category: 'microstructure', isPremium: true },
      { icon: MdBubbleChart, label: '임밸런스', path: '/microstructure/imbalance', category: 'microstructure' },
      { icon: FaRadiation, label: '스푸핑 감지', path: '/microstructure/spoofing', category: 'microstructure' },
      { icon: BiNetworkChart, label: 'HFT 패턴', path: '/microstructure/hft', category: 'microstructure' },
      { icon: MdTimeline, label: '테이프 리딩', path: '/microstructure/tape-reading', category: 'microstructure' },
      { icon: FaBolt, label: '스윕 감지', path: '/microstructure/sweep', category: 'microstructure' },
      { icon: FaFingerprint, label: '핀 바', path: '/microstructure/pin', category: 'microstructure', isNew: true }
    ]
  },
  technical: {
    title: '📊 기술적 분석',
    items: [
      { icon: MdShowChart, label: '지표', path: '/technical/indicators', category: 'technical' },
      { icon: FaProjectDiagram, label: '패턴 인식', path: '/technical/patterns', category: 'technical' },
      { icon: FaBalanceScale, label: '지지저항', path: '/technical/support', category: 'technical' },
      { icon: MdCandlestickChart, label: '볼륨 프로파일', path: '/technical/profile', category: 'technical', isPremium: true },
      { icon: FaWaveSquare, label: '엘리엇 파동', path: '/technical/elliott', category: 'technical' },
      { icon: FaRing, label: '피보나치', path: '/technical/fibonacci', category: 'technical' },
      { icon: BiShapePolygon, label: '하모닉 패턴', path: '/technical/harmonic', category: 'technical' },
      { icon: FaChessQueen, label: '와이코프', path: '/technical/wyckoff', category: 'technical' },
      { icon: MdStackedLineChart, label: 'SMC', path: '/technical/smc', category: 'technical', isHot: true },
      { icon: BiBarChart, label: 'CVD', path: '/technical/cvd', category: 'technical' },
      { icon: MdDataUsage, label: 'OI 플로우', path: '/technical/ofi', category: 'technical' },
      { icon: BiCylinder, label: '볼륨 분석', path: '/technical/volume', category: 'technical' },
      { icon: FaWater, label: '유동성 맵', path: '/technical/liquidity', category: 'technical', isNew: true },
      { icon: FaSkull, label: '청산 차트', path: '/technical/obituary', category: 'technical' }
    ]
  },
  ai: {
    title: '🤖 AI 분석',
    items: [
      { icon: FaBrain, label: 'GPT 예측', path: '/ai/gpt', category: 'ai', isHot: true },
      { icon: BiAnalyse, label: '패턴 인식 AI', path: '/ai/pattern-recognition', category: 'ai' },
      { icon: FaAtom, label: '신경망 예측', path: '/ai/neural', category: 'ai' },
      { icon: MdAutoGraph, label: '감성 분석', path: '/ai/sentiment', category: 'ai' },
      { icon: FaDna, label: '가격 예측', path: '/ai/predictions', category: 'ai', isPremium: true },
      { icon: BiData, label: '앙상블 모델', path: '/ai/ensemble', category: 'ai' },
      { icon: FaFlask, label: '강화학습', path: '/ai/reinforcement', category: 'ai' },
      { icon: BiScatterChart, label: '클러스터링', path: '/ai/clustering', category: 'ai' },
      { icon: FaLightbulb, label: '이상 탐지', path: '/ai/anomaly', category: 'ai' },
      { icon: FaMagic, label: '자연어 처리', path: '/ai/nlp', category: 'ai' },
      { icon: FaSpaceShuttle, label: '양자 컴퓨팅', path: '/ai/quantum', category: 'ai', isAlpha: true }
    ]
  },
  automation: {
    title: '⚙️ 자동화',
    items: [
      { icon: FaRobot, label: '자동 트레이딩', path: '/automation/copy-trading', category: 'automation', isHot: true },
      { icon: BiBot, label: 'API 봇', path: '/automation/api-bot', category: 'automation' },
      { icon: FaCodeBranch, label: '웹훅 트레이딩', path: '/automation/webhook', category: 'automation' },
      { icon: FaCubes, label: '파인스크립트', path: '/automation/pine-script', category: 'automation' },
      { icon: FaNetworkWired, label: '전략 빌더', path: '/automation/builder', category: 'automation', isPremium: true },
      { icon: FaStream, label: '페이퍼 트레이딩', path: '/automation/paper-trading', category: 'automation' },
      { icon: MdSpeed, label: '성능 모니터링', path: '/automation/performance', category: 'automation' },
      { icon: FaShieldAlt, label: '리스크 관리', path: '/automation/risk-management', category: 'automation' },
      { icon: FaCloud, label: '클라우드 봇', path: '/automation/cloud', category: 'automation', isNew: true },
      { icon: FaStore, label: '봇 마켓플레이스', path: '/automation/marketplace', category: 'automation' }
    ]
  },
  telegram: {
    title: '💬 텔레그램',
    items: [
      { icon: FaTelegram, label: '봇 설정', path: '/telegram/setup', category: 'telegram' },
      { icon: FaBell, label: '알림 설정', path: '/telegram/alerts', category: 'telegram', isHot: true },
      { icon: FaPaperPlane, label: '시그널 전송', path: '/telegram/signals', category: 'telegram' },
      { icon: FaComment, label: '명령어 관리', path: '/telegram/commands', category: 'telegram' },
      { icon: FaUsers, label: '그룹 관리', path: '/telegram/groups', category: 'telegram' },
      { icon: BiStats, label: '통계 봇', path: '/telegram/stats', category: 'telegram' },
      { icon: FaGamepad, label: '게임 봇', path: '/telegram/games', category: 'telegram', isNew: true },
      { icon: FaExchangeAlt, label: '트레이딩 봇', path: '/telegram/trading', category: 'telegram' },
      { icon: FaCrown, label: '프리미엄 채널', path: '/telegram/premium', category: 'telegram', isPremium: true },
      { icon: FaGlobe, label: '다국어 지원', path: '/telegram/multi-language', category: 'telegram' }
    ]
  },
  gaming: {
    title: '🎮 게이미피케이션',
    items: [
      { icon: FaTrophy, label: '트레이딩 배틀', path: '/gaming/trading-battle', category: 'gaming', isHot: true },
      { icon: MdLeaderboard, label: '리더보드', path: '/gaming/leaderboard', category: 'gaming' },
      { icon: FaAward, label: '업적 시스템', path: '/gaming/achievements', category: 'gaming' },
      { icon: FaGift, label: '리워드 센터', path: '/gaming/rewards', category: 'gaming' },
      { icon: FaDice, label: '예측 게임', path: '/gaming/prediction', category: 'gaming' },
      { icon: FaChess, label: '페이퍼 대회', path: '/gaming/paper-competition', category: 'gaming' },
      { icon: FaTheaterMasks, label: '소셜 트레이딩', path: '/gaming/social-trading', category: 'gaming' },
      { icon: FaGem, label: 'NFT 리워드', path: '/gaming/nft', category: 'gaming', isNew: true },
      { icon: FaUsers, label: '길드 시스템', path: '/gaming/guild', category: 'gaming' },
      { icon: FaPuzzlePiece, label: '메타버스', path: '/gaming/metaverse', category: 'gaming', isAlpha: true }
    ]
  },
  macro: {
    title: '🌍 매크로 경제',
    items: [
      { icon: FaGlobe, label: '경제 지표', path: '/macro/indicators', category: 'macro' },
      { icon: FaUniversity, label: '중앙은행', path: '/macro/central-banks', category: 'macro', isHot: true },
      { icon: FaPercentage, label: '금리', path: '/macro/interest-rates', category: 'macro' },
      { icon: FaMoneyBillWave, label: 'DXY 지수', path: '/macro/dxy', category: 'macro' },
      { icon: FaPiggyBank, label: '인플레이션', path: '/macro/inflation', category: 'macro' },
      { icon: BiLineChart, label: '채권', path: '/macro/bonds', category: 'macro' },
      { icon: FaCoins, label: '원자재', path: '/macro/commodities', category: 'macro' },
      { icon: MdSwapHoriz, label: '외환', path: '/macro/forex', category: 'macro' },
      { icon: FaFlag, label: '지정학', path: '/macro/geopolitics', category: 'macro' },
      { icon: FaCalendar, label: '경제 캘린더', path: '/macro/calendar', category: 'macro', isPremium: true }
    ]
  },
  crypto: {
    title: '🪙 크립토',
    items: [
      { icon: FaBitcoin, label: '실시간 차트', path: '/crypto/live', category: 'crypto' },
      { icon: FaEthereum, label: '온체인 분석', path: '/crypto/onchain', category: 'crypto', isHot: true },
      { icon: BiCoinStack, label: 'DeFi 모니터', path: '/crypto/defi', category: 'crypto' },
      { icon: FaGem, label: 'NFT 트래커', path: '/crypto/nft', category: 'crypto' },
      { icon: FaChartLine, label: '도미넌스', path: '/crypto/dominance', category: 'crypto' },
      { icon: FaMedal, label: '알트시즌', path: '/crypto/altseason', category: 'crypto' },
      { icon: FaDatabase, label: '시가총액', path: '/crypto/marketcap', category: 'crypto' },
      { icon: FaKey, label: '스테이킹', path: '/crypto/staking', category: 'crypto' },
      { icon: FaMicrochip, label: '채굴 정보', path: '/crypto/mining', category: 'crypto' },
      { icon: FaLayerGroup, label: '레이어2', path: '/crypto/layer2', category: 'crypto', isNew: true }
    ]
  },
  news: {
    title: '📰 뉴스 & 리서치',
    items: [
      { icon: FaNewspaper, label: '실시간 뉴스', path: '/news/realtime', category: 'news' },
      { icon: BiAnalyse, label: 'AI 요약', path: '/news/ai-summary', category: 'news', isHot: true },
      { icon: FaSearch, label: '리서치 보고서', path: '/news/research', category: 'news' },
      { icon: FaVolumeUp, label: '감성 분석', path: '/news/sentiment', category: 'news' },
      { icon: FaBook, label: '시장 분석', path: '/news/analysis', category: 'news' },
      { icon: FaHandshake, label: '파트너십', path: '/news/partnerships', category: 'news' },
      { icon: FaLock, label: '규제 뉴스', path: '/news/regulation', category: 'news' },
      { icon: FaExclamationTriangle, label: '해킹 알림', path: '/news/hacks', category: 'news' },
      { icon: FaDollarSign, label: '펀딩 뉴스', path: '/news/funding', category: 'news' },
      { icon: FaStar, label: '인플루언서', path: '/news/influencers', category: 'news', isPremium: true }
    ]
  },
  events: {
    title: '📅 이벤트',
    items: [
      { icon: FaCalendar, label: '이벤트 캘린더', path: '/events/calendar', category: 'events' },
      { icon: FaGift, label: '에어드랍', path: '/events/airdrops', category: 'events', isHot: true },
      { icon: FaRocket, label: 'IEO/IDO', path: '/events/ieo', category: 'events' },
      { icon: BiCalendarEvent, label: '메인넷 런칭', path: '/events/mainnet', category: 'events' },
      { icon: FaKey, label: '토큰 언락', path: '/events/unlocks', category: 'events' },
      { icon: FaCrown, label: '스테이킹', path: '/events/staking', category: 'events' },
      { icon: FaVoteYea, label: '거버넌스 투표', path: '/events/governance', category: 'events' },
      { icon: FaGem, label: 'NFT 드롭', path: '/events/nft-drops', category: 'events' },
      { icon: FaBitcoin, label: '반감기', path: '/events/halving', category: 'events' },
      { icon: FaServer, label: '업그레이드', path: '/events/upgrades', category: 'events' },
      { icon: FaMicrophone, label: 'AMA 세션', path: '/events/ama', category: 'events', isNew: true },
      { icon: FaUniversity, label: '컨퍼런스', path: '/events/conferences', category: 'events' },
      { icon: FaPercentage, label: '이자 농사', path: '/events/yields', category: 'events', isPremium: true }
    ]
  },
  risk: {
    title: '🛡️ 리스크 관리',
    items: [
      { icon: FaCalculator, label: '포지션 계산기', path: '/risk/calculator', category: 'risk' },
      { icon: FaShieldAlt, label: '손절 설정', path: '/risk/stop-loss', category: 'risk' },
      { icon: BiBarChart, label: 'VaR 분석', path: '/risk/var', category: 'risk', isPremium: true },
      { icon: FaChartLine, label: '드로다운', path: '/risk/drawdown', category: 'risk' },
      { icon: FaBalanceScale, label: '헷징 전략', path: '/risk/hedging', category: 'risk' },
      { icon: FaDice, label: '켈리 공식', path: '/risk/kelly', category: 'risk' },
      { icon: BiPieChart, label: '포지션 사이징', path: '/risk/position-sizing', category: 'risk' },
      { icon: FaExclamationTriangle, label: '스트레스 테스트', path: '/risk/stress-test', category: 'risk' },
      { icon: BiScatterChart, label: '상관관계', path: '/risk/correlation', category: 'risk' },
      { icon: FaChess, label: '시나리오 분석', path: '/risk/scenario', category: 'risk', isNew: true }
    ]
  },
  portfolio: {
    title: '💼 포트폴리오',
    items: [
      { icon: FaBriefcase, label: '포트폴리오 개요', path: '/portfolio/overview', category: 'portfolio' },
      { icon: FaChartPie, label: '자산 배분', path: '/portfolio/allocation', category: 'portfolio' },
      { icon: BiLineChart, label: '성과 분석', path: '/portfolio/performance', category: 'portfolio' },
      { icon: FaDollarSign, label: '손익 현황', path: '/portfolio/pnl', category: 'portfolio' },
      { icon: FaHistory, label: '거래 내역', path: '/portfolio/history', category: 'portfolio' },
      { icon: FaBalanceScale, label: '리밸런싱', path: '/portfolio/rebalancing', category: 'portfolio', isPremium: true },
      { icon: MdAnalytics, label: '샤프 비율', path: '/portfolio/sharpe', category: 'portfolio' },
      { icon: BiScatterChart, label: '상관관계', path: '/portfolio/correlation', category: 'portfolio' },
      { icon: FaCalculator, label: '세금 계산', path: '/portfolio/tax', category: 'portfolio' },
      { icon: FaWallet, label: '지갑 연동', path: '/portfolio/wallets', category: 'portfolio' },
      { icon: BiData, label: '최적화', path: '/portfolio/optimization', category: 'portfolio', isNew: true },
      { icon: FaEye, label: '추적 관리', path: '/portfolio/tracking', category: 'portfolio' },
      { icon: FaServer, label: '백업/복원', path: '/portfolio/export', category: 'portfolio' },
      { icon: FaCloud, label: '데이터 가져오기', path: '/portfolio/import', category: 'portfolio' },
      { icon: FaExclamationTriangle, label: 'VaR 분석', path: '/portfolio/var', category: 'portfolio' }
    ]
  },
  members: {
    title: '👥 회원 관리',
    items: [
      { icon: FaUsers, label: '회원 목록', path: '/members/list', category: 'members' },
      { icon: FaUserTie, label: '역할 관리', path: '/members/roles', category: 'members' },
      { icon: FaKey, label: '권한 설정', path: '/members/permissions', category: 'members' },
      { icon: FaCrown, label: 'VIP 관리', path: '/members/vip', category: 'members', isPremium: true },
      { icon: FaHandshake, label: '추천인 관리', path: '/members/referral', category: 'members' },
      { icon: BiStats, label: '활동 통계', path: '/members/activity', category: 'members' },
      { icon: FaEnvelope, label: '고객 지원', path: '/members/support', category: 'members' },
      { icon: FaLock, label: 'KYC 인증', path: '/members/kyc', category: 'members' },
      { icon: FaBan, label: '차단 관리', path: '/members/ban', category: 'members' },
      { icon: FaDatabase, label: '대량 처리', path: '/members/bulk', category: 'members', isNew: true }
    ]
  },
  payment: {
    title: '💳 결제 관리',
    items: [
      { icon: FaCreditCard, label: '결제 수단', path: '/payment/methods', category: 'payment' },
      { icon: FaWallet, label: '구독 플랜', path: '/payment/plans', category: 'payment' },
      { icon: FaHistory, label: '결제 내역', path: '/payment/history', category: 'payment' },
      { icon: FaReceipt, label: '인보이스', path: '/payment/invoices', category: 'payment' },
      { icon: FaGift, label: '쿠폰 관리', path: '/payment/coupon', category: 'payment' },
      { icon: FaHandshake, label: '추천 보상', path: '/payment/referral', category: 'payment' },
      { icon: FaBitcoin, label: '크립토 결제', path: '/payment/crypto', category: 'payment', isHot: true },
      { icon: FaMoneyBillWave, label: '출금 관리', path: '/payment/withdrawal', category: 'payment' },
      { icon: FaCalculator, label: '세금 보고서', path: '/payment/tax', category: 'payment' },
      { icon: FaCreditCard, label: '카드 관리', path: '/payment/card', category: 'payment', isNew: true }
    ]
  },
  marketing: {
    title: '📣 마케팅',
    items: [
      { icon: FaBullhorn, label: '캠페인 관리', path: '/marketing/campaigns', category: 'marketing' },
      { icon: FaAd, label: '광고 관리', path: '/marketing/analytics', category: 'marketing' },
      { icon: FaEnvelope, label: '이메일 마케팅', path: '/marketing/email', category: 'marketing' },
      { icon: FaShare, label: '소셜 미디어', path: '/marketing/social', category: 'marketing' },
      { icon: FaHandshake, label: '제휴 프로그램', path: '/marketing/affiliate', category: 'marketing', isPremium: true },
      { icon: FaGift, label: '리워드 프로그램', path: '/marketing/rewards', category: 'marketing' },
      { icon: FaRoute, label: '추천 프로그램', path: '/marketing/referral', category: 'marketing' },
      { icon: FaTicketAlt, label: '이벤트 관리', path: '/marketing/events', category: 'marketing' },
      { icon: FaPercentage, label: '할인 쿠폰', path: '/marketing/coupons', category: 'marketing' },
      { icon: BiAnalyse, label: 'A/B 테스트', path: '/marketing/ab-test', category: 'marketing', isNew: true }
    ]
  },
  analytics: {
    title: '📊 애널리틱스',
    items: [
      { icon: MdAnalytics, label: '대시보드', path: '/analytics/dashboard', category: 'analytics' },
      { icon: FaChartBar, label: '사용자 분석', path: '/analytics/users', category: 'analytics' },
      { icon: BiStats, label: '수익 분석', path: '/analytics/revenue', category: 'analytics' },
      { icon: FaFilter, label: '퍼널 분석', path: '/analytics/funnel', category: 'analytics' },
      { icon: BiLineChart, label: '코호트 분석', path: '/analytics/cohort', category: 'analytics', isPremium: true },
      { icon: FaChartArea, label: '리텐션', path: '/analytics/retention', category: 'analytics' },
      { icon: MdQueryStats, label: '예측 분석', path: '/analytics/predictive', category: 'analytics' },
      { icon: FaBook, label: '리포트', path: '/analytics/reports', category: 'analytics' },
      { icon: FaDatabase, label: '데이터 내보내기', path: '/analytics/export', category: 'analytics' },
      { icon: BiAnalyse, label: 'A/B 테스트', path: '/analytics/ab-test', category: 'analytics', isNew: true }
    ]
  },
  education: {
    title: '🎓 교육',
    items: [
      { icon: FaBook, label: '기초 강의', path: '/education/basics', category: 'education' },
      { icon: MdShowChart, label: '기술적 분석', path: '/education/technical', category: 'education' },
      { icon: FaGlobe, label: '펀더멘탈', path: '/education/fundamental', category: 'education' },
      { icon: FaBrain, label: '투자 심리', path: '/education/psychology', category: 'education' },
      { icon: FaShieldAlt, label: '리스크 관리', path: '/education/risk', category: 'education' },
      { icon: FaChess, label: '전략 강의', path: '/education/strategies', category: 'education', isPremium: true },
      { icon: FaEthereum, label: 'DeFi 교육', path: '/education/defi', category: 'education' },
      { icon: FaBook, label: '용어 사전', path: '/education/glossary', category: 'education' },
      { icon: FaVideo, label: '웨비나', path: '/education/webinar', category: 'education' },
      { icon: FaCertificate, label: '자격증 과정', path: '/education/certification', category: 'education', isNew: true }
    ]
  },
  system: {
    title: '⚙️ 시스템 설정',
    items: [
      { icon: FaUser, label: '계정 설정', path: '/system/account', category: 'system' },
      { icon: FaBell, label: '알림 설정', path: '/system/notifications', category: 'system' },
      { icon: FaLock, label: '보안 설정', path: '/system/security', category: 'system' },
      { icon: FaKey, label: 'API 키', path: '/system/api', category: 'system' },
      { icon: FaNetworkWired, label: '연동 관리', path: '/system/integrations', category: 'system' },
      { icon: FaMoon, label: '테마 설정', path: '/system/theme', category: 'system' },
      { icon: FaGlobe, label: '언어 설정', path: '/system/language', category: 'system' },
      { icon: FaDatabase, label: '백업/복원', path: '/system/backup', category: 'system' },
      { icon: FaShieldAlt, label: '개인정보', path: '/system/privacy', category: 'system' },
      { icon: FaCog, label: '고급 설정', path: '/system/advanced', category: 'system', isPremium: true }
    ]
  }
}

export default function SidebarNew() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['trading'])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // 검색 결과 필터링
  const searchResults = useMemo(() => {
    if (!searchTerm) return []
    
    const results: MenuItem[] = []
    Object.values(menuStructure).forEach(category => {
      category.items.forEach(item => {
        if (item.label.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(item)
        }
      })
    })
    return results
  }, [searchTerm])

  // 그룹 토글
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    )
  }

  // 카테고리 토글
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all"
      >
        {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {/* 사이드바 */}
      <div
        className={`fixed left-0 top-0 h-full bg-gray-900 text-white z-40 overflow-hidden flex flex-col
                   w-72 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MONSTA AI
              </h1>
              <span className="text-xs px-2 py-1 bg-purple-600 rounded-full">v7.0</span>
            </div>

            {/* 검색바 */}
            <div className="relative">
              <input
                type="text"
                placeholder="메뉴 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
              <FaSearch className="absolute right-3 top-2.5 text-gray-400 text-sm pointer-events-none" />
            </div>

            {/* 검색 결과 */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-24 left-4 right-4 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.path}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setSearchTerm('')
                      setIsOpen(false)
                    }}
                  >
                    <item.icon className="text-sm" />
                    <span className="text-sm">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        item.isHot ? 'bg-red-500' : 
                        item.isNew ? 'bg-green-500' : 
                        item.isPremium ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 메뉴 그룹 */}
          <div className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
            {Object.entries(categoryGroups).map(([groupKey, group]) => (
              <div key={groupKey} className="mb-4">
                {/* 그룹 헤더 */}
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-2
                            bg-gradient-to-r ${group.color} border ${group.borderColor}
                            hover:opacity-90 transition-all active:scale-95`}
                >
                  <span className="text-sm font-bold">{group.title}</span>
                  {expandedGroups.includes(groupKey) ? 
                    <FaChevronDown className="text-xs" /> : 
                    <FaChevronRight className="text-xs" />
                  }
                </button>

                {/* 그룹 내 카테고리 */}
                <AnimatePresence>
                  {expandedGroups.includes(groupKey) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {group.categories.map(categoryKey => {
                        const category = menuStructure[categoryKey as MenuCategory]
                        const theme = categoryThemes[categoryKey as MenuCategory]
                        const isExpanded = expandedCategories.includes(categoryKey)
                        
                        return (
                          <div key={categoryKey} className="mb-2 ml-2">
                            {/* 카테고리 헤더 */}
                            <button
                              onClick={() => toggleCategory(categoryKey)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg
                                        ${theme.bgColor} ${theme.borderColor} border
                                        hover:bg-gray-800/50 transition-all text-left active:scale-95`}
                            >
                              <div className="flex items-center gap-2">
                                <theme.icon className="text-xs" />
                                <span className="text-xs font-medium">{category.title}</span>
                                <span className="text-[10px] text-gray-400">
                                  ({category.items.length})
                                </span>
                              </div>
                              {isExpanded ? 
                                <FaChevronDown className="text-[10px]" /> : 
                                <FaChevronRight className="text-[10px]" />
                              }
                            </button>

                            {/* 카테고리 아이템 */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-1 ml-4"
                                >
                                  {category.items.map((item, idx) => (
                                    <Link
                                      key={idx}
                                      href={item.path}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                                                hover:bg-gray-800 transition-all
                                                ${pathname === item.path ? 'bg-gray-800 border-l-2 border-purple-500' : ''}`}
                                      onClick={() => setIsOpen(false)}
                                    >
                                      <item.icon className="text-[10px]" />
                                      <span className="flex-1">{item.label}</span>
                                      {item.isHot && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-red-500 rounded-full">
                                          HOT
                                        </span>
                                      )}
                                      {item.isNew && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500 rounded-full">
                                          NEW
                                        </span>
                                      )}
                                      {item.isPremium && (
                                        <FaCrown className="text-yellow-500 text-[10px]" />
                                      )}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* 하단 정보 */}
          <div className="p-3 border-t border-gray-800 text-xs text-gray-400">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px]">총 {Object.values(menuStructure).reduce((acc, cat) => acc + cat.items.length, 0)}개 메뉴</span>
                <span className="text-[11px]">20개 카테고리</span>
              </div>
              <div className="text-center text-[10px] text-gray-500">
                © 2024 MONSTA AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </>
  )
}