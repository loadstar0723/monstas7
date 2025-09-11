'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Bar, Scatter, ScatterChart,
  ReferenceLine, ReferenceArea, Brush
} from 'recharts'
import { FaChartLine, FaWaveSquare, FaExpand, FaCompress } from 'react-icons/fa'

interface WaveChartProps {
  symbol: string
  priceHistory: number[]
  currentPrice: number
  waveData: any
}

export default function WaveChart({ symbol, priceHistory, currentPrice, waveData }: WaveChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [showFibonacci, setShowFibonacci] = useState(true)
  const [showWaveLabels, setShowWaveLabels] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  // 차트 데이터 생성
  useEffect(() => {
    const generateChartData = () => {
      const data = []
      const basePrice = currentPrice
      
      // 과거 100개 데이터 포인트 생성 (엘리엇 파동 패턴 시뮬레이션)
      for (let i = 0; i < 100; i++) {
        // 엘리엇 파동 패턴 생성
        let price = basePrice
        
        // 실제 가격 히스토리가 있으면 우선 사용
        if (priceHistory[i]) {
          price = priceHistory[i]
        } else {
          // 충격파 1-2-3-4-5 시뮬레이션 (더 현실적인 변동)
          const timeOffset = Date.now() / 1000 + i
          if (i >= 0 && i < 20) {
            // Wave 1: 상승
            price = basePrice * 0.92 + (i * basePrice * 0.003) + Math.sin(timeOffset) * basePrice * 0.001
          } else if (i >= 20 && i < 35) {
            // Wave 2: 조정 (하락)
            price = basePrice * 0.98 - ((i - 20) * basePrice * 0.002) + Math.cos(timeOffset) * basePrice * 0.001
          } else if (i >= 35 && i < 55) {
            // Wave 3: 강한 상승
            price = basePrice * 0.95 + ((i - 35) * basePrice * 0.004) + Math.sin(timeOffset * 0.5) * basePrice * 0.002
          } else if (i >= 55 && i < 65) {
            // Wave 4: 조정 (하락)
            price = basePrice * 1.12 - ((i - 55) * basePrice * 0.003) + Math.cos(timeOffset * 0.3) * basePrice * 0.001
          } else if (i >= 65 && i < 80) {
            // Wave 5: 마지막 상승
            price = basePrice * 1.08 + ((i - 65) * basePrice * 0.0035) + Math.sin(timeOffset * 0.2) * basePrice * 0.001
          } else {
            // 조정파 A-B-C
            price = basePrice * 1.18 - ((i - 80) * basePrice * 0.0025) + Math.cos(timeOffset * 0.4) * basePrice * 0.001
          }
        }
        
        data.push({
          index: i,
          time: `T-${100 - i}`,
          price: price,
          volume: Math.random() * 1000000 + 500000,
          // 파동 라벨
          waveLabel: 
            i === 10 ? '1' :
            i === 27 ? '2' :
            i === 45 ? '3' :
            i === 60 ? '4' :
            i === 72 ? '5' :
            i === 85 ? 'A' :
            i === 92 ? 'B' :
            i === 99 ? 'C' : '',
          // 피보나치 레벨 (현재가 기준 동적 계산)
          fib236: basePrice * 0.95,  // -5% (지지선)
          fib382: basePrice * 0.97,  // -3% (지지선)
          fib500: basePrice * 1.00,  // 현재가
          fib618: basePrice * 1.05,  // +5% (저항선)
          fib786: basePrice * 1.08,  // +8% (저항선)
          fib1000: basePrice * 1.10, // +10% (저항선)
        })
      }
      
      return data
    }
    
    setChartData(generateChartData())
  }, [currentPrice, priceHistory])

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          <p className="text-white font-bold">
            ${payload[0].value.toLocaleString()}
          </p>
          {payload[0].payload.waveLabel && (
            <p className="text-purple-400 font-bold mt-1">
              Wave {payload[0].payload.waveLabel}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            Vol: {(payload[0].payload.volume / 1000000).toFixed(2)}M
          </p>
        </div>
      )
    }
    return null
  }

  // 파동 라벨 렌더링
  const renderWaveLabel = (props: any) => {
    const { x, y, payload } = props
    if (!showWaveLabels || !payload.waveLabel) return null
    
    return (
      <g>
        <circle cx={x} cy={y} r="12" fill="#9333ea" />
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="font-bold text-sm"
        >
          {payload.waveLabel}
        </text>
      </g>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 md:p-6 ${
        fullscreen ? 'fixed inset-0 z-50 m-4' : ''
      }`}
      ref={chartRef}
    >
      {/* 차트 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaWaveSquare className="text-purple-500" />
            엘리엇 파동 차트
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            현재: Wave {waveData.currentWave} ({waveData.completionRate}% 완성)
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFibonacci(!showFibonacci)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showFibonacci 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            피보나치
          </button>
          <button
            onClick={() => setShowWaveLabels(!showWaveLabels)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showWaveLabels 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            파동 라벨
          </button>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="px-3 py-1.5 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {fullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* 메인 차트 */}
      <div className={`${fullscreen ? 'h-[calc(100vh-200px)]' : 'h-[400px] md:h-[500px]'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis 
              yAxisId="price"
              orientation="left"
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
              domain={['dataMin - 1000', 'dataMax + 1000']}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            
            <YAxis 
              yAxisId="volume"
              orientation="right"
              stroke="#3b82f6"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* 거래량 바 */}
            <Bar 
              yAxisId="volume"
              dataKey="volume" 
              fill="url(#colorVolume)"
              opacity={0.3}
            />
            
            {/* 가격 영역 차트 */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#9333ea"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
            
            {/* 가격 라인 차트 */}
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#9333ea"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
            
            {/* 파동 라벨 포인트 */}
            {showWaveLabels && (
              <Scatter
                yAxisId="price"
                dataKey="price"
                shape={renderWaveLabel}
              />
            )}
            
            {/* 피보나치 레벨 */}
            {showFibonacci && (
              <>
                <ReferenceLine yAxisId="price" y={chartData[0]?.fib236} stroke="#10b981" strokeDasharray="5 5" label="23.6%" />
                <ReferenceLine yAxisId="price" y={chartData[0]?.fib382} stroke="#3b82f6" strokeDasharray="5 5" label="38.2%" />
                <ReferenceLine yAxisId="price" y={chartData[0]?.fib500} stroke="#8b5cf6" strokeDasharray="5 5" label="50.0%" />
                <ReferenceLine yAxisId="price" y={chartData[0]?.fib618} stroke="#ec4899" strokeDasharray="5 5" label="61.8%" />
                <ReferenceLine yAxisId="price" y={chartData[0]?.fib786} stroke="#f59e0b" strokeDasharray="5 5" label="78.6%" />
              </>
            )}
            
            {/* 브러시 (줌 기능) */}
            <Brush 
              dataKey="time" 
              height={30} 
              stroke="#9333ea"
              fill="#1f2937"
              travellerWidth={10}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 차트 범례 및 정보 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">목표가</div>
          <div className="text-green-400 font-bold">
            ${waveData.nextTarget.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">무효화</div>
          <div className="text-red-400 font-bold">
            ${waveData.invalidationLevel.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">신뢰도</div>
          <div className="text-purple-400 font-bold">
            {waveData.confidence}%
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">파동 타입</div>
          <div className="text-blue-400 font-bold capitalize">
            {waveData.waveType === 'impulse' ? '충격파' : '조정파'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}