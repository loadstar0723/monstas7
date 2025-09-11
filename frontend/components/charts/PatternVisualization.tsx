'use client'

import React, { useMemo } from 'react'
import {
  LineChart, Line, Area, AreaChart, Bar, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
  ComposedChart, Scatter, ScatterChart, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { DetectedPattern, PatternData } from '@/lib/patternDetection'

interface PatternChartProps {
  data: PatternData[]
  pattern?: DetectedPattern | null
  width?: number
  height?: number
}

// 헤드앤숄더 패턴 시각화
export const HeadAndShouldersChart: React.FC<PatternChartProps> = ({ 
  data, 
  pattern,
  height = 300 
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d, index) => {
      const point: any = {
        time: new Date(d.time).toLocaleTimeString(),
        price: d.close,
        high: d.high,
        low: d.low
      }
      
      // 패턴의 주요 포인트 표시
      if (pattern?.keyPoints) {
        const kp = pattern.keyPoints
        if (index === kp.leftShoulder?.index) point.leftShoulder = kp.leftShoulder.value
        if (index === kp.head?.index) point.head = kp.head.value
        if (index === kp.rightShoulder?.index) point.rightShoulder = kp.rightShoulder.value
        if (index === kp.neckline?.index) point.neckline = kp.neckline.value
      }
      
      return point
    })
  }, [data, pattern])

  return (
    <div className="w-full p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">헤드앤숄더 패턴 감지</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="patternGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis stroke="#666" tick={{ fontSize: 10 }} domain={['dataMin - 50', 'dataMax + 50']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
          
          {/* 가격 영역 차트 */}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#ffffff"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
          
          {/* 헤드앤숄더 포인트 표시 */}
          <Line
            type="monotone"
            dataKey="leftShoulder"
            stroke="#fbbf24"
            strokeWidth={0}
            dot={{ fill: '#fbbf24', r: 6 }}
            name="왼쪽 어깨"
          />
          <Line
            type="monotone"
            dataKey="head"
            stroke="#ef4444"
            strokeWidth={0}
            dot={{ fill: '#ef4444', r: 8 }}
            name="헤드"
          />
          <Line
            type="monotone"
            dataKey="rightShoulder"
            stroke="#fbbf24"
            strokeWidth={0}
            dot={{ fill: '#fbbf24', r: 6 }}
            name="오른쪽 어깨"
          />
          
          {/* 넥라인 */}
          {pattern?.keyPoints?.neckline && (
            <ReferenceLine
              y={pattern.keyPoints.neckline.value}
              stroke="#60a5fa"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: "넥라인", fill: "#60a5fa", fontSize: 10 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      
      {pattern && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-800 p-2 rounded">
            <span className="text-gray-400">패턴 타입:</span>
            <span className="text-white ml-2">{pattern.type}</span>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <span className="text-gray-400">신뢰도:</span>
            <span className="text-green-400 ml-2">{(pattern.reliability * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-gray-800 p-2 rounded">
            <span className="text-gray-400">방향:</span>
            <span className={`ml-2 ${pattern.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
              {pattern.direction === 'bullish' ? '상승' : '하락'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// 더블 탑/바텀 패턴 시각화
export const DoubleTopBottomChart: React.FC<PatternChartProps> = ({ 
  data, 
  pattern,
  height = 300 
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d, index) => {
      const point: any = {
        time: new Date(d.time).toLocaleTimeString(),
        price: d.close,
        volume: d.volume
      }
      
      // 패턴의 피크/밸리 표시
      if (pattern?.keyPoints) {
        const kp = pattern.keyPoints
        if (index === kp.firstPeak?.index) point.firstPeak = kp.firstPeak.value
        if (index === kp.secondPeak?.index) point.secondPeak = kp.secondPeak.value
        if (index === kp.valley?.index) point.valley = kp.valley.value
      }
      
      return point
    })
  }, [data, pattern])

  return (
    <div className="w-full p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">더블 탑/바텀 패턴</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="price" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="volume" orientation="right" stroke="#666" tick={{ fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
          
          {/* 거래량 바 차트 */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="url(#volumeGradient)"
            opacity={0.5}
          />
          
          {/* 가격 라인 */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
          />
          
          {/* 더블 탑/바텀 포인트 */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="firstPeak"
            stroke="#ef4444"
            strokeWidth={0}
            dot={{ fill: '#ef4444', r: 8 }}
            name="첫 번째 피크"
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="secondPeak"
            stroke="#ef4444"
            strokeWidth={0}
            dot={{ fill: '#ef4444', r: 8 }}
            name="두 번째 피크"
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="valley"
            stroke="#22c55e"
            strokeWidth={0}
            dot={{ fill: '#22c55e', r: 6 }}
            name="밸리"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {pattern && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <div className="text-xs text-gray-400 mb-2">패턴 분석</div>
          <div className="text-sm text-white">
            {pattern.type === 'double_top' ? 
              '더블 탑 패턴 감지 - 하락 반전 가능성' : 
              '더블 바텀 패턴 감지 - 상승 반전 가능성'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            목표가: {pattern.target?.toFixed(2)} USDT
          </div>
        </div>
      )}
    </div>
  )
}

// 삼각형 패턴 시각화
export const TrianglePatternChart: React.FC<PatternChartProps> = ({ 
  data, 
  pattern,
  height = 300 
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d, index) => {
      const point: any = {
        time: new Date(d.time).toLocaleTimeString(),
        price: d.close,
        high: d.high,
        low: d.low
      }
      
      // 트렌드라인 그리기
      if (pattern?.trendlines) {
        const { upper, lower } = pattern.trendlines
        if (upper && index < data.length) {
          point.upperTrend = upper.start + (upper.slope * index)
        }
        if (lower && index < data.length) {
          point.lowerTrend = lower.start + (lower.slope * index)
        }
      }
      
      return point
    })
  }, [data, pattern])

  return (
    <div className="w-full p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">삼각형 패턴 분석</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="triangleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis stroke="#666" tick={{ fontSize: 10 }} domain={['dataMin - 50', 'dataMax + 50']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
          
          {/* 고저 영역 */}
          <Area
            type="monotone"
            dataKey="high"
            stackId="1"
            stroke="transparent"
            fill="transparent"
          />
          <Area
            type="monotone"
            dataKey="low"
            stackId="2"
            stroke="transparent"
            fill="url(#triangleGradient)"
          />
          
          {/* 가격 라인 */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
          />
          
          {/* 트렌드라인 */}
          <Line
            type="monotone"
            dataKey="upperTrend"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="상단 트렌드"
          />
          <Line
            type="monotone"
            dataKey="lowerTrend"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="하단 트렌드"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {pattern && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-xs text-gray-400">패턴 타입</div>
            <div className="text-sm text-white mt-1">
              {pattern.type === 'ascending_triangle' && '상승 삼각형'}
              {pattern.type === 'descending_triangle' && '하락 삼각형'}
              {pattern.type === 'symmetrical_triangle' && '대칭 삼각형'}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-xs text-gray-400">돌파 예상</div>
            <div className={`text-sm mt-1 ${pattern.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
              {pattern.direction === 'bullish' ? '상단 돌파' : '하단 돌파'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 컵앤핸들 패턴 시각화
export const CupAndHandleChart: React.FC<PatternChartProps> = ({ 
  data, 
  pattern,
  height = 300 
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d, index) => {
      const point: any = {
        time: new Date(d.time).toLocaleTimeString(),
        price: d.close,
        volume: d.volume
      }
      
      // 컵 형태 구간 표시
      if (pattern?.keyPoints) {
        const kp = pattern.keyPoints
        if (index === kp.cupLeft?.index) point.cupLeft = kp.cupLeft.value
        if (index === kp.cupBottom?.index) point.cupBottom = kp.cupBottom.value
        if (index === kp.cupRight?.index) point.cupRight = kp.cupRight.value
        if (index === kp.handleBottom?.index) point.handleBottom = kp.handleBottom.value
      }
      
      return point
    })
  }, [data, pattern])

  return (
    <div className="w-full p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">컵앤핸들 패턴</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="cupGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="price" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="volume" orientation="right" stroke="#666" tick={{ fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
          
          {/* 거래량 */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#4b5563"
            opacity={0.3}
          />
          
          {/* 가격 영역 */}
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#ffffff"
            strokeWidth={2}
            fill="url(#cupGradient)"
          />
          
          {/* 컵 포인트 표시 */}
          <Scatter
            yAxisId="price"
            dataKey="cupLeft"
            fill="#f59e0b"
            shape="circle"
          />
          <Scatter
            yAxisId="price"
            dataKey="cupBottom"
            fill="#ef4444"
            shape="circle"
          />
          <Scatter
            yAxisId="price"
            dataKey="cupRight"
            fill="#f59e0b"
            shape="circle"
          />
          <Scatter
            yAxisId="price"
            dataKey="handleBottom"
            fill="#06b6d4"
            shape="circle"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {pattern && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">컵앤핸들 완성도</span>
            <span className="text-sm text-amber-400">
              {(pattern.reliability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-300">
            돌파 목표가: {pattern.target?.toFixed(2)} USDT
          </div>
        </div>
      )}
    </div>
  )
}

// 플래그 패턴 시각화
export const FlagPatternChart: React.FC<PatternChartProps> = ({ 
  data, 
  pattern,
  height = 250 
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d, index) => ({
      time: new Date(d.time).toLocaleTimeString(),
      price: d.close,
      signal: pattern && index === Math.floor(data.length * 0.7) ? d.close : null
    }))
  }, [data, pattern])

  return (
    <div className="w-full p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">플래그 패턴</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="flagGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis stroke="#666" tick={{ fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke="url(#flagGradient)"
            strokeWidth={2}
            dot={false}
          />
          
          <Line
            type="monotone"
            dataKey="signal"
            stroke="#fbbf24"
            strokeWidth={0}
            dot={{ fill: '#fbbf24', r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {pattern && (
        <div className="mt-4 flex justify-between text-xs">
          <span className="text-gray-400">플래그 방향:</span>
          <span className={pattern.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}>
            {pattern.direction === 'bullish' ? '상승 플래그' : '하락 플래그'}
          </span>
        </div>
      )}
    </div>
  )
}

// 웨지 패턴 시각화
export const WedgePatternChart: React.FC<PatternChartProps> = ({ 
  data, 
  pattern,
  height = 250 
}) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map((d) => ({
      time: new Date(d.time).toLocaleTimeString(),
      price: d.close,
      upper: d.high,
      lower: d.low
    }))
  }, [data])

  return (
    <div className="w-full p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">웨지 패턴</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="wedgeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
          <YAxis stroke="#666" tick={{ fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
          
          <Area
            type="monotone"
            dataKey="upper"
            stackId="1"
            stroke="#ef4444"
            fill="transparent"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stackId="2"
            stroke="#22c55e"
            fill="url(#wedgeGradient)"
          />
          
          <Line
            type="monotone"
            dataKey="price"
            stroke="#ffffff"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {pattern && (
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-400">웨지 타입: </span>
          <span className="text-sm text-white">
            {pattern.type === 'rising_wedge' ? '상승 웨지' : '하락 �에지'}
          </span>
        </div>
      )}
    </div>
  )
}

// 패턴 신뢰도 레이더 차트
export const PatternReliabilityRadar: React.FC<{ patterns: DetectedPattern[] }> = ({ patterns }) => {
  const radarData = useMemo(() => {
    const patternTypes = ['head_shoulders', 'double_top', 'triangle', 'cup_handle', 'flag', 'wedge']
    
    return patternTypes.map(type => {
      const pattern = patterns.find(p => p.type.includes(type.split('_')[0]))
      return {
        pattern: type.replace('_', ' ').toUpperCase(),
        reliability: pattern ? pattern.reliability * 100 : 0
      }
    })
  }, [patterns])

  return (
    <div className="w-full p-4 bg-gradient-to-b from-gray-900 to-black rounded-lg">
      <h3 className="text-white text-sm font-bold mb-4">패턴 신뢰도 분석</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="pattern" stroke="#666" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis stroke="#666" domain={[0, 100]} />
          <Radar
            name="신뢰도"
            dataKey="reliability"
            stroke="#60a5fa"
            fill="#60a5fa"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}