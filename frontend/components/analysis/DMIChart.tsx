'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface DMIChartProps {
  data: Array<{
    time: string
    plusDI: number
    minusDI: number
    adx?: number
  }>
}

export default function DMIChart({ data }: DMIChartProps) {
  const currentPlusDI = data && data.length > 0 ? data[data.length - 1]?.plusDI || 0 : 0
  const currentMinusDI = data && data.length > 0 ? data[data.length - 1]?.minusDI || 0 : 0
  const currentADX = data && data.length > 0 ? data[data.length - 1]?.adx || 0 : 0
  
  // y축 domain 계산 - 데이터의 최대/최소값에 따라 자동 조정
  const yDomain = React.useMemo(() => {
    if (!data || data.length === 0) return [0, 100]
    
    let maxValue = 0
    let minValue = 100
    
    data.forEach(d => {
      maxValue = Math.max(maxValue, d.plusDI, d.minusDI, d.adx || 0)
      minValue = Math.min(minValue, d.plusDI, d.minusDI, d.adx || 0)
    })
    
    // 여유를 두고 범위 설정
    const padding = (maxValue - minValue) * 0.1
    return [
      Math.max(0, Math.floor(minValue - padding)),
      Math.min(100, Math.ceil(maxValue + padding))
    ]
  }, [data])
  
  const getTrendDirection = () => {
    if (currentPlusDI > currentMinusDI) {
      const strength = currentPlusDI - currentMinusDI
      if (strength > 20) return { direction: '강한 상승', color: 'text-green-500' }
      if (strength > 10) return { direction: '상승', color: 'text-green-400' }
      return { direction: '약한 상승', color: 'text-blue-400' }
    } else {
      const strength = currentMinusDI - currentPlusDI
      if (strength > 20) return { direction: '강한 하락', color: 'text-red-500' }
      if (strength > 10) return { direction: '하락', color: 'text-red-400' }
      return { direction: '약한 하락', color: 'text-orange-400' }
    }
  }
  
  const trend = getTrendDirection()
  const diDifference = Math.abs(currentPlusDI - currentMinusDI)

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📈 DMI (방향성 지수)
      </h3>
      
      <div className="h-[200px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
          />
          <YAxis 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
            domain={yDomain}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#999' }}
            formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : '0'}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />
          
          {/* 기준선 */}
          <ReferenceLine y={25} stroke="#666" strokeDasharray="5 5" label="기준선" />
          
          {/* +DI 라인 (상승 강도) */}
          <Line 
            type="monotone" 
            dataKey="plusDI" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            name="+DI (상승)"
          />
          
          {/* -DI 라인 (하락 강도) */}
          <Line 
            type="monotone" 
            dataKey="minusDI" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
            name="-DI (하락)"
          />
          
          {/* ADX 라인 (옵션) */}
          {data && data.length > 0 && data[0]?.adx !== undefined && (
            <Line 
              type="monotone" 
              dataKey="adx" 
              stroke="#a855f7" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="ADX"
              opacity={0.5}
            />
          )}
        </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">+DI (상승)</div>
          <div className="text-2xl font-bold text-green-400">
            {currentPlusDI.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentPlusDI > 25 ? '강한 상승압' : '약한 상승압'}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">-DI (하락)</div>
          <div className="text-2xl font-bold text-red-400">
            {currentMinusDI.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currentMinusDI > 25 ? '강한 하락압' : '약한 하락압'}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">추세 방향</div>
          <div className={`text-lg font-bold ${trend.color}`}>
            {trend.direction}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            차이: {diDifference.toFixed(1)}
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-800/30 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">DI 크로스오버</div>
          <div className="text-xs text-gray-300">
            {currentPlusDI > currentMinusDI ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>+DI가 -DI 상회 (상승 신호)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>-DI가 +DI 상회 (하락 신호)</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800/30 rounded p-3">
          <div className="text-sm text-gray-400 mb-2">추세 강도</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  diDifference > 20 ? 'bg-purple-500' :
                  diDifference > 10 ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}
                style={{ width: `${Math.min(diDifference * 2, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {diDifference.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded p-3">
        <div className="text-sm text-blue-400 mb-1">DMI 활용법</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• +DI {'>'} -DI: 상승 추세 → 매수 우세</div>
          <div>• -DI {'>'} +DI: 하락 추세 → 매도 우세</div>
          <div>• DI 크로스: 추세 전환 신호</div>
          <div>• DI 차이 확대: 추세 강화</div>
          <div>• DI 차이 축소: 추세 약화</div>
          <div>• 두 DI 모두 25 이하: 횡보장</div>
        </div>
      </div>
      
      {/* 트레이딩 신호 */}
      {diDifference > 15 && (
        <div className={`mt-3 bg-${currentPlusDI > currentMinusDI ? 'green' : 'red'}-900/20 border border-${currentPlusDI > currentMinusDI ? 'green' : 'red'}-500/30 rounded p-3`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              {currentPlusDI > currentMinusDI ? '🟢 추세 추종 매수' : '🔴 추세 추종 매도'}
            </span>
            <span className="text-xs text-gray-400">
              DI 차이: {diDifference.toFixed(1)}
            </span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {currentPlusDI > currentMinusDI 
              ? '+DI가 우세하며 상승 추세가 강합니다'
              : '-DI가 우세하며 하락 추세가 강합니다'}
          </div>
        </div>
      )}
    </div>
  )
}