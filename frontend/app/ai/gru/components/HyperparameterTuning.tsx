'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCogs, FaChartLine, FaSearch, FaBrain,
  FaRocket, FaCheckCircle, FaClock, FaDatabase,
  FaAdjust, FaSlidersH, FaFlask, FaMagic
} from 'react-icons/fa'
import {
  LineChart, Line, ScatterChart, Scatter,
  BarChart, Bar, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell,
  AreaChart, Area, ComposedChart
} from 'recharts'

export default function HyperparameterTuning() {
  const [selectedParam, setSelectedParam] = useState('learning_rate')
  const [tuningMethod, setTuningMethod] = useState('bayesian')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [currentTrial, setCurrentTrial] = useState(0)
  const [bestParams, setBestParams] = useState<any>(null)

  // 하이퍼파라미터 정의
  const hyperparameters = {
    learning_rate: {
      name: '학습률',
      current: 0.001,
      min: 0.0001,
      max: 0.1,
      best: 0.0015,
      unit: '',
      description: '모델이 학습하는 속도를 조절'
    },
    hidden_units: {
      name: '은닉 유닛',
      current: 128,
      min: 32,
      max: 512,
      best: 256,
      unit: '개',
      description: 'GRU 레이어의 뉴런 수'
    },
    dropout_rate: {
      name: '드롭아웃',
      current: 0.2,
      min: 0,
      max: 0.5,
      best: 0.3,
      unit: '',
      description: '과적합 방지를 위한 드롭아웃 비율'
    },
    sequence_length: {
      name: '시퀀스 길이',
      current: 50,
      min: 10,
      max: 200,
      best: 100,
      unit: '스텝',
      description: '입력 시계열의 길이'
    },
    batch_size: {
      name: '배치 크기',
      current: 32,
      min: 16,
      max: 128,
      best: 64,
      unit: '개',
      description: '한 번에 처리하는 샘플 수'
    },
    num_layers: {
      name: '레이어 수',
      current: 2,
      min: 1,
      max: 5,
      best: 3,
      unit: '층',
      description: 'GRU 레이어의 깊이'
    }
  }

  // 베이지안 최적화 시뮬레이션 데이터
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([])
  
  useEffect(() => {
    if (isOptimizing && currentTrial < 50) {
      const timer = setTimeout(() => {
        const newTrial = {
          trial: currentTrial + 1,
          learning_rate: 0.0001 + Math.random() * 0.01,
          hidden_units: Math.floor(32 + Math.random() * 480),
          dropout_rate: Math.random() * 0.5,
          accuracy: 75 + Math.random() * 20,
          loss: 0.5 - Math.random() * 0.4,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
        
        setOptimizationHistory(prev => [...prev, newTrial])
        setCurrentTrial(prev => prev + 1)
        
        // 최고 성능 파라미터 업데이트
        if (!bestParams || newTrial.accuracy > bestParams.accuracy) {
          setBestParams(newTrial)
        }
      }, 500)
      
      return () => clearTimeout(timer)
    } else if (currentTrial >= 50) {
      setIsOptimizing(false)
    }
  }, [isOptimizing, currentTrial, bestParams])

  // 파라미터 중요도 데이터
  const paramImportance = [
    { parameter: '학습률', importance: 92, impact: 'high' },
    { parameter: '은닉 유닛', importance: 85, impact: 'high' },
    { parameter: '시퀀스 길이', importance: 78, impact: 'medium' },
    { parameter: '드롭아웃', importance: 65, impact: 'medium' },
    { parameter: '배치 크기', importance: 55, impact: 'low' },
    { parameter: '레이어 수', importance: 70, impact: 'medium' }
  ]

  // 파라미터 상호작용 매트릭스
  const paramInteractions = [
    { x: 'learning_rate', y: 'batch_size', interaction: 0.8 },
    { x: 'hidden_units', y: 'num_layers', interaction: 0.9 },
    { x: 'dropout_rate', y: 'hidden_units', interaction: 0.7 },
    { x: 'sequence_length', y: 'batch_size', interaction: 0.6 }
  ]

  // 최적화 방법별 비교
  const optimizationMethods = [
    { method: 'Grid Search', speed: 30, accuracy: 95, efficiency: 40 },
    { method: 'Random Search', speed: 60, accuracy: 85, efficiency: 70 },
    { method: 'Bayesian', speed: 80, accuracy: 92, efficiency: 90 },
    { method: 'Genetic Algorithm', speed: 70, accuracy: 88, efficiency: 75 }
  ]

  const startOptimization = () => {
    setIsOptimizing(true)
    setCurrentTrial(0)
    setOptimizationHistory([])
    setBestParams(null)
  }

  const stopOptimization = () => {
    setIsOptimizing(false)
  }

  return (
    <div className="space-y-6">
      {/* 최적화 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <FaMagic className="text-green-500" />
            베이지안 하이퍼파라미터 최적화
          </h3>
          
          <div className="flex items-center gap-4">
            <select
              value={tuningMethod}
              onChange={(e) => {
                if (e && e.target && e.target.value) {
                  setTuningMethod(e.target.value)
                }
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="bayesian">베이지안 최적화</option>
              <option value="grid">그리드 서치</option>
              <option value="random">랜덤 서치</option>
              <option value="genetic">유전 알고리즘</option>
            </select>
            
            {!isOptimizing ? (
              <button
                onClick={startOptimization}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <FaRocket />
                최적화 시작
              </button>
            ) : (
              <button
                onClick={stopOptimization}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <FaClock />
                중지
              </button>
            )}
          </div>
        </div>

        {/* 진행 상황 */}
        {isOptimizing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">최적화 진행률</span>
              <span className="text-white">{currentTrial} / 50 trials</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentTrial / 50) * 100}%` }}
                className="h-full bg-gradient-to-r from-green-600 to-green-400"
              />
            </div>
          </div>
        )}

        {/* 최고 성능 파라미터 */}
        {bestParams && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-900/20 rounded-lg border border-green-500/30"
          >
            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              <FaCheckCircle />
              현재까지 최고 성능 파라미터
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">정확도:</span>
                <span className="text-white font-semibold ml-2">{bestParams.accuracy.toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-gray-400">학습률:</span>
                <span className="text-white font-semibold ml-2">{bestParams.learning_rate.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-400">은닉 유닛:</span>
                <span className="text-white font-semibold ml-2">{bestParams.hidden_units}</span>
              </div>
              <div>
                <span className="text-gray-400">드롭아웃:</span>
                <span className="text-white font-semibold ml-2">{bestParams.dropout_rate.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 파라미터 슬라이더 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
          <FaSlidersH className="text-green-500" />
          하이퍼파라미터 조정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(hyperparameters).map(([key, param]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">{param.name}</span>
                <span className="text-green-400 font-mono">
                  {param.current}{param.unit}
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  value={param.current}
                  onChange={() => {}} // 읽기 전용 슬라이더
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${
                      ((param.current - param.min) / (param.max - param.min)) * 100
                    }%, #374151 ${
                      ((param.current - param.min) / (param.max - param.min)) * 100
                    }%, #374151 100%)`
                  }}
                />
                <div
                  className="absolute top-4 left-0 text-xs text-gray-500"
                  style={{ left: `${((param.best - param.min) / (param.max - param.min)) * 100}%` }}
                >
                  <div className="w-0.5 h-3 bg-yellow-500 mb-1" />
                  <span className="relative -left-2">최적</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">{param.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 최적화 히스토리 */}
      {optimizationHistory.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">최적화 히스토리</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={optimizationHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="trial" stroke="#9ca3af" />
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
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 3 }}
                name="정확도 (%)"
              />
              <Line
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }}
                name="손실"
                yAxisId="right"
              />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 파라미터 중요도 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">파라미터 중요도</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paramImportance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="parameter" type="category" stroke="#9ca3af" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="importance" fill="#10b981">
                {paramImportance.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.impact === 'high' ? '#10b981' :
                      entry.impact === 'medium' ? '#f59e0b' :
                      '#3b82f6'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">최적화 방법 비교</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={optimizationMethods}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="method" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar
                name="성능 지표"
                dataKey="efficiency"
                stroke="#10b981"
                fill="#10b981"
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
      </div>

      {/* 파라미터 조합 추천 */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaFlask className="text-green-400" />
          추천 하이퍼파라미터 조합
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-3">고속 트레이딩</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">학습률:</span>
                <span className="text-white font-mono">0.001</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">은닉 유닛:</span>
                <span className="text-white font-mono">128</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">시퀀스 길이:</span>
                <span className="text-white font-mono">30</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">레이어 수:</span>
                <span className="text-white font-mono">2</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-3">균형잡힌 성능</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">학습률:</span>
                <span className="text-white font-mono">0.0015</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">은닉 유닛:</span>
                <span className="text-white font-mono">256</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">시퀀스 길이:</span>
                <span className="text-white font-mono">100</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">레이어 수:</span>
                <span className="text-white font-mono">3</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-3">고정밀 예측</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">학습률:</span>
                <span className="text-white font-mono">0.0005</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">은닉 유닛:</span>
                <span className="text-white font-mono">512</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">시퀀스 길이:</span>
                <span className="text-white font-mono">200</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">레이어 수:</span>
                <span className="text-white font-mono">4</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}