'use client'

import { useState, useEffect } from 'react'
import { FaHistory, FaChartPie, FaCalendarAlt, FaExchangeAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts'

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

interface BacktestPeriod {
  period: string
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
  bestMonth: number
  worstMonth: number
  totalTrades: number
}

interface MarketConditionResult {
  condition: string
  avgReturn: number
  winRate: number
  count: number
  color: string
}

export default function BacktestResults({ selectedCoin, settings }: Props) {
  const [backtestData, setBacktestData] = useState<BacktestPeriod[]>([])
  const [marketConditions, setMarketConditions] = useState<MarketConditionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  useEffect(() => {
    performBacktest()
  }, [selectedCoin.fullSymbol, settings])

  const performBacktest = async () => {
    try {
      setLoading(true)

      // 과거 2년치 데이터 로드
      const response = await fetch(
        `/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=1d&limit=730`
      )
      const klines = await response.json()

      if (Array.isArray(klines)) {
        // 다양한 기간에 대한 백테스트 수행
        const periods = [
          { name: '최근 3개월', days: 90 },
          { name: '최근 6개월', days: 180 },
          { name: '최근 1년', days: 365 },
          { name: '전체 기간', days: klines.length }
        ]

        const results = periods.map(period => {
          const periodData = klines.slice(-period.days)
          return calculateBacktestResults(periodData, period.name)
        })

        setBacktestData(results)

        // 시장 상황별 분석
        const conditions = analyzeMarketConditions(klines)
        setMarketConditions(conditions)
      }

      setLoading(false)
    } catch (error) {
      console.error('백테스트 실패:', error)
      setLoading(false)
    }
  }

  const calculateBacktestResults = (klines: any[], periodName: string): BacktestPeriod => {
    const prices = klines.map((k: any) => parseFloat(k[4]))
    let totalInvested = 0
    let totalCoins = 0
    const returns: number[] = []
    let trades = 0

    // DCA 시뮬레이션
    const intervalDays = settings.interval === 'daily' ? 1 : 
                        settings.interval === 'weekly' ? 7 : 30

    for (let i = 0; i < prices.length; i += intervalDays) {
      if (totalInvested >= settings.totalBudget) break

      const price = prices[i]
      const investAmount = Math.min(settings.amount, settings.totalBudget - totalInvested)
      const coinsBought = investAmount / price
      
      totalInvested += investAmount
      totalCoins += coinsBought
      trades++

      if (i > 0) {
        const currentValue = totalCoins * prices[i]
        const previousValue = totalCoins * prices[i - intervalDays]
        const periodReturn = ((currentValue - previousValue) / previousValue) * 100
        returns.push(periodReturn)
      }
    }

    const finalValue = totalCoins * prices[prices.length - 1]
    const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100
    const annualizedReturn = totalReturn * (365 / prices.length)

    // Sharpe Ratio 계산
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0
    const stdDev = Math.sqrt(
      returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    ) || 1
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252 / intervalDays)

    // Max Drawdown 계산
    let maxDrawdown = 0
    let peak = prices[0]
    for (const price of prices) {
      if (price > peak) peak = price
      const drawdown = ((peak - price) / peak) * 100
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    }

    // Win Rate
    const winningReturns = returns.filter(r => r > 0).length
    const winRate = (winningReturns / returns.length) * 100 || 0

    // Best/Worst Month
    const monthlyReturns = []
    for (let i = 0; i < returns.length; i += 30) {
      const monthReturns = returns.slice(i, i + 30)
      if (monthReturns.length > 0) {
        monthlyReturns.push(monthReturns.reduce((a, b) => a + b, 0))
      }
    }
    const bestMonth = Math.max(...monthlyReturns, 0)
    const worstMonth = Math.min(...monthlyReturns, 0)

    return {
      period: periodName,
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      bestMonth,
      worstMonth,
      totalTrades: trades
    }
  }

  const analyzeMarketConditions = (klines: any[]): MarketConditionResult[] => {
    const prices = klines.map((k: any) => parseFloat(k[4]))
    
    // RSI 계산
    const rsiValues = []
    for (let i = 14; i < prices.length; i++) {
      const gains = []
      const losses = []
      
      for (let j = 1; j <= 14; j++) {
        const change = prices[i - j + 1] - prices[i - j]
        if (change > 0) gains.push(change)
        else losses.push(-change)
      }
      
      const avgGain = gains.reduce((a, b) => a + b, 0) / 14 || 0.001
      const avgLoss = losses.reduce((a, b) => a + b, 0) / 14 || 0.001
      const rs = avgGain / avgLoss
      const rsi = 100 - (100 / (1 + rs))
      rsiValues.push(rsi)
    }

    // 시장 상황 분류 및 DCA 성과 분석
    const conditions = [
      { name: '극도의 과매도', range: [0, 30], returns: [], color: '#10B981' },
      { name: '과매도', range: [30, 40], returns: [], color: '#34D399' },
      { name: '중립', range: [40, 60], returns: [], color: '#60A5FA' },
      { name: '과매수', range: [60, 70], returns: [], color: '#F59E0B' },
      { name: '극도의 과매수', range: [70, 100], returns: [], color: '#EF4444' }
    ]

    // 각 시장 상황에서의 DCA 수익률 계산
    const intervalDays = settings.interval === 'daily' ? 1 : 
                        settings.interval === 'weekly' ? 7 : 30

    for (let i = 14; i < prices.length - intervalDays; i += intervalDays) {
      const rsi = rsiValues[i - 14]
      const buyPrice = prices[i]
      const sellPrice = prices[i + intervalDays]
      const returns = ((sellPrice - buyPrice) / buyPrice) * 100

      for (const condition of conditions) {
        if (rsi >= condition.range[0] && rsi < condition.range[1]) {
          condition.returns.push(returns)
          break
        }
      }
    }

    return conditions.map(condition => ({
      condition: condition.name,
      avgReturn: condition.returns.length > 0 
        ? condition.returns.reduce((a, b) => a + b, 0) / condition.returns.length 
        : 0,
      winRate: condition.returns.length > 0
        ? (condition.returns.filter(r => r > 0).length / condition.returns.length) * 100
        : 0,
      count: condition.returns.length,
      color: condition.color
    }))
  }

  const selectedData = backtestData.find(d => 
    selectedPeriod === 'all' ? d.period === '전체 기간' : d.period === selectedPeriod
  ) || backtestData[0]

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">백테스트 수행 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaHistory className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">백테스트 결과</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 전략 과거 성과 분석</p>
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="flex gap-2 overflow-x-auto">
        {backtestData.map(data => (
          <button
            key={data.period}
            onClick={() => setSelectedPeriod(data.period === '전체 기간' ? 'all' : data.period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              (selectedPeriod === 'all' && data.period === '전체 기간') || selectedPeriod === data.period
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {data.period}
          </button>
        ))}
      </div>

      {/* 핵심 성과 지표 */}
      {selectedData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">총 수익률</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              selectedData.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedData.totalReturn >= 0 ? '+' : ''}{selectedData.totalReturn.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400">연환산 {selectedData.annualizedReturn.toFixed(2)}%</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">샤프 비율</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              selectedData.sharpeRatio > 1 ? 'text-green-400' : 
              selectedData.sharpeRatio > 0.5 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {selectedData.sharpeRatio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">위험 조정 수익</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">승률</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              selectedData.winRate > 60 ? 'text-green-400' : 
              selectedData.winRate > 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {selectedData.winRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">{selectedData.totalTrades}회 거래</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">최대 낙폭</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              selectedData.maxDrawdown < 15 ? 'text-green-400' : 
              selectedData.maxDrawdown < 25 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              -{selectedData.maxDrawdown.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">최대 손실</p>
          </div>
        </div>
      )}

      {/* 기간별 성과 비교 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">기간별 성과 비교</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={backtestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="period" 
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
                formatter={(value: number, name: string) => {
                  if (name === '수익률') return `${value.toFixed(2)}%`
                  if (name === '샤프비율') return value.toFixed(2)
                  return value
                }}
              />
              <Bar 
                dataKey="totalReturn" 
                name="수익률"
                fill="#8B5CF6"
              />
              <Bar 
                dataKey="sharpeRatio" 
                name="샤프비율"
                fill="#10B981"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시장 상황별 성과 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">시장 상황별 DCA 성과</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="number"
                dataKey="avgReturn" 
                name="평균 수익률"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <YAxis 
                type="number"
                dataKey="winRate" 
                name="승률"
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === '평균 수익률') return `${value.toFixed(2)}%`
                  if (name === '승률') return `${value.toFixed(1)}%`
                  return value
                }}
              />
              <Scatter 
                name="시장 상황"
                data={marketConditions} 
                fill="#8B5CF6"
              >
                {marketConditions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
          {marketConditions.map((condition, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: condition.color }}
              />
              <p className="text-xs text-gray-400">{condition.condition}</p>
              <p className="text-xs text-white">{condition.count}회</p>
            </div>
          ))}
        </div>
      </div>

      {/* 월별 최고/최저 성과 */}
      {selectedData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg p-4 border border-green-600/30">
            <div className="flex items-center gap-2 mb-2">
              <FaArrowUp className="text-green-400" />
              <h4 className="font-medium text-white">최고 월간 성과</h4>
            </div>
            <p className="text-2xl font-bold text-green-400">
              +{selectedData.bestMonth.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-300 mt-1">
              한 달 최대 수익률
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg p-4 border border-red-600/30">
            <div className="flex items-center gap-2 mb-2">
              <FaArrowDown className="text-red-400" />
              <h4 className="font-medium text-white">최저 월간 성과</h4>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {selectedData.worstMonth.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-300 mt-1">
              한 달 최대 손실률
            </p>
          </div>
        </div>
      )}

      {/* 백테스트 요약 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">백테스트 인사이트</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-purple-400 font-medium mb-2">성공 요인</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              {selectedData && selectedData.winRate > 50 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>높은 승률 ({selectedData.winRate.toFixed(1)}%)</span>
                </li>
              )}
              {selectedData && selectedData.sharpeRatio > 1 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>우수한 위험 조정 수익률</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>일관된 투자로 평균 단가 하락</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>감정 배제된 기계적 투자</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-medium mb-2">주의사항</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">!</span>
                <span>과거 성과가 미래를 보장하지 않음</span>
              </li>
              {selectedData && selectedData.maxDrawdown > 20 && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">!</span>
                  <span>높은 최대 낙폭 주의 필요</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">!</span>
                <span>시장 상황 변화 모니터링 필요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">!</span>
                <span>적절한 자금 관리 필수</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}