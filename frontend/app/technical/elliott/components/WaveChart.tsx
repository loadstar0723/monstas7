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
          // 엘리엇 파동 1-2-3-4-5 피보나치 비율 기반 시뮬레이션
          const wavePhase = i / 100 // 0~1 단계
          const fibRatios = [0, 0.236, 0.382, 0.618, 0.786, 1.0] // 피보나치 비율
          
          if (i >= 0 && i < 20) {
            // Wave 1: 초기 상승 - 23.6% 목표
            const wave1Progress = i / 20
            price = basePrice * (0.92 + wave1Progress * 0.06 * fibRatios[1])
          } else if (i >= 20 && i < 35) {
            // Wave 2: 조정 - 61.8% 리트레이스먼트
            const wave2Progress = (i - 20) / 15
            const retracement = fibRatios[3] // 61.8%
            price = basePrice * (0.98 - wave2Progress * 0.05 * retracement)
          } else if (i >= 35 && i < 55) {
            // Wave 3: 강한 상승 - 161.8% 확장
            const wave3Progress = (i - 35) / 20
            const extension = 1.618 // 황금비율 확장
            price = basePrice * (0.93 + wave3Progress * 0.2 * extension)
          } else if (i >= 55 && i < 65) {
            // Wave 4: 조정 - 38.2% 리트레이스먼트
            const wave4Progress = (i - 55) / 10
            const shallowRetracement = fibRatios[2] // 38.2%
            price = basePrice * (1.13 - wave4Progress * 0.05 * shallowRetracement)
          } else if (i >= 65 && i < 80) {
            // Wave 5: 마지막 상승 - 100% 확장
            const wave5Progress = (i - 65) / 15
            price = basePrice * (1.11 + wave5Progress * 0.07)
          } else {
            // 조정파 A-B-C - 78.6% 리트레이스먼트
            const correctionProgress = (i - 80) / 20
            const deepRetracement = fibRatios[4] // 78.6%
            price = basePrice * (1.18 - correctionProgress * 0.08 * deepRetracement)
          }
        }
        
        data.push({
          index: i,
          time: `T-${100 - i}`,
          price: price,
          // 볼륨: 엘리엇 파동에 따른 거래량 패턴
          volume: i >= 35 && i < 55 ? 800000 + (i - 35) * 50000 : // Wave 3: 최대 거래량
                  i >= 80 ? 1200000 + (i - 80) * 30000 :         // 조정파: 높은 거래량
                  500000 + i * 8000,                              // 기본 거래량
          // 파동 라벨 - 피보나치 기반 위치
          waveLabel: 
            i === 10 ? '1' :
            i === 27 ? '2' :
            i === 45 ? '3' :
            i === 60 ? '4' :
            i === 72 ? '5' :
            i === 85 ? 'A' :
            i === 92 ? 'B' :
            i === 99 ? 'C' : '',
          // 피보나치 리트레이스먼트 및 확장 레벨
          fib236: basePrice * (1 - 0.236),  // 23.6% 리트레이스먼트
          fib382: basePrice * (1 - 0.382),  // 38.2% 리트레이스먼트
          fib500: basePrice * (1 - 0.5),    // 50% 리트레이스먼트
          fib618: basePrice * (1 + 0.618),  // 61.8% 확장 레벨
          fib786: basePrice * (1 + 1.272),  // 127.2% 확장 레벨
          fib1000: basePrice * (1 + 1.618), // 161.8% 황금비율 확장
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