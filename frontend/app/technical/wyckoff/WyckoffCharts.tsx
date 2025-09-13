'use client'

import { useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, PieChart, Pie, Cell, RadialBarChart, RadialBar, ReferenceLine
} from 'recharts'
import { 
  OHLCVData, VolumeProfile, WyckoffMarker, WyckoffIndicators,
  WyckoffEvent, WyckoffPhase
} from './WyckoffTypes'

// 색상 팔레트
const COLORS = {
  accumulation: '#10b981',  // 녹색
  markup: '#3b82f6',       // 파란색
  distribution: '#f59e0b',  // 노란색
  markdown: '#ef4444',     // 빨간색
  volume: '#8b5cf6',       // 보라색
  buy: '#10b981',
  sell: '#ef4444',
  neutral: '#6b7280'
}

// 사이클 색상
const PHASE_COLORS = {
  [WyckoffPhase.Accumulation]: COLORS.accumulation,
  [WyckoffPhase.Markup]: COLORS.markup,
  [WyckoffPhase.Distribution]: COLORS.distribution,
  [WyckoffPhase.Markdown]: COLORS.markdown,
  [WyckoffPhase.Unknown]: COLORS.neutral
}

// 캔들스틱 차트 컴포넌트 (단순화된 버전)
export function WyckoffCandlestickChart({
  data,
  events,
  supportLevels,
  resistanceLevels,
  currentPhase
}: {
  data: OHLCVData[]
  events: WyckoffMarker[]
  supportLevels: number[]
  resistanceLevels: number[]
  currentPhase: WyckoffPhase
}) {
  const chartData = useMemo(() => {
    return data.slice(-100).map(d => ({
      time: d.time,
      close: d.close,
      high: d.high,
      low: d.low,
      volume: d.volume
    }))
  }, [data])

  return (
    <div className="w-full">
      {/* 가격 차트 */}
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin', 'dataMax']}
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                      <p className="text-gray-400 text-sm">{data.time}</p>
                      <p className="text-white text-sm">Close: ${data.close?.toFixed(2) || '0.00'}</p>
                      <p className="text-white text-sm">High: ${data.high?.toFixed(2) || '0.00'}</p>
                      <p className="text-white text-sm">Low: ${data.low?.toFixed(2) || '0.00'}</p>
                      <p className="text-gray-400 text-sm">Volume: {data.volume?.toFixed(0) || '0'}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            
            {/* 가격 라인 */}
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke={COLORS.buy}
              strokeWidth={2}
              dot={false}
            />
            
            {/* 지지/저항선 */}
            {supportLevels.map((level, i) => (
              <ReferenceLine
                key={`support-${i}`}
                y={level}
                stroke={COLORS.buy}
                strokeDasharray="5 5"
                strokeWidth={1}
                opacity={0.6}
              />
            ))}
            {resistanceLevels.map((level, i) => (
              <ReferenceLine
                key={`resistance-${i}`}
                y={level}
                stroke={COLORS.sell}
                strokeDasharray="5 5"
                strokeWidth={1}
                opacity={0.6}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* 볼륨 차트 */}
      <div className="h-[100px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <Bar 
              dataKey="volume" 
              fill={COLORS.volume}
              opacity={0.6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 볼륨 프로파일 차트
export function VolumeProfileChart({ 
  data,
  currentPrice 
}: { 
  data: VolumeProfile[]
  currentPrice: number 
}) {
  const maxVolume = Math.max(...data.map(d => d.volume))
  
  const chartData = useMemo(() => {
    return data.map(d => ({
      price: d.price,
      volume: d.volume,
      buyVolume: d.buyVolume,
      sellVolume: d.sellVolume,
      volumePercent: (d.volume / maxVolume) * 100,
      isPOC: d.isPOC,
      isVAH: d.isVAH,
      isVAL: d.isVAL
    }))
  }, [data, maxVolume])

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="price" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload
                return (
                  <div className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <p className="text-white text-sm">가격: ${data.price}</p>
                    <p className="text-white text-sm">볼륨: {data.volumePercent.toFixed(2)}%</p>
                    {data.isPOC && <p className="text-yellow-500 text-sm font-bold">POC (Point of Control)</p>}
                    {data.isVAH && <p className="text-green-500 text-sm">VAH (Value Area High)</p>}
                    {data.isVAL && <p className="text-red-500 text-sm">VAL (Value Area Low)</p>}
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="volumePercent" fill={COLORS.volume} />
          
          {/* POC 마커는 Tooltip으로 표시 */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 와이코프 사이클 다이어그램
export function WyckoffCycleDiagram({ 
  currentPhase,
  phaseProgress 
}: { 
  currentPhase: WyckoffPhase
  phaseProgress: number 
}) {
  const cycleData = [
    { phase: 'Accumulation', value: 25, fill: COLORS.accumulation },
    { phase: 'Markup', value: 25, fill: COLORS.markup },
    { phase: 'Distribution', value: 25, fill: COLORS.distribution },
    { phase: 'Markdown', value: 25, fill: COLORS.markdown }
  ]

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={cycleData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={1000}
          >
            {cycleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      
      {/* 현재 단계 표시 */}
      <div className="text-center mt-4">
        <p className="text-gray-400 text-sm">현재 단계</p>
        <p 
          className="text-2xl font-bold mt-1"
          style={{ color: PHASE_COLORS[currentPhase] }}
        >
          {currentPhase.toUpperCase()}
        </p>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${phaseProgress}%`,
              backgroundColor: PHASE_COLORS[currentPhase]
            }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-1">{phaseProgress}% 진행</p>
      </div>
    </div>
  )
}

// Effort vs Result 차트
export function EffortVsResultChart({ 
  data 
}: { 
  data: OHLCVData[] 
}) {
  const chartData = useMemo(() => {
    return data.slice(-50).map((d, i) => {
      const priceChange = i > 0 ? 
        Math.abs((d.close - data[i - 1].close) / data[i - 1].close) * 100 : 0
      const volumeNormalized = d.volume / 1000000 // 백만 단위
      
      return {
        time: d.time,
        effort: volumeNormalized,
        result: priceChange,
        efficiency: volumeNormalized > 0 ? priceChange / volumeNormalized : 0
      }
    })
  }, [data])

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number" 
            dataKey="effort" 
            name="Effort (Volume)" 
            unit="M"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="result" 
            name="Result (Price Change)" 
            unit="%"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'Effort (Volume)') return [`${value.toFixed(2)}M`, name]
              if (name === 'Result (Price Change)') return [`${value.toFixed(2)}%`, name]
              return [value.toFixed(2), name]
            }}
          />
          <Scatter 
            name="Effort vs Result" 
            data={chartData} 
            fill={COLORS.markup}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

// 와이코프 지표 게이지
export function WyckoffIndicatorGauge({ 
  indicators 
}: { 
  indicators: WyckoffIndicators 
}) {
  const gaugeData = [
    {
      name: 'Composite Operator',
      value: indicators.compositeOperator,
      fill: indicators.compositeOperator > 0 ? COLORS.buy : COLORS.sell
    },
    {
      name: 'Volume Trend',
      value: indicators.volumeTrend,
      fill: indicators.volumeTrend > 0 ? COLORS.buy : COLORS.sell
    },
    {
      name: 'Price Strength',
      value: indicators.priceStrength,
      fill: indicators.priceStrength > 0 ? COLORS.buy : COLORS.sell
    },
    {
      name: 'Effort vs Result',
      value: indicators.effortVsResult,
      fill: indicators.effortVsResult > 0 ? COLORS.buy : COLORS.sell
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {gaugeData.map((indicator, index) => (
        <div key={index} className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-2">{indicator.name}</h4>
          <div className="relative h-32">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="90%" 
                startAngle={180} 
                endAngle={0}
                data={[indicator]}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={indicator.fill}
                  background={{ fill: '#374151' }}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold"
                  fill="#e5e7eb"
                >
                  {indicator.value.toFixed(0)}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
}

// 스마트머니 플로우 차트
export function SmartMoneyFlowChart({ 
  data 
}: { 
  data: OHLCVData[] 
}) {
  const flowData = useMemo(() => {
    let cumulativeFlow = 0
    return data.slice(-100).map(d => {
      const range = d.high - d.low
      const closePosition = range > 0 ? (d.close - d.low) / range : 0.5
      const flow = (closePosition - 0.5) * d.volume / 1000000
      cumulativeFlow += flow
      
      return {
        time: d.time,
        flow: flow,
        cumulativeFlow: cumulativeFlow,
        price: d.close
      }
    })
  }, [data])

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={flowData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="flow"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="price"
            orientation="right"
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Legend />
          
          <Bar 
            yAxisId="flow"
            dataKey="flow" 
            fill={COLORS.volume}
            name="Flow"
          />
          <Line 
            yAxisId="flow"
            type="monotone" 
            dataKey="cumulativeFlow" 
            stroke={COLORS.markup}
            strokeWidth={2}
            dot={false}
            name="Cumulative Flow"
          />
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke={COLORS.distribution}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="Price"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// 시장 단계별 성과 레이더 차트
export function MarketPhaseRadarChart({ 
  phaseAnalysis 
}: { 
  phaseAnalysis: any 
}) {
  const data = [
    {
      metric: 'Volume Strength',
      Accumulation: 65,
      Markup: 85,
      Distribution: 70,
      Markdown: 90
    },
    {
      metric: 'Price Action',
      Accumulation: 40,
      Markup: 90,
      Distribution: 50,
      Markdown: 20
    },
    {
      metric: 'Volatility',
      Accumulation: 30,
      Markup: 60,
      Distribution: 40,
      Markdown: 80
    },
    {
      metric: 'Smart Money',
      Accumulation: 90,
      Markup: 70,
      Distribution: 30,
      Markdown: 20
    },
    {
      metric: 'Retail Interest',
      Accumulation: 20,
      Markup: 60,
      Distribution: 90,
      Markdown: 40
    }
  ]

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="metric" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
          <Radar 
            name="Accumulation" 
            dataKey="Accumulation" 
            stroke={COLORS.accumulation}
            fill={COLORS.accumulation} 
            fillOpacity={0.3} 
          />
          <Radar 
            name="Markup" 
            dataKey="Markup" 
            stroke={COLORS.markup}
            fill={COLORS.markup} 
            fillOpacity={0.3} 
          />
          <Radar 
            name="Distribution" 
            dataKey="Distribution" 
            stroke={COLORS.distribution}
            fill={COLORS.distribution} 
            fillOpacity={0.3} 
          />
          <Radar 
            name="Markdown" 
            dataKey="Markdown" 
            stroke={COLORS.markdown}
            fill={COLORS.markdown} 
            fillOpacity={0.3} 
          />
          <Legend />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}