'use client'

import React, { useMemo, useState, useEffect } from 'react'
import {
  LineChart, Line, Area, AreaChart, Bar, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
  ComposedChart, Scatter, ScatterChart, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis,
  Treemap, Sankey, Funnel, FunnelChart
} from 'recharts'

interface IndicatorData {
  time: number
  value: number
  signal?: number
  histogram?: number
  upper?: number
  lower?: number
  middle?: number
}

interface ChartProps {
  data: IndicatorData[]
  height?: number
  thresholds?: any
  historical?: boolean
}

// RSI 다이버전스 차트
export const RSIDivergenceChart: React.FC<ChartProps> = ({ 
  data, 
  height = 350,
  thresholds
}) => {
  const [divergences, setDivergences] = useState<any[]>([])

  useEffect(() => {
    // 다이버전스 감지 로직
    const detectDivergences = () => {
      if (!data || data.length < 20) return []
      
      const divs = []
      for (let i = 10; i < data.length - 10; i++) {
        const priceTrend = data[i].value > data[i-10].value
        const rsiTrend = data[i].signal! > data[i-10].signal!
        
        if (priceTrend && !rsiTrend) {
          divs.push({ index: i, type: 'bearish', strength: Math.abs(data[i].value - data[i-10].value) })
        } else if (!priceTrend && rsiTrend) {
          divs.push({ index: i, type: 'bullish', strength: Math.abs(data[i].value - data[i-10].value) })
        }
      }
      return divs
    }
    
    setDivergences(detectDivergences())
  }, [data])

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d, index) => {
      const divergence = divergences.find(div => div.index === index)
      return {
        time: new Date(d.time).toLocaleTimeString(),
        rsi: d.value,
        price: d.signal,
        divergence: divergence ? d.value : null,
        divergenceType: divergence?.type
      }
    })
  }, [data, divergences])

  return (
    <div className="w-full p-4 bg-gradient-to-br from-purple-900/20 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">RSI 다이버전스 분석</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="rsi" domain={[0, 100]} stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="price" orientation="right" stroke="#666" tick={{ fontSize: 10 }} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
              border: '1px solid #a855f7',
              backdropFilter: 'blur(10px)'
            }}
            labelStyle={{ color: '#fff' }}
          />
          
          {/* RSI 과매수/과매도 구간 */}
          <ReferenceArea 
            yAxisId="rsi"
            y1={thresholds?.rsi?.overbought || 70} 
            y2={100} 
            fill="#ef4444" 
            fillOpacity={0.1} 
          />
          <ReferenceArea 
            yAxisId="rsi"
            y1={0} 
            y2={thresholds?.rsi?.oversold || 30} 
            fill="#22c55e" 
            fillOpacity={0.1} 
          />
          
          {/* RSI 영역 차트 */}
          <Area
            yAxisId="rsi"
            type="monotone"
            dataKey="rsi"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#rsiGradient)"
            filter="url(#glow)"
          />
          
          {/* 가격 라인 */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#60a5fa"
            strokeWidth={1}
            strokeOpacity={0.5}
            dot={false}
          />
          
          {/* 다이버전스 포인트 */}
          <Scatter
            yAxisId="rsi"
            dataKey="divergence"
            fill={(entry: any) => entry.divergenceType === 'bullish' ? '#22c55e' : '#ef4444'}
            shape="diamond"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* 다이버전스 알림 */}
      {divergences.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-green-900/20 border border-green-500/30 p-2 rounded">
            <div className="text-xs text-green-400">강세 다이버전스</div>
            <div className="text-lg text-white font-bold">
              {divergences.filter(d => d.type === 'bullish').length}
            </div>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 p-2 rounded">
            <div className="text-xs text-red-400">약세 다이버전스</div>
            <div className="text-lg text-white font-bold">
              {divergences.filter(d => d.type === 'bearish').length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// MACD 히스토그램 3D 효과
export const MACD3DHistogram: React.FC<ChartProps> = ({ 
  data, 
  height = 350
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d) => ({
      time: new Date(d.time).toLocaleTimeString(),
      macd: d.value,
      signal: d.signal,
      histogram: d.histogram,
      histogramColor: (d.histogram || 0) > 0 ? '#22c55e' : '#ef4444',
      histogramOpacity: Math.abs(d.histogram || 0) / 100
    }))
  }, [data])

  return (
    <div className="w-full p-4 bg-gradient-to-br from-blue-900/20 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">MACD 3D 히스토그램</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="macdGradientPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="macdGradientNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
            </linearGradient>
            <filter id="shadow3d">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis stroke="#666" tick={{ fontSize: 10 }} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
              border: '1px solid #60a5fa',
              backdropFilter: 'blur(10px)'
            }}
            labelStyle={{ color: '#fff' }}
          />
          
          {/* 히스토그램 3D 효과 */}
          <Bar
            dataKey="histogram"
            fill={(entry: any) => entry.histogramColor}
            fillOpacity={(entry: any) => entry.histogramOpacity}
            filter="url(#shadow3d)"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.histogramColor}
              />
            ))}
          </Bar>
          
          {/* MACD 라인 */}
          <Line
            type="monotone"
            dataKey="macd"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            filter="url(#glow)"
          />
          
          {/* 시그널 라인 */}
          <Line
            type="monotone"
            dataKey="signal"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          
          {/* 제로 라인 */}
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* MACD 크로스오버 신호 */}
      <div className="mt-4 flex justify-between items-center p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded">
        <div className="text-xs text-gray-400">최근 크로스오버</div>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
            골든크로스
          </span>
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
            데드크로스
          </span>
        </div>
      </div>
    </div>
  )
}

// 볼린저밴드 스퀴즈 인디케이터
export const BollingerSqueezePro: React.FC<ChartProps> = ({ 
  data, 
  height = 350
}) => {
  const [squeezeState, setSqueezeState] = useState<'tight' | 'normal' | 'wide'>('normal')

  useEffect(() => {
    if (data && data.length > 0) {
      const lastData = data[data.length - 1]
      const bandwidth = (lastData.upper! - lastData.lower!) / lastData.middle!
      
      if (bandwidth < 0.05) setSqueezeState('tight')
      else if (bandwidth > 0.15) setSqueezeState('wide')
      else setSqueezeState('normal')
    }
  }, [data])

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d) => ({
      time: new Date(d.time).toLocaleTimeString(),
      price: d.value,
      upper: d.upper,
      middle: d.middle,
      lower: d.lower,
      bandwidth: ((d.upper! - d.lower!) / d.middle!) * 100
    }))
  }, [data])

  return (
    <div className="w-full p-4 bg-gradient-to-br from-cyan-900/20 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">볼린저밴드 스퀴즈 프로</h3>
      
      {/* 스퀴즈 상태 인디케이터 */}
      <div className="mb-4 flex justify-center">
        <div className={`px-4 py-2 rounded-full text-sm font-bold ${
          squeezeState === 'tight' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' :
          squeezeState === 'wide' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {squeezeState === 'tight' ? '🔥 스퀴즈 발생!' :
           squeezeState === 'wide' ? '🌊 밴드 확장' :
           '⚖️ 정상 상태'}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3}/>
            </linearGradient>
            <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M0,4 l4,-4 M0,0 l4,4" stroke="#06b6d4" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="price" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="bandwidth" orientation="right" stroke="#666" tick={{ fontSize: 10 }} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
              border: '1px solid #06b6d4',
              backdropFilter: 'blur(10px)'
            }}
            labelStyle={{ color: '#fff' }}
          />
          
          {/* 볼린저밴드 영역 */}
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="upper"
            stackId="1"
            stroke="transparent"
            fill="transparent"
          />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="lower"
            stackId="2"
            stroke="transparent"
            fill="url(#bbGradient)"
          />
          
          {/* 밴드 라인 */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="upper"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="middle"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="lower"
            stroke="#22c55e"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
          />
          
          {/* 가격 라인 */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
            filter="url(#glow)"
          />
          
          {/* 밴드폭 막대 */}
          <Bar
            yAxisId="bandwidth"
            dataKey="bandwidth"
            fill="#06b6d4"
            fillOpacity={0.3}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* 밴드폭 히스토리 */}
      <div className="mt-4">
        <div className="text-xs text-gray-400 mb-2">밴드폭 변화</div>
        <div className="h-8 bg-gray-800 rounded overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 via-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (chartData[chartData.length - 1]?.bandwidth || 0) * 5)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// 스토캐스틱 히트맵
export const StochasticHeatmap: React.FC<ChartProps> = ({ 
  data, 
  height = 300
}) => {
  const heatmapData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // 시간대별로 그룹화
    const grouped: any = {}
    data.forEach((d) => {
      const hour = new Date(d.time).getHours()
      if (!grouped[hour]) grouped[hour] = []
      grouped[hour].push(d.value)
    })
    
    return Object.keys(grouped).map(hour => ({
      hour: `${hour}시`,
      avgValue: grouped[hour].reduce((a: number, b: number) => a + b, 0) / grouped[hour].length,
      count: grouped[hour].length
    }))
  }, [data])

  return (
    <div className="w-full p-4 bg-gradient-to-br from-indigo-900/20 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">스토캐스틱 시간대별 히트맵</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={heatmapData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
          <XAxis dataKey="hour" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis stroke="#666" tick={{ fontSize: 10 }} domain={[0, 100]} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
              border: '1px solid #6366f1',
              backdropFilter: 'blur(10px)'
            }}
            labelStyle={{ color: '#fff' }}
          />
          
          <Bar dataKey="avgValue" radius={[4, 4, 0, 0]}>
            {heatmapData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.avgValue > 80 ? '#ef4444' :
                  entry.avgValue > 60 ? '#f59e0b' :
                  entry.avgValue > 40 ? '#fbbf24' :
                  entry.avgValue > 20 ? '#84cc16' :
                  '#22c55e'
                }
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* 히트맵 범례 */}
      <div className="mt-4 flex justify-between text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-400">과매도</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded" />
          <span className="text-gray-400">중립</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-gray-400">과매수</span>
        </div>
      </div>
    </div>
  )
}

// ATR 변동성 레이더
export const ATRVolatilityRadar: React.FC<ChartProps> = ({ 
  data, 
  height = 350
}) => {
  const radarData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // 최근 24개 데이터를 6개 구간으로 나누기
    const recentData = data.slice(-24)
    const segments = []
    
    for (let i = 0; i < 6; i++) {
      const segmentData = recentData.slice(i * 4, (i + 1) * 4)
      const avgATR = segmentData.reduce((sum, d) => sum + d.value, 0) / segmentData.length
      
      segments.push({
        period: `T${i + 1}`,
        volatility: avgATR,
        normalized: Math.min(100, avgATR * 10) // 정규화
      })
    }
    
    return segments
  }, [data])

  return (
    <div className="w-full p-4 bg-gradient-to-br from-rose-900/20 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">ATR 변동성 레이더</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="20%" 
          outerRadius="90%" 
          data={radarData}
          startAngle={90}
          endAngle={-270}
        >
          <defs>
            <linearGradient id="atrGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#ec4899" stopOpacity={0.6}/>
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          
          <PolarAngleAxis 
            type="number" 
            domain={[0, 100]} 
            angleAxisId={0} 
            tick={false}
          />
          
          <RadialBar
            dataKey="normalized"
            cornerRadius={10}
            fill="url(#atrGradient)"
            background={{ fill: '#1a1a1a' }}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
              border: '1px solid #f43f5e',
              backdropFilter: 'blur(10px)'
            }}
            labelStyle={{ color: '#fff' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* 변동성 레벨 표시 */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-900/20 p-2 rounded">
          <div className="text-xs text-green-400">낮음</div>
          <div className="text-lg font-bold text-white">
            {radarData.filter(d => d.normalized < 33).length}
          </div>
        </div>
        <div className="bg-yellow-900/20 p-2 rounded">
          <div className="text-xs text-yellow-400">중간</div>
          <div className="text-lg font-bold text-white">
            {radarData.filter(d => d.normalized >= 33 && d.normalized < 66).length}
          </div>
        </div>
        <div className="bg-red-900/20 p-2 rounded">
          <div className="text-xs text-red-400">높음</div>
          <div className="text-lg font-bold text-white">
            {radarData.filter(d => d.normalized >= 66).length}
          </div>
        </div>
      </div>
    </div>
  )
}

// 종합 지표 대시보드
export const ComprehensiveIndicatorDashboard: React.FC<{
  rsi: number
  macd: { line: number, signal: number, histogram: number }
  stochastic: { k: number, d: number }
  bollinger: { upper: number, middle: number, lower: number, bandwidth: number }
  volume: number
}> = ({ rsi, macd, stochastic, bollinger, volume }) => {
  const indicators = [
    { name: 'RSI', value: rsi, color: rsi > 70 ? '#ef4444' : rsi < 30 ? '#22c55e' : '#fbbf24' },
    { name: 'MACD', value: macd.histogram, color: macd.histogram > 0 ? '#22c55e' : '#ef4444' },
    { name: 'Stoch K', value: stochastic.k, color: stochastic.k > 80 ? '#ef4444' : stochastic.k < 20 ? '#22c55e' : '#fbbf24' },
    { name: 'BB Width', value: bollinger.bandwidth * 100, color: '#60a5fa' },
    { name: 'Volume', value: volume / 1000000, color: '#a855f7' }
  ]

  return (
    <div className="w-full p-4 bg-gradient-to-br from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">종합 지표 대시보드</h3>
      
      <div className="grid grid-cols-5 gap-2">
        {indicators.map((indicator, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-400 mb-1">{indicator.name}</div>
            <div 
              className="text-lg font-bold"
              style={{ color: indicator.color }}
            >
              {indicator.value.toFixed(2)}
            </div>
            <div className="mt-2 h-1 bg-gray-800 rounded overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, Math.abs(indicator.value))}%`,
                  backgroundColor: indicator.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* 종합 신호 */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">종합 신호</span>
          <span className={`text-sm font-bold ${
            (rsi < 30 && macd.histogram > 0) ? 'text-green-400' :
            (rsi > 70 && macd.histogram < 0) ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {(rsi < 30 && macd.histogram > 0) ? '강력 매수' :
             (rsi > 70 && macd.histogram < 0) ? '강력 매도' :
             '중립/대기'}
          </span>
        </div>
      </div>
    </div>
  )
}