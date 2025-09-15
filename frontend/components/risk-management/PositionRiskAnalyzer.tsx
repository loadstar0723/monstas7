'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBalanceScale, FaExclamationTriangle, FaChartPie, FaDollarSign } from 'react-icons/fa'
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

interface Position {
  id: string
  symbol: string
  type: 'long' | 'short'
  size: number
  entryPrice: number
  currentPrice: number
  pnl: number
  risk: number
  stopLoss: number
  takeProfit: number
  leverage: number
}

interface Props {
  positions: Position[]
  totalCapital: number
}

export default function PositionRiskAnalyzer({ positions, totalCapital }: Props) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null)

  useEffect(() => {
    analyzePortfolioRisk()
  }, [positions])

  const analyzePortfolioRisk = () => {
    // 포트폴리오 전체 리스크 분석
    const totalExposure = positions.reduce((sum, pos) => 
      sum + (pos.size * pos.currentPrice * pos.leverage), 0
    )
    
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
    const totalRisk = positions.reduce((sum, pos) => sum + pos.risk, 0) / positions.length
    
    const leverageRisk = positions.reduce((sum, pos) => 
      sum + (pos.leverage * pos.risk), 0
    ) / positions.reduce((sum, pos) => sum + pos.leverage, 0)

    // 포지션별 리스크 기여도
    const riskContribution = positions.map(pos => ({
      symbol: pos.symbol,
      contribution: (pos.risk * pos.size * pos.currentPrice) / totalExposure * 100,
      exposure: pos.size * pos.currentPrice * pos.leverage,
      riskScore: pos.risk * pos.leverage
    }))

    // 상관관계 리스크 (시뮬레이션)
    const correlationRisk = positions.length > 1 ? 
      Math.min(100, positions.length * 10 + Math.random() * 20) : 0

    setRiskAnalysis({
      totalExposure,
      totalPnL,
      totalRisk,
      leverageRisk,
      correlationRisk,
      riskContribution,
      exposureRatio: totalExposure / totalCapital * 100,
      kellyPercentage: Math.min(25, totalExposure / totalCapital * 100)
    })
  }

  // 포지션별 리스크 점수 계산
  const calculatePositionRiskScore = (position: Position) => {
    const priceRisk = Math.abs((position.currentPrice - position.entryPrice) / position.entryPrice) * 100
    const stopLossDistance = Math.abs((position.stopLoss - position.currentPrice) / position.currentPrice) * 100
    const leverageRisk = position.leverage * 10
    const sizeRisk = (position.size * position.currentPrice / totalCapital) * 100

    return {
      priceRisk,
      stopLossDistance,
      leverageRisk,
      sizeRisk,
      totalScore: (priceRisk + stopLossDistance + leverageRisk + sizeRisk) / 4
    }
  }

  // 차트 색상
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  // 리스크 레벨 색상
  const getRiskColor = (risk: number) => {
    if (risk > 20) return 'text-red-400 bg-red-500/20'
    if (risk > 15) return 'text-orange-400 bg-orange-500/20'
    if (risk > 10) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  return (
    <div className="space-y-6">
      {/* 포트폴리오 리스크 개요 */}
      {riskAnalysis && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">포트폴리오 리스크 분석</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">총 노출금액</div>
              <div className="text-xl font-bold text-white">
                ${riskAnalysis.totalExposure.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                자본 대비 {riskAnalysis.exposureRatio.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">평균 리스크</div>
              <div className={`text-xl font-bold ${
                riskAnalysis.totalRisk > 15 ? 'text-red-400' : 
                riskAnalysis.totalRisk > 10 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {riskAnalysis.totalRisk.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">레버리지 리스크</div>
              <div className="text-xl font-bold text-orange-400">
                {riskAnalysis.leverageRisk.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm">상관관계 리스크</div>
              <div className="text-xl font-bold text-purple-400">
                {riskAnalysis.correlationRisk.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Kelly Criterion 권고 */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-blue-400 font-semibold">Kelly Criterion 권고</h4>
                <p className="text-gray-300 text-sm mt-1">
                  현재 노출: {riskAnalysis.exposureRatio.toFixed(1)}% / 권장: {riskAnalysis.kellyPercentage.toFixed(1)}%
                </p>
              </div>
              {riskAnalysis.exposureRatio > riskAnalysis.kellyPercentage && (
                <FaExclamationTriangle className="text-yellow-400 text-xl" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 포지션별 상세 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 포지션 리스트 */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">포지션별 리스크</h3>
          <div className="space-y-3">
            {positions.map((position) => {
              const riskScore = calculatePositionRiskScore(position)
              return (
                <motion.div
                  key={position.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gray-900/50 rounded-lg p-4 cursor-pointer border ${
                    selectedPosition?.id === position.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedPosition(position)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{position.symbol}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        position.type === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {position.type.toUpperCase()} {position.leverage}x
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getRiskColor(position.risk)}`}>
                      리스크: {position.risk}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">포지션</span>
                      <div className="text-white">{position.size}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">진입가</span>
                      <div className="text-white">${position.entryPrice}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">손익</span>
                      <div className={position.pnl > 0 ? 'text-green-400' : 'text-red-400'}>
                        ${position.pnl.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* 리스크 바 */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          riskScore.totalScore > 20 ? 'bg-red-500' :
                          riskScore.totalScore > 15 ? 'bg-orange-500' :
                          riskScore.totalScore > 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, riskScore.totalScore)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* 선택된 포지션 상세 */}
        {selectedPosition && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedPosition.symbol} 리스크 상세
            </h3>
            
            {(() => {
              const riskScore = calculatePositionRiskScore(selectedPosition)
              const radarData = [
                { metric: '가격 리스크', value: riskScore.priceRisk },
                { metric: '손절 거리', value: riskScore.stopLossDistance },
                { metric: '레버리지 리스크', value: riskScore.leverageRisk },
                { metric: '포지션 크기', value: riskScore.sizeRisk }
              ]
              
              return (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                      <PolarRadiusAxis stroke="#9CA3AF" />
                      <Radar 
                        name={selectedPosition.symbol} 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3} 
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">손절가</span>
                      <span className="text-red-400">${selectedPosition.stopLoss}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">목표가</span>
                      <span className="text-green-400">${selectedPosition.takeProfit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">최대 손실</span>
                      <span className="text-orange-400">
                        ${Math.abs(selectedPosition.size * (selectedPosition.stopLoss - selectedPosition.entryPrice)).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">리스크/리워드</span>
                      <span className="text-blue-400">
                        1:{((selectedPosition.takeProfit - selectedPosition.entryPrice) / 
                            (selectedPosition.entryPrice - selectedPosition.stopLoss)).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* 리스크 분포 차트 */}
      {riskAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 포지션별 리스크 기여도 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">리스크 기여도</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskAnalysis.riskContribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ symbol, contribution }) => `${symbol}: ${contribution.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="contribution"
                >
                  {riskAnalysis.riskContribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 레버리지별 노출 */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">레버리지별 노출</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={positions.map(pos => ({
                symbol: pos.symbol,
                exposure: pos.size * pos.currentPrice,
                leveragedExposure: pos.size * pos.currentPrice * pos.leverage
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="symbol" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="exposure" fill="#3B82F6" name="실제 노출" />
                <Bar dataKey="leveragedExposure" fill="#EF4444" name="레버리지 노출" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}