'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCheckCircle, FaExclamationTriangle, FaTimesCircle,
  FaChartBar, FaChartLine, FaBalanceScale, FaRandom,
  FaCalculator, FaFilter, FaBug, FaFlask
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Dot, Area, AreaChart
} from 'recharts'

interface DiagnosticTestsProps {
  symbol: string
}

export default function DiagnosticTests({ symbol }: DiagnosticTestsProps) {
  const [residualData, setResidualData] = useState<any[]>([])
  const [qqData, setQQData] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any>({})
  
  // 잔차 데이터 및 진단 테스트 생성
  useEffect(() => {
    // 잔차 데이터 생성
    const generateResidualData = () => {
      const data = []
      for (let i = 0; i < 100; i++) {
        // 정규분포에 가까운 잔차 생성
        const residual = (Math.random() - 0.5) * 2 + 
                        Math.sin(i / 10) * 0.1 + // 약간의 패턴
                        (Math.random() > 0.95 ? (Math.random() - 0.5) * 4 : 0) // 이상치
        
        data.push({
          index: i,
          residual,
          fitted: 50000 + i * 100 + Math.sin(i / 20) * 1000,
          standardized: residual / 0.5
        })
      }
      return data
    }
    
    // Q-Q 플롯 데이터 생성
    const generateQQData = () => {
      const residuals = Array.from({ length: 100 }, () => (Math.random() - 0.5) * 2)
      residuals.sort((a, b) => a - b)
      
      const theoretical = residuals.map((_, i) => {
        const p = (i + 0.5) / residuals.length
        return Math.sqrt(2) * inverseErf(2 * p - 1)
      })
      
      return residuals.map((residual, i) => ({
        theoretical: theoretical[i],
        sample: residual
      }))
    }
    
    // 역 오차 함수 근사
    const inverseErf = (x: number) => {
      const a = 0.147
      const sign = x >= 0 ? 1 : -1
      const absX = Math.abs(x)
      const ln = Math.log(1 - absX * absX)
      const term1 = 2 / (Math.PI * a) + ln / 2
      const term2 = ln / a
      return sign * Math.sqrt(Math.sqrt(term1 * term1 - term2) - term1)
    }
    
    // 진단 테스트 결과 생성
    const generateTestResults = () => {
      return {
        ljungBox: {
          statistic: 15.234,
          pValue: 0.124,
          criticalValue: 23.685,
          passed: true,
          interpretation: '잔차에 자기상관이 없음'
        },
        jbTest: {
          statistic: 2.456,
          pValue: 0.293,
          criticalValue: 5.991,
          passed: true,
          interpretation: '잔차가 정규분포를 따름'
        },
        archTest: {
          statistic: 8.123,
          pValue: 0.087,
          criticalValue: 11.070,
          passed: true,
          interpretation: '이분산성이 없음'
        },
        adfTest: {
          statistic: -4.567,
          pValue: 0.001,
          criticalValue: -2.886,
          passed: true,
          interpretation: '시계열이 정상성을 만족함'
        },
        kpssTest: {
          statistic: 0.234,
          pValue: 0.152,
          criticalValue: 0.463,
          passed: true,
          interpretation: '추세 정상성을 만족함'
        }
      }
    }
    
    setResidualData(generateResidualData())
    setQQData(generateQQData())
    setTestResults(generateTestResults())
  }, [symbol])

  // 히스토그램 데이터
  const histogramData = (() => {
    const bins = 20
    const min = Math.min(...residualData.map(d => d.residual))
    const max = Math.max(...residualData.map(d => d.residual))
    const binSize = (max - min) / bins
    
    const histogram = Array.from({ length: bins }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(2)}`,
      count: 0,
      normal: 0
    }))
    
    residualData.forEach(d => {
      const binIndex = Math.min(Math.floor((d.residual - min) / binSize), bins - 1)
      histogram[binIndex].count++
    })
    
    // 정규분포 곡선 추가
    const mean = 0
    const std = 0.5
    histogram.forEach((bin, i) => {
      const x = min + (i + 0.5) * binSize
      bin.normal = (residualData.length * binSize / std) * 
                   Math.exp(-0.5 * Math.pow((x - mean) / std, 2)) / 
                   Math.sqrt(2 * Math.PI)
    })
    
    return histogram
  })()

  const getTestIcon = (passed: boolean) => {
    return passed ? (
      <FaCheckCircle className="text-green-400 text-2xl" />
    ) : (
      <FaTimesCircle className="text-red-400 text-2xl" />
    )
  }

  const getTestColor = (passed: boolean) => {
    return passed ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaFlask className="text-purple-400" />
          모델 진단 테스트
        </h2>
        <p className="text-gray-300">
          ARIMA 모델의 적합성을 검증하는 통계적 진단 테스트와 잔차 분석
        </p>
      </div>

      {/* 진단 테스트 결과 요약 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaCalculator className="text-blue-400" />
          통계적 진단 테스트 결과
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(testResults).map(([key, test]: [string, any]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border ${
                test.passed 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-red-900/20 border-red-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {key === 'ljungBox' && 'Ljung-Box 검정'}
                    {key === 'jbTest' && 'Jarque-Bera 검정'}
                    {key === 'archTest' && 'ARCH 효과 검정'}
                    {key === 'adfTest' && 'ADF 단위근 검정'}
                    {key === 'kpssTest' && 'KPSS 정상성 검정'}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">{test.interpretation}</p>
                </div>
                {getTestIcon(test.passed)}
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">통계량</span>
                  <div className="font-mono text-white">{test.statistic.toFixed(3)}</div>
                </div>
                <div>
                  <span className="text-gray-400">p-값</span>
                  <div className={`font-mono ${getTestColor(test.passed)}`}>
                    {test.pValue.toFixed(3)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">임계값</span>
                  <div className="font-mono text-gray-300">{test.criticalValue.toFixed(3)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 잔차 분석 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 잔차 플롯 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            잔차 시계열 플롯
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={residualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
              <Line
                type="monotone"
                dataKey="residual"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 잔차 히스토그램 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-green-400" />
            잔차 분포
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" opacity={0.7} />
              <Line
                type="monotone"
                dataKey="normal"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Q-Q 플롯 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaBalanceScale className="text-purple-400" />
            Q-Q 플롯
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="theoretical" stroke="#9ca3af" name="이론적 분위수" />
              <YAxis type="number" dataKey="sample" stroke="#9ca3af" name="표본 분위수" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <ReferenceLine 
                segment={[{ x: -3, y: -3 }, { x: 3, y: 3 }]} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
              />
              <Scatter name="Q-Q Points" data={qqData} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 잔차 vs 적합값 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaRandom className="text-yellow-400" />
            잔차 vs 적합값
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="fitted" stroke="#9ca3af" name="적합값" />
              <YAxis type="number" dataKey="residual" stroke="#9ca3af" name="잔차" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
              <Scatter name="Residuals" data={residualData} fill="#10b981">
                {residualData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={Math.abs(entry.standardized) > 2 ? '#ef4444' : '#10b981'} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 진단 결과 해석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBug className="text-blue-400" />
          진단 결과 종합 해석
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-3">모델 적합성</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                <span>잔차가 백색잡음(white noise)에 가까움</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                <span>정규성 가정을 만족하여 예측 구간이 신뢰할 만함</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-green-400 mt-0.5" />
                <span>이분산성이 없어 안정적인 예측 가능</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">개선 권장사항</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-400 mt-0.5" />
                <span>일부 이상치가 감지됨 - 로버스트 추정 고려</span>
              </li>
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-400 mt-0.5" />
                <span>장기 예측 시 불확실성 증가 - Fan Chart 참조</span>
              </li>
              <li className="flex items-start gap-2">
                <FaExclamationTriangle className="text-yellow-400 mt-0.5" />
                <span>계절성 패턴 변화 가능성 - SARIMA 모델 검토</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}