'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaHistory, FaTachometerAlt, FaExclamationTriangle } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts'

interface Props {
  portfolio: any
}

export default function PortfolioAnalytics({ portfolio }: Props) {
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([])
  const [riskMetrics, setRiskMetrics] = useState<any>(null)
  const [performanceAttribution, setPerformanceAttribution] = useState<any[]>([])
  const [stressTestResults, setStressTestResults] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M')

  // 성과 이력 생성
  useEffect(() => {
    if (!portfolio) return

    // 시뮬레이션된 성과 이력
    const days = timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365
    const history: any[] = []
    let cumulativeReturn = 0
    let previousValue = portfolio.totalValue

    for (let i = 0; i < days; i++) {
      const dailyReturn = (Math.random() - 0.5) * 0.04 // -2% ~ +2% 일간 변동
      cumulativeReturn += dailyReturn
      const value = previousValue * (1 + dailyReturn)
      
      history.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value,
        return: cumulativeReturn * 100,
        drawdown: Math.min(0, (value - portfolio.totalValue) / portfolio.totalValue * 100)
      })
      
      previousValue = value
    }

    setPerformanceHistory(history)

    // 리스크 지표 계산
    const returns = history.map((h, i) => 
      i > 0 ? (h.value - history[i-1].value) / history[i-1].value : 0
    ).slice(1)

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    const annualizedVol = stdDev * Math.sqrt(252) * 100

    const sortedReturns = [...returns].sort((a, b) => a - b)
    const var95Index = Math.floor(returns.length * 0.05)
    const var95 = sortedReturns[var95Index] * 100
    const cvar95 = sortedReturns.slice(0, var95Index).reduce((a, b) => a + b, 0) / var95Index * 100

    setRiskMetrics({
      volatility: annualizedVol,
      sharpeRatio: (avgReturn * 252) / (stdDev * Math.sqrt(252)),
      sortinoRatio: (avgReturn * 252) / (Math.sqrt(variance) * Math.sqrt(252)),
      var95: var95,
      cvar95: cvar95,
      maxDrawdown: Math.min(...history.map(h => h.drawdown)),
      calmarRatio: (avgReturn * 252 * 100) / Math.abs(Math.min(...history.map(h => h.drawdown))),
      beta: 1.2,
      treynorRatio: (avgReturn * 252) / 1.2
    })

    // 성과 기여도 분석
    const attribution = portfolio.assets.map((asset: any) => ({
      symbol: asset.symbol,
      contribution: asset.weight * asset.expectedReturn,
      weight: asset.weight,
      return: asset.expectedReturn
    }))
    setPerformanceAttribution(attribution)

    // 스트레스 테스트
    const scenarios = [
      { name: '시장 폭락 (-20%)', impact: -20, probability: 10 },
      { name: '금리 인상 (+2%)', impact: -8, probability: 30 },
      { name: '인플레이션 급등', impact: -12, probability: 20 },
      { name: '지정학적 위기', impact: -15, probability: 15 },
      { name: '규제 강화', impact: -10, probability: 25 }
    ]

    const stressTests = scenarios.map(scenario => ({
      ...scenario,
      portfolioImpact: portfolio.totalValue * (scenario.impact / 100),
      expectedLoss: portfolio.totalValue * (scenario.impact / 100) * (scenario.probability / 100)
    }))

    setStressTestResults(stressTests)
  }, [portfolio, timeframe])

  // 리스크 레이더 차트 데이터
  const riskRadarData = riskMetrics ? [
    {
      metric: '변동성',
      value: Math.max(0, 100 - riskMetrics.volatility),
      fullMark: 100
    },
    {
      metric: '샤프비율',
      value: Math.min(100, riskMetrics.sharpeRatio * 50),
      fullMark: 100
    },
    {
      metric: 'VaR',
      value: Math.max(0, 100 + riskMetrics.var95 * 5),
      fullMark: 100
    },
    {
      metric: '최대손실',
      value: Math.max(0, 100 + riskMetrics.maxDrawdown),
      fullMark: 100
    },
    {
      metric: '베타',
      value: Math.max(0, 100 - Math.abs(riskMetrics.beta - 1) * 50),
      fullMark: 100
    }
  ] : []

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">포트폴리오 분석</h3>
          <div className="flex gap-2">
            {(['1M', '3M', '6M', '1Y'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded ${
                  timeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 성과 이력 차트 */}
      {performanceHistory.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaHistory className="text-blue-400" />
            성과 이력
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceHistory}>
              <defs>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tickFormatter={(date) => new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#valueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* 손익 차트 */}
          <ResponsiveContainer width="100%" height={200} className="mt-4">
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Line 
                type="monotone" 
                dataKey="return" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                name="누적 수익률"
              />
              <Line 
                type="monotone" 
                dataKey="drawdown" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={false}
                name="손실률"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 리스크 지표 */}
      {riskMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 주요 리스크 지표 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaTachometerAlt className="text-yellow-400" />
              리스크 지표
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">연간 변동성</div>
                <div className="text-xl font-bold text-yellow-400">
                  {riskMetrics.volatility.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">샤프 비율</div>
                <div className="text-xl font-bold text-blue-400">
                  {riskMetrics.sharpeRatio.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">VaR (95%)</div>
                <div className="text-xl font-bold text-orange-400">
                  {riskMetrics.var95.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">최대 손실</div>
                <div className="text-xl font-bold text-red-400">
                  {riskMetrics.maxDrawdown.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">베타</div>
                <div className="text-xl font-bold text-purple-400">
                  {riskMetrics.beta.toFixed(2)}
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">칼마 비율</div>
                <div className="text-xl font-bold text-green-400">
                  {riskMetrics.calmarRatio.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* 리스크 레이더 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">리스크 프로파일</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="10%" 
                outerRadius="80%" 
                data={riskRadarData}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  angleAxisId={0}
                  dataKey="value"
                  cornerRadius={10}
                  fill="#8884d8"
                />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 성과 기여도 */}
      {performanceAttribution.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">자산별 성과 기여도</h4>
          <div className="space-y-3">
            {performanceAttribution.map(attr => (
              <div key={attr.symbol} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{attr.symbol}</span>
                  <span className="text-green-400 font-bold">
                    +{attr.contribution.toFixed(1)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">비중:</span>
                    <span className="text-white ml-2">{(attr.weight * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">수익률:</span>
                    <span className="text-white ml-2">{attr.return.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">기여도:</span>
                    <span className="text-white ml-2">
                      {((attr.contribution / portfolio.expectedReturn) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full"
                      style={{ width: `${(attr.contribution / portfolio.expectedReturn) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 스트레스 테스트 */}
      {stressTestResults.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-400" />
            스트레스 테스트
          </h4>
          <div className="space-y-3">
            {stressTestResults.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-white font-semibold">{test.name}</h5>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      발생확률: {test.probability}%
                    </span>
                    <span className="text-red-400 font-bold">
                      {test.impact}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">예상 손실:</span>
                    <span className="text-red-400 ml-2">
                      -${Math.abs(test.portfolioImpact).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">기댓값:</span>
                    <span className="text-orange-400 ml-2">
                      -${Math.abs(test.expectedLoss).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg">
            <p className="text-orange-400 text-sm">
              <FaExclamationTriangle className="inline-block mr-2" />
              총 위험 노출: ${stressTestResults.reduce((sum, test) => 
                sum + Math.abs(test.expectedLoss), 0
              ).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}