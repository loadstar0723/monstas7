'use client'

import { useMemo } from 'react'
import { DeltaData, FootprintCell } from '../types'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { detectDeltaDivergence } from '../utils/calculations'
import { FaArrowUp, FaArrowDown, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

interface DeltaAnalysisProps {
  data: DeltaData[]
  footprintData: FootprintCell[]
  symbol: string
}

export default function DeltaAnalysis({ data, footprintData, symbol }: DeltaAnalysisProps) {
  // 델타 통계
  const stats = useMemo(() => {
    if (!data.length) return null
    
    const deltas = data.map(d => d.delta)
    const cumulativeDeltas = data.map(d => d.cumulativeDelta)
    
    return {
      currentDelta: deltas[deltas.length - 1] || 0,
      cumulativeDelta: cumulativeDeltas[cumulativeDeltas.length - 1] || 0,
      maxDelta: Math.max(...deltas),
      minDelta: Math.min(...deltas),
      avgDelta: deltas.reduce((sum, d) => sum + d, 0) / deltas.length,
      positiveDeltaCount: deltas.filter(d => d > 0).length,
      negativeDeltaCount: deltas.filter(d => d < 0).length
    }
  }, [data])

  // 다이버전스 감지
  const divergences = useMemo(() => {
    const priceData = footprintData.map(f => ({ time: f.time, price: f.price }))
    return detectDeltaDivergence(data, priceData)
  }, [data, footprintData])

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    return data.map((d, index) => ({
      ...d,
      price: footprintData[index]?.price || 0,
      divergence: divergences[index] || false
    }))
  }, [data, footprintData, divergences])

  // 델타 상태 판단
  const deltaStatus = useMemo(() => {
    if (!stats) return 'neutral'
    
    const recentDeltas = data.slice(-10)
    const recentSum = recentDeltas.reduce((sum, d) => sum + d.delta, 0)
    
    if (recentSum > 0 && stats.cumulativeDelta > 0) return 'bullish'
    if (recentSum < 0 && stats.cumulativeDelta < 0) return 'bearish'
    return 'neutral'
  }, [data, stats])

  if (!stats) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 text-center">
        <p className="text-gray-400">델타 데이터를 수집 중입니다...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 델타 요약 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">델타 분석 요약</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.cumulativeDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.cumulativeDelta.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">누적 델타</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${stats.currentDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.currentDelta.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">현재 델타</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {((stats.positiveDeltaCount / (stats.positiveDeltaCount + stats.negativeDeltaCount)) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">매수 비율</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold capitalize ${
              deltaStatus === 'bullish' ? 'text-green-400' : 
              deltaStatus === 'bearish' ? 'text-red-400' : 
              'text-gray-400'
            }`}>
              {deltaStatus}
            </div>
            <div className="text-sm text-gray-400">델타 상태</div>
          </div>
        </div>
      </div>

      {/* 누적 델타 차트 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">누적 델타 차트</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="cumulativeDelta" 
                stroke="#10B981" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {divergences.some(d => d) && (
          <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-400" />
            <span className="text-sm text-yellow-400">
              다이버전스가 감지되었습니다. 추세 전환 가능성에 주의하세요.
            </span>
          </div>
        )}
      </div>

      {/* 델타 히스토그램 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">델타 히스토그램</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <ReferenceLine y={0} stroke="#666" />
              <Bar 
                dataKey="delta"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.delta > 0 ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 델타 인사이트 */}
      <div className="bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">델타 인사이트</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {deltaStatus === 'bullish' ? (
              <FaArrowUp className="text-green-400 mt-1" />
            ) : deltaStatus === 'bearish' ? (
              <FaArrowDown className="text-red-400 mt-1" />
            ) : (
              <FaCheckCircle className="text-gray-400 mt-1" />
            )}
            <div>
              <h4 className="font-medium text-white">시장 압력</h4>
              <p className="text-sm text-gray-400">
                {deltaStatus === 'bullish' ? 
                  '매수 압력이 우세합니다. 상승 추세가 지속될 가능성이 있습니다.' :
                  deltaStatus === 'bearish' ?
                  '매도 압력이 우세합니다. 하락 추세가 지속될 가능성이 있습니다.' :
                  '매수와 매도가 균형을 이루고 있습니다. 방향성 전환을 주시하세요.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className={divergences.some(d => d) ? 'text-yellow-400' : 'text-gray-600'} />
            <div>
              <h4 className="font-medium text-white">다이버전스</h4>
              <p className="text-sm text-gray-400">
                {divergences.some(d => d) ?
                  '가격과 델타의 다이버전스가 감지되었습니다. 추세 전환 가능성에 주의하세요.' :
                  '현재 가격과 델타가 일치하는 움직임을 보이고 있습니다.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 델타 이해하기 */}
      <div className="bg-gray-700/30 rounded-xl p-6">
        <h4 className="font-medium text-white mb-2">델타란?</h4>
        <p className="text-sm text-gray-400">
          델타는 매수량과 매도량의 차이를 나타냅니다. 양수 델타는 매수 압력이, 음수 델타는 매도 압력이 강함을 의미합니다.
          누적 델타는 시간에 따른 델타의 합계로, 전체적인 시장 방향성을 파악하는데 유용합니다.
        </p>
      </div>
    </div>
  )
}