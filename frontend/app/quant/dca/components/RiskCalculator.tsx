'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaCalculator, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

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

interface RiskMetrics {
  volatilityRisk: number
  liquidityRisk: number
  drawdownRisk: number
  strategyRisk: number
  durationRisk: number
  overallRisk: number
}

export default function RiskCalculator({ selectedCoin, settings }: Props) {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    volatilityRisk: 0,
    liquidityRisk: 0,
    drawdownRisk: 0,
    strategyRisk: 0,
    durationRisk: 0,
    overallRisk: 0
  })
  const [marketData, setMarketData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMarketData()
  }, [selectedCoin.fullSymbol])

  useEffect(() => {
    if (marketData) {
      calculateRiskMetrics()
    }
  }, [marketData, settings])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      
      // 현재 가격 정보
      const tickerResponse = await fetch(`/api/binance/ticker?symbol=${selectedCoin.fullSymbol}`)
      const tickerData = await tickerResponse.json()
      
      // 과거 가격 데이터
      const klinesResponse = await fetch(
        `/api/binance/klines?symbol=${selectedCoin.fullSymbol}&interval=1d&limit=90`
      )
      const klinesData = await klinesResponse.json()

      if (Array.isArray(tickerData) && tickerData.length > 0 && Array.isArray(klinesData)) {
        setMarketData({
          ticker: tickerData[0],
          klines: klinesData
        })
      }
      
      setLoading(false)
    } catch (error) {
      console.error('시장 데이터 로드 실패:', error)
      setLoading(false)
    }
  }

  const calculateRiskMetrics = () => {
    if (!marketData) return

    const prices = marketData.klines.map((k: any) => parseFloat(k[4]))
    const volume24h = parseFloat(marketData.ticker.quoteVolume)
    
    // 1. 변동성 리스크 계산
    const volatility = calculateVolatility(prices)
    const volatilityRisk = Math.min(100, volatility * 5) // 0-100 스케일

    // 2. 유동성 리스크 계산
    const liquidityRisk = calculateLiquidityRisk(volume24h)

    // 3. 최대 낙폭 리스크 계산
    const maxDrawdown = calculateMaxDrawdown(prices)
    const drawdownRisk = Math.min(100, maxDrawdown)

    // 4. 전략 리스크 계산
    const strategyRisk = calculateStrategyRisk(settings.strategy)

    // 5. 투자 기간 리스크 계산
    const durationRisk = calculateDurationRisk(settings)

    // 전체 리스크 점수
    const overallRisk = (
      volatilityRisk * 0.25 +
      liquidityRisk * 0.20 +
      drawdownRisk * 0.25 +
      strategyRisk * 0.15 +
      durationRisk * 0.15
    )

    setRiskMetrics({
      volatilityRisk,
      liquidityRisk,
      drawdownRisk,
      strategyRisk,
      durationRisk,
      overallRisk
    })
  }

  const calculateVolatility = (prices: number[]) => {
    if (prices.length < 2) return 0
    
    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
    }
    
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avg, 2), 0) / returns.length
    return Math.sqrt(variance * 252) * 100 // 연간 변동성
  }

  const calculateLiquidityRisk = (volume24h: number) => {
    // 거래량이 많을수록 리스크가 낮음
    if (volume24h > 1000000000) return 10  // 10억 USDT 이상
    if (volume24h > 500000000) return 20   // 5억 USDT
    if (volume24h > 100000000) return 30   // 1억 USDT
    if (volume24h > 50000000) return 40    // 5천만 USDT
    if (volume24h > 10000000) return 60    // 1천만 USDT
    return 80
  }

  const calculateMaxDrawdown = (prices: number[]) => {
    let maxDrawdown = 0
    let peak = prices[0]

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > peak) {
        peak = prices[i]
      }
      const drawdown = ((peak - prices[i]) / peak) * 100
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    return maxDrawdown
  }

  const calculateStrategyRisk = (strategy: string) => {
    switch (strategy) {
      case 'standard': return 20
      case 'value-averaging': return 30
      case 'anti-martingale': return 40
      case 'martingale': return 80
      default: return 50
    }
  }

  const calculateDurationRisk = (settings: DCASettings) => {
    const totalInvestments = Math.floor(settings.totalBudget / settings.amount)
    const intervalDays = settings.interval === 'daily' ? 1 : 
                        settings.interval === 'weekly' ? 7 : 30
    const totalDays = totalInvestments * intervalDays

    if (totalDays < 90) return 60    // 3개월 미만
    if (totalDays < 180) return 40   // 6개월 미만
    if (totalDays < 365) return 30   // 1년 미만
    return 20                         // 1년 이상
  }

  const getRiskLevel = (score: number) => {
    if (score < 25) return { level: '낮음', color: 'text-green-400', bgColor: 'bg-green-500/20' }
    if (score < 50) return { level: '보통', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
    if (score < 75) return { level: '높음', color: 'text-orange-400', bgColor: 'bg-orange-500/20' }
    return { level: '매우 높음', color: 'text-red-400', bgColor: 'bg-red-500/20' }
  }

  const overallRiskLevel = getRiskLevel(riskMetrics.overallRisk)

  // 레이더 차트 데이터
  const radarData = [
    { subject: '변동성', value: riskMetrics.volatilityRisk, fullMark: 100 },
    { subject: '유동성', value: riskMetrics.liquidityRisk, fullMark: 100 },
    { subject: '낙폭', value: riskMetrics.drawdownRisk, fullMark: 100 },
    { subject: '전략', value: riskMetrics.strategyRisk, fullMark: 100 },
    { subject: '기간', value: riskMetrics.durationRisk, fullMark: 100 }
  ]

  // 리스크 시나리오 데이터
  const scenarios = [
    {
      name: '최상의 시나리오',
      return: settings.takeProfit,
      probability: 25,
      color: 'text-green-400'
    },
    {
      name: '정상 시나리오',
      return: settings.takeProfit * 0.5,
      probability: 50,
      color: 'text-blue-400'
    },
    {
      name: '하락 시나리오',
      return: -settings.stopLoss * 0.5,
      probability: 20,
      color: 'text-yellow-400'
    },
    {
      name: '최악의 시나리오',
      return: -settings.stopLoss,
      probability: 5,
      color: 'text-red-400'
    }
  ]

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-6 border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">리스크 분석 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaCalculator className={`text-lg sm:text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">리스크 계산기</h2>
          <p className="text-sm sm:text-base text-gray-400">{selectedCoin.name} DCA 리스크 분석</p>
        </div>
      </div>

      {/* 전체 리스크 점수 */}
      <div className={`${overallRiskLevel.bgColor} border ${
        riskMetrics.overallRisk < 25 ? 'border-green-500' :
        riskMetrics.overallRisk < 50 ? 'border-yellow-500' :
        riskMetrics.overallRisk < 75 ? 'border-orange-500' : 'border-red-500'
      } rounded-lg sm:rounded-xl p-4 sm:p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">전체 리스크 평가</h3>
          <FaShieldAlt className={`text-2xl ${overallRiskLevel.color}`} />
        </div>
        
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <p className="text-gray-300 mb-2">리스크 점수</p>
            <p className={`text-3xl sm:text-5xl font-bold ${overallRiskLevel.color}`}>
              {safeFixed(riskMetrics.overallRisk, 0)}
            </p>
            <p className={`text-lg sm:text-xl font-medium ${overallRiskLevel.color} mt-1`}>
              {overallRiskLevel.level}
            </p>
          </div>
          
          <div className="flex-1">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${
                  riskMetrics.overallRisk < 25 ? 'bg-green-400' :
                  riskMetrics.overallRisk < 50 ? 'bg-yellow-400' :
                  riskMetrics.overallRisk < 75 ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${riskMetrics.overallRisk}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 리스크 요소별 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 레이더 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">리스크 요소 분석</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  stroke="#9CA3AF"
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                />
                <Radar 
                  name="리스크" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 리스크 상세 정보 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">리스크 요소 상세</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">변동성 리스크</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getRiskLevel(riskMetrics.volatilityRisk).color}`}>
                  {safeFixed(riskMetrics.volatilityRisk, 0)}%
                </span>
                {riskMetrics.volatilityRisk < 50 ? 
                  <FaCheckCircle className="text-green-400" /> : 
                  <FaExclamationTriangle className="text-yellow-400" />
                }
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">유동성 리스크</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getRiskLevel(riskMetrics.liquidityRisk).color}`}>
                  {safeFixed(riskMetrics.liquidityRisk, 0)}%
                </span>
                {riskMetrics.liquidityRisk < 50 ? 
                  <FaCheckCircle className="text-green-400" /> : 
                  <FaExclamationTriangle className="text-yellow-400" />
                }
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">최대낙폭 리스크</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getRiskLevel(riskMetrics.drawdownRisk).color}`}>
                  {safeFixed(riskMetrics.drawdownRisk, 0)}%
                </span>
                {riskMetrics.drawdownRisk < 50 ? 
                  <FaCheckCircle className="text-green-400" /> : 
                  <FaTimesCircle className="text-red-400" />
                }
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">전략 리스크</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getRiskLevel(riskMetrics.strategyRisk).color}`}>
                  {safeFixed(riskMetrics.strategyRisk, 0)}%
                </span>
                {riskMetrics.strategyRisk < 50 ? 
                  <FaCheckCircle className="text-green-400" /> : 
                  <FaExclamationTriangle className="text-yellow-400" />
                }
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <span className="text-sm text-gray-300">투자기간 리스크</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getRiskLevel(riskMetrics.durationRisk).color}`}>
                  {safeFixed(riskMetrics.durationRisk, 0)}%
                </span>
                {riskMetrics.durationRisk < 50 ? 
                  <FaCheckCircle className="text-green-400" /> : 
                  <FaExclamationTriangle className="text-yellow-400" />
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시나리오 분석 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-700">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">수익률 시나리오</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((scenario) => (
            <div key={scenario.name} className="bg-gray-700/50 rounded-lg p-3 sm:p-4">
              <h4 className={`font-medium mb-2 ${scenario.color}`}>{scenario.name}</h4>
              <p className={`text-xl sm:text-2xl font-bold mb-1 ${scenario.color}`}>
                {scenario.return >= 0 ? '+' : ''}{scenario.return}%
              </p>
              <p className="text-xs text-gray-400">확률: {scenario.probability}%</p>
              <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    scenario.return >= 0 ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${scenario.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 리스크 관리 추천 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-600/30">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">리스크 관리 추천</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-purple-400 font-medium mb-2">현재 리스크 상태</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>전체 리스크 수준: {overallRiskLevel.level}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>
                  주요 리스크 요인: {
                    riskMetrics.volatilityRisk > 50 ? '높은 변동성' :
                    riskMetrics.liquidityRisk > 50 ? '낮은 유동성' :
                    riskMetrics.drawdownRisk > 50 ? '큰 낙폭 가능성' : '전략 리스크'
                  }
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>예상 최대 손실: -{settings.stopLoss}%</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-medium mb-2">리스크 관리 방안</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-300">
              {riskMetrics.overallRisk > 50 && (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>투자 금액 축소 고려</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>손절 라인 상향 조정</span>
                  </li>
                </>
              )}
              {riskMetrics.volatilityRisk > 60 && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>투자 주기 늘리기 (일간 → 주간)</span>
                </li>
              )}
              {riskMetrics.strategyRisk > 60 && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>보수적인 전략으로 변경</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>포트폴리오 분산 투자</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>정기적인 리스크 재평가</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-xs text-gray-400 text-center">
            ⚠️ 이 분석은 과거 데이터를 기반으로 하며, 미래 수익을 보장하지 않습니다. 
            투자 결정 시 본인의 재무 상황과 리스크 감수 능력을 고려하세요.
          </p>
        </div>
      </div>
    </div>
  )
}