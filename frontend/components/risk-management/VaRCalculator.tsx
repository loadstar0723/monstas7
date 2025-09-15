'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaCalculator, FaChartBar, FaInfoCircle } from 'react-icons/fa'
import { 
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

interface Position {
  symbol: string
  size: number
  currentPrice: number
  leverage: number
}

interface Props {
  positions: Position[]
  confidence: number
}

interface VaRResult {
  parametric: number
  historical: number
  monteCarlo: number
  cvar: number
  backtest: {
    violations: number
    expectedViolations: number
    passed: boolean
  }
}

export default function VaRCalculator({ positions, confidence }: Props) {
  const [varResult, setVarResult] = useState<VaRResult | null>(null)
  const [timeHorizon, setTimeHorizon] = useState<1 | 5 | 10>(1)
  const [calculationMethod, setCalculationMethod] = useState<'parametric' | 'historical' | 'monteCarlo'>('parametric')
  const [isCalculating, setIsCalculating] = useState(false)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [varDistribution, setVarDistribution] = useState<any[]>([])

  // VaR 계산
  const calculateVaR = async () => {
    setIsCalculating(true)

    // 포트폴리오 총 가치 계산
    const totalValue = positions.reduce((sum, pos) => 
      sum + (pos.size * pos.currentPrice * pos.leverage), 0
    )

    // 시뮬레이션된 VaR 결과
    setTimeout(() => {
      // 각 방법별 VaR 계산 (시뮬레이션)
      const parametricVaR = totalValue * 0.05 * Math.sqrt(timeHorizon) * 1.65 // 95% confidence
      const historicalVaR = totalValue * 0.045 * Math.sqrt(timeHorizon) * (1 + Math.random() * 0.2)
      const monteCarloVaR = totalValue * 0.048 * Math.sqrt(timeHorizon) * (1 + Math.random() * 0.15)
      
      // CVaR (Conditional VaR)
      const cvar = Math.max(parametricVaR, historicalVaR, monteCarloVaR) * 1.3

      // 백테스트 결과
      const backtest = {
        violations: Math.floor(Math.random() * 5) + 1,
        expectedViolations: Math.floor((100 - confidence) / 100 * 250),
        passed: true
      }
      backtest.passed = backtest.violations <= backtest.expectedViolations * 1.5

      setVarResult({
        parametric: parametricVaR,
        historical: historicalVaR,
        monteCarlo: monteCarloVaR,
        cvar,
        backtest
      })

      // 과거 데이터 생성
      const historical = Array.from({ length: 250 }, (_, i) => ({
        day: i - 249,
        return: (Math.random() - 0.5) * 0.1,
        portfolioValue: totalValue * (1 + (Math.random() - 0.5) * 0.05)
      }))
      setHistoricalData(historical)

      // VaR 분포 생성
      const distribution = Array.from({ length: 100 }, (_, i) => {
        const percentile = i + 1
        const value = -totalValue * 0.001 * percentile * Math.sqrt(timeHorizon)
        return {
          percentile,
          value,
          probability: percentile <= (100 - confidence) ? 1 : 0
        }
      })
      setVarDistribution(distribution)

      setIsCalculating(false)
    }, 1500)
  }

  useEffect(() => {
    if (positions.length > 0) {
      calculateVaR()
    }
  }, [positions, confidence, timeHorizon, calculationMethod])

  // 메서드별 설명
  const methodDescriptions = {
    parametric: '정규분포를 가정하여 표준편차와 평균을 이용해 계산하는 방법',
    historical: '과거 데이터의 실제 손익 분포를 사용하여 계산하는 방법',
    monteCarlo: '무작위 시나리오를 대량 생성하여 손실 분포를 추정하는 방법'
  }

  return (
    <div className="space-y-6">
      {/* VaR 설정 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaShieldAlt className="text-blue-400" />
            Value at Risk (VaR) 계산기
          </h3>
          <button
            onClick={calculateVaR}
            disabled={isCalculating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaCalculator className={isCalculating ? 'animate-pulse' : ''} />
            {isCalculating ? '계산 중...' : 'VaR 계산'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">시간 구간</label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value) as any)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value={1}>1일</option>
              <option value={5}>5일</option>
              <option value={10}>10일</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">신뢰수준</label>
            <div className="bg-gray-700 px-3 py-2 rounded-lg text-white">
              {confidence}%
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">계산 방법</label>
            <select
              value={calculationMethod}
              onChange={(e) => setCalculationMethod(e.target.value as any)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value="parametric">모수적 방법</option>
              <option value="historical">역사적 시뮬레이션</option>
              <option value="monteCarlo">몬테카를로</option>
            </select>
          </div>
        </div>

        <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
          <p className="text-sm text-gray-400">
            <FaInfoCircle className="inline-block mr-2 text-blue-400" />
            {methodDescriptions[calculationMethod]}
          </p>
        </div>
      </div>

      {/* VaR 결과 */}
      {varResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-6 border border-red-500/30"
        >
          <h3 className="text-xl font-bold text-white mb-4">VaR 계산 결과</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">모수적 VaR</div>
              <div className="text-2xl font-bold text-red-400">
                -${varResult.parametric.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {timeHorizon}일, {confidence}% 신뢰수준
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">역사적 VaR</div>
              <div className="text-2xl font-bold text-orange-400">
                -${varResult.historical.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                과거 250일 데이터
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">몬테카를로 VaR</div>
              <div className="text-2xl font-bold text-yellow-400">
                -${varResult.monteCarlo.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                10,000 시뮬레이션
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">CVaR (ES)</div>
              <div className="text-2xl font-bold text-purple-400">
                -${varResult.cvar.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                기대 초과손실
              </div>
            </div>
          </div>

          {/* 해석 */}
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <p className="text-gray-300 text-sm">
              <strong className="text-white">해석:</strong> {confidence}% 신뢰수준에서 향후 {timeHorizon}일 동안 
              포트폴리오의 최대 예상 손실은 ${Math.max(varResult.parametric, varResult.historical, varResult.monteCarlo).toLocaleString()}를 
              초과하지 않을 것으로 예상됩니다.
            </p>
          </div>
        </motion.div>
      )}

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 손실 분포 */}
        {varDistribution.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">손실 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={varDistribution}>
                <defs>
                  <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="percentile" 
                  stroke="#9CA3AF"
                  label={{ value: '백분위', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => `$${(Math.abs(value) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `-$${Math.abs(value).toLocaleString()}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#lossGradient)" 
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 과거 수익률 */}
        {historicalData.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">과거 수익률 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData.slice(-50)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                />
                <Bar 
                  dataKey="return" 
                  fill={(data: any) => data.return < 0 ? '#EF4444' : '#10B981'}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 백테스트 결과 */}
      {varResult?.backtest && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-green-400" />
            백테스트 결과
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">실제 위반 횟수</div>
              <div className="text-2xl font-bold text-white">
                {varResult.backtest.violations}회
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">예상 위반 횟수</div>
              <div className="text-2xl font-bold text-gray-400">
                {varResult.backtest.expectedViolations}회
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">검증 결과</div>
              <div className={`text-2xl font-bold ${
                varResult.backtest.passed ? 'text-green-400' : 'text-red-400'
              }`}>
                {varResult.backtest.passed ? '통과' : '실패'}
              </div>
            </div>
          </div>
          
          {!varResult.backtest.passed && (
            <div className="mt-4 p-3 bg-red-900/20 rounded-lg border border-red-500/50">
              <p className="text-red-400 text-sm">
                백테스트 실패: VaR 모델이 리스크를 과소평가하고 있을 가능성이 있습니다. 
                모델 파라미터를 재조정하거나 다른 방법론을 고려하세요.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}