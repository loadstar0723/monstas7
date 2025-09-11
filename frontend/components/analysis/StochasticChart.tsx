'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

interface StochasticChartProps {
  data: Array<{
    time: string
    k: number
    d: number
    slowK?: number
    slowD?: number
  }>
}

export default function StochasticChart({ data }: StochasticChartProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📈 스토캐스틱 (Fast & Slow)
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]}
            stroke="#666"
            tick={{ fill: '#999', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #333',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#999' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />
          
          {/* 과매수/과매도 기준선 */}
          <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" />
          <ReferenceLine y={20} stroke="#10b981" strokeDasharray="5 5" />
          <ReferenceLine y={50} stroke="#666" strokeDasharray="2 2" />
          
          {/* Fast Stochastic */}
          <Line 
            type="monotone" 
            dataKey="k" 
            stroke="#00ffff" 
            strokeWidth={2}
            name="Fast %K"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="d" 
            stroke="#ff00ff" 
            strokeWidth={2}
            name="Fast %D"
            dot={false}
          />
          
          {/* Slow Stochastic */}
          {data && data.length > 0 && data[0]?.slowK !== undefined && (
            <>
              <Line 
                type="monotone" 
                dataKey="slowK" 
                stroke="#00ff00" 
                strokeWidth={2}
                name="Slow %K"
                dot={false}
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="slowD" 
                stroke="#ffff00" 
                strokeWidth={2}
                name="Slow %D"
                dot={false}
                strokeDasharray="5 5"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">Fast Stochastic</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• %K: {data && data.length > 0 ? data[data.length - 1]?.k?.toFixed(2) : 'N/A'}</div>
            <div>• %D: {data && data.length > 0 ? data[data.length - 1]?.d?.toFixed(2) : 'N/A'}</div>
            <div className={`font-bold ${
              (data && data.length > 0 ? data[data.length - 1]?.k || 0 : 0) > 80 ? 'text-red-400' :
              (data && data.length > 0 ? data[data.length - 1]?.k || 0 : 0) < 20 ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {(data && data.length > 0 ? data[data.length - 1]?.k || 0 : 0) > 80 ? '과매수' :
               (data && data.length > 0 ? data[data.length - 1]?.k || 0 : 0) < 20 ? '과매도' :
               '중립'}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded p-3">
          <div className="text-sm text-gray-400 mb-1">Slow Stochastic</div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• %K: {data && data.length > 0 ? data[data.length - 1]?.slowK?.toFixed(2) : 'N/A'}</div>
            <div>• %D: {data && data.length > 0 ? data[data.length - 1]?.slowD?.toFixed(2) : 'N/A'}</div>
            <div className={`font-bold ${
              (data && data.length > 0 ? data[data.length - 1]?.slowK || 0 : 0) > 80 ? 'text-red-400' :
              (data && data.length > 0 ? data[data.length - 1]?.slowK || 0 : 0) < 20 ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {(data && data.length > 0 ? data[data.length - 1]?.slowK || 0 : 0) > 80 ? '과매수' :
               (data && data.length > 0 ? data[data.length - 1]?.slowK || 0 : 0) < 20 ? '과매도' :
               '중립'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded p-3">
        <div className="text-sm text-blue-400 mb-1">스토캐스틱 활용법</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• 80 이상: 과매수 → 매도 신호</div>
          <div>• 20 이하: 과매도 → 매수 신호</div>
          <div>• %K가 %D를 상향 돌파: 매수 신호</div>
          <div>• %K가 %D를 하향 돌파: 매도 신호</div>
          <div>• Slow가 더 안정적, Fast가 더 민감</div>
        </div>
      </div>
    </div>
  )
}