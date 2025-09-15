'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaExclamationTriangle, FaChartBar, FaBolt, 
  FaGlobeAmericas, FaChartLine 
} from 'react-icons/fa'
import { 
  BarChart, Bar, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'

interface Scenario {
  id: string
  name: string
  description: string
  category: 'market' | 'liquidity' | 'operational' | 'macro'
  severity: 'mild' | 'moderate' | 'severe' | 'extreme'
  probability: number
  impacts: {
    btc: number
    eth: number
    altcoins: number
    defi: number
    stablecoins: number
  }
}

interface Props {
  portfolio: any[]
}

export default function StressTestingModule({ portfolio }: Props) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [testResults, setTestResults] = useState<any>(null)
  const [isRunningTest, setIsRunningTest] = useState(false)

  // 스트레스 시나리오 정의
  const scenarios: Scenario[] = [
    {
      id: 'flash_crash',
      name: '플래시 크래시',
      description: 'BTC가 30분 내에 20% 급락하는 시나리오',
      category: 'market',
      severity: 'severe',
      probability: 5,
      impacts: { btc: -20, eth: -25, altcoins: -35, defi: -40, stablecoins: 0 }
    },
    {
      id: 'liquidity_crisis',
      name: '유동성 위기',
      description: '주요 거래소 출금 중단 및 유동성 고갈',
      category: 'liquidity',
      severity: 'extreme',
      probability: 3,
      impacts: { btc: -15, eth: -18, altcoins: -30, defi: -35, stablecoins: -2 }
    },
    {
      id: 'regulation_shock',
      name: '규제 충격',
      description: '주요국 암호화폐 거래 금지 발표',
      category: 'macro',
      severity: 'severe',
      probability: 10,
      impacts: { btc: -25, eth: -30, altcoins: -40, defi: -45, stablecoins: -5 }
    },
    {
      id: 'defi_hack',
      name: 'DeFi 해킹',
      description: '대규모 DeFi 프로토콜 해킹 발생',
      category: 'operational',
      severity: 'moderate',
      probability: 15,
      impacts: { btc: -5, eth: -10, altcoins: -8, defi: -50, stablecoins: -1 }
    },
    {
      id: 'interest_rate_hike',
      name: '금리 급등',
      description: '연준 예상치 못한 대규모 금리 인상',
      category: 'macro',
      severity: 'moderate',
      probability: 20,
      impacts: { btc: -10, eth: -12, altcoins: -15, defi: -18, stablecoins: 0 }
    },
    {
      id: 'stable_depeg',
      name: '스테이블코인 디페그',
      description: '주요 스테이블코인 $1 페그 상실',
      category: 'market',
      severity: 'extreme',
      probability: 5,
      impacts: { btc: -8, eth: -10, altcoins: -12, defi: -20, stablecoins: -30 }
    }
  ]

  // 스트레스 테스트 실행
  const runStressTest = () => {
    if (selectedScenarios.length === 0) {
      alert('최소 1개 이상의 시나리오를 선택하세요.')
      return
    }

    setIsRunningTest(true)

    setTimeout(() => {
      // 선택된 시나리오들의 영향 계산
      const selectedTests = scenarios.filter(s => selectedScenarios.includes(s.id))
      
      // 포트폴리오 총 가치
      const totalValue = portfolio.reduce((sum, pos: any) => 
        sum + (pos.size * pos.currentPrice * pos.leverage), 0
      )

      // 각 시나리오별 손실 계산
      const scenarioResults = selectedTests.map(scenario => {
        // 자산별 가중치 추정 (시뮬레이션)
        const weights = {
          btc: 0.35,
          eth: 0.25,
          altcoins: 0.25,
          defi: 0.10,
          stablecoins: 0.05
        }

        // 가중 평균 손실 계산
        const weightedLoss = Object.entries(scenario.impacts).reduce((sum, [asset, impact]) => 
          sum + (weights[asset as keyof typeof weights] * impact), 0
        )

        const portfolioLoss = totalValue * (weightedLoss / 100)
        const stressedValue = totalValue + portfolioLoss

        return {
          scenario: scenario.name,
          severity: scenario.severity,
          probability: scenario.probability,
          portfolioLoss,
          stressedValue,
          percentageLoss: weightedLoss,
          recovery: {
            optimistic: Math.abs(weightedLoss) * 0.5, // 50% 회복
            realistic: Math.abs(weightedLoss) * 0.7,  // 70% 회복
            pessimistic: Math.abs(weightedLoss) * 1.2 // 20% 추가 하락
          }
        }
      })

      // 종합 분석
      const worstCase = scenarioResults.reduce((worst, current) => 
        current.percentageLoss < worst.percentageLoss ? current : worst
      )

      const expectedLoss = scenarioResults.reduce((sum, result) => 
        sum + (result.portfolioLoss * result.probability / 100), 0
      )

      setTestResults({
        scenarios: scenarioResults,
        worstCase,
        expectedLoss,
        totalValue,
        recommendations: generateRecommendations(scenarioResults)
      })

      setIsRunningTest(false)
    }, 2000)
  }

  // 추천사항 생성
  const generateRecommendations = (results: any[]) => {
    const recommendations = []
    
    const avgLoss = results.reduce((sum, r) => sum + Math.abs(r.percentageLoss), 0) / results.length
    
    if (avgLoss > 30) {
      recommendations.push({
        priority: 'high',
        action: '포트폴리오 다각화',
        description: '특정 자산에 과도하게 집중되어 있습니다. 전통 자산을 포함한 다각화가 필요합니다.'
      })
    }

    if (results.some(r => r.severity === 'extreme')) {
      recommendations.push({
        priority: 'high',
        action: '헤징 전략 수립',
        description: '극단적 시나리오에 대비한 풋옵션이나 인버스 ETF 헤징을 고려하세요.'
      })
    }

    if (results.some(r => r.scenario.includes('유동성'))) {
      recommendations.push({
        priority: 'medium',
        action: '유동성 확보',
        description: '거래소 분산 및 콜드 월렛 보관 비율을 높이세요.'
      })
    }

    recommendations.push({
      priority: 'medium',
      action: '정기적 리밸런싱',
      description: '월 1회 이상 포트폴리오를 검토하고 리밸런싱하세요.'
    })

    return recommendations
  }

  // 심각도별 색상
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-500/20 text-green-400'
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400'
      case 'severe': return 'bg-orange-500/20 text-orange-400'
      case 'extreme': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* 스트레스 시나리오 선택 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaExclamationTriangle className="text-orange-400" />
            스트레스 테스트 시나리오
          </h3>
          <button
            onClick={runStressTest}
            disabled={isRunningTest || selectedScenarios.length === 0}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaBolt className={isRunningTest ? 'animate-pulse' : ''} />
            {isRunningTest ? '테스트 진행중...' : '스트레스 테스트 실행'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map(scenario => (
            <div
              key={scenario.id}
              className={`bg-gray-900/50 rounded-lg p-4 border cursor-pointer transition-all ${
                selectedScenarios.includes(scenario.id) 
                  ? 'border-orange-500 bg-orange-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => {
                setSelectedScenarios(prev => 
                  prev.includes(scenario.id)
                    ? prev.filter(id => id !== scenario.id)
                    : [...prev, scenario.id]
                )
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {scenario.category === 'market' && <FaChartLine className="text-blue-400" />}
                  {scenario.category === 'liquidity' && <FaBolt className="text-yellow-400" />}
                  {scenario.category === 'operational' && <FaExclamationTriangle className="text-red-400" />}
                  {scenario.category === 'macro' && <FaGlobeAmericas className="text-purple-400" />}
                  <h4 className="text-white font-semibold">{scenario.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(scenario.severity)}`}>
                    {scenario.severity}
                  </span>
                  <span className="text-xs text-gray-400">
                    {scenario.probability}%
                  </span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">{scenario.description}</p>
              
              {/* 영향도 바 */}
              <div className="space-y-1">
                {Object.entries(scenario.impacts).slice(0, 3).map(([asset, impact]) => (
                  <div key={asset} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">{asset.toUpperCase()}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${impact < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.abs(impact)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">{impact}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 테스트 결과 */}
      {testResults && (
        <>
          {/* 결과 요약 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-500/30"
          >
            <h3 className="text-xl font-bold text-white mb-4">스트레스 테스트 결과</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm">최악 시나리오</div>
                <div className="text-xl font-bold text-red-400">
                  {testResults.worstCase.scenario}
                </div>
                <div className="text-sm text-gray-500">
                  {testResults.worstCase.percentageLoss.toFixed(1)}% 손실
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm">기대 손실</div>
                <div className="text-xl font-bold text-orange-400">
                  ${testResults.expectedLoss.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  확률 가중 평균
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm">생존 확률</div>
                <div className="text-xl font-bold text-green-400">
                  {(100 - testResults.worstCase.probability).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-500">
                  최악 시나리오 회피
                </div>
              </div>
            </div>

            {/* 시나리오별 차트 */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testResults.scenarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="scenario" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="percentageLoss" fill="#EF4444" name="손실률" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 회복 시나리오 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">회복 시나리오 분석</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={testResults.scenarios.map((s: any) => ({
                scenario: s.scenario,
                낙관적: s.recovery.optimistic,
                현실적: s.recovery.realistic,
                비관적: s.recovery.pessimistic
              }))}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="scenario" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar name="낙관적" dataKey="낙관적" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Radar name="현실적" dataKey="현실적" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Radar name="비관적" dataKey="비관적" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 권장사항 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaChartBar className="text-blue-400" />
              리스크 완화 권장사항
            </h3>
            <div className="space-y-3">
              {testResults.recommendations.map((rec: any, index: number) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-400' :
                      rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{rec.action}</h4>
                      <p className="text-gray-400 text-sm mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}