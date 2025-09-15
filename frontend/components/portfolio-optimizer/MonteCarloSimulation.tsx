'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaChartArea, FaDice, FaExclamationCircle } from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface SimulationResult {
  percentile: number
  value: number
  probability: number
}

interface Props {
  portfolio: any
  timeHorizon: number
  simulations: number
}

export default function MonteCarloSimulation({ portfolio, timeHorizon, simulations }: Props) {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationPaths, setSimulationPaths] = useState<any[]>([])
  const [percentileResults, setPercentileResults] = useState<SimulationResult[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [selectedPercentiles, setSelectedPercentiles] = useState([5, 25, 50, 75, 95])
  const [confidenceLevel, setConfidenceLevel] = useState(95)

  // Monte Carlo 시뮬레이션 실행
  const runSimulation = async () => {
    if (!portfolio) return

    setIsSimulating(true)

    // 시뮬레이션 파라미터
    const initialValue = portfolio.totalValue
    const expectedReturn = portfolio.expectedReturn / 100 / 252 // 일간 수익률
    const volatility = portfolio.volatility / 100 / Math.sqrt(252) // 일간 변동성
    const days = timeHorizon * 252 // 거래일 기준

    // 시뮬레이션 실행
    const paths: number[][] = []
    const finalValues: number[] = []

    for (let sim = 0; sim < simulations; sim++) {
      const path: number[] = [initialValue]
      let currentValue = initialValue

      for (let day = 1; day <= days; day++) {
        // Geometric Brownian Motion
        const dailyReturn = expectedReturn + volatility * (Math.random() * 2 - 1) * Math.sqrt(2 / Math.PI)
        currentValue = currentValue * (1 + dailyReturn)
        
        // 매주 기록 (표시를 위해)
        if (day % 5 === 0) {
          path.push(currentValue)
        }
      }

      paths.push(path)
      finalValues.push(currentValue)
    }

    // 결과 처리
    finalValues.sort((a, b) => a - b)

    // 백분위수 계산
    const percentiles: SimulationResult[] = []
    for (let p = 1; p <= 99; p++) {
      const index = Math.floor((p / 100) * finalValues.length)
      percentiles.push({
        percentile: p,
        value: finalValues[index],
        probability: p
      })
    }
    setPercentileResults(percentiles)

    // 선택된 백분위수의 경로 추출
    const selectedPaths: any = {}
    selectedPercentiles.forEach(p => {
      const index = Math.floor((p / 100) * paths.length)
      selectedPaths[`p${p}`] = paths[index]
    })

    // 시계열 데이터 생성
    const timeSeriesData = []
    const weeks = Math.ceil(days / 5)
    for (let week = 0; week < weeks; week++) {
      const dataPoint: any = { week }
      selectedPercentiles.forEach(p => {
        if (selectedPaths[`p${p}`][week] !== undefined) {
          dataPoint[`p${p}`] = selectedPaths[`p${p}`][week]
        }
      })
      timeSeriesData.push(dataPoint)
    }
    setSimulationPaths(timeSeriesData)

    // 통계 계산
    const mean = finalValues.reduce((a, b) => a + b, 0) / finalValues.length
    const variance = finalValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / finalValues.length
    const stdDev = Math.sqrt(variance)
    
    const stats = {
      mean,
      median: finalValues[Math.floor(finalValues.length / 2)],
      stdDev,
      min: finalValues[0],
      max: finalValues[finalValues.length - 1],
      var95: finalValues[Math.floor(0.05 * finalValues.length)],
      cvar95: finalValues.slice(0, Math.floor(0.05 * finalValues.length))
        .reduce((a, b) => a + b, 0) / Math.floor(0.05 * finalValues.length),
      probabilityOfLoss: finalValues.filter(v => v < initialValue).length / finalValues.length * 100,
      probabilityOfDoubling: finalValues.filter(v => v > initialValue * 2).length / finalValues.length * 100
    }
    setStatistics(stats)

    setIsSimulating(false)
  }

  useEffect(() => {
    if (portfolio) {
      runSimulation()
    }
  }, [portfolio, timeHorizon, simulations])

  // 컬러 맵
  const percentileColors: Record<number, string> = {
    5: '#EF4444',
    25: '#F59E0B',
    50: '#3B82F6',
    75: '#10B981',
    95: '#8B5CF6'
  }

  return (
    <div className="space-y-6">
      {/* 시뮬레이션 설정 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaDice className="text-purple-400" />
            Monte Carlo 시뮬레이션
          </h3>
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaDice className={isSimulating ? 'animate-spin' : ''} />
            {isSimulating ? '시뮬레이션 중...' : '재실행'}
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          {simulations.toLocaleString()}개의 시나리오를 통해 {timeHorizon}년 후 
          포트폴리오 가치의 확률적 분포를 예측합니다.
        </p>

        {/* 시뮬레이션 파라미터 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">시뮬레이션 횟수</div>
            <div className="text-xl font-bold text-white">{simulations.toLocaleString()}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">투자 기간</div>
            <div className="text-xl font-bold text-white">{timeHorizon}년</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-sm">신뢰수준</div>
            <div className="text-xl font-bold text-white">{confidenceLevel}%</div>
          </div>
        </div>
      </div>

      {/* 시뮬레이션 경로 */}
      {simulationPaths.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartArea className="text-blue-400" />
            예상 자산 가치 경로
          </h4>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={simulationPaths}>
              <defs>
                {selectedPercentiles.map(p => (
                  <linearGradient key={p} id={`gradient${p}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={percentileColors[p]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={percentileColors[p]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9CA3AF"
                label={{ value: '주', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              
              {/* 백분위수별 영역 차트 */}
              {selectedPercentiles.slice().reverse().map((p, index) => (
                <Area
                  key={p}
                  type="monotone"
                  dataKey={`p${p}`}
                  stroke={percentileColors[p]}
                  fillOpacity={1}
                  fill={`url(#gradient${p})`}
                  name={`${p}분위`}
                  strokeWidth={index === Math.floor(selectedPercentiles.length / 2) ? 3 : 1}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 통계 요약 */}
      {statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 주요 통계 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">시뮬레이션 결과 통계</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">평균 가치</div>
                <div className="text-xl font-bold text-white">
                  ${statistics.mean.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {((statistics.mean / portfolio.totalValue - 1) * 100).toFixed(1)}% 수익
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">중간값</div>
                <div className="text-xl font-bold text-blue-400">
                  ${statistics.median.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {((statistics.median / portfolio.totalValue - 1) * 100).toFixed(1)}% 수익
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">최악 시나리오 (5%)</div>
                <div className="text-xl font-bold text-red-400">
                  ${statistics.var95.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {((statistics.var95 / portfolio.totalValue - 1) * 100).toFixed(1)}% 손실
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm">최선 시나리오 (95%)</div>
                <div className="text-xl font-bold text-green-400">
                  ${statistics.max.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {((statistics.max / portfolio.totalValue - 1) * 100).toFixed(1)}% 수익
                </div>
              </div>
            </div>
          </div>

          {/* 확률 분석 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-yellow-400" />
              리스크 확률 분석
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">손실 확률</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-red-400">
                    {statistics.probabilityOfLoss.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${statistics.probabilityOfLoss}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400">2배 수익 확률</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-green-400">
                    {statistics.probabilityOfDoubling.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${statistics.probabilityOfDoubling}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-400">표준편차</span>
                <span className="text-xl font-bold text-yellow-400">
                  ${statistics.stdDev.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 신뢰구간 분포 */}
      {percentileResults.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">가치 분포 확률</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={percentileResults}>
              <defs>
                <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="percentile" 
                stroke="#9CA3AF"
                label={{ value: '확률 백분위', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#probabilityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 리스크 경고 */}
      {statistics && statistics.probabilityOfLoss > 30 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 rounded-lg p-4 border border-red-600/30"
        >
          <div className="flex items-start gap-3">
            <FaExclamationCircle className="text-red-400 text-xl mt-1" />
            <div>
              <h5 className="text-red-400 font-semibold mb-1">높은 리스크 경고</h5>
              <p className="text-gray-300 text-sm">
                현재 포트폴리오는 {timeHorizon}년 투자 기간 동안 {statistics.probabilityOfLoss.toFixed(0)}%의 
                손실 확률을 보이고 있습니다. 리스크 관리 전략을 재검토하시기 바랍니다.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}