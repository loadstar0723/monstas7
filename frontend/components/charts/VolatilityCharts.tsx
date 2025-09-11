'use client'

import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, RadialBarChart,
  RadialBar, PolarGrid, PolarAngleAxis, Scatter, ScatterChart
} from 'recharts'
import { monochromeTheme, chartConfig } from '@/lib/monochromeTheme'

interface ChartData {
  time: string
  price: number
  upperBand?: number
  middleBand?: number
  lowerBand?: number
  atr?: number
  keltnerUpper?: number
  keltnerMiddle?: number
  keltnerLower?: number
  volatility?: number
  squeeze?: boolean
  volume?: number
  vix?: number
  historicalVol?: number
  impliedVol?: number
}

interface VolatilityChartProps {
  data: ChartData[]
  height?: number
  analysis?: any
}

// 볼린저 밴드 스퀴즈 차트
export const BollingerSqueezeChart: React.FC<VolatilityChartProps> = ({ 
  data, 
  height = 350,
  analysis 
}) => {
  const squeezeData = data.map(d => ({
    ...d,
    squeeze: d.upperBand && d.lowerBand ? 
      ((d.upperBand - d.lowerBand) / d.middleBand! * 100) : 0,
    bandwidth: d.upperBand && d.lowerBand ? (d.upperBand - d.lowerBand) : 0
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={squeezeData} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.1}/>
              <stop offset="50%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.05}/>
              <stop offset="95%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="price"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="squeeze"
            orientation="right"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="upperBand"
            stroke="transparent"
            fill="url(#bandGradient)"
            animationDuration={600}
            animationBegin={0}
          />
          
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="lowerBand"
            stroke="transparent"
            fill={monochromeTheme.background.primary}
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="upperBand" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1}
            dot={{ r: 1, strokeWidth: 0.5 }}
            activeDot={{ r: 2, strokeWidth: 1 }}
            strokeDasharray="5 5"
            animationDuration={400}
            animationBegin={0}
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="middleBand" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={1.5}
            dot={{ r: 1.5, strokeWidth: 1 }}
            activeDot={{ r: 3, strokeWidth: 2 }}
            animationDuration={500}
            animationBegin={100}
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="lowerBand" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1}
            dot={{ r: 1, strokeWidth: 0.5 }}
            activeDot={{ r: 2, strokeWidth: 1 }}
            strokeDasharray="5 5"
            animationDuration={400}
            animationBegin={200}
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.tertiary}
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 1 }}
            activeDot={{ r: 4, strokeWidth: 2, fill: monochromeTheme.chart.line.tertiary }}
            animationDuration={300}
            animationBegin={0}
          />
          
          <Bar 
            yAxisId="squeeze"
            dataKey="squeeze" 
            fill={monochromeTheme.chart.volume.neutral}
            opacity={0.5}
            animationDuration={500}
            animationBegin={0}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">볼린저 스퀴즈</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.squeezeStatus || '정상'}
          </div>
          <div className="text-gray-500 text-xs">
            밴드폭: {analysis.bandwidth || '보통'}
          </div>
        </div>
      )}
    </div>
  )
}

// 켈트너 채널 클라우드 차트
export const KeltnerChannelCloud: React.FC<VolatilityChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="keltnerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.15}/>
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
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Area
            type="monotone"
            dataKey="keltnerUpper"
            stroke={monochromeTheme.chart.line.secondary}
            fill="url(#keltnerGradient)"
            strokeWidth={1}
            animationDuration={600}
            animationBegin={0}
          />
          
          <Area
            type="monotone"
            dataKey="keltnerLower"
            stroke={monochromeTheme.chart.line.secondary}
            fill={monochromeTheme.background.primary}
            strokeWidth={1}
            animationDuration={600}
            animationBegin={100}
          />
          
          <Line 
            type="monotone" 
            dataKey="keltnerMiddle" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
          />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.tertiary}
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="3 3"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2 max-w-[200px]">
          <div className="text-gray-400 text-xs">
            채널 위치: {analysis.channelPosition || '중간'}
          </div>
        </div>
      )}
    </div>
  )
}

// ATR 변동성 히트맵
export const ATRVolatilityHeatmap: React.FC<VolatilityChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  const atrData = data.map(d => ({
    ...d,
    atrLevel: d.atr ? (
      d.atr < 10 ? 'low' :
      d.atr < 20 ? 'medium' :
      d.atr < 30 ? 'high' : 'extreme'
    ) : 'low',
    atrColor: d.atr ? `rgba(255, 255, 255, ${Math.min(d.atr / 40, 1) * 0.8})` : 'rgba(255, 255, 255, 0.1)'
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={atrData} margin={chartConfig.margin}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="atr"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="price"
            orientation="right"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Bar yAxisId="atr" dataKey="atr">
            {atrData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.atrColor} />
            ))}
          </Bar>
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
          />
          
          <ReferenceLine 
            yAxisId="atr"
            y={20} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
            label={{ value: "High Vol", fill: monochromeTheme.text.muted, fontSize: 10 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm rounded p-3">
          <div className="text-white text-sm font-bold mb-1">ATR 분석</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>현재: {analysis.currentATR || '보통'}</div>
            <div>추세: {analysis.trend || '안정'}</div>
            <div>리스크: {analysis.risk || '중간'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// 역사적 변동성 vs 내재 변동성
export const HistoricalVsImpliedVolatility: React.FC<VolatilityChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="hvGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="ivGradient" x1="0" y1="0" x2="0" y2="1">
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
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            domain={[0, 100]}
          />
          <Tooltip {...chartConfig.tooltip} />
          <Legend {...chartConfig.legend} />
          
          <Area
            type="monotone"
            dataKey="historicalVol"
            stroke={monochromeTheme.chart.line.primary}
            fill="url(#hvGradient)"
            strokeWidth={2}
            name="Historical Vol"
          />
          
          <Area
            type="monotone"
            dataKey="impliedVol"
            stroke={monochromeTheme.chart.line.secondary}
            fill="url(#ivGradient)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            name="Implied Vol"
          />
          
          <ReferenceLine 
            y={30} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">Vol 스프레드</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.spread > 0 ? '프리미엄' : '디스카운트'}: {Math.abs(analysis.spread || 0)}%
          </div>
        </div>
      )}
    </div>
  )
}

// 변동성 콘 차트
export const VolatilityCone: React.FC<VolatilityChartProps> = ({ 
  data, 
  height = 350,
  analysis 
}) => {
  const coneData = data.map((d, idx) => ({
    ...d,
    percentile90: 35 + idx * 0.5,
    percentile75: 28 + idx * 0.4,
    percentile50: 20 + idx * 0.3,
    percentile25: 15 + idx * 0.2,
    percentile10: 10 + idx * 0.1,
    realized: d.volatility || 22
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={coneData} margin={chartConfig.margin}>
          <defs>
            {[90, 75, 50, 25, 10].map((p, i) => (
              <linearGradient key={p} id={`cone${p}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.1 * (1 - i * 0.15)}/>
                <stop offset="95%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0}/>
              </linearGradient>
            ))}
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
            label={{ value: 'Volatility %', angle: -90, position: 'insideLeft', fill: monochromeTheme.text.muted }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Area type="monotone" dataKey="percentile90" stroke="transparent" fill="url(#cone90)" />
          <Area type="monotone" dataKey="percentile75" stroke="transparent" fill="url(#cone75)" />
          <Area type="monotone" dataKey="percentile50" stroke="transparent" fill="url(#cone50)" />
          <Area type="monotone" dataKey="percentile25" stroke="transparent" fill="url(#cone25)" />
          <Area type="monotone" dataKey="percentile10" stroke="transparent" fill="url(#cone10)" />
          
          <Line 
            type="monotone" 
            dataKey="realized" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
            name="Realized Vol"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">Vol Percentile</div>
          <div className="text-gray-400 text-xs mt-1">
            현재: {analysis.currentPercentile || '50'}th
          </div>
        </div>
      )}
    </div>
  )
}

// 변동성 스마일 차트
export const VolatilitySmile: React.FC<VolatilityChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  // 스트라이크 가격별 내재 변동성 시뮬레이션
  const smileData = Array.from({ length: 21 }, (_, i) => {
    const strike = 80 + i * 2
    const moneyness = strike / 100
    const iv = 20 + Math.pow(moneyness - 1, 2) * 100
    return {
      strike,
      impliedVol: iv,
      isATM: strike === 100
    }
  })

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={chartConfig.margin}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="strike" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            label={{ value: 'Strike Price', position: 'insideBottom', offset: -5, fill: monochromeTheme.text.muted }}
          />
          <YAxis 
            dataKey="impliedVol"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            label={{ value: 'Implied Vol %', angle: -90, position: 'insideLeft', fill: monochromeTheme.text.muted }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Scatter data={smileData} fill={monochromeTheme.chart.line.primary}>
            {smileData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isATM ? monochromeTheme.chart.line.primary : monochromeTheme.chart.line.secondary}
                fillOpacity={entry.isATM ? 1 : 0.5}
              />
            ))}
          </Scatter>
          
          <ReferenceLine 
            x={100} 
            stroke={monochromeTheme.signal.buy.primary} 
            strokeDasharray="5 5"
            label={{ value: "ATM", fill: monochromeTheme.text.secondary, fontSize: 10 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">Skew 분석</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.skewDirection || 'Neutral'} Skew
          </div>
        </div>
      )}
    </div>
  )
}

// 변동성 지표 미터
export const VolatilityMeter: React.FC<{ level: number, status: string }> = ({ 
  level, 
  status 
}) => {
  const meterSegments = [
    { label: 'Low', threshold: 20, color: 'rgba(255,255,255,0.3)' },
    { label: 'Normal', threshold: 40, color: 'rgba(255,255,255,0.5)' },
    { label: 'High', threshold: 60, color: 'rgba(255,255,255,0.7)' },
    { label: 'Extreme', threshold: 80, color: 'rgba(255,255,255,0.9)' },
    { label: 'Panic', threshold: 100, color: 'rgba(255,255,255,1)' }
  ]

  return (
    <div className="bg-black/50 rounded-lg p-4">
      <div className="text-white text-sm font-bold mb-3">변동성 레벨</div>
      
      <div className="relative h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="30%" 
            outerRadius="90%" 
            data={[{ value: level, fill: monochromeTheme.chart.line.primary }]}
            startAngle={180} 
            endAngle={0}
          >
            <PolarGrid stroke={monochromeTheme.border.primary} />
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} fill={monochromeTheme.chart.line.primary} />
          </RadialBarChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-2xl font-bold">{level}%</div>
            <div className="text-gray-400 text-xs mt-1">{status}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-3 text-xs">
        {meterSegments.map(seg => (
          <div key={seg.label} className="text-gray-500">{seg.label}</div>
        ))}
      </div>
    </div>
  )
}

export default {
  BollingerSqueezeChart,
  KeltnerChannelCloud,
  ATRVolatilityHeatmap,
  HistoricalVsImpliedVolatility,
  VolatilityCone,
  VolatilitySmile,
  VolatilityMeter
}