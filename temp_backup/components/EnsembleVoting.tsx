'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaVoteYea, FaTree, FaChartPie, FaBalanceScale,
  FaPlay, FaPause, FaRedo, FaLightbulb, FaChartBar
} from 'react-icons/fa'
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, RadialBarChart, RadialBar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Area, AreaChart
} from 'recharts'
import CountUp from 'react-countup'

interface EnsembleVotingProps {
  symbol: string
}

interface TreeVote {
  treeId: number
  prediction: 'UP' | 'DOWN'
  confidence: number
  features: {
    name: string
    value: number
    contribution: number
  }[]
}

export default function EnsembleVoting({ symbol }: EnsembleVotingProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [treeVotes, setTreeVotes] = useState<TreeVote[]>([])
  const [finalPrediction, setFinalPrediction] = useState<'UP' | 'DOWN' | null>(null)
  
  const totalTrees = 100
  const animationSteps = 10 // 10단계로 나누어 애니메이션
  
  // 트리 투표 생성
  const generateTreeVote = (treeId: number): TreeVote => {
    const upProbability = 0.55 + (Math.random() - 0.5) * 0.3 // 55% 기준으로 변동
    const prediction = Math.random() < upProbability ? 'UP' : 'DOWN'
    
    return {
      treeId,
      prediction,
      confidence: 0.5 + Math.random() * 0.5,
      features: [
        { name: 'RSI', value: 50 + Math.random() * 30, contribution: Math.random() * 0.3 },
        { name: 'Volume', value: Math.random() * 100, contribution: Math.random() * 0.2 },
        { name: 'MACD', value: Math.random() * 2 - 1, contribution: Math.random() * 0.25 },
        { name: 'Whale', value: Math.random() * 100, contribution: Math.random() * 0.15 }
      ]
    }
  }

  // 애니메이션 시작/정지
  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false)
    } else {
      setIsAnimating(true)
      setCurrentStep(0)
      setTreeVotes([])
      setFinalPrediction(null)
    }
  }

  // 애니메이션 리셋
  const resetAnimation = () => {
    setIsAnimating(false)
    setCurrentStep(0)
    setTreeVotes([])
    setFinalPrediction(null)
  }

  // 애니메이션 효과
  useEffect(() => {
    if (isAnimating && currentStep < animationSteps) {
      const timer = setTimeout(() => {
        const treesPerStep = totalTrees / animationSteps
        const newVotes: TreeVote[] = []
        
        for (let i = 0; i < treesPerStep; i++) {
          const treeId = currentStep * treesPerStep + i
          newVotes.push(generateTreeVote(treeId))
        }
        
        setTreeVotes(prev => [...prev, ...newVotes])
        setCurrentStep(prev => prev + 1)
      }, 500)
      
      return () => clearTimeout(timer)
    } else if (currentStep >= animationSteps) {
      // 최종 예측 계산
      const upVotes = treeVotes.filter(v => v.prediction === 'UP').length
      const downVotes = treeVotes.filter(v => v.prediction === 'DOWN').length
      setFinalPrediction(upVotes > downVotes ? 'UP' : 'DOWN')
      setIsAnimating(false)
    }
  }, [isAnimating, currentStep, treeVotes.length])

  // 투표 집계
  const voteStats = {
    up: treeVotes.filter(v => v.prediction === 'UP').length,
    down: treeVotes.filter(v => v.prediction === 'DOWN').length,
    avgConfidence: treeVotes.length > 0 
      ? treeVotes.reduce((sum, v) => sum + v.confidence, 0) / treeVotes.length 
      : 0
  }

  // 신뢰도 분포
  const confidenceDistribution = (() => {
    const bins = [
      { range: '50-60%', count: 0, fill: '#ef4444' },
      { range: '60-70%', count: 0, fill: '#f59e0b' },
      { range: '70-80%', count: 0, fill: '#3b82f6' },
      { range: '80-90%', count: 0, fill: '#10b981' },
      { range: '90-100%', count: 0, fill: '#8b5cf6' }
    ]
    
    treeVotes.forEach(vote => {
      const conf = vote.confidence * 100
      if (conf >= 50 && conf < 60) bins[0].count++
      else if (conf >= 60 && conf < 70) bins[1].count++
      else if (conf >= 70 && conf < 80) bins[2].count++
      else if (conf >= 80 && conf < 90) bins[3].count++
      else if (conf >= 90) bins[4].count++
    })
    
    return bins
  })()

  // 시간에 따른 투표 변화
  const votingProgress = Array.from({ length: currentStep + 1 }, (_, i) => {
    const stepVotes = treeVotes.slice(0, (i + 1) * (totalTrees / animationSteps))
    const upCount = stepVotes.filter(v => v.prediction === 'UP').length
    const downCount = stepVotes.filter(v => v.prediction === 'DOWN').length
    
    return {
      step: `Step ${i + 1}`,
      up: upCount,
      down: downCount,
      total: upCount + downCount,
      upRatio: stepVotes.length > 0 ? (upCount / stepVotes.length) * 100 : 50
    }
  })

  // Pie 차트 데이터
  const pieData = [
    { name: 'UP', value: voteStats.up, fill: '#10b981' },
    { name: 'DOWN', value: voteStats.down, fill: '#ef4444' }
  ]

  // RadialBar 차트 데이터
  const radialData = [
    {
      name: 'DOWN',
      value: voteStats.down,
      fill: '#ef4444'
    },
    {
      name: 'UP',
      value: voteStats.up,
      fill: '#10b981'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaVoteYea className="text-purple-400" />
          앙상블 투표 과정
        </h2>
        <p className="text-gray-300">
          100개의 의사결정 트리가 각자의 예측을 투표하여 최종 결정을 만드는 과정을 시각화합니다
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">투표 시뮬레이션</h3>
          <div className="flex gap-2">
            <button
              onClick={toggleAnimation}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isAnimating
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-green-500/20 text-green-400 border border-green-500/50'
              } hover:opacity-80`}
            >
              {isAnimating ? <FaPause /> : <FaPlay />}
              {isAnimating ? '일시정지' : '시작'}
            </button>
            <button
              onClick={resetAnimation}
              className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50 flex items-center gap-2"
            >
              <FaRedo />
              리셋
            </button>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">진행률</span>
            <span className="text-white font-semibold">
              {treeVotes.length} / {totalTrees} 트리
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(treeVotes.length / totalTrees) * 100}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            />
          </div>
        </div>

        {/* 실시간 투표 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 투표 수 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              <span className="text-green-400">
                <CountUp end={voteStats.up} duration={0.5} />
              </span>
              <span className="text-gray-500 mx-3">:</span>
              <span className="text-red-400">
                <CountUp end={voteStats.down} duration={0.5} />
              </span>
            </div>
            <div className="text-gray-400">UP : DOWN</div>
          </div>

          {/* 승률 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              <CountUp 
                end={treeVotes.length > 0 ? (voteStats.up / treeVotes.length) * 100 : 50} 
                decimals={1} 
                suffix="%" 
                duration={0.5} 
              />
            </div>
            <div className="text-gray-400">UP 투표율</div>
          </div>

          {/* 평균 신뢰도 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              <CountUp 
                end={voteStats.avgConfidence * 100} 
                decimals={1} 
                suffix="%" 
                duration={0.5} 
              />
            </div>
            <div className="text-gray-400">평균 신뢰도</div>
          </div>
        </div>
      </div>

      {/* 투표 시각화 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">투표 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={500}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* RadialBar 차트 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4">투표 강도</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="10%" 
              outerRadius="80%" 
              barSize={20} 
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis type="number" domain={[0, totalTrees]} tick={false} />
              <RadialBar
                minAngle={15}
                background={{ fill: '#374151' }}
                clockWise
                dataKey="value"
                cornerRadius={10}
              />
              <Legend 
                iconSize={18}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 투표 진행 과정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-bold text-white mb-4">투표 진행 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={votingProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="step" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="up"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="down"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 신뢰도 분포 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaBalanceScale className="text-yellow-400" />
          트리별 신뢰도 분포
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={confidenceDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="range" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="count" name="트리 수">
              {confidenceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 최종 예측 결과 */}
      {finalPrediction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-gradient-to-r ${
            finalPrediction === 'UP' 
              ? 'from-green-900/20 to-green-800/20 border-green-500/30' 
              : 'from-red-900/20 to-red-800/20 border-red-500/30'
          } rounded-xl p-8 border text-center`}
        >
          <h3 className="text-2xl font-bold text-white mb-4">최종 예측 결과</h3>
          <div className={`text-6xl font-bold mb-4 ${
            finalPrediction === 'UP' ? 'text-green-400' : 'text-red-400'
          }`}>
            {finalPrediction}
          </div>
          <div className="text-gray-300">
            <span className="text-2xl font-semibold">
              {finalPrediction === 'UP' ? voteStats.up : voteStats.down}
            </span>
            <span className="text-gray-500"> / {totalTrees} 트리</span>
          </div>
          <div className="text-gray-400 mt-2">
            신뢰도: {(voteStats.avgConfidence * 100).toFixed(1)}%
          </div>
        </motion.div>
      )}

      {/* 앙상블 효과 설명 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-400" />
          앙상블 학습의 장점
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-2">다양성 확보</h4>
            <p className="text-gray-300">
              각 트리가 서로 다른 데이터와 특성으로 학습하여 다양한 관점 제공
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">오류 보정</h4>
            <p className="text-gray-300">
              개별 트리의 오류가 다른 트리들에 의해 상쇄되어 전체 정확도 향상
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-green-400 font-semibold mb-2">안정성 증가</h4>
            <p className="text-gray-300">
              단일 모델보다 예측 분산이 낮아 더 안정적이고 신뢰할 수 있는 결과
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}