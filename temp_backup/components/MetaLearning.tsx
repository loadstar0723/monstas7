'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaLightbulb, FaBrain, FaChartLine, FaGraduationCap,
  FaSync, FaCheckCircle, FaCogs, FaRocket
} from 'react-icons/fa'
import { BiNetworkChart } from 'react-icons/bi'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

interface MetaLearningProps {
  symbol: string
}

export default function MetaLearning({ symbol }: MetaLearningProps) {
  const [learningMode, setLearningMode] = useState('adaptive')

  // 메타러닝 성능 데이터
  const metaPerformance = [
    { time: '1주전', baseline: 85.2, metaLearning: 87.5, improvement: 2.3 },
    { time: '6일전', baseline: 86.1, metaLearning: 88.9, improvement: 2.8 },
    { time: '5일전', baseline: 86.5, metaLearning: 89.7, improvement: 3.2 },
    { time: '4일전', baseline: 87.2, metaLearning: 90.8, improvement: 3.6 },
    { time: '3일전', baseline: 87.8, metaLearning: 91.9, improvement: 4.1 },
    { time: '2일전', baseline: 88.3, metaLearning: 92.7, improvement: 4.4 },
    { time: '1일전', baseline: 88.9, metaLearning: 93.5, improvement: 4.6 },
    { time: '현재', baseline: 89.4, metaLearning: 94.2, improvement: 4.8 }
  ]

  // 학습 전략 데이터
  const learningStrategies = [
    {
      name: '적응형 학습',
      id: 'adaptive',
      description: '시장 상황에 따라 동적으로 학습 전략 조정',
      effectiveness: 92,
      speed: 85,
      stability: 88
    },
    {
      name: '전이 학습',
      id: 'transfer',
      description: '다른 자산의 학습 경험을 활용',
      effectiveness: 88,
      speed: 95,
      stability: 82
    },
    {
      name: '연합 학습',
      id: 'federated',
      description: '분산된 데이터에서 협력적 학습',
      effectiveness: 86,
      speed: 78,
      stability: 94
    },
    {
      name: '강화 학습',
      id: 'reinforcement',
      description: '보상 기반 최적화 학습',
      effectiveness: 90,
      speed: 72,
      stability: 85
    }
  ]

  // 지식 전이 매트릭스
  const knowledgeTransfer = [
    { from: 'BTC', to: 'ETH', transferRate: 82, effectiveness: 88 },
    { from: 'BTC', to: 'BNB', transferRate: 78, effectiveness: 85 },
    { from: 'ETH', to: 'SOL', transferRate: 75, effectiveness: 83 },
    { from: 'Stock Market', to: 'Crypto', transferRate: 65, effectiveness: 72 },
    { from: 'Forex', to: 'Crypto', transferRate: 58, effectiveness: 68 }
  ]

  // 학습 곡선 데이터
  const learningCurve = [
    { epoch: 0, loss: 0.95, accuracy: 72, valAccuracy: 70 },
    { epoch: 10, loss: 0.72, accuracy: 81, valAccuracy: 79 },
    { epoch: 20, loss: 0.55, accuracy: 86, valAccuracy: 84 },
    { epoch: 30, loss: 0.42, accuracy: 89, valAccuracy: 87 },
    { epoch: 40, loss: 0.35, accuracy: 91, valAccuracy: 89 },
    { epoch: 50, loss: 0.28, accuracy: 92.5, valAccuracy: 91 },
    { epoch: 60, loss: 0.23, accuracy: 93.5, valAccuracy: 92 },
    { epoch: 70, loss: 0.19, accuracy: 94.2, valAccuracy: 93 }
  ]

  // 적응형 성능 지표
  const adaptiveMetrics = [
    { metric: '시장 변화 감지', score: 95, trend: 'up' },
    { metric: '전략 전환 속도', score: 88, trend: 'stable' },
    { metric: '과적합 방지', score: 92, trend: 'up' },
    { metric: '일반화 능력', score: 90, trend: 'up' },
    { metric: '노이즈 필터링', score: 87, trend: 'stable' },
    { metric: '패턴 학습', score: 94, trend: 'up' }
  ]

  // 메타 최적화 결과
  const metaOptimization = [
    { parameter: '학습률', before: 0.001, after: 0.0008, improvement: '+12%' },
    { parameter: '배치 크기', before: 64, after: 48, improvement: '+8%' },
    { parameter: '드롭아웃', before: 0.3, after: 0.25, improvement: '+5%' },
    { parameter: '모멘텀', before: 0.9, after: 0.92, improvement: '+3%' },
    { parameter: '정규화', before: 0.01, after: 0.008, improvement: '+7%' }
  ]

  const selectedStrategy = learningStrategies.find(s => s.id === learningMode)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <FaLightbulb className="text-yellow-400" />
          메타러닝 & 적응형 최적화
        </h3>
        <p className="text-gray-400">
          {symbol} - 학습의 학습을 통한 지속적 성능 개선
        </p>
      </div>

      {/* 주요 성과 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">성능 향상</span>
            <FaRocket className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">+4.8%</div>
          <div className="text-xs text-gray-400 mt-1">메타러닝 효과</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">학습 속도</span>
            <FaSync className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">3x</div>
          <div className="text-xs text-gray-400 mt-1">빠른 수렴</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">지식 전이</span>
            <BiNetworkChart className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">82%</div>
          <div className="text-xs text-gray-400 mt-1">효율성</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">적응 시간</span>
            <FaCogs className="text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">2.5분</div>
          <div className="text-xs text-gray-400 mt-1">시장 변화 대응</div>
        </motion.div>
      </div>

      {/* 학습 전략 선택 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">메타러닝 전략</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {learningStrategies.map((strategy) => (
            <motion.button
              key={strategy.id}
              onClick={() => setLearningMode(strategy.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border transition-all ${
                learningMode === strategy.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400'
                  : 'bg-gray-700/30 border-gray-600/50 hover:border-gray-500'
              }`}
            >
              <h5 className="text-lg font-semibold text-white mb-2">{strategy.name}</h5>
              <p className="text-sm text-gray-300 mb-3">{strategy.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">효과성</span>
                  <span className="text-white">{strategy.effectiveness}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">속도</span>
                  <span className="text-white">{strategy.speed}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">안정성</span>
                  <span className="text-white">{strategy.stability}%</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 메타러닝 성능 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">메타러닝 성능 향상</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={metaPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[80, 95]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="#6b7280"
              fill="#6b7280"
              fillOpacity={0.3}
              name="기본 성능"
            />
            <Area
              type="monotone"
              dataKey="metaLearning"
              stroke="#a78bfa"
              fill="#a78bfa"
              fillOpacity={0.5}
              name="메타러닝 적용"
            />
            <Line
              type="monotone"
              dataKey="improvement"
              stroke="#10b981"
              strokeWidth={2}
              name="향상도"
              yAxisId="right"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 학습 곡선 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">학습 곡선</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={learningCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9ca3af" />
              <YAxis yAxisId="left" stroke="#9ca3af" domain={[0, 1]} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" domain={[70, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                strokeWidth={2}
                name="손실"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                name="정확도"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="valAccuracy"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="검증 정확도"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 적응형 성능 지표 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-4">적응형 성능 지표</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={adaptiveMetrics}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="현재 성능"
                dataKey="score"
                stroke="#a78bfa"
                fill="#a78bfa"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 지식 전이 매트릭스 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4">지식 전이 효과</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400">소스</th>
                <th className="text-left py-3 text-gray-400">타겟</th>
                <th className="text-center py-3 text-gray-400">전이율</th>
                <th className="text-center py-3 text-gray-400">효과성</th>
                <th className="text-center py-3 text-gray-400">상태</th>
              </tr>
            </thead>
            <tbody>
              {knowledgeTransfer.map((item, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 text-white">{item.from}</td>
                  <td className="py-3 text-white">{item.to}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.transferRate >= 80 ? 'bg-green-500/20 text-green-400' :
                      item.transferRate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.transferRate}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="text-white">{item.effectiveness}%</span>
                  </td>
                  <td className="py-3 text-center">
                    <FaCheckCircle className="text-green-400 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 메타 최적화 결과 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaGraduationCap className="text-purple-400" />
          메타 최적화 결과
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metaOptimization.map((param, index) => (
            <div key={index} className="bg-gray-800/30 rounded-lg p-4">
              <h5 className="text-white font-semibold mb-2">{param.parameter}</h5>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">{param.before}</span>
                <span className="text-gray-400">→</span>
                <span className="text-purple-400 font-bold">{param.after}</span>
              </div>
              <div className="text-green-400 text-sm mt-2">
                {param.improvement} 성능 향상
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 다음 단계 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBrain className="text-yellow-400" />
          메타러닝 진화 방향
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔮</div>
            <h5 className="text-white font-semibold mb-2">자가 진화</h5>
            <p className="text-gray-400 text-sm">
              스스로 학습 전략을 개선하는 자율 시스템
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🌐</div>
            <h5 className="text-white font-semibold mb-2">크로스 도메인</h5>
            <p className="text-gray-400 text-sm">
              다양한 시장과 자산 간 지식 공유
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">⚡</div>
            <h5 className="text-white font-semibold mb-2">실시간 적응</h5>
            <p className="text-gray-400 text-sm">
              밀리초 단위의 시장 변화 대응
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}