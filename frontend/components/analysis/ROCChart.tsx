'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ROCChartProps {
  data: Array<{
    time: string
    roc: number
    signal?: number
  }>
}

export default function ROCChart({ data }: ROCChartProps) {
  const getROCStatus = (value: number) => {
    if (value > 10) return { status: '강한 상승', color: 'text-green-500' }
    if (value > 5) return { status: '상승', color: 'text-green-400' }
    if (value > 0) return { status: '약한 상승', color: 'text-blue-400' }
    if (value > -5) return { status: '약한 하락', color: 'text-yellow-400' }
    if (value > -10) return { status: '하락', color: 'text-orange-400' }
    return { status: '강한 하락', color: 'text-red-500' }
  }

  const currentROC = data && data.length > 0 ? data[data.length - 1]?.roc || 0 : 0
  const rocStatus = getROCStatus(currentROC)
  
  // 동적 Y축 범위 계산 - 데이터에 딱 맞게 (여백 최소화)
  const minROC = data && data.length > 0 
    ? Math.min(...data.map(d => d.roc).filter(v => v !== undefined && !isNaN(v)))
    : -10
  const maxROC = data && data.length > 0 
    ? Math.max(...data.map(d => d.roc).filter(v => v !== undefined && !isNaN(v)))
    : 10
  
  // Y축 범위 - 최소 여백만 추가 (상하 가득 차게)
  const yPadding = Math.abs(maxROC - minROC) * 0.05 // 5% 여백만
  const yMin = minROC - yPadding
  const yMax = maxROC + yPadding
  
  // 틱 계산 (7개 정도로 더 촘촘하게)
  const tickCount = 7
  const tickInterval = (yMax - yMin) / (tickCount - 1)
  const ticks = []
  for (let i = 0; i < tickCount; i++) {
    ticks.push(yMin + (tickInterval * i))
  }

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📉 ROC (변화율)
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorROC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00FFFF" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
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
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#999' }}
            formatter={(value: number) => `${value.toFixed(2)}%`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />
          
          {/* 기준선 */}
          <ReferenceLine y={0} stroke="#666" strokeWidth={2} />
          {yMax > 10 && <ReferenceLine y={10} stroke="#10b981" strokeDasharray="5 5" />}
          {yMin < -10 && <ReferenceLine y={-10} stroke="#ef4444" strokeDasharray="5 5" />}
          
          {/* ROC */}
          <Area 
            type="monotone" 
            dataKey="roc" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            fill="url(#colorROC)"
            name="ROC"
          />
          
          {/* Signal Line */}
          {data && data.length > 0 && data[0]?.signal !== undefined && (
            <Area 
              type="monotone" 
              dataKey="signal" 
              stroke="#00FFFF" 
              strokeWidth={2}
              fill="url(#colorSignal)"
              name="Signal"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">현재 ROC</div>
          <div className={`text-2xl font-bold ${rocStatus.color}`}>
            {currentROC.toFixed(2)}%
          </div>
          <div className={`text-xs ${rocStatus.color} mt-1`}>
            {rocStatus.status}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">모멘텀 강도</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  currentROC > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(Math.abs(currentROC) * 5, 100)}%` 
                }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {Math.abs(currentROC).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 bg-purple-900/20 border border-purple-500/30 rounded p-3">
        <div className="text-sm text-purple-400 mb-1">ROC 활용법</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• ROC {'>'} 0: 상승 추세 (현재가 {'>'} 과거가)</div>
          <div>• ROC {'<'} 0: 하락 추세 (현재가 {'<'} 과거가)</div>
          <div>• ±10% 이상: 강한 모멘텀</div>
          <div>• 0선 상향 돌파: 매수 신호</div>
          <div>• 0선 하향 돌파: 매도 신호</div>
          <div>• 다이버전스: 추세 전환 가능성</div>
        </div>
      </div>
    </div>
  )
}