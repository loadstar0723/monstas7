'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaBolt, FaLeaf, FaMemory, FaRocket, FaChartLine,
  FaDatabase, FaCogs, FaLightbulb, FaCode, FaLayerGroup
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, RadarChart, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'

interface ModelOverviewProps {
  symbol: string
}

export default function ModelOverview({ symbol }: ModelOverviewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // LightGBM vs 다른 모델 비교 데이터
  const modelComparison = [
    { metric: '학습 속도', LightGBM: 95, XGBoost: 85, RandomForest: 70, CatBoost: 75 },
    { metric: '메모리 효율', LightGBM: 92, XGBoost: 80, RandomForest: 60, CatBoost: 85 },
    { metric: '예측 정확도', LightGBM: 91, XGBoost: 92, RandomForest: 88, CatBoost: 90 },
    { metric: '대용량 처리', LightGBM: 98, XGBoost: 85, RandomForest: 65, CatBoost: 80 },
    { metric: '병렬 처리', LightGBM: 90, XGBoost: 88, RandomForest: 85, CatBoost: 87 },
    { metric: '희소 데이터', LightGBM: 94, XGBoost: 88, RandomForest: 70, CatBoost: 85 }
  ]

  // Leaf-wise vs Level-wise 성장 비교
  const growthComparison = [
    { depth: 1, leafWise: 2, levelWise: 2 },
    { depth: 2, leafWise: 3, levelWise: 4 },
    { depth: 3, leafWise: 5, levelWise: 8 },
    { depth: 4, leafWise: 8, levelWise: 16 },
    { depth: 5, leafWise: 13, levelWise: 32 },
    { depth: 6, leafWise: 21, levelWise: 64 }
  ]

  // LightGBM 특징
  const features = [
    {
      icon: <FaBolt className="text-4xl text-blue-400" />,
      title: '초고속 학습',
      description: '히스토그램 기반 알고리즘으로 극한의 속도'
    },
    {
      icon: <FaLeaf className="text-4xl text-green-400" />,
      title: 'Leaf-wise 성장',
      description: '최대 델타 손실을 가진 리프를 우선 분할'
    },
    {
      icon: <FaMemory className="text-4xl text-purple-400" />,
      title: '메모리 최적화',
      description: '히스토그램 기반으로 메모리 사용량 90% 감소'
    },
    {
      icon: <FaDatabase className="text-4xl text-yellow-400" />,
      title: '대용량 처리',
      description: '수십억 개의 데이터도 단일 머신에서 처리'
    }
  ]

  // 핵심 기술
  const coreTechnologies = [
    {
      name: 'Histogram-based Algorithm',
      description: '연속적인 특성을 이산 빈으로 변환',
      benefit: '메모리 사용량 감소, 계산 속도 향상',
      improvement: '8x 속도 향상'
    },
    {
      name: 'GOSS (Gradient-based One-Side Sampling)',
      description: '큰 그래디언트를 가진 샘플 우선 선택',
      benefit: '정확도 유지하며 학습 속도 향상',
      improvement: '20% 속도 향상'
    },
    {
      name: 'EFB (Exclusive Feature Bundling)',
      description: '상호 배타적 특성들을 번들로 묶음',
      benefit: '특성 수 감소로 효율성 증대',
      improvement: '특성 수 90% 감소'
    },
    {
      name: 'Leaf-wise Tree Growth',
      description: '최대 손실 감소 리프 우선 분할',
      benefit: '적은 리프로 높은 정확도',
      improvement: '정확도 3% 향상'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaBolt className="text-blue-400" />
          LightGBM (Light Gradient Boosting Machine)
        </h2>
        <p className="text-gray-300">
          Microsoft가 개발한 초고속, 고효율 그래디언트 부스팅 프레임워크
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
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center hover:border-blue-500/50 transition-all"
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
          <FaChartLine className="text-green-400" />
          성능 비교 분석
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={modelComparison}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
            <Radar name="LightGBM" dataKey="LightGBM" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Radar name="XGBoost" dataKey="XGBoost" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
            <Radar name="Random Forest" dataKey="RandomForest" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
            <Radar name="CatBoost" dataKey="CatBoost" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
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

      {/* Leaf-wise vs Level-wise */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLeaf className="text-green-400" />
          Leaf-wise vs Level-wise 성장
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="depth" stroke="#9ca3af" label={{ value: '트리 깊이', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#9ca3af" label={{ value: '리프 수', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="leafWise" stroke="#10b981" strokeWidth={2} name="Leaf-wise (LightGBM)" />
              <Line type="monotone" dataKey="levelWise" stroke="#ef4444" strokeWidth={2} name="Level-wise (XGBoost)" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-green-400 font-semibold mb-2">Leaf-wise 장점</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• 적은 리프로 높은 정확도 달성</li>
                <li>• 복잡한 패턴을 효율적으로 학습</li>
                <li>• 메모리 사용량 최소화</li>
                <li>• 불균형 트리 구조 허용</li>
              </ul>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">최적화 전략</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• max_depth로 과적합 제어</li>
                <li>• num_leaves &lt; 2^max_depth</li>
                <li>• min_data_in_leaf 조정</li>
                <li>• lambda_l1/l2 규제 적용</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 핵심 기술 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCogs className="text-purple-400" />
          핵심 최적화 기술
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coreTechnologies.map((tech, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">{tech.name}</h4>
              <p className="text-sm text-gray-300 mb-2">{tech.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{tech.benefit}</span>
                <span className="text-sm font-bold text-green-400">{tech.improvement}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 메모리 효율성 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMemory className="text-cyan-400" />
          메모리 효율성
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">8x</div>
            <div className="text-gray-300">더 적은 메모리 사용</div>
            <div className="text-sm text-gray-400 mt-1">히스토그램 기반 알고리즘</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">15x</div>
            <div className="text-gray-300">더 빠른 학습 속도</div>
            <div className="text-sm text-gray-400 mt-1">병렬 히스토그램 구축</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">10M+</div>
            <div className="text-gray-300">단일 머신 처리 가능</div>
            <div className="text-sm text-gray-400 mt-1">행 단위 데이터</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}