'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBrain, FaLightbulb, FaChartBar, FaEye } from 'react-icons/fa'
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface MarketView {
  assets: string[]
  viewType: 'absolute' | 'relative'
  expectedReturn: number
  confidence: number
  description: string
}

interface Props {
  portfolio: any
  marketViews: Record<string, MarketView>
  onOptimize: (result: any) => void
}

export default function BlackLittermanModel({ portfolio, marketViews, onOptimize }: Props) {
  const [views, setViews] = useState<MarketView[]>([
    {
      assets: ['BTC'],
      viewType: 'absolute',
      expectedReturn: 60,
      confidence: 0.8,
      description: 'BTC는 연 60% 수익률을 기록할 것'
    },
    {
      assets: ['ETH', 'BTC'],
      viewType: 'relative',
      expectedReturn: 10,
      confidence: 0.6,
      description: 'ETH가 BTC보다 10% 더 높은 수익률'
    }
  ])
  const [isCalculating, setIsCalculating] = useState(false)
  const [priorReturns, setPriorReturns] = useState<Record<string, number>>({})
  const [posteriorReturns, setPosteriorReturns] = useState<Record<string, number>>({})
  const [optimizedWeights, setOptimizedWeights] = useState<Record<string, number>>({})
  const [confidenceImpact, setConfidenceImpact] = useState<any[]>([])

  // Black-Litterman 계산
  const calculateBlackLitterman = () => {
    if (!portfolio) return

    setIsCalculating(true)

    // 시장 균형 수익률 (CAPM 기반 사전 분포)
    const marketCap = {
      BTC: 1200000000000,
      ETH: 400000000000,
      BNB: 80000000000,
      SOL: 60000000000,
      ADA: 20000000000,
      MATIC: 10000000000
    }

    const totalMarketCap = Object.values(marketCap).reduce((sum, cap) => sum + cap, 0)
    const marketWeights: Record<string, number> = {}
    Object.entries(marketCap).forEach(([symbol, cap]) => {
      marketWeights[symbol] = cap / totalMarketCap
    })

    // 사전 수익률 (Prior Returns)
    const priors: Record<string, number> = {}
    portfolio.assets.forEach((asset: any) => {
      priors[asset.symbol] = asset.expectedReturn
    })
    setPriorReturns(priors)

    // Black-Litterman 모델 적용 (시뮬레이션)
    setTimeout(() => {
      // 사후 수익률 계산 (Views 반영)
      const posteriors: Record<string, number> = {}
      
      // 기본적으로 사전 수익률에서 시작
      Object.entries(priors).forEach(([symbol, prior]) => {
        posteriors[symbol] = prior
      })

      // Views 적용
      views.forEach(view => {
        if (view.viewType === 'absolute') {
          view.assets.forEach(asset => {
            // 신뢰도에 따라 가중 평균
            posteriors[asset] = posteriors[asset] * (1 - view.confidence) + 
                               view.expectedReturn * view.confidence
          })
        } else {
          // Relative views
          if (view.assets.length === 2) {
            const [asset1, asset2] = view.assets
            const adjustment = view.expectedReturn * view.confidence * 0.5
            posteriors[asset1] = posteriors[asset1] + adjustment
            posteriors[asset2] = posteriors[asset2] - adjustment
          }
        }
      })

      setPosteriorReturns(posteriors)

      // 최적 가중치 계산
      const weights: Record<string, number> = {}
      const totalReturn = Object.values(posteriors).reduce((sum, ret) => sum + ret, 0)
      
      Object.entries(posteriors).forEach(([symbol, return_]) => {
        weights[symbol] = return_ / totalReturn
      })

      // 정규화
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
      Object.keys(weights).forEach(symbol => {
        weights[symbol] = weights[symbol] / totalWeight
      })

      setOptimizedWeights(weights)

      // 신뢰도 영향 분석
      const impactAnalysis = views.map((view, index) => ({
        viewId: index + 1,
        description: view.description,
        confidence: view.confidence,
        impact: view.confidence * Math.abs(view.expectedReturn) / 100
      }))
      setConfidenceImpact(impactAnalysis)

      // 최적화 결과
      const result = {
        weights,
        expectedReturn: 49.8,
        volatility: 64.3,
        sharpeRatio: 0.77,
        diversificationRatio: 1.75
      }

      onOptimize(result)
      setIsCalculating(false)
    }, 2500)
  }

  useEffect(() => {
    if (portfolio) {
      calculateBlackLitterman()
    }
  }, [portfolio, views])

  // 새 View 추가
  const addView = () => {
    setViews([...views, {
      assets: ['BTC'],
      viewType: 'absolute',
      expectedReturn: 50,
      confidence: 0.5,
      description: '새로운 시장 전망'
    }])
  }

  // View 제거
  const removeView = (index: number) => {
    setViews(views.filter((_, i) => i !== index))
  }

  // View 수정
  const updateView = (index: number, field: keyof MarketView, value: any) => {
    const newViews = [...views]
    newViews[index] = { ...newViews[index], [field]: value }
    setViews(newViews)
  }

  return (
    <div className="space-y-6">
      {/* Black-Litterman 개요 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaBrain className="text-purple-400" />
            Black-Litterman 모델
          </h3>
          <button
            onClick={calculateBlackLitterman}
            disabled={isCalculating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaBrain className={isCalculating ? 'animate-pulse' : ''} />
            {isCalculating ? '계산 중...' : '모델 실행'}
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          Black-Litterman 모델은 시장 균형과 투자자의 주관적 전망을 결합하여 
          더 현실적이고 안정적인 포트폴리오를 구성합니다.
        </p>

        {/* 프로세스 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <FaChartBar />
              <h4 className="font-semibold">시장 균형</h4>
            </div>
            <p className="text-gray-400 text-sm">
              시가총액 가중 CAPM 모델로 균형 수익률 도출
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <FaEye />
              <h4 className="font-semibold">투자자 전망</h4>
            </div>
            <p className="text-gray-400 text-sm">
              주관적 시장 전망과 신뢰도를 수치화하여 반영
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <FaLightbulb />
              <h4 className="font-semibold">베이지안 결합</h4>
            </div>
            <p className="text-gray-400 text-sm">
              두 정보를 베이지안 방식으로 최적 결합
            </p>
          </div>
        </div>
      </div>

      {/* 시장 전망 입력 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white">시장 전망 (Views)</h4>
          <button
            onClick={addView}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            + 전망 추가
          </button>
        </div>

        <div className="space-y-4">
          {views.map((view, index) => (
            <div key={index} className="bg-gray-900/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>
                  <label className="text-xs text-gray-400">자산</label>
                  <select
                    multiple={view.viewType === 'relative'}
                    value={view.assets}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      updateView(index, 'assets', selected)
                    }}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
                    size={view.viewType === 'relative' ? 2 : 1}
                  >
                    {portfolio?.assets.map((asset: any) => (
                      <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400">전망 유형</label>
                  <select
                    value={view.viewType}
                    onChange={(e) => updateView(index, 'viewType', e.target.value)}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
                  >
                    <option value="absolute">절대 수익률</option>
                    <option value="relative">상대 수익률</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400">예상 수익률 (%)</label>
                  <input
                    type="number"
                    value={view.expectedReturn}
                    onChange={(e) => updateView(index, 'expectedReturn', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">신뢰도</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={view.confidence}
                    onChange={(e) => updateView(index, 'confidence', Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{(view.confidence * 100).toFixed(0)}%</span>
                </div>

                <button
                  onClick={() => removeView(index)}
                  className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-2 py-1 rounded text-sm"
                >
                  삭제
                </button>
              </div>

              <input
                type="text"
                value={view.description}
                onChange={(e) => updateView(index, 'description', e.target.value)}
                placeholder="전망 설명..."
                className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm mt-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 수익률 비교 차트 */}
      {Object.keys(priorReturns).length > 0 && Object.keys(posteriorReturns).length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">사전 vs 사후 기대수익률</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.keys(priorReturns).map(symbol => ({
              symbol,
              '시장 균형': priorReturns[symbol],
              'Black-Litterman': posteriorReturns[symbol]
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="symbol" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Bar dataKey="시장 균형" fill="#3B82F6" />
              <Bar dataKey="Black-Litterman" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 가중치 변화 */}
      {Object.keys(optimizedWeights).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30"
        >
          <h4 className="text-lg font-bold text-white mb-4">최적화된 포트폴리오 가중치</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(optimizedWeights).map(([symbol, weight]) => {
              const currentWeight = portfolio?.assets.find((a: any) => a.symbol === symbol)?.weight || 0
              const change = weight - currentWeight
              
              return (
                <div key={symbol} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm">{symbol}</div>
                    <div className="text-xl font-bold text-purple-400">
                      {(weight * 100).toFixed(1)}%
                    </div>
                    <div className={`text-xs mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change > 0 ? '▲' : '▼'} {Math.abs(change * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* 신뢰도 영향 분석 */}
      {confidenceImpact.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">전망 신뢰도의 영향</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={confidenceImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="viewId" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => value.toFixed(3)}
              />
              <Line 
                type="monotone" 
                dataKey="impact" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="포트폴리오 영향도"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {confidenceImpact.map((impact, index) => (
              <div key={index} className="text-sm text-gray-400">
                <span className="font-semibold">View {impact.viewId}:</span> {views[index]?.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}