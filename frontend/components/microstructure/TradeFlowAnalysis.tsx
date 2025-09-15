'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaExchangeAlt, FaChartArea, FaTachometerAlt, FaBalanceScale } from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart, ReferenceLine
} from 'recharts'

interface TradeFlowData {
  timestamp: number
  buyVolume: number
  sellVolume: number
  netFlow: number
  toxicity: number // 주문 흐름 독성 지표
  imbalance: number // 주문 불균형
  marketImpact: number // 시장 충격
  vpin: number // Volume-synchronized Probability of Informed Trading
}

interface Props {
  symbol: string
  windowSize?: number // 분석 윈도우 크기 (초)
  onToxicityAlert?: (level: number) => void
}

export default function TradeFlowAnalysis({ 
  symbol, 
  windowSize = 300, // 5분
  onToxicityAlert 
}: Props) {
  const [flowData, setFlowData] = useState<TradeFlowData[]>([])
  const [currentMetrics, setCurrentMetrics] = useState({
    netFlow: 0,
    avgToxicity: 0,
    maxImbalance: 0,
    totalVolume: 0,
    buyRatio: 50,
    trend: 'neutral' as 'bullish' | 'bearish' | 'neutral'
  })
  const [alerts, setAlerts] = useState<string[]>([])
  
  const tradesBuffer = useRef<any[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결 및 거래 분석
  useEffect(() => {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`)
    wsRef.current = ws
    
    ws.onmessage = (event) => {
      const trade = JSON.parse(event.data)
      tradesBuffer.current.push({
        timestamp: trade.T,
        price: parseFloat(trade.p),
        quantity: parseFloat(trade.q),
        isBuyerMaker: trade.m
      })
      
      // 주기적으로 분석 실행
      if (tradesBuffer.current.length >= 100) {
        analyzeTradeFlow()
      }
    }
    
    // 정기적인 분석 실행
    const analysisInterval = setInterval(analyzeTradeFlow, 5000)
    
    return () => {
      ws.close()
      clearInterval(analysisInterval)
    }
  }, [symbol, windowSize])

  // Trade Flow 분석
  const analyzeTradeFlow = () => {
    const now = Date.now()
    const cutoffTime = now - windowSize * 1000
    
    // 윈도우 내의 거래만 필터링
    const recentTrades = tradesBuffer.current.filter(t => t.timestamp > cutoffTime)
    if (recentTrades.length === 0) return
    
    // 거래량 계산
    let buyVolume = 0
    let sellVolume = 0
    let buyValue = 0
    let sellValue = 0
    
    recentTrades.forEach(trade => {
      const value = trade.price * trade.quantity
      if (trade.isBuyerMaker) {
        sellVolume += trade.quantity
        sellValue += value
      } else {
        buyVolume += trade.quantity
        buyValue += value
      }
    })
    
    const totalVolume = buyVolume + sellVolume
    const netFlow = buyValue - sellValue
    
    // Order Flow Toxicity 계산 (Kyle and Obizhaeva 모델 기반)
    const toxicity = calculateToxicity(recentTrades)
    
    // Order Imbalance 계산
    const imbalance = totalVolume > 0 
      ? (buyVolume - sellVolume) / totalVolume 
      : 0
    
    // Market Impact 계산
    const marketImpact = calculateMarketImpact(recentTrades)
    
    // VPIN 계산
    const vpin = calculateVPIN(recentTrades)
    
    // 새로운 데이터 포인트 추가
    const newDataPoint: TradeFlowData = {
      timestamp: now,
      buyVolume,
      sellVolume,
      netFlow,
      toxicity,
      imbalance,
      marketImpact,
      vpin
    }
    
    setFlowData(prev => [...prev.slice(-100), newDataPoint])
    
    // 현재 메트릭스 업데이트
    updateCurrentMetrics(newDataPoint)
    
    // 독성 알림 체크
    if (toxicity > 0.7 && onToxicityAlert) {
      onToxicityAlert(toxicity)
      setAlerts(prev => [
        `⚠️ 높은 주문 흐름 독성 감지: ${(toxicity * 100).toFixed(1)}%`,
        ...prev.slice(0, 4)
      ])
    }
    
    // 오래된 거래 데이터 정리
    tradesBuffer.current = recentTrades.slice(-1000)
  }

  // Order Flow Toxicity 계산
  const calculateToxicity = (trades: any[]) => {
    if (trades.length < 10) return 0
    
    // 가격 변동성 계산
    const prices = trades.map(t => t.price)
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
    const volatility = Math.sqrt(variance) / avgPrice
    
    // 거래 빈도 불균형
    const timeGaps = []
    for (let i = 1; i < trades.length; i++) {
      timeGaps.push(trades[i].timestamp - trades[i-1].timestamp)
    }
    const avgGap = timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length
    const gapVariance = timeGaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / timeGaps.length
    
    // 독성 지표 = 변동성 * 시간 불균형
    const toxicity = Math.min(volatility * 10 * Math.sqrt(gapVariance) / avgGap, 1)
    
    return toxicity
  }

  // Market Impact 계산
  const calculateMarketImpact = (trades: any[]) => {
    if (trades.length < 2) return 0
    
    // 대량 거래 후 가격 변동 측정
    let totalImpact = 0
    let impactCount = 0
    
    for (let i = 0; i < trades.length - 1; i++) {
      const trade = trades[i]
      const nextTrade = trades[i + 1]
      const tradeValue = trade.price * trade.quantity
      
      // 대량 거래 감지 (평균의 5배 이상)
      const avgValue = trades.reduce((sum, t) => sum + t.price * t.quantity, 0) / trades.length
      if (tradeValue > avgValue * 5) {
        const priceChange = Math.abs(nextTrade.price - trade.price) / trade.price
        totalImpact += priceChange
        impactCount++
      }
    }
    
    return impactCount > 0 ? totalImpact / impactCount : 0
  }

  // VPIN (Volume-synchronized Probability of Informed Trading) 계산
  const calculateVPIN = (trades: any[]) => {
    if (trades.length < 50) return 0.5
    
    // Volume bucket 생성
    const totalVolume = trades.reduce((sum, t) => sum + t.quantity, 0)
    const bucketSize = totalVolume / 50 // 50개의 동일 볼륨 버킷
    
    const buckets = []
    let currentBucket = { buyVolume: 0, sellVolume: 0, volume: 0 }
    
    for (const trade of trades) {
      const remainingSpace = bucketSize - currentBucket.volume
      const volumeToAdd = Math.min(trade.quantity, remainingSpace)
      
      if (trade.isBuyerMaker) {
        currentBucket.sellVolume += volumeToAdd
      } else {
        currentBucket.buyVolume += volumeToAdd
      }
      currentBucket.volume += volumeToAdd
      
      if (currentBucket.volume >= bucketSize) {
        buckets.push(currentBucket)
        currentBucket = { buyVolume: 0, sellVolume: 0, volume: 0 }
      }
    }
    
    // VPIN 계산
    const vpinValues = buckets.map(b => 
      Math.abs(b.buyVolume - b.sellVolume) / (b.buyVolume + b.sellVolume)
    )
    
    return vpinValues.reduce((a, b) => a + b, 0) / vpinValues.length
  }

  // 현재 메트릭스 업데이트
  const updateCurrentMetrics = (data: TradeFlowData) => {
    const recentData = flowData.slice(-20)
    
    const avgToxicity = recentData.reduce((sum, d) => sum + d.toxicity, 0) / recentData.length
    const maxImbalance = Math.max(...recentData.map(d => Math.abs(d.imbalance)))
    const totalVolume = data.buyVolume + data.sellVolume
    const buyRatio = totalVolume > 0 ? (data.buyVolume / totalVolume) * 100 : 50
    
    // 트렌드 판단
    const netFlows = recentData.map(d => d.netFlow)
    const avgNetFlow = netFlows.reduce((a, b) => a + b, 0) / netFlows.length
    const trend = avgNetFlow > 1000000 ? 'bullish' : 
                  avgNetFlow < -1000000 ? 'bearish' : 'neutral'
    
    setCurrentMetrics({
      netFlow: data.netFlow,
      avgToxicity,
      maxImbalance,
      totalVolume,
      buyRatio,
      trend
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-6 rounded-lg border border-purple-500/30">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <FaExchangeAlt className="text-purple-400" />
          Trade Flow 고급 분석
        </h3>
        
        {/* 실시간 메트릭스 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">순 흐름</span>
              <span className={`text-xs ${
                currentMetrics.trend === 'bullish' ? 'text-green-400' :
                currentMetrics.trend === 'bearish' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {currentMetrics.trend.toUpperCase()}
              </span>
            </div>
            <div className={`text-xl font-bold ${
              currentMetrics.netFlow > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${(Math.abs(currentMetrics.netFlow) / 1000000).toFixed(2)}M
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">독성 지표</span>
              <FaTachometerAlt className={`text-xs ${
                currentMetrics.avgToxicity > 0.7 ? 'text-red-400' :
                currentMetrics.avgToxicity > 0.4 ? 'text-yellow-400' :
                'text-green-400'
              }`} />
            </div>
            <div className="text-xl font-bold text-white">
              {(currentMetrics.avgToxicity * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">매수 비율</span>
              <FaBalanceScale className="text-xs text-purple-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-green-500"
                  style={{ width: `${currentMetrics.buyRatio}%` }}
                />
              </div>
              <span className="text-sm text-white font-bold">
                {currentMetrics.buyRatio.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Flow Toxicity 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">주문 흐름 독성 (Order Flow Toxicity)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={flowData.slice(-50)}>
            <defs>
              <linearGradient id="toxicityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <YAxis stroke="#9CA3AF" domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <Area
              type="monotone"
              dataKey="toxicity"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#toxicityGradient)"
            />
            <ReferenceLine y={0.7} stroke="#F59E0B" strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Order Imbalance 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">주문 불균형 (Order Imbalance)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={flowData.slice(-50)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <Bar yAxisId="left" dataKey="buyVolume" fill="#10B981" opacity={0.8} />
            <Bar yAxisId="left" dataKey="sellVolume" fill="#EF4444" opacity={0.8} />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="imbalance" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* VPIN 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartArea className="text-blue-400" />
          VPIN (정보 거래 확률)
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={flowData.slice(-50)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <YAxis stroke="#9CA3AF" domain={[0, 1]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <Line
              type="monotone"
              dataKey="vpin"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine y={0.5} stroke="#6B7280" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Market Impact 분석 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">시장 충격 (Market Impact)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={flowData.slice(-20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => `${(value * 100).toFixed(3)}%`}
                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              />
              <Bar dataKey="marketImpact">
                {flowData.slice(-20).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.marketImpact > 0.001 ? '#EF4444' : '#10B981'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-700/50 rounded">
              <div className="text-sm text-gray-400 mb-1">평균 충격</div>
              <div className="text-lg font-bold text-white">
                {(flowData.slice(-20).reduce((sum, d) => sum + d.marketImpact, 0) / 20 * 100).toFixed(3)}%
              </div>
            </div>
            <div className="p-3 bg-gray-700/50 rounded">
              <div className="text-sm text-gray-400 mb-1">최대 충격</div>
              <div className="text-lg font-bold text-red-400">
                {(Math.max(...flowData.slice(-20).map(d => d.marketImpact)) * 100).toFixed(3)}%
              </div>
            </div>
            <div className="p-3 bg-gray-700/50 rounded">
              <div className="text-sm text-gray-400 mb-1">충격 빈도</div>
              <div className="text-lg font-bold text-yellow-400">
                {flowData.slice(-20).filter(d => d.marketImpact > 0.001).length}/20
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 히스토리 */}
      {alerts.length > 0 && (
        <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
          <h4 className="text-lg font-bold text-white mb-3">최근 알림</h4>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-400 flex items-center gap-2"
              >
                <span>{alert}</span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}