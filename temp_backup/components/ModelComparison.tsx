'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, FaRocket, FaTree, FaBolt, FaBrain,
  FaClock, FaMemory, FaChartLine, FaTrophy
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  ScatterChart, Scatter, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Cell
} from 'recharts'

interface ModelComparisonProps {
  symbol: string
}

interface ModelMetrics {
  name: string
  accuracy: number
  trainingTime: number
  predictionTime: number
  memoryUsage: number
  interpretability: number
  robustness: number
  scalability: number
  color: string
  icon: React.ReactNode
}

export default function ModelComparison({ symbol }: ModelComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'speed' | 'efficiency'>('accuracy')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 모델별 성능 데이터
  const models: ModelMetrics[] = [
    {
      name: 'XGBoost',
      accuracy: 92.5,
      trainingTime: 45,
      predictionTime: 0.8,
      memoryUsage: 512,
      interpretability: 85,
      robustness: 90,
      scalability: 88,
      color: '#10b981',
      icon: <FaRocket className="text-green-400" />
    },
    {
      name: 'Random Forest',
      accuracy: 88.3,
      trainingTime: 60,
      predictionTime: 1.2,
      memoryUsage: 768,
      interpretability: 90,
      robustness: 92,
      scalability: 75,
      color: '#f97316',
      icon: <FaTree className="text-orange-400" />
    },
    {
      name: 'LightGBM',
      accuracy: 91.8,
      trainingTime: 30,
      predictionTime: 0.6,
      memoryUsage: 256,
      interpretability: 80,
      robustness: 87,
      scalability: 95,
      color: '#3b82f6',
      icon: <FaBolt className="text-blue-400" />
    },
    {
      name: 'CatBoost',
      accuracy: 90.5,
      trainingTime: 55,
      predictionTime: 0.9,
      memoryUsage: 384,
      interpretability: 82,
      robustness: 93,
      scalability: 85,
      color: '#8b5cf6',
      icon: <FaBrain className="text-purple-400" />
    }
  ]

  // 시계열 성능 데이터
  const performanceOverTime = [
    { epoch: 10, XGBoost: 75, RandomForest: 72, LightGBM: 74, CatBoost: 73 },
    { epoch: 20, XGBoost: 82, RandomForest: 78, LightGBM: 81, CatBoost: 80 },
    { epoch: 30, XGBoost: 86, RandomForest: 83, LightGBM: 85, CatBoost: 84 },
    { epoch: 40, XGBoost: 89, RandomForest: 85, LightGBM: 88, CatBoost: 87 },
    { epoch: 50, XGBoost: 91, RandomForest: 87, LightGBM: 90, CatBoost: 89 },
    { epoch: 60, XGBoost: 92, RandomForest: 88, LightGBM: 91, CatBoost: 90 },
    { epoch: 70, XGBoost: 92.5, RandomForest: 88.3, LightGBM: 91.8, CatBoost: 90.5 }
  ]

  // 레이더 차트 데이터
  const radarData = [
    { metric: '정확도', XGBoost: 92.5, RandomForest: 88.3, LightGBM: 91.8, CatBoost: 90.5 },
    { metric: '학습 속도', XGBoost: 80, RandomForest: 70, LightGBM: 95, CatBoost: 75 },
    { metric: '예측 속도', XGBoost: 85, RandomForest: 75, LightGBM: 90, CatBoost: 83 },
    { metric: '메모리 효율', XGBoost: 70, RandomForest: 60, LightGBM: 90, CatBoost: 80 },
    { metric: '해석 가능성', XGBoost: 85, RandomForest: 90, LightGBM: 80, CatBoost: 82 },
    { metric: '견고성', XGBoost: 90, RandomForest: 92, LightGBM: 87, CatBoost: 93 }
  ]

  // 트레이드오프 분석
  const tradeoffData = models.map(model => ({
    name: model.name,
    x: model.accuracy,
    y: 100 - model.trainingTime,
    z: model.memoryUsage
  }))

  // 승자 결정
  const getWinner = (metric: string) => {
    switch (metric) {
      case 'accuracy':
        return models.reduce((a, b) => a.accuracy > b.accuracy ? a : b)
      case 'speed':
        return models.reduce((a, b) => a.trainingTime < b.trainingTime ? a : b)
      case 'memory':
        return models.reduce((a, b) => a.memoryUsage < b.memoryUsage ? a : b)
      default:
        return models[0]
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaChartBar className="text-yellow-400" />
          모델 성능 비교
        </h2>
        <p className="text-gray-300">
          XGBoost vs Random Forest vs LightGBM vs CatBoost 종합 비교 분석
        </p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {models.map((model, index) => (
          <motion.div
            key={model.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{model.name}</h3>
              {model.icon}
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">정확도</span>
                  <span className="text-white font-bold">{model.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${model.accuracy}%`,
                      backgroundColor: model.color
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">학습</span>
                  <div className="text-white font-semibold">{model.trainingTime}s</div>
                </div>
                <div>
                  <span className="text-gray-400">예측</span>
                  <div className="text-white font-semibold">{model.predictionTime}ms</div>
                </div>
                <div>
                  <span className="text-gray-400">메모리</span>
                  <div className="text-white font-semibold">{model.memoryUsage}MB</div>
                </div>
                <div>
                  <span className="text-gray-400">확장성</span>
                  <div className="text-white font-semibold">{model.scalability}%</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 성능 추이 그래프 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">학습 곡선 비교</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="epoch" stroke="#9ca3af" label={{ value: 'Epochs', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#9ca3af" domain={[70, 95]} label={{ value: '정확도 (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="XGBoost" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="RandomForest" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="LightGBM" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="CatBoost" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 레이더 차트 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">종합 성능 비교</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="XGBoost" dataKey="XGBoost" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Random Forest" dataKey="RandomForest" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
              <Radar name="LightGBM" dataKey="LightGBM" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="CatBoost" dataKey="CatBoost" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 트레이드오프 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          정확도 vs 속도 트레이드오프
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="x" 
                stroke="#9ca3af" 
                domain={[85, 95]}
                label={{ value: '정확도 (%)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="y" 
                stroke="#9ca3af"
                label={{ value: '학습 속도 (역수)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'x') return [`${value}%`, '정확도']
                  if (name === 'y') return [`${100 - value}s`, '학습 시간']
                  if (name === 'z') return [`${value}MB`, '메모리']
                  return [value, name]
                }}
              />
              <Scatter name="Models" data={tradeoffData}>
                {tradeoffData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={models[index].color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">분석 결과</h4>
            
            <div className="space-y-3">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrophy className="text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">정확도 우승</span>
                </div>
                <p className="text-white font-bold">XGBoost (92.5%)</p>
                <p className="text-sm text-gray-400">
                  가장 높은 예측 정확도를 보이며, 복잡한 패턴 학습에 탁월
                </p>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className="text-blue-400" />
                  <span className="text-blue-400 font-semibold">속도 우승</span>
                </div>
                <p className="text-white font-bold">LightGBM (30s)</p>
                <p className="text-sm text-gray-400">
                  가장 빠른 학습 속도로 대용량 데이터 처리에 최적
                </p>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMemory className="text-green-400" />
                  <span className="text-green-400 font-semibold">효율성 우승</span>
                </div>
                <p className="text-white font-bold">LightGBM (256MB)</p>
                <p className="text-sm text-gray-400">
                  최소 메모리 사용으로 리소스 제한 환경에 적합
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 모델 선택 가이드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4">모델 선택 가이드</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
              {models[0].icon}
              XGBoost 추천 상황
            </h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 최고의 정확도가 필요한 경우</li>
              <li>• 중간 규모 데이터셋 (100K~10M)</li>
              <li>• 복잡한 비선형 패턴 존재</li>
              <li>• 충분한 컴퓨팅 자원 보유</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
              {models[1].icon}
              Random Forest 추천 상황
            </h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 해석 가능성이 중요한 경우</li>
              <li>• 과적합 방지가 우선순위</li>
              <li>• 병렬 처리 환경 구축됨</li>
              <li>• 특성 중요도 분석 필요</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              {models[2].icon}
              LightGBM 추천 상황
            </h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 초대용량 데이터셋 (&gt;10M)</li>
              <li>• 실시간 예측이 필요한 경우</li>
              <li>• 메모리 제약이 있는 환경</li>
              <li>• 빠른 프로토타이핑 필요</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
              {models[3].icon}
              CatBoost 추천 상황
            </h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 범주형 변수가 많은 경우</li>
              <li>• 자동 하이퍼파라미터 튜닝</li>
              <li>• GPU 가속이 필요한 경우</li>
              <li>• 강건한 기본 성능 필요</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}