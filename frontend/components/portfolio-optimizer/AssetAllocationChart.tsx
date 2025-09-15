'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaChartPie, FaExchangeAlt, FaBalanceScale } from 'react-icons/fa'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  TreemapChart, Treemap
} from 'recharts'

interface Props {
  portfolio: any
  optimizationResult: any
}

export default function AssetAllocationChart({ portfolio, optimizationResult }: Props) {
  const [viewMode, setViewMode] = useState<'pie' | 'bar' | 'treemap'>('pie')
  const [showComparison, setShowComparison] = useState(true)

  if (!portfolio) return null

  // 차트 데이터 준비
  const currentAllocation = portfolio.assets.map((asset: any) => ({
    name: asset.symbol,
    value: asset.weight * 100,
    amount: portfolio.totalValue * asset.weight,
    return: asset.expectedReturn,
    risk: asset.volatility
  }))

  const optimizedAllocation = optimizationResult ? 
    Object.entries(optimizationResult.weights).map(([symbol, weight]) => {
      const asset = portfolio.assets.find((a: any) => a.symbol === symbol)
      return {
        name: symbol,
        value: (weight as number) * 100,
        amount: portfolio.totalValue * (weight as number),
        return: asset?.expectedReturn || 0,
        risk: asset?.volatility || 0
      }
    }) : []

  // Treemap 데이터
  const treemapData = {
    name: 'Portfolio',
    children: currentAllocation.map((asset: any) => ({
      name: asset.name,
      size: asset.value,
      return: asset.return,
      risk: asset.risk
    }))
  }

  // 색상 팔레트
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

  // 커스텀 라벨
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-xs"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Treemap 커스텀 컨텐츠
  const CustomTreemapContent = ({ x, y, width, height, name, value, return: returnVal }: any) => {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[Math.floor(Math.random() * COLORS.length)],
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        {width > 50 && height > 50 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="white"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="white"
              fontSize={12}
            >
              {value.toFixed(1)}%
            </text>
          </>
        )}
      </g>
    )
  }

  // 비교 데이터
  const comparisonData = currentAllocation.map((current: any) => {
    const optimized = optimizedAllocation.find(o => o.name === current.name)
    return {
      name: current.name,
      현재: current.value,
      최적화: optimized?.value || 0,
      변화: (optimized?.value || 0) - current.value
    }
  })

  // 전체 통계
  const totalStats = {
    currentReturn: currentAllocation.reduce((sum: number, a: any) => sum + (a.value / 100) * a.return, 0),
    optimizedReturn: optimizationResult?.expectedReturn || 0,
    currentRisk: portfolio.volatility,
    optimizedRisk: optimizationResult?.volatility || 0
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 뷰 선택 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaChartPie className="text-blue-400" />
            자산 배분 현황
          </h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-400">최적화 비교</span>
            </label>
            <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('pie')}
                className={`px-3 py-1 rounded ${viewMode === 'pie' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                파이
              </button>
              <button
                onClick={() => setViewMode('bar')}
                className={`px-3 py-1 rounded ${viewMode === 'bar' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                막대
              </button>
              <button
                onClick={() => setViewMode('treemap')}
                className={`px-3 py-1 rounded ${viewMode === 'treemap' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              >
                트리맵
              </button>
            </div>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs">현재 수익률</div>
            <div className="text-lg font-bold text-white">{totalStats.currentReturn.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs">최적 수익률</div>
            <div className="text-lg font-bold text-green-400">{totalStats.optimizedReturn.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs">현재 리스크</div>
            <div className="text-lg font-bold text-white">{totalStats.currentRisk.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-gray-400 text-xs">최적 리스크</div>
            <div className="text-lg font-bold text-yellow-400">{totalStats.optimizedRisk.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 현재 배분 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">현재 포트폴리오</h4>
          
          {viewMode === 'pie' && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentAllocation.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'bar' && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentAllocation} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="value" fill="#3B82F6">
                  {currentAllocation.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {viewMode === 'treemap' && (
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                width={400}
                height={300}
                data={treemapData.children}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
          )}
        </div>

        {/* 최적화 배분 */}
        {showComparison && optimizationResult && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">최적화된 포트폴리오</h4>
            
            {viewMode === 'pie' && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={optimizedAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {optimizedAllocation.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {viewMode === 'bar' && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={optimizedAllocation} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="value" fill="#10B981">
                    {optimizedAllocation.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* 변화 분석 */}
      {showComparison && optimizationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
        >
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaExchangeAlt className="text-purple-400" />
            배분 변화 분석
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend />
              <Bar dataKey="현재" fill="#3B82F6" />
              <Bar dataKey="최적화" fill="#10B981" />
              <Bar dataKey="변화" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>

          {/* 주요 변화 요약 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonData
              .filter(d => Math.abs(d.변화) > 5)
              .sort((a, b) => Math.abs(b.변화) - Math.abs(a.변화))
              .slice(0, 3)
              .map((change, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{change.name}</span>
                    <span className={`font-bold ${change.변화 > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {change.변화 > 0 ? '+' : ''}{change.변화.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {change.현재.toFixed(1)}% → {change.최적화.toFixed(1)}%
                  </div>
                </div>
              ))
            }
          </div>
        </motion.div>
      )}

      {/* 리밸런싱 권고 */}
      {optimizationResult && (
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
          <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <FaBalanceScale />
            리밸런싱 권고사항
          </h5>
          <ul className="space-y-1 text-sm text-gray-300">
            <li>• 예상 수익률이 {(totalStats.optimizedReturn - totalStats.currentReturn).toFixed(1)}% 개선됩니다</li>
            <li>• 포트폴리오 리스크가 {Math.abs(totalStats.optimizedRisk - totalStats.currentRisk).toFixed(1)}% 변화합니다</li>
            <li>• 분기별 리밸런싱을 통해 목표 배분을 유지하세요</li>
            <li>• 거래 비용을 고려하여 5% 이상 차이날 때만 조정하세요</li>
          </ul>
        </div>
      )}
    </div>
  )
}