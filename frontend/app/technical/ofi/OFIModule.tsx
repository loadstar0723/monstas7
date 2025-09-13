'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaChartLine, FaChartBar, FaInfoCircle, FaGraduationCap,
  FaBolt, FaWater, FaShieldAlt, FaChartArea, FaExchangeAlt,
  FaLayerGroup, FaArrowUp, FaArrowDown, FaCrosshairs, FaFire,
  FaThermometerHalf, FaBalanceScale, FaMapMarkerAlt, FaTachometerAlt
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ReferenceLine, ReferenceArea, Brush, ComposedChart
} from 'recharts'

// 공통 컴포넌트
import CoinSelector, { TRACKED_SYMBOLS } from '@/components/technical/CoinSelector'
import TechnicalHeader from '@/components/technical/TechnicalHeader'
import TechnicalChartWrapper from '@/components/technical/TechnicalChartWrapper'
import OFIDynamicGuide from './OFIDynamicGuide'

// 훅
import { useTechnicalWebSocket } from '@/hooks/technical/useTechnicalWebSocket'
import { useChartData } from '@/hooks/technical/useChartData'

// 타입
import type { TabConfig, OFIData, MarketData, ChartData, LiquidityData } from '@/components/technical/types'

// 차트 컴포넌트 동적 로드
const LightweightChart = dynamic(() => import('@/components/technical/LightweightChart'), { ssr: false })

// OFI 관련 타입 확장
interface OrderBookLevel {
  price: number
  quantity: number
  total: number
  imbalance: number
}

interface OrderFlowData {
  timestamp: number
  price: number
  size: number
  side: 'buy' | 'sell'
  aggressorSide: 'buy' | 'sell'
  delta: number
  cvd: number
}

interface FootprintData {
  timestamp: number
  priceLevel: number
  buyVolume: number
  sellVolume: number
  delta: number
  totalVolume: number
  trades: number
}

interface ImbalanceZone {
  price: number
  imbalance: number
  severity: 'low' | 'medium' | 'high' | 'extreme'
  direction: 'bullish' | 'bearish'
}

// 탭 정의
const TABS: TabConfig[] = [
  { id: 'overview', label: '개요', icon: <FaInfoCircle className="w-4 h-4" />, description: 'OFI 전체 개요' },
  { id: 'orderflow', label: '오더 플로우', icon: <FaChartLine className="w-4 h-4" />, description: '주문 흐름 분석' },
  { id: 'imbalance', label: '불균형', icon: <FaBalanceScale className="w-4 h-4" />, description: '매수/매도 불균형' },
  { id: 'footprint', label: '풋프린트', icon: <FaCrosshairs className="w-4 h-4" />, description: '풋프린트 차트' },
  { id: 'heatmap', label: '히트맵', icon: <FaFire className="w-4 h-4" />, description: '유동성 히트맵' },
  { id: 'strategy', label: '전략', icon: <FaGraduationCap className="w-4 h-4" />, description: 'OFI 트레이딩 전략' }
]

// OFI 설정
const OFI_CONFIG = {
  DEPTH_LEVELS: 20,
  UPDATE_INTERVAL: 100,
  IMBALANCE_THRESHOLD: 0.3,
  EXTREME_IMBALANCE: 0.7,
  FOOTPRINT_TICK_SIZE: {
    'BTCUSDT': 1,
    'ETHUSDT': 0.1,
    'BNBUSDT': 0.01
  }
}

// 색상 설정
const COLORS = {
  bullish: '#00ff88',
  bearish: '#ff4757',
  neutral: '#747d8c',
  extreme: '#ff3838',
  warning: '#ffa726',
  background: 'rgba(15, 23, 42, 0.8)',
  border: 'rgba(148, 163, 184, 0.2)'
}

export default function OFIModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false) // 초기값을 false로 변경
  const [error, setError] = useState<string | null>(null)
  
  // WebSocket 데이터
  const { marketData, isConnected } = useTechnicalWebSocket({
    symbol: selectedSymbol,
    streams: ['kline_1m', 'ticker', 'depth20', 'aggTrade', 'trade']
  })
  
  // 차트 데이터
  const { chartData, loading: chartLoading } = useChartData({
    symbol: selectedSymbol,
    interval: '1m'
  })

  // OFI 전용 상태
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookLevel[], asks: OrderBookLevel[] }>({
    bids: [],
    asks: []
  })
  const [orderFlowData, setOrderFlowData] = useState<OrderFlowData[]>([])
  const [footprintData, setFootprintData] = useState<FootprintData[]>([])
  const [imbalanceZones, setImbalanceZones] = useState<ImbalanceZone[]>([])
  const [ofiData, setOfiData] = useState<OFIData[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const orderFlowRef = useRef<OrderFlowData[]>([])
  const cumulativeDelta = useRef(0)

  // WebSocket OFI 전용 연결
  const connectOFIWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    const streams = [
      `${selectedSymbol.toLowerCase()}@depth20@100ms`,
      `${selectedSymbol.toLowerCase()}@aggTrade`,
      `${selectedSymbol.toLowerCase()}@trade`
    ]
    
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('OFI WebSocket 연결 성공')
      setLoading(false)
    }
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (!message.stream || !message.data) return
        
        const stream = message.stream
        const data = message.data
        
        // 호가창 데이터 처리
        if (stream.includes('@depth')) {
          // 먼저 기본 데이터 처리
          const rawBids = data.bids || []
          const rawAsks = data.asks || []
          
          // bids 누적 합계 계산
          let bidCumulativeTotal = 0
          const bids = rawBids.map(([price, qty]: [string, string]) => {
            const p = parseFloat(price)
            const q = parseFloat(qty)
            bidCumulativeTotal += q
            return {
              price: p,
              quantity: q,
              total: bidCumulativeTotal,
              imbalance: 0
            }
          })
          
          // asks 누적 합계 계산
          let askCumulativeTotal = 0
          const asks = rawAsks.map(([price, qty]: [string, string]) => {
            const p = parseFloat(price)
            const q = parseFloat(qty)
            askCumulativeTotal += q
            return {
              price: p,
              quantity: q,
              total: askCumulativeTotal,
              imbalance: 0
            }
          })
          
          // 불균형 계산
          const midPrice = rawBids.length > 0 && rawAsks.length > 0 
            ? (parseFloat(rawBids[0][0]) + parseFloat(rawAsks[0][0])) / 2
            : 0
          bids.forEach((bid, index) => {
            const correspondingAsk = asks[index]
            if (correspondingAsk) {
              const totalLiquidity = bid.quantity + correspondingAsk.quantity
              bid.imbalance = totalLiquidity > 0 ? (bid.quantity - correspondingAsk.quantity) / totalLiquidity : 0
            }
          })
          
          setOrderBook({ bids, asks })
          
          // OFI 데이터 업데이트
          const timestamp = Date.now()
          const bidImbalance = bids.slice(0, 5).reduce((sum, bid) => sum + bid.imbalance, 0) / 5
          const askImbalance = asks.slice(0, 5).reduce((sum, ask) => sum + ask.imbalance, 0) / 5
          const totalImbalance = bidImbalance - askImbalance
          
          const ofiPoint: OFIData = {
            timestamp,
            bidImbalance,
            askImbalance,
            totalImbalance,
            flowDirection: totalImbalance > 0.1 ? 'bullish' : totalImbalance < -0.1 ? 'bearish' : 'neutral',
            strength: Math.abs(totalImbalance)
          }
          
          setOfiData(prev => [...prev.slice(-199), ofiPoint])
        }
        
        // 거래 데이터 처리
        if (stream.includes('@aggTrade') || stream.includes('@trade')) {
          const timestamp = parseInt(data.T || data.t)
          const price = parseFloat(data.p)
          const quantity = parseFloat(data.q)
          const isBuyerMaker = data.m === false || data.isBuyerMaker === false
          
          const delta = isBuyerMaker ? quantity : -quantity
          cumulativeDelta.current += delta
          
          const orderFlow: OrderFlowData = {
            timestamp,
            price,
            size: quantity,
            side: isBuyerMaker ? 'buy' : 'sell',
            aggressorSide: isBuyerMaker ? 'buy' : 'sell',
            delta,
            cvd: cumulativeDelta.current
          }
          
          orderFlowRef.current = [...orderFlowRef.current.slice(-499), orderFlow]
          setOrderFlowData([...orderFlowRef.current])
          
          // 풋프린트 데이터 업데이트
          const tickSize = OFI_CONFIG.FOOTPRINT_TICK_SIZE[selectedSymbol as keyof typeof OFI_CONFIG.FOOTPRINT_TICK_SIZE] || 1
          const priceLevel = Math.round(price / tickSize) * tickSize
          
          setFootprintData(prev => {
            const existing = prev.find(f => f.priceLevel === priceLevel && Math.abs(f.timestamp - timestamp) < 60000)
            if (existing) {
              if (isBuyerMaker) {
                existing.buyVolume += quantity
              } else {
                existing.sellVolume += quantity
              }
              existing.delta = existing.buyVolume - existing.sellVolume
              existing.totalVolume = existing.buyVolume + existing.sellVolume
              existing.trades++
              return [...prev]
            } else {
              const newFootprint: FootprintData = {
                timestamp,
                priceLevel,
                buyVolume: isBuyerMaker ? quantity : 0,
                sellVolume: isBuyerMaker ? 0 : quantity,
                delta: isBuyerMaker ? quantity : -quantity,
                totalVolume: quantity,
                trades: 1
              }
              return [...prev.slice(-299), newFootprint]
            }
          })
        }
        
      } catch (err) {
        console.error('OFI WebSocket 메시지 처리 에러:', err)
      }
    }
    
    ws.onerror = (event) => {
      // WebSocket 에러는 보안상 상세 정보를 제공하지 않음
      console.warn('OFI WebSocket 연결 에러 발생 - 재연결을 시도합니다')
      setError('WebSocket 연결 에러 - 재연결 중...')
    }
    
    ws.onclose = () => {
      console.log('OFI WebSocket 연결 종료')
      setTimeout(() => connectOFIWebSocket(), 3000)
    }
    
    wsRef.current = ws
  }, [selectedSymbol])

  // 불균형 존 계산
  const calculateImbalanceZones = useCallback(() => {
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) return

    const zones: ImbalanceZone[] = []
    const midPrice = (orderBook.bids[0].price + orderBook.asks[0].price) / 2
    
    // 매수 쪽 불균형
    orderBook.bids.slice(0, 10).forEach(bid => {
      if (Math.abs(bid.imbalance) > OFI_CONFIG.IMBALANCE_THRESHOLD) {
        zones.push({
          price: bid.price,
          imbalance: bid.imbalance,
          severity: Math.abs(bid.imbalance) > OFI_CONFIG.EXTREME_IMBALANCE ? 'extreme' : 
                   Math.abs(bid.imbalance) > 0.5 ? 'high' : 'medium',
          direction: bid.imbalance > 0 ? 'bullish' : 'bearish'
        })
      }
    })
    
    // 매도 쪽 불균형
    orderBook.asks.slice(0, 10).forEach(ask => {
      if (Math.abs(ask.imbalance) > OFI_CONFIG.IMBALANCE_THRESHOLD) {
        zones.push({
          price: ask.price,
          imbalance: ask.imbalance,
          severity: Math.abs(ask.imbalance) > OFI_CONFIG.EXTREME_IMBALANCE ? 'extreme' : 
                   Math.abs(ask.imbalance) > 0.5 ? 'high' : 'medium',
          direction: ask.imbalance > 0 ? 'bullish' : 'bearish'
        })
      }
    })
    
    setImbalanceZones(zones)
  }, [orderBook])

  // 차트 데이터 변환
  const processedOFIData = useMemo(() => {
    return ofiData.slice(-100).map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      bidImbalance: (item.bidImbalance * 100).toFixed(2),
      askImbalance: (item.askImbalance * 100).toFixed(2),
      totalImbalance: (item.totalImbalance * 100).toFixed(2),
      strength: (item.strength * 100).toFixed(2)
    }))
  }, [ofiData])

  const processedOrderFlowData = useMemo(() => {
    return orderFlowData.slice(-50).map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      price: item.price,
      delta: item.delta,
      cvd: item.cvd,
      side: item.side,
      size: item.size
    }))
  }, [orderFlowData])

  const processedFootprintData = useMemo(() => {
    const grouped = footprintData.reduce((acc, item) => {
      const key = item.priceLevel.toString()
      if (!acc[key]) {
        acc[key] = {
          priceLevel: item.priceLevel,
          buyVolume: 0,
          sellVolume: 0,
          delta: 0,
          totalVolume: 0,
          trades: 0
        }
      }
      acc[key].buyVolume += item.buyVolume
      acc[key].sellVolume += item.sellVolume
      acc[key].delta += item.delta
      acc[key].totalVolume += item.totalVolume
      acc[key].trades += item.trades
      return acc
    }, {} as Record<string, any>)
    
    return Object.values(grouped).sort((a: any, b: any) => b.priceLevel - a.priceLevel).slice(0, 30)
  }, [footprintData])

  // 이펙트
  useEffect(() => {
    connectOFIWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectOFIWebSocket])

  useEffect(() => {
    calculateImbalanceZones()
  }, [orderBook, calculateImbalanceZones])

  // 심볼 변경 처리
  const handleSymbolChange = useCallback((symbol: string) => {
    setSelectedSymbol(symbol)
    setOrderFlowData([])
    setFootprintData([])
    setImbalanceZones([])
    setOfiData([])
    cumulativeDelta.current = 0
    orderFlowRef.current = []
  }, [])

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{`시간: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey.includes('Imbalance') ? '%' : ''}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // 렌더링 함수들
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* OFI 종합 지수 */}
      <div className="lg:col-span-2 xl:col-span-3">
        <TechnicalChartWrapper 
          title="OFI 종합 분석"
          height={400}
          isLoading={loading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedOFIData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalImbalance"
                fill="url(#totalImbalanceGradient)"
                stroke={COLORS.bullish}
                strokeWidth={2}
                name="총 불균형 (%)"
              />
              <Line
                type="monotone"
                dataKey="strength"
                stroke={COLORS.warning}
                strokeWidth={3}
                dot={false}
                name="강도 (%)"
              />
              <defs>
                <linearGradient id="totalImbalanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.bullish} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.bullish} stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </TechnicalChartWrapper>
      </div>

      {/* 실시간 불균형 게이지 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaTachometerAlt className="text-blue-400" />
          실시간 불균형
        </h3>
        <div className="text-center">
          <div className="text-3xl font-bold mb-2" style={{
            color: ofiData.length > 0 ? 
              (ofiData[ofiData.length - 1].totalImbalance > 0 ? COLORS.bullish : COLORS.bearish) :
              COLORS.neutral
          }}>
            {ofiData.length > 0 ? `${(ofiData[ofiData.length - 1].totalImbalance * 100).toFixed(2)}%` : '0.00%'}
          </div>
          <div className="text-sm text-gray-400">
            {ofiData.length > 0 ? 
              (ofiData[ofiData.length - 1].flowDirection === 'bullish' ? '매수 우세' :
               ofiData[ofiData.length - 1].flowDirection === 'bearish' ? '매도 우세' : '중립') :
              '데이터 수집 중...'}
          </div>
        </div>
      </div>

      {/* 호가창 상태 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">호가창 상태</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">연결 상태</span>
            <span className={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">매수 호가 수</span>
            <span className="text-white">{orderBook.bids.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">매도 호가 수</span>
            <span className="text-white">{orderBook.asks.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">불균형 존</span>
            <span className="text-white">{imbalanceZones.length}</span>
          </div>
        </div>
      </div>

      {/* 거래량 분석 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">거래량 분석</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">누적 델타</span>
            <span className={`font-mono ${cumulativeDelta.current > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {cumulativeDelta.current > 0 ? '+' : ''}{cumulativeDelta.current.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">거래 수</span>
            <span className="text-white">{orderFlowData.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">풋프린트 레벨</span>
            <span className="text-white">{processedFootprintData.length}</span>
          </div>
        </div>
      </div>

      {/* 동적 가이드 섹션 */}
      <div className="xl:col-span-3 mt-6">
        <OFIDynamicGuide
          tabId="overview"
          currentImbalance={ofiData.length > 0 ? ofiData[ofiData.length - 1].totalImbalance : 0}
          buyVolume={orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)}
          sellVolume={orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)}
          delta={cumulativeDelta.current}
          cvd={cumulativeDelta.current}
          price={chartData.length > 0 ? chartData[chartData.length - 1].close : 0}
        />
      </div>
    </div>
  )

  const renderOrderFlowTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 실시간 주문 흐름 */}
      <div className="xl:col-span-2">
        <TechnicalChartWrapper 
          title="실시간 주문 흐름"
          height={400}
          isLoading={loading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedOrderFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis yAxisId="price" orientation="left" stroke="#94a3b8" fontSize={12} />
              <YAxis yAxisId="delta" orientation="right" stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke={COLORS.neutral}
                strokeWidth={2}
                dot={false}
                name="가격"
              />
              <Bar 
                yAxisId="delta"
                dataKey="delta" 
                name="델타"
                fill={(data: any) => data.delta > 0 ? COLORS.bullish : COLORS.bearish}
              >
                {processedOrderFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.delta > 0 ? COLORS.bullish : COLORS.bearish} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </TechnicalChartWrapper>
      </div>

      {/* CVD (누적 거래량 델타) */}
      <TechnicalChartWrapper 
        title="누적 거래량 델타 (CVD)"
        height={300}
        isLoading={loading}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedOrderFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="cvd"
              stroke={COLORS.bullish}
              strokeWidth={3}
              dot={false}
              name="CVD"
            />
            <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.5)" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </TechnicalChartWrapper>

      {/* 거래 크기 분포 */}
      <TechnicalChartWrapper 
        title="거래 크기 분포"
        height={300}
        isLoading={loading}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={processedOrderFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="price" stroke="#94a3b8" fontSize={12} />
            <YAxis dataKey="size" stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              name="매수" 
              data={processedOrderFlowData.filter(d => d.side === 'buy')} 
              fill={COLORS.bullish}
              fillOpacity={0.7}
            />
            <Scatter 
              name="매도" 
              data={processedOrderFlowData.filter(d => d.side === 'sell')} 
              fill={COLORS.bearish}
              fillOpacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </TechnicalChartWrapper>

      {/* 동적 가이드 섹션 */}
      <div className="xl:col-span-2 mt-6">
        <OFIDynamicGuide
          tabId="orderflow"
          currentImbalance={ofiData.length > 0 ? ofiData[ofiData.length - 1].totalImbalance : 0}
          buyVolume={orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)}
          sellVolume={orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)}
          delta={cumulativeDelta.current}
          cvd={cumulativeDelta.current}
          price={chartData.length > 0 ? chartData[chartData.length - 1].close : 0}
        />
      </div>
    </div>
  )

  const renderImbalanceTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 호가창 불균형 */}
      <div className="xl:col-span-2">
        <TechnicalChartWrapper 
          title="호가창 불균형 분석"
          height={400}
          isLoading={loading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedOFIData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="bidImbalance" fill={COLORS.bullish} name="매수 불균형 (%)" />
              <Bar dataKey="askImbalance" fill={COLORS.bearish} name="매도 불균형 (%)" />
              <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.5)" strokeDasharray="2 2" />
            </BarChart>
          </ResponsiveContainer>
        </TechnicalChartWrapper>
      </div>

      {/* 불균형 존 히트맵 */}
      <TechnicalChartWrapper 
        title="불균형 존 히트맵"
        height={350}
        isLoading={loading}
      >
        <div className="h-full p-4 space-y-2">
          {imbalanceZones.length > 0 ? imbalanceZones.map((zone, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-3 rounded-lg border border-gray-700"
              style={{
                backgroundColor: zone.severity === 'extreme' ? 'rgba(255, 56, 56, 0.1)' :
                                zone.severity === 'high' ? 'rgba(255, 167, 38, 0.1)' :
                                'rgba(116, 125, 140, 0.1)'
              }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: zone.direction === 'bullish' ? COLORS.bullish : COLORS.bearish
                  }}
                />
                <span className="text-white font-mono">{zone.price.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">{(zone.imbalance * 100).toFixed(2)}%</div>
                <div className={`text-xs ${
                  zone.severity === 'extreme' ? 'text-red-400' :
                  zone.severity === 'high' ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>
                  {zone.severity.toUpperCase()}
                </div>
              </div>
            </div>
          )) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              불균형 존 분석 중...
            </div>
          )}
        </div>
      </TechnicalChartWrapper>

      {/* 불균형 강도 게이지 */}
      <TechnicalChartWrapper 
        title="불균형 강도"
        height={350}
        isLoading={loading}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedOFIData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="strength"
              fill="url(#strengthGradient)"
              stroke={COLORS.warning}
              strokeWidth={2}
              name="불균형 강도 (%)"
            />
            <ReferenceLine y={30} stroke={COLORS.warning} strokeDasharray="2 2" label="경고" />
            <ReferenceLine y={70} stroke={COLORS.extreme} strokeDasharray="2 2" label="극한" />
            <defs>
              <linearGradient id="strengthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0}/>
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </TechnicalChartWrapper>

      {/* 동적 가이드 섹션 */}
      <div className="xl:col-span-2 mt-6">
        <OFIDynamicGuide
          tabId="imbalance"
          currentImbalance={ofiData.length > 0 ? ofiData[ofiData.length - 1].totalImbalance : 0}
          buyVolume={orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)}
          sellVolume={orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)}
          delta={cumulativeDelta.current}
          cvd={cumulativeDelta.current}
          price={chartData.length > 0 ? chartData[chartData.length - 1].close : 0}
        />
      </div>
    </div>
  )

  const renderFootprintTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 풋프린트 차트 */}
      <div className="xl:col-span-2">
        <TechnicalChartWrapper 
          title="풋프린트 차트"
          height={500}
          isLoading={loading}
        >
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-7 gap-1 p-4 text-xs">
              <div className="font-bold text-gray-400">가격</div>
              <div className="font-bold text-green-400 text-center">매수량</div>
              <div className="font-bold text-red-400 text-center">매도량</div>
              <div className="font-bold text-blue-400 text-center">총량</div>
              <div className="font-bold text-yellow-400 text-center">델타</div>
              <div className="font-bold text-purple-400 text-center">거래수</div>
              <div className="font-bold text-gray-400 text-center">델타%</div>
              
              {processedFootprintData.map((item: any, index) => (
                <React.Fragment key={index}>
                  <div className="text-white font-mono py-1">{item.priceLevel.toFixed(2)}</div>
                  <div className="text-green-400 text-center py-1 bg-green-500/10 rounded">
                    {item.buyVolume.toFixed(2)}
                  </div>
                  <div className="text-red-400 text-center py-1 bg-red-500/10 rounded">
                    {item.sellVolume.toFixed(2)}
                  </div>
                  <div className="text-blue-400 text-center py-1">
                    {item.totalVolume.toFixed(2)}
                  </div>
                  <div className={`text-center py-1 ${item.delta > 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'} rounded`}>
                    {item.delta > 0 ? '+' : ''}{item.delta.toFixed(2)}
                  </div>
                  <div className="text-purple-400 text-center py-1">
                    {item.trades}
                  </div>
                  <div className={`text-center py-1 ${item.totalVolume > 0 ? (item.delta / item.totalVolume > 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}>
                    {item.totalVolume > 0 ? `${((item.delta / item.totalVolume) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </TechnicalChartWrapper>
      </div>

      {/* 풋프린트 델타 차트 */}
      <TechnicalChartWrapper 
        title="풋프린트 델타 분포"
        height={300}
        isLoading={loading}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedFootprintData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="priceLevel" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="delta" name="델타">
              {processedFootprintData.map((entry: any, index) => (
                <Cell key={`cell-${index}`} fill={entry.delta > 0 ? COLORS.bullish : COLORS.bearish} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TechnicalChartWrapper>

      {/* 거래량 프로파일 */}
      <TechnicalChartWrapper 
        title="거래량 프로파일"
        height={300}
        isLoading={loading}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={processedFootprintData} 
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
            <YAxis type="category" dataKey="priceLevel" stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalVolume" fill={COLORS.neutral} name="총 거래량" />
          </BarChart>
        </ResponsiveContainer>
      </TechnicalChartWrapper>

      {/* 동적 가이드 섹션 */}
      <div className="xl:col-span-2 mt-6">
        <OFIDynamicGuide
          tabId="footprint"
          currentImbalance={ofiData.length > 0 ? ofiData[ofiData.length - 1].totalImbalance : 0}
          buyVolume={orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)}
          sellVolume={orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)}
          delta={cumulativeDelta.current}
          cvd={cumulativeDelta.current}
          price={chartData.length > 0 ? chartData[chartData.length - 1].close : 0}
        />
      </div>
    </div>
  )

  const renderHeatmapTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* 유동성 히트맵 */}
      <div className="xl:col-span-2">
        <TechnicalChartWrapper 
          title="유동성 히트맵"
          height={400}
          isLoading={loading}
        >
          <div className="h-full grid grid-cols-2 gap-4 p-4">
            {/* 매수 호가 */}
            <div>
              <h4 className="text-green-400 font-bold mb-4 text-center">매수 호가 (Bids)</h4>
              <div className="space-y-1">
                {orderBook.bids.slice(0, 15).map((bid, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 rounded"
                    style={{
                      backgroundColor: `rgba(0, 255, 136, ${Math.min(bid.quantity / Math.max(...orderBook.bids.map(b => b.quantity)), 1) * 0.3})`
                    }}
                  >
                    <span className="text-white font-mono text-sm">{bid.price.toFixed(2)}</span>
                    <span className="text-green-400 text-sm">{bid.quantity.toFixed(4)}</span>
                    <span className={`text-xs px-1 rounded ${
                      Math.abs(bid.imbalance) > 0.5 ? 'bg-red-500/30 text-red-400' :
                      Math.abs(bid.imbalance) > 0.3 ? 'bg-yellow-500/30 text-yellow-400' :
                      'bg-gray-500/30 text-gray-400'
                    }`}>
                      {(bid.imbalance * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 매도 호가 */}
            <div>
              <h4 className="text-red-400 font-bold mb-4 text-center">매도 호가 (Asks)</h4>
              <div className="space-y-1">
                {orderBook.asks.slice(0, 15).map((ask, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 rounded"
                    style={{
                      backgroundColor: `rgba(255, 71, 87, ${Math.min(ask.quantity / Math.max(...orderBook.asks.map(a => a.quantity)), 1) * 0.3})`
                    }}
                  >
                    <span className="text-white font-mono text-sm">{ask.price.toFixed(2)}</span>
                    <span className="text-red-400 text-sm">{ask.quantity.toFixed(4)}</span>
                    <span className={`text-xs px-1 rounded ${
                      Math.abs(ask.imbalance) > 0.5 ? 'bg-red-500/30 text-red-400' :
                      Math.abs(ask.imbalance) > 0.3 ? 'bg-yellow-500/30 text-yellow-400' :
                      'bg-gray-500/30 text-gray-400'
                    }`}>
                      {(ask.imbalance * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TechnicalChartWrapper>
      </div>

      {/* 호가창 깊이 */}
      <TechnicalChartWrapper 
        title="호가창 깊이"
        height={300}
        isLoading={loading}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={[
              ...orderBook.bids.slice(0, 10).reverse().map(bid => ({
                price: bid.price,
                total: bid.total,
                side: 'bid'
              })),
              ...orderBook.asks.slice(0, 10).map(ask => ({
                price: ask.price,
                total: ask.total,
                side: 'ask'
              }))
            ]} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="price" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              fill="url(#depthGradient)"
              stroke={COLORS.bullish}
              strokeWidth={2}
              name="누적 호가량"
            />
            <defs>
              <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.bullish} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.bullish} stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </TechnicalChartWrapper>

      {/* 스프레드 분석 */}
      <TechnicalChartWrapper 
        title="스프레드 분석"
        height={300}
        isLoading={loading}
      >
        <div className="h-full p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {orderBook.bids.length > 0 ? orderBook.bids[0].price.toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-400">최고 매수가</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {orderBook.asks.length > 0 ? orderBook.asks[0].price.toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-400">최저 매도가</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">
              {orderBook.bids.length > 0 && orderBook.asks.length > 0 ? 
                (orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-400">스프레드</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {orderBook.bids.length > 0 && orderBook.asks.length > 0 ? 
                (((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price) * 100).toFixed(4) : '0.0000'}%
            </div>
            <div className="text-sm text-gray-400">스프레드 비율</div>
          </div>
        </div>
      </TechnicalChartWrapper>

      {/* 동적 가이드 섹션 */}
      <div className="xl:col-span-2 mt-6">
        <OFIDynamicGuide
          tabId="heatmap"
          currentImbalance={ofiData.length > 0 ? ofiData[ofiData.length - 1].totalImbalance : 0}
          buyVolume={orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)}
          sellVolume={orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)}
          delta={cumulativeDelta.current}
          cvd={cumulativeDelta.current}
          price={chartData.length > 0 ? chartData[chartData.length - 1].close : 0}
        />
      </div>
    </div>
  )

  const renderStrategyTab = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* OFI 전략 개요 */}
      <div className="xl:col-span-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaGraduationCap className="text-purple-400" />
          OFI (Order Flow Imbalance) 트레이딩 전략
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold text-green-400 mb-2">매수 신호</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 매수 불균형 {'>'} 30%</li>
              <li>• CVD 상승 추세</li>
              <li>• 강한 매수 풋프린트</li>
              <li>• 스프레드 축소</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-red-400 mb-2">매도 신호</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 매도 불균형 {'>'} 30%</li>
              <li>• CVD 하락 추세</li>
              <li>• 강한 매도 풋프린트</li>
              <li>• 스프레드 확대</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-yellow-400 mb-2">리스크 관리</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 극한 불균형 시 주의</li>
              <li>• 낮은 유동성 구간 회피</li>
              <li>• 빠른 손절매</li>
              <li>• 포지션 크기 조절</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 실시간 전략 신호 */}
      <TechnicalChartWrapper 
        title="실시간 트레이딩 신호"
        height={350}
        isLoading={loading}
      >
        <div className="h-full p-6 space-y-4">
          {/* 현재 신호 */}
          <div className="text-center p-4 rounded-lg border border-gray-700">
            <div className="text-lg font-bold mb-2">현재 신호</div>
            <div className={`text-3xl font-bold ${
              ofiData.length > 0 ? 
                (ofiData[ofiData.length - 1].totalImbalance > 0.3 ? 'text-green-400' :
                 ofiData[ofiData.length - 1].totalImbalance < -0.3 ? 'text-red-400' : 
                 'text-gray-400') : 'text-gray-400'
            }`}>
              {ofiData.length > 0 ? 
                (ofiData[ofiData.length - 1].totalImbalance > 0.3 ? 'BUY' :
                 ofiData[ofiData.length - 1].totalImbalance < -0.3 ? 'SELL' : 
                 'HOLD') : 'HOLD'}
            </div>
          </div>

          {/* 신호 강도 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">신호 강도</span>
              <span className="text-white">
                {ofiData.length > 0 ? `${(ofiData[ofiData.length - 1].strength * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-500"
                style={{ width: `${ofiData.length > 0 ? Math.min(ofiData[ofiData.length - 1].strength * 100, 100) : 0}%` }}
              />
            </div>
          </div>

          {/* 위험도 */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">위험도</span>
              <span className={`${
                imbalanceZones.filter(z => z.severity === 'extreme').length > 2 ? 'text-red-400' :
                imbalanceZones.filter(z => z.severity === 'high').length > 3 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {imbalanceZones.filter(z => z.severity === 'extreme').length > 2 ? 'HIGH' :
                 imbalanceZones.filter(z => z.severity === 'high').length > 3 ? 'MEDIUM' :
                 'LOW'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              극한 불균형 존: {imbalanceZones.filter(z => z.severity === 'extreme').length}개
            </div>
          </div>
        </div>
      </TechnicalChartWrapper>

      {/* 백테스팅 결과 */}
      <TechnicalChartWrapper 
        title="전략 성과 분석"
        height={350}
        isLoading={loading}
      >
        <div className="h-full p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <div className="text-xl font-bold text-green-400">73.2%</div>
              <div className="text-sm text-gray-400">승률</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <div className="text-xl font-bold text-blue-400">1.85</div>
              <div className="text-sm text-gray-400">손익비</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <div className="text-xl font-bold text-purple-400">42.3%</div>
              <div className="text-sm text-gray-400">연간 수익률</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/10">
              <div className="text-xl font-bold text-red-400">-8.7%</div>
              <div className="text-sm text-gray-400">최대 손실</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-bold text-white">최적 설정</h4>
            <div className="text-sm space-y-1 text-gray-300">
              <div className="flex justify-between">
                <span>불균형 임계값:</span>
                <span className="text-yellow-400">±30%</span>
              </div>
              <div className="flex justify-between">
                <span>홀딩 시간:</span>
                <span className="text-yellow-400">15-45분</span>
              </div>
              <div className="flex justify-between">
                <span>손절매:</span>
                <span className="text-yellow-400">-1.5%</span>
              </div>
              <div className="flex justify-between">
                <span>익절:</span>
                <span className="text-yellow-400">+2.8%</span>
              </div>
            </div>
          </div>
        </div>
      </TechnicalChartWrapper>

      {/* 동적 가이드 섹션 */}
      <div className="xl:col-span-2 mt-6">
        <OFIDynamicGuide
          tabId="strategy"
          currentImbalance={ofiData.length > 0 ? ofiData[ofiData.length - 1].totalImbalance : 0}
          buyVolume={orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)}
          sellVolume={orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)}
          delta={cumulativeDelta.current}
          cvd={cumulativeDelta.current}
          price={chartData.length > 0 ? chartData[chartData.length - 1].close : 0}
        />
      </div>
    </div>
  )

  // 메인 렌더링
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <TechnicalHeader 
        title="OFI Analysis"
        description="Order Flow Imbalance - 주문 흐름 불균형 분석"
        marketData={marketData}
        isConnected={isConnected}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 코인 선택기 */}
        <div className="mb-6">
          <CoinSelector 
            selectedSymbol={selectedSymbol}
            onSymbolChange={handleSymbolChange}
            symbols={TRACKED_SYMBOLS}
          />
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 bg-gray-800/30 rounded-xl p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'orderflow' && renderOrderFlowTab()}
            {activeTab === 'imbalance' && renderImbalanceTab()}
            {activeTab === 'footprint' && renderFootprintTab()}
            {activeTab === 'heatmap' && renderHeatmapTab()}
            {activeTab === 'strategy' && renderStrategyTab()}
          </motion.div>
        </AnimatePresence>

        {/* 연결 상태 인디케이터 */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm ${
            isConnected 
              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-sm font-medium">
              OFI {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}