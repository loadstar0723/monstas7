'use client'

import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Brush
} from 'recharts'
import { monochromeTheme, chartConfig } from '@/lib/monochromeTheme'

interface ChartData {
  time: string
  price: number
  sma10?: number
  sma20?: number
  sma50?: number
  sma200?: number
  ema12?: number
  ema26?: number
  wma?: number
  volume?: number
}

interface MAChartProps {
  data: ChartData[]
  height?: number
  showVolume?: boolean
  analysis?: any
}

// SMA 수렴/발산 차트
export const SMAConvergenceChart: React.FC<MAChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  const convergenceData = data.map(d => ({
    ...d,
    convergence: d.sma10 && d.sma50 ? ((d.sma10 - d.sma50) / d.sma50 * 100) : 0,
    signal: d.sma10 && d.sma50 ? (d.sma10 > d.sma50 ? 1 : -1) : 0
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={convergenceData} margin={chartConfig.margin}>
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
          
          <ReferenceLine y={0} stroke={monochromeTheme.border.primary} strokeDasharray="3 3" />
          
          <Bar 
            dataKey="convergence" 
            fill={monochromeTheme.chart.volume.neutral}
            opacity={0.5}
          />
          
          <Line 
            type="monotone" 
            dataKey="sma10" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
            name="SMA 10"
          />
          
          <Line 
            type="monotone" 
            dataKey="sma50" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="SMA 50"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2 text-xs">
          <div className="text-white font-bold">{analysis.interpretation}</div>
          <div className="text-gray-400 mt-1">신뢰도: {analysis.confidence}%</div>
        </div>
      )}
    </div>
  )
}

// EMA 클라우드 차트
export const EMACloudChart: React.FC<MAChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="emaCloudGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.1}/>
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
            dataKey="ema26"
            stroke={monochromeTheme.chart.line.tertiary}
            fill="url(#emaCloudGradient)"
            strokeWidth={1}
            name="EMA 26"
          />
          
          <Line 
            type="monotone" 
            dataKey="ema12" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
            name="EMA 12"
          />
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1.5}
            strokeDasharray="2 2"
            dot={false}
            name="Price"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2 text-xs max-w-[200px]">
          <div className="text-gray-400">{analysis.actionSuggestion}</div>
        </div>
      )}
    </div>
  )
}

// 이동평균 리본 차트
export const MovingAverageRibbonChart: React.FC<MAChartProps> = ({ 
  data, 
  height = 350,
  analysis 
}) => {
  // 여러 이동평균선을 리본 형태로 표시
  const ribbonData = data.map(d => ({
    ...d,
    ma5: d.price, // 실제로는 계산 필요
    ma10: d.sma10,
    ma20: d.sma20,
    ma30: d.price * 0.99, // 실제로는 계산 필요
    ma50: d.sma50,
    ma100: d.price * 0.98, // 실제로는 계산 필요
    ma200: d.sma200
  }))

  const maLines = [
    { key: 'ma5', opacity: 1, width: 1.5 },
    { key: 'ma10', opacity: 0.9, width: 1.3 },
    { key: 'ma20', opacity: 0.8, width: 1.1 },
    { key: 'ma30', opacity: 0.7, width: 1 },
    { key: 'ma50', opacity: 0.6, width: 0.9 },
    { key: 'ma100', opacity: 0.5, width: 0.8 },
    { key: 'ma200', opacity: 0.4, width: 0.7 }
  ]

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={ribbonData} margin={chartConfig.margin}>
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
          
          {maLines.map((ma, idx) => (
            <Line
              key={ma.key}
              type="monotone"
              dataKey={ma.key}
              stroke={`rgba(255, 255, 255, ${ma.opacity})`}
              strokeWidth={ma.width}
              dot={false}
              name={ma.key.toUpperCase()}
            />
          ))}
          
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.signal.buy.primary}
            strokeWidth={2}
            dot={false}
            name="Price"
          />
          
          <Brush 
            dataKey="time" 
            height={30} 
            stroke={monochromeTheme.border.primary}
            fill={monochromeTheme.background.secondary}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm rounded p-3">
          <div className="text-white text-sm font-bold mb-1">리본 분석</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>추세: {analysis.trend || '상승'}</div>
            <div>강도: {analysis.strength || '강함'}</div>
            <div>수렴도: {analysis.convergence || '확산'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// 골든/데드 크로스 시그널 차트
export const CrossoverSignalChart: React.FC<MAChartProps> = ({ 
  data, 
  height = 300,
  showVolume = true,
  analysis 
}) => {
  // 크로스오버 포인트 찾기
  const crossoverData = data.map((d, idx) => {
    if (idx === 0) return { ...d, signal: 0 }
    
    const prev = data[idx - 1]
    let signal = 0
    
    if (d.sma50 && prev.sma50 && d.sma200 && prev.sma200) {
      // 골든 크로스
      if (prev.sma50 <= prev.sma200 && d.sma50 > d.sma200) {
        signal = 1
      }
      // 데드 크로스
      else if (prev.sma50 >= prev.sma200 && d.sma50 < d.sma200) {
        signal = -1
      }
    }
    
    return { ...d, signal, crossover: signal !== 0 ? d.price : null }
  })

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={crossoverData} margin={chartConfig.margin}>
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
          {showVolume && (
            <YAxis 
              yAxisId="volume"
              orientation="right"
              stroke={chartConfig.axis.stroke}
              tick={{ ...chartConfig.axis.tick }}
            />
          )}
          <Tooltip {...chartConfig.tooltip} />
          <Legend {...chartConfig.legend} />
          
          {showVolume && (
            <Bar 
              yAxisId="volume"
              dataKey="volume" 
              fill={monochromeTheme.chart.volume.neutral}
              opacity={0.2}
              name="Volume"
            />
          )}
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="sma50" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
            name="SMA 50"
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="sma200" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1.5}
            dot={false}
            name="SMA 200"
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.tertiary}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="Price"
          />
          
          {/* 크로스오버 마커 */}
          {crossoverData.map((d, idx) => {
            if (!d.crossover) return null
            return (
              <ReferenceLine
                key={idx}
                x={d.time}
                stroke={d.signal > 0 ? monochromeTheme.signal.buy.primary : monochromeTheme.signal.sell.primary}
                strokeDasharray="5 5"
                label={{
                  value: d.signal > 0 ? 'GC' : 'DC',
                  fill: d.signal > 0 ? monochromeTheme.signal.buy.primary : monochromeTheme.signal.sell.primary,
                  fontSize: 10
                }}
              />
            )
          })}
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-xs">
            <div className="text-white font-bold">크로스오버 신호</div>
            <div className="text-gray-400 mt-1">{analysis.crossoverStatus || '대기 중'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// 추세 강도 미터
export const TrendStrengthMeter: React.FC<{ strength: number, trend: 'UP' | 'DOWN' | 'NEUTRAL' }> = ({ 
  strength, 
  trend 
}) => {
  const meterColor = trend === 'UP' ? monochromeTheme.signal.buy.primary : 
                     trend === 'DOWN' ? monochromeTheme.signal.sell.primary : 
                     monochromeTheme.signal.neutral.primary

  return (
    <div className="bg-black/50 rounded-lg p-4">
      <div className="text-white text-sm font-bold mb-2">추세 강도</div>
      <div className="relative h-8 bg-gray-900 rounded-full overflow-hidden">
        <div 
          className="absolute h-full transition-all duration-500"
          style={{
            width: `${strength}%`,
            background: `linear-gradient(90deg, ${meterColor}33 0%, ${meterColor} 100%)`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{strength}%</span>
        </div>
      </div>
      <div className="text-gray-400 text-xs mt-2 text-center">
        {trend === 'UP' ? '상승 추세' : trend === 'DOWN' ? '하락 추세' : '횡보'}
      </div>
    </div>
  )
}

export default {
  SMAConvergenceChart,
  EMACloudChart,
  MovingAverageRibbonChart,
  CrossoverSignalChart,
  TrendStrengthMeter
}