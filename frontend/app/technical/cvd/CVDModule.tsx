'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBitcoin, FaEthereum, FaChartLine, FaChartBar, FaChartArea, 
  FaGraduationCap, FaRobot, FaBalanceScale, FaVolumeUp, FaCrosshairs, 
  FaSignal, FaTrophy, FaShieldAlt, FaBolt, FaBrain
} from 'react-icons/fa'
import DynamicGuideSection from './DynamicGuideSection'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import { BiLineChart, BiBarChart, BiPulse } from 'react-icons/bi'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import {
  LineChart, Line, BarChart, Bar, ComposedChart, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ScatterChart, Scatter, PieChart, Pie, TreemapChart
} from 'recharts'

// CVD 데이터 인터페이스
interface CVDData {
  time: string
  price: number
  buyVolume: number
  sellVolume: number
  delta: number
  cvd: number
  deltaPercent: string
  timestamp: number
}

interface SymbolStats {
  currentPrice: number
  priceChange: number
  volume24h: number
}

// 추적할 코인 목록
const TRACKED_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <FaBitcoin className="text-yellow-500" /> },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <FaEthereum className="text-blue-500" /> },
  { symbol: 'BNBUSDT', name: 'BNB', icon: <SiBinance className="text-yellow-600" /> },
  { symbol: 'SOLUSDT', name: 'Solana', icon: <div className="text-purple-500 font-bold">◎</div> },
  { symbol: 'XRPUSDT', name: 'XRP', icon: <div className="text-gray-400 font-bold">XRP</div> },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: <SiCardano className="text-blue-600" /> },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: <SiDogecoin className="text-yellow-500" /> },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: <div className="text-red-500 font-bold">AVAX</div> },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: <div className="text-purple-600 font-bold">MATIC</div> },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: <SiPolkadot className="text-pink-500" /> }
]

// 탭 정의
const TABS = [
  { id: 'guide', label: '개념 가이드', icon: <FaGraduationCap className="w-4 h-4" />, description: 'CVD 개념과 원리 학습' },
  { id: 'overview', label: '종합분석', icon: <FaChartLine className="w-4 h-4" />, description: 'CVD 종합 대시보드' },
  { id: 'realtime', label: '실시간', icon: <BiPulse className="w-4 h-4" />, description: '실시간 CVD 분석' },
  { id: 'cumulative', label: '누적분석', icon: <FaChartArea className="w-4 h-4" />, description: '누적 볼륨 델타' },
  { id: 'divergence', label: '다이버전스', icon: <FaSignal className="w-4 h-4" />, description: '가격-CVD 다이버전스' },
  { id: 'timeframe', label: '시간대별', icon: <BiBarChart className="w-4 h-4" />, description: '다중 시간대 분석' },
  { id: 'strategy', label: '전략', icon: <FaCrosshairs className="w-4 h-4" />, description: '트레이딩 전략' }
]

// 색상 테마
const COLORS = {
  buy: '#10b981',
  buyLight: '#22c55e',
  sell: '#ef4444',
  sellLight: '#dc2626',
  neutral: '#8b5cf6',
  neutralLight: '#a855f7',
  grid: '#1f2937',
  text: '#9ca3af',
  background: '#111827'
}

// 커스텀 툴팁
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-xl">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center gap-4">
            <span className="text-gray-300 text-sm">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// WebSocket 훅 (완전 독립적)
function useCVDWebSocket(symbol: string) {
  const [cvdData, setCvdData] = useState<CVDData[]>([])
  const [stats, setStats] = useState<SymbolStats>({
    currentPrice: 0,
    priceChange: 0,
    volume24h: 0
  })
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const cumulativeCVD = useRef<number>(0)
  const reconnectAttempts = useRef(0)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)

  const connectWebSocket = useCallback((targetSymbol: string) => {
    // 브라우저 환경 체크
    if (typeof window === 'undefined') return
    
    // 기존 연결 완전 정리
    if (wsRef.current) {
      wsRef.current.close(1000)
      wsRef.current = null
    }

    const wsUrl = `wss://stream.binance.com:9443/ws/${targetSymbol.toLowerCase()}@aggTrade`
    
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('CVD WebSocket connected:', targetSymbol)
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0

        // 초기 티커 데이터 가져오기
        fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${targetSymbol}`)
          .then(res => res.json())
          .then(data => {
            setStats({
              currentPrice: parseFloat(data.lastPrice),
              priceChange: parseFloat(data.priceChangePercent),
              volume24h: parseFloat(data.quoteVolume)
            })
          })
          .catch(err => console.error('Ticker fetch error:', err))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const price = parseFloat(data.p)
          const quantity = parseFloat(data.q)
          const quoteQuantity = quantity * price
          const timestamp = Date.now()

          // CVD 계산 (maker 여부로 매수/매도 구분)
          const isBuyOrder = !data.m // m이 false면 매수 주문
          const buyVolume = isBuyOrder ? quoteQuantity : 0
          const sellVolume = isBuyOrder ? 0 : quoteQuantity
          const delta = buyVolume - sellVolume

          cumulativeCVD.current += delta

          const newDataPoint: CVDData = {
            time: new Date().toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            }),
            price,
            buyVolume,
            sellVolume,
            delta,
            cvd: cumulativeCVD.current,
            deltaPercent: ((delta / (buyVolume + sellVolume)) * 100).toFixed(2),
            timestamp
          }

          setCvdData(prev => {
            const updated = [...prev, newDataPoint]
            return updated.slice(-200) // 최근 200개 데이터 유지
          })

          // 현재가 업데이트
          setStats(prev => ({ ...prev, currentPrice: price }))
          
        } catch (err) {
          console.error('CVD WebSocket message error:', err)
        }
      }

      ws.onerror = (event) => {
        // WebSocket 에러는 보안상 상세 정보를 제공하지 않음
        // 연결 실패는 주로 네트워크 문제나 CORS 정책 때문
        console.warn('CVD WebSocket 연결 에러 발생 - 재연결을 시도합니다')
        setError('WebSocket 연결 에러 - 재연결 중...')
        setIsConnected(false)
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.log('CVD WebSocket disconnected')
        
        // 자동 재연결 (최대 5회)
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          connectionDelayRef.current = setTimeout(() => {
            connectWebSocket(targetSymbol)
          }, delay)
        } else {
          setError('재연결 실패 (5회 초과)')
        }
      }

    } catch (err) {
      console.error('WebSocket 생성 오류:', err)
      setError('WebSocket 생성 실패')
    }
  }, [])

  useEffect(() => {
    // 심볼 변경 시 데이터 초기화
    setCvdData([])
    cumulativeCVD.current = 0
    setStats({ currentPrice: 0, priceChange: 0, volume24h: 0 })
    
    // 연결 지연 적용 (빠른 심볼 전환 방지)
    if (connectionDelayRef.current) {
      clearTimeout(connectionDelayRef.current)
    }
    
    connectionDelayRef.current = setTimeout(() => {
      connectWebSocket(symbol)
    }, 500)

    return () => {
      if (connectionDelayRef.current) {
        clearTimeout(connectionDelayRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close(1000)
        wsRef.current = null
      }
    }
  }, [symbol, connectWebSocket])

  return {
    cvdData,
    stats,
    isConnected,
    error,
    currentCVD: cvdData[cvdData.length - 1]?.cvd || 0,
    currentDelta: cvdData[cvdData.length - 1]?.delta || 0,
    buyPressure: cvdData.slice(-10).reduce((sum, d) => sum + d.buyVolume, 0),
    sellPressure: cvdData.slice(-10).reduce((sum, d) => sum + d.sellVolume, 0)
  }
}

// Chart 1: CVD 트렌드 라인
const CVDTrendChart = ({ data }: { data: CVDData[] }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <FaChartLine className="text-purple-400" />
      CVD 트렌드 라인
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.slice(-50)}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
        <YAxis stroke={COLORS.text} fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="cvd" 
          stroke={COLORS.neutral} 
          strokeWidth={2} 
          dot={false}
          name="CVD"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

// Chart 2: 가격-CVD 비교
const PriceCVDComparisonChart = ({ data }: { data: CVDData[] }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <BiLineChart className="text-blue-400" />
      가격-CVD 비교
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data.slice(-50)}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
        <YAxis yAxisId="left" stroke={COLORS.text} fontSize={12} />
        <YAxis yAxisId="right" orientation="right" stroke={COLORS.text} fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          yAxisId="left" 
          type="monotone" 
          dataKey="price" 
          stroke="#fbbf24" 
          strokeWidth={2} 
          name="가격"
          dot={false}
        />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="cvd" 
          stroke={COLORS.neutral} 
          strokeWidth={2} 
          name="CVD"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
)

// Chart 3: 볼륨 델타 바 차트
const VolumeDeltaBarChart = ({ data }: { data: CVDData[] }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <FaChartBar className="text-green-400" />
      볼륨 델타
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.slice(-30)}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
        <YAxis stroke={COLORS.text} fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="delta" name="델타">
          {data.slice(-30).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.delta > 0 ? COLORS.buy : COLORS.sell} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)

// Chart 4: 매수/매도 압력 에어리어
const BuySellPressureChart = ({ data }: { data: CVDData[] }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <FaChartArea className="text-indigo-400" />
      매수/매도 압력
    </h3>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data.slice(-40)}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
        <YAxis stroke={COLORS.text} fontSize={12} />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="buyVolume" 
          stackId="1" 
          stroke={COLORS.buy} 
          fill={COLORS.buy}
          name="매수 볼륨"
        />
        <Area 
          type="monotone" 
          dataKey="sellVolume" 
          stackId="1" 
          stroke={COLORS.sell} 
          fill={COLORS.sell}
          name="매도 볼륨"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

// Chart 5: CVD 모멘텀 오실레이터
const CVDMomentumChart = ({ data }: { data: CVDData[] }) => {
  const momentumData = data.map((item, index) => {
    const previousCVD = index > 0 ? data[index - 1].cvd : item.cvd
    const momentum = item.cvd - previousCVD
    return { ...item, momentum }
  })

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BiPulse className="text-orange-400" />
        CVD 모멘텀
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={momentumData.slice(-50)}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
          <YAxis stroke={COLORS.text} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
          <Line 
            type="monotone" 
            dataKey="momentum" 
            stroke="#f97316" 
            strokeWidth={2} 
            name="모멘텀"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 6: 델타 분포 히스토그램
const DeltaDistributionChart = ({ data }: { data: CVDData[] }) => {
  const buckets = [-5, -3, -1, 0, 1, 3, 5]
  const distribution = buckets.map(bucket => {
    const count = data.filter(d => {
      const deltaPercent = parseFloat(d.deltaPercent)
      return bucket === -5 ? deltaPercent < -3 :
             bucket === 5 ? deltaPercent > 3 :
             deltaPercent >= bucket && deltaPercent < bucket + 2
    }).length
    return { bucket: `${bucket}%`, count, fill: bucket > 0 ? COLORS.buy : COLORS.sell }
  })

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaChartBar className="text-cyan-400" />
        델타 분포
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={distribution}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="bucket" stroke={COLORS.text} fontSize={12} />
          <YAxis stroke={COLORS.text} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="빈도">
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 7: CVD 다이버전스 스캐터
const CVDDivergenceScatter = ({ data }: { data: CVDData[] }) => {
  const scatterData = data.map((item, index) => {
    const priceChange = index > 0 ? ((item.price - data[index - 1].price) / data[index - 1].price) * 100 : 0
    const cvdChange = index > 0 ? item.cvd - data[index - 1].cvd : 0
    return { 
      priceChange, 
      cvdChange, 
      time: item.time,
      isDivergent: Math.sign(priceChange) !== Math.sign(cvdChange) && Math.abs(priceChange) > 0.1
    }
  }).filter(d => d.priceChange !== 0)

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaSignal className="text-red-400" />
        다이버전스 분석
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis 
            type="number" 
            domain={[-2, 2]} 
            dataKey="priceChange" 
            stroke={COLORS.text} 
            name="가격 변화%" 
          />
          <YAxis 
            type="number" 
            dataKey="cvdChange" 
            stroke={COLORS.text} 
            name="CVD 변화"
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter name="일반" data={scatterData.filter(d => !d.isDivergent)} fill="#8884d8" />
          <Scatter name="다이버전스" data={scatterData.filter(d => d.isDivergent)} fill="#ff0000" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 8: 실시간 CVD 게이지
const CVDGaugeChart = ({ currentCVD, data }: { currentCVD: number, data: CVDData[] }) => {
  const maxCVD = Math.max(...data.map(d => Math.abs(d.cvd)), 1000000)
  const normalizedCVD = (currentCVD / maxCVD) * 100
  
  const gaugeData = [
    { name: 'CVD', value: Math.abs(normalizedCVD), fill: currentCVD > 0 ? COLORS.buy : COLORS.sell }
  ]

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaBalanceScale className="text-purple-400" />
        실시간 CVD 강도
      </h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx={100}
                cy={100}
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${currentCVD > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(normalizedCVD).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">
                {currentCVD > 0 ? '매수 우세' : '매도 우세'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Chart 9: 시간대별 CVD 히트맵
const TimeframeCVDHeatmap = ({ data }: { data: CVDData[] }) => {
  const timeframes = ['1m', '5m', '15m', '1h']
  const heatmapData = timeframes.map(tf => {
    const interval = tf === '1m' ? 1 : tf === '5m' ? 5 : tf === '15m' ? 15 : 60
    const filteredData = data.filter((_, index) => index % interval === 0)
    const avgCVD = filteredData.reduce((sum, d) => sum + d.cvd, 0) / filteredData.length || 0
    return {
      timeframe: tf,
      cvd: avgCVD,
      intensity: Math.abs(avgCVD) / 1000000
    }
  })

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BiBarChart className="text-teal-400" />
        시간대별 CVD
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={heatmapData}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="timeframe" stroke={COLORS.text} />
          <YAxis stroke={COLORS.text} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cvd" name="CVD">
            {heatmapData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.cvd > 0 ? COLORS.buy : COLORS.sell} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 10: CVD 레이더 차트
const CVDRadarChart = ({ data }: { data: CVDData[] }) => {
  const latest = data.slice(-6)
  const radarData = latest.map((item, index) => ({
    period: `T-${latest.length - index - 1}`,
    CVD: Math.abs(item.cvd) / 1000000,
    Delta: Math.abs(item.delta) / 100000,
    Volume: (item.buyVolume + item.sellVolume) / 1000000
  }))

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaSignal className="text-pink-400" />
        CVD 레이더 분석
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke={COLORS.grid} />
          <PolarAngleAxis dataKey="period" stroke={COLORS.text} />
          <PolarRadiusAxis stroke={COLORS.text} />
          <Radar name="CVD" dataKey="CVD" stroke={COLORS.neutral} fill={COLORS.neutral} fillOpacity={0.3} />
          <Radar name="Delta" dataKey="Delta" stroke={COLORS.buy} fill={COLORS.buy} fillOpacity={0.2} />
          <Radar name="Volume" dataKey="Volume" stroke={COLORS.sell} fill={COLORS.sell} fillOpacity={0.2} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 11: 누적 볼륨 프로파일
const CumulativeVolumeProfile = ({ data }: { data: CVDData[] }) => {
  const profileData = data.slice(-50).reduce((acc: any[], item) => {
    const priceLevel = Math.round(item.price / 10) * 10
    const existing = acc.find(p => p.price === priceLevel)
    if (existing) {
      existing.volume += item.buyVolume + item.sellVolume
      existing.buyVolume += item.buyVolume
      existing.sellVolume += item.sellVolume
    } else {
      acc.push({
        price: priceLevel,
        volume: item.buyVolume + item.sellVolume,
        buyVolume: item.buyVolume,
        sellVolume: item.sellVolume
      })
    }
    return acc
  }, []).sort((a, b) => a.price - b.price)

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaVolumeUp className="text-yellow-400" />
        볼륨 프로파일
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={profileData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis type="number" stroke={COLORS.text} />
          <YAxis type="category" dataKey="price" stroke={COLORS.text} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="buyVolume" stackId="volume" fill={COLORS.buy} name="매수 볼륨" />
          <Bar dataKey="sellVolume" stackId="volume" fill={COLORS.sell} name="매도 볼륨" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 12: CVD 트레이딩 시그널
const TradingSignalChart = ({ data }: { data: CVDData[] }) => {
  const signalData = data.map((item, index) => {
    let signal = 'HOLD'
    if (index > 5) {
      const cvdTrend = data.slice(index - 5, index).reduce((sum, d, i, arr) => {
        return i > 0 ? sum + (d.cvd > arr[i-1].cvd ? 1 : -1) : sum
      }, 0)
      const deltaStrength = Math.abs(parseFloat(item.deltaPercent))
      
      if (cvdTrend > 2 && deltaStrength > 1) signal = 'BUY'
      else if (cvdTrend < -2 && deltaStrength > 1) signal = 'SELL'
    }
    
    return {
      ...item,
      signal,
      signalValue: signal === 'BUY' ? 1 : signal === 'SELL' ? -1 : 0
    }
  })

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaCrosshairs className="text-emerald-400" />
        트레이딩 시그널
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={signalData.slice(-40)}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
          <YAxis yAxisId="left" stroke={COLORS.text} fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke={COLORS.text} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="price" 
            stroke="#fbbf24" 
            strokeWidth={1} 
            name="가격"
            dot={false}
          />
          <Bar yAxisId="right" dataKey="signalValue" name="시그널">
            {signalData.slice(-40).map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.signalValue > 0 ? COLORS.buy : entry.signalValue < 0 ? COLORS.sell : COLORS.neutral} 
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 13: CVD 변동성 분석
const CVDVolatilityChart = ({ data }: { data: CVDData[] }) => {
  const volatilityData = data.map((item, index) => {
    if (index < 10) return { ...item, volatility: 0 }
    
    const recent = data.slice(index - 10, index)
    const mean = recent.reduce((sum, d) => sum + d.cvd, 0) / recent.length
    const variance = recent.reduce((sum, d) => sum + Math.pow(d.cvd - mean, 2), 0) / recent.length
    const volatility = Math.sqrt(variance)
    
    return { ...item, volatility }
  })

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaBolt className="text-amber-400" />
        CVD 변동성
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={volatilityData.slice(-50)}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
          <YAxis stroke={COLORS.text} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="volatility" 
            stroke="#f59e0b" 
            fill="#f59e0b" 
            fillOpacity={0.3}
            name="변동성"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 14: 매수/매도 파워 인덱스
const BuySellPowerIndex = ({ data }: { data: CVDData[] }) => {
  const powerData = data.map((item, index) => {
    const totalVolume = item.buyVolume + item.sellVolume
    const buyPower = totalVolume > 0 ? (item.buyVolume / totalVolume) * 100 : 50
    const sellPower = 100 - buyPower
    return { ...item, buyPower, sellPower }
  })

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaBrain className="text-violet-400" />
        매수/매도 파워 인덱스
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={powerData.slice(-40)}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="time" stroke={COLORS.text} fontSize={12} />
          <YAxis domain={[0, 100]} stroke={COLORS.text} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={50} stroke="#666" strokeDasharray="2 2" />
          <Area 
            type="monotone" 
            dataKey="buyPower" 
            stackId="1" 
            stroke={COLORS.buy} 
            fill={COLORS.buy}
            name="매수 파워 %"
          />
          <Area 
            type="monotone" 
            dataKey="sellPower" 
            stackId="1" 
            stroke={COLORS.sell} 
            fill={COLORS.sell}
            name="매도 파워 %"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chart 15: CVD 상관관계 매트릭스
const CVDCorrelationMatrix = ({ data }: { data: CVDData[] }) => {
  const correlationData = [
    { metric: 'CVD-Price', correlation: 0.75 },
    { metric: 'CVD-Delta', correlation: 0.92 },
    { metric: 'Price-Volume', correlation: 0.45 },
    { metric: 'Delta-Volume', correlation: 0.83 }
  ]

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaShieldAlt className="text-indigo-400" />
        상관관계 매트릭스
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={correlationData}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="metric" stroke={COLORS.text} />
          <YAxis domain={[-1, 1]} stroke={COLORS.text} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="correlation" name="상관계수">
            {correlationData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.correlation > 0.5 ? COLORS.buy : entry.correlation < -0.5 ? COLORS.sell : COLORS.neutral} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 메인 CVD 모듈 컴포넌트
export default function CVDModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  
  // 실시간 WebSocket 데이터
  const { 
    cvdData, 
    stats, 
    isConnected, 
    error,
    currentCVD,
    currentDelta,
    buyPressure,
    sellPressure 
  } = useCVDWebSocket(selectedSymbol)
  
  // 선택된 코인 정보
  const selectedCoin = TRACKED_SYMBOLS.find(s => s.symbol === selectedSymbol)
  
  // 심볼 변경 핸들러
  const handleSymbolChange = useCallback((symbol: string) => {
    setIsLoading(true)
    setSelectedSymbol(symbol)
    setTimeout(() => setIsLoading(false), 800)
  }, [])

  // 탭별 차트 렌더링
  const renderTabContent = () => {
    if (cvdData.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 rounded-xl p-12 text-center"
        >
          <div className="text-gray-400">
            <BiLineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">실시간 데이터를 수집 중입니다...</p>
            <p className="text-sm mt-2">거래 데이터가 표시될 때까지 잠시 기다려주세요.</p>
            {!isConnected && (
              <p className="text-yellow-400 mt-4">WebSocket 연결 중...</p>
            )}
            {error && (
              <p className="text-red-400 mt-4">{error}</p>
            )}
          </div>
        </motion.div>
      )
    }

    switch (activeTab) {
      case 'guide':
        return (
          <div className="space-y-8">
            {/* CVD 기본 개념 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaBrain className="text-purple-400" />
                CVD란 무엇인가?
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <h4 className="text-lg font-bold text-blue-400 mb-3">📊 CVD (Cumulative Volume Delta)</h4>
                    <p className="text-gray-300 mb-3">
                      CVD는 누적 볼륨 델타(Cumulative Volume Delta)의 약자로, 매수 거래량과 매도 거래량의 
                      차이를 누적하여 계산한 지표입니다.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-400">매수 주문이 많으면 CVD 상승</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-400">✓</span>
                        <span className="text-gray-400">매도 주문이 많으면 CVD 하락</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400">✓</span>
                        <span className="text-gray-400">시장의 실제 매수/매도 압력을 시각화</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                    <h4 className="text-lg font-bold text-purple-400 mb-3">🔍 왜 CVD가 중요한가?</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>가격 움직임의 실제 원인 파악 가능</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>스마트머니의 포지션 방향 추적</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>가격과 볼륨의 다이버전스 발견</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>시장 심리와 트렌드 강도 측정</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                    <h4 className="text-lg font-bold text-green-400 mb-3">📈 CVD 계산 방법</h4>
                    <div className="bg-gray-900/50 p-3 rounded-lg font-mono text-sm mb-3">
                      <div className="text-gray-300">Delta = Buy Volume - Sell Volume</div>
                      <div className="text-blue-400 mt-1">CVD = Σ(Delta₁ + Delta₂ + ... + Deltaₙ)</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-white">1단계:</strong> 각 캔들의 매수/매도 볼륨 계산</p>
                      <p><strong className="text-white">2단계:</strong> 델타(차이) = 매수량 - 매도량</p>
                      <p><strong className="text-white">3단계:</strong> 델타를 시간순으로 누적</p>
                      <p><strong className="text-white">4단계:</strong> CVD 곡선 생성</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <h4 className="text-lg font-bold text-yellow-400 mb-3">⚡ 실시간 활용 예시</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-300">현재 가격:</span>
                        <span className="text-white font-bold">$43,250</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-300">CVD 값:</span>
                        <span className="text-green-400 font-bold">+125,430</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                        <span className="text-gray-300">델타 %:</span>
                        <span className="text-green-400 font-bold">+3.5%</span>
                      </div>
                      <div className="mt-3 p-2 bg-green-900/30 rounded border border-green-500/50">
                        <span className="text-green-400 font-bold">해석:</span>
                        <span className="text-gray-300 ml-2">강한 매수세, 상승 추세 지속 가능</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CVD 패턴 분석 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaChartBar className="text-blue-400" />
                CVD 패턴 완벽 가이드
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 상승 패턴 */}
                <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-lg border border-green-500/30">
                  <h4 className="text-lg font-bold text-green-400 mb-3">📈 상승 패턴</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">CVD 상승 + 가격 상승</p>
                      <p className="text-gray-400 text-sm">건전한 상승 트렌드</p>
                      <p className="text-green-400 text-xs mt-1">신호: 강력한 매수 지속</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">CVD 급등 + 가격 횡보</p>
                      <p className="text-gray-400 text-sm">축적 단계 (Accumulation)</p>
                      <p className="text-green-400 text-xs mt-1">신호: 곧 큰 상승 예상</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">CVD V자 반등</p>
                      <p className="text-gray-400 text-sm">강한 매수세 진입</p>
                      <p className="text-green-400 text-xs mt-1">신호: 추세 전환 시작</p>
                    </div>
                  </div>
                </div>
                
                {/* 하락 패턴 */}
                <div className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-lg border border-red-500/30">
                  <h4 className="text-lg font-bold text-red-400 mb-3">📉 하락 패턴</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">CVD 하락 + 가격 하락</p>
                      <p className="text-gray-400 text-sm">건전한 하락 트렌드</p>
                      <p className="text-red-400 text-xs mt-1">신호: 강력한 매도 지속</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">CVD 급락 + 가격 횡보</p>
                      <p className="text-gray-400 text-sm">분산 단계 (Distribution)</p>
                      <p className="text-red-400 text-xs mt-1">신호: 곧 큰 하락 예상</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">CVD 역V자 하락</p>
                      <p className="text-gray-400 text-sm">강한 매도세 진입</p>
                      <p className="text-red-400 text-xs mt-1">신호: 하락 추세 가속</p>
                    </div>
                  </div>
                </div>
                
                {/* 다이버전스 패턴 */}
                <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-lg border border-purple-500/30">
                  <h4 className="text-lg font-bold text-purple-400 mb-3">🔄 다이버전스</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">가격↑ CVD↓</p>
                      <p className="text-gray-400 text-sm">약세 다이버전스</p>
                      <p className="text-yellow-400 text-xs mt-1">경고: 상승 동력 약화</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">가격↓ CVD↑</p>
                      <p className="text-gray-400 text-sm">강세 다이버전스</p>
                      <p className="text-yellow-400 text-xs mt-1">기회: 반등 가능성</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <p className="text-white font-semibold mb-1">히든 다이버전스</p>
                      <p className="text-gray-400 text-sm">추세 지속 신호</p>
                      <p className="text-yellow-400 text-xs mt-1">확인: 추세 강화</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 실전 트레이딩 전략 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaTrophy className="text-yellow-400" />
                CVD 실전 트레이딩 전략
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 진입 전략 */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-green-400 flex items-center gap-2">
                    <HiTrendingUp />
                    진입 전략 (Entry)
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                      <h5 className="text-green-400 font-bold mb-2">🎯 롱 포지션 진입</h5>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• CVD 상승 전환 + 지지선 확인</li>
                        <li>• 델타 +2% 이상 3개 캔들 연속</li>
                        <li>• CVD-가격 강세 다이버전스 발생</li>
                        <li>• 볼륨 급증 + CVD 상승 동시 발생</li>
                        <li>• 이전 고점 CVD 레벨 돌파</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                      <h5 className="text-red-400 font-bold mb-2">🎯 숏 포지션 진입</h5>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• CVD 하락 전환 + 저항선 확인</li>
                        <li>• 델타 -2% 이상 3개 캔들 연속</li>
                        <li>• CVD-가격 약세 다이버전스 발생</li>
                        <li>• 볼륨 급증 + CVD 하락 동시 발생</li>
                        <li>• 이전 저점 CVD 레벨 붕괴</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* 청산 전략 */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    <HiTrendingDown />
                    청산 전략 (Exit)
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                      <h5 className="text-yellow-400 font-bold mb-2">⚠️ 이익 실현 타이밍</h5>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• CVD 기울기 완화 (모멘텀 약화)</li>
                        <li>• 목표가 도달 + CVD 횡보</li>
                        <li>• 극단적 델타값 출현 (±5% 초과)</li>
                        <li>• CVD-가격 다이버전스 시작</li>
                        <li>• 주요 저항/지지 CVD 레벨 도달</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                      <h5 className="text-red-400 font-bold mb-2">🛑 손절 기준</h5>
                      <ul className="space-y-1 text-sm text-gray-300">
                        <li>• CVD 반대 방향 전환 확정</li>
                        <li>• 델타 연속 3개 반대 신호</li>
                        <li>• CVD 주요 레벨 붕괴</li>
                        <li>• 예상과 반대 다이버전스 발생</li>
                        <li>• 설정 손실률 도달 (-2~3%)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 리스크 관리 */}
              <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <h4 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <FaShieldAlt />
                  리스크 관리 원칙
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">2%</div>
                    <div className="text-sm text-gray-400">거래당 최대 손실</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-green-400 mb-1">1:2</div>
                    <div className="text-sm text-gray-400">최소 손익비</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded">
                    <div className="text-2xl font-bold text-blue-400 mb-1">3회</div>
                    <div className="text-sm text-gray-400">연속 손실 시 휴식</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 고급 활용법 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaBolt className="text-yellow-400" />
                CVD 고급 활용법
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <h4 className="text-lg font-bold text-blue-400 mb-3">🔍 멀티 타임프레임 분석</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-semibold">1분봉</span>
                        <span className="text-gray-400">스캘핑 진입점</span>
                      </div>
                      <p className="text-sm text-gray-300">즉각적인 주문 흐름과 단기 모멘텀 파악</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-semibold">15분봉</span>
                        <span className="text-gray-400">데이 트레이딩</span>
                      </div>
                      <p className="text-sm text-gray-300">중기 트렌드와 주요 전환점 확인</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-semibold">4시간봉</span>
                        <span className="text-gray-400">스윙 트레이딩</span>
                      </div>
                      <p className="text-sm text-gray-300">장기 추세와 주요 축적/분산 구간</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                  <h4 className="text-lg font-bold text-purple-400 mb-3">⚡ 다른 지표와 조합</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-900/50 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-semibold">CVD + RSI</span>
                        <span className="text-green-400">추천</span>
                      </div>
                      <p className="text-sm text-gray-300">과매수/과매도 구간에서 CVD 반전 확인</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-semibold">CVD + VWAP</span>
                        <span className="text-green-400">추천</span>
                      </div>
                      <p className="text-sm text-gray-300">VWAP 기준 CVD 방향성으로 추세 강도 측정</p>
                    </div>
                    <div className="p-3 bg-gray-900/50 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-semibold">CVD + OBV</span>
                        <span className="text-yellow-400">유용</span>
                      </div>
                      <p className="text-sm text-gray-300">볼륨 확인으로 CVD 신호 검증</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 주의사항 */}
              <div className="mt-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                <h4 className="text-lg font-bold text-red-400 mb-3">⚠️ 주의사항</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>CVD만으로 거래 결정 금지 (다른 지표 병행)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>급격한 뉴스 이벤트 시 CVD 신뢰도 하락</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>낮은 유동성 구간에서 왜곡 가능성</span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>거래소별 CVD 차이 존재 (크로스 체크 필요)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>봇 거래 많은 구간에서 노이즈 증가</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      <span>항상 리스크 관리 원칙 준수</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* FAQ 섹션 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FaGraduationCap className="text-blue-400" />
                자주 묻는 질문 (FAQ)
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">Q. CVD와 일반 볼륨의 차이는?</h4>
                  <p className="text-gray-300">
                    일반 볼륨은 전체 거래량만 보여주지만, CVD는 매수와 매도를 구분하여 실제 시장 압력의 방향을 보여줍니다. 
                    예를 들어 높은 볼륨에도 CVD가 평평하다면 매수와 매도가 균형을 이루고 있다는 의미입니다.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">Q. CVD 다이버전스는 얼마나 신뢰할 수 있나요?</h4>
                  <p className="text-gray-300">
                    CVD 다이버전스는 70-80% 정도의 신뢰도를 보입니다. 특히 주요 지지/저항 레벨에서 발생하거나 
                    다른 지표(RSI, MACD)와 함께 확인될 때 신뢰도가 높아집니다. 단독 사용보다는 확인 지표로 활용하세요.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">Q. 어떤 시간대의 CVD를 봐야 하나요?</h4>
                  <p className="text-gray-300">
                    트레이딩 스타일에 따라 다릅니다. 스캘핑은 1-5분봉, 데이트레이딩은 15분-1시간봉, 
                    스윙트레이딩은 4시간-1일봉을 주로 참고합니다. 멀티 타임프레임으로 상위 추세를 확인하는 것이 중요합니다.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="text-lg font-bold text-yellow-400 mb-2">Q. CVD가 급격히 변할 때는 어떻게 대응하나요?</h4>
                  <p className="text-gray-300">
                    급격한 CVD 변화는 대량 주문이나 뉴스 이벤트를 의미합니다. 먼저 원인을 파악하고, 
                    변화 방향이 기존 포지션과 반대라면 즉시 손절을 고려하세요. 같은 방향이라면 일부 수익 실현을 검토하세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'overview':
        return (
          <>
            <DynamicGuideSection 
              tabId="overview" 
              currentCVD={currentCVD}
              currentDelta={currentDelta}
              buyPressure={buyPressure}
              sellPressure={sellPressure}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <CVDTrendChart data={cvdData} />
            </div>
            <CVDGaugeChart currentCVD={currentCVD} data={cvdData} />
            <PriceCVDComparisonChart data={cvdData} />
            <VolumeDeltaBarChart data={cvdData} />
              <BuySellPressureChart data={cvdData} />
            </div>
          </>
        )

      case 'realtime':
        return (
          <>
            <DynamicGuideSection 
              tabId="realtime" 
              currentCVD={currentCVD}
              currentDelta={currentDelta}
              buyPressure={buyPressure}
              sellPressure={sellPressure}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CVDMomentumChart data={cvdData} />
            <TradingSignalChart data={cvdData} />
            <CVDVolatilityChart data={cvdData} />
              <BuySellPowerIndex data={cvdData} />
            </div>
          </>
        )

      case 'cumulative':
        return (
          <>
            <DynamicGuideSection 
              tabId="cumulative" 
              currentCVD={currentCVD}
              currentDelta={currentDelta}
              buyPressure={buyPressure}
              sellPressure={sellPressure}
            />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="xl:col-span-2">
                <CumulativeVolumeProfile data={cvdData} />
            </div>
            <DeltaDistributionChart data={cvdData} />
              <CVDRadarChart data={cvdData} />
            </div>
          </>
        )

      case 'divergence':
        return (
          <>
            <DynamicGuideSection 
              tabId="divergence" 
              currentCVD={currentCVD}
              currentDelta={currentDelta}
              buyPressure={buyPressure}
              sellPressure={sellPressure}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CVDDivergenceScatter data={cvdData} />
            <CVDCorrelationMatrix data={cvdData} />
            <div className="lg:col-span-2">
                <PriceCVDComparisonChart data={cvdData} />
              </div>
            </div>
          </>
        )

      case 'timeframe':
        return (
          <>
            <DynamicGuideSection 
              tabId="timeframe" 
              currentCVD={currentCVD}
              currentDelta={currentDelta}
              buyPressure={buyPressure}
              sellPressure={sellPressure}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeframeCVDHeatmap data={cvdData} />
            <CVDRadarChart data={cvdData} />
            <div className="lg:col-span-2">
                <CVDTrendChart data={cvdData} />
              </div>
            </div>
          </>
        )

      case 'strategy':
        return (
          <div className="space-y-6">
            <DynamicGuideSection 
              tabId="strategy" 
              currentCVD={currentCVD}
              currentDelta={currentDelta}
              buyPressure={buyPressure}
              sellPressure={sellPressure}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TradingSignalChart data={cvdData} />
              <BuySellPowerIndex data={cvdData} />
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaTrophy className="text-yellow-400" />
                CVD 트레이딩 전략
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <h4 className="text-green-400 font-bold mb-2">매수 시그널</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• CVD 상승 추세 + 가격 상승</li>
                    <li>• 델타 {'>'}  +2% 지속</li>
                    <li>• 매수 파워 {'>'} 70%</li>
                    <li>• CVD-가격 양의 다이버전스</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                  <h4 className="text-red-400 font-bold mb-2">매도 시그널</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• CVD 하락 추세 + 가격 하락</li>
                    <li>• 델타 {'<'} -2% 지속</li>
                    <li>• 매도 파워 {'>'} 70%</li>
                    <li>• CVD-가격 음의 다이버전스</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <h4 className="text-purple-400 font-bold mb-2">위험 관리</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• CVD 변동성 모니터링</li>
                    <li>• 상관관계 {'<'} 0.3 시 주의</li>
                    <li>• 볼륨 프로파일 이탈 시 청산</li>
                    <li>• 다이버전스 발생 시 포지션 축소</li>
                  </ul>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-2 md:p-6">
      {/* 헤더 */}
      <div className="max-w-[1920px] mx-auto mb-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FaChartLine className="text-purple-400" />
                CVD (누적 볼륨 델타) 분석
              </h1>
              <p className="text-gray-400">실시간 주문 흐름과 시장 심리 분석</p>
            </div>
            
            {/* 심볼 선택기 */}
            <div className="flex items-center gap-4">
              <select 
                value={selectedSymbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 font-medium min-w-[140px]"
              >
                {TRACKED_SYMBOLS.map(coin => (
                  <option key={coin.symbol} value={coin.symbol}>
                    {coin.name} ({coin.symbol.replace('USDT', '')})
                  </option>
                ))}
              </select>
              
              {/* 연결 상태 */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                {isConnected ? '연결됨' : '연결 중...'}
              </div>
            </div>
          </div>
          
          {/* 실시간 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">현재 CVD</div>
              <div className={`text-lg font-bold ${currentCVD > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentCVD.toLocaleString('ko-KR')}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">델타</div>
              <div className={`text-lg font-bold ${currentDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentDelta.toLocaleString('ko-KR')}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">매수 압력</div>
              <div className="text-lg font-bold text-green-400">
                {buyPressure.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">매도 압력</div>
              <div className="text-lg font-bold text-red-400">
                {sellPressure.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="max-w-[1920px] mx-auto mb-6">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="ml-1 text-xs opacity-80 hidden md:inline">
                    {tab.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/50 rounded-xl p-12 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">데이터 로딩 중...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}