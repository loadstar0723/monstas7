'use client'

import { useState, useEffect } from 'react'
import { FaTachometerAlt, FaTrophy, FaChartLine, FaMedal, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area } from 'recharts'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface DCASettings {
  interval: string
  amount: number
  startDate: string
  totalBudget: number
  stopLoss: number
  takeProfit: number
  strategy: string
}

interface Props {
  selectedCoin: CoinInfo
  settings: DCASettings
}

interface PerformanceMetric {
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  winRate: number
  profitFactor: number
  maxDrawdown: number
  avgWin: number
  avgLoss: number
  bestMonth: number
  worstMonth: number
}

export default function PerformanceAnalytics({ selectedCoin, settings }: Props) {
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetric>({
    sharpeRatio: 0,
    sortinoRatio: 0,
    calmarRatio: 0,
    winRate: 0,
    profitFactor: 0,
    maxDrawdown: 0,
    avgWin: 0,
    avgLoss: 0,
    bestMonth: 0,
    worstMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('monthly')

  useEffect(() => {
    loadPerformanceData()
  }, [selectedCoin.fullSymbol, timeframe])

  const loadPerformanceData = async () => {
    try {
      setLoading(true)

      // 과거 가격 데이터 로드
      const interval = timeframe === 'daily' ? '1d' : timeframe === 'weekly' ? '1w' : '1M'
      const limit = timeframe === 'daily' ? 30 : timeframe === 'weekly' ? 12 : 12
      
      const response = await fetch(
        `/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=${interval}&limit=${limit}`
      )
      const klines = await response.json()

      if (Array.isArray(klines)) {
        // DCA 시뮬레이션 및 성과 계산
        const simulatedPerformance = simulateDCAPerformance(klines)
        setPerformanceData(simulatedPerformance)
        
        // 성과 지표 계산
        calculatePerformanceMetrics(simulatedPerformance)
      }

      setLoading(false)
    } catch (error) {
      console.error('성과 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const simulateDCAPerformance = (klines: any[]) => {
    let totalInvested = 0
    let totalCoins = 0
    const performanceData = []

    klines.forEach((kline, index) => {
      const price = parseFloat(kline[4])
      const date = new Date(kline[0])
      
      // DCA 투자 시뮬레이션
      const investmentAmount = settings.amount
      const coinsBought = investmentAmount / price
      totalInvested += investmentAmount
      totalCoins += coinsBought

      const portfolioValue = totalCoins * price
      const profitLoss = portfolioValue - totalInvested
      const profitLossPercent = (profitLoss / totalInvested) * 100

      performanceData.push({
        date: date.toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: timeframe === 'daily' ? 'numeric' : undefined,
          year: timeframe === 'monthly' ? '2-digit' : undefined
        }),
        invested: totalInvested,
        value: portfolioValue,
        profit: profitLoss,
        profitPercent: profitLossPercent,
        coins: totalCoins,
        price: price,
        monthlyReturn: index > 0 ? 
          ((portfolioValue - performanceData[index - 1].value) / performanceData[index - 1].value) * 100 : 0
      })
    })

    return performanceData
  }

  const calculatePerformanceMetrics = (data: any[]) => {
    if (data.length < 2) return

    // 수익률 계산
    const returns = data.slice(1).map((d, i) => 
      ((d.value - data[i].value) / data[i].value) * 100
    )

    // Sharpe Ratio (리스크 조정 수익률)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    )
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(12) : 0 // 연간화

    // Sortino Ratio (하방 리스크 조정 수익률)
    const negativeReturns = returns.filter(r => r < 0)
    const downstdDev = negativeReturns.length > 0 ? Math.sqrt(
      negativeReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / negativeReturns.length
    ) : 0
    const sortinoRatio = downstdDev > 0 ? (avgReturn / downstdDev) * Math.sqrt(12) : 0

    // Win Rate
    const winningMonths = returns.filter(r => r > 0).length
    const winRate = (winningMonths / returns.length) * 100

    // Profit Factor
    const totalWins = returns.filter(r => r > 0).reduce((a, b) => a + b, 0)
    const totalLosses = Math.abs(returns.filter(r => r < 0).reduce((a, b) => a + b, 0))
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins

    // Max Drawdown
    let maxDrawdown = 0
    let peak = data[0].value
    data.forEach(d => {
      if (d.value > peak) peak = d.value
      const drawdown = ((peak - d.value) / peak) * 100
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    })

    // Calmar Ratio
    const annualizedReturn = avgReturn * 12
    const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0

    // Average Win/Loss
    const wins = returns.filter(r => r > 0)
    const losses = returns.filter(r => r < 0)
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0

    // Best/Worst Month
    const bestMonth = Math.max(...returns)
    const worstMonth = Math.min(...returns)

    setMetrics({
      sharpeRatio,
      sortinoRatio,
      calmarRatio,
      winRate,
      profitFactor,
      maxDrawdown,
      avgWin,
      avgLoss: Math.abs(avgLoss),
      bestMonth,
      worstMonth
    })
  }

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'sharpe':
        return value > 1 ? 'text-green-400' : value > 0.5 ? 'text-yellow-400' : 'text-red-400'
      case 'winRate':
        return value > 60 ? 'text-green-400' : value > 40 ? 'text-yellow-400' : 'text-red-400'
      case 'profitFactor':
        return value > 1.5 ? 'text-green-400' : value > 1 ? 'text-yellow-400' : 'text-red-400'
      case 'drawdown':
        return value < 10 ? 'text-green-400' : value < 20 ? 'text-yellow-400' : 'text-red-400'
      default:
        return 'text-white'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">성과 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaTachometerAlt className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">성과 분석</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 전략 성과 분석</p>
        </div>
      </div>

      {/* 시간대 선택 */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'daily', label: '일간' },
          { id: 'weekly', label: '주간' },
          { id: 'monthly', label: '월간' }
        ].map(tf => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* 핵심 성과 지표 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaTrophy className="text-yellow-400" />
            <p className="text-xs sm:text-sm text-gray-400">샤프 비율</p>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${getMetricColor('sharpe', metrics.sharpeRatio)}`}>
            {metrics.sharpeRatio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">리스크 조정 수익</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaMedal className="text-purple-400" />
            <p className="text-xs sm:text-sm text-gray-400">승률</p>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${getMetricColor('winRate', metrics.winRate)}`}>
            {metrics.winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">수익 발생 비율</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-green-400" />
            <p className="text-xs sm:text-sm text-gray-400">수익 팩터</p>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${getMetricColor('profitFactor', metrics.profitFactor)}`}>
            {metrics.profitFactor.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">총수익/총손실</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FaArrowDown className="text-red-400" />
            <p className="text-xs sm:text-sm text-gray-400">최대 낙폭</p>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${getMetricColor('drawdown', metrics.maxDrawdown)}`}>
            -{metrics.maxDrawdown.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">최대 손실폭</p>
        </div>
      </div>

      {/* 누적 수익률 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">누적 수익률 추이</h3>
        <div className="h-64 sm:h-80">
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#E5E7EB' }}
                  formatter={(value: number, name: string) => {
                    if (name === '투자금' || name === '포트폴리오') 
                      return `$${value.toLocaleString()}`
                    return `${value.toFixed(2)}%`
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="invested"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="투자금"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="포트폴리오"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="profitPercent"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  name="수익률 %"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              데이터 로딩 중...
            </div>
          )}
        </div>
      </div>

      {/* 월별 수익률 분포 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">기간별 수익률 분포</h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#E5E7EB' }}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Bar 
                dataKey="monthlyReturn" 
                name="기간 수익률"
                fill={(data: any) => data.monthlyReturn >= 0 ? '#10B981' : '#EF4444'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 상세 성과 지표 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">리스크 지표</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">소르티노 비율</span>
              <span className="text-white font-medium">{metrics.sortinoRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">칼마 비율</span>
              <span className="text-white font-medium">{metrics.calmarRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">평균 수익</span>
              <span className="text-green-400 font-medium">+{metrics.avgWin.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">평균 손실</span>
              <span className="text-red-400 font-medium">-{metrics.avgLoss.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">극단값 분석</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">최고 수익 기간</span>
              <span className="text-green-400 font-medium">+{metrics.bestMonth.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">최대 손실 기간</span>
              <span className="text-red-400 font-medium">{metrics.worstMonth.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">연속 수익 기간</span>
              <span className="text-white font-medium">3개월</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">연속 손실 기간</span>
              <span className="text-white font-medium">1개월</span>
            </div>
          </div>
        </div>
      </div>

      {/* 성과 평가 요약 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">DCA 전략 성과 평가</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-purple-400 font-medium mb-2">강점</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              {metrics.sharpeRatio > 1 && (
                <li className="flex items-start gap-2">
                  <FaArrowUp className="text-green-400 mt-0.5" />
                  <span>우수한 리스크 조정 수익률</span>
                </li>
              )}
              {metrics.winRate > 60 && (
                <li className="flex items-start gap-2">
                  <FaArrowUp className="text-green-400 mt-0.5" />
                  <span>높은 승률 ({metrics.winRate.toFixed(1)}%)</span>
                </li>
              )}
              {metrics.maxDrawdown < 15 && (
                <li className="flex items-start gap-2">
                  <FaArrowUp className="text-green-400 mt-0.5" />
                  <span>낮은 최대 낙폭 ({metrics.maxDrawdown.toFixed(1)}%)</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <FaArrowUp className="text-green-400 mt-0.5" />
                <span>꾸준한 자산 축적 효과</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-medium mb-2">개선 포인트</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              {metrics.sharpeRatio < 0.5 && (
                <li className="flex items-start gap-2">
                  <FaArrowDown className="text-yellow-400 mt-0.5" />
                  <span>리스크 대비 수익률 개선 필요</span>
                </li>
              )}
              {metrics.winRate < 40 && (
                <li className="flex items-start gap-2">
                  <FaArrowDown className="text-yellow-400 mt-0.5" />
                  <span>승률 개선 필요</span>
                </li>
              )}
              {metrics.maxDrawdown > 20 && (
                <li className="flex items-start gap-2">
                  <FaArrowDown className="text-yellow-400 mt-0.5" />
                  <span>리스크 관리 강화 필요</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <FaArrowDown className="text-yellow-400 mt-0.5" />
                <span>투자 타이밍 최적화 고려</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">전체 성과 등급</span>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaTrophy
                    key={star}
                    className={`text-lg ${
                      star <= Math.round((metrics.sharpeRatio + metrics.profitFactor) / 0.6)
                        ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white font-medium">
                {metrics.sharpeRatio > 1 && metrics.profitFactor > 1.5 ? 'S급' :
                 metrics.sharpeRatio > 0.5 && metrics.profitFactor > 1 ? 'A급' :
                 metrics.sharpeRatio > 0 && metrics.profitFactor > 0.8 ? 'B급' : 'C급'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}