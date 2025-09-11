'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

interface MomentumOscillatorProps {
  data: Array<{
    time: string
    momentum: number
    signal?: number
  }>
}

export default function MomentumOscillator({ data }: MomentumOscillatorProps) {
  const getBarColor = (value: number) => {
    if (value > 0) return '#10b981'
    return '#ef4444'
  }

  const currentMomentum = data && data.length > 0 ? data[data.length - 1]?.momentum || 0 : 0
  const previousMomentum = data && data.length > 1 ? data[data.length - 2]?.momentum || 0 : 0
  const momentumChange = currentMomentum - previousMomentum

  const getMomentumStrength = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue > 5) return { strength: '매우 강함', color: 'text-purple-400' }
    if (absValue > 3) return { strength: '강함', color: 'text-blue-400' }
    if (absValue > 1) return { strength: '보통', color: 'text-yellow-400' }
    return { strength: '약함', color: 'text-gray-400' }
  }

  const strength = getMomentumStrength(currentMomentum)

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        ⚡ 모멘텀 오실레이터
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#999' }}
            formatter={(value: number) => value.toFixed(2)}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          
          {/* 기준선 */}
          <ReferenceLine y={0} stroke="#666" strokeWidth={2} />
          <ReferenceLine y={3} stroke="#10b981" strokeDasharray="5 5" />
          <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="5 5" />
          
          {/* 모멘텀 바 */}
          <Bar dataKey="momentum" name="모멘텀">
            {(data || []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry?.momentum || 0)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">현재 모멘텀</div>
          <div className={`text-2xl font-bold ${currentMomentum > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currentMomentum.toFixed(2)}
          </div>
          <div className={`text-xs ${strength.color} mt-1`}>
            {strength.strength}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">모멘텀 변화</div>
          <div className={`text-lg font-bold ${momentumChange > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
            {momentumChange > 0 ? '↑' : '↓'} {Math.abs(momentumChange).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {momentumChange > 0 ? '가속' : '감속'}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">추세 방향</div>
          <div className={`text-lg font-bold ${currentMomentum > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currentMomentum > 0 ? '상승' : '하락'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.abs(currentMomentum).toFixed(1)}% 강도
          </div>
        </div>
      </div>
      
      <div className="mt-3 bg-indigo-900/20 border border-indigo-500/30 rounded p-3">
        <div className="text-sm text-indigo-400 mb-1">모멘텀 활용법</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• 양수(+): 상승 모멘텀 → 매수 우세</div>
          <div>• 음수(-): 하락 모멘텀 → 매도 우세</div>
          <div>• 0선 돌파: 추세 전환 신호</div>
          <div>• 절대값 증가: 추세 강화</div>
          <div>• 절대값 감소: 추세 약화</div>
          <div>• 다이버전스: 잠재적 반전</div>
        </div>
      </div>
      
      {/* 트레이딩 신호 */}
      {Math.abs(currentMomentum) > 3 && (
        <div className={`mt-3 bg-${currentMomentum > 0 ? 'green' : 'red'}-900/20 border border-${currentMomentum > 0 ? 'green' : 'red'}-500/30 rounded p-3`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              {currentMomentum > 0 ? '🟢 강한 매수 신호' : '🔴 강한 매도 신호'}
            </span>
            <span className="text-xs text-gray-400">
              모멘텀: {currentMomentum.toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {currentMomentum > 0 
              ? '상승 모멘텀이 강합니다. 추세 추종 매수 고려'
              : '하락 모멘텀이 강합니다. 추세 추종 매도 고려'}
          </div>
        </div>
      )}
    </div>
  )
}