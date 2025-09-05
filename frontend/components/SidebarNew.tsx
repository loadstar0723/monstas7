'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/SidebarContext'
import { tierLevels, categoryMinTiers, menuTierOverrides } from '@/lib/tierConfig'
import { 
  FaHome, FaChartLine, FaRobot, FaBriefcase, FaHistory,
  FaTelegram, FaUsers, FaGraduationCap, FaNewspaper,
  FaUser, FaCog, FaBars, FaTimes, FaGlobe, FaChartPie,
  FaBrain, FaRocket, FaShieldAlt, FaWallet, FaGamepad,
  FaBook, FaUserTie, FaHandshake, FaStore, FaChartBar,
  FaCoins, FaExchangeAlt, FaMicrochip, FaLock, FaCrown,
  FaDna, FaAtom, FaFlask, FaLightbulb, FaNetworkWired,
  FaDatabase, FaServer, FaCloud, FaFingerprint, FaMagic,
  FaGem, FaDollarSign, FaBitcoin, FaEthereum, FaChartArea, FaChevronRight,
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
  FaShare, FaMoon, FaFilter, FaCreditCard, FaChevronDown, FaChevronUp, FaBan, FaClock, FaQuestionCircle
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

// 구독 등급 정의 (프리미엄 등급 체계) - tierConfig에서 import
type SubscriptionTier = 'Starter' | 'Advance' | 'Platinum' | 'Signature' | 'Master' | 'Infinity'

// 등급별 설정
const tierConfig = {
  'Starter': { 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-600/20 border border-gray-600/30', 
    icon: '✨', 
    label: 'Starter',
    description: '기본 패키지'
  },
  'Advance': { 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-600/20 border border-blue-500/30', 
    icon: '💎', 
    label: 'Advance',
    description: '고급 기능'
  },
  'Platinum': { 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-600/20 border border-purple-500/30', 
    icon: '👑', 
    label: 'Platinum',
    description: '프리미엄 전략'
  },
  'Signature': { 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-600/20 border border-amber-500/30', 
    icon: '🏆', 
    label: 'Signature',
    description: '시그니처 도구'
  },
  'Master': { 
    color: 'text-red-400', 
    bgColor: 'bg-red-600/20 border border-red-500/30', 
    icon: '🔥', 
    label: 'Master',
    description: '마스터 클래스'
  },
  'Infinity': { 
    color: 'text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text', 
    bgColor: 'bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-yellow-600/20 border border-purple-500/30', 
    icon: '⚡', 
    label: 'Infinity ∞',
    description: '무제한 액세스'
  }
}

// 메뉴 카테고리 정의 (21개로 확장 - subscription 추가)
type MenuCategory = 
  'signals' | 'quant' | 'microstructure' | 'technical' | 'ai' | 
  'automation' | 'telegram' | 'gaming' | 'macro' | 'crypto' | 
  'news' | 'events' | 'risk' | 'portfolio' | 'members' | 
  'payment' | 'marketing' | 'analytics' | 'education' | 'system' | 'subscription'

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

// 카테고리별 색상 테마 - 미니멀하고 통일된 디자인
const categoryThemes = {
  signals: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaSignal, iconColor: 'text-cyan-500' },
  quant: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaChartBar, iconColor: 'text-purple-500' },
  microstructure: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: BiRadar, iconColor: 'text-pink-500' },
  technical: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: MdShowChart, iconColor: 'text-blue-500' },
  ai: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaBrain, iconColor: 'text-violet-500' },
  automation: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaRobot, iconColor: 'text-green-500' },
  telegram: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaTelegram, iconColor: 'text-sky-500' },
  gaming: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaGamepad, iconColor: 'text-orange-500' },
  macro: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaGlobe, iconColor: 'text-teal-500' },
  crypto: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaBitcoin, iconColor: 'text-yellow-500' },
  news: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaNewspaper, iconColor: 'text-lime-500' },
  events: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaCalendar, iconColor: 'text-amber-500' },
  risk: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaShieldAlt, iconColor: 'text-red-500' },
  portfolio: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaWallet, iconColor: 'text-indigo-500' },
  members: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaUsers, iconColor: 'text-slate-400' },
  payment: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaCreditCard, iconColor: 'text-emerald-500' },
  marketing: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaBullhorn, iconColor: 'text-fuchsia-500' },
  analytics: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: MdAnalytics, iconColor: 'text-blue-500' },
  education: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaGraduationCap, iconColor: 'text-rose-500' },
  system: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaCog, iconColor: 'text-gray-500' },
  subscription: { color: 'from-gray-800 to-gray-900', bgColor: 'bg-gray-800/20', borderColor: 'border-gray-700/20', icon: FaCrown, iconColor: 'text-yellow-500' }
}

// 카테고리 그룹 정의 - 구분된 색상
const categoryGroups = {
  trading: {
    title: '트레이딩',
    categories: ['signals', 'quant', 'microstructure', 'technical', 'automation'],
    color: 'from-purple-600/20 to-purple-700/10',
    borderColor: 'border-purple-500/30',
    iconEmoji: '📈',
    accentColor: 'text-purple-400',
    hoverColor: 'hover:bg-purple-800/30'
  },
  analysis: {
    title: '분석 & AI',
    categories: ['ai', 'risk', 'portfolio', 'macro', 'crypto'],
    color: 'from-blue-600/20 to-blue-700/10',
    borderColor: 'border-blue-500/30',
    iconEmoji: '🧠',
    accentColor: 'text-blue-400',
    hoverColor: 'hover:bg-blue-800/30'
  },
  community: {
    title: '커뮤니티',
    categories: ['telegram', 'gaming', 'news', 'events', 'education'],
    color: 'from-emerald-600/20 to-emerald-700/10',
    borderColor: 'border-emerald-500/30',
    iconEmoji: '👥',
    accentColor: 'text-emerald-400',
    hoverColor: 'hover:bg-emerald-800/30'
  },
  management: {
    title: '관리',
    categories: ['members', 'payment', 'subscription', 'marketing', 'analytics', 'system'],
    color: 'from-amber-600/20 to-amber-700/10',
    borderColor: 'border-amber-500/30',
    iconEmoji: '⚙️',
    accentColor: 'text-amber-400',
    hoverColor: 'hover:bg-amber-800/30'
  }
}

// 메뉴 구조 정의 (20개 카테고리, 301개 항목)
const menuStructure: { [key in MenuCategory]: { title: string, items: MenuItem[] } } = {
  signals: {
    title: '📡 프리미엄 시그널',
    items: [
      { icon: FaSignal, label: '스마트 머니 시그널', path: '/signals/smart-money', badge: 'HOT', category: 'signals', isHot: true },
      { icon: FaWhatsapp, label: '고래 추적기', path: '/signals/whale-tracker', category: 'signals' },
      { icon: FaBinoculars, label: '인사이더 플로우', path: '/signals/insider-flow', category: 'signals', minTier: 'Signature' },
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
      { icon: BiBot, label: '마켓 메이킹', path: '/quant/market-making', category: 'quant', minTier: 'Master' },
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
      { icon: BiPulse, label: '풋프린트 차트', path: '/microstructure/footprint', category: 'microstructure', minTier: 'Master' },
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
      { icon: MdCandlestickChart, label: '볼륨 프로파일', path: '/technical/profile', category: 'technical', minTier: 'Platinum' },
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
      { icon: FaDna, label: '가격 예측', path: '/ai/predictions', category: 'ai', minTier: 'Platinum' },
      { icon: BiData, label: '앙상블 모델', path: '/ai/ensemble', category: 'ai' },
      { icon: FaFlask, label: '강화학습', path: '/ai/reinforcement', category: 'ai' },
      { icon: BiScatterChart, label: '클러스터링', path: '/ai/clustering', category: 'ai' },
      { icon: FaLightbulb, label: '이상 탐지', path: '/ai/anomaly', category: 'ai' },
      { icon: FaMagic, label: '자연어 처리', path: '/ai/nlp', category: 'ai' },
      { icon: FaSpaceShuttle, label: '양자 컴퓨팅', path: '/ai/quantum', category: 'ai', minTier: 'Infinity' }
    ]
  },
  automation: {
    title: '⚙️ 자동화',
    items: [
      { icon: FaRobot, label: '자동 트레이딩', path: '/automation/copy-trading', category: 'automation', isHot: true },
      { icon: BiBot, label: 'API 봇', path: '/automation/api-bot', category: 'automation' },
      { icon: FaCodeBranch, label: '웹훅 트레이딩', path: '/automation/webhook', category: 'automation' },
      { icon: FaCubes, label: '파인스크립트', path: '/automation/pine-script', category: 'automation' },
      { icon: FaNetworkWired, label: '전략 빌더', path: '/automation/builder', category: 'automation', minTier: 'Signature' },
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
      { icon: FaCrown, label: '프리미엄 채널', path: '/telegram/premium', category: 'telegram', minTier: 'Advance' },
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
      { icon: FaPuzzlePiece, label: '메타버스', path: '/gaming/metaverse', category: 'gaming', minTier: 'Infinity' }
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
      { icon: FaCog, label: '고급 설정', path: '/system/advanced', category: 'system', minTier: 'Platinum' }
    ]
  },
  subscription: {
    title: '👑 등급 & 구독',
    items: [
      { icon: FaCrown, label: '현재 등급', path: '/subscription/current', category: 'subscription' },
      { icon: FaChartBar, label: '등급 비교', path: '/subscription/compare', category: 'subscription' },
      { icon: FaRocket, label: '업그레이드', path: '/subscription/upgrade', category: 'subscription' },
      { icon: FaGift, label: '등급 혜택', path: '/subscription/benefits', category: 'subscription' },
      { icon: FaHistory, label: '구독 내역', path: '/subscription/history', category: 'subscription' },
      { icon: FaCreditCard, label: '결제 관리', path: '/subscription/billing', category: 'subscription' },
      { icon: FaPercentage, label: '할인 & 프로모션', path: '/subscription/promotions', category: 'subscription' },
      { icon: FaUsers, label: '추천 프로그램', path: '/subscription/referral', category: 'subscription' },
      { icon: FaQuestionCircle, label: '등급 가이드', path: '/subscription/guide', category: 'subscription' },
      { icon: FaStar, label: 'VIP 전용', path: '/subscription/vip', category: 'subscription', minTier: 'Master' }
    ]
  }
}

export default function SidebarNew() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebar()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['trading'])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentVisits, setRecentVisits] = useState<{path: string, timestamp: number}[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // 현재 사용자 등급 (실제로는 API나 Context에서 가져와야 함)
  const [userTier, setUserTier] = useState<SubscriptionTier>('Infinity') // 임시로 Infinity 설정
  const [activeView, setActiveView] = useState<'menu' | 'category'>('category')
  
  // 사용자가 메뉴에 접근 가능한지 확인
  const canAccessMenu = (item: MenuItem): boolean => {
    // 메뉴별 등급 오버라이드 확인
    const requiredTier = menuTierOverrides[item.path] || item.minTier
    
    // 카테고리 기본 등급 확인
    const categoryTier = categoryMinTiers[item.category]
    
    // 가장 높은 등급 요구사항 적용
    let finalRequiredTier: SubscriptionTier = 'Starter'
    
    if (requiredTier) {
      finalRequiredTier = requiredTier
    } else if (categoryTier) {
      finalRequiredTier = categoryTier
    }
    
    return tierLevels[userTier] >= tierLevels[finalRequiredTier]
  }

  // 접근 가능한 메뉴 개수 계산
  const accessibleMenuCount = useMemo(() => {
    let count = 0
    Object.values(menuStructure).forEach(category => {
      category.items.forEach(item => {
        if (canAccessMenu(item)) {
          count++
        }
      })
    })
    return count
  }, [userTier])

  // localStorage에서 설정 불러오기
  useEffect(() => {
    const savedFavorites = localStorage.getItem('monsta_favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    
    // 최근 방문 기록 불러오기
    const savedRecent = localStorage.getItem('monsta_recent_visits')
    if (savedRecent) {
      setRecentVisits(JSON.parse(savedRecent))
    }
    
    // 접힘 상태 불러오기
    const savedCollapsed = localStorage.getItem('monsta_sidebar_collapsed')
    if (savedCollapsed) {
      setIsCollapsed(JSON.parse(savedCollapsed))
    }
    
    // 헤더 접힘 상태 불러오기
    const savedHeaderCollapsed = localStorage.getItem('monsta_header_collapsed')
    if (savedHeaderCollapsed) {
      setIsHeaderCollapsed(JSON.parse(savedHeaderCollapsed))
    }
  }, [])

  // 모바일 감지 및 자동 헤더 접기
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      
      // 모바일에서 처음 로드 시 헤더 자동 접기
      if (mobile && !localStorage.getItem('monsta_header_collapsed')) {
        setIsHeaderCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 키보드 단축키 (Ctrl+H로 홈으로 이동)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault()
        window.location.href = '/'
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // 경로 변경 시 최근 방문 기록 업데이트
  useEffect(() => {
    if (pathname && pathname !== '/') {
      const newVisit = { path: pathname, timestamp: Date.now() }
      setRecentVisits(prev => {
        // 중복 제거 및 최대 5개 유지
        const filtered = prev.filter(v => v.path !== pathname)
        const updated = [newVisit, ...filtered].slice(0, 5)
        localStorage.setItem('monsta_recent_visits', JSON.stringify(updated))
        return updated
      })
    }
  }, [pathname])

  // 사이드바 접힘 토글
  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const newState = !prev
      localStorage.setItem('monsta_sidebar_collapsed', JSON.stringify(newState))
      return newState
    })
  }

  // 헤더 접힘 토글
  const toggleHeaderCollapsed = () => {
    setIsHeaderCollapsed(prev => {
      const newState = !prev
      localStorage.setItem('monsta_header_collapsed', JSON.stringify(newState))
      return newState
    })
  }

  // 즐겨찾기 토글 함수
  const toggleFavorite = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => {
      const newFavorites = prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
      localStorage.setItem('monsta_favorites', JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  // 즐겨찾기 메뉴 아이템 가져오기
  const getFavoriteItems = () => {
    const items: MenuItem[] = []
    Object.values(menuStructure).forEach(category => {
      category.items.forEach(item => {
        if (favorites.includes(item.path)) {
          items.push(item)
        }
      })
    })
    return items
  }

  // 최근 방문 메뉴 아이템 가져오기
  const getRecentItems = () => {
    const items: (MenuItem & { timestamp: number })[] = []
    recentVisits.forEach(visit => {
      Object.values(menuStructure).forEach(category => {
        category.items.forEach(item => {
          if (item.path === visit.path) {
            items.push({ ...item, timestamp: visit.timestamp })
          }
        })
      })
    })
    return items
  }

  // 상대 시간 포맷팅 함수
  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return '방금 전'
  }

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
      {/* 햄버거 메뉴 버튼 - 항상 표시 (데스크톱 & 모바일) */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-r from-purple-900/80 to-purple-800/80 
                   backdrop-blur-sm border border-purple-600/50 hover:border-purple-500 
                   shadow-xl hover:shadow-purple-500/30 transition-all group"
      >
        <div className="relative">
          <FaBars className="w-5 h-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
          {/* 알림 점 - 더 밝게 */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50" />
        </div>
      </motion.button>

      {/* 오버레이 제거 - 투명 클릭 영역만 유지 */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 사이드바 - 슬라이드 애니메이션 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-950 via-gray-900 to-black 
                       border-r border-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col
                       ${isCollapsed ? 'w-20' : 'w-80'}`}
          >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="relative p-4 border-b border-gray-800/50 bg-gray-900/30">
            {/* MONSTA 로고 + 검색바 + 닫기 버튼 한 줄 배치 */}
            {!isCollapsed ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                {/* MONSTA 로고 */}
                <Link 
                  href="/"
                  className="hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                  onClick={() => setIsOpen(false)}
                >
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    MONSTA
                  </h1>
                </Link>

                {/* 검색바 */}
                <div className="relative flex-1">
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

                {/* X 닫기 버튼 */}
                <motion.button
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-gray-800/50 hover:bg-red-500/20 rounded-lg border border-gray-700 hover:border-red-500/50 transition-all group flex-shrink-0"
                >
                  <FaTimes className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </motion.button>
                </div>
                
                {/* 로고 영역만 유지 */}
              </div>
            ) : (
              /* 접힌 상태 - M 로고와 등급 아이콘 표시 */
              <div className="flex flex-col items-center gap-2 mb-4">
                <Link 
                  href="/"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => setIsOpen(false)}
                  title="홈으로"
                >
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    M
                  </span>
                </Link>
                {/* 접힌 상태에서도 등급 아이콘 표시 */}
                <span className={`text-lg ${tierConfig[userTier].color}`} title={`${userTier} 등급`}>
                  {tierConfig[userTier].icon}
                </span>
              </div>
            )}


            {/* 헤더 접기/펼치기 버튼 */}
            {!isCollapsed && (
              <button
                onClick={toggleHeaderCollapsed}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-all group"
                title={isHeaderCollapsed ? "메뉴 정보 펼치기" : "메뉴 정보 접기"}
              >
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-400 text-sm" />
                  <span className="text-xs text-gray-400">
                    {isHeaderCollapsed ? "메뉴 정보 보기" : "메뉴 정보 숨기기"}
                  </span>
                </div>
                {isHeaderCollapsed ? 
                  <FaChevronDown className="text-gray-400 text-xs" /> : 
                  <FaChevronUp className="text-gray-400 text-xs" />
                }
              </button>
            )}

            {/* 통합된 사용자 & 등급 정보 카드 - 헤더가 펼쳐진 경우에만 표시 */}
            {!isCollapsed && !isHeaderCollapsed && (
              <div className="mb-3">
                <Link 
                  href="/subscription/benefits"
                  onClick={() => setIsOpen(false)}
                  className="block relative overflow-hidden rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                  title="클릭하여 등급별 혜택 보기"
                >
                  {/* 배경 그라데이션 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 group-hover:from-purple-900/20 group-hover:to-pink-900/20 transition-colors" />
                  
                  <div className="relative p-4">
                    {/* 상단 헤더 - 사용자 정보와 역할 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-purple-400 text-sm" />
                        <span className="text-sm font-bold text-white">관리자</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full border border-purple-500/30">
                        본사
                      </span>
                    </div>

                    {/* 등급 표시 - 크고 명확하게 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl ${tierConfig[userTier].color} drop-shadow-lg`}>
                          {tierConfig[userTier].icon}
                        </span>
                        <div>
                          <div className="text-xs text-gray-400 mb-0.5">구독 등급</div>
                          <div className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                            {userTier}
                          </div>
                        </div>
                      </div>
                      <FaChevronRight className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>

                    {/* 통계 정보 - 간결하게 */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-800/50 rounded-lg p-2">
                        <div className="text-gray-400 mb-0.5">활성 메뉴</div>
                        <div className="font-bold text-green-400">{accessibleMenuCount} / 301</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2">
                        <div className="text-gray-400 mb-0.5">접근 권한</div>
                        <div className="font-bold text-purple-400">무제한</div>
                      </div>
                    </div>

                    {/* 하단 설명 */}
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="text-[10px] text-gray-400 group-hover:text-gray-300 transition-colors">
                        {tierConfig[userTier].description}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* 즐겨찾기 섹션 - 헤더가 펼쳐진 경우에만 표시 */}
            {!isCollapsed && !isHeaderCollapsed && (
              <div className="mb-4 p-2 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2 px-1">
                <FaStar className="text-yellow-500 text-xs" />
                <span className="text-xs font-semibold text-gray-300">즐겨찾기</span>
                <span className="text-[10px] text-gray-500">({favorites.length})</span>
              </div>
              <div className="space-y-1">
                {getFavoriteItems().length > 0 ? (
                  getFavoriteItems().map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <Link 
                        href={item.path} 
                        className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700/50 transition-all text-xs"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="text-[10px]" />
                        <span>{item.label}</span>
                      </Link>
                      <button 
                        onClick={(e) => toggleFavorite(item.path, e)}
                        className="p-1 hover:bg-gray-700/50 rounded"
                      >
                        <FaStar className="text-yellow-500 text-[10px]" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-gray-500 text-center py-2">
                    메뉴 옆 ☆를 클릭하여 추가
                  </div>
                )}
              </div>
            </div>
            )}

            {/* 최근 방문 섹션 - 헤더가 펼쳐진 경우에만 표시 */}
            {!isCollapsed && !isHeaderCollapsed && recentVisits.length > 0 && (
              <div className="mb-4 p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-blue-500 text-xs" />
                    <span className="text-xs font-semibold text-gray-300">최근 방문</span>
                    <span className="text-[10px] text-gray-500">({recentVisits.length})</span>
                  </div>
                  <button 
                    onClick={() => {
                      setRecentVisits([])
                      localStorage.removeItem('monsta_recent_visits')
                    }}
                    className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    지우기
                  </button>
                </div>
                <div className="space-y-1">
                  {getRecentItems().map((item, idx) => (
                    <Link 
                      key={idx}
                      href={item.path} 
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700/50 transition-all text-xs group"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="text-[10px] flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-gray-400">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 검색 결과 */}
            {!isCollapsed && isSearchFocused && searchTerm && (
              <div className="absolute top-16 left-4 right-4 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((item, idx) => {
                      // 검색어 하이라이트 처리
                      const highlightText = (text: string) => {
                        const searchLower = searchTerm.toLowerCase()
                        const textLower = text.toLowerCase()
                        const index = textLower.indexOf(searchLower)
                        
                        if (index === -1) return text
                        
                        return (
                          <>
                            {text.slice(0, index)}
                            <span className="bg-purple-600/50 text-purple-200 font-semibold rounded px-0.5">
                              {text.slice(index, index + searchTerm.length)}
                            </span>
                            {text.slice(index + searchTerm.length)}
                          </>
                        )
                      }
                      
                      return (
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
                          <span className="text-sm">{highlightText(item.label)}</span>
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
                      )
                    })}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <FaSearch className="text-gray-600 text-2xl mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">검색 결과가 없습니다</p>
                    <p className="text-gray-500 text-xs mt-1">"{searchTerm}"</p>
                  </div>
                )}
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
                            ${group.hoverColor} transition-all duration-200 shadow-sm`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{group.iconEmoji}</span>
                    <span className={`text-sm font-bold ${group.accentColor}`}>{group.title}</span>
                  </div>
                  {expandedGroups.includes(groupKey) ? 
                    <FaChevronDown className={`text-xs ${group.accentColor}`} /> : 
                    <FaChevronRight className={`text-xs ${group.accentColor}`} />
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
                        
                        // 카테고리 등급 확인
                        const categoryMinTier = categoryMinTiers[categoryKey]
                        const categoryTierInfo = categoryMinTier ? tierConfig[categoryMinTier] : null
                        const canAccessCategory = categoryMinTier ? tierLevels[userTier] >= tierLevels[categoryMinTier] : true
                        
                        // 그룹별 카테고리 스타일
                        const categoryStyle = {
                          trading: 'bg-purple-900/10 border-purple-700/20 hover:bg-purple-800/20',
                          analysis: 'bg-blue-900/10 border-blue-700/20 hover:bg-blue-800/20',
                          community: 'bg-emerald-900/10 border-emerald-700/20 hover:bg-emerald-800/20',
                          management: 'bg-amber-900/10 border-amber-700/20 hover:bg-amber-800/20'
                        }
                        
                        return (
                          <div key={categoryKey} className="mb-2 ml-2">
                            {/* 카테고리 헤더 */}
                            <button
                              onClick={() => toggleCategory(categoryKey)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg
                                        border transition-all text-left
                                        ${categoryStyle[groupKey as keyof typeof categoryStyle]}
                                        ${!canAccessCategory ? 'opacity-60' : ''}`}
                              title={!canAccessCategory ? `${categoryMinTier} 등급 이상 필요 (현재: ${userTier})` : undefined}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <theme.icon className={`text-xs ${!canAccessCategory ? 'text-gray-500' : theme.iconColor || 'text-gray-400'}`} />
                                <span className={`text-xs font-medium ${!canAccessCategory ? 'text-gray-500' : 'text-gray-300'}`}>{category.title}</span>
                                <span className={`text-[10px] ${!canAccessCategory ? 'text-gray-600' : group.accentColor} opacity-50`}>
                                  {category.items.length}
                                </span>
                                {/* 카테고리 등급 배지 */}
                                {categoryMinTier && categoryMinTier !== 'Starter' && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ml-auto
                                                ${!canAccessCategory 
                                                  ? 'bg-gray-700/50 text-gray-500 border border-gray-600/50' 
                                                  : `${categoryTierInfo?.bgColor} ${categoryTierInfo?.color}`}`}>
                                    {categoryTierInfo?.icon} {categoryMinTier.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {isExpanded ? 
                                <FaChevronDown className={`text-[10px] ${group.accentColor} opacity-60`} /> : 
                                <FaChevronRight className={`text-[10px] ${group.accentColor} opacity-60`} />
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
                                  {category.items.map((item, idx) => {
                                    const canAccess = canAccessMenu(item)
                                    // 실제 필요한 등급 확인
                                    const requiredTier = menuTierOverrides[item.path] || item.minTier || categoryMinTiers[item.category]
                                    const requiredTierInfo = requiredTier ? tierConfig[requiredTier] : null
                                    
                                    // 등급별 배경색 설정
                                    const getTierBackground = () => {
                                      if (!requiredTier || requiredTier === 'Starter') return ''
                                      if (!canAccess) return 'bg-gradient-to-r from-gray-800/50 to-gray-900/50'
                                      
                                      switch(requiredTier) {
                                        case 'Advance': return 'bg-gradient-to-r from-blue-900/20 to-transparent'
                                        case 'Platinum': return 'bg-gradient-to-r from-purple-900/20 to-transparent'
                                        case 'Signature': return 'bg-gradient-to-r from-amber-900/20 to-transparent'
                                        case 'Master': return 'bg-gradient-to-r from-red-900/20 to-transparent'
                                        case 'Infinity': return 'bg-gradient-to-r from-purple-900/20 via-pink-900/10 to-transparent'
                                        default: return ''
                                      }
                                    }
                                    
                                    return (
                                      <div key={idx} className="flex items-center gap-1 group relative">
                                        <Link
                                          href={canAccess ? item.path : '#'}
                                          className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                                                    transition-all relative ${getTierBackground()}
                                                    ${!canAccess ? 'opacity-60 cursor-not-allowed border border-gray-700/50' : 'hover:bg-gray-800/50'}
                                                    ${pathname === item.path ? 'bg-gray-800/30 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-gray-200'}`}
                                          onClick={(e) => {
                                            if (!canAccess) {
                                              e.preventDefault()
                                              const requiredTier = menuTierOverrides[item.path] || item.minTier || categoryMinTiers[item.category] || 'Starter'
                                              // 간단한 모달 대신 confirm으로 선택 옵션 제공
                                              const goToUpgrade = confirm(
                                                `이 메뉴는 ${requiredTier} 등급 이상 사용 가능합니다.\n\n현재 등급: ${userTier}\n필요 등급: ${requiredTier}\n\n등급 비교 페이지로 이동하시겠습니까?`
                                              )
                                              if (goToUpgrade) {
                                                window.location.href = '/subscription/benefits'
                                              }
                                            } else {
                                              setIsOpen(false)
                                            }
                                          }}
                                          title={!canAccess 
                                            ? `${requiredTier} 등급 이상 필요 (현재: ${userTier})`
                                            : requiredTier && requiredTier !== 'Starter' 
                                              ? `${requiredTier} 등급부터 사용 가능`
                                              : undefined}
                                        >
                                          <item.icon className={`text-[10px] ${theme.iconColor || 'text-gray-500'}`} />
                                          <span className="flex-1">{item.label}</span>
                                          
                                          {/* 등급 표시 - 더 크고 명확하게 */}
                                          {requiredTier && requiredTier !== 'Starter' && (
                                            <div className="flex items-center gap-1">
                                              {!canAccess && (
                                                <FaLock className="text-gray-500 text-[10px]" />
                                              )}
                                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold
                                                            ${!canAccess 
                                                              ? 'bg-gray-700/50 text-gray-500 border border-gray-600/50' 
                                                              : `${requiredTierInfo?.bgColor} ${requiredTierInfo?.color}`}`}>
                                                {requiredTierInfo?.icon} {requiredTier.slice(0, 3).toUpperCase()}
                                              </span>
                                            </div>
                                          )}
                                          {item.isHot && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                              HOT
                                            </span>
                                          )}
                                          {item.isNew && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                              NEW
                                            </span>
                                          )}
                                        </Link>
                                      <button
                                        onClick={(e) => toggleFavorite(item.path, e)}
                                        className={`p-1 hover:bg-gray-700/50 rounded transition-all ${
                                          favorites.includes(item.path) ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'
                                        }`}
                                        title={favorites.includes(item.path) ? "즐겨찾기 제거" : "즐겨찾기 추가"}
                                      >
                                        <FaStar 
                                          className={`text-[11px] transition-all ${
                                            favorites.includes(item.path) 
                                              ? 'text-yellow-400 drop-shadow-lg' 
                                              : 'text-gray-400 hover:text-yellow-400 hover:scale-110'
                                          }`} 
                                        />
                                      </button>
                                    </div>
                                    )
                                  })}
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

          {/* 등급 안내 버튼 - 하단 고정 */}
          <div className="p-3 space-y-2">
            {/* 프리미엄 업그레이드 CTA */}
            {userTier === 'Starter' && (
              <Link
                href="/subscription/compare"
                onClick={() => setIsOpen(false)}
                className="block w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                          text-white text-center font-bold text-sm transition-all shadow-lg hover:shadow-purple-500/30 
                          animate-pulse hover:animate-none"
              >
                <div className="flex items-center justify-center gap-2">
                  <FaCrown className="text-yellow-300" />
                  <span>226개 더 많은 메뉴 잠금 해제!</span>
                </div>
                <div className="text-xs mt-1 opacity-90">
                  프리미엄 업그레이드 →
                </div>
              </Link>
            )}
            
            {/* 모든 사용자에게 표시되는 등급 비교 버튼 */}
            <Link
              href="/subscription/benefits"
              onClick={() => setIsOpen(false)}
              className={`block w-full p-2.5 rounded-lg border border-gray-700 hover:border-purple-500/50 
                        bg-gray-800/50 hover:bg-gray-800 text-center transition-all group
                        ${userTier === 'Starter' ? '' : 'mt-0'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaGem className="text-purple-400 group-hover:text-purple-300 text-sm" />
                <span className="text-xs text-gray-300 group-hover:text-white font-medium">
                  등급별 혜택 비교
                </span>
                <FaChevronRight className="text-[10px] text-gray-500 group-hover:text-gray-400" />
              </div>
            </Link>

            {/* 메뉴 정보 버튼 개선 */}
            <button
              onClick={() => setActiveView(activeView === 'menu' ? 'category' : 'menu')}
              className="w-full p-2 rounded-lg border border-gray-700 hover:border-purple-500/50 bg-gray-800/50 hover:bg-gray-800 text-center transition-all group"
            >
              <div className="flex items-center justify-center gap-2">
                <FaFilter className="text-gray-400 group-hover:text-gray-300 text-sm" />
                <span className="text-xs text-gray-300 group-hover:text-white">
                  {activeView === 'menu' ? '카테고리 보기' : '메뉴 보기'}
                </span>
              </div>
            </button>
          </div>

          {/* 하단 정보 */}
          <div className="p-3 pt-2 border-t border-gray-800 text-xs text-gray-400">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px]">총 {Object.values(menuStructure).reduce((acc, cat) => acc + cat.items.length, 0)}개 메뉴</span>
                <span className="text-[11px]">20개 카테고리</span>
              </div>
              <div className="text-center text-[10px] text-gray-500">
                © 2024 MONSTA
              </div>
            </div>
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>

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