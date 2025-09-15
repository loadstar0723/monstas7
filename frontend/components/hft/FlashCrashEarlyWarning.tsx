'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaExclamationTriangle, FaBolt, FaChartLine, FaShieldAlt } from 'react-icons/fa'
import { GiSiren, GiFallingBomb } from 'react-icons/gi'
import {
  LineChart, Line, AreaChart, Area, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Cell
} from 'recharts'

interface MarketCondition {
  timestamp: number
  price: number
  volume: number
  volatility: number
  orderBookImbalance: number
  liquidationVolume: number
  tradeVelocity: number // 거래 속도
  priceVelocity: number // 가격 변화 속도
  marketDepth: number // 시장 깊이
}

interface CrashIndicator {
  type: 'volatility' | 'liquidity' | 'cascade' | 'momentum' | 'correlation'
  severity: number // 0-100
  description: string
  threshold: number
  current: number
}

interface WarningSignal {
  id: string
  timestamp: number
  level: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  indicators: CrashIndicator[]
  probability: number // 크래시 확률
  estimatedImpact: number // 예상 하락폭 (%)
  timeToImpact: number // 예상 시간 (초)
}

interface CircuitBreaker {
  level: number
  threshold: number
  activated: boolean
  cooldown: number
}

interface Props {
  symbol: string
  onWarningTriggered?: (signal: WarningSignal) => void
  onCircuitBreakerActivated?: (level: number) => void
}

export default function FlashCrashEarlyWarning({
  symbol,
  onWarningTriggered,
  onCircuitBreakerActivated
}: Props) {
  const [marketConditions, setMarketConditions] = useState<MarketCondition[]>([])
  const [warningSignals, setWarningSignals] = useState<WarningSignal[]>([])
  const [indicators, setIndicators] = useState<CrashIndicator[]>([])
  const [crashProbability, setCrashProbability] = useState(0)
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'alert' | 'critical'>('normal')
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>([
    { level: 1, threshold: 5, activated: false, cooldown: 0 },
    { level: 2, threshold: 10, activated: false, cooldown: 0 },
    { level: 3, threshold: 20, activated: false, cooldown: 0 }
  ])
  
  const wsRef = useRef<WebSocket | null>(null)
  const analysisInterval = useRef<NodeJS.Timeout | null>(null)
  const marketDataBuffer = useRef<any[]>([])

  // WebSocket 연결 및 데이터 수집
  useEffect(() => {
    // 실시간 거래 데이터
    const tradeWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`)
    // 오더북 데이터
    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`)
    // 청산 데이터
    const liquidationWs = new WebSocket(`wss://fstream.binance.com/ws/${symbol.toLowerCase()}@forceOrder`)
    
    let orderBook = { bids: [], asks: [] }
    let recentTrades = []
    let liquidations = []
    
    // 오더북 업데이트
    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.b && data.a) {
        orderBook = {
          bids: data.b.map((b: string[]) => ({ 
            price: parseFloat(b[0]), 
            amount: parseFloat(b[1]) 
          })),
          asks: data.a.map((a: string[]) => ({ 
            price: parseFloat(a[0]), 
            amount: parseFloat(a[1]) 
          }))
        }
      }
    }
    
    // 거래 데이터 처리
    tradeWs.onmessage = (event) => {
      const trade = JSON.parse(event.data)
      recentTrades.push({
        timestamp: trade.T,
        price: parseFloat(trade.p),
        quantity: parseFloat(trade.q),
        isBuyerMaker: trade.m
      })
      
      // 최근 1000개만 유지
      if (recentTrades.length > 1000) {
        recentTrades = recentTrades.slice(-1000)
      }
      
      marketDataBuffer.current = recentTrades
    }
    
    // 청산 데이터 처리
    liquidationWs.onmessage = (event) => {
      const liquidation = JSON.parse(event.data)
      liquidations.push({
        timestamp: Date.now(),
        side: liquidation.o.S,
        price: parseFloat(liquidation.o.p),
        quantity: parseFloat(liquidation.o.q),
        total: parseFloat(liquidation.o.p) * parseFloat(liquidation.o.q)
      })
      
      // 최근 100개만 유지
      if (liquidations.length > 100) {
        liquidations = liquidations.slice(-100)
      }
    }
    
    // 정기적인 시장 상태 분석
    analysisInterval.current = setInterval(() => {
      analyzeMarketConditions(recentTrades, orderBook, liquidations)
    }, 1000) // 1초마다 분석
    
    wsRef.current = tradeWs
    
    return () => {
      tradeWs.close()
      depthWs.close()
      liquidationWs.close()
      if (analysisInterval.current) {
        clearInterval(analysisInterval.current)
      }
    }
  }, [symbol])

  // 시장 상태 분석
  const analyzeMarketConditions = (trades: any[], orderBook: any, liquidations: any[]) => {
    if (trades.length < 100) return
    
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentTrades = trades.filter(t => t.timestamp > oneMinuteAgo)
    
    if (recentTrades.length === 0) return
    
    // 현재 가격 및 기본 메트릭
    const currentPrice = recentTrades[recentTrades.length - 1].price
    const prices = recentTrades.map(t => t.price)
    const volumes = recentTrades.map(t => t.quantity)
    
    // 변동성 계산
    const volatility = calculateVolatility(prices)
    
    // 거래량 분석
    const totalVolume = volumes.reduce((a, b) => a + b, 0)
    const avgVolume = totalVolume / recentTrades.length
    
    // 오더북 불균형
    const bidVolume = orderBook.bids.reduce((sum: number, b: any) => sum + b.amount, 0)
    const askVolume = orderBook.asks.reduce((sum: number, a: any) => sum + a.amount, 0)
    const orderBookImbalance = bidVolume > 0 ? (bidVolume - askVolume) / (bidVolume + askVolume) : 0
    
    // 청산량
    const recentLiquidations = liquidations.filter((l: any) => now - l.timestamp < 60000)
    const liquidationVolume = recentLiquidations.reduce((sum: number, l: any) => sum + l.total, 0)
    
    // 거래 속도 (trades per second)
    const tradeVelocity = recentTrades.length / 60
    
    // 가격 변화 속도
    const priceChange = currentPrice - prices[0]
    const priceVelocity = (priceChange / prices[0]) * 100
    
    // 시장 깊이
    const marketDepth = calculateMarketDepth(orderBook)
    
    // 새로운 시장 상태 추가
    const condition: MarketCondition = {
      timestamp: now,
      price: currentPrice,
      volume: totalVolume,
      volatility,
      orderBookImbalance,
      liquidationVolume,
      tradeVelocity,
      priceVelocity,
      marketDepth
    }
    
    setMarketConditions(prev => [...prev.slice(-300), condition])
    
    // 크래시 지표 분석
    analyzeFlashCrashIndicators(condition, recentTrades, orderBook, liquidations)
  }

  // 변동성 계산
  const calculateVolatility = (prices: number[]): number => {
    if (prices.length < 2) return 0
    
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i-1]))
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    
    return Math.sqrt(variance) * Math.sqrt(252 * 24 * 60 * 60) * 100 // 연간화 변동성
  }

  // 시장 깊이 계산
  const calculateMarketDepth = (orderBook: any): number => {
    const bidDepth = orderBook.bids.slice(0, 10).reduce((sum: number, b: any) => sum + b.amount * b.price, 0)
    const askDepth = orderBook.asks.slice(0, 10).reduce((sum: number, a: any) => sum + a.amount * a.price, 0)
    return bidDepth + askDepth
  }

  // 플래시 크래시 지표 분석
  const analyzeFlashCrashIndicators = (
    condition: MarketCondition, 
    trades: any[], 
    orderBook: any, 
    liquidations: any[]
  ) => {
    const indicators: CrashIndicator[] = []
    
    // 1. 변동성 스파이크
    const volatilityIndicator: CrashIndicator = {
      type: 'volatility',
      severity: Math.min(condition.volatility / 100 * 100, 100),
      description: '극단적 변동성',
      threshold: 50,
      current: condition.volatility
    }
    indicators.push(volatilityIndicator)
    
    // 2. 유동성 고갈
    const liquidityScore = condition.marketDepth / (trades.length * 1000) // 정규화
    const liquidityIndicator: CrashIndicator = {
      type: 'liquidity',
      severity: Math.max(0, 100 - liquidityScore * 100),
      description: '유동성 부족',
      threshold: 70,
      current: 100 - liquidityScore * 100
    }
    indicators.push(liquidityIndicator)
    
    // 3. 청산 캐스케이드
    const cascadeIndicator: CrashIndicator = {
      type: 'cascade',
      severity: Math.min(condition.liquidationVolume / 1000000 * 100, 100),
      description: '대량 청산',
      threshold: 60,
      current: condition.liquidationVolume / 1000000 * 100
    }
    indicators.push(cascadeIndicator)
    
    // 4. 모멘텀 붕괴
    const momentumIndicator: CrashIndicator = {
      type: 'momentum',
      severity: Math.abs(condition.priceVelocity) > 5 ? Math.abs(condition.priceVelocity) * 10 : 0,
      description: '급격한 가격 하락',
      threshold: 50,
      current: Math.abs(condition.priceVelocity) * 10
    }
    indicators.push(momentumIndicator)
    
    // 5. 상관관계 붕괴 (오더북 불균형)
    const correlationIndicator: CrashIndicator = {
      type: 'correlation',
      severity: Math.abs(condition.orderBookImbalance) * 100,
      description: '오더북 불균형',
      threshold: 80,
      current: Math.abs(condition.orderBookImbalance) * 100
    }
    indicators.push(correlationIndicator)
    
    setIndicators(indicators)
    
    // 종합 크래시 확률 계산
    const crashProb = calculateCrashProbability(indicators)
    setCrashProbability(crashProb)
    
    // 경고 신호 생성
    checkWarningConditions(indicators, crashProb, condition)
    
    // 서킷 브레이커 체크
    checkCircuitBreakers(condition)
  }

  // 크래시 확률 계산
  const calculateCrashProbability = (indicators: CrashIndicator[]): number => {
    // 가중 평균 계산
    const weights = {
      volatility: 0.25,
      liquidity: 0.2,
      cascade: 0.3,
      momentum: 0.15,
      correlation: 0.1
    }
    
    let weightedSum = 0
    let totalWeight = 0
    
    indicators.forEach(indicator => {
      const weight = weights[indicator.type] || 0.1
      if (indicator.current > indicator.threshold) {
        weightedSum += indicator.severity * weight
        totalWeight += weight
      }
    })
    
    return totalWeight > 0 ? Math.min(weightedSum / totalWeight, 100) : 0
  }

  // 경고 조건 확인
  const checkWarningConditions = (
    indicators: CrashIndicator[], 
    probability: number, 
    condition: MarketCondition
  ) => {
    let level: WarningSignal['level'] = 'low'
    let shouldWarn = false
    
    // 심각도 결정
    if (probability > 80) {
      level = 'critical'
      shouldWarn = true
    } else if (probability > 60) {
      level = 'high'
      shouldWarn = true
    } else if (probability > 40) {
      level = 'medium'
      shouldWarn = true
    } else if (probability > 20) {
      level = 'low'
      shouldWarn = true
    }
    
    if (shouldWarn) {
      const criticalIndicators = indicators.filter(i => i.current > i.threshold)
      
      const signal: WarningSignal = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        level,
        type: criticalIndicators[0]?.type || 'general',
        message: generateWarningMessage(level, criticalIndicators),
        indicators: criticalIndicators,
        probability,
        estimatedImpact: estimateImpact(condition, indicators),
        timeToImpact: estimateTimeToImpact(condition, probability)
      }
      
      setWarningSignals(prev => [signal, ...prev.slice(0, 49)])
      
      // 시스템 상태 업데이트
      updateSystemStatus(level)
      
      // 콜백 실행
      if (onWarningTriggered) {
        onWarningTriggered(signal)
      }
    }
  }

  // 경고 메시지 생성
  const generateWarningMessage = (level: string, indicators: CrashIndicator[]): string => {
    const messages = {
      critical: '🚨 극도의 위험! 즉시 포지션 정리 권장',
      high: '⚠️ 높은 크래시 위험 감지',
      medium: '⚡ 시장 불안정성 증가',
      low: '📊 주의 필요한 시장 상황'
    }
    
    const indicatorMessages = indicators.map(i => {
      switch(i.type) {
        case 'volatility': return '극단적 변동성'
        case 'liquidity': return '유동성 고갈'
        case 'cascade': return '청산 캐스케이드'
        case 'momentum': return '급격한 하락 모멘텀'
        case 'correlation': return '시장 구조 붕괴'
        default: return '이상 신호'
      }
    }).join(', ')
    
    return `${messages[level]} - ${indicatorMessages}`
  }

  // 예상 영향 계산
  const estimateImpact = (condition: MarketCondition, indicators: CrashIndicator[]): number => {
    // 과거 데이터 기반 예측 (단순화)
    const volatilityImpact = condition.volatility * 0.5
    const liquidityImpact = indicators.find(i => i.type === 'liquidity')?.severity || 0
    const cascadeImpact = indicators.find(i => i.type === 'cascade')?.severity || 0
    
    return Math.min((volatilityImpact + liquidityImpact * 0.3 + cascadeImpact * 0.4) / 100 * 30, 50)
  }

  // 예상 시간 계산
  const estimateTimeToImpact = (condition: MarketCondition, probability: number): number => {
    // 가격 변화 속도와 확률 기반
    const velocity = Math.abs(condition.priceVelocity)
    if (velocity > 10) return 10 // 10초
    if (velocity > 5) return 30 // 30초
    if (velocity > 2) return 60 // 1분
    return 300 // 5분
  }

  // 시스템 상태 업데이트
  const updateSystemStatus = (level: WarningSignal['level']) => {
    const statusMap = {
      critical: 'critical',
      high: 'alert',
      medium: 'warning',
      low: 'normal'
    }
    setSystemStatus(statusMap[level] as any)
  }

  // 서킷 브레이커 체크
  const checkCircuitBreakers = (condition: MarketCondition) => {
    const priceDropPercent = Math.abs(condition.priceVelocity)
    
    setCircuitBreakers(prev => {
      const updated = [...prev]
      let activated = false
      
      updated.forEach((breaker, index) => {
        if (priceDropPercent >= breaker.threshold && !breaker.activated && breaker.cooldown === 0) {
          updated[index] = {
            ...breaker,
            activated: true,
            cooldown: 300 // 5분 쿨다운
          }
          activated = true
          
          if (onCircuitBreakerActivated) {
            onCircuitBreakerActivated(breaker.level)
          }
        }
        
        // 쿨다운 감소
        if (breaker.cooldown > 0) {
          updated[index] = {
            ...breaker,
            cooldown: breaker.cooldown - 1
          }
        }
        
        // 쿨다운 종료 시 리셋
        if (breaker.cooldown === 0 && breaker.activated) {
          updated[index] = {
            ...breaker,
            activated: false
          }
        }
      })
      
      return updated
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* 시스템 상태 헤더 */}
      <motion.div 
        className={`p-6 rounded-lg border-2 transition-all duration-300 ${
          systemStatus === 'critical' ? 'bg-red-900/30 border-red-500 animate-pulse' :
          systemStatus === 'alert' ? 'bg-orange-900/30 border-orange-500' :
          systemStatus === 'warning' ? 'bg-yellow-900/30 border-yellow-500' :
          'bg-green-900/30 border-green-500'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <GiSiren className={`${
              systemStatus === 'critical' ? 'text-red-500 animate-bounce' :
              systemStatus === 'alert' ? 'text-orange-500' :
              systemStatus === 'warning' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
            플래시 크래시 조기 경보 시스템
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">크래시 확률</div>
              <div className={`text-3xl font-bold ${
                crashProbability > 80 ? 'text-red-500' :
                crashProbability > 60 ? 'text-orange-500' :
                crashProbability > 40 ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {crashProbability.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* 서킷 브레이커 상태 */}
        <div className="grid grid-cols-3 gap-4">
          {circuitBreakers.map((breaker, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className={`p-3 rounded-lg text-center ${
                breaker.activated 
                  ? 'bg-red-500/20 border border-red-500' 
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <FaShieldAlt className={breaker.activated ? 'text-red-500' : 'text-gray-500'} />
                <span className="text-sm text-gray-400">레벨 {breaker.level}</span>
              </div>
              <div className="text-lg font-bold text-white">
                {breaker.threshold}%
              </div>
              {breaker.activated && (
                <div className="text-xs text-red-400 mt-1">
                  쿨다운: {breaker.cooldown}s
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 실시간 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {indicators.map((indicator, index) => {
          const isWarning = indicator.current > indicator.threshold
          return (
            <motion.div
              key={indicator.type}
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg border ${
                isWarning 
                  ? 'bg-red-900/20 border-red-500/50' 
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="text-sm text-gray-400 mb-1">{indicator.description}</div>
              <div className={`text-2xl font-bold ${
                isWarning ? 'text-red-400' : 'text-white'
              }`}>
                {indicator.current.toFixed(1)}
              </div>
              <div className="mt-2">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isWarning ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(indicator.severity, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  임계값: {indicator.threshold}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 시장 상태 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">시장 상태 모니터링</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={marketConditions.slice(-60)}>
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
            
            {/* 위험 구간 표시 */}
            {marketConditions.filter(c => c.volatility > 50).map((condition, index) => (
              <ReferenceArea
                key={index}
                yAxisId="left"
                x1={condition.timestamp}
                x2={condition.timestamp + 1000}
                fill="#EF4444"
                fillOpacity={0.1}
              />
            ))}
            
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="volatility" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={false}
              name="변동성"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="priceVelocity" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={false}
              name="가격 속도"
            />
            <Bar
              yAxisId="left"
              dataKey="liquidationVolume"
              fill="#8B5CF6"
              opacity={0.7}
              name="청산량"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 경고 신호 히스토리 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-400" />
          경고 신호 히스토리
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {warningSignals.map((signal) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  signal.level === 'critical' ? 'bg-red-900/30 border-red-500' :
                  signal.level === 'high' ? 'bg-orange-900/30 border-orange-500' :
                  signal.level === 'medium' ? 'bg-yellow-900/30 border-yellow-500' :
                  'bg-blue-900/30 border-blue-500'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <GiFallingBomb className={`${
                      signal.level === 'critical' ? 'text-red-500' :
                      signal.level === 'high' ? 'text-orange-500' :
                      signal.level === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <span className="text-white font-semibold">{signal.message}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(signal.timestamp).toLocaleTimeString()} | 
                    확률: {signal.probability.toFixed(1)}% | 
                    예상 하락: -{signal.estimatedImpact.toFixed(1)}% | 
                    {signal.timeToImpact}초 후
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 시장 깊이 분석 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">시장 깊이 & 유동성</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={marketConditions.slice(-60)}>
            <defs>
              <linearGradient id="depthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
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
              formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <Area
              type="monotone"
              dataKey="marketDepth"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#depthGradient)"
            />
            <ReferenceLine 
              y={marketConditions.length > 0 
                ? marketConditions.reduce((sum, c) => sum + c.marketDepth, 0) / marketConditions.length
                : 0
              }
              stroke="#6B7280"
              strokeDasharray="5 5"
              label="평균"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}