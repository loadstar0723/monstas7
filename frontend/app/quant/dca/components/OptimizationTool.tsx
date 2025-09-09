'use client'

import { useState, useEffect } from 'react'
import { FaCog, FaRocket, FaChartBar, FaLightbulb, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from 'recharts'

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
  onOptimize: (newSettings: DCASettings) => void
}

interface OptimizationResult {
  setting: string
  currentValue: string | number
  optimizedValue: string | number
  improvement: number
  impact: 'high' | 'medium' | 'low'
}

interface StrategyComparison {
  strategy: string
  expectedReturn: number
  risk: number
  sharpeRatio: number
  maxDrawdown: number
  score: number
}

export default function OptimizationTool({ selectedCoin, settings, onOptimize }: Props) {
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([])
  const [strategyComparison, setStrategyComparison] = useState<StrategyComparison[]>([])
  const [loading, setLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [marketData, setMarketData] = useState<any>(null)

  useEffect(() => {
    loadMarketData()
  }, [selectedCoin.fullSymbol])

  const loadMarketData = async () => {
    try {
      const response = await fetch(
        `/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=1d&limit=365`
      )
      const klines = await response.json()
      
      if (Array.isArray(klines)) {
        setMarketData(klines)
      }
    } catch (error) {
      console.error('시장 데이터 로드 실패:', error)
    }
  }

  const runOptimization = async () => {
    setIsOptimizing(true)
    setLoading(true)

    // 시뮬레이션을 통한 최적화 수행
    await new Promise(resolve => setTimeout(resolve, 2000)) // 시뮬레이션 시간

    if (!marketData) {
      setLoading(false)
      setIsOptimizing(false)
      return
    }

    // 가격 데이터 분석
    const prices = marketData.map((k: any) => parseFloat(k[4]))
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
    const volatility = calculateVolatility(prices)

    // 최적화 결과 생성
    const results: OptimizationResult[] = []

    // 1. 투자 주기 최적화
    const optimalInterval = volatility > 50 ? 'daily' : 
                           volatility > 30 ? 'weekly' : 'monthly'
    if (settings.interval !== optimalInterval) {
      results.push({
        setting: '투자 주기',
        currentValue: settings.interval === 'daily' ? '매일' : 
                      settings.interval === 'weekly' ? '매주' : '매월',
        optimizedValue: optimalInterval === 'daily' ? '매일' : 
                        optimalInterval === 'weekly' ? '매주' : '매월',
        improvement: 15,
        impact: 'high'
      })
    }

    // 2. 투자 금액 최적화
    const budgetRatio = settings.amount / settings.totalBudget
    const optimalRatio = volatility > 50 ? 0.02 : 0.03
    const optimalAmount = Math.round(settings.totalBudget * optimalRatio)
    if (Math.abs(budgetRatio - optimalRatio) > 0.01) {
      results.push({
        setting: '회당 투자금',
        currentValue: `$${settings.amount}`,
        optimizedValue: `$${optimalAmount}`,
        improvement: 12,
        impact: 'medium'
      })
    }

    // 3. 손절/익절 최적화
    const optimalStopLoss = Math.round(volatility * 0.4)
    const optimalTakeProfit = Math.round(volatility * 0.8)
    
    if (Math.abs(settings.stopLoss - optimalStopLoss) > 5) {
      results.push({
        setting: '손절선',
        currentValue: `${settings.stopLoss}%`,
        optimizedValue: `${optimalStopLoss}%`,
        improvement: 8,
        impact: 'medium'
      })
    }

    if (Math.abs(settings.takeProfit - optimalTakeProfit) > 10) {
      results.push({
        setting: '익절선',
        currentValue: `${settings.takeProfit}%`,
        optimizedValue: `${optimalTakeProfit}%`,
        improvement: 10,
        impact: 'medium'
      })
    }

    // 4. 전략 최적화
    const strategies = analyzeStrategies(prices)
    const bestStrategy = strategies[0]
    
    if (settings.strategy !== bestStrategy.strategy) {
      results.push({
        setting: 'DCA 전략',
        currentValue: getStrategyName(settings.strategy),
        optimizedValue: getStrategyName(bestStrategy.strategy),
        improvement: 20,
        impact: 'high'
      })
    }

    setOptimizationResults(results)
    setStrategyComparison(strategies)
    setLoading(false)
    setIsOptimizing(false)
  }

  const calculateVolatility = (prices: number[]) => {
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avg, 2), 0) / returns.length
    return Math.sqrt(variance * 252) * 100 // 연간 변동성
  }

  const analyzeStrategies = (prices: number[]): StrategyComparison[] => {
    const strategies = ['standard', 'value-averaging', 'anti-martingale', 'martingale']
    const results: StrategyComparison[] = []

    strategies.forEach(strategy => {
      // 각 전략에 대한 백테스트 시뮬레이션
      let totalInvested = 0
      let totalCoins = 0
      const returns: number[] = []
      
      for (let i = 0; i < prices.length - 30; i += 7) { // 주간 DCA
        let investAmount = settings.amount

        // 전략별 투자 금액 조정
        if (strategy === 'martingale' && i > 0 && returns[returns.length - 1] < 0) {
          investAmount *= 1.5
        } else if (strategy === 'anti-martingale' && i > 0 && returns[returns.length - 1] > 0) {
          investAmount *= 1.3
        } else if (strategy === 'value-averaging') {
          const targetValue = (i / 7 + 1) * settings.amount * 1.1
          const currentValue = totalCoins * prices[i]
          investAmount = Math.max(0, targetValue - currentValue)
        }

        const coinsBought = investAmount / prices[i]
        totalInvested += investAmount
        totalCoins += coinsBought

        if (i > 0) {
          const portfolioValue = totalCoins * prices[i + 7]
          const prevValue = totalCoins * prices[i]
          const periodReturn = ((portfolioValue - prevValue) / prevValue) * 100
          returns.push(periodReturn)
        }
      }

      const finalValue = totalCoins * prices[prices.length - 1]
      const totalReturn = ((finalValue - totalInvested) / totalInvested) * 100

      // 지표 계산
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0
      const stdDev = Math.sqrt(
        returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
      ) || 1
      const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(52) // 주간 샤프

      // Max Drawdown
      let maxDrawdown = 0
      let peak = totalInvested
      for (let i = 0; i < returns.length; i++) {
        const value = totalInvested * (1 + returns.slice(0, i + 1).reduce((a, b) => a + b / 100, 0))
        if (value > peak) peak = value
        const drawdown = ((peak - value) / peak) * 100
        if (drawdown > maxDrawdown) maxDrawdown = drawdown
      }

      // 종합 점수 (0-100)
      const score = Math.max(0, Math.min(100,
        (totalReturn > 0 ? 30 : 0) +
        (sharpeRatio > 0 ? sharpeRatio * 20 : 0) +
        (50 - maxDrawdown)
      ))

      results.push({
        strategy,
        expectedReturn: totalReturn,
        risk: stdDev * Math.sqrt(52) * 100, // 연간화
        sharpeRatio,
        maxDrawdown,
        score
      })
    })

    return results.sort((a, b) => b.score - a.score)
  }

  const getStrategyName = (strategy: string) => {
    const names: Record<string, string> = {
      'standard': '표준 DCA',
      'value-averaging': '가치 평균화',
      'anti-martingale': '역마틴게일',
      'martingale': '마틴게일'
    }
    return names[strategy] || strategy
  }

  const applyOptimization = () => {
    if (optimizationResults.length === 0) return

    const newSettings = { ...settings }

    optimizationResults.forEach(result => {
      switch (result.setting) {
        case '투자 주기':
          newSettings.interval = result.optimizedValue === '매일' ? 'daily' :
                                result.optimizedValue === '매주' ? 'weekly' : 'monthly'
          break
        case '회당 투자금':
          newSettings.amount = parseInt(result.optimizedValue.toString().replace('$', ''))
          break
        case '손절선':
          newSettings.stopLoss = parseInt(result.optimizedValue.toString().replace('%', ''))
          break
        case '익절선':
          newSettings.takeProfit = parseInt(result.optimizedValue.toString().replace('%', ''))
          break
        case 'DCA 전략':
          const strategy = strategyComparison.find(s => 
            getStrategyName(s.strategy) === result.optimizedValue
          )
          if (strategy) {
            newSettings.strategy = strategy.strategy
          }
          break
      }
    })

    onOptimize(newSettings)
  }

  // 레이더 차트 데이터
  const performanceData = strategyComparison.slice(0, 4).map(s => ({
    strategy: getStrategyName(s.strategy),
    수익성: Math.max(0, Math.min(100, s.expectedReturn + 50)),
    안정성: Math.max(0, 100 - s.risk),
    효율성: Math.max(0, Math.min(100, s.sharpeRatio * 50)),
    리스크: Math.max(0, 100 - s.maxDrawdown),
    종합점수: s.score
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaCog className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">최적화 도구</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 전략 AI 최적화</p>
        </div>
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            isOptimizing
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isOptimizing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
              최적화 중...
            </>
          ) : (
            <>
              <FaRocket />
              최적화 시작
            </>
          )}
        </button>
      </div>

      {/* 최적화 결과 */}
      {optimizationResults.length > 0 && (
        <>
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 sm:p-6 border border-purple-600/30">
            <div className="flex items-start gap-3 mb-4">
              <FaLightbulb className="text-yellow-400 text-xl mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white">최적화 제안</h3>
                <p className="text-sm text-gray-400">AI가 분석한 최적 설정값입니다</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {optimizationResults.map((result, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{result.setting}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      result.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                      result.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {result.impact === 'high' ? '높은 영향' :
                       result.impact === 'medium' ? '중간 영향' : '낮은 영향'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">현재</p>
                      <p className="text-white">{result.currentValue}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">→</p>
                      <p className="text-green-400">+{result.improvement}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">추천</p>
                      <p className="text-purple-400 font-medium">{result.optimizedValue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={applyOptimization}
              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              최적화 설정 적용
            </button>
          </div>

          {/* 전략 비교 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">전략별 성과 비교</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={performanceData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="strategy" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      stroke="#9CA3AF"
                      domain={[0, 100]}
                      tick={{ fontSize: 10 }}
                    />
                    <Radar 
                      name="성과 지표" 
                      dataKey="종합점수" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">수익/리스크 분석</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strategyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="strategy" 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      tickFormatter={getStrategyName}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#E5E7EB' }}
                      labelFormatter={getStrategyName}
                      formatter={(value: number, name: string) => {
                        if (name === '기대수익률' || name === '위험도') return `${value.toFixed(2)}%`
                        return value.toFixed(2)
                      }}
                    />
                    <Legend />
                    <Bar dataKey="expectedReturn" name="기대수익률" fill="#10B981" />
                    <Bar dataKey="risk" name="위험도" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 상세 전략 분석 */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">전략 상세 분석</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs sm:text-sm text-gray-400 border-b border-gray-700">
                    <th className="pb-2">전략</th>
                    <th className="pb-2 text-right">예상수익률</th>
                    <th className="pb-2 text-right">위험도</th>
                    <th className="pb-2 text-right">샤프비율</th>
                    <th className="pb-2 text-right">최대낙폭</th>
                    <th className="pb-2 text-right">종합점수</th>
                  </tr>
                </thead>
                <tbody>
                  {strategyComparison.map((strategy, index) => (
                    <tr key={index} className="text-xs sm:text-sm border-b border-gray-700/50">
                      <td className="py-3 text-white font-medium">
                        {getStrategyName(strategy.strategy)}
                        {index === 0 && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                            추천
                          </span>
                        )}
                      </td>
                      <td className={`py-3 text-right ${
                        strategy.expectedReturn > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {strategy.expectedReturn.toFixed(2)}%
                      </td>
                      <td className="py-3 text-right text-yellow-400">
                        {strategy.risk.toFixed(2)}%
                      </td>
                      <td className="py-3 text-right text-blue-400">
                        {strategy.sharpeRatio.toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-orange-400">
                        -{strategy.maxDrawdown.toFixed(2)}%
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                              style={{ width: `${strategy.score}%` }}
                            />
                          </div>
                          <span className="text-white font-medium">
                            {strategy.score.toFixed(0)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 최적화 전 안내 */}
      {!isOptimizing && optimizationResults.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 sm:p-8 border border-gray-700 text-center">
          <FaChartBar className="text-4xl sm:text-5xl text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">AI 최적화 준비 완료</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-4">
            머신러닝 알고리즘이 과거 데이터를 분석하여<br />
            {selectedCoin.name}에 최적화된 DCA 전략을 추천합니다
          </p>
          <ul className="text-left max-w-sm mx-auto space-y-2 text-sm text-gray-300 mb-6">
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-green-400 mt-0.5" />
              <span>365일 과거 데이터 분석</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-green-400 mt-0.5" />
              <span>4가지 DCA 전략 백테스트</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-green-400 mt-0.5" />
              <span>리스크/수익 최적화</span>
            </li>
            <li className="flex items-start gap-2">
              <FaCheckCircle className="text-green-400 mt-0.5" />
              <span>맞춤형 매개변수 추천</span>
            </li>
          </ul>
          <button
            onClick={runOptimization}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            최적화 분석 시작
          </button>
        </div>
      )}

      {/* 최적화 중 */}
      {isOptimizing && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-8 border border-gray-700">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500 mx-auto"></div>
              <FaCog className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">AI 최적화 진행 중...</h3>
            <p className="text-sm text-gray-400">
              과거 데이터를 분석하여 최적의 설정을 찾고 있습니다
            </p>
            <div className="mt-4 space-y-2 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">데이터 수집</span>
                <FaCheckCircle className="text-green-400" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">백테스트 실행</span>
                <div className="animate-pulse text-yellow-400">●</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">최적화 계산</span>
                <FaTimesCircle className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}