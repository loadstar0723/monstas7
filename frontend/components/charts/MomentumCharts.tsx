'use client'

import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, RadialBarChart, RadialBar
} from 'recharts'
import { monochromeTheme, chartConfig } from '@/lib/monochromeTheme'

interface ChartData {
  time: string
  rsi?: number
  stochasticK?: number
  stochasticD?: number
  cci?: number
  williamsR?: number
  roc?: number
  ultimateOsc?: number
  macdHist?: number
  price?: number
}

interface MomentumChartProps {
  data: ChartData[]
  height?: number
  analysis?: any
}

// RSI 히스토그램 차트 with 다이버전스
export const RSIHistogramChart: React.FC<MomentumChartProps> = ({ 
  data, 
  height = 250,
  analysis 
}) => {
  const rsiData = data.map(d => ({
    ...d,
    rsiColor: d.rsi ? (d.rsi > 70 ? 'overbought' : d.rsi < 30 ? 'oversold' : 'neutral') : 'neutral',
    divergence: 0 // 실제로는 가격과 RSI 다이버전스 계산 필요
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={rsiData} margin={chartConfig.margin}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            domain={[0, 100]}
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          {/* 과매수/과매도 구간 */}
          <ReferenceLine y={70} stroke={monochromeTheme.indicators.rsi.overbought} strokeDasharray="5 5" />
          <ReferenceLine y={30} stroke={monochromeTheme.indicators.rsi.oversold} strokeDasharray="5 5" />
          <ReferenceLine y={50} stroke={monochromeTheme.border.secondary} strokeDasharray="3 3" />
          
          {/* RSI 바 차트 */}
          <Bar dataKey="rsi" opacity={0.3}>
            {rsiData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={
                  entry.rsiColor === 'overbought' ? monochromeTheme.signal.sell.background :
                  entry.rsiColor === 'oversold' ? monochromeTheme.signal.buy.background :
                  monochromeTheme.signal.neutral.background
                }
              />
            ))}
          </Bar>
          
          {/* RSI 라인 - 더 활발한 애니메이션 */}
          <Line 
            type="monotone" 
            dataKey="rsi" 
            stroke={monochromeTheme.indicators.rsi.line}
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 1, fill: monochromeTheme.indicators.rsi.line }}
            activeDot={{ r: 4, strokeWidth: 2 }}
            name="RSI"
            animationDuration={300}
            animationBegin={0}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm rounded p-2 text-xs">
          <div className="text-white font-bold">RSI: {data[data.length - 1]?.rsi?.toFixed(1)}</div>
          <div className="text-gray-400">{analysis.interpretation}</div>
          <div className="text-gray-500 mt-1">신뢰도: {analysis.confidence}%</div>
        </div>
      )}
    </div>
  )
}

// 부드러운 스토캐스틱 차트
export const StochasticSmoothChart: React.FC<MomentumChartProps> = ({ 
  data, 
  height = 250,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="stochGradient" x1="0" y1="0" x2="0" y2="1">
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
            domain={[0, 100]}
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          <Legend {...chartConfig.legend} />
          
          {/* 과매수/과매도 구간 */}
          <ReferenceLine y={80} stroke={monochromeTheme.indicators.stochastic.overbought} strokeDasharray="5 5" />
          <ReferenceLine y={20} stroke={monochromeTheme.indicators.stochastic.oversold} strokeDasharray="5 5" />
          
          {/* K선 영역 - 부드러운 애니메이션 */}
          <Area
            type="monotone"
            dataKey="stochasticK"
            stroke={monochromeTheme.indicators.stochastic.k}
            fill="url(#stochGradient)"
            strokeWidth={2}
            name="%K"
            animationDuration={500}
            animationBegin={0}
          />
          
          {/* D선 - 활발한 도트 애니메이션 */}
          <Line 
            type="monotone" 
            dataKey="stochasticD" 
            stroke={monochromeTheme.indicators.stochastic.d}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={{ r: 1.5, strokeWidth: 1 }}
            activeDot={{ r: 3, strokeWidth: 2 }}
            name="%D"
            animationDuration={400}
            animationBegin={100}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 right-2 bg-black/90 backdrop-blur-sm rounded p-2 text-xs">
          <div className="text-gray-400">{analysis.actionSuggestion}</div>
        </div>
      )}
    </div>
  )
}

// CCI 오실레이터 차트
export const CCIOscillatorChart: React.FC<MomentumChartProps> = ({ 
  data, 
  height = 250,
  analysis 
}) => {
  const cciData = data.map(d => ({
    ...d,
    cciPositive: d.cci && d.cci > 0 ? d.cci : 0,
    cciNegative: d.cci && d.cci < 0 ? d.cci : 0
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={cciData} margin={chartConfig.margin}>
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
          
          {/* 임계값 라인 */}
          <ReferenceLine y={100} stroke={monochromeTheme.border.light} strokeDasharray="5 5" />
          <ReferenceLine y={-100} stroke={monochromeTheme.border.light} strokeDasharray="5 5" />
          <ReferenceLine y={0} stroke={monochromeTheme.border.primary} strokeWidth={1} />
          
          {/* CCI 바 - 성장 애니메이션 */}
          <Bar 
            dataKey="cciPositive" 
            fill={monochromeTheme.chart.volume.up} 
            opacity={0.7} 
            animationDuration={400}
            animationBegin={0}
          />
          <Bar 
            dataKey="cciNegative" 
            fill={monochromeTheme.chart.volume.down} 
            opacity={0.7} 
            animationDuration={400}
            animationBegin={50}
          />
          
          {/* CCI 라인 - 활발한 애니메이션 */}
          <Line 
            type="monotone" 
            dataKey="cci" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={1.5}
            dot={{ r: 1, strokeWidth: 1 }}
            activeDot={{ r: 3, strokeWidth: 2, fill: monochromeTheme.chart.line.primary }}
            name="CCI"
            animationDuration={300}
            animationBegin={0}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm rounded p-2 text-xs">
          <div className="text-white">CCI: {data[data.length - 1]?.cci?.toFixed(1)}</div>
          <div className="text-gray-400 mt-1">{analysis.interpretation}</div>
        </div>
      )}
    </div>
  )
}

// Williams %R 게이지 차트
export const WilliamsRGaugeChart: React.FC<{ value: number, analysis?: any }> = ({ 
  value, 
  analysis 
}) => {
  const normalizedValue = Math.abs(value) // Williams %R은 음수이므로 절대값 사용
  const gaugeData = [
    { name: 'value', value: normalizedValue, fill: monochromeTheme.chart.line.primary },
    { name: 'remaining', value: 100 - normalizedValue, fill: monochromeTheme.background.surface }
  ]

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={gaugeData}>
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            fill={
              normalizedValue > 80 ? monochromeTheme.signal.sell.primary :
              normalizedValue < 20 ? monochromeTheme.signal.buy.primary :
              monochromeTheme.signal.neutral.primary
            }
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{value.toFixed(1)}</div>
          <div className="text-xs text-gray-400">Williams %R</div>
        </div>
      </div>
      
      {analysis && (
        <div className="text-center mt-2 text-xs">
          <div className="text-gray-400">{analysis.interpretation}</div>
        </div>
      )}
    </div>
  )
}

// ROC 모멘텀 차트
export const ROCMomentumChart: React.FC<MomentumChartProps> = ({ 
  data, 
  height = 250,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="rocGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.2}/>
              <stop offset="50%" stopColor={monochromeTheme.chart.line.primary} stopOpacity={0.05}/>
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
          
          <ReferenceLine y={0} stroke={monochromeTheme.border.primary} strokeWidth={1} />
          
          <Area
            type="monotone"
            dataKey="roc"
            stroke={monochromeTheme.chart.line.primary}
            fill="url(#rocGradient)"
            strokeWidth={2}
            name="ROC"
            animationDuration={600}
            animationBegin={0}
            dot={{ r: 2, strokeWidth: 1 }}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/90 backdrop-blur-sm rounded p-2 text-xs">
          <div className="text-white font-bold">ROC: {data[data.length - 1]?.roc?.toFixed(2)}%</div>
          <div className="text-gray-400">{analysis.historicalContext}</div>
        </div>
      )}
    </div>
  )
}

// Ultimate Oscillator 밴드 차트
export const UltimateOscillatorBands: React.FC<MomentumChartProps> = ({ 
  data, 
  height = 250,
  analysis 
}) => {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={chartConfig.margin}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            domain={[0, 100]}
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          {/* 과매수/과매도 밴드 */}
          <ReferenceLine y={70} stroke={monochromeTheme.border.light} strokeDasharray="5 5" />
          <ReferenceLine y={50} stroke={monochromeTheme.border.secondary} strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke={monochromeTheme.border.light} strokeDasharray="5 5" />
          
          <Line 
            type="monotone" 
            dataKey="ultimateOsc" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 1, fill: monochromeTheme.chart.line.primary }}
            activeDot={{ r: 4, strokeWidth: 2 }}
            name="Ultimate Oscillator"
            animationDuration={400}
            animationBegin={0}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 left-2 bg-black/90 backdrop-blur-sm rounded p-2 text-xs">
          <div className="text-gray-400">{analysis.actionSuggestion}</div>
        </div>
      )}
    </div>
  )
}

// MACD 고급 차트
export const MACDAdvancedChart: React.FC<MomentumChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  const macdData = data.map(d => ({
    ...d,
    macdPositive: d.macdHist && d.macdHist > 0 ? d.macdHist : 0,
    macdNegative: d.macdHist && d.macdHist < 0 ? d.macdHist : 0
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={macdData} margin={chartConfig.margin}>
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
          <Legend {...chartConfig.legend} />
          
          <ReferenceLine y={0} stroke={monochromeTheme.border.primary} strokeWidth={1} />
          
          {/* MACD 히스토그램 - 성장 애니메이션 */}
          <Bar 
            dataKey="macdPositive" 
            fill={monochromeTheme.indicators.macd.histogram.positive} 
            name="Histogram +" 
            animationDuration={500}
            animationBegin={0}
          />
          <Bar 
            dataKey="macdNegative" 
            fill={monochromeTheme.indicators.macd.histogram.negative} 
            name="Histogram -" 
            animationDuration={500}
            animationBegin={100}
          />
          
          {/* MACD 라인과 시그널 라인은 실제 데이터에서 가져와야 함 */}
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm rounded p-3">
          <div className="text-white text-sm font-bold mb-1">MACD 분석</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>신호: {analysis.signal || '중립'}</div>
            <div>강도: {analysis.strength || '보통'}</div>
            <div>확률: {analysis.probability || '50'}%</div>
          </div>
        </div>
      )}
    </div>
  )
}

// 모멘텀 종합 지표
export const MomentumCompositeIndicator: React.FC<{ 
  rsi: number, 
  stochastic: number, 
  cci: number,
  analysis?: any 
}> = ({ rsi, stochastic, cci, analysis }) => {
  const indicators = [
    { name: 'RSI', value: rsi, max: 100 },
    { name: 'Stochastic', value: stochastic, max: 100 },
    { name: 'CCI', value: Math.min(200, Math.max(-200, cci)) + 200, max: 400 } // -200 to 200 -> 0 to 400
  ]

  return (
    <div className="bg-black/50 rounded-lg p-4">
      <div className="text-white text-sm font-bold mb-3">모멘텀 종합</div>
      <div className="space-y-3">
        {indicators.map((ind, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{ind.name}</span>
              <span>{ind.name === 'CCI' ? cci.toFixed(0) : ind.value.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{
                  width: `${(ind.value / ind.max) * 100}%`,
                  backgroundColor: `rgba(255, 255, 255, ${0.3 + (ind.value / ind.max) * 0.7})`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {analysis && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400">{analysis.interpretation}</div>
        </div>
      )}
    </div>
  )
}

export default {
  RSIHistogramChart,
  StochasticSmoothChart,
  CCIOscillatorChart,
  WilliamsRGaugeChart,
  ROCMomentumChart,
  UltimateOscillatorBands,
  MACDAdvancedChart,
  MomentumCompositeIndicator
}