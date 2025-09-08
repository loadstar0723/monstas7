'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUserSecret, FaUniversity, FaBrain, FaShieldAlt, FaChartLine,
  FaExchangeAlt, FaHistory, FaCog, FaTelegram, FaEnvelope,
  FaArrowUp, FaArrowDown, FaDatabase, FaWallet, FaRocket,
  FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaPlay, FaPause, FaStop, FaLightbulb, FaFireAlt, FaClock,
  FaGlobe, FaFilter, FaDownload, FaSync
} from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { NotificationService } from '@/lib/notificationService'
import { audioService } from '@/lib/audioService'
import dynamic from 'next/dynamic'
import { config } from '@/lib/config'
import SystemOverview, { insiderFlowOverview } from '@/components/signals/SystemOverview'
import TabGuide from '@/components/signals/TabGuide'
import DynamicTabGuide from '@/components/signals/DynamicTabGuide'

const ComprehensiveAnalysis = dynamic(
  () => import('@/components/signals/ComprehensiveAnalysis'),
  { ssr: false }
)

const TradingStrategy = dynamic(
  () => import('@/components/signals/TradingStrategy'),
  { ssr: false }
)

// 타입 정의
interface InsiderTransaction {
  id: string
  type: 'exchange' | 'team' | 'institution' | 'smart_money'
  subType: 'deposit' | 'withdrawal' | 'transfer' | 'trade'
  symbol: string
  amount: number
  value: number
  from: string
  to: string
  timestamp: number
  time: string
  significance: 'critical' | 'high' | 'medium' | 'low'
  metadata?: {
    exchange?: string
    project?: string
    institution?: string
    pattern?: string
  }
}

interface ExchangeFlow {
  exchange: string
  symbol: string
  netFlow: number
  deposits: number
  withdrawals: number
  change24h: number
  trend: 'bullish' | 'bearish' | 'neutral'
}

interface TeamActivity {
  project: string
  symbol: string
  lastActivity: number
  totalMoved: number
  direction: 'selling' | 'buying' | 'holding'
  riskLevel: 'high' | 'medium' | 'low'
}

interface InstitutionHolding {
  name: string
  holdings: { symbol: string; amount: number; value: number }[]
  totalValue: number
  recentActivity: 'accumulating' | 'distributing' | 'stable'
}

interface InsiderMetrics {
  totalVolume24h: number
  exchangeNetFlow: number
  teamActivity: number
  institutionActivity: number
  smartMoneyScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

// 모의 데이터 생성 함수
const generateMockTransaction = (): InsiderTransaction => {
  const types = ['exchange', 'team', 'institution', 'smart_money'] as const
  const type = types[Math.floor(Math.random() * types.length)]
  
  const symbols = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'AVAX', 'DOT', 'MATIC']
  const symbol = symbols[Math.floor(Math.random() * symbols.length)]
  
  const amount = Math.random() * 1000000
  const value = amount * (symbol === 'BTC' ? 65000 : symbol === 'ETH' ? 3500 : 100)
  
  const metadata: any = {}
  
  if (type === 'exchange') {
    metadata.exchange = ['Binance', 'Coinbase', 'Kraken', 'OKX'][Math.floor(Math.random() * 4)]
  } else if (type === 'team') {
    metadata.project = symbol + ' Foundation'
  } else if (type === 'institution') {
    metadata.institution = ['Grayscale', 'MicroStrategy', 'Tesla', 'Galaxy Digital'][Math.floor(Math.random() * 4)]
  }
  
  const significance = value > 10000000 ? 'critical' : 
                      value > 5000000 ? 'high' : 
                      value > 1000000 ? 'medium' : 'low'
  
  return {
    id: `insider_${Date.now()}_${Math.random()}`,
    type,
    subType: Math.random() > 0.5 ? 'deposit' : 'withdrawal',
    symbol,
    amount,
    value,
    from: `0x${Math.random().toString(16).substr(2, 8)}...`,
    to: `0x${Math.random().toString(16).substr(2, 8)}...`,
    timestamp: Date.now(),
    time: new Date().toLocaleTimeString('ko-KR'),
    significance,
    metadata
  }
}

export default function InsiderFlowUltimate() {
  const [activeTab, setActiveTab] = useState('overview')
  const [transactions, setTransactions] = useState<InsiderTransaction[]>([])
  const [exchangeFlows, setExchangeFlows] = useState<ExchangeFlow[]>([])
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([])
  const [institutions, setInstitutions] = useState<InstitutionHolding[]>([])
  const [metrics, setMetrics] = useState<InsiderMetrics | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [filter, setFilter] = useState('all')
  const [notifications, setNotifications] = useState(true)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 초기 데이터 생성
  useEffect(() => {
    // 거래소 흐름 데이터
    setExchangeFlows([
      { exchange: 'Binance', symbol: 'BTC', netFlow: -5234.5, deposits: 12000, withdrawals: 17234.5, change24h: -15.2, trend: 'bearish' },
      { exchange: 'Coinbase', symbol: 'ETH', netFlow: 8921.3, deposits: 25000, withdrawals: 16078.7, change24h: 22.5, trend: 'bullish' },
      { exchange: 'Kraken', symbol: 'SOL', netFlow: -1234.8, deposits: 5000, withdrawals: 6234.8, change24h: -8.3, trend: 'bearish' },
      { exchange: 'OKX', symbol: 'BNB', netFlow: 3456.2, deposits: 8000, withdrawals: 4543.8, change24h: 12.1, trend: 'bullish' }
    ])

    // 팀 활동 데이터
    setTeamActivities([
      { project: 'Ethereum Foundation', symbol: 'ETH', lastActivity: Date.now() - 86400000, totalMoved: 50000, direction: 'holding', riskLevel: 'low' },
      { project: 'Solana Foundation', symbol: 'SOL', lastActivity: Date.now() - 3600000, totalMoved: 150000, direction: 'selling', riskLevel: 'high' },
      { project: 'Avalanche Team', symbol: 'AVAX', lastActivity: Date.now() - 172800000, totalMoved: 80000, direction: 'buying', riskLevel: 'medium' },
      { project: 'Polygon Team', symbol: 'MATIC', lastActivity: Date.now() - 7200000, totalMoved: 200000, direction: 'selling', riskLevel: 'high' }
    ])

    // 기관 보유 데이터
    setInstitutions([
      {
        name: 'Grayscale',
        holdings: [
          { symbol: 'BTC', amount: 643572, value: 41832180000 },
          { symbol: 'ETH', amount: 3056538, value: 10697883000 }
        ],
        totalValue: 52530063000,
        recentActivity: 'distributing'
      },
      {
        name: 'MicroStrategy',
        holdings: [
          { symbol: 'BTC', amount: 189150, value: 12294750000 }
        ],
        totalValue: 12294750000,
        recentActivity: 'accumulating'
      }
    ])

    // 메트릭스 설정
    setMetrics({
      totalVolume24h: 1234567890,
      exchangeNetFlow: -2345678,
      teamActivity: 4,
      institutionActivity: 7,
      smartMoneyScore: 75,
      riskLevel: 'medium'
    })
  }, [])

  // 실시간 거래 시뮬레이션
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        const newTransaction = generateMockTransaction()
        setTransactions(prev => [newTransaction, ...prev].slice(0, 100))
        
        // 중요한 거래 알림
        if (notifications && newTransaction.significance === 'critical') {
          NotificationService.notify(
            `⚠️ 중요 내부자 활동 감지`,
            `${newTransaction.metadata?.exchange || newTransaction.metadata?.institution || '알 수 없음'} - ${newTransaction.symbol} ${newTransaction.value.toLocaleString()} USD`,
            'warning'
          )
          audioService.play('alert')
        }
      }, 3000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isMonitoring, notifications])

  // 신호 강도 계산
  const getSignalStrength = useCallback((transaction: InsiderTransaction): number => {
    let strength = 0
    
    // 금액 기준
    if (transaction.value > 10000000) strength += 2
    else if (transaction.value > 5000000) strength += 1.5
    else if (transaction.value > 1000000) strength += 1
    else strength += 0.5
    
    // 타입 기준
    if (transaction.type === 'institution') strength += 1.5
    else if (transaction.type === 'team') strength += 1.3
    else if (transaction.type === 'exchange') strength += 1
    else strength += 0.8
    
    // 방향 기준
    if (transaction.subType === 'withdrawal' && transaction.type === 'exchange') strength += 0.5
    if (transaction.subType === 'deposit' && transaction.type === 'exchange') strength -= 0.3
    
    return Math.min(Math.round(strength), 5)
  }, [])

  // 탭 가이드 정보
  const tabGuides = {
    overview: {
      title: "개요",
      description: "전체 내부자 활동을 한눈에 파악하세요",
      features: [
        "실시간 내부자 거래 모니터링",
        "거래소 자금 흐름 분석",
        "팀/재단 활동 추적",
        "기관 투자자 동향"
      ],
      tips: [
        "거래소에서 대량 출금은 긍정적 신호",
        "팀 지갑의 대량 이동은 주의 신호",
        "기관의 꾸준한 매집은 장기 상승 신호"
      ]
    },
    exchangeFlow: {
      title: "거래소 흐름",
      description: "거래소별 입출금 현황과 트렌드를 분석합니다",
      features: [
        "거래소별 순 유입/유출량",
        "코인별 거래소 보유량 변화",
        "거래소 지갑 실시간 모니터링",
        "비정상 흐름 감지"
      ],
      tips: [
        "대량 출금 = 장기 보유 의사 (긍정적)",
        "대량 입금 = 매도 가능성 (부정적)",
        "거래소 보유량 감소는 공급 부족 신호"
      ]
    },
    teamFoundation: {
      title: "팀/재단",
      description: "프로젝트 팀과 재단의 토큰 움직임을 추적합니다",
      features: [
        "프로젝트별 팀 지갑 추적",
        "베스팅 스케줄 모니터링",
        "대량 이동 실시간 알림",
        "과거 패턴 분석"
      ],
      tips: [
        "정기적 소량 판매는 운영비 (정상)",
        "갑작스런 대량 이동은 위험 신호",
        "베스팅 해제 일정 확인 필수"
      ]
    },
    institutions: {
      title: "기관 투자자",
      description: "대형 기관들의 투자 패턴을 분석합니다",
      features: [
        "주요 기관 보유량 추적",
        "매집/분산 패턴 분석",
        "기관별 포트폴리오 변화",
        "투자 전략 인사이트"
      ],
      tips: [
        "기관 매집 = 장기 상승 전망",
        "여러 기관의 동시 매집은 강력한 신호",
        "기관 매도는 단기 조정 가능성"
      ]
    },
    smartMoney: {
      title: "스마트 머니",
      description: "수익률 높은 지갑들의 거래 패턴을 추적합니다",
      features: [
        "고수익 지갑 자동 탐지",
        "실시간 거래 복사 신호",
        "성공률 및 수익률 분석",
        "리스크 평가"
      ],
      tips: [
        "수익률과 일관성 모두 확인",
        "여러 스마트 머니의 공통 포지션 주목",
        "과도한 레버리지 사용 지갑은 주의"
      ]
    },
    aiInsights: {
      title: "AI 인사이트",
      description: "AI가 분석한 내부자 패턴과 예측을 제공합니다",
      features: [
        "패턴 인식 및 이상 감지",
        "가격 영향 예측",
        "리스크 스코어링",
        "투자 추천"
      ],
      tips: [
        "AI 신호는 참고용으로만 활용",
        "여러 지표와 함께 종합 판단",
        "과거 정확도 확인 필수"
      ]
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* 시스템 개요 */}
            <SystemOverview config={insiderFlowOverview} />
            
            {/* 핵심 메트릭스 */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <FaExchangeAlt className="text-blue-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">거래소 순 흐름</p>
                  <p className={`text-2xl font-bold ${metrics.exchangeNetFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.exchangeNetFlow > 0 ? '+' : ''}{(metrics.exchangeNetFlow / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {metrics.exchangeNetFlow > 0 ? '입금 우세' : '출금 우세'}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <FaUserSecret className="text-purple-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">팀 활동</p>
                  <p className="text-2xl font-bold text-white">{metrics.teamActivity}</p>
                  <p className="text-xs text-gray-500 mt-2">활성 프로젝트</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <FaUniversity className="text-green-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">기관 활동</p>
                  <p className="text-2xl font-bold text-white">{metrics.institutionActivity}</p>
                  <p className="text-xs text-gray-500 mt-2">활성 기관</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <FaBrain className="text-yellow-400 text-2xl mb-3" />
                  <p className="text-gray-400 text-sm mb-1">스마트 머니 점수</p>
                  <p className="text-2xl font-bold text-white">{metrics.smartMoneyScore}</p>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-500"
                      style={{ width: `${metrics.smartMoneyScore}%` }}
                    />
                  </div>
                </motion.div>
              </div>
            )}

            {/* 실시간 내부자 거래 */}
            <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaFireAlt className="text-orange-400" />
                  실시간 내부자 활동
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className={`p-2 rounded-lg transition-all ${
                      isMonitoring ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {isMonitoring ? <FaPause /> : <FaPlay />}
                  </button>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`p-2 rounded-lg transition-all ${
                      notifications ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    <FaBell />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {transactions.slice(0, 10).map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tx.type === 'exchange' ? 'bg-blue-500/20 text-blue-400' :
                              tx.type === 'team' ? 'bg-purple-500/20 text-purple-400' :
                              tx.type === 'institution' ? 'bg-green-500/20 text-green-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {tx.type === 'exchange' ? '거래소' :
                               tx.type === 'team' ? '팀/재단' :
                               tx.type === 'institution' ? '기관' : '스마트머니'}
                            </span>
                            <span className="text-white font-bold">{tx.symbol}</span>
                            <span className={`text-sm ${
                              tx.subType === 'withdrawal' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {tx.subType === 'withdrawal' ? <FaArrowUp /> : <FaArrowDown />}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {tx.metadata?.exchange || tx.metadata?.institution || tx.metadata?.project || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tx.from} → {tx.to}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ${tx.value.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            {tx.amount.toFixed(2)} {tx.symbol}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-4 rounded-sm ${
                                  i < getSignalStrength(tx)
                                    ? tx.significance === 'critical' ? 'bg-red-500' :
                                      tx.significance === 'high' ? 'bg-orange-500' :
                                      tx.significance === 'medium' ? 'bg-yellow-500' :
                                      'bg-gray-500'
                                    : 'bg-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )

      case 'exchangeFlow':
        return (
          <div className="space-y-6">
            <TabGuide guide={tabGuides.exchangeFlow} />
            
            {/* 거래소별 자금 흐름 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exchangeFlows.map((flow, index) => (
                <motion.div
                  key={flow.exchange}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{flow.exchange}</h4>
                      <p className="text-sm text-gray-400">{flow.symbol}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      flow.trend === 'bullish' ? 'bg-green-500/20 text-green-400' :
                      flow.trend === 'bearish' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {flow.trend === 'bullish' ? '강세' :
                       flow.trend === 'bearish' ? '약세' : '중립'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">순 흐름</span>
                      <span className={`text-lg font-bold ${
                        flow.netFlow > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {flow.netFlow > 0 ? '+' : ''}{flow.netFlow.toLocaleString()} {flow.symbol}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">입금</span>
                      <span className="text-green-400">+{flow.deposits.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">출금</span>
                      <span className="text-red-400">-{flow.withdrawals.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">24시간 변화</span>
                      <span className={flow.change24h > 0 ? 'text-green-400' : 'text-red-400'}>
                        {flow.change24h > 0 ? '+' : ''}{flow.change24h.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div 
                        className="bg-green-500 transition-all duration-500"
                        style={{ width: `${(flow.deposits / (flow.deposits + flow.withdrawals)) * 100}%` }}
                      />
                      <div 
                        className="bg-red-500 transition-all duration-500"
                        style={{ width: `${(flow.withdrawals / (flow.deposits + flow.withdrawals)) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 거래소 흐름 차트 */}
            <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">거래소 자금 흐름 추이</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { time: '00:00', inflow: 4000, outflow: 2400 },
                      { time: '04:00', inflow: 3000, outflow: 1398 },
                      { time: '08:00', inflow: 2000, outflow: 9800 },
                      { time: '12:00', inflow: 2780, outflow: 3908 },
                      { time: '16:00', inflow: 1890, outflow: 4800 },
                      { time: '20:00', inflow: 2390, outflow: 3800 },
                      { time: '24:00', inflow: 3490, outflow: 4300 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="inflow" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="입금"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="outflow" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="출금"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'teamFoundation':
        return (
          <div className="space-y-6">
            <TabGuide guide={tabGuides.teamFoundation} />
            
            {/* 팀/재단 활동 목록 */}
            <div className="grid grid-cols-1 gap-4">
              {teamActivities.map((activity, index) => (
                <motion.div
                  key={activity.project}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800/30 backdrop-blur rounded-xl p-6 border ${
                    activity.riskLevel === 'high' ? 'border-red-500/50' :
                    activity.riskLevel === 'medium' ? 'border-yellow-500/50' :
                    'border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        {activity.project}
                        {activity.riskLevel === 'high' && (
                          <FaExclamationTriangle className="text-red-400" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        마지막 활동: {new Date(activity.lastActivity).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activity.direction === 'selling' ? 'bg-red-500/20 text-red-400' :
                      activity.direction === 'buying' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {activity.direction === 'selling' ? '매도 중' :
                       activity.direction === 'buying' ? '매수 중' : '홀딩'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">토큰</p>
                      <p className="text-white font-bold">{activity.symbol}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">총 이동량</p>
                      <p className="text-white font-bold">{activity.totalMoved.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">위험도</p>
                      <p className={`font-bold ${
                        activity.riskLevel === 'high' ? 'text-red-400' :
                        activity.riskLevel === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {activity.riskLevel === 'high' ? '높음' :
                         activity.riskLevel === 'medium' ? '보통' : '낮음'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-400">
                      {activity.riskLevel === 'high' 
                        ? '⚠️ 최근 대량 매도 활동이 감지되었습니다. 주의가 필요합니다.'
                        : activity.riskLevel === 'medium'
                        ? '📊 정상적인 운영 활동으로 보이나 지속적인 모니터링이 필요합니다.'
                        : '✅ 안정적인 보유 패턴을 보이고 있습니다.'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'institutions':
        return (
          <div className="space-y-6">
            <TabGuide guide={tabGuides.institutions} />
            
            {/* 기관별 보유 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {institutions.map((inst, index) => (
                <motion.div
                  key={inst.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-white">{inst.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      inst.recentActivity === 'accumulating' ? 'bg-green-500/20 text-green-400' :
                      inst.recentActivity === 'distributing' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {inst.recentActivity === 'accumulating' ? '매집 중' :
                       inst.recentActivity === 'distributing' ? '분산 중' : '안정'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    {inst.holdings.map(holding => (
                      <div key={holding.symbol} className="flex justify-between items-center">
                        <span className="text-gray-400">{holding.symbol}</span>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {holding.amount.toLocaleString()} {holding.symbol}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${(holding.value / 1000000000).toFixed(2)}B
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">총 가치</span>
                      <span className="text-xl font-bold text-white">
                        ${(inst.totalValue / 1000000000).toFixed(2)}B
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 기관 활동 차트 */}
            <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">기관 보유량 변화</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Grayscale', btc: -2.5, eth: -1.2 },
                      { name: 'MicroStrategy', btc: 5.2, eth: 0 },
                      { name: 'Tesla', btc: 0, eth: 0 },
                      { name: 'Galaxy Digital', btc: 1.8, eth: 2.3 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="btc" fill="#F59E0B" name="BTC %" />
                    <Bar dataKey="eth" fill="#8B5CF6" name="ETH %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )

      case 'smartMoney':
        return (
          <div className="space-y-6">
            <TabGuide guide={tabGuides.smartMoney} />
            
            {/* 스마트 머니 추적 */}
            <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">스마트 머니 활동</h3>
              <div className="space-y-4">
                {[
                  { wallet: '0xAbC...123', profit: 2340000, trades: 156, winRate: 78, currentPosition: 'LONG ETH' },
                  { wallet: '0xDeF...456', profit: 1850000, trades: 89, winRate: 82, currentPosition: 'SHORT BTC' },
                  { wallet: '0xGhI...789', profit: 1230000, trades: 234, winRate: 71, currentPosition: 'LONG SOL' },
                ].map((smart, index) => (
                  <motion.div
                    key={smart.wallet}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-mono text-white">{smart.wallet}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          거래: {smart.trades} | 승률: {smart.winRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">
                          +${smart.profit.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {smart.currentPosition}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'aiInsights':
        return (
          <div className="space-y-6">
            <TabGuide guide={tabGuides.aiInsights} />
            <ComprehensiveAnalysis 
              data={{
                transactions,
                metrics,
                exchangeFlows,
                teamActivities
              }}
            />
          </div>
        )

      case 'alerts':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800/30 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaBell className="text-yellow-400" />
                실시간 알림 설정
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">대규모 거래소 출금</p>
                    <p className="text-sm text-gray-400">$1M 이상 출금 시 알림</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">팀 지갑 이상 활동</p>
                    <p className="text-sm text-gray-400">비정상적인 팀 토큰 이동 감지</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">기관 매집/매도</p>
                    <p className="text-sm text-gray-400">대형 기관의 포지션 변경</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-medium text-white mb-4">알림 채널</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 p-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                    <FaTelegram className="text-xl" />
                    텔레그램 연결
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-all">
                    <FaEnvelope className="text-xl" />
                    이메일 설정
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            내부자 플로우 추적 시스템
          </h1>
          <p className="text-gray-400 text-lg">
            거래소, 팀, 기관의 실시간 자금 흐름을 추적하고 분석합니다
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-800">
          {[
            { id: 'overview', label: '개요', icon: <FaChartLine /> },
            { id: 'exchangeFlow', label: '거래소 흐름', icon: <FaExchangeAlt /> },
            { id: 'teamFoundation', label: '팀/재단', icon: <FaUserSecret /> },
            { id: 'institutions', label: '기관 투자자', icon: <FaUniversity /> },
            { id: 'smartMoney', label: '스마트 머니', icon: <FaBrain /> },
            { id: 'aiInsights', label: 'AI 인사이트', icon: <FaRocket /> },
            { id: 'alerts', label: '알림 설정', icon: <FaBell /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {renderTabContent()}
      </div>
    </div>
  )
}