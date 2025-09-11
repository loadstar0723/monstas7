'use client'

import React from 'react'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, BarChart,
  Treemap, Sankey, Node
} from 'recharts'
import { monochromeTheme, chartConfig } from '@/lib/monochromeTheme'

interface ChartData {
  time: string
  price: number
  volume: number
  obv?: number
  mfi?: number
  vwap?: number
  volumeProfile?: {
    price: number
    volume: number
    poc?: boolean // Point of Control
  }[]
  cvd?: number // Cumulative Volume Delta
  volumeDelta?: number
  buyVolume?: number
  sellVolume?: number
  netVolume?: number
  volumeMA?: number
  forceIndex?: number
  volumeRatio?: number
}

interface VolumeChartProps {
  data: ChartData[]
  height?: number
  analysis?: any
}

// OBV (On-Balance Volume) 플로우 차트
export const OBVFlowChart: React.FC<VolumeChartProps> = ({ 
  data, 
  height = 350,
  analysis 
}) => {
  const obvData = data.map((d, idx) => ({
    ...d,
    obvTrend: idx > 0 ? (d.obv! > data[idx-1].obv! ? 'up' : 'down') : 'neutral',
    divergence: d.price && d.obv ? 
      (d.price > data[Math.max(0, idx-10)]?.price && d.obv < data[Math.max(0, idx-10)]?.obv) : false
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={obvData} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="obvGradient" x1="0" y1="0" x2="0" y2="1">
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
            yAxisId="price"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="obv"
            orientation="right"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Area
            yAxisId="obv"
            type="monotone"
            dataKey="obv"
            stroke={monochromeTheme.chart.line.primary}
            fill="url(#obvGradient)"
            strokeWidth={2}
            name="OBV"
            animationDuration={600}
            animationBegin={0}
            dot={{ r: 2, strokeWidth: 1 }}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={{ r: 1, strokeWidth: 0.5 }}
            activeDot={{ r: 3, strokeWidth: 2 }}
            name="Price"
            animationDuration={400}
            animationBegin={100}
          />
          
          {obvData.filter(d => d.divergence).map((d, idx) => (
            <ReferenceLine
              key={idx}
              x={d.time}
              stroke={monochromeTheme.signal.sell.primary}
              strokeDasharray="5 5"
              opacity={0.5}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">OBV 분석</div>
          <div className="text-gray-400 text-xs mt-1">
            추세: {analysis.trend || '상승'}
          </div>
          <div className="text-gray-500 text-xs">
            다이버전스: {analysis.divergence || '없음'}
          </div>
        </div>
      )}
    </div>
  )
}

// MFI (Money Flow Index) 히트맵
export const MFIHeatmap: React.FC<VolumeChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  const mfiData = data.map(d => ({
    ...d,
    mfiLevel: d.mfi ? (
      d.mfi > 80 ? 'overbought' :
      d.mfi > 60 ? 'strong' :
      d.mfi > 40 ? 'neutral' :
      d.mfi > 20 ? 'weak' : 'oversold'
    ) : 'neutral',
    mfiColor: d.mfi ? `rgba(255, 255, 255, ${d.mfi / 100})` : 'rgba(255, 255, 255, 0.5)'
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={mfiData} margin={chartConfig.margin}>
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            dataKey="time" 
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="mfi"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Bar yAxisId="volume" dataKey="volume">
            {mfiData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.mfiColor} opacity={0.3} />
            ))}
          </Bar>
          
          <Line 
            yAxisId="mfi"
            type="monotone" 
            dataKey="mfi" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
            name="MFI"
          />
          
          <ReferenceLine 
            yAxisId="mfi"
            y={80} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
            label={{ value: "Overbought", fill: monochromeTheme.text.muted, fontSize: 10 }}
          />
          
          <ReferenceLine 
            yAxisId="mfi"
            y={20} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
            label={{ value: "Oversold", fill: monochromeTheme.text.muted, fontSize: 10 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">MFI 상태</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.status || '중립'}
          </div>
          <div className="text-gray-500 text-xs">
            압력: {analysis.pressure || '보통'}
          </div>
        </div>
      )}
    </div>
  )
}

// 볼륨 프로파일 차트
export const VolumeProfileChart: React.FC<VolumeChartProps> = ({ 
  data, 
  height = 400,
  analysis 
}) => {
  // 가격대별 볼륨 집계 시뮬레이션
  const profileData = Array.from({ length: 20 }, (_, i) => {
    const priceLevel = 45000 + i * 500
    const volume = Math.random() * 1000000 + 500000
    const isPOC = i === 10 // Point of Control
    return {
      price: priceLevel,
      volume,
      isPOC,
      buyVolume: volume * 0.6,
      sellVolume: volume * 0.4
    }
  })

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={profileData} 
          layout="horizontal"
          margin={chartConfig.margin}
        >
          <CartesianGrid {...chartConfig.grid} />
          <XAxis 
            type="number"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            type="category"
            dataKey="price"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Bar dataKey="volume">
            {profileData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isPOC ? monochromeTheme.chart.line.primary : monochromeTheme.chart.line.secondary}
                fillOpacity={entry.isPOC ? 0.8 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/90 backdrop-blur-sm rounded p-3">
          <div className="text-white text-sm font-bold mb-1">볼륨 프로파일</div>
          <div className="text-gray-400 text-xs space-y-1">
            <div>POC: {analysis.poc || '$50,000'}</div>
            <div>VAH: {analysis.vah || '$52,000'}</div>
            <div>VAL: {analysis.val || '$48,000'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// 누적 볼륨 델타 (CVD) 차트
export const CumulativeVolumeDelta: React.FC<VolumeChartProps> = ({ 
  data, 
  height = 300,
  analysis 
}) => {
  const cvdData = data.map((d, idx) => ({
    ...d,
    cvd: d.cvd || (d.buyVolume! - d.sellVolume!) + (idx > 0 ? data[idx-1].cvd || 0 : 0),
    volumeDelta: d.buyVolume! - d.sellVolume!,
    deltaColor: d.buyVolume! > d.sellVolume! ? 
      monochromeTheme.signal.buy.primary : monochromeTheme.signal.sell.primary
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={cvdData} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="cvdGradient" x1="0" y1="0" x2="0" y2="1">
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
            yAxisId="cvd"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="delta"
            orientation="right"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Area
            yAxisId="cvd"
            type="monotone"
            dataKey="cvd"
            stroke={monochromeTheme.chart.line.primary}
            fill="url(#cvdGradient)"
            strokeWidth={2}
            name="CVD"
          />
          
          <Bar yAxisId="delta" dataKey="volumeDelta">
            {cvdData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.deltaColor}
                fillOpacity={0.3}
              />
            ))}
          </Bar>
          
          <ReferenceLine 
            yAxisId="delta"
            y={0} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">CVD 시그널</div>
          <div className="text-gray-400 text-xs mt-1">
            델타: {analysis.delta || '매수 우세'}
          </div>
        </div>
      )}
    </div>
  )
}

// VWAP (Volume Weighted Average Price) 차트
export const VWAPChart: React.FC<VolumeChartProps> = ({ 
  data, 
  height = 350,
  analysis 
}) => {
  const vwapData = data.map(d => ({
    ...d,
    vwapUpper: d.vwap ? d.vwap * 1.01 : d.price * 1.01,
    vwapLower: d.vwap ? d.vwap * 0.99 : d.price * 0.99
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={vwapData} margin={chartConfig.margin}>
          <defs>
            <linearGradient id="vwapBandGradient" x1="0" y1="0" x2="0" y2="1">
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
            yAxisId="price"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke={chartConfig.axis.stroke}
            tick={{ ...chartConfig.axis.tick }}
          />
          <Tooltip {...chartConfig.tooltip} />
          
          <Bar 
            yAxisId="volume"
            dataKey="volume" 
            fill={monochromeTheme.chart.volume.neutral}
            opacity={0.2}
          />
          
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="vwapUpper"
            stroke="transparent"
            fill="url(#vwapBandGradient)"
          />
          
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="vwapLower"
            stroke="transparent"
            fill={monochromeTheme.background.primary}
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="vwap" 
            stroke={monochromeTheme.chart.line.primary}
            strokeWidth={2}
            dot={false}
            name="VWAP"
          />
          
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke={monochromeTheme.chart.line.secondary}
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            name="Price"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">VWAP 위치</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.position || 'Above VWAP'}
          </div>
          <div className="text-gray-500 text-xs">
            편차: {analysis.deviation || '+2.3%'}
          </div>
        </div>
      )}
    </div>
  )
}

// Force Index 차트
export const ForceIndexChart: React.FC<VolumeChartProps> = ({ 
  data, 
  height = 250,
  analysis 
}) => {
  const forceData = data.map((d, idx) => ({
    ...d,
    forceIndex: d.forceIndex || (idx > 0 ? (d.price - data[idx-1].price) * d.volume : 0),
    forceMA: d.forceIndex || 0 // Moving average of force index
  }))

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={forceData} margin={chartConfig.margin}>
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
          
          <Bar dataKey="forceIndex">
            {forceData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.forceIndex > 0 ? 
                  monochromeTheme.chart.line.primary : 
                  monochromeTheme.chart.line.secondary}
                fillOpacity={0.5}
              />
            ))}
          </Bar>
          
          <Line 
            type="monotone" 
            dataKey="forceMA" 
            stroke={monochromeTheme.chart.line.tertiary}
            strokeWidth={1.5}
            dot={false}
            name="Force MA"
          />
          
          <ReferenceLine 
            y={0} 
            stroke={monochromeTheme.border.primary} 
            strokeDasharray="3 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {analysis && (
        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded p-2">
          <div className="text-white text-xs font-bold">Force Index</div>
          <div className="text-gray-400 text-xs mt-1">
            {analysis.signal || '매수 압력'}
          </div>
        </div>
      )}
    </div>
  )
}

// 볼륨 비율 게이지
export const VolumeRatioGauge: React.FC<{ buyRatio: number, sellRatio: number }> = ({ 
  buyRatio, 
  sellRatio 
}) => {
  const total = buyRatio + sellRatio
  const buyPercent = (buyRatio / total) * 100
  const sellPercent = (sellRatio / total) * 100

  return (
    <div className="bg-black/50 rounded-lg p-4">
      <div className="text-white text-sm font-bold mb-3">매수/매도 볼륨 비율</div>
      
      <div className="relative h-8 bg-gray-900 rounded-full overflow-hidden">
        <div 
          className="absolute h-full transition-all duration-500"
          style={{
            width: `${buyPercent}%`,
            background: `linear-gradient(90deg, transparent 0%, ${monochromeTheme.chart.line.primary} 100%)`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {buyPercent.toFixed(1)}% / {sellPercent.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-gray-400">매수: {buyRatio.toLocaleString()}</span>
        <span className="text-gray-400">매도: {sellRatio.toLocaleString()}</span>
      </div>
    </div>
  )
}

// 볼륨 트리맵
export const VolumeTreemap: React.FC<{ data: any[] }> = ({ data }) => {
  const treemapData = data || [
    { name: 'BTC', size: 45000000, opacity: 1 },
    { name: 'ETH', size: 28000000, opacity: 0.8 },
    { name: 'BNB', size: 15000000, opacity: 0.6 },
    { name: 'SOL', size: 12000000, opacity: 0.5 },
    { name: 'XRP', size: 8000000, opacity: 0.4 },
    { name: 'Others', size: 5000000, opacity: 0.3 }
  ]

  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, size } = props
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={monochromeTheme.chart.line.primary}
          fillOpacity={props.opacity || 0.5}
          stroke={monochromeTheme.border.primary}
        />
        {width > 50 && height > 30 && (
          <>
            <text 
              x={x + width / 2} 
              y={y + height / 2 - 5} 
              textAnchor="middle" 
              fill={monochromeTheme.text.primary}
              fontSize="12"
              fontWeight="bold"
            >
              {name}
            </text>
            <text 
              x={x + width / 2} 
              y={y + height / 2 + 10} 
              textAnchor="middle" 
              fill={monochromeTheme.text.secondary}
              fontSize="10"
            >
              ${(size / 1000000).toFixed(1)}M
            </text>
          </>
        )}
      </g>
    )
  }

  return (
    <div className="bg-black/50 rounded-lg p-4">
      <div className="text-white text-sm font-bold mb-2">볼륨 분포</div>
      <ResponsiveContainer width="100%" height={250}>
        <Treemap
          data={treemapData}
          dataKey="size"
          content={<CustomTreemapContent />}
        />
      </ResponsiveContainer>
    </div>
  )
}

export default {
  OBVFlowChart,
  MFIHeatmap,
  VolumeProfileChart,
  CumulativeVolumeDelta,
  VWAPChart,
  ForceIndexChart,
  VolumeRatioGauge,
  VolumeTreemap
}