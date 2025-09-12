'use client'

import { useState, useEffect } from 'react'
import { MomentumData } from '../MomentumModule'

interface LivePerformanceProps {
  symbol: string
  momentumData: MomentumData | null
}

export default function LivePerformance({ symbol, momentumData }: LivePerformanceProps) {
  const [performance, setPerformance] = useState({
    todayPnL: 0,
    todayPnLPercent: 0,
    weekPnL: 0,
    weekPnLPercent: 0,
    monthPnL: 0,
    monthPnLPercent: 0,
    openPositions: 0,
    totalVolume: 0,
    successRate: 0
  })

  const [recentTrades, setRecentTrades] = useState<any[]>([])

  useEffect(() => {
    // 실시간 성과 시뮬레이션 (실제로는 API에서 가져와야 함)
    const simulatePerformance = () => {
      const baseCapital = 10000
      
      // 랜덤 성과 생성 (실제로는 거래 데이터 기반)
      const todayReturn = momentumData ? (momentumData.momentumScore - 50) * 0.002 : 0
      const weekReturn = momentumData ? (momentumData.momentumScore - 50) * 0.01 : 0
      const monthReturn = momentumData ? (momentumData.momentumScore - 50) * 0.03 : 0

      setPerformance({
        todayPnL: baseCapital * todayReturn,
        todayPnLPercent: todayReturn * 100,
        weekPnL: baseCapital * weekReturn,
        weekPnLPercent: weekReturn * 100,
        monthPnL: baseCapital * monthReturn,
        monthPnLPercent: monthReturn * 100,
        openPositions: momentumData?.trend === 'bullish' || momentumData?.trend === 'strong_bullish' ? 2 : 1,
        totalVolume: 50000 + (momentumData?.momentumScore || 50) * 1000,
        successRate: 50 + (momentumData?.momentumScore || 50) * 0.3
      })

      // 최근 거래 시뮬레이션
      const trades = [
        {
          time: new Date(Date.now() - 3600000).toLocaleTimeString(),
          type: momentumData?.trend === 'bullish' ? 'buy' : 'sell',
          amount: 0.1,
          price: 98000,
          pnl: momentumData ? (momentumData.momentumScore - 50) * 10 : 0
        },
        {
          time: new Date(Date.now() - 7200000).toLocaleTimeString(),
          type: momentumData?.trend === 'bearish' ? 'sell' : 'buy',
          amount: 0.05,
          price: 97500,
          pnl: momentumData ? (momentumData.momentumScore - 60) * 8 : 0
        },
        {
          time: new Date(Date.now() - 10800000).toLocaleTimeString(),
          type: 'buy',
          amount: 0.2,
          price: 97000,
          pnl: momentumData ? (momentumData.momentumScore - 40) * 15 : 0
        }
      ]
      setRecentTrades(trades)
    }

    simulatePerformance()
    const interval = setInterval(simulatePerformance, 10000) // 10초마다 업데이트

    return () => clearInterval(interval)
  }, [momentumData])

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">실시간 성과</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* 기간별 성과 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">오늘 수익</p>
          <p className={`text-2xl font-bold ${performance.todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {performance.todayPnL >= 0 ? '+' : ''}${performance.todayPnL.toFixed(2)}
          </p>
          <p className={`text-sm ${performance.todayPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {performance.todayPnLPercent >= 0 ? '+' : ''}{performance.todayPnLPercent.toFixed(2)}%
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">주간 수익</p>
          <p className={`text-2xl font-bold ${performance.weekPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {performance.weekPnL >= 0 ? '+' : ''}${performance.weekPnL.toFixed(2)}
          </p>
          <p className={`text-sm ${performance.weekPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {performance.weekPnLPercent >= 0 ? '+' : ''}{performance.weekPnLPercent.toFixed(2)}%
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">월간 수익</p>
          <p className={`text-2xl font-bold ${performance.monthPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {performance.monthPnL >= 0 ? '+' : ''}${performance.monthPnL.toFixed(2)}
          </p>
          <p className={`text-sm ${performance.monthPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {performance.monthPnLPercent >= 0 ? '+' : ''}{performance.monthPnLPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* 거래 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-900/20 rounded-lg p-3 text-center border border-purple-800/30">
          <p className="text-xs text-purple-400 mb-1">오픈 포지션</p>
          <p className="text-xl font-bold text-white">{performance.openPositions}</p>
        </div>
        <div className="bg-purple-900/20 rounded-lg p-3 text-center border border-purple-800/30">
          <p className="text-xs text-purple-400 mb-1">거래량</p>
          <p className="text-xl font-bold text-white">${(performance.totalVolume / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-purple-900/20 rounded-lg p-3 text-center border border-purple-800/30">
          <p className="text-xs text-purple-400 mb-1">성공률</p>
          <p className="text-xl font-bold text-white">{performance.successRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* 최근 거래 */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">최근 거래</h3>
        <div className="space-y-2">
          {recentTrades.map((trade, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  trade.type === 'buy' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {trade.type === 'buy' ? '매수' : '매도'}
                </span>
                <div>
                  <p className="text-sm text-white">{trade.amount} BTC</p>
                  <p className="text-xs text-gray-500">{trade.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">${trade.price.toLocaleString()}</p>
                <p className={`text-sm font-medium ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 성과 요약 */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span>마지막 업데이트: {new Date().toLocaleTimeString()}</span>
        <span>자동 새로고침 10초</span>
      </div>
    </div>
  )
}