'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhale, FaExclamationTriangle, FaBell, FaChartLine } from 'react-icons/fa'
import { GiWhale } from 'react-icons/gi'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Area, AreaChart
} from 'recharts'

interface WhaleOrder {
  id: string
  timestamp: number
  side: 'buy' | 'sell'
  price: number
  amount: number
  total: number
  impact: number // 예상 가격 영향
  type: 'market' | 'limit' | 'iceberg'
}

interface Props {
  symbol: string
  threshold?: number // 고래 주문 기준 금액 (USD)
  onWhaleDetected?: (order: WhaleOrder) => void
}

export default function WhaleOrderDetector({ 
  symbol, 
  threshold = 100000,
  onWhaleDetected 
}: Props) {
  const [whaleOrders, setWhaleOrders] = useState<WhaleOrder[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalWhales24h: 0,
    buyPressure: 0,
    sellPressure: 0,
    largestOrder: 0,
    netFlow: 0
  })
  const [alerts, setAlerts] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결 및 고래 감지
  useEffect(() => {
    // 거래 데이터 스트림
    const tradeWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
    const depthWs = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`)
    
    let orderBook = { bids: [], asks: [] }
    
    // 오더북 업데이트
    depthWs.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.b && data.a) {
        orderBook = {
          bids: data.b.map((b: string[]) => ({ price: parseFloat(b[0]), amount: parseFloat(b[1]) })),
          asks: data.a.map((a: string[]) => ({ price: parseFloat(a[0]), amount: parseFloat(a[1]) }))
        }
        
        // 대량 주문 감지 (오더북)
        detectLargeOrders(orderBook)
      }
    }
    
    // 실시간 거래 분석
    tradeWs.onmessage = (event) => {
      const trade = JSON.parse(event.data)
      const tradeValue = parseFloat(trade.p) * parseFloat(trade.q)
      
      if (tradeValue >= threshold) {
        const whaleOrder: WhaleOrder = {
          id: trade.t.toString(),
          timestamp: trade.T,
          side: trade.m ? 'sell' : 'buy', // m: true = 매도자가 메이커
          price: parseFloat(trade.p),
          amount: parseFloat(trade.q),
          total: tradeValue,
          impact: calculatePriceImpact(parseFloat(trade.q), trade.m ? 'sell' : 'buy', orderBook),
          type: 'market'
        }
        
        handleWhaleDetection(whaleOrder)
      }
      
      // 최근 활동 업데이트
      updateRecentActivity(trade)
    }
    
    wsRef.current = tradeWs
    
    return () => {
      tradeWs.close()
      depthWs.close()
    }
  }, [symbol, threshold])

  // 대량 주문 감지 (오더북)
  const detectLargeOrders = (orderBook: any) => {
    const detectSide = (orders: any[], side: 'buy' | 'sell') => {
      orders.forEach(order => {
        const total = order.price * order.amount
        if (total >= threshold) {
          const whaleOrder: WhaleOrder = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            side,
            price: order.price,
            amount: order.amount,
            total,
            impact: calculatePriceImpact(order.amount, side, orderBook),
            type: 'limit'
          }
          
          // 아이스버그 주문 감지
          if (detectIcebergPattern(order, orders)) {
            whaleOrder.type = 'iceberg'
          }
          
          handleWhaleDetection(whaleOrder)
        }
      })
    }
    
    detectSide(orderBook.bids, 'buy')
    detectSide(orderBook.asks, 'sell')
  }

  // 아이스버그 주문 패턴 감지
  const detectIcebergPattern = (order: any, allOrders: any[]) => {
    // 비슷한 가격대에 여러 개의 동일한 크기 주문이 있는지 확인
    const similarOrders = allOrders.filter(o => 
      Math.abs(o.price - order.price) / order.price < 0.001 && // 0.1% 이내
      Math.abs(o.amount - order.amount) / order.amount < 0.1 // 10% 이내 크기
    )
    
    return similarOrders.length >= 3 // 3개 이상이면 아이스버그 의심
  }

  // 가격 영향 계산
  const calculatePriceImpact = (amount: number, side: 'buy' | 'sell', orderBook: any) => {
    const orders = side === 'buy' ? orderBook.asks : orderBook.bids
    let remainingAmount = amount
    let totalCost = 0
    let currentPrice = orders[0]?.price || 0
    
    for (const order of orders) {
      if (remainingAmount <= 0) break
      
      const fillAmount = Math.min(remainingAmount, order.amount)
      totalCost += fillAmount * order.price
      remainingAmount -= fillAmount
    }
    
    const avgPrice = totalCost / amount
    const impact = Math.abs((avgPrice - currentPrice) / currentPrice) * 100
    
    return impact
  }

  // 고래 감지 처리
  const handleWhaleDetection = (order: WhaleOrder) => {
    setWhaleOrders(prev => [order, ...prev.slice(0, 99)])
    
    // 통계 업데이트
    setStats(prev => ({
      totalWhales24h: prev.totalWhales24h + 1,
      buyPressure: order.side === 'buy' ? prev.buyPressure + order.total : prev.buyPressure,
      sellPressure: order.side === 'sell' ? prev.sellPressure + order.total : prev.sellPressure,
      largestOrder: Math.max(prev.largestOrder, order.total),
      netFlow: prev.netFlow + (order.side === 'buy' ? order.total : -order.total)
    }))
    
    // 알림 생성
    const alert = `🐋 ${order.side === 'buy' ? '대량 매수' : '대량 매도'}: $${order.total.toLocaleString()} (${order.amount.toFixed(4)} ${symbol})`
    setAlerts(prev => [alert, ...prev.slice(0, 4)])
    
    // 콜백 실행
    if (onWhaleDetected) {
      onWhaleDetected(order)
    }
  }

  // 최근 활동 업데이트
  const updateRecentActivity = (trade: any) => {
    const time = new Date(trade.T).toLocaleTimeString()
    const value = parseFloat(trade.p) * parseFloat(trade.q)
    
    setRecentActivity(prev => {
      const updated = [...prev]
      const existingIndex = updated.findIndex(a => a.time === time)
      
      if (existingIndex >= 0) {
        updated[existingIndex].volume += value
        updated[existingIndex].trades += 1
      } else {
        updated.push({ time, volume: value, trades: 1 })
      }
      
      return updated.slice(-30) // 최근 30개 데이터만 유지
    })
  }

  return (
    <div className="w-full space-y-6">
      {/* 헤더 및 알림 */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <GiWhale className="text-blue-400 text-3xl" />
            고래 주문 감지 시스템
          </h3>
          <div className="flex items-center gap-2">
            <FaBell className="text-yellow-400 animate-pulse" />
            <span className="text-sm text-gray-400">
              기준: ${threshold.toLocaleString()}+
            </span>
          </div>
        </div>

        {/* 실시간 알림 */}
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={`${alert}-${index}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-2 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center gap-2"
            >
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-white text-sm">{alert}</span>
              <span className="text-gray-400 text-xs ml-auto">
                {new Date().toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
        >
          <div className="text-gray-400 text-sm mb-1">24시간 고래 수</div>
          <div className="text-2xl font-bold text-white">{stats.totalWhales24h}</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-green-900/20 rounded-lg border border-green-500/30"
        >
          <div className="text-gray-400 text-sm mb-1">매수 압력</div>
          <div className="text-2xl font-bold text-green-400">
            ${(stats.buyPressure / 1000000).toFixed(2)}M
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-red-900/20 rounded-lg border border-red-500/30"
        >
          <div className="text-gray-400 text-sm mb-1">매도 압력</div>
          <div className="text-2xl font-bold text-red-400">
            ${(stats.sellPressure / 1000000).toFixed(2)}M
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30"
        >
          <div className="text-gray-400 text-sm mb-1">순 흐름</div>
          <div className={`text-2xl font-bold ${stats.netFlow > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${(stats.netFlow / 1000000).toFixed(2)}M
          </div>
        </motion.div>
      </div>

      {/* 최근 고래 주문 목록 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaWhale className="text-blue-400" />
          최근 고래 주문
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">시간</th>
                <th className="text-left p-2">유형</th>
                <th className="text-left p-2">방향</th>
                <th className="text-right p-2">가격</th>
                <th className="text-right p-2">수량</th>
                <th className="text-right p-2">총액</th>
                <th className="text-right p-2">영향</th>
              </tr>
            </thead>
            <tbody>
              {whaleOrders.slice(0, 10).map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="p-2 text-gray-300">
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.type === 'iceberg' ? 'bg-blue-500/20 text-blue-400' :
                      order.type === 'limit' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {order.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`font-semibold ${
                      order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {order.side === 'buy' ? '매수' : '매도'}
                    </span>
                  </td>
                  <td className="p-2 text-right text-white">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="p-2 text-right text-gray-300">
                    {order.amount.toFixed(4)}
                  </td>
                  <td className="p-2 text-right text-white font-semibold">
                    ${order.total.toLocaleString()}
                  </td>
                  <td className="p-2 text-right">
                    <span className={`${
                      order.impact > 1 ? 'text-red-400' : 
                      order.impact > 0.5 ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {order.impact.toFixed(2)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 활동 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          거래 활동 분석
        </h4>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={recentActivity}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `$${value.toLocaleString()}`}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#8B5CF6"
              fillOpacity={1}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}