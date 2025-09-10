'use client'

import React, { useMemo } from 'react'

interface SweepData {
  timestamp: number
  price: number
  volume: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
  impact: number
  side: 'buy' | 'sell'
}

interface RiskAlertProps {
  sweeps: SweepData[]
  currentPrice: number
}

export default function RiskAlert({ sweeps, currentPrice }: RiskAlertProps) {
  const riskAnalysis = useMemo(() => {
    if (sweeps.length === 0) {
      return {
        level: 'low',
        score: 0,
        factors: []
      }
    }

    const recentSweeps = sweeps.slice(-20)
    const buyCount = recentSweeps.filter(s => s.side === 'buy').length
    const sellCount = recentSweeps.filter(s => s.side === 'sell').length
    const totalVolume = recentSweeps.reduce((sum, s) => sum + s.volume, 0)
    const avgImpact = recentSweeps.reduce((sum, s) => sum + s.impact, 0) / recentSweeps.length
    const aggressiveCount = recentSweeps.filter(s => s.type === 'aggressive').length

    let score = 0
    const factors = []

    // 일방향 스윕
    if (Math.abs(buyCount - sellCount) > 10) {
      score += 30
      factors.push('Directional sweep detected')
    }

    // 고임팩트
    if (avgImpact > 1) {
      score += 25
      factors.push('High average impact')
    }

    // 공격적 스윕 다수
    if (aggressiveCount > 10) {
      score += 25
      factors.push('Multiple aggressive sweeps')
    }

    // 대량 거래
    if (totalVolume > 100) {
      score += 20
      factors.push('High volume concentration')
    }

    let level: 'low' | 'medium' | 'high' | 'critical'
    if (score >= 75) level = 'critical'
    else if (score >= 50) level = 'high'
    else if (score >= 25) level = 'medium'
    else level = 'low'

    return { level, score, factors }
  }, [sweeps])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      default: return 'bg-green-500 text-white'
    }
  }

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getKoreanLevel = (level: string) => {
    switch (level) {
      case 'critical': return '매우 위험'
      case 'high': return '높음'
      case 'medium': return '보통'
      default: return '낮음'
    }
  }

  const getKoreanFactors = (factor: string) => {
    switch (factor) {
      case 'Directional sweep detected': return '방향성 스윕 감지됨'
      case 'High average impact': return '높은 평균 영향도'
      case 'Multiple aggressive sweeps': return '다수의 공격적 스윕'
      case 'High volume concentration': return '높은 거래량 집중도'
      default: return factor
    }
  }

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-white">위험도 평가</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(riskAnalysis.level)}`}>
          {getKoreanLevel(riskAnalysis.level)}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-white">{riskAnalysis.score}</span>
          <span className="text-gray-400">/ 100</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getProgressColor(riskAnalysis.level)}`}
            style={{ width: `${riskAnalysis.score}%` }}
          />
        </div>
      </div>
      
      {riskAnalysis.factors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm text-gray-400 mb-2">위험 요인</h4>
          {riskAnalysis.factors.map((factor, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">{getKoreanFactors(factor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}