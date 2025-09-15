'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaRocket, FaDice, FaCalculator, FaExclamationTriangle } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts'

interface KellyResult {
  symbol: string
  winRate: number
  avgWin: number
  avgLoss: number
  kellyPercentage: number
  fractionalKelly: number
  expectedValue: number
  growthRate: number
}

interface Props {
  assets: any[]
  bankroll: number
}

export default function KellyCriterionCalculator({ assets, bankroll }: Props) {
  const [kellyResults, setKellyResults] = useState<KellyResult[]>([])
  const [kellyFraction, setKellyFraction] = useState(0.25) // 1/4 Kelly 기본값
  const [simulationData, setSimulationData] = useState<any[]>([])
  const [riskOfRuin, setRiskOfRuin] = useState<Record<string, number>>({})
  const [isCalculating, setIsCalculating] = useState(false)

  // Kelly Criterion 계산
  const calculateKellyCriterion = () => {
    setIsCalculating(true)

    // 각 자산에 대한 Kelly % 계산
    const results: KellyResult[] = assets.map(asset => {
      // 시뮬레이션된 베팅 통계
      const winRate = 0.45 + Math.random() * 0.2 // 45-65%
      const avgWin = 1.5 + Math.random() * 1.5 // 1.5-3x
      const avgLoss = 0.8 + Math.random() * 0.15 // 0.8-0.95x
      
      // Kelly 공식: f = (p*b - q) / b
      // p = 승률, q = 패율, b = 승리 시 배당률
      const p = winRate
      const q = 1 - winRate
      const b = avgWin - 1 // 순수익 배율
      
      const kellyPercentage = (p * b - q) / b * 100
      const fractionalKelly = kellyPercentage * kellyFraction
      const expectedValue = p * avgWin - q * avgLoss
      
      // 로그 성장률
      const growthRate = p * Math.log(1 + b * fractionalKelly / 100) + 
                        q * Math.log(1 - fractionalKelly / 100)
      
      return {
        symbol: asset.symbol,
        winRate: winRate * 100,
        avgWin,
        avgLoss,
        kellyPercentage: Math.max(0, kellyPercentage),
        fractionalKelly: Math.max(0, fractionalKelly),
        expectedValue,
        growthRate: growthRate * 100
      }
    })

    setKellyResults(results)

    // 성장 시뮬레이션
    const periods = 100
    const simData: any[] = []
    
    for (let i = 0; i <= periods; i++) {
      const data: any = { period: i }
      
      results.forEach(result => {
        // 기하 브라운 운동으로 자산 성장 시뮬레이션
        const drift = result.growthRate / 100
        const volatility = 0.3
        const randomShock = Math.random() < result.winRate / 100 ? 
          result.avgWin : -result.avgLoss
        
        if (i === 0) {
          data[result.symbol] = bankroll * (result.fractionalKelly / 100)
        } else {
          const prevValue = simData[i - 1][result.symbol]
          data[result.symbol] = prevValue * (1 + drift + volatility * (randomShock - 1))
        }
      })
      
      simData.push(data)
    }

    setSimulationData(simData)

    // 파산 확률 계산
    const ruinProbs: Record<string, number> = {}
    results.forEach(result => {
      // 간단한 파산 확률 추정
      if (result.kellyPercentage <= 0) {
        ruinProbs[result.symbol] = 100
      } else {
        const z = result.fractionalKelly / 100
        const p = result.winRate / 100
        const q = 1 - p
        const a = result.avgLoss
        
        // Gambler's ruin 근사
        if (p > q) {
          ruinProbs[result.symbol] = Math.pow(q/p, bankroll * z / a) * 100
        } else {
          ruinProbs[result.symbol] = 100
        }
      }
    })

    setRiskOfRuin(ruinProbs)
    setIsCalculating(false)
  }

  useEffect(() => {
    if (assets && assets.length > 0) {
      calculateKellyCriterion()
    }
  }, [assets, kellyFraction])

  // Kelly 비율에 따른 성장률 곡선
  const kellyGrowthCurve = Array.from({ length: 101 }, (_, i) => {
    const kelly = i / 100
    const avgResult = kellyResults.length > 0 ? 
      kellyResults.reduce((acc, r) => ({
        p: acc.p + r.winRate / 100 / kellyResults.length,
        b: acc.b + (r.avgWin - 1) / kellyResults.length
      }), { p: 0, b: 0 }) : { p: 0.55, b: 1.5 }
    
    const growth = avgResult.p * Math.log(1 + avgResult.b * kelly) + 
                   (1 - avgResult.p) * Math.log(1 - kelly)
    
    return {
      kelly: kelly * 100,
      growth: growth * 100,
      currentKelly: kelly === kellyFraction
    }
  })

  return (
    <div className="space-y-6">
      {/* Kelly Criterion 개요 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaRocket className="text-orange-400" />
            Kelly Criterion 최적 베팅
          </h3>
          <button
            onClick={calculateKellyCriterion}
            disabled={isCalculating}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaCalculator className={isCalculating ? 'animate-pulse' : ''} />
            {isCalculating ? '계산 중...' : '재계산'}
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          Kelly Criterion은 장기적으로 자산을 최대한 성장시키는 최적의 베팅 크기를 계산합니다. 
          과도한 위험을 피하면서 성장을 극대화하는 수학적 공식입니다.
        </p>

        {/* Kelly 분수 조절 */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Kelly 분수 (안전 계수)</label>
            <span className="text-white font-semibold">{(kellyFraction * 100).toFixed(0)}% Kelly</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={kellyFraction}
            onChange={(e) => setKellyFraction(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10% (매우 보수적)</span>
            <span>25% (권장)</span>
            <span>50% (공격적)</span>
            <span>100% (Full Kelly)</span>
          </div>
        </div>
      </div>

      {/* Kelly 계산 결과 */}
      {kellyResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 자산별 Kelly % */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">자산별 최적 베팅 크기</h4>
            <div className="space-y-4">
              {kellyResults.map(result => (
                <div key={result.symbol} className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-semibold">{result.symbol}</h5>
                    <div className="flex items-center gap-2">
                      {result.kellyPercentage > 50 && (
                        <FaExclamationTriangle className="text-yellow-400" title="높은 위험" />
                      )}
                      <span className={`font-bold ${
                        result.fractionalKelly > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result.fractionalKelly.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">승률:</span>
                      <span className="text-white ml-2">{result.winRate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">기댓값:</span>
                      <span className={`ml-2 ${
                        result.expectedValue > 1 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result.expectedValue.toFixed(3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">평균 수익:</span>
                      <span className="text-blue-400 ml-2">{result.avgWin.toFixed(2)}x</span>
                    </div>
                    <div>
                      <span className="text-gray-500">평균 손실:</span>
                      <span className="text-red-400 ml-2">{result.avgLoss.toFixed(2)}x</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>베팅 금액</span>
                      <span>${((bankroll * result.fractionalKelly) / 100).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, result.fractionalKelly)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 파산 확률 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">
              <FaDice className="inline-block text-red-400 mr-2" />
              파산 위험 분석
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(riskOfRuin).map(([symbol, risk]) => ({
                symbol,
                risk: Math.min(100, risk),
                safe: 100 - Math.min(100, risk)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="symbol" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="risk" stackId="a" fill="#EF4444" name="파산 확률" />
                <Bar dataKey="safe" stackId="a" fill="#10B981" name="생존 확률" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <FaExclamationTriangle className="inline-block mr-2" />
                파산 확률은 Kelly 베팅 크기와 승률에 따라 결정됩니다. 
                25% Kelly (1/4 Kelly)를 사용하면 파산 위험을 크게 줄일 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kelly 성장률 곡선 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-bold text-white mb-4">Kelly 비율에 따른 성장률</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={kellyGrowthCurve}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="kelly" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Area 
              type="monotone" 
              dataKey="growth" 
              stroke="#10B981" 
              fillOpacity={1} 
              fill="url(#growthGradient)" 
            />
            <Line 
              type="monotone" 
              dataKey="growth" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-gray-400 text-sm mt-2">
          현재 {(kellyFraction * 100).toFixed(0)}% Kelly 사용 중
        </p>
      </div>

      {/* 자산 성장 시뮬레이션 */}
      {simulationData.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">예상 자산 성장 경로</h4>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={simulationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `$${value.toFixed(0)}`}
              />
              <Legend />
              {kellyResults.map((result, index) => (
                <Line
                  key={result.symbol}
                  type="monotone"
                  dataKey={result.symbol}
                  stroke={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index]}
                  strokeWidth={2}
                  dot={false}
                  name={`${result.symbol} (${result.fractionalKelly.toFixed(1)}% Kelly)`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {kellyResults.map(result => {
              const finalValue = simulationData[simulationData.length - 1][result.symbol]
              const initialValue = bankroll * (result.fractionalKelly / 100)
              const totalReturn = ((finalValue - initialValue) / initialValue) * 100
              
              return (
                <div key={result.symbol} className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-gray-400 text-sm">{result.symbol}</div>
                  <div className="text-xl font-bold text-white">
                    ${finalValue.toLocaleString()}
                  </div>
                  <div className={`text-sm ${totalReturn > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(1)}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}