'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimePrice, useMultipleRealtimePrices, fetchKlines, fetchOrderBook, fetch24hrTicker } from '@/lib/hooks/useRealtimePrice'
import { dataService } from '@/lib/services/finalDataService'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { 
  FaPercent, FaClock, FaChartLine, FaExclamationTriangle, 
  FaArrowUp, FaArrowDown, FaDollarSign, FaExchangeAlt,
  FaBitcoin, FaEthereum, FaCoins, FaChartBar, FaHistory,
  FaRobot, FaCalculator, FaBalanceScale, FaFireAlt,
  FaWater, FaChartArea, FaInfoCircle, FaTrophy,
  FaGraduationCap, FaLightbulb, FaUserGraduate, FaSync
} from 'react-icons/fa'
import { SiBinance, SiSolana, SiRipple, SiDogecoin } from 'react-icons/si'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, PieChart, Pie, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

// 코인 설정
const COINS = [
  { symbol: 'BTCUSDT', name: 'BTC', icon: FaBitcoin, color: '#F7931A' },
  { symbol: 'ETHUSDT', name: 'ETH', icon: FaEthereum, color: '#627EEA' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: SiBinance, color: '#F3BA2F' },
  { symbol: 'SOLUSDT', name: 'SOL', icon: SiSolana, color: '#9945FF' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: SiRipple, color: '#23292F' },
  { symbol: 'ADAUSDT', name: 'ADA', icon: FaCoins, color: '#0033AD' },
  { symbol: 'DOGEUSDT', name: 'DOGE', icon: SiDogecoin, color: '#C2A633' },
  { symbol: 'AVAXUSDT', name: 'AVAX', icon: FaCoins, color: '#E84142' },
  { symbol: 'MATICUSDT', name: 'MATIC', icon: FaCoins, color: '#8247E5' },
  { symbol: 'ARBUSDT', name: 'ARB', icon: FaCoins, color: '#28A0F0' }
]

interface FundingData {
  current: {
    symbol: string
    fundingRate: number
    nextFundingRate: number
    lastFundingRate: number
    fundingTime: number
    nextFundingTime: number
    countdown: string
    countdownMs: number
    markPrice: number
    indexPrice: number
    premium: number
    annualizedRate: number
  }
  statistics: {
    avgRate: number
    maxRate: number
    minRate: number
    trend: string
    sentiment: string
    dataPoints: number
  }
  history: Array<{
    time: number
    rate: number
    symbol: string
  }>
  recommendation: {
    action: string
    confidence: number
    reason: string
  }
}


// 고유 ID 생성 함수
const generateUniqueId = (prefix: string = '', suffix: string = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}${suffix ? '-' + suffix : ''}`;
}

export default function FundingRateUltimate() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [fundingData, setFundingData] = useState<FundingData | null>(null)
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const streamName = symbol.toLowerCase().replace('usdt', '') + 'usdt@markPrice@1s'
    
    wsRef.current = new WebSocket(`wss://fstream.binance.com/ws/${streamName}`)
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected for funding rate:', symbol)
    }
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.e === 'markPriceUpdate') {
          setFundingData(prev => {
            if (!prev) return null
            return {
              ...prev,
              current: {
                ...prev.current,
                fundingRate: data.r || prev.current.fundingRate,
                markPrice: parseFloat(data.p),
                indexPrice: parseFloat(data.i),
                nextFundingTime: data.T,
                countdown: formatCountdown(data.T - Date.now()),
                countdownMs: data.T - Date.now()
              }
            }
          })
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected')
      setTimeout(() => connectWebSocket(symbol), 5000)
    }
  }, [])
  
  // 펀딩 히스토리 로드
  const loadFundingHistory = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(`/api/binance/funding-rate?symbol=${symbol}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        setHistoryData(data)
        
        // 통계 계산
        if (data && data.length > 0) {
          const rates = data.map((d: any) => parseFloat(d.fundingRate))
          const avgRate = rates.reduce((a: number, b: number) => a + b, 0) / rates.length
          const maxRate = Math.max(...rates)
          const minRate = Math.min(...rates)
          
          setFundingData(prev => {
            if (!prev) {
              return {
                current: {
                  symbol,
                  fundingRate: rates[0],
                  nextFundingRate: 0,
                  lastFundingRate: rates[1] || 0,
                  fundingTime: Date.now(),
                  nextFundingTime: Date.now() + 28800000,
                  countdown: '08:00:00',
                  countdownMs: 28800000,
                  markPrice: 0,
                  indexPrice: 0,
                  premium: 0,
                  annualizedRate: rates[0] * 365 * 3
                },
                statistics: {
                  avgRate,
                  maxRate,
                  minRate,
                  trend: avgRate > 0 ? 'bullish' : 'bearish',
                  sentiment: Math.abs(avgRate) > 0.01 ? 'extreme' : 'normal',
                  dataPoints: data.length
                },
                history: data.slice(0, 50).map((d: any) => ({
                  time: d.fundingTime,
                  rate: parseFloat(d.fundingRate),
                  symbol: d.symbol
                })),
                recommendation: {
                  action: avgRate > 0.01 ? 'Consider Short' : avgRate < -0.01 ? 'Consider Long' : 'Neutral',
                  confidence: Math.min(95, Math.abs(avgRate) * 10000),
                  reason: avgRate > 0.01 ? 'High positive funding rate' : avgRate < -0.01 ? 'High negative funding rate' : 'Balanced funding'
                }
              }
            }
            
            return {
              ...prev,
              statistics: {
                avgRate,
                maxRate,
                minRate,
                trend: avgRate > 0 ? 'bullish' : 'bearish',
                sentiment: Math.abs(avgRate) > 0.01 ? 'extreme' : 'normal',
                dataPoints: data.length
              },
              history: data.slice(0, 50).map((d: any) => ({
                time: d.fundingTime,
                rate: parseFloat(d.fundingRate),
                symbol: d.symbol
              }))
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to load funding history:', error)
    }
  }, [])
  
  // 카운트다운 포맷
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '00:00:00'
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  // 초기화
  useEffect(() => {
    connectWebSocket(selectedSymbol)
    loadFundingHistory(selectedSymbol)
    
    const priceInterval = setInterval(() => {
      fetch(`/api/binance/ticker?symbol=${selectedSymbol}`)
        .then(res => res.json())
        .then(data => {
          setCurrentPrice(parseFloat(data.price))
        })
        .catch(console.error)
    }, 5000)
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      clearInterval(priceInterval)
    }
  }, [selectedSymbol, connectWebSocket, loadFundingHistory])
  
  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return
    
    const refreshInterval = setInterval(() => {
      loadFundingHistory(selectedSymbol)
    }, 30000)
    
    return () => clearInterval(refreshInterval)
  }, [autoRefresh, selectedSymbol, loadFundingHistory])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          💸 펀딩 비율 분석
        </h1>
        
        {/* 코인 선택 */}
        <div className="mb-6 flex justify-center gap-2 flex-wrap">
          {COINS.map(coin => {
            const Icon = coin.icon
            return (
              <button
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  selectedSymbol === coin.symbol
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon style={{ color: coin.color }} />
                <span>{coin.name}</span>
              </button>
            )
          })}
        </div>
        
        {/* 자동 새로고침 토글 */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <FaSync className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? '자동 새로고침 ON' : '자동 새로고침 OFF'}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <FaClock className="animate-spin text-4xl text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">펀딩 데이터 로딩 중...</p>
          </div>
        ) : fundingData ? (
          <div className="space-y-6">
            {/* 현재 펀딩 정보 */}
            <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaPercent className="text-purple-400" />
                현재 펀딩 비율
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">현재 펀딩률</p>
                  <p className={`text-3xl font-bold ${
                    fundingData.current.fundingRate > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {safePercent(fundingData.current.fundingRate * 100)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {fundingData.current.fundingRate > 0 ? 'Longs pay Shorts' : 'Shorts pay Longs'}
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">연간 수익률</p>
                  <p className={`text-3xl font-bold ${
                    fundingData.current.annualizedRate > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {safePercent(fundingData.current.annualizedRate)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">APR</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">다음 펀딩까지</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {fundingData.current.countdown}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <FaClock className="inline mr-1" />
                    8시간마다 정산
                  </p>
                </div>
              </div>
            </div>
            
            {/* 통계 정보 */}
            <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaChartBar className="text-purple-400" />
                펀딩 통계
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">평균 펀딩률</p>
                  <p className={`text-xl font-bold ${
                    fundingData.statistics.avgRate > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {safePercent(fundingData.statistics.avgRate * 100)}%
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">최대 펀딩률</p>
                  <p className="text-xl font-bold text-red-400">
                    {safePercent(fundingData.statistics.maxRate * 100)}%
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">최소 펀딩률</p>
                  <p className="text-xl font-bold text-green-400">
                    {safePercent(fundingData.statistics.minRate * 100)}%
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">시장 센티먼트</p>
                  <p className={`text-xl font-bold ${
                    fundingData.statistics.sentiment === 'extreme' ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {fundingData.statistics.sentiment === 'extreme' ? '🔥 극단적' : '⚖️ 정상'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 추천 전략 */}
            <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaRobot className="text-purple-400" />
                AI 추천 전략
              </h2>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-bold text-white">{fundingData.recommendation.action}</p>
                  <div className="flex items-center gap-2">
                    <FaLightbulb className="text-yellow-400" />
                    <span className="text-gray-400">신뢰도: {safeFixed(fundingData.recommendation.confidence, 0)}%</span>
                  </div>
                </div>
                <p className="text-gray-400">{fundingData.recommendation.reason}</p>
                
                <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-500">
                    💡 팁: 펀딩률이 극단적일 때 반대 포지션을 고려하세요.
                    높은 양의 펀딩률은 숏 포지션에 유리하고,
                    높은 음의 펀딩률은 롱 포지션에 유리합니다.
                  </p>
                </div>
              </div>
            </div>
            
            {/* 펀딩 히스토리 차트 */}
            {fundingData.history && fundingData.history.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaHistory className="text-purple-400" />
                  펀딩 히스토리
                </h2>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fundingData.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#9CA3AF"
                      tickFormatter={(time) => new Date(time).toLocaleDateString()}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tickFormatter={(value) => `${(value * 100).toFixed(3)}%`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: any) => `${(value * 100).toFixed(4)}%`}
                      labelFormatter={(time) => new Date(time).toLocaleString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-4xl text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-400">펀딩 데이터를 불러올 수 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}