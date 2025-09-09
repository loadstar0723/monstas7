'use client'

import { useState, useEffect, useRef } from 'react'
import { FaChartLine, FaPlay, FaStop, FaRedo, FaExpand } from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'

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

interface SimulationData {
  date: string
  price: number
  investmentAmount: number
  totalInvested: number
  totalCoins: number
  portfolioValue: number
  avgBuyPrice: number
  profitLoss: number
  profitLossPercent: number
}

export default function SimulationChart({ selectedCoin, settings }: Props) {
  const [simulationData, setSimulationData] = useState<SimulationData[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [historicalPrices, setHistoricalPrices] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const simulationRef = useRef<NodeJS.Timeout | null>(null)

  // 과거 가격 데이터 로드
  useEffect(() => {
    loadHistoricalPrices()
  }, [selectedCoin.fullSymbol])

  const loadHistoricalPrices = async () => {
    try {
      setLoading(true)
      // 1년치 일일 캔들 데이터 가져오기
      const response = await fetch(
        `/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=1d&limit=365`
      )
      const data = await response.json()
      
      if (data && Array.isArray(data)) {
        const prices = data.map((candle: any) => ({
          time: candle[0],
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4])
        }))
        setHistoricalPrices(prices)
      }
      setLoading(false)
    } catch (error) {
      console.error('과거 가격 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  // 시뮬레이션 실행
  const runSimulation = () => {
    if (historicalPrices.length === 0) return

    setIsRunning(true)
    setCurrentStep(0)
    
    const results: SimulationData[] = []
    let totalInvested = 0
    let totalCoins = 0
    let currentDate = new Date(settings.startDate)
    
    // 시작 가격 (최신 가격에서 역산)
    const latestPrice = historicalPrices[historicalPrices.length - 1].close
    const startPriceIndex = Math.max(0, historicalPrices.length - 180) // 최근 6개월
    
    const simulate = () => {
      if (totalInvested >= settings.totalBudget) {
        setIsRunning(false)
        return
      }

      const priceIndex = startPriceIndex + results.length
      if (priceIndex >= historicalPrices.length) {
        setIsRunning(false)
        return
      }

      const currentPrice = historicalPrices[priceIndex].close
      
      // 투자 금액 계산 (전략에 따라)
      let investmentAmount = settings.amount
      
      if (settings.strategy === 'martingale' && results.length > 0) {
        const lastProfitPercent = results[results.length - 1].profitLossPercent
        if (lastProfitPercent < 0) {
          investmentAmount = Math.min(settings.amount * 2, settings.totalBudget - totalInvested)
        }
      } else if (settings.strategy === 'anti-martingale' && results.length > 0) {
        const lastProfitPercent = results[results.length - 1].profitLossPercent
        if (lastProfitPercent > 0) {
          investmentAmount = Math.min(settings.amount * 1.5, settings.totalBudget - totalInvested)
        }
      }

      // 코인 구매
      const coinsBought = investmentAmount / currentPrice
      totalCoins += coinsBought
      totalInvested += investmentAmount
      
      // 평균 매수가 계산
      const avgBuyPrice = totalInvested / totalCoins
      
      // 포트폴리오 가치 계산
      const portfolioValue = totalCoins * currentPrice
      const profitLoss = portfolioValue - totalInvested
      const profitLossPercent = (profitLoss / totalInvested) * 100

      results.push({
        date: currentDate.toISOString().split('T')[0],
        price: currentPrice,
        investmentAmount,
        totalInvested,
        totalCoins,
        portfolioValue,
        avgBuyPrice,
        profitLoss,
        profitLossPercent
      })

      setSimulationData([...results])

      // 손절/익절 체크
      if (profitLossPercent <= -settings.stopLoss || profitLossPercent >= settings.takeProfit) {
        setIsRunning(false)
        return
      }

      // 다음 투자일 계산
      if (settings.interval === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1)
      } else if (settings.interval === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7)
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1)
      }

      setCurrentStep(results.length)
    }

    // 시뮬레이션 시작
    simulationRef.current = setInterval(simulate, 100) // 100ms 간격으로 시뮬레이션
  }

  const stopSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
      simulationRef.current = null
    }
    setIsRunning(false)
  }

  const resetSimulation = () => {
    stopSimulation()
    setSimulationData([])
    setCurrentStep(0)
  }

  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
      }
    }
  }, [])

  const formatTooltipValue = (value: number, name: string) => {
    if (name.includes('금액') || name.includes('가치')) {
      return `$${value.toLocaleString()}`
    }
    if (name.includes('%')) {
      return `${value.toFixed(2)}%`
    }
    return value.toFixed(4)
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">과거 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaChartLine className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">시뮬레이션 차트</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 백테스트 시뮬레이션</p>
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={isRunning ? stopSimulation : runSimulation}
            disabled={historicalPrices.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isRunning ? <FaStop /> : <FaPlay />}
            {isRunning ? '중지' : '시작'}
          </button>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            <FaRedo />
            리셋
          </button>
          <div className="flex-1 flex items-center justify-end">
            <span className="text-sm text-gray-400">
              진행: {currentStep} / {Math.floor(settings.totalBudget / settings.amount)} 회
            </span>
          </div>
        </div>
      </div>

      {/* 실시간 지표 */}
      {simulationData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">총 투자금</p>
            <p className="text-base sm:text-xl font-bold text-white">
              ${simulationData[simulationData.length - 1].totalInvested.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">포트폴리오 가치</p>
            <p className="text-base sm:text-xl font-bold text-purple-400">
              ${simulationData[simulationData.length - 1].portfolioValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">손익</p>
            <p className={`text-base sm:text-xl font-bold ${
              simulationData[simulationData.length - 1].profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${simulationData[simulationData.length - 1].profitLoss.toLocaleString()}
              <span className="text-xs sm:text-sm ml-1">
                ({simulationData[simulationData.length - 1].profitLossPercent.toFixed(2)}%)
              </span>
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
            <p className="text-xs sm:text-sm text-gray-400 mb-1">평균 매수가</p>
            <p className="text-base sm:text-xl font-bold text-blue-400">
              ${simulationData[simulationData.length - 1].avgBuyPrice.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* 차트 영역 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">포트폴리오 성과</h3>
        <div className="h-64 sm:h-80">
          {simulationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#E5E7EB' }}
                  formatter={formatTooltipValue}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalInvested"
                  stackId="stack1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  name="총 투자금"
                />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stackId="stack2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                  name="포트폴리오 가치"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              시뮬레이션을 시작하여 결과를 확인하세요
            </div>
          )}
        </div>
      </div>

      {/* 수익률 차트 */}
      {simulationData.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">수익률 추이</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
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
                <Line
                  type="monotone"
                  dataKey="profitLossPercent"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                  name="수익률 %"
                />
                {/* 손절선 */}
                <Line
                  type="monotone"
                  dataKey={() => -settings.stopLoss}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name="손절선"
                />
                {/* 익절선 */}
                <Line
                  type="monotone"
                  dataKey={() => settings.takeProfit}
                  stroke="#10B981"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name="익절선"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}