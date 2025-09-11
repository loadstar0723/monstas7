'use client'

import { useMemo, useEffect, useState } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { OrderFlowData, WhaleOrder } from '../types'
import { FOOTPRINT_CONFIG } from '../config/constants'
import { FaArrowUp, FaArrowDown, FaFish, FaFilter, FaDownload } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface OrderFlowTableProps {
  data: OrderFlowData[]
  symbol: string
}

export default function OrderFlowTable({ data, symbol }: OrderFlowTableProps) {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [onlyWhales, setOnlyWhales] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  
  // 고래 거래 임계값 (심볼별)
  const whaleThreshold = useMemo(() => {
    return FOOTPRINT_CONFIG.WHALE_THRESHOLDS[symbol] || 100
  }, [symbol])

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    // 최신 100개 데이터만 사용
    let filtered = data.slice(-100).reverse() // 최신 데이터가 위로
    
    if (filter !== 'all') {
      filtered = filtered.filter(order => order.side === filter)
    }
    
    if (onlyWhales) {
      filtered = filtered.filter(order => order.size >= whaleThreshold)
    }
    
    // 화면에 표시할 최대 개수 제한
    return filtered.slice(0, 50) // 최대 50개까지만 표시
  }, [data, filter, onlyWhales, whaleThreshold])

  // 고래 거래만 추출
  const whaleOrders = useMemo(() => {
    return data
      .filter(order => order.size >= whaleThreshold)
      .slice(-20)
      .reverse()
      .map((order, index) => ({
        id: `whale-${index}`,
        timestamp: order.timestamp,
        symbol,
        price: order.price,
        quantity: order.size,
        value: order.price * order.size,
        side: order.side,
        exchange: order.exchange,
        impact: order.size >= whaleThreshold * 10 ? 'high' : 
                order.size >= whaleThreshold * 5 ? 'medium' : 'low'
      } as WhaleOrder))
  }, [data, symbol, whaleThreshold])

  // 통계 계산
  const stats = useMemo(() => {
    const recentData = data.slice(-100)
    const buyOrders = recentData.filter(o => o.side === 'buy')
    const sellOrders = recentData.filter(o => o.side === 'sell')
    const whaleCount = recentData.filter(o => o.size >= whaleThreshold).length
    
    return {
      totalCount: recentData.length,
      buyCount: buyOrders.length,
      sellCount: sellOrders.length,
      buyVolume: buyOrders.reduce((sum, o) => sum + o.size, 0),
      sellVolume: sellOrders.reduce((sum, o) => sum + o.size, 0),
      whaleCount,
      avgSize: recentData.length > 0 ? 
        recentData.reduce((sum, o) => sum + o.size, 0) / recentData.length : 0
    }
  }, [data, whaleThreshold])

  // CSV 다운로드
  const downloadCSV = () => {
    const headers = ['시간', '가격', '수량', '타입', '공격성', '거래소']
    const rows = filteredData.map(order => [
      new Date(order.timestamp).toLocaleString(),
      order.price,
      order.size,
      order.side,
      order.aggressor ? '공격적' : '수동적',
      order.exchange
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `orderflow_${symbol}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  return (
    <div className="space-y-6 relative">
      {/* 오더플로우 통계 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">오더플로우 요약</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {safeFixed(stats.buyVolume, 2)}
            </div>
            <div className="text-sm text-gray-400">매수량</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {safeFixed(stats.sellVolume, 2)}
            </div>
            <div className="text-sm text-gray-400">매도량</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.whaleCount}
            </div>
            <div className="text-sm text-gray-400">고래 거래</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {safeFixed(stats.avgSize, 4)}
            </div>
            <div className="text-sm text-gray-400">평균 크기</div>
          </div>
        </div>
      </div>

      {/* 고래 거래 알림 */}
      {whaleOrders.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaFish className="text-blue-400" />
            최근 고래 거래
          </h3>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {whaleOrders.slice(0, 5).map(whale => (
              <motion.div
                key={whale.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${
                  whale.side === 'buy' 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {whale.side === 'buy' ? (
                      <FaArrowUp className="text-green-400" />
                    ) : (
                      <FaArrowDown className="text-red-400" />
                    )}
                    <div>
                      <div className="font-medium">
                        {safeAmount(whale.quantity)} {symbol.replace('USDT', '')}
                      </div>
                      <div className="text-sm text-gray-400">
                        ${whale.value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${whale.price.toLocaleString('ko-KR')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(whale.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {whale.impact === 'high' && (
                  <div className="mt-2 text-xs text-yellow-400">
                    ⚠️ 대규모 거래 - 시장 영향 주의
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 실시간 주문 테이블 */}
      <div className="bg-gray-800/50 rounded-xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">실시간 주문 플로우</h3>
            <p className="text-sm text-gray-400 mt-1">
              최근 {data.length}개 거래 중 {filteredData.length}개 표시
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 필터 버튼 */}
            <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
              {(['all', 'buy', 'sell'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    filter === type 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'all' ? '전체' : type === 'buy' ? '매수' : '매도'}
                </button>
              ))}
            </div>
            
            {/* 고래 필터 */}
            <button
              onClick={() => setOnlyWhales(!onlyWhales)}
              className={`p-2 rounded-lg transition-colors ${
                onlyWhales 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              <FaFish />
            </button>
            
            {/* CSV 다운로드 */}
            <button
              onClick={downloadCSV}
              className="p-2 bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <FaDownload />
            </button>
          </div>
        </div>
        
        {/* 테이블 */}
        <div className="relative">
          <div className="overflow-x-auto overflow-y-auto max-h-[24rem] border border-gray-700 rounded-lg custom-scrollbar">
            <table className="w-full text-sm relative">
              <thead className="sticky top-0 bg-gray-800/90 backdrop-blur-sm z-10">
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2 px-2">시간</th>
                  <th className="text-right py-2 px-2">가격</th>
                  <th className="text-right py-2 px-2">수량</th>
                  <th className="text-center py-2 px-2">타입</th>
                  <th className="text-center py-2 px-2">공격성</th>
                  <th className="text-right py-2 px-2">금액</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((order, index) => (
                  <tr
                    key={`${order.timestamp}-${index}`}
                    className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="py-2 px-2 text-gray-400">
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="text-right py-2 px-2 font-mono">
                      ${order.price.toLocaleString('ko-KR')}
                    </td>
                    <td className="text-right py-2 px-2 font-mono">
                      {safeFixed(order.size, 4)}
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className={`inline-flex items-center gap-1 ${
                        order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {order.side === 'buy' ? <FaArrowUp /> : <FaArrowDown />}
                        {order.side === 'buy' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.aggressor 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {order.aggressor ? '공격적' : '수동적'}
                      </span>
                    </td>
                    <td className="text-right py-2 px-2 font-mono">
                      ${(order.price * order.size).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            표시할 거래가 없습니다
          </div>
        )}
      </div>

      {/* 오더플로우 이해하기 */}
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h4 className="font-medium text-white mb-2">오더플로우 분석이란?</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <p>
            오더플로우는 실시간으로 체결되는 거래의 흐름을 분석하여 시장의 방향성을 파악하는 기법입니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>공격적 매수/매도: 시장가 주문으로 즉시 체결을 원하는 거래</li>
            <li>수동적 매수/매도: 지정가 주문으로 대기하다 체결된 거래</li>
            <li>고래 거래: 큰 규모의 거래로 시장에 영향을 줄 수 있는 주문</li>
          </ul>
        </div>
      </div>
    </div>
  )
}