'use client'

import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts'

interface SupertrendChartProps {
  data: Array<{
    time: string
    price: number
    supertrend: number
    upperBand: number
    lowerBand: number
    trend: 'up' | 'down'
  }>
}

export default function SupertrendChart({ data }: SupertrendChartProps) {
  // 현재 추세 및 통계
  const stats = useMemo(() => {
    if (!data || data.length === 0) return {
      currentTrend: 'neutral',
      trendStrength: 0,
      trendDuration: 0,
      priceDistance: 0
    }

    const latest = data[data.length - 1]
    let trendDuration = 1
    
    // 현재 추세가 얼마나 지속되었는지 계산
    for (let i = data.length - 2; i >= 0; i--) {
      if (data[i].trend === latest.trend) {
        trendDuration++
      } else {
        break
      }
    }

    // 가격과 슈퍼트렌드 간 거리 (%)
    const priceDistance = ((latest.price - latest.supertrend) / latest.price * 100)

    // 추세 강도 계산 (0-100)
    const trendStrength = Math.min(100, Math.abs(priceDistance) * 10)

    return {
      currentTrend: latest.trend,
      trendStrength,
      trendDuration,
      priceDistance: Math.abs(priceDistance)
    }
  }, [data])

  // 추세 전환 신호 감지
  const trendSignals = useMemo(() => {
    const signals: Array<{ index: number, type: 'buy' | 'sell' }> = []
    
    for (let i = 1; i < data.length; i++) {
      if (data[i].trend !== data[i - 1].trend) {
        signals.push({
          index: i,
          type: data[i].trend === 'up' ? 'buy' : 'sell'
        })
      }
    }
    
    return signals
  }, [data])

  return (
    <div className="space-y-4">
      {/* 차트 */}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value: any, name: string) => {
              return [`$${value.toFixed(2)}`, name]
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#9ca3af' }}
          />
          
          {/* 밴드 영역 */}
          <Area 
            type="monotone" 
            dataKey="upperBand" 
            fill="#3b82f6" 
            fillOpacity={0.1}
            stroke="transparent"
            name="상단 밴드"
          />
          <Area 
            type="monotone" 
            dataKey="lowerBand" 
            fill="#ef4444" 
            fillOpacity={0.1}
            stroke="transparent"
            name="하단 밴드"
          />
          
          {/* 가격 라인 */}
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="가격"
            dot={false}
            activeDot={{ r: 6 }}
          />
          
          {/* 슈퍼트렌드 라인 - 추세에 따라 색상 변경 */}
          <Line 
            type="monotone" 
            dataKey="supertrend" 
            stroke={stats.currentTrend === 'up' ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Supertrend"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 현재 상태 인디케이터 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-3 bg-gray-800/50 rounded">
          <div className="text-xs text-gray-400 mb-1">추세 방향</div>
          <div className={`text-lg font-bold ${
            stats.currentTrend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {stats.currentTrend === 'up' ? '상승' : '하락'}
          </div>
        </div>
        
        <div className="p-3 bg-gray-800/50 rounded">
          <div className="text-xs text-gray-400 mb-1">추세 강도</div>
          <div className="text-lg font-bold text-white">
            {stats.trendStrength.toFixed(0)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full ${
                stats.currentTrend === 'up' ? 'bg-green-400' : 'bg-red-400'
              }`}
              style={{ width: `${stats.trendStrength}%` }}
            ></div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-800/50 rounded">
          <div className="text-xs text-gray-400 mb-1">추세 지속</div>
          <div className="text-lg font-bold text-white">
            {stats.trendDuration}봉
          </div>
        </div>
        
        <div className="p-3 bg-gray-800/50 rounded">
          <div className="text-xs text-gray-400 mb-1">가격 거리</div>
          <div className="text-lg font-bold text-white">
            {stats.priceDistance.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 최근 신호 */}
      {trendSignals.length > 0 && (
        <div className="p-4 bg-gray-800/30 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-3">최근 추세 전환 신호</h4>
          <div className="space-y-2">
            {trendSignals.slice(-3).reverse().map((signal, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    signal.type === 'buy' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm text-gray-300">
                    {data[signal.index]?.time || ''}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  signal.type === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {signal.type === 'buy' ? '매수 신호' : '매도 신호'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전략 설명 */}
      <div className="p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Supertrend 트레이딩 전략</h4>
        <div className="space-y-2 text-sm text-gray-300">
          <div>• 가격이 Supertrend 위로 돌파 시 매수 진입</div>
          <div>• 가격이 Supertrend 아래로 하락 시 매도 진입</div>
          <div>• 추세 지속 기간이 길수록 신호 신뢰도 증가</div>
          <div>• ATR 기반 동적 밴드로 변동성 자동 조절</div>
        </div>
      </div>
    </div>
  )
}