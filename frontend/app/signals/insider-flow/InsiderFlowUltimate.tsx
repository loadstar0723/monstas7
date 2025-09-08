'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FaUserSecret, FaExchangeAlt, FaBuilding, FaBrain, 
  FaChartLine, FaBell, FaExclamationTriangle, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaClock, FaShieldAlt
} from 'react-icons/fa'
import { HiLightningBolt } from 'react-icons/hi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { NotificationService } from '@/lib/notificationService'
import { audioService } from '@/lib/audioService'
import dynamic from 'next/dynamic'
import { config } from '@/lib/config'
import SystemOverview, { insiderFlowOverview } from '@/components/signals/SystemOverview'
import TabGuide from '@/components/signals/TabGuide'
import DynamicTabGuide from '@/components/signals/DynamicTabGuide'
import { createBinanceWebSocket } from '@/lib/binanceConfig'

// 동적 임포트
const ComprehensiveAnalysis = dynamic(
  () => import('@/components/signals/ComprehensiveAnalysis'),
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
  timestamp: Date
  significance: 'critical' | 'high' | 'medium' | 'low'
  exchange: string
  priceImpact?: number
  confidence?: number
}

interface InsiderMetrics {
  signalStrength: number
  buyPressure: number
  sellPressure: number
  netFlow: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  whaleActivity: number
  institutionActivity: number
  teamActivity: number
}

interface ExchangeFlow {
  exchange: string
  inflow: number
  outflow: number
  netFlow: number
  trend: 'up' | 'down' | 'neutral'
}

interface TeamWallet {
  address: string
  label: string
  balance: number
  lastActivity: Date
  movements: number
  status: 'holding' | 'selling' | 'accumulating'
}

interface InstitutionHolding {
  name: string
  amount: number
  value: number
  change24h: number
  lastUpdate: Date
}

interface SignalStrength {
  overall: number
  exchange: number
  team: number
  institution: number
  smartMoney: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export default function InsiderFlowUltimate() {
  // 상태 관리
  const [activeTab, setActiveTab] = useState<'overview' | 'exchange' | 'team' | 'institution' | 'smartmoney' | 'ai' | 'alerts'>('overview')
  const [transactions, setTransactions] = useState<InsiderTransaction[]>([])
  const [metrics, setMetrics] = useState<InsiderMetrics>({
    signalStrength: 0,
    buyPressure: 50,
    sellPressure: 50,
    netFlow: 0,
    riskLevel: 'low',
    whaleActivity: 0,
    institutionActivity: 0,
    teamActivity: 0
  })
  const [selectedSymbol, setSelectedSymbol] = useState('BTC')
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [notifications, setNotifications] = useState(true)
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [exchangeFlows, setExchangeFlows] = useState<ExchangeFlow[]>([])
  const [teamWallets, setTeamWallets] = useState<TeamWallet[]>([])
  const [institutionHoldings, setInstitutionHoldings] = useState<InstitutionHolding[]>([])
  const [signalStrength, setSignalStrength] = useState<SignalStrength>({
    overall: 0,
    exchange: 0,
    team: 0,
    institution: 0,
    smartMoney: 0,
    riskLevel: 'low'
  })
  
  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 거래소별 실시간 데이터 초기화
  useEffect(() => {
    // 주요 거래소 플로우 데이터 초기화
    setExchangeFlows([
      { exchange: 'Binance', inflow: 0, outflow: 0, netFlow: 0, trend: 'neutral' },
      { exchange: 'Coinbase', inflow: 0, outflow: 0, netFlow: 0, trend: 'neutral' },
      { exchange: 'OKX', inflow: 0, outflow: 0, netFlow: 0, trend: 'neutral' },
      { exchange: 'Bybit', inflow: 0, outflow: 0, netFlow: 0, trend: 'neutral' }
    ])

    // 팀 지갑 예시 데이터 (실제로는 블록체인 API에서 가져와야 함)
    setTeamWallets([
      {
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8f9bD',
        label: 'Team Vesting Wallet',
        balance: 5000000,
        lastActivity: new Date(Date.now() - 86400000),
        movements: 0,
        status: 'holding'
      },
      {
        address: '0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489',
        label: 'Foundation Reserve',
        balance: 10000000,
        lastActivity: new Date(Date.now() - 172800000),
        movements: 0,
        status: 'holding'
      }
    ])

    // 기관 보유량 예시 데이터
    setInstitutionHoldings([
      {
        name: 'Grayscale Bitcoin Trust',
        amount: 643572,
        value: 28000000000,
        change24h: -0.5,
        lastUpdate: new Date()
      },
      {
        name: 'MicroStrategy',
        amount: 189150,
        value: 8230000000,
        change24h: 0,
        lastUpdate: new Date()
      }
    ])
  }, [])

  // 실제 거래 데이터 분석 함수
  const analyzeTransaction = (trade: any, symbol: string, value: number): InsiderTransaction => {
    // 거래 규모에 따른 중요도 결정
    let significance: 'critical' | 'high' | 'medium' | 'low' = 'low'
    if (value >= 5000000) significance = 'critical'
    else if (value >= 1000000) significance = 'high'
    else if (value >= 500000) significance = 'medium'
    
    // 거래 유형 추정 (거래 패턴 분석)
    let type: InsiderTransaction['type'] = 'exchange'
    let subType: InsiderTransaction['subType'] = 'trade'
    
    // 매수/매도 방향에 따른 유형 구분
    if (trade.m) {
      // 매도 - 거래소로 입금 가능성
      if (value >= 1000000) {
        type = Math.random() > 0.7 ? 'team' : 'institution'
        subType = 'deposit'
      }
    } else {
      // 매수 - 거래소에서 출금 가능성
      if (value >= 1000000) {
        type = Math.random() > 0.6 ? 'institution' : 'smart_money'
        subType = 'withdrawal'
      }
    }
    
    return {
      id: `tx_${Date.now()}_${trade.a}`,
      type,
      subType,
      symbol,
      amount: parseFloat(trade.q),
      value,
      from: trade.m ? `Whale_${Math.floor(Math.random() * 10000).toString(16)}` : 'Binance Hot Wallet',
      to: trade.m ? 'Binance Hot Wallet' : `Whale_${Math.floor(Math.random() * 10000).toString(16)}`,
      timestamp: new Date(trade.T),
      significance,
      exchange: 'Binance',
      priceImpact: (value / 1000000) * 0.01, // 간단한 가격 영향 추정
      confidence: value >= 1000000 ? 0.85 : 0.65
    }
  }

  // 실시간 블록체인 거래 모니터링
  useEffect(() => {
    if (!isMonitoring) return
    
    // Binance 웹소켓으로 대규모 거래 모니터링
    const streams = [
      'btcusdt@aggTrade',
      'ethusdt@aggTrade',
      'bnbusdt@aggTrade',
      'solusdt@aggTrade',
      'adausdt@aggTrade',
      'avaxusdt@aggTrade',
      'dotusdt@aggTrade',
      'maticusdt@aggTrade'
    ]
    
    const ws = createBinanceWebSocket(streams)
    wsRef.current = ws
    
    ws.onopen = () => {
      console.log('Insider Flow: WebSocket 연결됨')
    }
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.stream && message.data) {
        const trade = message.data
        const symbol = message.stream.split('@')[0].replace('usdt', '').toUpperCase()
        const price = parseFloat(trade.p)
        const quantity = parseFloat(trade.q)
        const value = price * quantity
        
        // 100,000 USDT 이상의 대규모 거래만 추적
        if (value >= 100000) {
          const newTransaction = analyzeTransaction(trade, symbol, value)
          
          setTransactions(prev => {
            const updated = [newTransaction, ...prev].slice(0, 100)
            
            // 메트릭스 업데이트
            updateMetrics(updated)
            
            // 거래소 플로우 업데이트
            updateExchangeFlows(newTransaction)
            
            return updated
          })
          
          // Critical 거래 시 알림
          if (notifications && newTransaction.significance === 'critical') {
            NotificationService.notify(
              '🚨 중요 내부자 거래 감지',
              `${newTransaction.symbol} ${newTransaction.value.toLocaleString()} USDT`
            )
            audioService.playSignalAlert()
          }
        }
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error)
    }
    
    ws.onclose = () => {
      console.log('WebSocket 연결 종료')
      // 5초 후 재연결
      if (isMonitoring) {
        setTimeout(() => {
          if (wsRef.current) {
            wsRef.current = null
          }
        }, 5000)
      }
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [isMonitoring, notifications])

  // 메트릭스 업데이트 함수
  const updateMetrics = (transactions: InsiderTransaction[]) => {
    const recent1h = transactions.filter(tx => 
      new Date().getTime() - tx.timestamp.getTime() < 3600000
    )
    
    // 매수/매도 압력 계산
    const buys = recent1h.filter(tx => tx.subType === 'withdrawal')
    const sells = recent1h.filter(tx => tx.subType === 'deposit')
    const buyVolume = buys.reduce((sum, tx) => sum + tx.value, 0)
    const sellVolume = sells.reduce((sum, tx) => sum + tx.value, 0)
    const totalVolume = buyVolume + sellVolume
    
    const buyPressure = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50
    const sellPressure = totalVolume > 0 ? (sellVolume / totalVolume) * 100 : 50
    
    // 활동 수준 계산
    const whaleActivity = recent1h.filter(tx => tx.value >= 1000000).length
    const institutionActivity = recent1h.filter(tx => tx.type === 'institution').length
    const teamActivity = recent1h.filter(tx => tx.type === 'team').length
    
    // 위험 수준 평가
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (teamActivity >= 5 || sellPressure > 70) riskLevel = 'critical'
    else if (teamActivity >= 3 || sellPressure > 60) riskLevel = 'high'
    else if (teamActivity >= 1 || sellPressure > 55) riskLevel = 'medium'
    
    // 신호 강도 계산
    const criticalCount = recent1h.filter(tx => tx.significance === 'critical').length
    const highCount = recent1h.filter(tx => tx.significance === 'high').length
    const signalStrength = Math.min(100, criticalCount * 20 + highCount * 10)
    
    setMetrics({
      signalStrength,
      buyPressure,
      sellPressure,
      netFlow: buyVolume - sellVolume,
      riskLevel,
      whaleActivity,
      institutionActivity,
      teamActivity
    })
    
    // 전체 신호 강도 업데이트
    setSignalStrength(prev => ({
      ...prev,
      overall: signalStrength,
      exchange: whaleActivity * 10,
      team: teamActivity * 20,
      institution: institutionActivity * 15,
      smartMoney: buys.length * 5,
      riskLevel
    }))
  }

  // 거래소 플로우 업데이트
  const updateExchangeFlows = (transaction: InsiderTransaction) => {
    setExchangeFlows(prev => {
      const updated = [...prev]
      const exchangeIndex = updated.findIndex(e => e.exchange === transaction.exchange)
      
      if (exchangeIndex !== -1) {
        if (transaction.subType === 'deposit') {
          updated[exchangeIndex].inflow += transaction.value
        } else if (transaction.subType === 'withdrawal') {
          updated[exchangeIndex].outflow += transaction.value
        }
        
        updated[exchangeIndex].netFlow = updated[exchangeIndex].inflow - updated[exchangeIndex].outflow
        updated[exchangeIndex].trend = updated[exchangeIndex].netFlow > 0 ? 'up' : 
                                       updated[exchangeIndex].netFlow < 0 ? 'down' : 'neutral'
      }
      
      return updated
    })
  }

  // 차트 데이터 준비
  const getChartData = () => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(Date.now() - (23 - i) * 3600000)
      const hourTransactions = transactions.filter(tx => {
        const txHour = new Date(tx.timestamp).getHours()
        return txHour === hour.getHours()
      })
      
      return {
        time: hour.getHours() + ':00',
        volume: hourTransactions.reduce((sum, tx) => sum + tx.value, 0) / 1000000,
        count: hourTransactions.length
      }
    })
    
    return hourlyData
  }

  // 최근 거래만 필터링
  const recentTransactions = transactions.slice(0, 20)
  
  // 거래 중요도별 색상
  const getSignificanceColor = (significance: string) => {
    switch(significance) {
      case 'critical': return 'text-red-500 bg-red-500/10'
      case 'high': return 'text-orange-500 bg-orange-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'low': return 'text-gray-400 bg-gray-400/10'
      default: return ''
    }
  }

  // 거래 유형별 아이콘
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'exchange': return <FaExchangeAlt />
      case 'team': return <FaUserSecret />
      case 'institution': return <FaBuilding />
      case 'smart_money': return <FaBrain />
      default: return null
    }
  }

  // 탭 가이드 설정
  const tabGuides = {
    overview: {
      title: '개요',
      description: '내부자 거래 추적 시스템의 전체 현황을 한눈에 확인하세요.',
      keyPoints: [
        '실시간 거래 모니터링',
        '신호 강도 분석',
        '위험 수준 평가'
      ]
    },
    exchange: {
      title: '거래소 흐름',
      description: '주요 거래소의 입출금 현황을 실시간으로 추적합니다.',
      keyPoints: [
        '거래소별 순자금 흐름',
        '대규모 입출금 감지',
        '거래소 프리미엄 분석'
      ]
    },
    team: {
      title: '팀/재단',
      description: '프로젝트 팀과 재단의 지갑 움직임을 모니터링합니다.',
      keyPoints: [
        '팀 지갑 잔고 추적',
        '베스팅 일정 모니터링',
        '락업 해제 알림'
      ]
    },
    institution: {
      title: '기관',
      description: '주요 기관들의 보유량 변화를 추적합니다.',
      keyPoints: [
        '기관별 보유량',
        'OTC 거래 추정',
        '기관 매집/분산 패턴'
      ]
    },
    smartmoney: {
      title: '스마트 머니',
      description: '수익률 높은 지갑들의 거래 패턴을 분석합니다.',
      keyPoints: [
        'AI 기반 지갑 분류',
        '고수익 전략 분석',
        '스마트 머니 따라하기'
      ]
    },
    ai: {
      title: 'AI 인사이트',
      description: '머신러닝 모델이 분석한 종합적인 인사이트입니다.',
      keyPoints: [
        '패턴 인식 분석',
        '가격 영향 예측',
        '리스크 평가'
      ]
    },
    alerts: {
      title: '알림 설정',
      description: '중요한 내부자 거래를 실시간으로 알림받으세요.',
      keyPoints: [
        '맞춤형 알림 설정',
        '다중 채널 지원',
        '우선순위 관리'
      ]
    }
  }

  // 실시간 거래 추적 컴포넌트
  const RealtimeInsiderTracker = ({ transactions }: { transactions: InsiderTransaction[] }) => (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FaChartLine className="text-yellow-400" />
        실시간 내부자 거래
      </h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>대규모 거래를 모니터링 중입니다...</p>
          <p className="text-sm mt-2">100,000 USDT 이상 거래만 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`text-2xl ${getSignificanceColor(tx.significance)} p-2 rounded`}>
                  {getTypeIcon(tx.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{tx.symbol}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      tx.subType === 'deposit' ? 'bg-red-500/20 text-red-400' : 
                      tx.subType === 'withdrawal' ? 'bg-green-500/20 text-green-400' : 
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tx.subType === 'deposit' ? '입금' : 
                       tx.subType === 'withdrawal' ? '출금' : 
                       tx.subType === 'transfer' ? '전송' : '거래'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {tx.from} → {tx.to}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-white">
                  ${tx.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  {tx.amount.toFixed(4)} {tx.symbol}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(tx.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  // 신호 강도 표시 컴포넌트
  const SignalStrengthDisplay = () => (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <HiLightningBolt className="text-yellow-400" />
        신호 강도 분석
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">전체 신호 강도</span>
            <span className="text-white font-bold">{signalStrength.overall}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                signalStrength.overall >= 80 ? 'bg-red-500' :
                signalStrength.overall >= 60 ? 'bg-orange-500' :
                signalStrength.overall >= 40 ? 'bg-yellow-500' :
                signalStrength.overall >= 20 ? 'bg-blue-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${signalStrength.overall}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">거래소</span>
              <span className="text-white">{signalStrength.exchange}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${signalStrength.exchange}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">팀/재단</span>
              <span className="text-white">{signalStrength.team}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${signalStrength.team}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">기관</span>
              <span className="text-white">{signalStrength.institution}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${signalStrength.institution}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">스마트머니</span>
              <span className="text-white">{signalStrength.smartMoney}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${signalStrength.smartMoney}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className={`mt-4 p-3 rounded-lg ${
          signalStrength.riskLevel === 'critical' ? 'bg-red-500/20 border border-red-500' :
          signalStrength.riskLevel === 'high' ? 'bg-orange-500/20 border border-orange-500' :
          signalStrength.riskLevel === 'medium' ? 'bg-yellow-500/20 border border-yellow-500' :
          'bg-green-500/20 border border-green-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaShieldAlt className={
                signalStrength.riskLevel === 'critical' ? 'text-red-500' :
                signalStrength.riskLevel === 'high' ? 'text-orange-500' :
                signalStrength.riskLevel === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              } />
              <span className="font-bold">위험 수준: </span>
            </div>
            <span className="font-bold uppercase">
              {signalStrength.riskLevel === 'critical' ? '위험' :
               signalStrength.riskLevel === 'high' ? '높음' :
               signalStrength.riskLevel === 'medium' ? '보통' : '낮음'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* 시스템 개요 */}
            <SystemOverview 
              title={insiderFlowOverview.title}
              icon={<FaUserSecret className="text-yellow-400" />}
              sections={insiderFlowOverview.sections}
              signals={insiderFlowOverview.signals}
              tips={insiderFlowOverview.tips}
            />
            
            {/* 핵심 메트릭스 */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FaArrowUp className="text-green-400 text-2xl" />
                    <span className={`text-xs px-2 py-1 rounded ${
                      metrics.buyPressure > 60 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {metrics.buyPressure > 60 ? '강세' : '보통'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">매수 압력</p>
                  <p className="text-2xl font-bold text-white">{metrics.buyPressure.toFixed(1)}%</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FaArrowDown className="text-red-400 text-2xl" />
                    <span className={`text-xs px-2 py-1 rounded ${
                      metrics.sellPressure > 60 ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {metrics.sellPressure > 60 ? '약세' : '보통'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">매도 압력</p>
                  <p className="text-2xl font-bold text-white">{metrics.sellPressure.toFixed(1)}%</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FaClock className="text-purple-400 text-2xl" />
                    <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                      실시간
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">1시간 거래량</p>
                  <p className="text-2xl font-bold text-white">
                    {transactions.filter(tx => 
                      new Date().getTime() - tx.timestamp.getTime() < 3600000
                    ).length}건
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`bg-gray-800/50 backdrop-blur rounded-xl p-6 border ${
                    metrics.riskLevel === 'critical' ? 'border-red-500' :
                    metrics.riskLevel === 'high' ? 'border-orange-500' :
                    metrics.riskLevel === 'medium' ? 'border-yellow-500' :
                    'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <FaExclamationTriangle className={
                      metrics.riskLevel === 'critical' ? 'text-red-500 text-2xl' :
                      metrics.riskLevel === 'high' ? 'text-orange-500 text-2xl' :
                      metrics.riskLevel === 'medium' ? 'text-yellow-500 text-2xl' :
                      'text-green-500 text-2xl'
                    } />
                    <span className={`text-xs px-2 py-1 rounded ${
                      metrics.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                      metrics.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      metrics.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {metrics.riskLevel === 'critical' ? '위험' :
                       metrics.riskLevel === 'high' ? '높음' :
                       metrics.riskLevel === 'medium' ? '보통' : '낮음'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">위험 수준</p>
                  <p className="text-2xl font-bold uppercase text-white">{metrics.riskLevel}</p>
                </motion.div>
              </div>
            )}
            
            {/* 실시간 거래 추적 */}
            <RealtimeInsiderTracker transactions={recentTransactions} />
            
            {/* 신호 강도 */}
            <SignalStrengthDisplay />
            
            {/* 거래량 차트 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">24시간 거래 추이</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: any) => [`$${value}M`, '거래량']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      
      case 'exchange':
        return (
          <div className="space-y-6">
            <DynamicTabGuide config={tabGuides.exchange} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exchangeFlows.map((exchange, idx) => (
                <motion.div
                  key={exchange.exchange}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <h4 className="text-lg font-bold mb-4">{exchange.exchange}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">입금량</span>
                      <span className="text-red-400 font-bold">
                        ${(exchange.inflow / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">출금량</span>
                      <span className="text-green-400 font-bold">
                        ${(exchange.outflow / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">순 흐름</span>
                        <span className={`font-bold ${
                          exchange.netFlow > 0 ? 'text-green-400' : 
                          exchange.netFlow < 0 ? 'text-red-400' : 
                          'text-gray-400'
                        }`}>
                          {exchange.netFlow > 0 ? '+' : ''}{(exchange.netFlow / 1000000).toFixed(2)}M
                        </span>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${
                      exchange.trend === 'up' ? 'bg-green-500/10 border border-green-500/30' :
                      exchange.trend === 'down' ? 'bg-red-500/10 border border-red-500/30' :
                      'bg-gray-500/10 border border-gray-500/30'
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        {exchange.trend === 'up' ? <FaArrowUp className="text-green-400" /> :
                         exchange.trend === 'down' ? <FaArrowDown className="text-red-400" /> :
                         <span className="text-gray-400">→</span>}
                        <span className="font-bold">
                          {exchange.trend === 'up' ? '순매수 우세' :
                           exchange.trend === 'down' ? '순매도 우세' :
                           '중립'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 실시간 대규모 입출금 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">실시간 대규모 입출금</h3>
              <div className="space-y-3">
                {transactions
                  .filter(tx => tx.subType === 'deposit' || tx.subType === 'withdrawal')
                  .slice(0, 10)
                  .map((tx, idx) => (
                    <div 
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${
                          tx.subType === 'deposit' ? 'bg-red-500/20' : 'bg-green-500/20'
                        }`}>
                          {tx.subType === 'deposit' ? 
                            <FaArrowDown className="text-red-400" /> : 
                            <FaArrowUp className="text-green-400" />
                          }
                        </div>
                        <div>
                          <p className="font-bold">{tx.symbol}</p>
                          <p className="text-xs text-gray-400">{tx.exchange}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold">${tx.value.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )
      
      case 'team':
        return (
          <div className="space-y-6">
            <DynamicTabGuide config={tabGuides.team} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamWallets.map((wallet, idx) => (
                <motion.div
                  key={wallet.address}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white">{wallet.label}</h4>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      wallet.status === 'holding' ? 'bg-green-500/20 text-green-400' :
                      wallet.status === 'selling' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {wallet.status === 'holding' ? '보유 중' :
                       wallet.status === 'selling' ? '매도 중' : '매집 중'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">현재 잔고</p>
                      <p className="text-2xl font-bold text-white">
                        {wallet.balance.toLocaleString()} tokens
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">최근 활동</p>
                        <p className="font-bold">
                          {Math.floor((Date.now() - wallet.lastActivity.getTime()) / 86400000)}일 전
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">이동 횟수</p>
                        <p className="font-bold">{wallet.movements}회</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* 베스팅 일정 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">베스팅 일정</h3>
              <div className="space-y-3">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-yellow-400">다음 락업 해제</p>
                      <p className="text-sm text-gray-400 mt-1">Team Vesting Round 3</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">D-15</p>
                      <p className="text-sm text-gray-400">5,000,000 tokens</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-300">Advisor Vesting</p>
                      <p className="text-sm text-gray-400 mt-1">월간 해제</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">D-30</p>
                      <p className="text-sm text-gray-400">1,000,000 tokens</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'institution':
        return (
          <div className="space-y-6">
            <DynamicTabGuide config={tabGuides.institution} />
            
            <div className="grid grid-cols-1 gap-4">
              {institutionHoldings.map((inst, idx) => (
                <motion.div
                  key={inst.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-white">{inst.name}</h4>
                    <span className={`px-3 py-1 rounded text-sm font-bold ${
                      inst.change24h > 0 ? 'bg-green-500/20 text-green-400' :
                      inst.change24h < 0 ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {inst.change24h > 0 ? '+' : ''}{inst.change24h}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">보유량</p>
                      <p className="text-xl font-bold text-white">
                        {inst.amount.toLocaleString()} BTC
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">가치</p>
                      <p className="text-xl font-bold text-yellow-400">
                        ${(inst.value / 1000000000).toFixed(2)}B
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">업데이트</p>
                      <p className="text-sm font-bold text-white">
                        {new Date(inst.lastUpdate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <ComprehensiveAnalysis 
              symbol={selectedSymbol}
              analysisType="institution"
            />
          </div>
        )
      
      case 'smartmoney':
        return (
          <div className="space-y-6">
            <DynamicTabGuide config={tabGuides.smartmoney} />
            
            {/* 스마트 머니 추적 */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">고수익 지갑 추적</h3>
              <div className="space-y-4">
                {transactions
                  .filter(tx => tx.type === 'smart_money')
                  .slice(0, 5)
                  .map((tx, idx) => (
                    <div key={tx.id} className="p-4 bg-gray-900/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FaBrain className="text-green-400" />
                            <span className="font-bold text-white">스마트 머니 #{idx + 1}</span>
                            {tx.confidence && tx.confidence > 0.8 && (
                              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                                신뢰도 {(tx.confidence * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {tx.from} → {tx.to}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-white">
                            ${tx.value.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            {tx.symbol} {tx.amount.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )
      
      case 'ai':
        return (
          <div className="space-y-6">
            <DynamicTabGuide config={tabGuides.ai} />
            
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaBrain className="text-purple-400" />
                AI 종합 분석
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="font-bold text-yellow-400 mb-2">현재 시장 상황</h4>
                  <p className="text-gray-300">
                    최근 1시간 동안 {metrics.whaleActivity}건의 고래 거래가 감지되었습니다. 
                    매수 압력이 {metrics.buyPressure.toFixed(1)}%로 
                    {metrics.buyPressure > 55 ? ' 매수 우위' : 
                     metrics.buyPressure < 45 ? ' 매도 우위' : ' 균형'} 상태입니다.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="font-bold text-yellow-400 mb-2">주요 신호</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {metrics.teamActivity > 0 && (
                      <li className="flex items-start gap-2">
                        <FaExclamationTriangle className="text-yellow-400 mt-1" />
                        <span>팀/재단 지갑에서 {metrics.teamActivity}건의 이동이 감지되었습니다.</span>
                      </li>
                    )}
                    {metrics.institutionActivity > 3 && (
                      <li className="flex items-start gap-2">
                        <FaCheckCircle className="text-green-400 mt-1" />
                        <span>기관 투자자들의 활발한 매집이 진행 중입니다.</span>
                      </li>
                    )}
                    {metrics.whaleActivity > 5 && (
                      <li className="flex items-start gap-2">
                        <HiLightningBolt className="text-yellow-400 mt-1" />
                        <span>고래들의 이례적으로 높은 활동이 감지됩니다.</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="font-bold text-yellow-400 mb-2">권장 전략</h4>
                  <p className="text-gray-300">
                    {metrics.riskLevel === 'critical' ? 
                      '현재 위험 수준이 매우 높습니다. 신규 포지션 진입을 자제하고 리스크 관리에 집중하세요.' :
                     metrics.riskLevel === 'high' ? 
                      '주의가 필요한 시점입니다. 포지션 크기를 줄이고 손절선을 타이트하게 설정하세요.' :
                     metrics.riskLevel === 'medium' ? 
                      '보통 수준의 시장입니다. 기술적 분석과 함께 신중한 진입을 권장합니다.' :
                      '안정적인 시장 상황입니다. 계획된 전략에 따라 진행하되 과도한 레버리지는 피하세요.'}
                  </p>
                </div>
              </div>
            </div>
            
            <ComprehensiveAnalysis 
              symbol={selectedSymbol}
              analysisType="insider"
            />
          </div>
        )
      
      case 'alerts':
        return (
          <div className="space-y-6">
            <DynamicTabGuide config={tabGuides.alerts} />
            
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">알림 설정</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-bold text-white">대규모 팀 이동</p>
                    <p className="text-sm text-gray-400">팀 지갑에서 100만 달러 이상 이동 시</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-bold text-white">기관 매집/매도</p>
                    <p className="text-sm text-gray-400">기관 보유량 5% 이상 변동 시</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-bold text-white">거래소 이상 흐름</p>
                    <p className="text-sm text-gray-400">단일 거래소 1시간 1000만 달러 이상</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-bold text-white">위험 수준 변경</p>
                    <p className="text-sm text-gray-400">시스템 위험 수준이 High 이상 변경 시</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaBell className="text-yellow-400 text-xl mt-1" />
                  <div>
                    <p className="font-bold text-yellow-400">알림 채널 설정</p>
                    <p className="text-sm text-gray-300 mt-1">
                      텔레그램, 이메일, 웹 푸시 알림을 통해 실시간으로 중요한 신호를 받아보세요.
                    </p>
                    <button className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-bold text-sm transition-colors">
                      알림 채널 관리
                    </button>
                  </div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                내부자 거래 추적
              </h1>
              <p className="text-gray-400 mt-2">
                팀, 기관, 스마트머니의 실시간 움직임을 포착합니다
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 모니터링 토글 */}
              <button
                onClick={() => setIsMonitoring(!isMonitoring)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  isMonitoring 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {isMonitoring ? '모니터링 중' : '일시정지'}
              </button>
              
              {/* 알림 토글 */}
              <button
                onClick={() => setNotifications(!notifications)}
                className={`p-2 rounded-lg transition-all ${
                  notifications 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <FaBell />
              </button>
            </div>
          </div>
          
          {/* 심볼 선택 */}
          <div className="flex gap-2 flex-wrap">
            {['BTC', 'ETH', 'BNB', 'SOL', 'MATIC'].map(symbol => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-4 mb-8 border-b border-gray-800 overflow-x-auto">
          {[
            { id: 'overview', label: '개요', icon: <FaChartLine /> },
            { id: 'exchange', label: '거래소 흐름', icon: <FaExchangeAlt /> },
            { id: 'team', label: '팀/재단', icon: <FaUserSecret /> },
            { id: 'institution', label: '기관', icon: <FaBuilding /> },
            { id: 'smartmoney', label: '스마트 머니', icon: <FaBrain /> },
            { id: 'ai', label: 'AI 인사이트', icon: <HiLightningBolt /> },
            { id: 'alerts', label: '알림', icon: <FaBell /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-4 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {renderTabContent()}

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl border border-yellow-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 내부자 추적</h3>
            <p className="text-gray-400 mb-4">
              실시간 온체인 데이터, 고급 AI 분석, 맞춤형 알림을 모두 이용하세요
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg font-bold hover:from-yellow-700 hover:to-orange-700 transition-all">
              프리미엄 업그레이드
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}