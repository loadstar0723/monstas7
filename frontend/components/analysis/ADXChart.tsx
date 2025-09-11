'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ADXChartProps {
  data: Array<{
    time: string
    adx: number
    plusDI: number
    minusDI: number
  }>
}

export default function ADXChart({ data }: ADXChartProps) {
  const lastData = data && data.length > 0 ? data[data.length - 1] : null
  const currentADX = typeof lastData?.adx === 'number' ? lastData.adx : 0
  const currentPlusDI = typeof lastData?.plusDI === 'number' ? lastData.plusDI : 0
  const currentMinusDI = typeof lastData?.minusDI === 'number' ? lastData.minusDI : 0
  
  // y축 domain 계산 - 데이터의 최대/최소값에 따라 자동 조정
  const yDomain = React.useMemo(() => {
    if (!data || data.length === 0) return [0, 100]
    
    let maxValue = 0
    let minValue = 100
    
    data.forEach(d => {
      maxValue = Math.max(maxValue, d.adx, d.plusDI, d.minusDI)
      minValue = Math.min(minValue, d.adx, d.plusDI, d.minusDI)
    })
    
    // 여유를 두고 범위 설정
    const padding = (maxValue - minValue) * 0.1
    return [
      Math.max(0, Math.floor(minValue - padding)),
      Math.min(100, Math.ceil(maxValue + padding))
    ]
  }, [data])
  
  const getTrendStrength = (value: number) => {
    if (value >= 50) return { label: '극강 추세', color: 'text-purple-400' }
    if (value >= 40) return { label: '매우 강한 추세', color: 'text-blue-400' }
    if (value >= 25) return { label: '강한 추세', color: 'text-green-400' }
    if (value >= 20) return { label: '보통 추세', color: 'text-yellow-400' }
    return { label: '약한 추세', color: 'text-gray-400' }
  }
  
  const trendStrength = getTrendStrength(currentADX)
  const trendDirection = currentPlusDI > currentMinusDI ? '상승' : '하락'

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📊 ADX (평균방향지수)
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
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
            formatter={(value: any) => {
              if (value === null || value === undefined) return '0.00'
              const numValue = Number(value)
              return !isNaN(numValue) ? numValue.toFixed(2) : '0.00'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />
          
          {/* 추세 강도 기준선 */}
          <ReferenceLine y={20} stroke="#666" strokeDasharray="5 5" label="약한 추세" />
          <ReferenceLine y={25} stroke="#10b981" strokeDasharray="5 5" label="강한 추세" />
          <ReferenceLine y={40} stroke="#3b82f6" strokeDasharray="5 5" label="매우 강함" />
          <ReferenceLine y={50} stroke="#a855f7" strokeDasharray="5 5" label="극강" />
          
          {/* ADX 라인 */}
          <Line 
            type="monotone" 
            dataKey="adx" 
            stroke="#a855f7" 
            strokeWidth={2}
            dot={false}
            name="ADX"
          />
          
          {/* +DI 라인 */}
          <Line 
            type="monotone" 
            dataKey="plusDI" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            name="+DI (상승)"
          />
          
          {/* -DI 라인 */}
          <Line 
            type="monotone" 
            dataKey="minusDI" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
            name="-DI (하락)"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">ADX 값</div>
          <div className={`text-2xl font-bold ${trendStrength.color}`}>
            {(typeof currentADX === 'number' ? currentADX : 0).toFixed(2)}
          </div>
          <div className={`text-xs ${trendStrength.color} mt-1`}>
            {trendStrength.label}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">추세 방향</div>
          <div className={`text-lg font-bold ${trendDirection === '상승' ? 'text-green-400' : 'text-red-400'}`}>
            {trendDirection}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            +DI: {(typeof currentPlusDI === 'number' ? currentPlusDI : 0).toFixed(1)} / -DI: {(typeof currentMinusDI === 'number' ? currentMinusDI : 0).toFixed(1)}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">신호</div>
          <div className={`text-lg font-bold ${
            (typeof currentADX === 'number' ? currentADX : 0) > 25 ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {(typeof currentADX === 'number' ? currentADX : 0) > 25 ? '추세 추종' : '관망'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(typeof currentADX === 'number' ? currentADX : 0) > 25 ? '강한 추세 확인' : '추세 약함'}
          </div>
        </div>
      </div>
      
      <div className="mt-3 bg-purple-900/20 border border-purple-500/30 rounded p-3">
        <div className="text-sm text-purple-400 mb-1">ADX 활용법</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• ADX {'>'} 25: 강한 추세 → 추세 추종 전략</div>
          <div>• ADX {'<'} 20: 약한 추세 → 박스권 전략</div>
          <div>• +DI {'>'} -DI: 상승 추세 우세</div>
          <div>• -DI {'>'} +DI: 하락 추세 우세</div>
          <div>• DI 크로스: 추세 전환 신호</div>
          <div>• ADX 상승: 추세 강화 중</div>
        </div>
      </div>
    </div>
  )
}