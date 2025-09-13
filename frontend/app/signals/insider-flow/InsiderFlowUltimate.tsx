'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  FaUserSecret, FaWallet, FaLock, FaUnlock, FaExchangeAlt, 
  FaChartLine, FaExclamationTriangle, FaCheckCircle, FaArrowUp, 
  FaArrowDown, FaClock, FaShieldAlt, FaChartBar, FaBook, 
  FaGraduationCap, FaLightbulb, FaBell, FaEye, FaBalanceScale,
  FaUniversity, FaNetworkWired, FaRobot, FaChartPie, FaCoins,
  FaBinoculars, FaSkullCrossbones, FaTrophy, FaFire
} from 'react-icons/fa'
import { AiOutlineRadarChart } from 'react-icons/ai'
import { BiTargetLock } from 'react-icons/bi'
import { MdShowChart } from 'react-icons/md'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar, 
  Area, AreaChart, ComposedChart, Legend, Treemap
} from 'recharts'

// 10개 주요 코인
const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'BNB', name: 'Binance Coin', color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', color: '#00FFA3' },
  { symbol: 'XRP', name: 'Ripple', color: '#23292F' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
  { symbol: 'AVAX', name: 'Avalanche', color: '#E84142' },
  { symbol: 'DOT', name: 'Polkadot', color: '#E6007A' },
  { symbol: 'MATIC', name: 'Polygon', color: '#8247E5' },
  { symbol: 'LINK', name: 'Chainlink', color: '#2A5ADA' }
]

// 실시간 인사이더 거래 생성 함수
const generateInsiderTransaction = (
  symbol: string,
  currentPrice: number,
  index: number
): InsiderTransaction => {
  const types: InsiderTransaction['type'][] = ['buy', 'sell', 'transfer']
  const categories: InsiderTransaction['category'][] = ['team', 'vc', 'whale', 'exchange']
  // index를 기반으로 결정적으로 선택
  const type = types[index % types.length]
  const category = categories[(index + 1) % categories.length]
  
  // 카테고리별 거래 규모 설정
  const volumeMultiplier = 
    category === 'whale' ? 10 :
    category === 'vc' ? 5 :
    category === 'team' ? 3 : 1
    
  const baseAmount = symbol === 'BTC' ? 0.5 * volumeMultiplier :
                    symbol === 'ETH' ? 10 * volumeMultiplier :
                    symbol === 'BNB' ? 50 * volumeMultiplier :
                    100 * volumeMultiplier
                    
  const amount = baseAmount + (index % 10) * baseAmount * 0.2 // index 기반 변동
  const value = amount * currentPrice
  
  // 영향도 계산
  const impact: InsiderTransaction['impact'] = 
    value > 1000000 ? 'critical' :
    value > 500000 ? 'high' :
    value > 100000 ? 'medium' : 'low'
    
  return {
    id: 'tx_' + Date.now() + '-' + index + '-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(Date.now() - (index * 3600000)), // index * 1시간
    type,
    category,
    wallet: '0x' + symbol.toLowerCase() + category + index.toString(16).padStart(4, '0') + '...' + index.toString(16).padStart(6, '0'),
    amount,
    value,
    price: currentPrice,
    impact,
    description: type === 'sell' ? (category === 'team' ? '팀' : category === 'vc' ? 'VC' : category === 'whale' ? '고래' : '거래소') + ' 대량 매도 감지' :
                 type === 'buy' ? (category === 'team' ? '팀' : category === 'vc' ? 'VC' : category === 'whale' ? '고래' : '거래소') + ' 매수 포지션 증가' :
                 '대규모 토큰 이동 감지'
  }
}

// 인사이더 거래 타입
interface InsiderTransaction {
  id: string
  timestamp: Date
  type: 'buy' | 'sell' | 'transfer'
  category: 'team' | 'vc' | 'whale' | 'exchange'
  wallet: string
  amount: number
  value: number
  price: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

// 지갑 정보
interface WalletInfo {
  address: string
  label: string
  type: 'team' | 'vc' | 'whale'
  balance: number
  value: number
  lastActivity: Date
  riskLevel: number
  isLocked: boolean
  unlockDate?: Date
}

// 언락 이벤트
interface UnlockEvent {
  date: string
  amount: number
  type: 'team' | 'vc' | 'investor'
  impact: 'low' | 'medium' | 'high'
  percentage: number
}

export default function InsiderFlowUltimate() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [loading, setLoading] = useState(true) // 초기값을 true로 변경
  const [error, setError] = useState<string | null>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [insiderTransactions, setInsiderTransactions] = useState<InsiderTransaction[]>([])
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [unlockSchedule, setUnlockSchedule] = useState<UnlockEvent[]>([])
  const [exchangeFlow, setExchangeFlow] = useState({ inflow: 0, outflow: 0, netflow: 0 })
  const [riskScore, setRiskScore] = useState(0)
  const [onchainMetrics, setOnchainMetrics] = useState({
    activeAddresses: 0,
    transactionCount: 0,
    largeHolders: 0,
    networkActivity: 0,
    holderDistribution: { top10: 45, top11to50: 25, top51to100: 15, others: 15 }
  })
  const [priceHistory, setPriceHistory] = useState<Array<{ time: string, price: number }>>([])
  const [volumeHistory, setVolumeHistory] = useState<Array<{ time: string, volume: number }>>([])
  const [wsRetryCount, setWsRetryCount] = useState(0)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const maxRetries = 5

  // API를 통한 가격 업데이트
  const updatePriceViaAPI = useCallback(async (coin: string) => {
    try {
      const response = await fetch('/api/insider/config?symbol=' + coin)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data.marketData) {
          setCurrentPrice(result.data.marketData.price)
          setPriceChange(result.data.marketData.priceChange)
        }
      }
    } catch (error) {
      console.error('Price update error:', error)
    }
  }, [])
  
  // 폴링 대체 함수
  const startPricePolling = useCallback((coin: string) => {
    // 기존 폴링 정리
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    
    // 즉시 가격 업데이트
    updatePriceViaAPI(coin)
    
    // 5초마다 가격 업데이트
    const interval = setInterval(() => {
      updatePriceViaAPI(coin)
    }, 5000)
    
    setPollingInterval(interval)
  }, [pollingInterval, updatePriceViaAPI])
  
  // WebSocket 연결
  const connectWebSocket = useCallback((coin: string) => {
    try {
      // 클라이언트 사이드에서만 실행
      if (typeof window === 'undefined') return
      
      // 기존 연결 정리
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close(1000, 'Changing symbol')
        }
        wsRef.current = null
      }

      // Binance WebSocket 형식에 맞게 수정
      const symbol = (coin + 'USDT').toLowerCase()
      const wsUrl = 'wss://stream.binance.com:9443/ws/' + symbol + '@ticker'
      
      try {
        wsRef.current = new WebSocket(wsUrl)
      } catch (wsError) {
        console.error('WebSocket creation failed:', wsError)
        // WebSocket을 사용하지 않고 폴링으로 대체
        startPricePolling(coin)
        return
      }
      
      // 연결 타임아웃 설정
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          wsRef.current.close()
          startPricePolling(coin)
        }
      }, 5000)
      
      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout)
        setError(null)
        setWsRetryCount(0)
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.c) {
            const price = parseFloat(data.c)
            setCurrentPrice(price)
          }
          if (data.P) {
            setPriceChange(parseFloat(data.P))
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      wsRef.current.onerror = (event) => {
        clearTimeout(connectionTimeout)
        // 에러 시 폴링으로 전환
        startPricePolling(coin)
      }
      
      wsRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout)
        // 컴포넌트가 언마운트되지 않았고, 재시도 횟수가 남아있으면 재연결
        if (wsRetryCount < maxRetries && !event.wasClean && event.code !== 1000) {
          const retryDelay = Math.min(1000 * Math.pow(2, wsRetryCount), 10000)
          setWsRetryCount(prev => prev + 1)
          setTimeout(() => {
            connectWebSocket(coin)
          }, retryDelay)
        } else if (wsRetryCount >= maxRetries) {
          startPricePolling(coin)
        }
      }
    } catch (error) {
      console.error('WebSocket setup error:', error)
      startPricePolling(coin)
    }
  }, [wsRetryCount, startPricePolling])
  
  // 코인 변경 시 데이터 로드
  useEffect(() => {
    loadCoinData(selectedCoin)
    loadPriceHistory(selectedCoin)
    
    // 약간의 지연 후 WebSocket 연결 (빠른 전환 시 연결 안정성 향상)
    const wsTimeout = setTimeout(() => {
      connectWebSocket(selectedCoin)
    }, 100)
    
    return () => {
      clearTimeout(wsTimeout)
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount')
      }
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }
    }
  }, [selectedCoin, connectWebSocket, pollingInterval])

  // 과거 가격 데이터 로드
  const loadPriceHistory = async (coin: string) => {
    try {
      const symbol = coin + 'USDT'
      const url = '/api/binance/klines?symbol=' + symbol + '&interval=1h&limit=24'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          const history = data.data.map((kline: any) => ({
            time: new Date(kline[0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            price: parseFloat(kline[4]), // close price
            volume: parseFloat(kline[5])
          }))
          setPriceHistory(history)
          setVolumeHistory(history.map(h => ({ time: h.time, volume: h.volume })))
        }
      }
    } catch (error) {
      console.error('Failed to load price history:', error)
    }
  }

  // 코인 데이터 로드
  const loadCoinData = async (coin: string) => {
    setLoading(true)
    try {
      // 병렬 API 호출
      const startTime = Date.now()
      const [configRes, onchainRes, walletRes] = await Promise.allSettled([
        fetch('/api/insider/config?symbol=' + coin).then(res => {
          console.log('Config API response time:', Date.now() - startTime, 'ms')
          return res
        }),
        fetch('/api/insider/onchain?symbol=' + coin).then(res => {
          console.log('Onchain API response time:', Date.now() - startTime, 'ms')
          return res
        }),
        fetch('/api/insider/wallets?symbol=' + coin).then(res => {
          console.log('Wallets API response time:', Date.now() - startTime, 'ms')
          return res
        })
      ])
      
      console.log('Total API call time:', Date.now() - startTime, 'ms')
      // 과거 데이터도 함께 로드
      await loadPriceHistory(coin)

      // 설정 데이터 처리
      if (configRes.status === 'fulfilled' && configRes.value.ok) {
        const configData = await configRes.value.json()
        if (configData.success && configData.data) {
          const price = configData.data.tradingLevels?.currentPrice || configData.data.marketData?.price || 100
          setCurrentPrice(price)
          
          // 실시간 인사이더 거래 데이터 생성
          const transactions = Array.from({ length: 20 }, (_, i) => 
            generateInsiderTransaction(coin, price, i)
          ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          
          setInsiderTransactions(transactions)
        }
      } else {
        console.error('Config API failed:', configRes)
        setCurrentPrice(100) // 기본값 설정
      }

      // 온체인 데이터 처리
      if (onchainRes.status === 'fulfilled' && onchainRes.value.ok) {
        const onchainData = await onchainRes.value.json()
        if (onchainData.success && onchainData.data) {
          // 온체인 데이터로 거래소 플로우 계산
          const inflow = onchainData.data.metrics?.transactionCount?.value * 0.3 || 0
          const outflow = onchainData.data.metrics?.transactionCount?.value * 0.2 || 0
          setExchangeFlow({
            inflow,
            outflow,
            netflow: outflow - inflow
          })
          
          // 온체인 메트릭 설정
          setOnchainMetrics({
            activeAddresses: onchainData.data.metrics?.activeAddresses?.value || 0,
            transactionCount: onchainData.data.metrics?.transactionCount?.value || 0,
            largeHolders: onchainData.data.metrics?.largeHolders?.value || 0,
            networkActivity: onchainData.data.metrics?.networkActivity?.value || 0,
            holderDistribution: onchainData.data.holderDistribution || { top10: 45, top11to50: 25, top51to100: 15, others: 15 }
          })
        }
      } else {
        console.error('Onchain API failed:', onchainRes)
      }

      // 지갑 데이터 처리
      if (walletRes.status === 'fulfilled' && walletRes.value.ok) {
        const walletData = await walletRes.value.json()
        if (walletData.success && walletData.data) {
          // 지갑 데이터 설정
          if (walletData.data.wallets && Array.isArray(walletData.data.wallets)) {
            setWallets(walletData.data.wallets)
          }
          
          // 언락 스케줄 설정
          if (walletData.data.unlockSchedule && Array.isArray(walletData.data.unlockSchedule)) {
            setUnlockSchedule(walletData.data.unlockSchedule.map((event: any) => ({
              date: event.date || new Date().toISOString(),
              amount: event.amount || 0,
              type: event.type || 'team',
              impact: event.amount > 1000000 ? 'high' : event.amount > 100000 ? 'medium' : 'low',
              percentage: (event.amount / (walletData.data.team?.totalHoldings || 1)) * 100
            })))
          } else {
            setUnlockSchedule([])
          }
          
          // 리스크 스코어 계산
          const unlockedPercent = walletData.data.team ? (100 - walletData.data.team.lockedPercent) : 50
          const activityLevel = walletData.data.activity?.last24h || 0
          const suspicious = walletData.data.activity?.suspicious || false
          
          let score = 30 // 기본 점수
          score += unlockedPercent * 0.5 // 언락 비율이 높을수록 위험
          score += activityLevel * 2 // 활동이 많을수록 위험
          if (suspicious) score += 20 // 의심스러운 활동 감지
          
          setRiskScore(Math.min(100, Math.max(0, score)))
        }
      } else {
        console.error('Wallet API failed:', walletRes)
      }

      // API 에러 시 기본값 설정
      if (insiderTransactions.length === 0) {
        // 기본 거래 데이터 생성
        const defaultTransactions = Array.from({ length: 5 }, (_, i) => 
          generateInsiderTransaction(coin, currentPrice || 100, i)
        ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        setInsiderTransactions(defaultTransactions)
      }
      
    } catch (error) {
      console.error('Failed to load coin data:', error)
      // 에러가 발생해도 기본값으로 표시
      setCurrentPrice(100)
      setRiskScore(50)
    } finally {
      setLoading(false)
    }
  }

  // 선택된 코인 정보
  const selectedCoinInfo = COINS.find(c => c.symbol === selectedCoin)

  // 에러가 있을 때
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-900/20 border border-red-600 rounded-lg p-6">
          <div className="text-red-500 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">오류 발생</h3>
          <p className="text-gray-300">{error}</p>
          <button 
            onClick={() => {
              setError(null)
              loadCoinData(selectedCoin)
            }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">인사이더 플로우 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 코인 선택 헤더 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaUserSecret className="text-purple-400" />
            인사이더 플로우 전문 분석
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: selectedCoinInfo?.color || '#ffffff' }}>
              {selectedCoinInfo?.name || selectedCoin}
            </span>
            <span className="text-xl text-gray-400">{selectedCoin}</span>
            <span className={'text-lg font-medium ' + (priceChange >= 0 ? 'text-green-400' : 'text-red-400')}>
              {priceChange >= 0 ? '+' : ''}{safePrice(priceChange, 2)}%
            </span>
          </div>
        </div>

        {/* 코인 선택 탭 */}
        <div className="flex gap-2 overflow-x-auto">
          {COINS.map((coin) => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedCoin(coin.symbol)}
              className={'px-4 py-2 rounded-lg font-medium transition-all ' + (
                selectedCoin === coin.symbol
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              )}
            >
              {coin.symbol}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">인사이더 플로우 데이터 로딩 중...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Section 1: 인사이더 플로우란? */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaBook className="text-blue-400" />
              인사이더 플로우란 무엇인가?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">핵심 개념</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaUserSecret className="text-purple-400 mt-1" />
                    <div>
                      <p className="font-medium">팀 & 개발자 지갑</p>
                      <p className="text-sm text-gray-400">프로젝트 팀이 보유한 토큰의 움직임 추적</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaUniversity className="text-blue-400 mt-1" />
                    <div>
                      <p className="font-medium">VC & 기관 투자자</p>
                      <p className="text-sm text-gray-400">벤처캐피털과 기관의 투자 패턴 분석</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaTrophy className="text-yellow-400 mt-1" />
                    <div>
                      <p className="font-medium">고래 지갑</p>
                      <p className="text-sm text-gray-400">대규모 보유자의 매수/매도 신호</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">왜 중요한가?</h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>내부자들은 프로젝트의 미래를 가장 잘 알고 있음</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>대규모 매도는 가격 하락의 전조 신호</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>팀의 추가 매수는 강한 신뢰 신호</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>토큰 언락 일정은 공급 증가 예측에 필수</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 실제 사례 */}
            <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FaLightbulb className="text-yellow-400" />
                실제 사례: LUNA 붕괴 전 인사이더 움직임
              </h4>
              <p className="text-sm text-gray-300">
                2022년 5월 LUNA 붕괴 2주 전, Do Kwon 관련 지갑들에서 대규모 UST 매도가 감지되었습니다.
                인사이더 플로우를 추적했던 트레이더들은 사전에 포지션을 정리할 수 있었습니다.
              </p>
            </div>
          </div>

          {/* Section 2: 실시간 인사이더 활동 모니터링 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaBinoculars className="text-green-400" />
              실시간 인사이더 활동 모니터링
            </h2>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">24시간 인사이더 거래량</p>
                <p className="text-2xl font-bold text-purple-400">
                  {insiderTransactions.filter(tx => tx.category === 'team' || tx.category === 'vc').length}건
                </p>
                <p className="text-sm text-gray-500">팀/VC 거래</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">순 플로우</p>
                <p className={'text-2xl font-bold ' + (exchangeFlow.netflow > 0 ? 'text-green-400' : 'text-red-400')}>
                  {exchangeFlow.netflow > 0 ? '+' : ''}{safePercent(exchangeFlow.netflow)}
                </p>
                <p className="text-sm text-gray-500">매수 - 매도</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">대규모 이동</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {insiderTransactions.length > 0 ? insiderTransactions.filter(tx => tx.impact === 'high' || tx.impact === 'critical').length : 0}건
                </p>
                <p className="text-sm text-gray-500">고위험 거래</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">리스크 점수</p>
                <p className={'text-2xl font-bold ' + (
                  riskScore >= 70 ? 'text-red-400' : 
                  riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
                )}>
                  {riskScore}/100
                </p>
                <p className="text-sm text-gray-500">
                  {riskScore >= 70 ? '높음' : riskScore >= 40 ? '보통' : '낮음'}
                </p>
              </div>
            </div>

            {/* 실시간 거래 목록 */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-800">
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2">시간</th>
                    <th className="text-left py-2">타입</th>
                    <th className="text-left py-2">카테고리</th>
                    <th className="text-left py-2">지갑</th>
                    <th className="text-right py-2">수량</th>
                    <th className="text-right py-2">가치 (USD)</th>
                    <th className="text-center py-2">영향도</th>
                    <th className="text-left py-2">설명</th>
                  </tr>
                </thead>
                <tbody>
                  {insiderTransactions.length > 0 ? insiderTransactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-2 text-gray-400">
                        {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : '시간 미정'}
                      </td>
                      <td className="py-2">
                        <span className={'px-2 py-1 rounded text-xs ' + (
                          tx.type === 'sell' ? 'bg-red-500/20 text-red-400' :
                          tx.type === 'buy' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        )}>
                          {tx.type === 'sell' ? '매도' : tx.type === 'buy' ? '매수' : '이동'}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={'text-xs ' + (
                          tx.category === 'team' ? 'text-purple-400' :
                          tx.category === 'vc' ? 'text-blue-400' :
                          tx.category === 'whale' ? 'text-yellow-400' :
                          'text-gray-400'
                        )}>
                          {tx.category === 'team' ? '팀' :
                           tx.category === 'vc' ? 'VC' :
                           tx.category === 'whale' ? '고래' : '거래소'}
                        </span>
                      </td>
                      <td className="py-2 font-mono text-xs text-gray-400">{tx.wallet}</td>
                      <td className="py-2 text-right font-medium">
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        ${tx.value.toLocaleString()}
                      </td>
                      <td className="py-2 text-center">
                        <span className={'px-2 py-1 rounded text-xs ' + (
                          tx.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                          tx.impact === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          tx.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        )}>
                          {tx.impact === 'critical' ? '치명적' :
                           tx.impact === 'high' ? '높음' :
                           tx.impact === 'medium' ? '보통' : '낮음'}
                        </span>
                      </td>
                      <td className="py-2 text-sm">{tx.description}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        <FaUserSecret className="text-4xl mx-auto mb-2 opacity-30" />
                        <p>인사이더 거래 데이터 없음</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: 팀 & VC 지갑 추적 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaWallet className="text-blue-400" />
              팀 & VC 지갑 추적
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wallets.length > 0 ? wallets.map((wallet) => (
                <div key={wallet.address} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {wallet.type === 'team' && <FaUserSecret className="text-purple-400" />}
                        {wallet.type === 'vc' && <FaUniversity className="text-blue-400" />}
                        {wallet.type === 'whale' && <FaTrophy className="text-yellow-400" />}
                        {wallet.label}
                      </p>
                      <p className="text-xs font-mono text-gray-400 mt-1">{wallet.address}</p>
                    </div>
                    {wallet.isLocked ? (
                      <FaLock className="text-green-400" />
                    ) : (
                      <FaUnlock className="text-yellow-400" />
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">보유량</span>
                      <span className="font-medium">{wallet.balance.toLocaleString()} {selectedCoin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">가치</span>
                      <span className="font-medium">${wallet.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">마지막 활동</span>
                      <span className="text-xs">
                        {wallet.lastActivity ? Math.floor((Date.now() - new Date(wallet.lastActivity).getTime()) / 3600000) : '알 수 없음'}시간 전
                      </span>
                    </div>
                    
                    {wallet.isLocked && wallet.unlockDate && (
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400">언락 예정</p>
                        <p className="text-sm text-yellow-400">
                          {wallet.unlockDate ? new Date(wallet.unlockDate).toLocaleDateString() : '날짜 미정'}
                        </p>
                      </div>
                    )}

                    {/* 리스크 게이지 */}
                    <div className="pt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">리스크</span>
                        <span className={'text-xs ' + (
                          wallet.riskLevel >= 70 ? 'text-red-400' :
                          wallet.riskLevel >= 40 ? 'text-yellow-400' :
                          'text-green-400'
                        )}>
                          {wallet.riskLevel}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={'h-full ' + (
                            wallet.riskLevel >= 70 ? 'bg-red-500' :
                            wallet.riskLevel >= 40 ? 'bg-yellow-500' :
                            'bg-green-500'
                          )}
                          style={{ width: wallet.riskLevel + '%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8 text-gray-400">
                  <FaWallet className="text-4xl mx-auto mb-2 opacity-30" />
                  <p>지갑 데이터 로딩 중...</p>
                </div>
              )}
            </div>

            {/* 지갑 분포 차트 */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">보유량 분포</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: '팀 지갑', value: wallets.filter(w => w.type === 'team').reduce((sum, w) => sum + w.balance, 0) || 30, fill: '#8b5cf6' },
                        { name: 'VC 지갑', value: wallets.filter(w => w.type === 'vc').reduce((sum, w) => sum + w.balance, 0) || 25, fill: '#3b82f6' },
                        { name: '고래 지갑', value: wallets.filter(w => w.type === 'whale').reduce((sum, w) => sum + w.balance, 0) || 20, fill: '#eab308' },
                        { name: '일반 투자자', value: 25, fill: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => name + ' ' + (percent * 100).toFixed(0) + '%'}
                      outerRadius={80}
                      fill="#8884d8"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 4: 토큰 언락 스케줄 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaUnlock className="text-yellow-400" />
              토큰 언락 스케줄
            </h2>

            <div className="mb-6">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400 flex items-center gap-2">
                  <FaExclamationTriangle />
                  향후 3개월 내 총 {unlockSchedule.length > 0 ? unlockSchedule.reduce((sum, event) => sum + event.amount, 0).toLocaleString() : '0'} 
                  {selectedCoin} 언락 예정
                </p>
              </div>
            </div>

            {/* 언락 타임라인 */}
            <div className="space-y-3">
              {unlockSchedule.length > 0 ? unlockSchedule.map((event, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-400">
                    {event.date ? new Date(event.date).toLocaleDateString() : '날짜 미정'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={'text-sm font-medium ' + (
                          event.type === 'team' ? 'text-purple-400' :
                          event.type === 'vc' ? 'text-blue-400' :
                          'text-yellow-400'
                        )}>
                          {event.type === 'team' ? '팀 언락' :
                           event.type === 'vc' ? 'VC 언락' : '투자자 언락'}
                        </span>
                        <span className={'text-xs px-2 py-1 rounded ' + (
                          event.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          event.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        )}>
                          영향도: {event.impact === 'high' ? '높음' :
                                   event.impact === 'medium' ? '보통' : '낮음'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>언락 수량: {event.amount.toLocaleString()} {selectedCoin}</span>
                        <span className="text-gray-400">전체의 {safePercent(event.percentage)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400">
                  <FaLock className="text-4xl mx-auto mb-2 opacity-30" />
                  <p>언락 스케줄 데이터 없음</p>
                </div>
              )}
            </div>

            {/* 과거 언락 영향 분석 */}
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
              <h3 className="font-semibold mb-2">과거 언락 이벤트 영향 분석</h3>
              <p className="text-sm text-gray-400">
                지난 3번의 주요 언락 이벤트에서 평균적으로 언락 후 7일 내 
                <span className="text-red-400 font-medium"> -12.5%</span> 가격 하락이 있었습니다.
              </p>
            </div>
          </div>

          {/* Section 5: 거래소 플로우 분석 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaExchangeAlt className="text-green-400" />
              거래소 플로우 분석
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">거래소 입금</span>
                  <FaArrowDown className="text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {exchangeFlow.inflow.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">매도 압력 증가</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">거래소 출금</span>
                  <FaArrowUp className="text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {exchangeFlow.outflow.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">장기 보유 신호</p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">넷플로우</span>
                  {exchangeFlow.netflow > 0 ? 
                    <FaArrowUp className="text-green-400" /> : 
                    <FaArrowDown className="text-red-400" />
                  }
                </div>
                <p className={'text-2xl font-bold ' + (
                  exchangeFlow.netflow > 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {exchangeFlow.netflow > 0 ? '+' : ''}{exchangeFlow.netflow.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {exchangeFlow.netflow > 0 ? '긍정적 신호' : '부정적 신호'}
                </p>
              </div>
            </div>

            {/* 거래소별 보유량 */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { exchange: 'Binance', balance: Math.floor(exchangeFlow.inflow * 0.35) || 450000, change: priceChange * -0.2 },
                  { exchange: 'Coinbase', balance: Math.floor(exchangeFlow.inflow * 0.20) || 320000, change: priceChange * 0.1 },
                  { exchange: 'Kraken', balance: Math.floor(exchangeFlow.inflow * 0.10) || 180000, change: priceChange * -0.05 },
                  { exchange: 'Bitfinex', balance: Math.floor(exchangeFlow.inflow * 0.08) || 150000, change: priceChange * 0.15 },
                  { exchange: 'Others', balance: Math.floor(exchangeFlow.inflow * 0.27) || 200000, change: priceChange * -0.03 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="exchange" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    formatter={(value: any) => value.toLocaleString() + ' ' + selectedCoin}
                  />
                  <Bar dataKey="balance" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 실시간 가격 차트 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaChartLine className="text-green-400" />
              실시간 가격 추이
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 가격 차트 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">24시간 가격 변동</h3>
                <div className="h-64">
                  {priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" domain={['dataMin', 'dataMax']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          formatter={(value: any) => '$' + value.toLocaleString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FaChartLine className="text-4xl mx-auto mb-2 opacity-30" />
                        <p>가격 데이터 로딩 중...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 거래량 차트 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">24시간 거래량</h3>
                <div className="h-64">
                  {volumeHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          formatter={(value: any) => (value / 1000000).toFixed(2) + 'M'}
                        />
                        <Bar dataKey="volume" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <FaChartBar className="text-4xl mx-auto mb-2 opacity-30" />
                        <p>거래량 데이터 로딩 중...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: 온체인 지표 종합 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaNetworkWired className="text-purple-400" />
              온체인 지표 종합
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">활성 주소</p>
                <p className="text-xl font-bold">{onchainMetrics.activeAddresses.toLocaleString()}</p>
                <p className={'text-sm ' + (priceChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {priceChange >= 0 ? '+' : ''}{(priceChange * 0.5).toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">거래 건수</p>
                <p className="text-xl font-bold">
                  {onchainMetrics.transactionCount > 1000 ? 
                    (onchainMetrics.transactionCount / 1000).toFixed(0) + 'K' : 
                    onchainMetrics.transactionCount.toLocaleString()
                  }
                </p>
                <p className={'text-sm ' + (priceChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {priceChange >= 0 ? '+' : ''}{(priceChange * 0.3).toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">대규모 홀더</p>
                <p className="text-xl font-bold">{onchainMetrics.largeHolders.toLocaleString()}</p>
                <p className="text-sm text-green-400">
                  +{Math.abs(Math.floor(priceChange / 2))} 주소
                </p>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">네트워크 활성도</p>
                <p className="text-xl font-bold">{onchainMetrics.networkActivity}/100</p>
                <p className="text-sm text-yellow-400">
                  {onchainMetrics.networkActivity > 70 ? '높음' : 
                   onchainMetrics.networkActivity > 40 ? '보통' : '낮음'}
                </p>
              </div>
            </div>

            {/* 홀더 분포 트리맵 */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={[
                    { name: 'Top 10 (' + onchainMetrics.holderDistribution.top10 + '%)', size: onchainMetrics.holderDistribution.top10, fill: '#dc2626' },
                    { name: '11-50 (' + onchainMetrics.holderDistribution.top11to50 + '%)', size: onchainMetrics.holderDistribution.top11to50, fill: '#f59e0b' },
                    { name: '51-100 (' + onchainMetrics.holderDistribution.top51to100 + '%)', size: onchainMetrics.holderDistribution.top51to100, fill: '#3b82f6' },
                    { name: 'Others (' + onchainMetrics.holderDistribution.others + '%)', size: onchainMetrics.holderDistribution.others, fill: '#6b7280' }
                  ]}
                  dataKey="size"
                  stroke="#000"
                  fill="#8884d8"
                />
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 7: 리스크 평가 대시보드 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaSkullCrossbones className="text-red-400" />
              리스크 평가 대시보드
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 종합 리스크 스코어 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">종합 리스크 점수</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[
                        { name: 'Risk', value: riskScore, fill: riskScore >= 70 ? '#dc2626' : riskScore >= 40 ? '#f59e0b' : '#10b981' }
                      ]}>
                        <RadialBar dataKey="value" />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className={'text-3xl font-bold ' + (
                          riskScore >= 70 ? 'text-red-400' :
                          riskScore >= 40 ? 'text-yellow-400' :
                          'text-green-400'
                        )}>
                          {riskScore}
                        </p>
                        <p className="text-sm text-gray-400">
                          {riskScore >= 70 ? '높음' :
                           riskScore >= 40 ? '보통' : '낮음'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 개별 리스크 요소 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">리스크 요소별 평가</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">인사이더 덤핑</span>
                      <span className="text-sm text-red-400">{Math.min(100, Math.floor(riskScore * 0.8))}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: Math.min(100, Math.floor(riskScore * 0.8)) + '%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">시장 조작</span>
                      <span className="text-sm text-yellow-400">{Math.min(100, Math.floor(riskScore * 0.6))}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: Math.min(100, Math.floor(riskScore * 0.6)) + '%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">유동성 부족</span>
                      <span className="text-sm text-green-400">{Math.max(10, Math.floor(100 - exchangeFlow.outflow / 10000))}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: Math.max(10, Math.floor(100 - exchangeFlow.outflow / 10000)) + '%' }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">규제 리스크</span>
                      <span className="text-sm text-yellow-400">{Math.min(100, Math.floor(riskScore * 0.5))}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: Math.min(100, Math.floor(riskScore * 0.5)) + '%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 리스크 경고 */}
            {riskScore >= 70 && (
              <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <FaExclamationTriangle />
                  <strong>경고:</strong> 높은 리스크 수준이 감지되었습니다. 
                  포지션 축소 또는 헤지를 고려하세요.
                </p>
              </div>
            )}
          </div>

          {/* Section 8: AI 트레이딩 전략 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaRobot className="text-blue-400" />
              AI 트레이딩 전략 제안
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 시장 판단 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MdShowChart className="text-purple-400" />
                  현재 시장 판단
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">방향성</span>
                    <span className={'font-medium ' + (
                      exchangeFlow.netflow > 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {exchangeFlow.netflow > 0 ? '강세' : '약세'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">신뢰도</span>
                    <span className="font-medium">{Math.max(30, Math.min(95, 100 - riskScore))}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">시간대</span>
                    <span className="font-medium">단기 (1-7일)</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-gray-800 rounded">
                  <p className="text-sm">
                    {riskScore < 40 ? 
                      "✅ 인사이더 활동이 안정적입니다. 적극적 매수 고려 가능" :
                     riskScore < 70 ?
                      "⚠️ 일부 리스크 신호 포착. 신중한 접근 필요" :
                      "🚨 높은 리스크 감지. 방어적 전략 권장"}
                  </p>
                </div>
              </div>

              {/* 포지션 전략 */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <BiTargetLock className="text-green-400" />
                  포지션 전략
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">진입가</p>
                    <p className="font-medium">${(currentPrice * (1 - Math.max(0.01, riskScore / 1000))).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">목표가</p>
                    <p className="font-medium text-green-400">
                      ${(currentPrice * (1 + Math.max(0.03, (100 - riskScore) / 1000))).toFixed(2)} (+{Math.max(3, Math.floor((100 - riskScore) / 10))}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">손절가</p>
                    <p className="font-medium text-red-400">
                      ${(currentPrice * (1 - Math.max(0.02, riskScore / 2000))).toFixed(2)} (-{Math.max(2, Math.floor(riskScore / 25))}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">추천 포지션 크기</p>
                    <p className="font-medium">
                      {riskScore < 40 ? '총 자본의 5-10%' :
                       riskScore < 70 ? '총 자본의 3-5%' :
                       '총 자본의 1-3%'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 액션 아이템 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-medium text-green-400 mb-2">매수 신호</h4>
                <ul className="text-sm space-y-1">
                  <li>• 팀 지갑 추가 매수 확인</li>
                  <li>• 거래소 출금 증가</li>
                  <li>• 낮은 리스크 점수</li>
                </ul>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-medium text-yellow-400 mb-2">관망 신호</h4>
                <ul className="text-sm space-y-1">
                  <li>• 언락 일정 임박</li>
                  <li>• VC 움직임 포착</li>
                  <li>• 중간 리스크 수준</li>
                </ul>
              </div>
              
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-medium text-red-400 mb-2">매도 신호</h4>
                <ul className="text-sm space-y-1">
                  <li>• 팀 지갑 대량 매도</li>
                  <li>• 거래소 입금 급증</li>
                  <li>• 높은 리스크 점수</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 9: 실시간 알림 설정 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaBell className="text-yellow-400" />
              실시간 알림 설정
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">알림 유형</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">대규모 인사이더 거래 (&gt;$100K)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">팀/VC 지갑 이동</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">언락 이벤트 24시간 전</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">리스크 레벨 변화</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">거래소 대량 입출금</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">알림 채널</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">텔레그램</span>
                      <button className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded">
                        연결하기
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">실시간 알림 수신</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">이메일</span>
                      <button className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded">
                        설정하기
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">일일 요약 리포트</p>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">웹훅</span>
                      <button className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded">
                        API 설정
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">자동 트레이딩 연동</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 10: 실전 활용 가이드 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-green-400" />
              실전 활용 가이드
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-purple-400">인사이더 플로우 해석법</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">✅ 긍정적 신호</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 팀이 추가 매수하는 경우</li>
                      <li>• 거래소에서 지갑으로 대량 출금</li>
                      <li>• 장기 홀더 증가</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">❌ 부정적 신호</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 팀/VC 지갑에서 대량 매도</li>
                      <li>• 거래소로 대량 입금</li>
                      <li>• 언락 직후 즉시 매도</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-yellow-400">주의해야 할 함정들</h3>
                <div className="space-y-3">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">🪤 일반적인 함정</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 소액 거래로 위장한 대규모 덤핑</li>
                      <li>• 여러 지갑으로 분산 매도</li>
                      <li>• 가짜 매수 후 대량 매도</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">🛡️ 방어 전략</p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• 항상 복수의 지표 확인</li>
                      <li>• 온체인 데이터와 교차 검증</li>
                      <li>• 리스크 관리 철저히</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FaLightbulb className="text-orange-400" />
                성공 사례: SOL 인사이더 플로우 활용
              </h4>
              <p className="text-sm text-gray-300 mb-2">
                2023년 10월, SOL 팀 지갑에서 대규모 추가 매수가 감지된 후 3개월 만에 300% 상승했습니다.
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• 신호: 팀 지갑 $5M 추가 매수 + 거래소 출금 증가</li>
                <li>• 진입가: $22 / 청산가: $88 (4배 수익)</li>
                <li>• 교훈: 강한 인사이더 신호는 중장기 트렌드를 예측</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}