'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaBrain, FaChartPie, FaBalanceScale, FaExclamationTriangle,
  FaPlus, FaMinus, FaInfoCircle
} from 'react-icons/fa'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, PieChart, Pie
} from 'recharts'

interface MarketView {
  id: string
  asset1: string
  asset2: string
  viewType: 'absolute' | 'relative'
  expectedReturn: number
  confidence: number
}

interface AssetData {
  symbol: string
  marketCap: number
  currentWeight: number
  equilibriumReturn: number
  impliedReturn: number
  posteriorReturn: number
  optimalWeight: number
}

export default function BlackLittermanModel() {
  const [tau] = useState(0.025) // Scaling factor
  const [riskAversion] = useState(2.5)
  const [views, setViews] = useState<MarketView[]>([
    {
      id: '1',
      asset1: 'BTC',
      asset2: '',
      viewType: 'absolute',
      expectedReturn: 0.15,
      confidence: 0.8
    },
    {
      id: '2',
      asset1: 'ETH',
      asset2: 'BTC',
      viewType: 'relative',
      expectedReturn: 0.05,
      confidence: 0.6
    }
  ])

  const [assets] = useState<AssetData[]>([
    {
      symbol: 'BTC',
      marketCap: 800000000000,
      currentWeight: 0.45,
      equilibriumReturn: 0.12,
      impliedReturn: 0.13,
      posteriorReturn: 0.145,
      optimalWeight: 0.42
    },
    {
      symbol: 'ETH',
      marketCap: 400000000000,
      currentWeight: 0.25,
      equilibriumReturn: 0.10,
      impliedReturn: 0.11,
      posteriorReturn: 0.13,
      optimalWeight: 0.28
    },
    {
      symbol: 'BNB',
      marketCap: 100000000000,
      currentWeight: 0.10,
      equilibriumReturn: 0.08,
      impliedReturn: 0.085,
      posteriorReturn: 0.09,
      optimalWeight: 0.12
    },
    {
      symbol: 'SOL',
      marketCap: 50000000000,
      currentWeight: 0.08,
      equilibriumReturn: 0.15,
      impliedReturn: 0.14,
      posteriorReturn: 0.135,
      optimalWeight: 0.08
    },
    {
      symbol: 'ADA',
      marketCap: 30000000000,
      currentWeight: 0.07,
      equilibriumReturn: 0.06,
      impliedReturn: 0.065,
      posteriorReturn: 0.07,
      optimalWeight: 0.06
    },
    {
      symbol: 'Others',
      marketCap: 50000000000,
      currentWeight: 0.05,
      equilibriumReturn: 0.04,
      impliedReturn: 0.045,
      posteriorReturn: 0.05,
      optimalWeight: 0.04
    }
  ])

  const addView = () => {
    const newView: MarketView = {
      id: Date.now().toString(),
      asset1: 'BTC',
      asset2: '',
      viewType: 'absolute',
      expectedReturn: 0.1,
      confidence: 0.5
    }
    setViews([...views, newView])
  }

  const removeView = (id: string) => {
    setViews(views.filter(v => v.id !== id))
  }

  const updateView = (id: string, field: keyof MarketView, value: any) => {
    setViews(views.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const radarData = assets.map(asset => ({
    asset: asset.symbol,
    equilibrium: asset.equilibriumReturn * 100,
    implied: asset.impliedReturn * 100,
    posterior: asset.posteriorReturn * 100
  }))

  const weightComparisonData = assets.map(asset => ({
    asset: asset.symbol,
    current: asset.currentWeight * 100,
    optimal: asset.optimalWeight * 100,
    diff: (asset.optimalWeight - asset.currentWeight) * 100
  }))

  const pieData = assets.map(asset => ({
    name: asset.symbol,
    value: asset.optimalWeight * 100
  }))

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

  return (
    <div className="space-y-6">
      {/* Market Views Input */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaBrain className="text-purple-400" />
            시장 전망 입력
          </h3>
          <button
            onClick={addView}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> 전망 추가
          </button>
        </div>

        <div className="space-y-4">
          {views.map((view) => (
            <motion.div
              key={view.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700 rounded-lg p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">전망 유형</label>
                  <select
                    value={view.viewType}
                    onChange={(e) => updateView(view.id, 'viewType', e.target.value)}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                  >
                    <option value="absolute">절대 수익률</option>
                    <option value="relative">상대 수익률</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">자산 1</label>
                  <select
                    value={view.asset1}
                    onChange={(e) => updateView(view.id, 'asset1', e.target.value)}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                  >
                    {assets.map(asset => (
                      <option key={asset.symbol} value={asset.symbol}>
                        {asset.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                {view.viewType === 'relative' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">자산 2</label>
                    <select
                      value={view.asset2}
                      onChange={(e) => updateView(view.id, 'asset2', e.target.value)}
                      className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                    >
                      <option value="">선택</option>
                      {assets
                        .filter(a => a.symbol !== view.asset1)
                        .map(asset => (
                          <option key={asset.symbol} value={asset.symbol}>
                            {asset.symbol}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    기대 수익률 (%)
                  </label>
                  <input
                    type="number"
                    value={view.expectedReturn * 100}
                    onChange={(e) => updateView(view.id, 'expectedReturn', Number(e.target.value) / 100)}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded"
                    step="1"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-400 mb-1">
                      신뢰도
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={view.confidence * 100}
                      onChange={(e) => updateView(view.id, 'confidence', Number(e.target.value) / 100)}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">
                      {(view.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <button
                    onClick={() => removeView(view.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                  >
                    <FaMinus />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {views.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            시장 전망을 추가하여 Black-Litterman 모델을 활성화하세요
          </p>
        )}
      </div>

      {/* Returns Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">수익률 비교</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="asset" stroke="#9CA3AF" />
              <PolarRadiusAxis angle={90} domain={[0, 20]} stroke="#9CA3AF" />
              <Radar
                name="균형 수익률"
                dataKey="equilibrium"
                stroke="#6B7280"
                fill="#6B7280"
                fillOpacity={0.3}
              />
              <Radar
                name="시장 암시 수익률"
                dataKey="implied"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Radar
                name="베이지안 수익률"
                dataKey="posterior"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">최적 포트폴리오 구성</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight Adjustments */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaBalanceScale className="text-yellow-400" />
          가중치 조정 권장사항
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weightComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="asset" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Bar dataKey="current" fill="#6B7280" name="현재 가중치" />
            <Bar dataKey="optimal" fill="#3B82F6" name="최적 가중치" />
            <Bar dataKey="diff" fill="#10B981" name="조정값">
              {weightComparisonData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.diff >= 0 ? '#10B981' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Model Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">모델 파라미터</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Tau (τ)</span>
                <span className="text-white">{tau}</span>
              </div>
              <p className="text-xs text-gray-500">
                균형 수익률의 불확실성 스케일링 팩터
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">위험 회피 계수</span>
                <span className="text-white">{riskAversion}</span>
              </div>
              <p className="text-xs text-gray-500">
                투자자의 위험 회피 성향
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">활성 전망 수</span>
                <span className="text-white">{views.length}</span>
              </div>
              <p className="text-xs text-gray-500">
                베이지안 업데이트에 사용된 전망
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <FaExclamationTriangle />
            주의사항
          </h3>
          <ul className="text-sm text-yellow-300 space-y-2">
            <li>• 시장 전망의 신뢰도가 낮을수록 균형 수익률에 가까워집니다</li>
            <li>• 극단적인 전망은 비현실적인 포트폴리오를 생성할 수 있습니다</li>
            <li>• 실제 투자 전 백테스팅을 통한 검증이 필요합니다</li>
          </ul>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <p className="text-blue-400 text-sm flex items-start gap-2">
          <FaInfoCircle className="mt-0.5 flex-shrink-0" />
          Black-Litterman 모델은 시장 균형 수익률과 투자자의 주관적 전망을 베이지안 방법으로 결합하여 
          더 안정적이고 직관적인 포트폴리오 최적화를 제공합니다.
        </p>
      </div>
    </div>
  )
}