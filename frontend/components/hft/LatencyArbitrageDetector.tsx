'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaClock, FaExchangeAlt, FaBolt, FaServer } from 'react-icons/fa'
import { GiNetworkBars } from 'react-icons/gi'
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Area, AreaChart
} from 'recharts'

interface ExchangePrice {
  exchange: string
  price: number
  timestamp: number
  latency: number
  volume: number
}

interface ArbitrageOpportunity {
  id: string
  timestamp: number
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  spread: number
  spreadPercent: number
  profit: number
  volume: number
  executionWindow: number // 실행 가능 시간 (ms)
  confidence: number
}

interface LatencyMetrics {
  exchange: string
  avgLatency: number
  minLatency: number
  maxLatency: number
  jitter: number
  packetLoss: number
  lastUpdate: number
}

interface Props {
  symbol: string
  exchanges?: string[]
  minSpread?: number // 최소 차익 스프레드 (%)
  onArbitrageDetected?: (opportunity: ArbitrageOpportunity) => void
}

export default function LatencyArbitrageDetector({
  symbol,
  exchanges = ['binance', 'huobi', 'okx', 'bybit'],
  minSpread = 0.1,
  onArbitrageDetected
}: Props) {
  const [exchangePrices, setExchangePrices] = useState<Record<string, ExchangePrice>>({})
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [latencyMetrics, setLatencyMetrics] = useState<Record<string, LatencyMetrics>>({})
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [statistics, setStatistics] = useState({
    totalOpportunities: 0,
    successfulArbitrages: 0,
    totalProfit: 0,
    avgExecutionTime: 0,
    bestSpread: 0,
    activeExchanges: 0
  })
  
  const wsConnections = useRef<Record<string, WebSocket>>({})
  const pingIntervals = useRef<Record<string, NodeJS.Timeout>>({})

  // 거래소별 WebSocket 연결
  useEffect(() => {
    const connectExchange = (exchange: string) => {
      let wsUrl = ''
      let subscribeMsg = {}
      
      switch(exchange) {
        case 'binance':
          wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
          break
        case 'huobi':
          wsUrl = 'wss://api.huobi.pro/ws'
          subscribeMsg = {
            sub: `market.${symbol.toLowerCase()}.ticker`,
            id: Date.now().toString()
          }
          break
        case 'okx':
          wsUrl = 'wss://ws.okx.com:8443/ws/v5/public'
          subscribeMsg = {
            op: 'subscribe',
            args: [{
              channel: 'tickers',
              instId: symbol.toUpperCase()
            }]
          }
          break
        case 'bybit':
          wsUrl = 'wss://stream.bybit.com/v5/public/spot'
          subscribeMsg = {
            op: 'subscribe',
            args: [`tickers.${symbol.toUpperCase()}`]
          }
          break
      }
      
      if (!wsUrl) return
      
      const ws = new WebSocket(wsUrl)
      const startTime = Date.now()
      
      ws.onopen = () => {
        // 구독 메시지 전송
        if (Object.keys(subscribeMsg).length > 0) {
          ws.send(JSON.stringify(subscribeMsg))
        }
        
        // 레이턴시 측정을 위한 핑 설정
        pingIntervals.current[exchange] = setInterval(() => {
          const pingTime = Date.now()
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ ping: pingTime }))
          }
        }, 5000)
      }
      
      ws.onmessage = (event) => {
        const receiveTime = Date.now()
        const data = JSON.parse(event.data)
        
        // 레이턴시 계산
        const latency = receiveTime - startTime
        updateLatencyMetrics(exchange, latency)
        
        // 가격 데이터 파싱
        let price = 0
        let volume = 0
        
        switch(exchange) {
          case 'binance':
            if (data.c) {
              price = parseFloat(data.c)
              volume = parseFloat(data.v)
            }
            break
          case 'huobi':
            if (data.tick) {
              price = data.tick.close
              volume = data.tick.vol
            }
            break
          case 'okx':
            if (data.data && data.data[0]) {
              price = parseFloat(data.data[0].last)
              volume = parseFloat(data.data[0].vol24h)
            }
            break
          case 'bybit':
            if (data.data) {
              price = parseFloat(data.data.lastPrice)
              volume = parseFloat(data.data.volume24h)
            }
            break
        }
        
        if (price > 0) {
          const priceData: ExchangePrice = {
            exchange,
            price,
            timestamp: receiveTime,
            latency,
            volume
          }
          
          setExchangePrices(prev => ({
            ...prev,
            [exchange]: priceData
          }))
          
          // 차익거래 기회 검사
          checkArbitrageOpportunity(exchange, priceData)
        }
      }
      
      ws.onerror = (error) => {
        console.error(`${exchange} WebSocket error:`, error)
      }
      
      ws.onclose = () => {
        // 재연결 로직
        setTimeout(() => connectExchange(exchange), 5000)
      }
      
      wsConnections.current[exchange] = ws
    }
    
    // 모든 거래소 연결
    exchanges.forEach(connectExchange)
    
    return () => {
      // 정리 작업
      Object.values(wsConnections.current).forEach(ws => ws.close())
      Object.values(pingIntervals.current).forEach(interval => clearInterval(interval))
    }
  }, [symbol, exchanges])

  // 레이턴시 메트릭 업데이트
  const updateLatencyMetrics = (exchange: string, latency: number) => {
    setLatencyMetrics(prev => {
      const current = prev[exchange] || {
        exchange,
        avgLatency: latency,
        minLatency: latency,
        maxLatency: latency,
        jitter: 0,
        packetLoss: 0,
        lastUpdate: Date.now()
      }
      
      // 이동 평균 계산
      const newAvg = current.avgLatency * 0.9 + latency * 0.1
      const newMin = Math.min(current.minLatency, latency)
      const newMax = Math.max(current.maxLatency, latency)
      
      // Jitter 계산 (레이턴시 변동성)
      const jitter = Math.abs(latency - current.avgLatency)
      const newJitter = current.jitter * 0.9 + jitter * 0.1
      
      return {
        ...prev,
        [exchange]: {
          exchange,
          avgLatency: newAvg,
          minLatency: newMin,
          maxLatency: newMax,
          jitter: newJitter,
          packetLoss: current.packetLoss,
          lastUpdate: Date.now()
        }
      }
    })
  }

  // 차익거래 기회 검사
  const checkArbitrageOpportunity = (currentExchange: string, currentPrice: ExchangePrice) => {
    const allPrices = { ...exchangePrices, [currentExchange]: currentPrice }
    const activePrices = Object.values(allPrices).filter(p => 
      Date.now() - p.timestamp < 5000 // 5초 이내 데이터만
    )
    
    if (activePrices.length < 2) return
    
    // 모든 거래소 쌍 비교
    for (let i = 0; i < activePrices.length; i++) {
      for (let j = i + 1; j < activePrices.length; j++) {
        const buyExchange = activePrices[i].price < activePrices[j].price ? activePrices[i] : activePrices[j]
        const sellExchange = activePrices[i].price < activePrices[j].price ? activePrices[j] : activePrices[i]
        
        const spread = sellExchange.price - buyExchange.price
        const spreadPercent = (spread / buyExchange.price) * 100
        
        // 최소 스프레드 조건 확인
        if (spreadPercent >= minSpread) {
          // 실행 가능 시간 계산 (레이턴시 고려)
          const totalLatency = buyExchange.latency + sellExchange.latency
          const executionWindow = Math.max(0, 1000 - totalLatency) // 1초 내 실행 필요
          
          // 예상 수익 계산
          const tradeVolume = Math.min(buyExchange.volume, sellExchange.volume) * 0.001 // 0.1% 물량
          const profit = spread * tradeVolume
          
          // 신뢰도 계산
          const latencyReliability = Math.max(0, 1 - totalLatency / 1000)
          const spreadReliability = Math.min(1, spreadPercent / 1)
          const confidence = (latencyReliability + spreadReliability) / 2 * 100
          
          const opportunity: ArbitrageOpportunity = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            buyExchange: buyExchange.exchange,
            sellExchange: sellExchange.exchange,
            buyPrice: buyExchange.price,
            sellPrice: sellExchange.price,
            spread,
            spreadPercent,
            profit,
            volume: tradeVolume,
            executionWindow,
            confidence
          }
          
          handleArbitrageDetection(opportunity)
        }
      }
    }
    
    // 가격 히스토리 업데이트
    updatePriceHistory(allPrices)
  }

  // 차익거래 감지 처리
  const handleArbitrageDetection = (opportunity: ArbitrageOpportunity) => {
    setArbitrageOpportunities(prev => [opportunity, ...prev.slice(0, 99)])
    
    // 통계 업데이트
    setStatistics(prev => ({
      ...prev,
      totalOpportunities: prev.totalOpportunities + 1,
      totalProfit: prev.totalProfit + opportunity.profit,
      bestSpread: Math.max(prev.bestSpread, opportunity.spreadPercent)
    }))
    
    // 콜백 실행
    if (onArbitrageDetected) {
      onArbitrageDetected(opportunity)
    }
  }

  // 가격 히스토리 업데이트
  const updatePriceHistory = (prices: Record<string, ExchangePrice>) => {
    const timestamp = Date.now()
    const dataPoint = {
      timestamp,
      ...Object.entries(prices).reduce((acc, [exchange, data]) => ({
        ...acc,
        [exchange]: data.price
      }), {})
    }
    
    setPriceHistory(prev => [...prev.slice(-100), dataPoint])
  }

  // 활성 거래소 수 계산
  useEffect(() => {
    const activeCount = Object.values(exchangePrices).filter(p => 
      Date.now() - p.timestamp < 10000
    ).length
    
    setStatistics(prev => ({
      ...prev,
      activeExchanges: activeCount
    }))
  }, [exchangePrices])

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 p-6 rounded-lg border border-indigo-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaClock className="text-indigo-400" />
            레이턴시 아비트라지 감지
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GiNetworkBars className="text-green-400" />
              <span className="text-white font-bold">{statistics.activeExchanges}/{exchanges.length}</span>
              <span className="text-gray-400 text-sm">활성</span>
            </div>
          </div>
        </div>

        {/* 실시간 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">총 기회</div>
            <div className="text-xl font-bold text-indigo-400">
              {statistics.totalOpportunities}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">총 수익</div>
            <div className="text-xl font-bold text-green-400">
              ${statistics.totalProfit.toFixed(2)}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">최고 스프레드</div>
            <div className="text-xl font-bold text-yellow-400">
              {statistics.bestSpread.toFixed(3)}%
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">평균 실행시간</div>
            <div className="text-xl font-bold text-purple-400">
              {statistics.avgExecutionTime.toFixed(0)}ms
            </div>
          </motion.div>
        </div>
      </div>

      {/* 거래소별 가격 현황 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaServer className="text-blue-400" />
          거래소별 실시간 가격
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {exchanges.map(exchange => {
            const price = exchangePrices[exchange]
            const metrics = latencyMetrics[exchange]
            const isActive = price && Date.now() - price.timestamp < 5000
            
            return (
              <motion.div
                key={exchange}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border ${
                  isActive 
                    ? 'bg-gray-700/50 border-green-500/30' 
                    : 'bg-gray-800/30 border-gray-600/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white capitalize">{exchange}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                  }`} />
                </div>
                {price ? (
                  <>
                    <div className="text-2xl font-bold text-white mb-1">
                      ${price.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400">
                      레이턴시: {metrics?.avgLatency.toFixed(0) || '-'}ms
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500">연결 중...</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 레이턴시 메트릭스 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">네트워크 레이턴시 분석</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={Object.values(latencyMetrics)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="exchange" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar dataKey="avgLatency" fill="#8B5CF6" name="평균 레이턴시">
              {Object.values(latencyMetrics).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.avgLatency < 50 ? '#10B981' :
                    entry.avgLatency < 100 ? '#F59E0B' :
                    '#EF4444'
                  } 
                />
              ))}
            </Bar>
            <Bar dataKey="jitter" fill="#F59E0B" name="Jitter" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 가격 차이 히트맵 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4">거래소간 가격 차이</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory.slice(-50)}>
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
              formatter={(value: any) => `$${value?.toFixed(2) || '-'}`}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
            />
            {exchanges.map((exchange, index) => (
              <Line
                key={exchange}
                type="monotone"
                dataKey={exchange}
                stroke={['#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 4]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 차익거래 기회 목록 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaExchangeAlt className="text-green-400" />
          실시간 차익거래 기회
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">시간</th>
                <th className="text-left p-2">매수</th>
                <th className="text-left p-2">매도</th>
                <th className="text-right p-2">스프레드</th>
                <th className="text-right p-2">수익</th>
                <th className="text-right p-2">실행시간</th>
                <th className="text-right p-2">신뢰도</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {arbitrageOpportunities.slice(0, 10).map((opp) => (
                  <motion.tr
                    key={opp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <td className="p-2 text-gray-300">
                      {new Date(opp.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">{opp.buyExchange}</span>
                        <span className="text-gray-500">${opp.buyPrice.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-red-400">{opp.sellExchange}</span>
                        <span className="text-gray-500">${opp.sellPrice.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <span className={`font-bold ${
                        opp.spreadPercent > 0.5 ? 'text-green-400' :
                        opp.spreadPercent > 0.3 ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {opp.spreadPercent.toFixed(3)}%
                      </span>
                    </td>
                    <td className="p-2 text-right text-green-400 font-bold">
                      ${opp.profit.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      <span className={`${
                        opp.executionWindow > 500 ? 'text-green-400' :
                        opp.executionWindow > 200 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {opp.executionWindow}ms
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-red-500 to-green-500"
                            style={{ width: `${opp.confidence}%` }}
                          />
                        </div>
                        <span className="text-white text-xs">
                          {opp.confidence.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}