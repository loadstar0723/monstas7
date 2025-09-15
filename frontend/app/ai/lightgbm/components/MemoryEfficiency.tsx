'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaMemory, FaDatabase, FaChartBar, FaMicrochip,
  FaCompress, FaTachometerAlt, FaServer, FaChartPie
} from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  AreaChart, Area, ComposedChart, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'
import CountUp from 'react-countup'

interface MemoryEfficiencyProps {
  symbol: string
}

export default function MemoryEfficiency({ symbol }: MemoryEfficiencyProps) {
  const [selectedMethod, setSelectedMethod] = useState<'histogram' | 'traditional'>('histogram')
  const [showAnimation, setShowAnimation] = useState(true)

  // 메모리 사용량 비교
  const memoryComparison = [
    { method: 'LightGBM', memory: 256, speed: 95, accuracy: 91 },
    { method: 'XGBoost', memory: 1024, speed: 85, accuracy: 92 },
    { method: 'Random Forest', memory: 2048, speed: 70, accuracy: 88 },
    { method: 'Deep Learning', memory: 4096, speed: 60, accuracy: 93 }
  ]

  // 히스토그램 기반 최적화
  const histogramBenefits = [
    {
      feature: '원본 데이터',
      traditional: 1000,
      histogram: 256,
      reduction: 74.4
    },
    {
      feature: '특성 저장',
      traditional: 800,
      histogram: 64,
      reduction: 92
    },
    {
      feature: '분할 계산',
      traditional: 600,
      histogram: 32,
      reduction: 94.7
    },
    {
      feature: '캐시 효율',
      traditional: 400,
      histogram: 380,
      reduction: 5
    }
  ]

  // 특성 번들링 효과
  const featureBundling = [
    { category: '상호배타적', before: 100, after: 10, bundled: 90 },
    { category: '희소 특성', before: 80, after: 15, bundled: 65 },
    { category: '범주형', before: 60, after: 8, bundled: 52 },
    { category: '이진 특성', before: 40, after: 5, bundled: 35 }
  ]

  // GOSS 샘플링 효과
  const gossSampling = [
    { gradient: 'Large (10%)', samples: 100, weight: 1.0, contribution: 45 },
    { gradient: 'Medium (20%)', samples: 200, weight: 0.5, contribution: 30 },
    { gradient: 'Small (70%)', samples: 700, weight: 0.1, contribution: 25 }
  ]

  // 메모리 사용 추이
  const memoryTrend = Array.from({ length: 20 }, (_, i) => ({
    iteration: i + 1,
    lightgbm: 256 + Math.sin(i * 0.3) * 20,
    xgboost: 1024 + i * 50,
    randomforest: 2048 + i * 100
  }))

  // 실시간 메모리 모니터링
  const [currentMemory, setCurrentMemory] = useState({
    histogram: 256,
    tree: 64,
    cache: 32,
    total: 352
  })

  useEffect(() => {
    if (showAnimation) {
      const interval = setInterval(() => {
        setCurrentMemory(prev => ({
          histogram: 256 + Math.random() * 20,
          tree: 64 + Math.random() * 10,
          cache: 32 + Math.random() * 5,
          total: 352 + Math.random() * 35
        }))
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [showAnimation])

  // 색상 팔레트
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaMemory className="text-cyan-400" />
          메모리 효율성 분석
        </h2>
        <p className="text-gray-300">
          히스토그램 기반 알고리즘으로 메모리 사용량을 획기적으로 감소
        </p>
      </div>

      {/* 메모리 사용량 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/30"
        >
          <FaMemory className="text-3xl text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            <CountUp end={currentMemory.total} duration={1} decimals={0} /> MB
          </div>
          <div className="text-sm text-gray-400">총 메모리 사용량</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30"
        >
          <FaChartBar className="text-3xl text-green-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            <CountUp end={8} duration={1} />x
          </div>
          <div className="text-sm text-gray-400">메모리 효율성</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30"
        >
          <FaTachometerAlt className="text-3xl text-purple-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            <CountUp end={15} duration={1} />x
          </div>
          <div className="text-sm text-gray-400">속도 향상</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/30"
        >
          <FaDatabase className="text-3xl text-yellow-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            <CountUp end={10} duration={1} />M+
          </div>
          <div className="text-sm text-gray-400">처리 가능 행</div>
        </motion.div>
      </div>

      {/* 히스토그램 vs 전통적 방식 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartBar className="text-green-400" />
            히스토그램 기반 최적화
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={histogramBenefits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="feature" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="traditional" fill="#ef4444" name="전통적 방식" />
              <Bar dataKey="histogram" fill="#10b981" name="히스토그램" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-sm text-gray-400">평균 메모리 절감</div>
              <div className="text-2xl font-bold text-green-400">91.5%</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="text-sm text-gray-400">처리 속도 향상</div>
              <div className="text-2xl font-bold text-blue-400">15x</div>
            </div>
          </div>
        </motion.div>

        {/* 메모리 사용 분포 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaChartPie className="text-purple-400" />
            메모리 사용 분포
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: '히스토그램', value: currentMemory.histogram, color: '#3b82f6' },
                  { name: '트리 구조', value: currentMemory.tree, color: '#10b981' },
                  { name: '캐시', value: currentMemory.cache, color: '#f59e0b' },
                  { name: '기타', value: 20, color: '#8b5cf6' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}MB`}
              >
                {[0, 1, 2, 3].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {Object.entries(currentMemory).filter(([key]) => key !== 'total').map(([key, value], index) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index] }} />
                  <span className="text-sm text-gray-400 capitalize">{key}</span>
                </div>
                <span className="text-sm text-white font-mono">{value.toFixed(0)} MB</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* EFB 특성 번들링 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCompress className="text-yellow-400" />
          EFB (Exclusive Feature Bundling)
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={featureBundling} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="category" type="category" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="before" fill="#ef4444" name="번들링 전" />
              <Bar dataKey="after" fill="#10b981" name="번들링 후" />
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-2">번들링 원리</h4>
              <p className="text-sm text-gray-300">
                상호 배타적인 특성들을 하나의 번들로 묶어 특성 수를 대폭 감소시킵니다.
                예: 원-핫 인코딩된 범주형 변수들
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">85%</div>
                <div className="text-xs text-gray-400">특성 수 감소</div>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-400">0%</div>
                <div className="text-xs text-gray-400">정확도 손실</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GOSS 샘플링 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaMicrochip className="text-orange-400" />
          GOSS (Gradient-based One-Side Sampling)
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {gossSampling.map((group, index) => (
            <div key={index} className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{group.gradient}</span>
                <span className="text-sm text-gray-400">{group.samples} 샘플</span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">가중치</span>
                  <span className="text-white">{group.weight}x</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${group.weight * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{group.contribution}%</div>
                <div className="text-xs text-gray-400">정보 기여도</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-4 border border-orange-500/30">
          <p className="text-sm text-gray-300">
            <span className="text-orange-400 font-semibold">GOSS 핵심:</span> 큰 그래디언트를 가진 샘플은 정보가 풍부하므로 
            모두 유지하고, 작은 그래디언트 샘플은 랜덤 샘플링하여 계산량을 줄이면서도 정확도를 유지합니다.
          </p>
        </div>
      </motion.div>

      {/* 메모리 사용 추이 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaServer className="text-blue-400" />
          학습 중 메모리 사용 추이
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={memoryTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="iteration" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => `${value} MB`}
            />
            <Area type="monotone" dataKey="lightgbm" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="LightGBM" />
            <Area type="monotone" dataKey="xgboost" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="XGBoost" />
            <Area type="monotone" dataKey="randomforest" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Random Forest" />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 최적화 권장사항 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaDatabase className="text-cyan-400" />
          메모리 최적화 권장사항
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-green-400 font-semibold mb-3">데이터 전처리</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>범주형 변수는 정수형으로 인코딩</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>float64 대신 float32 사용 (정밀도 손실 최소)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>희소 행렬은 CSR 포맷으로 저장</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>불필요한 특성 사전 제거</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-3">파라미터 설정</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>max_bin을 255 이하로 설정 (기본값 추천)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>enable_bundle: true로 EFB 활성화</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>two_round: true로 메모리 사용 예측</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>histogram_pool_size 조정으로 캐시 최적화</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}