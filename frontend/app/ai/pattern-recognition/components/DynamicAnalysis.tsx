'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaRobot, FaBrain, FaChartLine, FaLightbulb,
  FaCogs, FaCheckCircle, FaExclamationTriangle, FaTachometerAlt
} from 'react-icons/fa'
import { BiAnalyse } from 'react-icons/bi'
import { 
  LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, BarChart, Bar
} from 'recharts'

interface DynamicAnalysisProps {
  symbol: string
  timeframe: string
}

export default function DynamicAnalysis({ symbol, timeframe }: DynamicAnalysisProps) {
  const [analysisMode, setAnalysisMode] = useState('pattern')
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 동적 분석 실행
  useEffect(() => {
    runDynamicAnalysis()
  }, [symbol, timeframe])

  const runDynamicAnalysis = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setConfidenceScore(85 + Math.floor(Math.random() * 10))
      setIsAnalyzing(false)
    }, 2000)
  }

  // 패턴 강도 레이더 데이터
  const patternStrengthData = [
    { metric: '신뢰도', value: 88, fullMark: 100 },
    { metric: '거래량', value: 75, fullMark: 100 },
    { metric: '모멘텀', value: 82, fullMark: 100 },
    { metric: '추세강도', value: 91, fullMark: 100 },
    { metric: '변동성', value: 65, fullMark: 100 },
    { metric: '시장센티', value: 78, fullMark: 100 }
  ]

  // 시간대별 성능
  const timeframePerformance = [
    { timeframe: '1분', accuracy: 68, patterns: 120, profit: -2.3 },
    { timeframe: '5분', accuracy: 72, patterns: 85, profit: 3.5 },
    { timeframe: '15분', accuracy: 78, patterns: 52, profit: 8.2 },
    { timeframe: '1시간', accuracy: 85, patterns: 28, profit: 15.7 },
    { timeframe: '4시간', accuracy: 88, patterns: 12, profit: 22.4 },
    { timeframe: '1일', accuracy: 91, patterns: 5, profit: 35.6 }
  ]

  // AI 예측 시나리오
  const scenarios = [
    {
      scenario: '기본 시나리오',
      probability: 65,
      target: 52800,
      stopLoss: 48200,
      riskReward: 2.8,
      description: '현재 패턴이 정상적으로 완성될 경우'
    },
    {
      scenario: '강세 시나리오',
      probability: 25,
      target: 55200,
      stopLoss: 49500,
      riskReward: 3.5,
      description: '거래량 증가와 함께 돌파할 경우'
    },
    {
      scenario: '약세 시나리오',
      probability: 10,
      target: 47500,
      stopLoss: 51000,
      riskReward: 0.8,
      description: '패턴 무효화 및 하락 전환'
    }
  ]

  // 실시간 신호 강도
  const signalStrength = [
    { time: '09:00', strength: 45 },
    { time: '10:00', strength: 52 },
    { time: '11:00', strength: 68 },
    { time: '12:00', strength: 75 },
    { time: '13:00', strength: 82 },
    { time: '14:00', strength: 88 },
    { time: '15:00', strength: 85 }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <BiAnalyse className="text-purple-400" />
          AI 동적 패턴 분석
        </h3>
        <p className="text-gray-400">
          실시간으로 변화하는 시장 상황에 맞춰 패턴 분석을 동적으로 조정합니다
        </p>
      </div>

      {/* 분석 모드 선택 */}
      <div className="flex gap-2 justify-center">
        {['pattern', 'momentum', 'volume', 'sentiment'].map((mode) => (
          <button
            key={mode}
            onClick={() => setAnalysisMode(mode)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
              analysisMode === mode
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {mode === 'pattern' ? '패턴 분석' :
             mode === 'momentum' ? '모멘텀 분석' :
             mode === 'volume' ? '거래량 분석' : '센티먼트'}
          </button>
        ))}
      </div>

      {/* 종합 신뢰도 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-white flex items-center gap-2">
            <FaTachometerAlt className="text-purple-400" />
            종합 분석 신뢰도
          </h4>
          <button
            onClick={runDynamicAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-50"
          >
            {isAnalyzing ? '분석 중...' : '재분석'}
          </button>
        </div>

        <div className="relative h-32">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-6xl font-bold ${
                confidenceScore >= 80 ? 'text-green-400' :
                confidenceScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {confidenceScore}%
              </div>
              <p className="text-gray-400 mt-2">
                {confidenceScore >= 80 ? '매우 신뢰할 수 있음' :
                 confidenceScore >= 60 ? '신뢰할 수 있음' : '주의 필요'}
              </p>
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="50%"
              cy="50%"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - confidenceScore / 100)}`}
              className={`transition-all duration-1000 ${
                confidenceScore >= 80 ? 'text-green-400' :
                confidenceScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}
            />
          </svg>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 패턴 강도 레이더 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">패턴 강도 분석</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={patternStrengthData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="현재 강도"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 신호 강도 추이 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">신호 강도 추이</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={signalStrength}>
              <defs>
                <linearGradient id="signalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="strength"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#signalGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시간대별 성능 분석 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">시간대별 최적 성능</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeframePerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="timeframe" stroke="#9ca3af" />
            <YAxis yAxisId="left" stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="accuracy" name="정확도 %" fill="#8b5cf6" />
            <Bar yAxisId="right" dataKey="profit" name="수익률 %">
              {timeframePerformance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.profit > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI 예측 시나리오 */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          AI 예측 시나리오
        </h4>
        {scenarios.map((scenario, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border ${
              scenario.scenario === '기본 시나리오' ? 'border-purple-500/50' : 'border-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h5 className="text-lg font-bold text-white">{scenario.scenario}</h5>
                <p className="text-gray-400 text-sm">{scenario.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{scenario.probability}%</div>
                <div className="text-sm text-gray-400">확률</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">목표가</p>
                <p className="text-lg font-semibold text-green-400">
                  ${scenario.target.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">손절가</p>
                <p className="text-lg font-semibold text-red-400">
                  ${scenario.stopLoss.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">손익비</p>
                <p className="text-lg font-semibold text-purple-400">
                  1:{scenario.riskReward}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 권장 사항 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCogs className="text-purple-400" />
          AI 권장 사항
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 mt-1" />
            <div>
              <p className="text-white font-semibold">최적 시간대: 4시간봉</p>
              <p className="text-gray-400 text-sm">88% 정확도, 가장 안정적인 신호</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 mt-1" />
            <div>
              <p className="text-white font-semibold">권장 포지션: 30% Long</p>
              <p className="text-gray-400 text-sm">기본 시나리오 기준, 손절가 엄격 준수</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-400 mt-1" />
            <div>
              <p className="text-white font-semibold">주의사항</p>
              <p className="text-gray-400 text-sm">거래량 감소 시 패턴 신뢰도 하락 가능</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}