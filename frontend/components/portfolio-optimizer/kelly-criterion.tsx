'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCalculator, FaChartLine, FaDice, FaExclamationTriangle,
  FaInfoCircle, FaCoins, FaChartArea
} from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, Cell, BarChart, Bar
} from 'recharts'

interface SimulationResult {
  betSize: number
  finalWealth: number
  maxDrawdown: number
  ruinProbability: number
  iterations: number
}

interface GrowthData {
  betFraction: number
  growthRate: number
  volatility: number
}

export default function KellyCriterion() {
  const [winProbability, setWinProbability] = useState(0.55)
  const [winAmount, setWinAmount] = useState(1.0)
  const [lossAmount, setLossAmount] = useState(1.0)
  const [bankroll, setBankroll] = useState(10000)
  const [fractionalKelly, setFractionalKelly] = useState(0.25)
  const [numBets, setNumBets] = useState(1000)
  
  // 계산된 값들
  const [kellyFraction, setKellyFraction] = useState(0)
  const [optimalBetSize, setOptimalBetSize] = useState(0)
  const [expectedValue, setExpectedValue] = useState(0)
  const [edge, setEdge] = useState(0)

  // Kelly 공식 계산
  useEffect(() => {
    const p = winProbability
    const q = 1 - p
    const b = winAmount / lossAmount
    
    // Kelly 공식: f* = (p*b - q) / b
    const kelly = (p * b - q) / b
    setKellyFraction(Math.max(0, kelly))
    
    // 기대값 계산
    const ev = p * winAmount - q * lossAmount
    setExpectedValue(ev)
    
    // Edge 계산
    const edgeCalc = (p * winAmount - q * lossAmount) / lossAmount
    setEdge(edgeCalc)
    
    // 최적 베팅 크기
    setOptimalBetSize(bankroll * kelly * fractionalKelly)
  }, [winProbability, winAmount, lossAmount, bankroll, fractionalKelly])

  // 성장률 곡선 데이터 생성
  const generateGrowthCurve = (): GrowthData[] => {
    const data: GrowthData[] = []
    const p = winProbability
    const q = 1 - p
    const b = winAmount / lossAmount
    
    for (let f = 0; f <= 1; f += 0.01) {
      // 기하 평균 성장률: G(f) = p*log(1+b*f) + q*log(1-f)
      const growth = p * Math.log(1 + b * f) + q * Math.log(1 - f)
      const volatility = Math.sqrt(p * Math.pow(Math.log(1 + b * f), 2) + 
                                   q * Math.pow(Math.log(1 - f), 2) - Math.pow(growth, 2))
      
      data.push({
        betFraction: f,
        growthRate: growth,
        volatility: volatility
      })
    }
    
    return data
  }

  const [growthCurveData] = useState(generateGrowthCurve())

  // 시뮬레이션 실행
  const runSimulation = (betSizeMultiple: number): SimulationResult => {
    const trials = 1000
    let ruinCount = 0
    let totalFinalWealth = 0
    let maxDrawdownSum = 0
    
    for (let trial = 0; trial < trials; trial++) {
      let wealth = bankroll
      let peak = wealth
      let maxDD = 0
      
      for (let i = 0; i < numBets; i++) {
        if (wealth <= 0) {
          ruinCount++
          break
        }
        
        const betSize = Math.min(wealth * kellyFraction * betSizeMultiple, wealth)
        const outcome = Math.random() < winProbability
        
        if (outcome) {
          wealth += betSize * winAmount
        } else {
          wealth -= betSize * lossAmount
        }
        
        peak = Math.max(peak, wealth)
        const drawdown = (peak - wealth) / peak
        maxDD = Math.max(maxDD, drawdown)
      }
      
      totalFinalWealth += wealth
      maxDrawdownSum += maxDD
    }
    
    return {
      betSize: kellyFraction * betSizeMultiple,
      finalWealth: totalFinalWealth / trials,
      maxDrawdown: maxDrawdownSum / trials,
      ruinProbability: ruinCount / trials,
      iterations: trials
    }
  }

  // 다양한 Kelly 배수에 대한 시뮬레이션
  const kellyMultiples = [0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
  const simulationResults = kellyMultiples.map(multiple => ({
    multiple,
    ...runSimulation(multiple),
    label: `${(multiple * 100).toFixed(0)}% Kelly`
  }))

  // 파산 확률 데이터
  const bankruptcyData = simulationResults.map(result => ({
    betSize: result.multiple * 100,
    probability: result.ruinProbability * 100
  }))

  // 샘플 성장 경로
  const generateSamplePaths = () => {
    const paths = []
    const numPaths = 5
    
    for (let path = 0; path < numPaths; path++) {
      let wealth = bankroll
      const pathData = [{ bet: 0, wealth }]
      
      for (let i = 1; i <= 200; i++) {
        const betSize = wealth * kellyFraction * fractionalKelly
        const outcome = Math.random() < winProbability
        
        if (outcome) {
          wealth += betSize * winAmount
        } else {
          wealth -= betSize * lossAmount
        }
        
        pathData.push({ bet: i, wealth })
      }
      
      paths.push(pathData)
    }
    
    return paths
  }

  const samplePaths = generateSamplePaths()

  return (
    <div className="space-y-6">
      {/* Calculator */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCalculator className="text-green-400" />
          Kelly Criterion 계산기
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              승리 확률 (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={winProbability * 100}
                onChange={(e) => setWinProbability(Number(e.target.value) / 100)}
                className="flex-1"
              />
              <input
                type="number"
                value={(winProbability * 100).toFixed(1)}
                onChange={(e) => setWinProbability(Number(e.target.value) / 100)}
                className="w-20 bg-gray-700 text-white px-2 py-1 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              승리 시 수익 배수
            </label>
            <input
              type="number"
              value={winAmount}
              onChange={(e) => setWinAmount(Number(e.target.value))}
              step="0.1"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              패배 시 손실 배수
            </label>
            <input
              type="number"
              value={lossAmount}
              onChange={(e) => setLossAmount(Number(e.target.value))}
              step="0.1"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              초기 자본금
            </label>
            <input
              type="number"
              value={bankroll}
              onChange={(e) => setBankroll(Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Kelly 배수 (안전 계수)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="100"
                value={fractionalKelly * 100}
                onChange={(e) => setFractionalKelly(Number(e.target.value) / 100)}
                className="flex-1"
              />
              <span className="text-white w-12">{(fractionalKelly * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              베팅 횟수
            </label>
            <input
              type="number"
              value={numBets}
              onChange={(e) => setNumBets(Number(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* 계산 결과 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700 rounded-lg p-4"
          >
            <p className="text-gray-400 text-sm">Kelly 비율</p>
            <p className={`text-2xl font-bold ${kellyFraction > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(kellyFraction * 100).toFixed(2)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-700 rounded-lg p-4"
          >
            <p className="text-gray-400 text-sm">최적 베팅 크기</p>
            <p className="text-2xl font-bold text-white">
              ${optimalBetSize.toFixed(0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-700 rounded-lg p-4"
          >
            <p className="text-gray-400 text-sm">기대값 (EV)</p>
            <p className={`text-2xl font-bold ${expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {expectedValue > 0 ? '+' : ''}{(expectedValue * 100).toFixed(2)}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-700 rounded-lg p-4"
          >
            <p className="text-gray-400 text-sm">Edge</p>
            <p className={`text-2xl font-bold ${edge > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {(edge * 100).toFixed(2)}%
            </p>
          </motion.div>
        </div>
      </div>

      {/* Growth Rate Curve */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          성장률 곡선
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthCurveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="betFraction" 
              stroke="#9CA3AF"
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => value.toFixed(4)}
              labelFormatter={(value) => `베팅 비율: ${(value * 100).toFixed(1)}%`}
            />
            <Line
              type="monotone"
              dataKey="growthRate"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              name="성장률"
            />
            {/* Kelly 최적점 표시 */}
            <Line
              data={[
                { betFraction: kellyFraction, growthRate: -1 },
                { betFraction: kellyFraction, growthRate: 1 }
              ]}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Simulation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Kelly 배수별 성과</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={simulationResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="label" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar 
                dataKey="finalWealth" 
                fill="#3B82F6" 
                name="최종 자산"
              >
                {simulationResults.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.multiple === 1.0 ? '#F59E0B' : '#3B82F6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">파산 확률</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bankruptcyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="betSize" 
                stroke="#9CA3AF"
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value: any) => `${value.toFixed(2)}%`}
                labelFormatter={(value) => `Kelly 배수: ${value}%`}
              />
              <Line
                type="monotone"
                dataKey="probability"
                stroke="#EF4444"
                strokeWidth={2}
                dot={true}
                name="파산 확률"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sample Growth Paths */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartArea className="text-purple-400" />
          샘플 성장 경로 (200 베팅)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="bet" 
              stroke="#9CA3AF"
              domain={[0, 200]}
              type="number"
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `$${value.toFixed(0)}`}
            />
            {samplePaths.map((path, index) => (
              <Line
                key={index}
                data={path}
                type="monotone"
                dataKey="wealth"
                stroke={`hsl(${index * 60}, 70%, 50%)`}
                strokeWidth={1}
                dot={false}
                opacity={0.7}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Warnings */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          Kelly Criterion은 수학적으로 최적이지만, 실제로는 높은 변동성 때문에 
          대부분의 투자자들은 Kelly 비율의 10-25%만 사용합니다. 
          또한 확률과 배당률을 정확히 예측하기 어렵다는 한계가 있습니다.
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm flex items-start gap-2">
          <FaInfoCircle className="mt-0.5 flex-shrink-0" />
          Kelly Criterion은 장기적으로 자산의 기하평균 성장률을 최대화하는 최적의 베팅 크기를 제공합니다.
          공식: f* = (p × b - q) / b, 여기서 p는 승리 확률, q는 패배 확률, b는 배당률입니다.
        </p>
      </div>
    </div>
  )
}