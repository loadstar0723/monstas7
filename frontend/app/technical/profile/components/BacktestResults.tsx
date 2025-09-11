'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaHistory, FaCheckCircle, FaTimesCircle,
  FaCoins, FaTrophy, FaExclamationTriangle, FaFilter,
  FaCalendarAlt, FaPercentage, FaChartBar, FaArrowUp, FaArrowDown
} from 'react-icons/fa'
import { formatPrice, formatPercentage, formatNumber } from '@/lib/formatters'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'

interface BacktestResult {
  id: string
  date: string
  strategy: string
  type: 'long' | 'short'
  entry: number
  exit: number
  pnl: number
  pnlPercent: number
  holdTime: number
  success: boolean
}

interface StrategyStats {
  name: string
  totalTrades: number
  winRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  totalPnL: number
  roi: number
}

interface BacktestResultsProps {
  symbol: string
  currentPrice: number
  volumeProfileData: any
}

export default function BacktestResults({ symbol, currentPrice, volumeProfileData }: BacktestResultsProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '3m' | 'all'>('1m')
  const [showDetails, setShowDetails] = useState(false)
  
  // 백테스트 결과 생성 (실제로는 서버에서 가져와야 함)
  const backtestData = useMemo(() => {
    // 시뮬레이션 데이터 생성
    const strategies = ['POC 회귀', 'VA 돌파', 'HVN 반등', 'LVN 돌파']
    const results: BacktestResult[] = []
    
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000
    
    // 최근 90일간의 백테스트 결과 생성
    for (let i = 90; i > 0; i--) {
      const date = new Date(now - (i * dayInMs))
      const tradesPerDay = Math.floor(Math.random() * 3) + 1
      
      for (let j = 0; j < tradesPerDay; j++) {
        const strategy = strategies[Math.floor(Math.random() * strategies.length)]
        const isLong = Math.random() > 0.5
        const entry = currentPrice * (0.95 + Math.random() * 0.1)
        const success = Math.random() > 0.35 // 65% 승률
        
        let exit: number
        if (isLong) {
          exit = success 
            ? entry * (1 + (Math.random() * 0.03 + 0.01)) // 1-4% 수익
            : entry * (1 - (Math.random() * 0.015 + 0.005)) // 0.5-2% 손실
        } else {
          exit = success
            ? entry * (1 - (Math.random() * 0.03 + 0.01)) // 숏 수익
            : entry * (1 + (Math.random() * 0.015 + 0.005)) // 숏 손실
        }
        
        const pnl = isLong ? (exit - entry) : (entry - exit)
        const pnlPercent = (pnl / entry) * 100
        
        results.push({
          id: `trade-${i}-${j}`,
          date: date.toISOString(),
          strategy,
          type: isLong ? 'long' : 'short',
          entry,
          exit,
          pnl: pnl * 100, // 100 단위 포지션 가정
          pnlPercent,
          holdTime: Math.floor(Math.random() * 240) + 30, // 30분-4시간
          success
        })
      }
    }
    
    return results.reverse() // 최신순 정렬
  }, [currentPrice])
  
  // 필터링된 결과
  const filteredResults = useMemo(() => {
    let filtered = backtestData
    
    // 전략 필터
    if (selectedStrategy !== 'all') {
      filtered = filtered.filter(r => r.strategy === selectedStrategy)
    }
    
    // 시간 필터
    const now = Date.now()
    const timeFilters = {
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }
    
    if (timeframe !== 'all') {
      const cutoff = now - timeFilters[timeframe]
      filtered = filtered.filter(r => new Date(r.date).getTime() > cutoff)
    }
    
    return filtered
  }, [backtestData, selectedStrategy, timeframe])
  
  // 전략별 통계 계산
  const strategyStats = useMemo(() => {
    const strategies = ['POC 회귀', 'VA 돌파', 'HVN 반등', 'LVN 돌파']
    
    return strategies.map(strategy => {
      const trades = filteredResults.filter(r => r.strategy === strategy)
      const wins = trades.filter(t => t.success)
      const losses = trades.filter(t => !t.success)
      
      const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0)
      const winPnL = wins.reduce((sum, t) => sum + t.pnl, 0)
      const lossPnL = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0))
      
      // Sharpe Ratio 계산 (간소화)
      const returns = trades.map(t => t.pnlPercent)
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length || 1
      const stdDev = Math.sqrt(variance)
      const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // 연간화
      
      // 최대 낙폭 계산
      let maxDrawdown = 0
      let peak = 0
      let runningPnL = 0
      
      trades.forEach(trade => {
        runningPnL += trade.pnl
        if (runningPnL > peak) peak = runningPnL
        const drawdown = ((peak - runningPnL) / peak) * 100
        if (drawdown > maxDrawdown) maxDrawdown = drawdown
      })
      
      return {
        name: strategy,
        totalTrades: trades.length,
        winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
        avgWin: wins.length > 0 ? winPnL / wins.length : 0,
        avgLoss: losses.length > 0 ? lossPnL / losses.length : 0,
        profitFactor: lossPnL > 0 ? winPnL / lossPnL : 0,
        sharpeRatio,
        maxDrawdown,
        totalPnL,
        roi: trades.length > 0 ? (totalPnL / (trades.length * 10000)) * 100 : 0
      }
    })
  }, [filteredResults])
  
  // 누적 수익 차트 데이터
  const equityCurve = useMemo(() => {
    let runningPnL = 0
    return filteredResults.map((result, index) => {
      runningPnL += result.pnl
      return {
        date: new Date(result.date).toLocaleDateString(),
        pnl: runningPnL,
        trade: result.pnl
      }
    })
  }, [filteredResults])
  
  // 전체 통계
  const overallStats = useMemo(() => {
    const wins = filteredResults.filter(t => t.success)
    const losses = filteredResults.filter(t => !t.success)
    const totalPnL = filteredResults.reduce((sum, t) => sum + t.pnl, 0)
    
    return {
      totalTrades: filteredResults.length,
      winRate: filteredResults.length > 0 ? (wins.length / filteredResults.length) * 100 : 0,
      totalPnL,
      avgPnL: filteredResults.length > 0 ? totalPnL / filteredResults.length : 0,
      bestTrade: Math.max(...filteredResults.map(t => t.pnl), 0),
      worstTrade: Math.min(...filteredResults.map(t => t.pnl), 0),
      avgHoldTime: filteredResults.length > 0 
        ? filteredResults.reduce((sum, t) => sum + t.holdTime, 0) / filteredResults.length
        : 0
    }
  }, [filteredResults])
  
  // 승률 파이 차트 데이터
  const winRateData = [
    { name: '승리', value: overallStats.winRate, color: '#10b981' },
    { name: '패배', value: 100 - overallStats.winRate, color: '#ef4444' }
  ]
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaHistory className="text-purple-400" />
          백테스트 결과 분석
        </h3>
        
        {/* 필터 섹션 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-white text-sm"
            >
              <option value="all">모든 전략</option>
              <option value="POC 회귀">POC 회귀</option>
              <option value="VA 돌파">VA 돌파</option>
              <option value="HVN 반등">HVN 반등</option>
              <option value="LVN 돌파">LVN 돌파</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <div className="flex gap-1">
              {(['1w', '1m', '3m', 'all'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    timeframe === tf
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500'
                      : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-gray-600'
                  } border`}
                >
                  {tf === '1w' && '1주'}
                  {tf === '1m' && '1개월'}
                  {tf === '3m' && '3개월'}
                  {tf === 'all' && '전체'}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* 전체 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">총 거래</p>
            <p className="text-lg font-bold text-white">{overallStats.totalTrades}</p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">승률</p>
            <p className={`text-lg font-bold ${
              overallStats.winRate >= 60 ? 'text-green-400' : 
              overallStats.winRate >= 40 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {formatPercentage(overallStats.winRate)}%
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">총 손익</p>
            <p className={`text-lg font-bold ${
              overallStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${formatNumber(overallStats.totalPnL)}
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">평균 손익</p>
            <p className={`text-lg font-bold ${
              overallStats.avgPnL >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${formatNumber(overallStats.avgPnL)}
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">최고 수익</p>
            <p className="text-lg font-bold text-green-400">
              ${formatNumber(overallStats.bestTrade)}
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">최대 손실</p>
            <p className="text-lg font-bold text-red-400">
              ${formatNumber(Math.abs(overallStats.worstTrade))}
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">평균 보유</p>
            <p className="text-lg font-bold text-purple-400">
              {Math.floor(overallStats.avgHoldTime / 60)}시간
            </p>
          </div>
        </div>
        
        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 누적 수익 차트 */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">누적 수익 곡선</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickFormatter={(value) => '$' + formatNumber(value)}
                  />
                  <Tooltip
                    formatter={(value: any) => ['$' + formatNumber(value), 'PnL']}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pnlGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* 승률 차트 */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">승률 분석</h4>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {winRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatPercentage(value) + '%'}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-white">{formatPercentage(overallStats.winRate)}%</p>
                <p className="text-sm text-gray-400">승률</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 전략별 성과 */}
        <div>
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            전략별 성과 분석
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {strategyStats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
              >
                <h5 className="font-medium text-white mb-3">{stat.name}</h5>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">거래 횟수</span>
                    <span className="text-white">{stat.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">승률</span>
                    <span className={`font-medium ${
                      stat.winRate >= 60 ? 'text-green-400' : 
                      stat.winRate >= 40 ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>
                      {formatPercentage(stat.winRate)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit Factor</span>
                    <span className={`font-medium ${
                      stat.profitFactor >= 1.5 ? 'text-green-400' : 
                      stat.profitFactor >= 1 ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>
                      {stat.profitFactor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sharpe Ratio</span>
                    <span className={`font-medium ${
                      stat.sharpeRatio >= 1 ? 'text-green-400' : 
                      stat.sharpeRatio >= 0 ? 'text-yellow-400' : 
                      'text-red-400'
                    }`}>
                      {stat.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">최대 낙폭</span>
                    <span className="text-red-400">
                      -{formatPercentage(stat.maxDrawdown)}%
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400">총 손익</span>
                    <span className={`font-bold ${
                      stat.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${formatNumber(stat.totalPnL)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* 최근 거래 내역 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white">최근 거래 내역</h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              {showDetails ? '간략히' : '자세히'} 보기
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-gray-400">날짜</th>
                  <th className="text-left py-2 px-3 text-gray-400">전략</th>
                  <th className="text-center py-2 px-3 text-gray-400">타입</th>
                  <th className="text-right py-2 px-3 text-gray-400">진입가</th>
                  {showDetails && (
                    <>
                      <th className="text-right py-2 px-3 text-gray-400">청산가</th>
                      <th className="text-right py-2 px-3 text-gray-400">보유시간</th>
                    </>
                  )}
                  <th className="text-right py-2 px-3 text-gray-400">손익</th>
                  <th className="text-right py-2 px-3 text-gray-400">수익률</th>
                  <th className="text-center py-2 px-3 text-gray-400">결과</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.slice(0, showDetails ? 20 : 10).map((result) => (
                  <tr key={result.id} className="border-b border-gray-800">
                    <td className="py-2 px-3 text-gray-300">
                      {new Date(result.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 text-white">{result.strategy}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.type === 'long' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {result.type === 'long' ? '롱' : '숏'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-300">
                      ${formatPrice(result.entry)}
                    </td>
                    {showDetails && (
                      <>
                        <td className="py-2 px-3 text-right text-gray-300">
                          ${formatPrice(result.exit)}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-300">
                          {Math.floor(result.holdTime / 60)}시간
                        </td>
                      </>
                    )}
                    <td className={`py-2 px-3 text-right font-medium ${
                      result.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.pnl >= 0 ? '+' : ''}${formatNumber(result.pnl)}
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${
                      result.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.pnlPercent >= 0 ? '+' : ''}{formatPercentage(result.pnlPercent)}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      {result.success ? (
                        <FaCheckCircle className="text-green-400 mx-auto" />
                      ) : (
                        <FaTimesCircle className="text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 리스크 경고 */}
        <div className="mt-6 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-300">
              <p className="font-medium mb-1">백테스트 주의사항</p>
              <p className="text-yellow-300/80">
                과거 성과는 미래 수익을 보장하지 않습니다. 실제 거래에서는 슬리피지, 수수료, 시장 충격 등 
                추가 비용이 발생할 수 있으며, 백테스트 결과와 다를 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}