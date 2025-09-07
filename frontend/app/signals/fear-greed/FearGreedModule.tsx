'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { FaChartLine, FaExclamationTriangle, FaSmile, FaGrinStars } from 'react-icons/fa'
import { ModuleWebSocket, safeApiCall, ModulePerformance } from '@/lib/moduleUtils'
import { BINANCE_CONFIG, binanceAPI } from '@/lib/binanceConfig'

const FearGreedAnalysis = dynamic(() => import('@/components/signals/FearGreedAnalysis'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
})

interface FearGreedData {
  value: number
  classification: string
  timestamp: Date
  btcPrice: number
  volume24h: number
}

export default function FearGreedModule() {
  const [fearGreedIndex, setFearGreedIndex] = useState<number>(50)
  const [classification, setClassification] = useState<string>('Neutral')
  const [historicalData, setHistoricalData] = useState<FearGreedData[]>([])
  const [btcPrice, setBtcPrice] = useState<number>(0)
  const [volume24h, setVolume24h] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  
  const wsRef = useRef<ModuleWebSocket | null>(null)
  const performance = useRef(new ModulePerformance('FearGreed'))
  
  // Fear & Greed 계산 (Binance 데이터 기반)
  const calculateFearGreed = (price: number, volume: number, volatility: number): number => {
    // 간단한 Fear & Greed 계산 로직
    // 실제로는 더 복잡한 알고리즘 사용
    let index = 50
    
    // 가격 모멘텀 (25%)
    const priceChange = ((price - 100000) / 100000) * 100
    const priceFactor = Math.min(Math.max((priceChange + 50) / 2, 0), 25)
    
    // 거래량 (25%)
    const volumeFactor = Math.min((volume / 50000000000) * 25, 25)
    
    // 변동성 (25%)
    const volatilityFactor = Math.max(25 - (volatility * 2.5), 0)
    
    // 시장 지배력 (25%)
    const dominanceFactor = 15 // BTC 도미넌스 기본값
    
    index = priceFactor + volumeFactor + volatilityFactor + dominanceFactor
    
    return Math.min(Math.max(Math.round(index), 0), 100)
  }
  
  const getClassification = (value: number): string => {
    if (value <= 20) return 'Extreme Fear'
    if (value <= 40) return 'Fear'
    if (value <= 60) return 'Neutral'
    if (value <= 80) return 'Greed'
    return 'Extreme Greed'
  }
  
  const getColor = (value: number): string => {
    if (value <= 20) return '#ef4444' // red
    if (value <= 40) return '#f97316' // orange
    if (value <= 60) return '#eab308' // yellow
    if (value <= 80) return '#84cc16' // lime
    return '#22c55e' // green
  }
  
  useEffect(() => {
    const initModule = async () => {
      const measureInit = performance.current.startMeasure('initialization')
      
      try {
        setLoading(true)
        
        // BTC 24시간 통계 가져오기
        const { data: ticker, error } = await safeApiCall(
          () => binanceAPI.get24hrTicker('BTCUSDT'),
          null,
          'FearGreed'
        )
        
        if (ticker) {
          const price = parseFloat(ticker.lastPrice)
          const volume = parseFloat(ticker.volume) * price
          const volatility = Math.abs(parseFloat(ticker.priceChangePercent))
          
          setBtcPrice(price)
          setVolume24h(volume)
          
          // Fear & Greed 계산
          const index = calculateFearGreed(price, volume, volatility)
          setFearGreedIndex(index)
          setClassification(getClassification(index))
          
          // 초기 히스토리 데이터
          setHistoricalData([{
            value: index,
            classification: getClassification(index),
            timestamp: new Date(),
            btcPrice: price,
            volume24h: volume
          }])
        }
        
        // WebSocket 연결 (BTC 실시간 가격)
        wsRef.current = new ModuleWebSocket('FearGreed')
        const wsUrl = `${BINANCE_CONFIG.WS_BASE}/btcusdt@ticker`
        
        wsRef.current.connect(wsUrl, (data) => {
          const measureWs = performance.current.startMeasure('websocket_message')
          
          const price = parseFloat(data.c) // close price
          const volume = parseFloat(data.v) * price // volume in USD
          const volatility = Math.abs(parseFloat(data.P)) // price change percent
          
          setBtcPrice(price)
          setVolume24h(volume)
          
          // 실시간 Fear & Greed 업데이트
          const newIndex = calculateFearGreed(price, volume, volatility)
          setFearGreedIndex(newIndex)
          setClassification(getClassification(newIndex))
          
          // 히스토리 업데이트
          setHistoricalData(prev => {
            const newData = {
              value: newIndex,
              classification: getClassification(newIndex),
              timestamp: new Date(),
              btcPrice: price,
              volume24h: volume
            }
            return [...prev, newData].slice(-50) // 최근 50개만 유지
          })
          
          measureWs()
        })
        
        setLoading(false)
      } catch (err) {
        console.error('[FearGreed] Initialization error:', err)
        setLoading(false)
      } finally {
        measureInit()
      }
    }
    
    initModule()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Fear & Greed Index 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      {/* AI 공포탐욕 전문 분석 */}
      <FearGreedAnalysis />
      
      {/* 메인 게이지 */}
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">공포 & 탐욕 지수</h2>
          
          {/* 원형 게이지 */}
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#374151"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke={getColor(fearGreedIndex)}
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${(fearGreedIndex / 100) * 754} 754`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold" style={{ color: getColor(fearGreedIndex) }}>
                {fearGreedIndex}
              </div>
              <div className="text-xl font-medium text-gray-300 mt-2">
                {classification}
              </div>
            </div>
          </div>
          
          {/* 스케일 바 */}
          <div className="w-full max-w-md mx-auto">
            <div className="h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full relative">
              <div 
                className="absolute w-4 h-12 bg-white rounded-full shadow-lg -top-2"
                style={{ left: `${fearGreedIndex}%`, transform: 'translateX(-50%)' }}
              >
                <div className="w-2 h-2 bg-gray-800 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Extreme Fear</span>
              <span>Fear</span>
              <span>Neutral</span>
              <span>Greed</span>
              <span>Extreme Greed</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 시장 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaChartLine className="text-blue-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">BTC 가격</p>
          <p className="text-2xl font-bold text-white">
            ${btcPrice.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <FaExclamationTriangle className="text-yellow-400 text-2xl mb-3" />
          <p className="text-gray-400 text-sm mb-1">24시간 거래량</p>
          <p className="text-2xl font-bold text-white">
            ${(volume24h / 1000000000).toFixed(2)}B
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          {fearGreedIndex > 60 ? (
            <FaGrinStars className="text-green-400 text-2xl mb-3" />
          ) : fearGreedIndex < 40 ? (
            <FaExclamationTriangle className="text-red-400 text-2xl mb-3" />
          ) : (
            <FaSmile className="text-yellow-400 text-2xl mb-3" />
          )}
          <p className="text-gray-400 text-sm mb-1">시장 신호</p>
          <p className="text-2xl font-bold" style={{ color: getColor(fearGreedIndex) }}>
            {fearGreedIndex > 80 ? '매도 고려' :
             fearGreedIndex > 60 ? '주의 필요' :
             fearGreedIndex < 20 ? '매수 기회' :
             fearGreedIndex < 40 ? '관망' : '중립'}
          </p>
        </motion.div>
      </div>
      
      {/* 해석 */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-blue-400">현재 시장 해석</h3>
        <p className="text-gray-300">
          {fearGreedIndex <= 20 && "시장이 극도의 공포 상태입니다. 역사적으로 이런 시기는 장기 투자자에게 좋은 매수 기회가 되었습니다."}
          {fearGreedIndex > 20 && fearGreedIndex <= 40 && "시장에 공포가 만연해 있습니다. 신중한 매수 전략을 고려해볼 시점입니다."}
          {fearGreedIndex > 40 && fearGreedIndex <= 60 && "시장이 중립 상태입니다. 명확한 방향성이 나타날 때까지 관망하는 것이 좋습니다."}
          {fearGreedIndex > 60 && fearGreedIndex <= 80 && "시장에 탐욕이 나타나고 있습니다. 포지션 조정과 리스크 관리가 필요합니다."}
          {fearGreedIndex > 80 && "시장이 극도의 탐욕 상태입니다. 역사적으로 이런 시기는 조정이 임박했음을 시사합니다."}
        </p>
      </div>
    </div>
  )
}