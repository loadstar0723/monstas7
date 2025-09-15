'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBolt, FaChartLine, FaClock, FaExclamationCircle } from 'react-icons/fa'
import { GiSpeedometer } from 'react-icons/gi'
import {
  LineChart, Line, ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, ReferenceArea
} from 'recharts'

interface TickData {
  timestamp: number
  price: number
  volume: number
  side: 'buy' | 'sell'
  latency: number // 레이턴시 (ms)
  microPrice: number // 마이크로 가격 (bid + ask) / 2
  spread: number
  imbalance: number
}

interface HFTSignal {
  type: 'momentum' | 'meanReversion' | 'arbitrage' | 'liquidation'
  direction: 'long' | 'short'
  confidence: number
  entryPrice: number
  targetPrice: number
  timeframe: number // 밀리초
  timestamp: number
}

interface Props {
  symbol: string
  onSignalGenerated?: (signal: HFTSignal) => void
}

export default function TickByTickAnalyzer({ symbol, onSignalGenerated }: Props) {
  const [tickData, setTickData] = useState<TickData[]>([])
  const [hftSignals, setHftSignals] = useState<HFTSignal[]>([])
  const [microstructureMetrics, setMicrostructureMetrics] = useState({
    avgSpread: 0,
    spreadVolatility: 0,
    ticksPerSecond: 0,
    avgLatency: 0,
    microPriceMovement: 0,
    effectiveSpread: 0,
    realizedVolatility: 0,
    orderFlowImbalance: 0
  })
  const [alerts, setAlerts] = useState<string[]>([])
  
  const tickBuffer = useRef<TickData[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const lastUpdateTime = useRef(Date.now())
  const tickCount = useRef(0)

  // WebSocket 연결 - 초고속 데이터 스트림
  useEffect(() => {
    // 실시간 거래 데이터
    const tradeWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`)
    // 실시간 오더북 업데이트
    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@100ms`)
    
    let currentOrderBook = { bid: 0, ask: 0, bidVol: 0, askVol: 0 }
    
    // 오더북 업데이트 처리
    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.b && data.b[0] && data.a && data.a[0]) {
        currentOrderBook = {
          bid: parseFloat(data.b[0][0]),
          ask: parseFloat(data.a[0][0]),
          bidVol: parseFloat(data.b[0][1]),
          askVol: parseFloat(data.a[0][1])
        }
      }
    }
    
    // Tick 데이터 처리
    tradeWs.onmessage = (event) => {
      const receiveTime = Date.now()
      const trade = JSON.parse(event.data)
      
      // 레이턴시 계산 (거래 시간과 수신 시간 차이)
      const latency = receiveTime - trade.T
      
      // 마이크로 가격 계산
      const microPrice = (currentOrderBook.bid + currentOrderBook.ask) / 2
      const spread = currentOrderBook.ask - currentOrderBook.bid
      const imbalance = (currentOrderBook.bidVol - currentOrderBook.askVol) / 
                        (currentOrderBook.bidVol + currentOrderBook.askVol)
      
      const tick: TickData = {
        timestamp: trade.T,
        price: parseFloat(trade.p),
        volume: parseFloat(trade.q),
        side: trade.m ? 'sell' : 'buy',
        latency,
        microPrice,
        spread,
        imbalance
      }
      
      tickBuffer.current.push(tick)
      tickCount.current++
      
      // 100 틱마다 또는 100ms마다 분석 실행
      if (tickBuffer.current.length >= 100 || receiveTime - lastUpdateTime.current > 100) {
        analyzeHFTSignals()
        updateMicrostructureMetrics()
        lastUpdateTime.current = receiveTime
      }
      
      // 버퍼 크기 제한
      if (tickBuffer.current.length > 10000) {
        tickBuffer.current = tickBuffer.current.slice(-5000)
      }
    }
    
    wsRef.current = tradeWs
    
    // TPS (Ticks Per Second) 계산
    const tpsInterval = setInterval(() => {
      setMicrostructureMetrics(prev => ({
        ...prev,
        ticksPerSecond: tickCount.current
      }))
      tickCount.current = 0
    }, 1000)
    
    return () => {
      tradeWs.close()
      depthWs.close()
      clearInterval(tpsInterval)
    }
  }, [symbol])

  // HFT 시그널 분석
  const analyzeHFTSignals = () => {
    const recentTicks = tickBuffer.current.slice(-500)
    if (recentTicks.length < 50) return
    
    // 1. 모멘텀 시그널 감지
    const momentumSignal = detectMomentumSignal(recentTicks)
    if (momentumSignal) {
      handleSignal(momentumSignal)
    }
    
    // 2. 평균 회귀 시그널
    const meanReversionSignal = detectMeanReversionSignal(recentTicks)
    if (meanReversionSignal) {
      handleSignal(meanReversionSignal)
    }
    
    // 3. 마이크로 구조 이상 감지
    const microstructureAnomaly = detectMicrostructureAnomaly(recentTicks)
    if (microstructureAnomaly) {
      handleSignal(microstructureAnomaly)
    }
    
    // 4. 청산 캐스케이드 감지
    const liquidationSignal = detectLiquidationCascade(recentTicks)
    if (liquidationSignal) {
      handleSignal(liquidationSignal)
    }
    
    // UI 업데이트용 샘플 데이터
    setTickData(recentTicks.slice(-100))
  }

  // 모멘텀 시그널 감지
  const detectMomentumSignal = (ticks: TickData[]): HFTSignal | null => {
    const windowSize = 20
    if (ticks.length < windowSize) return null
    
    const recentPrices = ticks.slice(-windowSize).map(t => t.price)
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / windowSize
    const currentPrice = recentPrices[recentPrices.length - 1]
    
    // 가격 모멘텀 계산
    const priceChange = (currentPrice - recentPrices[0]) / recentPrices[0]
    const momentum = priceChange * 10000 // 베이시스 포인트
    
    // 볼륨 가중 방향성
    let buyVolume = 0
    let sellVolume = 0
    ticks.slice(-windowSize).forEach(t => {
      if (t.side === 'buy') buyVolume += t.volume
      else sellVolume += t.volume
    })
    
    const volumeRatio = buyVolume / (buyVolume + sellVolume)
    
    // 강한 모멘텀 감지 (10 bps 이상 움직임 + 볼륨 편향)
    if (Math.abs(momentum) > 10 && 
        ((momentum > 0 && volumeRatio > 0.7) || (momentum < 0 && volumeRatio < 0.3))) {
      return {
        type: 'momentum',
        direction: momentum > 0 ? 'long' : 'short',
        confidence: Math.min(Math.abs(momentum) / 20 * 100, 95),
        entryPrice: currentPrice,
        targetPrice: currentPrice * (1 + momentum / 10000 * 0.5), // 50% 목표
        timeframe: 5000, // 5초
        timestamp: Date.now()
      }
    }
    
    return null
  }

  // 평균 회귀 시그널 감지
  const detectMeanReversionSignal = (ticks: TickData[]): HFTSignal | null => {
    if (ticks.length < 100) return null
    
    // 마이크로 가격 기준 볼린저 밴드
    const microPrices = ticks.slice(-100).map(t => t.microPrice)
    const mean = microPrices.reduce((a, b) => a + b, 0) / microPrices.length
    const variance = microPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / microPrices.length
    const stdDev = Math.sqrt(variance)
    
    const currentMicroPrice = microPrices[microPrices.length - 1]
    const zScore = (currentMicroPrice - mean) / stdDev
    
    // 극단적 이탈 감지 (2.5 표준편차 이상)
    if (Math.abs(zScore) > 2.5) {
      return {
        type: 'meanReversion',
        direction: zScore > 0 ? 'short' : 'long',
        confidence: Math.min(Math.abs(zScore) * 20, 90),
        entryPrice: ticks[ticks.length - 1].price,
        targetPrice: mean,
        timeframe: 10000, // 10초
        timestamp: Date.now()
      }
    }
    
    return null
  }

  // 마이크로구조 이상 감지
  const detectMicrostructureAnomaly = (ticks: TickData[]): HFTSignal | null => {
    const recent = ticks.slice(-50)
    if (recent.length < 50) return null
    
    // 스프레드 급증 감지
    const spreads = recent.map(t => t.spread)
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length
    const currentSpread = spreads[spreads.length - 1]
    
    // 주문 불균형 극단값
    const imbalances = recent.map(t => Math.abs(t.imbalance))
    const avgImbalance = imbalances.reduce((a, b) => a + b, 0) / imbalances.length
    const currentImbalance = recent[recent.length - 1].imbalance
    
    // 스프레드가 평균의 3배 이상이고 극단적 불균형
    if (currentSpread > avgSpread * 3 && Math.abs(currentImbalance) > 0.8) {
      return {
        type: 'arbitrage',
        direction: currentImbalance > 0 ? 'long' : 'short',
        confidence: 85,
        entryPrice: recent[recent.length - 1].price,
        targetPrice: recent[recent.length - 1].price * (1 + currentImbalance * 0.001),
        timeframe: 2000, // 2초
        timestamp: Date.now()
      }
    }
    
    return null
  }

  // 청산 캐스케이드 감지
  const detectLiquidationCascade = (ticks: TickData[]): HFTSignal | null => {
    const recent = ticks.slice(-30)
    if (recent.length < 30) return null
    
    // 급격한 가격 변동 + 대량 거래 감지
    const priceChange = (recent[recent.length - 1].price - recent[0].price) / recent[0].price
    const totalVolume = recent.reduce((sum, t) => sum + t.volume, 0)
    const avgVolume = totalVolume / recent.length
    
    // 1초 내 0.5% 이상 움직임 + 평균 거래량의 10배
    if (Math.abs(priceChange) > 0.005 && avgVolume > ticks.slice(-1000, -30).reduce((sum, t) => sum + t.volume, 0) / 970 * 10) {
      setAlerts(prev => [`🚨 청산 캐스케이드 감지! ${(priceChange * 100).toFixed(2)}% 급변동`, ...prev.slice(0, 4)])
      
      return {
        type: 'liquidation',
        direction: priceChange < 0 ? 'long' : 'short', // 반대 방향 진입
        confidence: 95,
        entryPrice: recent[recent.length - 1].price,
        targetPrice: recent[recent.length - 1].price * (1 - priceChange * 0.3), // 30% 되돌림
        timeframe: 30000, // 30초
        timestamp: Date.now()
      }
    }
    
    return null
  }

  // 시그널 처리
  const handleSignal = (signal: HFTSignal) => {
    setHftSignals(prev => [signal, ...prev.slice(0, 99)])
    
    if (onSignalGenerated) {
      onSignalGenerated(signal)
    }
    
    // 시그널 타입별 알림
    const alertMessages = {
      momentum: `📈 모멘텀 시그널: ${signal.direction.toUpperCase()} @ $${signal.entryPrice.toFixed(2)}`,
      meanReversion: `🔄 평균회귀 시그널: ${signal.direction.toUpperCase()} @ $${signal.entryPrice.toFixed(2)}`,
      arbitrage: `⚡ 차익거래 기회: ${signal.direction.toUpperCase()} @ $${signal.entryPrice.toFixed(2)}`,
      liquidation: `🚨 청산 시그널: ${signal.direction.toUpperCase()} @ $${signal.entryPrice.toFixed(2)}`
    }
    
    setAlerts(prev => [alertMessages[signal.type], ...prev.slice(0, 4)])
  }

  // 마이크로구조 메트릭 업데이트
  const updateMicrostructureMetrics = () => {
    const recent = tickBuffer.current.slice(-1000)
    if (recent.length < 100) return
    
    // 평균 스프레드
    const spreads = recent.map(t => t.spread)
    const avgSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length
    
    // 스프레드 변동성
    const spreadVariance = spreads.reduce((sum, s) => sum + Math.pow(s - avgSpread, 2), 0) / spreads.length
    const spreadVolatility = Math.sqrt(spreadVariance)
    
    // 평균 레이턴시
    const avgLatency = recent.reduce((sum, t) => sum + t.latency, 0) / recent.length
    
    // 마이크로 가격 움직임
    const microPriceChanges = []
    for (let i = 1; i < recent.length; i++) {
      microPriceChanges.push((recent[i].microPrice - recent[i-1].microPrice) / recent[i-1].microPrice)
    }
    const microPriceMovement = Math.sqrt(microPriceChanges.reduce((sum, c) => sum + c * c, 0) / microPriceChanges.length) * 10000
    
    // 실효 스프레드
    const effectiveSpread = recent.reduce((sum, t) => {
      const midPrice = t.microPrice
      const effectivePrice = t.price
      return sum + 2 * Math.abs(effectivePrice - midPrice) / midPrice
    }, 0) / recent.length * 10000 // bps
    
    // 실현 변동성 (1분)
    const oneMinuteAgo = Date.now() - 60000
    const lastMinuteTicks = recent.filter(t => t.timestamp > oneMinuteAgo)
    if (lastMinuteTicks.length > 10) {
      const returns = []
      for (let i = 1; i < lastMinuteTicks.length; i++) {
        returns.push(Math.log(lastMinuteTicks[i].price / lastMinuteTicks[i-1].price))
      }
      const realizedVolatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * Math.sqrt(252 * 24 * 60) * 100
      
      setMicrostructureMetrics(prev => ({
        ...prev,
        avgSpread,
        spreadVolatility,
        avgLatency,
        microPriceMovement,
        effectiveSpread,
        realizedVolatility,
        orderFlowImbalance: recent[recent.length - 1]?.imbalance || 0
      }))
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* 헤더 및 메트릭스 */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-6 rounded-lg border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaBolt className="text-cyan-400" />
            고빈도 거래 (HFT) 실시간 분석
          </h3>
          <div className="flex items-center gap-2">
            <GiSpeedometer className="text-yellow-400" />
            <span className="text-white font-bold">{microstructureMetrics.ticksPerSecond} TPS</span>
          </div>
        </div>

        {/* 실시간 메트릭스 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">평균 스프레드</div>
            <div className="text-xl font-bold text-cyan-400">
              {microstructureMetrics.avgSpread.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              ±{microstructureMetrics.spreadVolatility.toFixed(2)}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">레이턴시</div>
            <div className="text-xl font-bold text-yellow-400">
              {microstructureMetrics.avgLatency.toFixed(0)}ms
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">실효 스프레드</div>
            <div className="text-xl font-bold text-purple-400">
              {microstructureMetrics.effectiveSpread.toFixed(1)} bps
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">1분 변동성</div>
            <div className="text-xl font-bold text-red-400">
              {microstructureMetrics.realizedVolatility.toFixed(1)}%
            </div>
          </motion.div>
        </div>
      </div>

      {/* HFT 시그널 알림 */}
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <motion.div
            key={`${alert}-${index}`}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center gap-3"
          >
            <FaExclamationCircle className="text-cyan-400 text-xl" />
            <span className="text-white font-semibold">{alert}</span>
            <span className="text-gray-400 text-sm ml-auto">
              {new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Tick 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">Tick-by-Tick 가격 움직임</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={tickData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              domain={['dataMin', 'dataMax']}
              type="number"
              stroke="#9CA3AF"
              tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            <YAxis 
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
              stroke="#9CA3AF"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `$${value.toFixed(2)}`}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString('ko-KR', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                fractionalSecondDigits: 3 
              })}
            />
            <Scatter name="Trades" dataKey="price">
              {tickData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.side === 'buy' ? '#10B981' : '#EF4444'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 마이크로 가격 vs 실제 가격 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">마이크로 가격 분석</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={tickData}>
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
              formatter={(value: any) => `$${value.toFixed(2)}`}
            />
            <Line 
              type="monotone" 
              dataKey="microPrice" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={false}
              name="마이크로 가격"
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#F59E0B" 
              strokeWidth={1}
              dot={false}
              name="실제 거래가"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* HFT 시그널 히스토리 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-cyan-400" />
          HFT 시그널 히스토리
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">시간</th>
                <th className="text-left p-2">타입</th>
                <th className="text-left p-2">방향</th>
                <th className="text-right p-2">진입가</th>
                <th className="text-right p-2">목표가</th>
                <th className="text-right p-2">신뢰도</th>
                <th className="text-right p-2">시간대</th>
              </tr>
            </thead>
            <tbody>
              {hftSignals.slice(0, 10).map((signal, index) => (
                <motion.tr
                  key={`${signal.timestamp}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="p-2 text-gray-300">
                    {new Date(signal.timestamp).toLocaleTimeString('ko-KR', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      signal.type === 'momentum' ? 'bg-blue-500/20 text-blue-400' :
                      signal.type === 'meanReversion' ? 'bg-green-500/20 text-green-400' :
                      signal.type === 'arbitrage' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {signal.type}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`font-semibold ${
                      signal.direction === 'long' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {signal.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2 text-right text-white">
                    ${signal.entryPrice.toFixed(2)}
                  </td>
                  <td className="p-2 text-right text-white">
                    ${signal.targetPrice.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-green-500"
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">
                        {signal.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="p-2 text-right text-gray-400">
                    {signal.timeframe / 1000}s
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 마이크로구조 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-3">스프레드 분포</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={tickData.slice(-50)}>
              <defs>
                <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
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
              />
              <Area
                type="monotone"
                dataKey="spread"
                stroke="#F59E0B"
                fillOpacity={1}
                fill="url(#spreadGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-3">주문 불균형</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tickData.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9CA3AF"
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              />
              <YAxis stroke="#9CA3AF" domain={[-1, 1]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
              />
              <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="imbalance"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}