'use client'

import { useState, useEffect } from 'react'

interface BacktestResultsProps {
  symbol: string
  priceHistory: any[]
}

export default function BacktestResults({ symbol, priceHistory }: BacktestResultsProps) {
  const [results, setResults] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalReturn: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    profitFactor: 0,
    avgWin: 0,
    avgLoss: 0
  })

  useEffect(() => {
    if (priceHistory.length < 50) return

    // 간단한 백테스팅 시뮬레이션
    const simulateBacktest = () => {
      let trades: any[] = []
      let position = null
      let capital = 10000
      let maxCapital = capital
      let minCapital = capital

      for (let i = 14; i < priceHistory.length - 1; i++) {
        const currentBar = priceHistory[i]
        const prevBar = priceHistory[i - 1]
        
        // RSI 계산 (간단 버전)
        const gains = []
        const losses = []
        for (let j = i - 13; j < i; j++) {
          if (j > 0 && priceHistory[j] && priceHistory[j - 1]) {
            const change = priceHistory[j].close - priceHistory[j - 1].close
            if (change > 0) gains.push(change)
            else losses.push(Math.abs(change))
          }
        }
        
        const avgGain = gains.reduce((a, b) => a + b, 0) / 14
        const avgLoss = losses.reduce((a, b) => a + b, 0) / 14
        const rs = avgGain / (avgLoss || 0.001)
        const rsi = 100 - (100 / (1 + rs))

        // 간단한 거래 로직
        if (!position && rsi < 30) {
          // 매수 진입
          position = {
            type: 'buy',
            entryPrice: currentBar.close,
            size: capital * 0.1 / currentBar.close
          }
        } else if (position && position.type === 'buy') {
          // 매도 조건
          if (rsi > 70 || (currentBar.close - position.entryPrice) / position.entryPrice > 0.05) {
            const profit = (currentBar.close - position.entryPrice) * position.size
            capital += profit
            trades.push({
              profit,
              return: profit / (position.entryPrice * position.size)
            })
            position = null
            
            maxCapital = Math.max(maxCapital, capital)
            minCapital = Math.min(minCapital, capital)
          }
        }
      }

      // 결과 계산
      const winningTrades = trades.filter(t => t.profit > 0)
      const losingTrades = trades.filter(t => t.profit < 0)
      const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0)
      const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0))

      setResults({
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
        totalReturn: ((capital - 10000) / 10000) * 100,
        maxDrawdown: ((maxCapital - minCapital) / maxCapital) * 100,
        sharpeRatio: trades.length > 0 ? 
          trades.reduce((sum, t) => sum + t.return, 0) / trades.length / 
          Math.sqrt(trades.reduce((sum, t) => sum + Math.pow(t.return, 2), 0) / trades.length) : 0,
        profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
        avgWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
        avgLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0
      })
    }

    simulateBacktest()
  }, [priceHistory])

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">백테스팅 결과</h2>
        <span className="text-xs text-gray-400">최근 100개 캔들 기준</span>
      </div>

      {/* 주요 성과 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">총 수익률</p>
          <p className={`text-2xl font-bold ${results.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {results.totalReturn >= 0 ? '+' : ''}{results.totalReturn.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">승률</p>
          <p className={`text-2xl font-bold ${results.winRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
            {results.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">최대 낙폭</p>
          <p className="text-2xl font-bold text-orange-400">
            -{results.maxDrawdown.toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">손익비</p>
          <p className={`text-2xl font-bold ${results.profitFactor > 1 ? 'text-green-400' : 'text-red-400'}`}>
            {results.profitFactor.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 거래 통계 */}
      <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">거래 통계</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">총 거래 횟수</span>
            <span className="text-sm font-medium text-white">{results.totalTrades}회</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">승리 거래</span>
            <span className="text-sm font-medium text-green-400">{results.winningTrades}회</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">손실 거래</span>
            <span className="text-sm font-medium text-red-400">{results.losingTrades}회</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">평균 수익</span>
            <span className="text-sm font-medium text-green-400">+${results.avgWin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">평균 손실</span>
            <span className="text-sm font-medium text-red-400">-${results.avgLoss.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">샤프 비율</span>
            <span className="text-sm font-medium text-white">{results.sharpeRatio.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 성과 차트 (간단한 시각화) */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">승/패 분포</h3>
        <div className="flex items-center gap-2 h-8">
          <div 
            className="bg-green-500 h-full rounded-l"
            style={{ width: `${results.winRate}%` }}
          />
          <div 
            className="bg-red-500 h-full rounded-r"
            style={{ width: `${100 - results.winRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>승리 {results.winRate.toFixed(1)}%</span>
          <span>패배 {(100 - results.winRate).toFixed(1)}%</span>
        </div>
      </div>

      {/* 백테스팅 설명 */}
      <div className="mt-6 p-3 bg-purple-900/10 rounded-lg border border-purple-800/20">
        <p className="text-xs text-gray-400">
          * RSI 기반 모멘텀 전략으로 백테스팅 수행 (RSI {'<'} 30 매수, RSI {'>'} 70 매도)
        </p>
      </div>
    </div>
  )
}