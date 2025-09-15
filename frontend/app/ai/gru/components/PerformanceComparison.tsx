'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaChartBar, FaClock, FaMemory, FaBrain,
  FaCheckCircle, FaTimesCircle, FaExchangeAlt,
  FaTachometerAlt, FaDatabase, FaMicrochip
} from 'react-icons/fa'
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, Area, AreaChart,
  ScatterChart, Scatter, ComposedChart
} from 'recharts'
import CountUp from 'react-countup'

export default function PerformanceComparison() {
  const [selectedMetric, setSelectedMetric] = useState('accuracy')
  const [timeframe, setTimeframe] = useState('1h')

  // 모델별 성능 데이터
  const modelComparison = [
    { 
      model: 'GRU',
      accuracy: 89.5,
      speed: 95,
      memory: 67,
      parameters: 3200000,
      trainingTime: 45,
      inferenceTime: 0.3,
      color: '#10b981'
    },
    { 
      model: 'LSTM',
      accuracy: 91.2,
      speed: 75,
      memory: 100,
      parameters: 4800000,
      trainingTime: 90,
      inferenceTime: 0.5,
      color: '#8b5cf6'
    },
    { 
      model: 'Vanilla RNN',
      accuracy: 75.3,
      speed: 100,
      memory: 50,
      parameters: 1600000,
      trainingTime: 30,
      inferenceTime: 0.2,
      color: '#f59e0b'
    },
    { 
      model: 'Transformer',
      accuracy: 93.1,
      speed: 60,
      memory: 150,
      parameters: 12000000,
      trainingTime: 180,
      inferenceTime: 0.8,
      color: '#ef4444'
    }
  ]

  // 시간대별 성능 데이터
  const timeframePerformance = {
    '1m': [
      { metric: '정확도', GRU: 92, LSTM: 90 },
      { metric: '속도', GRU: 98, LSTM: 80 },
      { metric: '안정성', GRU: 85, LSTM: 88 }
    ],
    '5m': [
      { metric: '정확도', GRU: 90, LSTM: 91 },
      { metric: '속도', GRU: 96, LSTM: 78 },
      { metric: '안정성', GRU: 87, LSTM: 89 }
    ],
    '1h': [
      { metric: '정확도', GRU: 88, LSTM: 92 },
      { metric: '속도', GRU: 95, LSTM: 75 },
      { metric: '안정성', GRU: 89, LSTM: 91 }
    ],
    '1d': [
      { metric: '정확도', GRU: 85, LSTM: 93 },
      { metric: '속도', GRU: 94, LSTM: 73 },
      { metric: '안정성', GRU: 91, LSTM: 94 }
    ]
  }

  // 실시간 성능 추적 데이터
  const [realtimeData, setRealtimeData] = useState<any[]>([])
  
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        GRU_speed: 90 + Math.random() * 10,
        LSTM_speed: 70 + Math.random() * 10,
        GRU_accuracy: 85 + Math.random() * 10,
        LSTM_accuracy: 87 + Math.random() * 10
      }
      setRealtimeData(prev => [...prev.slice(-20), newData])
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // 장단점 비교 데이터
  const prosConsData = {
    GRU: {
      pros: [
        '빠른 학습 속도 (2x faster)',
        '적은 메모리 사용량 (-33%)',
        '간단한 구조로 디버깅 용이',
        '실시간 처리에 최적',
        '과적합 위험 감소'
      ],
      cons: [
        '복잡한 장기 의존성 처리 한계',
        '극도로 긴 시퀀스에서 성능 저하',
        'Cell State 없어 정보 손실 가능'
      ]
    },
    LSTM: {
      pros: [
        '우수한 장기 의존성 학습',
        'Cell State로 정보 보존',
        '복잡한 패턴 인식 능력',
        '검증된 안정성',
        '다양한 사전학습 모델'
      ],
      cons: [
        '느린 학습 속도',
        '많은 메모리 요구량',
        '복잡한 구조',
        '하이퍼파라미터 튜닝 어려움'
      ]
    }
  }

  // 작업별 적합도
  const taskSuitability = [
    { task: '단기 예측', GRU: 95, LSTM: 85 },
    { task: '장기 예측', GRU: 75, LSTM: 90 },
    { task: '실시간 처리', GRU: 98, LSTM: 70 },
    { task: '대용량 배치', GRU: 80, LSTM: 85 },
    { task: '모바일 배포', GRU: 90, LSTM: 60 },
    { task: '정밀도 요구', GRU: 85, LSTM: 92 }
  ]

  return (
    <div className="space-y-6">
      {/* 주요 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: '학습 속도',
            gruValue: '2x',
            lstmValue: '1x',
            icon: FaClock,
            color: 'green'
          },
          {
            title: '메모리 사용',
            gruValue: '67%',
            lstmValue: '100%',
            icon: FaMemory,
            color: 'blue'
          },
          {
            title: '파라미터 수',
            gruValue: '3.2M',
            lstmValue: '4.8M',
            icon: FaBrain,
            color: 'purple'
          },
          {
            title: '추론 시간',
            gruValue: '0.3s',
            lstmValue: '0.5s',
            icon: FaTachometerAlt,
            color: 'yellow'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className={`text-2xl text-${metric.color}-400`} />
              <span className="text-sm text-gray-400">{metric.title}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-400">GRU</span>
                <span className="text-xl font-bold text-white">{metric.gruValue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-400">LSTM</span>
                <span className="text-xl font-bold text-white">{metric.lstmValue}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 종합 성능 비교 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaChartBar className="text-green-500" />
          모델별 종합 성능 비교
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={modelComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="model" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="accuracy" name="정확도 (%)" fill="#10b981" />
            <Bar dataKey="speed" name="속도 (%)" fill="#3b82f6" />
            <Bar dataKey="memory" name="메모리 효율 (%)" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 시간대별 성능 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">시간대별 성능 비교</h3>
          
          <div className="flex gap-2 mb-4">
            {['1m', '5m', '1h', '1d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  timeframe === tf
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={timeframePerformance[timeframe as keyof typeof timeframePerformance]}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="GRU"
                dataKey="GRU"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Radar
                name="LSTM"
                dataKey="LSTM"
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
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">작업별 적합도</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskSuitability} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="task" type="category" stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="GRU" fill="#10b981" />
              <Bar dataKey="LSTM" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 실시간 성능 추적 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaTachometerAlt className="text-green-500" />
          실시간 성능 모니터링
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={realtimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="GRU_speed"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="GRU 속도"
            />
            <Line
              type="monotone"
              dataKey="LSTM_speed"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="LSTM 속도"
            />
            <Line
              type="monotone"
              dataKey="GRU_accuracy"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="GRU 정확도"
            />
            <Line
              type="monotone"
              dataKey="LSTM_accuracy"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="LSTM 정확도"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 장단점 비교 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-900/20 to-gray-900 rounded-xl p-6 border border-green-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaMicrochip className="text-green-400" />
            GRU 장단점
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <FaCheckCircle />
                장점
              </h4>
              <ul className="space-y-2">
                {prosConsData.GRU.pros.map((pro, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <FaTimesCircle />
                단점
              </h4>
              <ul className="space-y-2">
                {prosConsData.GRU.cons.map((con, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <FaBrain className="text-purple-400" />
            LSTM 장단점
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                <FaCheckCircle />
                장점
              </h4>
              <ul className="space-y-2">
                {prosConsData.LSTM.pros.map((pro, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                <FaTimesCircle />
                단점
              </h4>
              <ul className="space-y-2">
                {prosConsData.LSTM.cons.map((con, index) => (
                  <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 최종 권장사항 */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaExchangeAlt className="text-green-400" />
          선택 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-green-400 font-semibold mb-3">GRU를 선택해야 할 때</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                실시간 예측이 중요한 경우
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                리소스가 제한된 환경
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                단기 예측 (1시간 이내)
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                빠른 학습과 배포가 필요한 경우
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-purple-400 font-semibold mb-3">LSTM을 선택해야 할 때</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-purple-400" />
                장기 의존성이 중요한 경우
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-purple-400" />
                높은 정확도가 필수인 경우
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-purple-400" />
                복잡한 패턴 인식이 필요한 경우
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-purple-400" />
                충분한 컴퓨팅 리소스가 있는 경우
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}