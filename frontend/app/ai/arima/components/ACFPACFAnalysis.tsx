'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaChartArea, FaInfoCircle, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa'
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Legend
} from 'recharts'
import { useGoARIMA } from '@/lib/hooks/useGoARIMA'

interface ACFPACFAnalysisProps {
  symbol: string
}

export default function ACFPACFAnalysis({ symbol }: ACFPACFAnalysisProps) {
  const [selectedLag, setSelectedLag] = useState<number | null>(null)

  // Go 엔진에서 ACF/PACF 데이터 가져오기
  const { acfData: goAcfData, pacfData: goPacfData, fetchACFPACF, isLoading } = useGoARIMA({
    symbol,
    period: '1h'
  })

  // ACF/PACF 데이터 가져오기
  useEffect(() => {
    fetchACFPACF()
  }, [symbol, fetchACFPACF])

  // 데이터 포맷팅
  const acfData = goAcfData.map(item => ({
    lag: item.lag,
    correlation: item.acf,
    upperBound: item.confidence,
    lowerBound: -item.confidence,
    significant: Math.abs(item.acf) > item.confidence
  }))

  const pacfData = goPacfData.map(item => ({
    lag: item.lag,
    correlation: item.pacf,
    upperBound: item.confidence,
    lowerBound: -item.confidence,
    significant: Math.abs(item.pacf) > item.confidence
  }))

  // ARIMA 파라미터 추천
  const getARIMARecommendation = () => {
    // PACF에서 유의한 lag 찾기 (AR order)
    const significantPACF = pacfData
      .slice(1)
      .filter(d => d.significant)
      .map(d => d.lag)
    
    // ACF에서 유의한 lag 찾기 (MA order)
    const significantACF = acfData
      .slice(1)
      .filter(d => d.significant)
      .map(d => d.lag)
    
    const p = significantPACF.length > 0 ? Math.max(...significantPACF.slice(0, 3)) : 0
    const q = significantACF.length > 0 ? Math.max(...significantACF.slice(0, 3)) : 0
    const d = 1 // 일반적으로 금융 시계열은 1차 차분
    
    return { p, d, q }
  }

  const recommendation = getARIMARecommendation()

  const interpretations = {
    acf: {
      title: 'ACF (자기상관함수) 해석',
      description: 'ACF는 시계열과 그 자체의 과거값들 간의 상관관계를 보여줍니다.',
      patterns: [
        '천천히 감소: AR 프로세스 존재',
        '빠르게 절단: MA 프로세스 존재',
        '주기적 패턴: 계절성 존재'
      ]
    },
    pacf: {
      title: 'PACF (편자기상관함수) 해석',
      description: 'PACF는 중간 lag들의 영향을 제거한 순수한 상관관계를 보여줍니다.',
      patterns: [
        '특정 lag에서 절단: AR 차수 결정',
        '천천히 감소: MA 프로세스 존재',
        '스파이크: 해당 lag의 직접적 영향'
      ]
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaChartArea className="text-blue-400" />
          ACF/PACF 상관관계 분석
        </h2>
        <p className="text-gray-300">
          자기상관함수와 편자기상관함수로 ARIMA 모델의 최적 파라미터를 결정합니다
        </p>
      </div>

      {/* ARIMA 파라미터 추천 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <FaCheckCircle className="text-green-400" />
          권장 ARIMA 파라미터
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400 mb-2">p = {recommendation.p}</div>
            <div className="text-sm text-gray-400">AR 차수</div>
            <div className="text-xs text-gray-500 mt-1">자기회귀 항</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400 mb-2">d = {recommendation.d}</div>
            <div className="text-sm text-gray-400">차분 차수</div>
            <div className="text-xs text-gray-500 mt-1">정상성 확보</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400 mb-2">q = {recommendation.q}</div>
            <div className="text-sm text-gray-400">MA 차수</div>
            <div className="text-xs text-gray-500 mt-1">이동평균 항</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-yellow-400 font-semibold">
            추천 모델: ARIMA({recommendation.p},{recommendation.d},{recommendation.q})
          </p>
        </div>
      </motion.div>

      {/* ACF 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{interpretations.acf.title}</h3>
          <p className="text-gray-400 text-sm">{interpretations.acf.description}</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={acfData}
            onClick={(data) => {
              if (data && data.activeLabel) {
                setSelectedLag(parseInt(data.activeLabel))
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="lag" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[-1, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => value.toFixed(4)}
            />
            <Bar dataKey="correlation" fill="#3b82f6">
              {acfData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.significant ? '#ef4444' : '#3b82f6'}
                  opacity={selectedLag === entry.lag ? 1 : 0.7}
                />
              ))}
            </Bar>
            <ReferenceLine y={0} stroke="#6b7280" />
            <ReferenceLine y={acfData[0]?.upperBound || 0} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={acfData[0]?.lowerBound || 0} stroke="#10b981" strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span className="text-gray-400">비유의</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span className="text-gray-400">유의함</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-green-500"></div>
            <span className="text-gray-400">95% 신뢰구간</span>
          </div>
        </div>
      </motion.div>

      {/* PACF 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{interpretations.pacf.title}</h3>
          <p className="text-gray-400 text-sm">{interpretations.pacf.description}</p>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={pacfData}
            onClick={(data) => {
              if (data && data.activeLabel) {
                setSelectedLag(parseInt(data.activeLabel))
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="lag" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[-1, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => value.toFixed(4)}
            />
            <Bar dataKey="correlation" fill="#8b5cf6">
              {pacfData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.significant ? '#ef4444' : '#8b5cf6'}
                  opacity={selectedLag === entry.lag ? 1 : 0.7}
                />
              ))}
            </Bar>
            <ReferenceLine y={0} stroke="#6b7280" />
            <ReferenceLine y={pacfData[0]?.upperBound || 0} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={pacfData[0]?.lowerBound || 0} stroke="#10b981" strokeDasharray="5 5" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 패턴 해석 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-blue-400" />
            ACF 패턴 해석
          </h3>
          <ul className="space-y-3">
            {interpretations.acf.patterns.map((pattern, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">•</span>
                <span className="text-gray-300">{pattern}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-purple-400" />
            PACF 패턴 해석
          </h3>
          <ul className="space-y-3">
            {interpretations.pacf.patterns.map((pattern, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">•</span>
                <span className="text-gray-300">{pattern}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* 선택된 Lag 정보 */}
      {selectedLag !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30"
        >
          <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
            <FaExclamationTriangle />
            Lag {selectedLag} 상세 정보
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">ACF 값:</span>
              <span className="text-white ml-2 font-mono">
                {acfData[selectedLag]?.correlation.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">PACF 값:</span>
              <span className="text-white ml-2 font-mono">
                {pacfData[selectedLag]?.correlation.toFixed(4)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}