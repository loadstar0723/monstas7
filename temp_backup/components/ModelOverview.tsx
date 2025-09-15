'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaRocket, FaBrain, FaTree, FaChartLine, FaCogs,
  FaMedal, FaLightbulb, FaCode, FaAtom, FaLayerGroup
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'

interface ModelOverviewProps {
  symbol: string
}

export default function ModelOverview({ symbol }: ModelOverviewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // XGBoost vs 다른 모델 비교 데이터
  const modelComparison = [
    { metric: '예측 정확도', XGBoost: 92, RandomForest: 88, LSTM: 85, LightGBM: 91 },
    { metric: '학습 속도', XGBoost: 85, RandomForest: 70, LSTM: 60, LightGBM: 95 },
    { metric: '메모리 효율', XGBoost: 80, RandomForest: 60, LSTM: 50, LightGBM: 90 },
    { metric: '해석 가능성', XGBoost: 85, RandomForest: 90, LSTM: 40, LightGBM: 80 },
    { metric: '과적합 저항', XGBoost: 88, RandomForest: 85, LSTM: 70, LightGBM: 87 },
    { metric: '실시간 예측', XGBoost: 90, RandomForest: 85, LSTM: 95, LightGBM: 92 }
  ]

  // XGBoost 하이퍼파라미터
  const hyperparameters = [
    { name: 'n_estimators', value: 100, description: '트리 개수', range: '50-1000' },
    { name: 'max_depth', value: 6, description: '최대 깊이', range: '3-10' },
    { name: 'learning_rate', value: 0.3, description: '학습률', range: '0.01-0.3' },
    { name: 'subsample', value: 0.8, description: '샘플링 비율', range: '0.5-1.0' },
    { name: 'colsample_bytree', value: 0.8, description: '특성 샘플링', range: '0.3-1.0' },
    { name: 'gamma', value: 0.1, description: '분할 규제', range: '0-5' },
    { name: 'reg_alpha', value: 0.1, description: 'L1 규제', range: '0-1' },
    { name: 'reg_lambda', value: 1.0, description: 'L2 규제', range: '0-1' }
  ]

  // XGBoost 특징
  const features = [
    {
      icon: <FaRocket className="text-4xl text-green-400" />,
      title: '극한의 성능',
      description: '병렬 처리와 최적화로 초고속 학습 및 예측'
    },
    {
      icon: <FaTree className="text-4xl text-blue-400" />,
      title: '그래디언트 부스팅',
      description: '순차적으로 트리를 추가하며 이전 오류를 보정'
    },
    {
      icon: <FaBrain className="text-4xl text-purple-400" />,
      title: '지능형 규제',
      description: 'L1/L2 규제로 과적합 방지 및 일반화 성능 향상'
    },
    {
      icon: <FaLayerGroup className="text-4xl text-yellow-400" />,
      title: '특성 중요도',
      description: '각 특성의 기여도를 정확히 계산하여 해석 가능'
    }
  ]

  // 수학적 공식
  const mathFormulas = [
    {
      name: '목적 함수',
      formula: 'L(θ) = ∑ᵢ l(yᵢ, ŷᵢ) + ∑ₖ Ω(fₖ)',
      description: '손실 함수와 규제 항의 합'
    },
    {
      name: '트리 추가',
      formula: 'ŷᵢ⁽ᵗ⁾ = ŷᵢ⁽ᵗ⁻¹⁾ + fᵗ(xᵢ)',
      description: '이전 예측에 새 트리를 더해 개선'
    },
    {
      name: 'Taylor 근사',
      formula: 'L⁽ᵗ⁾ ≈ ∑ᵢ [gᵢfᵗ(xᵢ) + ½hᵢfᵗ²(xᵢ)] + Ω(fᵗ)',
      description: '2차 Taylor 근사로 최적화'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaRocket className="text-green-400" />
          XGBoost (eXtreme Gradient Boosting)
        </h2>
        <p className="text-gray-300">
          Kaggle 대회에서 가장 많이 사용되는 최강의 머신러닝 알고리즘
        </p>
      </div>

      {/* 주요 특징 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center hover:border-green-500/50 transition-all"
          >
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* 모델 비교 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMedal className="text-yellow-400" />
          모델 성능 비교
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={modelComparison}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
            <Radar name="XGBoost" dataKey="XGBoost" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Radar name="Random Forest" dataKey="RandomForest" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
            <Radar name="LSTM" dataKey="LSTM" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
            <Radar name="LightGBM" dataKey="LightGBM" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
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
      </motion.div>

      {/* 하이퍼파라미터 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCogs className="text-blue-400" />
          하이퍼파라미터 설정
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hyperparameters.map((param, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-400">{param.name}</span>
                <span className="text-sm text-gray-400">{param.range}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{param.description}</span>
                <span className="text-lg font-bold text-white">{param.value}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${((param.value - parseFloat(param.range.split('-')[0])) / 
                      (parseFloat(param.range.split('-')[1]) - parseFloat(param.range.split('-')[0]))) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 수학적 기초 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCode className="text-purple-400" />
          수학적 기초
        </h3>
        
        <div className="space-y-4">
          {mathFormulas.map((formula, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">{formula.name}</h4>
              <div className="bg-gray-900/50 rounded p-3 mb-2 font-mono text-center text-lg">
                {formula.formula}
              </div>
              <p className="text-sm text-gray-400">{formula.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* XGBoost 작동 원리 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          XGBoost 작동 원리
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">그래디언트 부스팅</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 순차적 트리 학습</li>
              <li>• 이전 오류 보정</li>
              <li>• 잔차 최소화</li>
              <li>• 점진적 개선</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">규제 기법</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• L1 규제 (Lasso)</li>
              <li>• L2 규제 (Ridge)</li>
              <li>• 트리 복잡도 제한</li>
              <li>• 최소 가중치 제약</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">최적화 기법</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• 병렬 트리 구축</li>
              <li>• 캐시 인식 정렬</li>
              <li>• 히스토그램 기반 분할</li>
              <li>• 희소 행렬 처리</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}