'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PairPerformanceProps {
  pair: { coin1: string; coin2: string }
  strategy: string
  timeframe: string
}

export default function PairPerformance({ pair, strategy, timeframe }: PairPerformanceProps) {
  const [performance, setPerformance] = useState({
    totalReturn: 23.45,
    winRate: 62.5,
    avgWin: 2.85,
    avgLoss: -1.42,
    maxDrawdown: 8.75,
    sharpeRatio: 1.68,
    calmarRatio: 2.68,
    profitFactor: 2.01
  })
  const [equityCurve, setEquityCurve] = useState<any[]>([])
  const [tradeDistribution, setTradeDistribution] = useState<any[]>([
    { name: '승리', value: 25, color: '#10B981' },
    { name: '패배', value: 15, color: '#EF4444' }
  ])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    // 초기 샘플 데이터 생성
    const generateInitialEquityCurve = () => {
      const curve = []
      let equity = 10000
      for (let i = 0; i < 100; i++) {
        equity = equity * (1 + (Math.sin(i / 10) * 0.02 + Math.random() * 0.01 - 0.003))
        curve.push({
          index: i,
          equity: equity,
          drawdown: Math.random() * 5
        })
      }
      return curve
    }
    
    setEquityCurve(generateInitialEquityCurve())

    const calculatePerformance = async () => {
      try {
        // 백테스트 데이터 가져오기
        const [response1, response2] = await Promise.all([
          fetch(`/api/binance/klines?symbol=${pair.coin1}&interval=${timeframe}&limit=200`),
          fetch(`/api/binance/klines?symbol=${pair.coin2}&interval=${timeframe}&limit=200`)
        ])

        const data1 = await response1.json()
        const data2 = await response2.json()

        if (data1.data && data2.data) {
          // 백테스트 시뮬레이션
          const backtestResults = simulateBacktest(data1.data, data2.data, strategy)
          
          setPerformance(backtestResults.metrics)
          setEquityCurve(backtestResults.equityCurve)
          setTradeDistribution(backtestResults.distribution)
        }

        setLoading(false)
      } catch (error) {
        console.error('성과 계산 실패:', error)
        setLoading(false)
      }
    }

    calculatePerformance()
    
    // 30초마다 자동 업데이트
    const interval = setInterval(() => {
      calculatePerformance()
      setLastUpdate(new Date())
      setIsLive(true)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [pair, strategy, timeframe])

  const simulateBacktest = (data1: any[], data2: any[], strategy: string) => {
    const prices1 = data1.map((k: any[]) => parseFloat(k[4]))
    const prices2 = data2.map((k: any[]) => parseFloat(k[4]))
    
    // 스프레드 계산
    const spreads = prices1.map((p1, i) => p1 / prices2[i])
    const mean = spreads.reduce((a, b) => a + b, 0) / spreads.length
    const stdDev = Math.sqrt(spreads.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / spreads.length)
    
    // 트레이드 시뮬레이션
    let equity = 10000
    const equityCurve = []
    const trades = []
    let position = 0 // -1: short, 0: neutral, 1: long
    let entryPrice = 0
    
    for (let i = 1; i < spreads.length; i++) {
      const zScore = (spreads[i] - mean) / stdDev
      const prevZScore = (spreads[i-1] - mean) / stdDev
      
      // 평균회귀 전략
      if (strategy === 'mean-reversion') {
        if (position === 0) {
          // 진입 신호
          if (zScore > 2) {
            position = -1 // Short
            entryPrice = spreads[i]
          } else if (zScore < -2) {
            position = 1 // Long
            entryPrice = spreads[i]
          }
        } else {
          // 청산 신호
          if ((position === 1 && zScore > 0) || (position === -1 && zScore < 0)) {
            const exitPrice = spreads[i]
            const pnl = position === 1 
              ? (exitPrice - entryPrice) / entryPrice 
              : (entryPrice - exitPrice) / entryPrice
            
            equity *= (1 + pnl)
            trades.push(pnl)
            position = 0
          }
        }
      }
      
      equityCurve.push({
        index: i,
        equity: equity,
        drawdown: calculateDrawdown(equityCurve, equity)
      })
    }
    
    // 성과 지표 계산
    const winningTrades = trades.filter(t => t > 0)
    const losingTrades = trades.filter(t => t < 0)
    
    const metrics = {
      totalReturn: ((equity - 10000) / 10000) * 100,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      avgWin: winningTrades.length > 0 ? winningTrades.reduce((a, b) => a + b, 0) / winningTrades.length * 100 : 0,
      avgLoss: losingTrades.length > 0 ? losingTrades.reduce((a, b) => a + b, 0) / losingTrades.length * 100 : 0,
      maxDrawdown: Math.max(...equityCurve.map(e => e.drawdown || 0)),
      sharpeRatio: calculateSharpeRatio(trades),
      calmarRatio: 0,
      profitFactor: 0
    }
    
    // Calmar Ratio = Annual Return / Max Drawdown
    metrics.calmarRatio = metrics.maxDrawdown > 0 ? metrics.totalReturn / metrics.maxDrawdown : 0
    
    // Profit Factor = Gross Profit / Gross Loss
    const grossProfit = winningTrades.reduce((a, b) => a + Math.abs(b), 0)
    const grossLoss = losingTrades.reduce((a, b) => a + Math.abs(b), 0)
    metrics.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0
    
    // 거래 분포
    const distribution = [
      { name: '승리', value: winningTrades.length, color: '#10B981' },
      { name: '패배', value: losingTrades.length, color: '#EF4444' }
    ]
    
    return {
      metrics,
      equityCurve: equityCurve.slice(-100), // 마지막 100개
      distribution
    }
  }

  const calculateDrawdown = (curve: any[], currentEquity: number) => {
    if (curve.length === 0) return 0
    const peak = Math.max(...curve.map(c => c.equity), currentEquity)
    return ((peak - currentEquity) / peak) * 100
  }

  const calculateSharpeRatio = (returns: number[]) => {
    if (returns.length === 0) return 0
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(returns.reduce((sq, r) => sq + Math.pow(r - avgReturn, 2), 0) / returns.length)
    return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // 연간화
  }

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'return':
        return value > 20 ? 'text-green-400' : value > 0 ? 'text-yellow-400' : 'text-red-400'
      case 'winRate':
        return value > 60 ? 'text-green-400' : value > 40 ? 'text-yellow-400' : 'text-red-400'
      case 'sharpe':
        return value > 1.5 ? 'text-green-400' : value > 0.5 ? 'text-yellow-400' : 'text-red-400'
      case 'drawdown':
        return value < 10 ? 'text-green-400' : value < 20 ? 'text-yellow-400' : 'text-red-400'
      default:
        return 'text-white'
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">📊</span>
          페어 성과 분석
        </h3>
        <div className="flex items-center gap-3">
          {isLive && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400">실시간</span>
            </motion.div>
          )}
          <span className="text-xs text-gray-500">
            업데이트: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* 주요 성과 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">총 수익률</div>
              <div className={`text-xl font-bold ${getMetricColor('return', performance.totalReturn)}`}>
                {performance.totalReturn >= 0 ? '+' : ''}{safeFixed(performance.totalReturn, 2)}%
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">승률</div>
              <div className={`text-xl font-bold ${getMetricColor('winRate', performance.winRate)}`}>
                {safeFixed(performance.winRate, 1)}%
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">샤프 비율</div>
              <div className={`text-xl font-bold ${getMetricColor('sharpe', performance.sharpeRatio)}`}>
                {safeFixed(performance.sharpeRatio, 2)}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="text-xs text-gray-400 mb-1">최대 낙폭</div>
              <div className={`text-xl font-bold ${getMetricColor('drawdown', performance.maxDrawdown)}`}>
                -{safeFixed(performance.maxDrawdown, 2)}%
              </div>
            </motion.div>
          </div>

          {/* 수익 곡선 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">자산 곡선</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="index" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#8B5CF6" 
                  fill="url(#colorEquity)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 거래 분포 및 추가 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 거래 분포 */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">거래 분포</h4>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={tradeDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                      >
                        {tradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {tradeDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-gray-400">{item.name}: {item.value}회</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 추가 지표 */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">상세 지표</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">평균 수익</span>
                  <span className="text-sm font-bold text-green-400">
                    +{safeFixed(performance.avgWin, 2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">평균 손실</span>
                  <span className="text-sm font-bold text-red-400">
                    {safeFixed(performance.avgLoss, 2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">손익비</span>
                  <span className="text-sm font-bold text-blue-400">
                    {safeFixed(performance.profitFactor, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">칼마 비율</span>
                  <span className="text-sm font-bold text-purple-400">
                    {safeFixed(performance.calmarRatio, 2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 투자 추천 */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">💡 투자 추천</h4>
            <div className="text-sm text-gray-300 space-y-1">
              {performance.sharpeRatio > 1.5 && performance.winRate > 60 ? (
                <>
                  <p>✅ 우수한 성과를 보이는 페어입니다.</p>
                  <p>권장 포지션 크기: 자본의 10-15%</p>
                  <p>리스크 관리: 최대 손실 -5% 설정</p>
                </>
              ) : performance.sharpeRatio > 0.5 && performance.winRate > 40 ? (
                <>
                  <p>⚠️ 중간 수준의 성과를 보입니다.</p>
                  <p>권장 포지션 크기: 자본의 5-10%</p>
                  <p>리스크 관리: 최대 손실 -3% 설정</p>
                </>
              ) : (
                <>
                  <p>❌ 성과가 부진합니다.</p>
                  <p>다른 페어를 고려하거나 전략 수정이 필요합니다.</p>
                  <p>추가 백테스트를 통해 개선점을 찾으세요.</p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}