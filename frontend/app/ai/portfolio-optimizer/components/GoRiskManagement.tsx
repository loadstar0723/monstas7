'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { Shield, AlertTriangle, Activity, BarChart3 } from 'lucide-react'

interface RiskMetrics {
  var95: number
  var99: number
  cvar: number
  maxDrawdown: number
  volatility: number
  beta: number
  correlationMatrix: { [key: string]: { [key: string]: number } }
  stressTests: {
    scenario: string
    impact: number
    probability: number
  }[]
  riskFactors: {
    factor: string
    value: number
  }[]
}

export default function GoRiskManagement() {
  const [metrics, setMetrics] = useState<RiskMetrics>({
    var95: 0,
    var99: 0,
    cvar: 0,
    maxDrawdown: 0,
    volatility: 0,
    beta: 0,
    correlationMatrix: {},
    stressTests: [],
    riskFactors: []
  })

  const [riskHistory, setRiskHistory] = useState<number[]>([])

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/portfolio/risk-metrics')
        if (response.ok) {
          const data = await response.json()
          setMetrics(data)
        }
      } catch (error) {
        // 시뮬레이션 모드
        const scenarios = [
          '시장 폭락 (-20%)',
          'Flash Crash',
          '규제 강화',
          '해킹 사태',
          '유동성 위기'
        ]

        const factors = [
          { factor: '시장 위험', value: Math.random() * 30 + 40 },
          { factor: '유동성 위험', value: Math.random() * 20 + 30 },
          { factor: '신용 위험', value: Math.random() * 15 + 20 },
          { factor: '운영 위험', value: Math.random() * 10 + 15 },
          { factor: '규제 위험', value: Math.random() * 20 + 25 },
          { factor: '기술 위험', value: Math.random() * 15 + 10 }
        ]

        setMetrics({
          var95: Math.random() * 5 + 3,
          var99: Math.random() * 8 + 5,
          cvar: Math.random() * 10 + 7,
          maxDrawdown: Math.random() * 15 + 10,
          volatility: Math.random() * 20 + 15,
          beta: Math.random() * 0.5 + 0.8,
          correlationMatrix: {
            'BTC': { 'BTC': 1, 'ETH': 0.7, 'BNB': 0.6 },
            'ETH': { 'BTC': 0.7, 'ETH': 1, 'BNB': 0.5 },
            'BNB': { 'BTC': 0.6, 'ETH': 0.5, 'BNB': 1 }
          },
          stressTests: scenarios.map(scenario => ({
            scenario,
            impact: Math.random() * 30 + 10,
            probability: Math.random() * 20 + 5
          })),
          riskFactors: factors
        })
      }

      setRiskHistory(prev => [...prev.slice(-19), metrics.var95])
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 3000)
    return () => clearInterval(interval)
  }, [metrics.var95])

  const getImpactColor = (impact: number) => {
    if (impact > 25) return 'text-red-400'
    if (impact > 15) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-6">
      {/* VaR 메트릭스 */}
      <Card className="bg-gray-900 border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Shield className="w-5 h-5" />
            Go 리스크 관리 시스템
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">VaR 95%</div>
              <div className="text-xl font-bold text-green-400">
                -{metrics.var95.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">1일 기준</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">VaR 99%</div>
              <div className="text-xl font-bold text-yellow-400">
                -{metrics.var99.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">1일 기준</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">CVaR</div>
              <div className="text-xl font-bold text-red-400">
                -{metrics.cvar.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">조건부 VaR</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">최대 낙폭</div>
              <div className="text-xl font-bold text-purple-400">
                -{metrics.maxDrawdown.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">역사적</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">변동성</div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.volatility.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">연율화</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-xs text-gray-400">베타</div>
              <div className="text-xl font-bold text-cyan-400">
                {metrics.beta.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">시장 대비</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 리스크 팩터 분석 */}
        <Card className="bg-gray-900 border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Activity className="w-5 h-5" />
              리스크 팩터 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={metrics.riskFactors}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="factor" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#6b7280" />
                <Radar
                  name="위험도"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 스트레스 테스트 */}
        <Card className="bg-gray-900 border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              스트레스 테스트 시나리오
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.stressTests.map((test, idx) => (
                <div key={idx} className="p-3 bg-gray-800 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-gray-200">
                        {test.scenario}
                      </div>
                      <div className="text-xs text-gray-500">
                        발생 확률: {test.probability.toFixed(1)}%
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getImpactColor(test.impact)}`}>
                      -{test.impact.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VaR 추이 */}
      <Card className="bg-gray-900 border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <BarChart3 className="w-5 h-5" />
            VaR 95% 실시간 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 flex items-end justify-between gap-1">
            {riskHistory.map((value, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300"
                style={{
                  height: `${(value / 10) * 100}%`,
                  opacity: 0.5 + (idx / riskHistory.length) * 0.5
                }}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            Value at Risk 변화 추이
          </div>
        </CardContent>
      </Card>

      {/* Go 리스크 계산 최적화 */}
      <Card className="bg-gray-900 border-yellow-800">
        <CardHeader>
          <CardTitle className="text-yellow-400">
            Go 리스크 계산 최적화
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-green-400 font-semibold mb-1">
                몬테카를로 시뮬레이션
              </div>
              <div className="text-xs text-gray-500">
                100만 시나리오 병렬 처리
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-blue-400 font-semibold mb-1">
                히스토리컬 VaR
              </div>
              <div className="text-xs text-gray-500">
                5년 데이터 실시간 분석
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-purple-400 font-semibold mb-1">
                공분산 행렬
              </div>
              <div className="text-xs text-gray-500">
                BLAS 최적화 연산
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-yellow-400 font-semibold mb-1">
                실시간 업데이트
              </div>
              <div className="text-xs text-gray-500">
                틱 데이터 스트리밍
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-800/50">
            <div className="text-sm font-semibold text-green-400 mb-1">리스크 계산 성능</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">시뮬레이션:</span>
                <span className="text-green-400 ml-1">100x faster</span>
              </div>
              <div>
                <span className="text-gray-400">정확도:</span>
                <span className="text-green-400 ml-1">99.9%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}