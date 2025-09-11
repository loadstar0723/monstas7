'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaHistory, FaArrowUp, FaArrowDown, FaCalendarAlt } from 'react-icons/fa'

interface PinBarHistoryProps {
  symbol: string
  timeframe: string
}

export default function PinBarHistory({ symbol, timeframe }: PinBarHistoryProps) {
  const [history, setHistory] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalPatterns: 0,
    successRate: 0,
    avgProfit: 0,
    bestTrade: 0,
    worstTrade: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${timeframe}&limit=500`)
        const data = await response.json()
        
        if (Array.isArray(data)) {
          const patterns = []
          
          // 핀 바 패턴 감지 및 성과 추적
          for (let i = 1; i < data.length - 1; i++) {
            const candle = data[i]
            const nextCandle = data[i + 1]
            
            const open = parseFloat(candle[1])
            const high = parseFloat(candle[2])
            const low = parseFloat(candle[3])
            const close = parseFloat(candle[4])
            const volume = parseFloat(candle[5])
            
            const body = Math.abs(close - open)
            const range = high - low
            
            if (range === 0) continue
            
            const bodyRatio = (body / range) * 100
            const upperWick = high - Math.max(open, close)
            const lowerWick = Math.min(open, close) - low
            const upperRatio = (upperWick / range) * 100
            const lowerRatio = (lowerWick / range) * 100
            
            // 핀 바 조건
            if (bodyRatio <= 30) {
              if (lowerRatio >= 60) {
                // Bullish Pin Bar
                const entryPrice = close
                const nextClose = parseFloat(nextCandle[4])
                const profit = ((nextClose - entryPrice) / entryPrice) * 100
                
                patterns.push({
                  type: 'bullish',
                  time: new Date(candle[0]).toLocaleString('ko-KR'),
                  entryPrice,
                  exitPrice: nextClose,
                  profit,
                  success: profit > 0,
                  volume,
                  strength: Math.min(100, lowerRatio * 1.2)
                })
              } else if (upperRatio >= 60) {
                // Bearish Pin Bar
                const entryPrice = close
                const nextClose = parseFloat(nextCandle[4])
                const profit = ((entryPrice - nextClose) / entryPrice) * 100
                
                patterns.push({
                  type: 'bearish',
                  time: new Date(candle[0]).toLocaleString('ko-KR'),
                  entryPrice,
                  exitPrice: nextClose,
                  profit,
                  success: profit > 0,
                  volume,
                  strength: Math.min(100, upperRatio * 1.2)
                })
              }
            }
          }
          
          // 최근 20개만 표시
          setHistory(patterns.slice(-20).reverse())
          
          // 통계 계산
          if (patterns.length > 0) {
            const successCount = patterns.filter(p => p.success).length
            const totalProfit = patterns.reduce((sum, p) => sum + p.profit, 0)
            const profits = patterns.map(p => p.profit)
            
            setStats({
              totalPatterns: patterns.length,
              successRate: (successCount / patterns.length) * 100,
              avgProfit: totalProfit / patterns.length,
              bestTrade: Math.max(...profits),
              worstTrade: Math.min(...profits)
            })
          }
        }
      } catch (error) {
        console.error('히스토리 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadHistory()
  }, [symbol, timeframe])

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-3"></div>
          <p className="text-gray-400">히스토리 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">📜 핀 바 히스토리 분석</h3>
        
        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">총 패턴</p>
            <p className="text-white font-bold">{stats.totalPatterns}개</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">성공률</p>
            <p className={`font-bold ${stats.successRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
              {safeFixed(stats.successRate, 1)}%
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">평균 수익</p>
            <p className={`font-bold ${stats.avgProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.avgProfit >= 0 ? '+' : ''}{safeFixed(stats.avgProfit, 2)}%
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">최고 수익</p>
            <p className="text-green-400 font-bold">+{safeFixed(stats.bestTrade, 2)}%</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-2">
            <p className="text-gray-400 text-xs mb-1">최대 손실</p>
            <p className="text-red-400 font-bold">{safeFixed(stats.worstTrade, 2)}%</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="text-sm font-bold text-gray-400 mb-3">최근 패턴 기록</h4>
        {history.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {history.map((pattern, index) => (
              <div 
                key={index}
                className={`rounded-lg p-3 border ${
                  pattern.success 
                    ? 'bg-green-900/20 border-green-500/30' 
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {pattern.type === 'bullish' ? (
                      <FaArrowUp className="text-green-400" />
                    ) : (
                      <FaArrowDown className="text-red-400" />
                    )}
                    <span className={`font-medium ${
                      pattern.type === 'bullish' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {pattern.type === 'bullish' ? 'Bullish' : 'Bearish'}
                    </span>
                    {pattern.success ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                        성공
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                        실패
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <FaCalendarAlt className="text-[10px]" />
                    {pattern.time}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">진입가</span>
                    <p className="text-white">${safeFixed(pattern.entryPrice, 2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">청산가</span>
                    <p className="text-white">${safeFixed(pattern.exitPrice, 2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">수익률</span>
                    <p className={`font-medium ${
                      pattern.profit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {pattern.profit >= 0 ? '+' : ''}{safeFixed(pattern.profit, 2)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">패턴 강도</span>
                    <p className="text-purple-400 font-medium">{safeFixed(pattern.strength, 0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaHistory className="text-gray-500 text-3xl mx-auto mb-3" />
            <p className="text-gray-400">히스토리 데이터가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}