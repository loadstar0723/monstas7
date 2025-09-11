'use client'

import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Dot, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { monochromeTheme, chartConfig } from '@/lib/monochromeTheme'

interface ChartData {
  time: string
  price: number
  adx?: number
  plusDI?: number
  minusDI?: number
  sar?: number
  aroonUp?: number
  aroonDown?: number
  aroonOscillator?: number
  trendStrength?: number
  trendDirection?: 'up' | 'down' | 'neutral'
  ichimokuCloud?: {
    tenkan: number
    kijun: number
    senkou_a: number
    senkou_b: number
    chikou: number
  }
  vortex?: {
    positive: number
    negative: number
  }
}

interface TrendChartProps {
  data: ChartData[]
  height?: number
  analysis?: any
}

// ADX 추세 강도 차트
export const ADXTrendStrength: React.FC<TrendChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="adxGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            domain={[0, 100]}
          />
          <Tooltip {...chartConfig.tooltip} />
          <Legend {...chartConfig.legend} />
          
          <Area
            type="monotone"
            dataKey="adx"
            stroke={monochromeTheme.chart.line.primary}
            fill="url(#adxGradient)"
            strokeWidth={2}
            name="ADX"
            animationDuration={600}
            animationBegin={0}
            dot={{ r: 2, strokeWidth: 1 }}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="plusDI" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1}
            dot={{ r: 1, strokeWidth: 0.5 }}
            activeDot={{ r: 3, strokeWidth: 2 }}
            strokeDasharray="5 5"
            name="+DI"
            animationDuration={400}
            animationBegin={100}
          />
          
          <Line 
            type="monotone" 
            dataKey="minusDI" 
            stroke={monochromeTheme.chart.line.tertiary}
            strokeWidth={1}
            dot={{ r: 1, strokeWidth: 0.5 }}
            activeDot={{ r: 3, strokeWidth: 2 }}
            strokeDasharray="3 3"
            name="-DI"
            animationDuration={400}
            animationBegin={200}
          />
          
          <ReferenceLine 
            y={25} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
            label={{ value: "Weak", fill: monochromeTheme.text.muted, fontSize: 10 }}
          />
          
          <ReferenceLine 
            y={50} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
            label={{ value: "Strong", fill: monochromeTheme.text.muted, fontSize: 10 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">추세 강도</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.strength || '약함'}
          </div>
          <div className="text-gray-500 text-xs">
            방향: {analysis.direction || '중립'}
          </div>
        </div>
      )}
    </div>
  )
}

// Parabolic SAR 추적 차트
export const ParabolicSARTrail: React.FC<TrendChartProps> = ({ 
  data, 
  height = 350,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={chartConfig.margin}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
          />
          
          <Line 
            type="monotone" 
            dataKey="sar" 
            stroke="transparent"
            dot={(props: any) => {
              const { cx, cy, payload } = props
              const isAbove = payload.sar > payload.price
              return (
                <Dot
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={isAbove ? monochromeTheme.signal.sell.primary : monochromeTheme.signal.buy.primary}
                  fillOpacity={isAbove ? 0.5 : 0.8}
                />
              )
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">SAR 시그널</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.signal || '홀드'}
          </div>
          <div className="text-gray-500 text-xs">
            추세: {analysis.trend || '상승'}
          </div>
        </div>
      )}
    </div>
  )
}

// Aroon 오실레이터 차트
export const AroonOscillatorChart: React.FC<TrendChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="aroonUpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="aroonDownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.secondary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={monochromeTheme.chart.line.secondary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="aroon"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="oscillator"
            orientation="right"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            domain={[-100, 100]}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Area
            yAxisId="aroon"
            type="monotone"
            dataKey="aroonUp"
            stroke={monochromeTheme.chart.line.primary}
            fill="url(#aroonUpGradient)"
            strokeWidth={1.5}
          />
          
          <Area
            yAxisId="aroon"
            type="monotone"
            dataKey="aroonDown"
            stroke={monochromeTheme.chart.line.secondary}
            fill="url(#aroonDownGradient)"
            strokeWidth={1}
            strokeDasharray="5 5"
          />
          
          <Bar 
            yAxisId="oscillator"
            dataKey="aroonOscillator" 
            fill={monochromeTheme.chart.volume.neutral}
            opacity={0.3}
          />
          
          <ReferenceLine 
            yAxisId="oscillator"
            y={0} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">Aroon 분석</div>
          <div className="text-gray-400 text-xs mt-1">
            추세: {analysis.trend || '상승 시작'}
          </div>
        </div>
      )}
    </div>
  )
}

// 이치모쿠 클라우드 차트
export const IchimokuCloudChart: React.FC<TrendChartProps> = ({ 
  data, 
  height = 400,
  analysis 
}) => {
  const ichimokuData = data.map(d => ({
    ...d,
    tenkan: d.ichimokuCloud?.tenkan || d.price,
    kijun: d.ichimokuCloud?.kijun || d.price * 0.98,
    senkou_a: d.ichimokuCloud?.senkou_a || d.price * 1.01,
    senkou_b: d.ichimokuCloud?.senkou_b || d.price * 0.99,
    chikou: d.ichimokuCloud?.chikou || d.price
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={ichimokuData} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="cloudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.2}/>
              <stop offset="50%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Area
            type="monotone"
            dataKey="senkou_a"
            stroke="transparent"
            fill="url(#cloudGradient)"
          />
          
          <Area
            type="monotone"
            dataKey="senkou_b"
            stroke="transparent"
            fill={monochromeTheme.background.primary}
          />
          
          <Line 
            type="monotone" 
            dataKey="tenkan" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={1.5}
            dot={false}
            name="Tenkan-sen"
          />
          
          <Line 
            type="monotone" 
            dataKey="kijun" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1}
            dot={false}
            name="Kijun-sen"
          />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.tertiary}
            strokeWidth={2}
            dot={false}
            name="Price"
          />
          
          <Line 
            type="monotone" 
            dataKey="chikou" 
            stroke={monochromeTheme.chart.line.quaternary}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="Chikou Span"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm rounded p-3">
          <div className="text-white text-sm font-bold mb-1">이치모쿠 시그널</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>클라우드: {analysis.cloudPosition || '위'}</div>
            <div>TK크로스: {analysis.tkCross || '없음'}</div>
            <div>추세: {analysis.trend || '강세'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Vortex 지표 차트
export const VortexIndicatorChart: React.FC<TrendChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  const vortexData = data.map(d => ({
    ...d,
    vortexPositive: d.vortex?.positive || 1.1,
    vortexNegative: d.vortex?.negative || 0.9
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={vortexData} margin={chartConfig.margin}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            domain={[0.8, 1.2]}
          />
          <Tooltip {...chartConfig.tooltip} />
          <Legend {...chartConfig.legend} />
          
          <Line 
            type="monotone" 
            dataKey="vortexPositive" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
            name="VI+"
          />
          
          <Line 
            type="monotone" 
            dataKey="vortexNegative" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={false}
            name="VI-"
          />
          
          <ReferenceLine 
            y={1} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">Vortex 시그널</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.signal || '중립'}
          </div>
        </div>
      )}
    </div>
  )
}

// 추세 레이더 차트
export const TrendRadarChart: React.FC<{ indicators: any }> = ({ indicators }) => {
  const radarData = [
    { indicator: 'ADX', value: indicators?.adx || 45, fullMark: 100 },
    { indicator: 'Aroon', value: indicators?.aroon || 60, fullMark: 100 },
    { indicator: 'SAR', value: indicators?.sar || 70, fullMark: 100 },
    { indicator: 'Ichimoku', value: indicators?.ichimoku || 55, fullMark: 100 },
    { indicator: 'Vortex', value: indicators?.vortex || 65, fullMark: 100 },
    { indicator: 'DI', value: indicators?.di || 50, fullMark: 100 }
  ]

  return (
    <div className="bg-black/50 rounded-lg p-4">
      <div className="text-white text-sm font-bold mb-2">추세 지표 종합</div>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={radarData}>
          <PolarGrid stroke={monochromeTheme.border.primary} />
          <PolarAngleAxis 
            dataKey="indicator" 
            tick={{ fill: monochromeTheme.text.secondary, fontSize: 10 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: monochromeTheme.text.muted, fontSize: 9 }}
          />
          <Radar 
            name="Trend" 
            dataKey="value" 
            stroke={monochromeTheme.chart.line.primary}
            fill={monochromeTheme.chart.line.primary}
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// 추세 방향 표시기
export const TrendDirectionIndicator: React.FC<{ direction: 'up' | 'down' | 'neutral', strength: number }> = ({ 
  direction, 
  strength 
}) => {
  const directionIcon = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'
  const directionText = direction === 'up' ? '상승' : direction === 'down' ? '하락' : '횡보'
  const opacity = Math.min(strength / 100, 1)

  return (
    <div className="bg-black/50 rounded-lg p-4">
      <div className="text-white text-sm font-bold mb-2">추세 방향</div>
      <div className="flex items-center justify-center">
        <div 
          className="text-6xl font-bold"
          style={{ 
            color: `rgba(255, 255, 255, ${opacity})`,
            textShadow: `0 0 ${strength / 5}px rgba(255, 255, 255, ${opacity * 0.5})`
          }}
        >
          {directionIcon}
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="text-white text-lg">{directionText}</div>
        <div className="text-gray-400 text-xs">강도: {strength}%</div>
      </div>
    </div>
  )
}

export default {
  ADXTrendStrength,
  ParabolicSARTrail,
  AroonOscillatorChart,
  IchimokuCloudChart,
  VortexIndicatorChart,
  TrendRadarChart,
  TrendDirectionIndicator
}