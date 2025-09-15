'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaEye, FaBrain, FaNetworkWired, FaChartBar,
  FaRobot, FaLightbulb, FaCode, FaLayerGroup
} from 'react-icons/fa'
import { 
  HeatmapChart, ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, BarChart, Bar, RadialBarChart, RadialBar, PolarGrid
} from 'recharts'

interface AttentionMechanismProps {
  symbol: string
}

export default function AttentionMechanism({ symbol }: AttentionMechanismProps) {
  const [selectedHead, setSelectedHead] = useState(0)
  const [animationStep, setAnimationStep] = useState(0)
  const [selectedToken, setSelectedToken] = useState(0)

  // 샘플 입력 시퀀스
  const inputSequence = ['Buy', 'BTC', 'at', '$50K', 'target', '$60K', 'stop', '$45K']
  
  // Attention 가중치 매트릭스 (8x8)
  const generateAttentionWeights = () => {
    const weights: number[][] = []
    for (let i = 0; i < inputSequence.length; i++) {
      weights[i] = []
      for (let j = 0; j < inputSequence.length; j++) {
        // 실제 attention 패턴 시뮬레이션
        let weight = Math.random() * 0.3
        if (i === j) weight += 0.3 // 자기 자신에 대한 attention
        if (Math.abs(i - j) === 1) weight += 0.2 // 인접 토큰
        if ((inputSequence[i].includes('$') && inputSequence[j].includes('$')) ||
            (inputSequence[i].includes('K') && inputSequence[j].includes('K'))) {
          weight += 0.3 // 관련 토큰끼리 높은 attention
        }
        weights[i][j] = Math.min(1, weight)
      }
    }
    return weights
  }

  const [attentionWeights, setAttentionWeights] = useState(generateAttentionWeights())

  // Multi-head attention 시각화 데이터
  const multiHeadData = Array.from({ length: 8 }, (_, i) => ({
    head: `Head ${i + 1}`,
    focus: Math.random() * 100,
    contribution: Math.random() * 100
  }))

  // 위치 인코딩 시각화
  const positionEncoding = Array.from({ length: 50 }, (_, i) => ({
    position: i,
    sin: Math.sin(i / 10000 ** (0 / 512)),
    cos: Math.cos(i / 10000 ** (0 / 512)),
    encoding: Math.sin(i / 10000 ** (0 / 512)) + Math.cos(i / 10000 ** (1 / 512))
  }))

  // Self-attention 스코어
  const selfAttentionScores = inputSequence.map((token, idx) => ({
    token,
    query: Math.random() * 10,
    key: Math.random() * 10,
    value: Math.random() * 10,
    score: attentionWeights[selectedToken][idx] * 100
  }))

  // 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % inputSequence.length)
      setAttentionWeights(generateAttentionWeights())
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Attention 히트맵 데이터 변환
  const heatmapData = []
  for (let i = 0; i < inputSequence.length; i++) {
    for (let j = 0; j < inputSequence.length; j++) {
      heatmapData.push({
        x: j,
        y: i,
        value: attentionWeights[i][j],
        xLabel: inputSequence[j],
        yLabel: inputSequence[i]
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaEye className="text-yellow-400" />
          Transformer Attention 메커니즘
        </h2>
        <p className="text-gray-300">
          Self-Attention과 Multi-Head Attention의 작동 원리를 시각화합니다
        </p>
      </div>

      {/* Attention 매트릭스 히트맵 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4">Self-Attention 가중치 매트릭스</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 히트맵 */}
          <div>
            <div className="grid grid-cols-9 gap-1">
              {/* 헤더 행 */}
              <div></div>
              {inputSequence.map((token, idx) => (
                <div key={`header-${idx}`} className="text-xs text-gray-400 text-center">
                  {token}
                </div>
              ))}
              
              {/* 데이터 행 */}
              {inputSequence.map((rowToken, i) => (
                <React.Fragment key={`row-${i}`}>
                  <div className="text-xs text-gray-400 text-right pr-2">{rowToken}</div>
                  {inputSequence.map((_, j) => (
                    <motion.div
                      key={`cell-${i}-${j}`}
                      className="w-full aspect-square rounded cursor-pointer relative group"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${attentionWeights[i][j]})`
                      }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setSelectedToken(i)}
                      animate={{
                        opacity: animationStep === i ? 1 : 0.6
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-white opacity-0 group-hover:opacity-100">
                          {attentionWeights[i][j].toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </React.Fragment>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              <p>클릭하여 특정 토큰의 attention 분포를 확인하세요</p>
              <p className="mt-1">현재 선택: <span className="text-yellow-400">{inputSequence[selectedToken]}</span></p>
            </div>
          </div>

          {/* Attention 분포 차트 */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selfAttentionScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="token" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="score" name="Attention Score">
                  {selfAttentionScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      index === selectedToken ? '#f59e0b' : '#3b82f6'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Multi-Head Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">Multi-Head Attention</h3>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => setSelectedHead(i)}
                className={`p-2 rounded-lg text-sm transition-all ${
                  selectedHead === i
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
              >
                Head {i + 1}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={multiHeadData}>
              <PolarGrid stroke="#374151" />
              <RadialBar
                dataKey="focus"
                cornerRadius={5}
                fill="#8b5cf6"
                label={{ fill: '#fff', position: 'insideStart' }}
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="mt-4 bg-gray-700/30 rounded-lg p-3">
            <p className="text-sm text-gray-300">
              Head {selectedHead + 1}은 주로 <span className="text-yellow-400">
                {selectedHead < 3 ? '지역적 패턴' : selectedHead < 6 ? '구문 구조' : '전역적 의존성'}
              </span>에 집중합니다
            </p>
          </div>
        </motion.div>

        {/* 위치 인코딩 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">위치 인코딩 (Positional Encoding)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={positionEncoding}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="position" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line type="monotone" dataKey="sin" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sin" />
              <Line type="monotone" dataKey="cos" stroke="#10b981" strokeWidth={2} dot={false} name="Cos" />
              <Line type="monotone" dataKey="encoding" stroke="#f59e0b" strokeWidth={2} dot={false} name="Combined" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Attention 메커니즘 설명 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaBrain className="text-2xl text-blue-400" />
            <h4 className="text-lg font-semibold text-white">Query-Key-Value</h4>
          </div>
          <p className="text-sm text-gray-300">
            각 토큰이 Query로 다른 토큰들의 Key와 매칭되어 Value를 가중 평균합니다
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaLayerGroup className="text-2xl text-purple-400" />
            <h4 className="text-lg font-semibold text-white">Multi-Head 병렬화</h4>
          </div>
          <p className="text-sm text-gray-300">
            여러 attention head가 다양한 관계를 동시에 학습하여 풍부한 표현 생성
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <FaLightbulb className="text-2xl text-green-400" />
            <h4 className="text-lg font-semibold text-white">장거리 의존성</h4>
          </div>
          <p className="text-sm text-gray-300">
            시퀀스 길이에 관계없이 모든 토큰 간의 직접적인 관계를 학습합니다
          </p>
        </motion.div>
      </div>

      {/* Transformer 아키텍처 장점 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaRobot className="text-indigo-400" />
          Transformer의 핵심 장점
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-indigo-400 font-semibold mb-3">병렬 처리 능력</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>RNN과 달리 모든 토큰을 동시에 처리 가능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>GPU 활용도 극대화로 100배 빠른 학습</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">•</span>
                <span>대규모 데이터셋 처리에 최적화</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-purple-400 font-semibold mb-3">트레이딩 적용</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>시장 뉴스와 가격 데이터의 상관관계 포착</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>장단기 패턴을 동시에 학습</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>다중 자산 간 상호작용 모델링</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}