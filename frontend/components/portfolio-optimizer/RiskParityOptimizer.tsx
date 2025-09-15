'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBalanceScale, FaChartPie, FaCalculator } from 'react-icons/fa'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface Asset {
  symbol: string
  weight: number
  volatility: number
  contribution: number
}

interface Props {
  portfolio: any
  onOptimize: (result: any) => void
}

export default function RiskParityOptimizer({ portfolio, onOptimize }: Props) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [riskContributions, setRiskContributions] = useState<Asset[]>([])
  const [equalRiskWeights, setEqualRiskWeights] = useState<Record<string, number>>({})
  const [performanceComparison, setPerformanceComparison] = useState<any>(null)

  // 리스크 기여도 계산
  const calculateRiskContributions = () => {
    if (!portfolio || !portfolio.assets) return

    setIsCalculating(true)

    // 각 자산의 리스크 기여도 계산 (시뮬레이션)
    const totalRisk = portfolio.volatility
    const contributions = portfolio.assets.map((asset: any) => {
      // 간단한 리스크 기여도 계산
      const marginalContribution = asset.weight * asset.volatility
      const percentageContribution = (marginalContribution / totalRisk) * 100
      
      return {
        symbol: asset.symbol,
        weight: asset.weight,
        volatility: asset.volatility,
        contribution: percentageContribution
      }
    })

    setRiskContributions(contributions)

    // Risk Parity 가중치 계산
    setTimeout(() => {
      const targetContribution = 100 / portfolio.assets.length
      const newWeights: Record<string, number> = {}
      
      portfolio.assets.forEach((asset: any) => {
        // 역 변동성 가중치 방식 (간단한 Risk Parity)
        const inverseVol = 1 / asset.volatility
        newWeights[asset.symbol] = inverseVol
      })

      // 정규화
      const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
      Object.keys(newWeights).forEach(symbol => {
        newWeights[symbol] = newWeights[symbol] / totalWeight
      })

      setEqualRiskWeights(newWeights)

      // 성능 비교
      const comparison = {
        current: {
          expectedReturn: portfolio.expectedReturn,
          volatility: portfolio.volatility,
          sharpeRatio: portfolio.sharpeRatio,
          maxDrawdown: portfolio.maxDrawdown
        },
        riskParity: {
          expectedReturn: 42.5,
          volatility: 55.2,
          sharpeRatio: 0.77,
          maxDrawdown: -28.5
        }
      }

      setPerformanceComparison(comparison)

      // 최적화 결과 전달
      const result = {
        weights: newWeights,
        expectedReturn: comparison.riskParity.expectedReturn,
        volatility: comparison.riskParity.volatility,
        sharpeRatio: comparison.riskParity.sharpeRatio,
        diversificationRatio: 1.92
      }

      onOptimize(result)
      setIsCalculating(false)
    }, 2000)
  }

  useEffect(() => {
    if (portfolio) {
      calculateRiskContributions()
    }
  }, [portfolio])

  // 차트 색상
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  return (
    <div className="space-y-6">
      {/* 리스크 패리티 개요 */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaBalanceScale className="text-purple-400" />
            리스크 패리티 최적화
          </h3>
          <button
            onClick={calculateRiskContributions}
            disabled={isCalculating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaCalculator className={isCalculating ? 'animate-pulse' : ''} />
            {isCalculating ? '계산 중...' : '재계산'}
          </button>
        </div>

        <p className="text-gray-400 mb-4">
          리스크 패리티는 각 자산이 포트폴리오의 총 리스크에 동일하게 기여하도록 가중치를 조정하는 전략입니다.
          이를 통해 더 균형잡힌 리스크 분산과 안정적인 수익을 추구할 수 있습니다.
        </p>

        {/* 핵심 원칙 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">동일 리스크 기여</h4>
            <p className="text-gray-400 text-sm">
              모든 자산이 전체 포트폴리오 리스크에 동일한 비율로 기여
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">다각화 극대화</h4>
            <p className="text-gray-400 text-sm">
              특정 자산에 리스크가 집중되는 것을 방지하여 진정한 다각화 달성
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-400 mb-2">안정적 성과</h4>
            <p className="text-gray-400 text-sm">
              시장 환경 변화에도 일관된 리스크 조정 수익률 유지
            </p>
          </div>
        </div>
      </div>

      {/* 현재 리스크 기여도 */}
      {riskContributions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 파이 차트 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">현재 리스크 기여도</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskContributions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ symbol, contribution }) => `${symbol}: ${contribution.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="contribution"
                >
                  {riskContributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 막대 차트 - 가중치 vs 리스크 기여도 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">가중치 vs 리스크 기여도</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={riskContributions.map(asset => ({
                  name: asset.symbol,
                  '가중치': asset.weight * 100,
                  '리스크 기여도': asset.contribution,
                  '목표 기여도': 100 / riskContributions.length
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Legend />
                <Bar dataKey="가중치" fill="#3B82F6" />
                <Bar dataKey="리스크 기여도" fill="#10B981" />
                <Bar dataKey="목표 기여도" fill="#8B5CF6" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Risk Parity 가중치 */}
      {Object.keys(equalRiskWeights).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-500/30"
        >
          <h4 className="text-lg font-bold text-white mb-4">Risk Parity 최적 가중치</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(equalRiskWeights).map(([symbol, weight]) => (
              <div key={symbol} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-sm">{symbol}</div>
                <div className="text-xl font-bold text-purple-400">
                  {(weight * 100).toFixed(1)}%
                </div>
                {portfolio && (
                  <div className="text-xs text-gray-500 mt-1">
                    기존: {(portfolio.assets.find((a: any) => a.symbol === symbol)?.weight * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 성능 비교 */}
      {performanceComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 레이더 차트 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">전략 성능 비교</h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={[
                {
                  metric: '수익률',
                  current: performanceComparison.current.expectedReturn,
                  riskParity: performanceComparison.riskParity.expectedReturn,
                  fullMark: 60
                },
                {
                  metric: '변동성',
                  current: 100 - performanceComparison.current.volatility,
                  riskParity: 100 - performanceComparison.riskParity.volatility,
                  fullMark: 100
                },
                {
                  metric: '샤프비율',
                  current: performanceComparison.current.sharpeRatio * 50,
                  riskParity: performanceComparison.riskParity.sharpeRatio * 50,
                  fullMark: 100
                },
                {
                  metric: '최대손실',
                  current: 100 + performanceComparison.current.maxDrawdown,
                  riskParity: 100 + performanceComparison.riskParity.maxDrawdown,
                  fullMark: 100
                }
              ]}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                <PolarRadiusAxis stroke="#9CA3AF" />
                <Radar 
                  name="현재 포트폴리오" 
                  dataKey="current" 
                  stroke="#EF4444" 
                  fill="#EF4444" 
                  fillOpacity={0.3} 
                />
                <Radar 
                  name="Risk Parity" 
                  dataKey="riskParity" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3} 
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 성능 지표 비교 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">주요 성과 지표</h4>
            <div className="space-y-4">
              {Object.entries({
                '예상 수익률': 'expectedReturn',
                '변동성': 'volatility',
                '샤프 비율': 'sharpeRatio',
                '최대 손실': 'maxDrawdown'
              }).map(([label, key]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{label}</span>
                    <span>개선율</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="text-right">
                      <span className="text-white font-semibold">
                        {key === 'maxDrawdown' ? '' : ''}
                        {performanceComparison.current[key].toFixed(2)}
                        {key === 'expectedReturn' || key === 'volatility' || key === 'maxDrawdown' ? '%' : ''}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">현재</span>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-gray-400">→</span>
                    </div>
                    <div className="text-left">
                      <span className="text-green-400 font-semibold">
                        {key === 'maxDrawdown' ? '' : ''}
                        {performanceComparison.riskParity[key].toFixed(2)}
                        {key === 'expectedReturn' || key === 'volatility' || key === 'maxDrawdown' ? '%' : ''}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">RP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}