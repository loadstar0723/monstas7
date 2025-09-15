'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChartArea, FaPercentage, FaBell, FaFire, FaChartLine, FaClock } from 'react-icons/fa'
import { GiGreekTemple, GiPayMoney, GiChart } from 'react-icons/gi'
import { MdShowChart, MdTrendingUp } from 'react-icons/md'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  RadialBarChart, RadialBar, Treemap, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, ComposedChart, ReferenceLine, ReferenceArea
} from 'recharts'
import * as THREE from 'three'

interface OptionData {
  strike: number
  expiry: string
  
  // Call 옵션 데이터
  callBid: number
  callAsk: number
  callLast: number
  callVolume: number
  callOI: number // Open Interest
  callIV: number // Implied Volatility
  callDelta: number
  callGamma: number
  callTheta: number
  callVega: number
  
  // Put 옵션 데이터
  putBid: number
  putAsk: number
  putLast: number
  putVolume: number
  putOI: number
  putIV: number
  putDelta: number
  putGamma: number
  putTheta: number
  putVega: number
}

interface VolatilitySmile {
  strike: number
  callIV: number
  putIV: number
  atmIV: number
  skew: number
}

interface GammaExposure {
  strike: number
  netGamma: number
  callGamma: number
  putGamma: number
  dealerGamma: number
}

interface OptionsFlow {
  timestamp: number
  type: 'call' | 'put'
  strike: number
  expiry: string
  premium: number
  volume: number
  size: 'small' | 'medium' | 'large' | 'unusual'
  sentiment: 'bullish' | 'bearish' | 'neutral'
  isBlock: boolean
  isSweep: boolean
}

interface MaxPain {
  strike: number
  totalPain: number
  callPain: number
  putPain: number
  expiry: string
}

interface MarketMakerPosition {
  strike: number
  netDelta: number
  netGamma: number
  hedgingRequired: number
  direction: 'long' | 'short' | 'neutral'
}

interface Props {
  symbol: string
  spotPrice: number
  onFlowAlert?: (alert: any) => void
  includeGreeks?: boolean
  include3DVolSurface?: boolean
}

export default function OptionsMarketAnalysis({
  symbol,
  spotPrice,
  onFlowAlert,
  includeGreeks = true,
  include3DVolSurface = true
}: Props) {
  const [optionsChain, setOptionsChain] = useState<OptionData[]>([])
  const [volatilitySmile, setVolatilitySmile] = useState<VolatilitySmile[]>([])
  const [gammaExposure, setGammaExposure] = useState<GammaExposure[]>([])
  const [optionsFlow, setOptionsFlow] = useState<OptionsFlow[]>([])
  const [maxPainData, setMaxPainData] = useState<MaxPain[]>([])
  const [marketMakerPositions, setMarketMakerPositions] = useState<MarketMakerPosition[]>([])
  const [selectedExpiry, setSelectedExpiry] = useState<string>('2024-01-26')
  const [putCallRatio, setPutCallRatio] = useState<number>(0)
  const [ivRank, setIvRank] = useState<number>(0)
  const [alerts, setAlerts] = useState<any[]>([])
  
  const vol3DCanvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)

  // 옵션 데이터 가져오기
  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        // 실제로는 Deribit, CME, Binance Options API 사용
        const chainData = generateMockOptionsChain()
        setOptionsChain(chainData)
        
        // 변동성 스마일 계산
        const smile = calculateVolatilitySmile(chainData)
        setVolatilitySmile(smile)
        
        // 감마 익스포저 계산
        const gamma = calculateGammaExposure(chainData, spotPrice)
        setGammaExposure(gamma)
        
        // Max Pain 계산
        const maxPain = calculateMaxPain(chainData, spotPrice)
        setMaxPainData(maxPain)
        
        // 마켓 메이커 포지션 분석
        const mmPositions = analyzeMarketMakerPositions(chainData)
        setMarketMakerPositions(mmPositions)
        
        // Put/Call 비율
        const pcRatio = calculatePutCallRatio(chainData)
        setPutCallRatio(pcRatio)
        
        // IV Rank
        const rank = calculateIVRank(chainData)
        setIvRank(rank)
        
      } catch (error) {
        console.error('Error fetching options data:', error)
      }
    }

    fetchOptionsData()
    const interval = setInterval(fetchOptionsData, 60000) // 1분마다

    return () => clearInterval(interval)
  }, [symbol, selectedExpiry, spotPrice])

  // 옵션 플로우 실시간 모니터링
  useEffect(() => {
    const monitorOptionsFlow = () => {
      // 실시간 옵션 플로우 시뮬레이션
      const newFlow = generateMockOptionsFlow()
      setOptionsFlow(prev => [newFlow, ...prev.slice(0, 99)])
      
      // 비정상적인 플로우 감지
      if (newFlow.size === 'unusual' || newFlow.premium > 1000000) {
        const alert = {
          type: 'unusual_flow',
          message: `대규모 ${newFlow.type} 옵션 매수: ${newFlow.strike} 행사가, $${(newFlow.premium / 1000).toFixed(0)}K`,
          severity: newFlow.premium > 5000000 ? 'high' : 'medium',
          timestamp: Date.now()
        }
        setAlerts(prev => [alert, ...prev.slice(0, 9)])
        if (onFlowAlert) onFlowAlert(alert)
      }
    }

    const flowInterval = setInterval(monitorOptionsFlow, 5000) // 5초마다
    return () => clearInterval(flowInterval)
  }, [onFlowAlert])

  // 3D 변동성 곡면 렌더링
  useEffect(() => {
    if (!include3DVolSurface || !vol3DCanvasRef.current) return

    // Three.js 초기화
    const canvas = vol3DCanvasRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    )
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // 변동성 곡면 생성
    const geometry = new THREE.PlaneGeometry(10, 10, 50, 50)
    const material = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      side: THREE.DoubleSide
    })

    // 변동성 곡면 변형
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const volatility = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 2 + Math.random() * 0.5
      positions.setZ(i, volatility)
    }

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    sceneRef.current = scene
    rendererRef.current = renderer

    // 애니메이션
    const animate = () => {
      requestAnimationFrame(animate)
      mesh.rotation.z += 0.002
      renderer.render(scene, camera)
    }
    animate()

    // 리사이즈 핸들러
    const handleResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [include3DVolSurface])

  // 모의 옵션 체인 생성
  const generateMockOptionsChain = (): OptionData[] => {
    const strikes = []
    const basePrice = spotPrice
    
    // 행사가 생성 (현물가 대비 -20% ~ +20%)
    for (let i = -10; i <= 10; i++) {
      const strike = Math.round(basePrice * (1 + i * 0.02))
      const moneyness = strike / basePrice
      const baseIV = 50 + Math.abs(i) * 2 // ATM에서 멀어질수록 IV 증가
      
      strikes.push({
        strike,
        expiry: selectedExpiry,
        
        // Call 옵션
        callBid: Math.max(0, basePrice - strike) + Math.random() * 50,
        callAsk: Math.max(0, basePrice - strike) + Math.random() * 50 + 10,
        callLast: Math.max(0, basePrice - strike) + Math.random() * 50 + 5,
        callVolume: Math.floor(Math.random() * 10000),
        callOI: Math.floor(Math.random() * 50000),
        callIV: baseIV + Math.random() * 10,
        callDelta: Math.max(0, 1 - Math.exp(-Math.max(0, basePrice - strike) / 1000)),
        callGamma: Math.exp(-Math.pow(moneyness - 1, 2) * 10) * 0.01,
        callTheta: -Math.random() * 50,
        callVega: Math.random() * 100,
        
        // Put 옵션
        putBid: Math.max(0, strike - basePrice) + Math.random() * 50,
        putAsk: Math.max(0, strike - basePrice) + Math.random() * 50 + 10,
        putLast: Math.max(0, strike - basePrice) + Math.random() * 50 + 5,
        putVolume: Math.floor(Math.random() * 10000),
        putOI: Math.floor(Math.random() * 50000),
        putIV: baseIV + Math.random() * 10,
        putDelta: -Math.max(0, Math.exp(-Math.max(0, strike - basePrice) / 1000)),
        putGamma: Math.exp(-Math.pow(moneyness - 1, 2) * 10) * 0.01,
        putTheta: -Math.random() * 50,
        putVega: Math.random() * 100
      })
    }
    
    return strikes
  }

  // 변동성 스마일 계산
  const calculateVolatilitySmile = (chain: OptionData[]): VolatilitySmile[] => {
    const atmStrike = chain.reduce((closest, option) => 
      Math.abs(option.strike - spotPrice) < Math.abs(closest.strike - spotPrice) ? option : closest
    ).strike
    
    return chain.map(option => ({
      strike: option.strike,
      callIV: option.callIV,
      putIV: option.putIV,
      atmIV: chain.find(o => o.strike === atmStrike)?.callIV || 50,
      skew: option.putIV - option.callIV
    }))
  }

  // 감마 익스포저 계산
  const calculateGammaExposure = (chain: OptionData[], spot: number): GammaExposure[] => {
    return chain.map(option => {
      const callGammaExposure = option.callGamma * option.callOI * 100 * spot
      const putGammaExposure = option.putGamma * option.putOI * 100 * spot
      const netGamma = callGammaExposure - putGammaExposure
      
      return {
        strike: option.strike,
        netGamma,
        callGamma: callGammaExposure,
        putGamma: putGammaExposure,
        dealerGamma: -netGamma // 딜러는 반대 포지션
      }
    })
  }

  // Max Pain 계산
  const calculateMaxPain = (chain: OptionData[], spot: number): MaxPain[] => {
    return chain.map(strikeOption => {
      let totalCallPain = 0
      let totalPutPain = 0
      
      chain.forEach(option => {
        if (strikeOption.strike > option.strike) {
          // ITM Calls
          totalCallPain += (strikeOption.strike - option.strike) * option.callOI
        }
        if (strikeOption.strike < option.strike) {
          // ITM Puts
          totalPutPain += (option.strike - strikeOption.strike) * option.putOI
        }
      })
      
      return {
        strike: strikeOption.strike,
        totalPain: totalCallPain + totalPutPain,
        callPain: totalCallPain,
        putPain: totalPutPain,
        expiry: selectedExpiry
      }
    })
  }

  // 마켓 메이커 포지션 분석
  const analyzeMarketMakerPositions = (chain: OptionData[]): MarketMakerPosition[] => {
    return chain.map(option => {
      const netDelta = (option.callDelta * option.callOI - option.putDelta * option.putOI) * 100
      const netGamma = (option.callGamma * option.callOI - option.putGamma * option.putOI) * 100
      
      return {
        strike: option.strike,
        netDelta,
        netGamma,
        hedgingRequired: Math.abs(netDelta),
        direction: netDelta > 1000 ? 'long' : netDelta < -1000 ? 'short' : 'neutral'
      }
    })
  }

  // Put/Call 비율 계산
  const calculatePutCallRatio = (chain: OptionData[]): number => {
    const totalPutVolume = chain.reduce((sum, opt) => sum + opt.putVolume, 0)
    const totalCallVolume = chain.reduce((sum, opt) => sum + opt.callVolume, 0)
    return totalCallVolume > 0 ? totalPutVolume / totalCallVolume : 0
  }

  // IV Rank 계산
  const calculateIVRank = (chain: OptionData[]): number => {
    const atmOption = chain.reduce((closest, option) => 
      Math.abs(option.strike - spotPrice) < Math.abs(closest.strike - spotPrice) ? option : closest
    )
    // 52주 IV 레인지 시뮬레이션
    const iv52WeekHigh = 80
    const iv52WeekLow = 20
    const currentIV = atmOption.callIV
    return ((currentIV - iv52WeekLow) / (iv52WeekHigh - iv52WeekLow)) * 100
  }

  // 모의 옵션 플로우 생성
  const generateMockOptionsFlow = (): OptionsFlow => {
    const strikes = optionsChain.map(o => o.strike)
    const strike = strikes[Math.floor(Math.random() * strikes.length)]
    const isCall = Math.random() > 0.5
    const premium = Math.random() * 1000000 + 10000
    
    return {
      timestamp: Date.now(),
      type: isCall ? 'call' : 'put',
      strike,
      expiry: selectedExpiry,
      premium,
      volume: Math.floor(premium / 100),
      size: premium > 5000000 ? 'unusual' : premium > 1000000 ? 'large' : premium > 100000 ? 'medium' : 'small',
      sentiment: isCall ? 'bullish' : 'bearish',
      isBlock: Math.random() > 0.8,
      isSweep: Math.random() > 0.9
    }
  }

  // 색상 함수
  const getHeatmapColor = (value: number, max: number): string => {
    const intensity = Math.abs(value) / max
    if (value > 0) {
      return `rgba(34, 197, 94, ${intensity})`
    } else {
      return `rgba(239, 68, 68, ${intensity})`
    }
  }

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899']

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-6 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <GiGreekTemple className="text-purple-400" />
            옵션 시장 분석
          </h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="2024-01-26">1월 26일</option>
              <option value="2024-02-02">2월 2일</option>
              <option value="2024-02-09">2월 9일</option>
              <option value="2024-03-29">3월 29일</option>
            </select>
            <div className="text-white">
              현물가: <span className="font-bold text-yellow-400">${spotPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">Put/Call 비율</div>
            <div className={`text-xl font-bold ${
              putCallRatio > 1.2 ? 'text-red-400' : putCallRatio < 0.8 ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {putCallRatio.toFixed(2)}
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">IV Rank</div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-purple-400">{ivRank.toFixed(0)}%</div>
              <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-red-500"
                  style={{ width: `${ivRank}%` }}
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">Max Pain</div>
            <div className="text-xl font-bold text-blue-400">
              ${maxPainData.length > 0 ? 
                maxPainData.reduce((min, d) => d.totalPain < min.totalPain ? d : min).strike.toFixed(0) :
                '계산중...'
              }
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-gray-800/50 rounded-lg"
          >
            <div className="text-gray-400 text-sm mb-1">Net Gamma</div>
            <div className={`text-xl font-bold ${
              gammaExposure.reduce((sum, g) => sum + g.netGamma, 0) > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${(Math.abs(gammaExposure.reduce((sum, g) => sum + g.netGamma, 0)) / 1000000).toFixed(1)}M
            </div>
          </motion.div>
        </div>
      </div>

      {/* 실시간 알림 */}
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert, index) => (
          <motion.div
            key={`${alert.timestamp}-${index}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              alert.severity === 'high' ? 'bg-red-900/30 border-red-500' :
              'bg-yellow-900/30 border-yellow-500'
            }`}
          >
            <FaBell className={alert.severity === 'high' ? 'text-red-500' : 'text-yellow-500'} />
            <span className="text-white text-sm">{alert.message}</span>
            <span className="text-gray-400 text-xs ml-auto">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 변동성 스마일 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MdShowChart className="text-purple-400" />
          변동성 스마일 (Volatility Smile)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={volatilitySmile}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="strike" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" label={{ value: 'IV (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Legend />
            <ReferenceLine x={spotPrice} stroke="#F59E0B" strokeDasharray="5 5" label="현물가" />
            
            <Line 
              type="monotone" 
              dataKey="callIV" 
              stroke="#10B981" 
              strokeWidth={2} 
              dot={false}
              name="Call IV"
            />
            <Line 
              type="monotone" 
              dataKey="putIV" 
              stroke="#EF4444" 
              strokeWidth={2} 
              dot={false}
              name="Put IV"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 감마 익스포저 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <GiChart className="text-yellow-400" />
          감마 익스포저 (Gamma Exposure)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gammaExposure}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="strike" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`}
            />
            <Legend />
            <ReferenceLine x={spotPrice} stroke="#F59E0B" strokeDasharray="5 5" />
            <ReferenceLine y={0} stroke="#6B7280" />
            
            <Bar dataKey="netGamma" name="Net Gamma">
              {gammaExposure.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.netGamma > 0 ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Max Pain 차트 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaFire className="text-red-400" />
          Max Pain 분석
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={maxPainData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="strike" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
              labelStyle={{ color: '#9CA3AF' }}
              formatter={(value: any) => `$${(value / 1000000).toFixed(2)}M`}
            />
            <Legend />
            <ReferenceLine x={spotPrice} stroke="#F59E0B" strokeDasharray="5 5" label="현물가" />
            
            <Area
              type="monotone"
              dataKey="totalPain"
              fill="#8B5CF6"
              fillOpacity={0.3}
              stroke="#8B5CF6"
              strokeWidth={2}
              name="Total Pain"
            />
            <Line
              type="monotone"
              dataKey="callPain"
              stroke="#10B981"
              strokeWidth={1}
              dot={false}
              name="Call Pain"
            />
            <Line
              type="monotone"
              dataKey="putPain"
              stroke="#EF4444"
              strokeWidth={1}
              dot={false}
              name="Put Pain"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 3D 변동성 곡면 */}
      {include3DVolSurface && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartArea className="text-indigo-400" />
            3D 변동성 곡면 (Volatility Surface)
          </h4>
          <div className="relative h-[400px]">
            <canvas
              ref={vol3DCanvasRef}
              className="w-full h-full rounded-lg"
            />
            <div className="absolute bottom-4 left-4 bg-gray-900/80 p-2 rounded text-xs text-gray-300">
              <div>X축: 행사가</div>
              <div>Y축: 만기일</div>
              <div>Z축: 내재변동성</div>
            </div>
          </div>
        </div>
      )}

      {/* 옵션 플로우 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <MdTrendingUp className="text-green-400" />
          실시간 옵션 플로우
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">시간</th>
                <th className="text-left p-2">타입</th>
                <th className="text-right p-2">행사가</th>
                <th className="text-right p-2">프리미엄</th>
                <th className="text-right p-2">거래량</th>
                <th className="text-left p-2">사이즈</th>
                <th className="text-left p-2">특징</th>
              </tr>
            </thead>
            <tbody>
              {optionsFlow.slice(0, 10).map((flow, index) => (
                <motion.tr
                  key={`${flow.timestamp}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30"
                >
                  <td className="p-2 text-gray-300">
                    {new Date(flow.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      flow.type === 'call' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {flow.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-right p-2 text-white">${flow.strike}</td>
                  <td className="text-right p-2 text-white font-semibold">
                    ${(flow.premium / 1000).toFixed(0)}K
                  </td>
                  <td className="text-right p-2 text-gray-300">{flow.volume.toLocaleString()}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      flow.size === 'unusual' ? 'bg-purple-500/20 text-purple-400' :
                      flow.size === 'large' ? 'bg-blue-500/20 text-blue-400' :
                      flow.size === 'medium' ? 'bg-gray-500/20 text-gray-400' :
                      'text-gray-500'
                    }`}>
                      {flow.size}
                    </span>
                  </td>
                  <td className="p-2 text-xs">
                    {flow.isBlock && <span className="text-yellow-400 mr-2">BLOCK</span>}
                    {flow.isSweep && <span className="text-purple-400">SWEEP</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 마켓 메이커 포지션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <GiPayMoney className="text-blue-400" />
            마켓 메이커 델타 헤징
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="strike" stroke="#9CA3AF" />
              <YAxis dataKey="netDelta" stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <ReferenceLine x={spotPrice} stroke="#F59E0B" strokeDasharray="5 5" />
              <ReferenceLine y={0} stroke="#6B7280" />
              
              <Scatter
                name="Net Delta"
                data={marketMakerPositions}
                fill="#8B5CF6"
              >
                {marketMakerPositions.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.direction === 'long' ? '#10B981' : 
                          entry.direction === 'short' ? '#EF4444' : '#6B7280'} 
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 그릭스 히트맵 */}
        {includeGreeks && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaPercentage className="text-pink-400" />
              그릭스 히트맵
            </h4>
            <div className="grid grid-cols-5 gap-1 text-xs">
              <div className="text-gray-400 p-1">행사가</div>
              <div className="text-gray-400 p-1 text-center">Delta</div>
              <div className="text-gray-400 p-1 text-center">Gamma</div>
              <div className="text-gray-400 p-1 text-center">Theta</div>
              <div className="text-gray-400 p-1 text-center">Vega</div>
              
              {optionsChain.slice(5, 15).map((option) => (
                <React.Fragment key={option.strike}>
                  <div className="text-white p-1">${option.strike}</div>
                  <div 
                    className="p-1 text-center text-white"
                    style={{ 
                      backgroundColor: getHeatmapColor(
                        option.callDelta - option.putDelta, 
                        1
                      ) 
                    }}
                  >
                    {(option.callDelta - option.putDelta).toFixed(2)}
                  </div>
                  <div 
                    className="p-1 text-center text-white"
                    style={{ 
                      backgroundColor: getHeatmapColor(
                        option.callGamma + option.putGamma, 
                        0.02
                      ) 
                    }}
                  >
                    {((option.callGamma + option.putGamma) * 100).toFixed(1)}
                  </div>
                  <div 
                    className="p-1 text-center text-white"
                    style={{ 
                      backgroundColor: `rgba(239, 68, 68, ${Math.abs(option.callTheta + option.putTheta) / 100})` 
                    }}
                  >
                    {(option.callTheta + option.putTheta).toFixed(0)}
                  </div>
                  <div 
                    className="p-1 text-center text-white"
                    style={{ 
                      backgroundColor: `rgba(139, 92, 246, ${(option.callVega + option.putVega) / 200})` 
                    }}
                  >
                    {((option.callVega + option.putVega) / 2).toFixed(0)}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 옵션 체인 테이블 */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-green-400" />
          옵션 체인
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th colSpan={6} className="text-center p-2 text-green-400">CALLS</th>
                <th className="p-2 bg-gray-700/50">행사가</th>
                <th colSpan={6} className="text-center p-2 text-red-400">PUTS</th>
              </tr>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-right p-1">OI</th>
                <th className="text-right p-1">Vol</th>
                <th className="text-right p-1">IV</th>
                <th className="text-right p-1">Bid</th>
                <th className="text-right p-1">Ask</th>
                <th className="text-right p-1">Last</th>
                <th className="p-1 bg-gray-700/50">Strike</th>
                <th className="text-right p-1">Last</th>
                <th className="text-right p-1">Ask</th>
                <th className="text-right p-1">Bid</th>
                <th className="text-right p-1">IV</th>
                <th className="text-right p-1">Vol</th>
                <th className="text-right p-1">OI</th>
              </tr>
            </thead>
            <tbody>
              {optionsChain.map((option) => (
                <tr 
                  key={option.strike} 
                  className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${
                    Math.abs(option.strike - spotPrice) < 100 ? 'bg-purple-900/20' : ''
                  }`}
                >
                  {/* Call Side */}
                  <td className="text-right p-1 text-gray-300">{option.callOI.toLocaleString()}</td>
                  <td className="text-right p-1 text-gray-300">{option.callVolume.toLocaleString()}</td>
                  <td className="text-right p-1 text-green-400">{option.callIV.toFixed(1)}%</td>
                  <td className="text-right p-1 text-white">{option.callBid.toFixed(2)}</td>
                  <td className="text-right p-1 text-white">{option.callAsk.toFixed(2)}</td>
                  <td className="text-right p-1 text-white font-semibold">{option.callLast.toFixed(2)}</td>
                  
                  {/* Strike */}
                  <td className={`text-center p-1 font-bold bg-gray-700/50 ${
                    option.strike === spotPrice ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {option.strike}
                  </td>
                  
                  {/* Put Side */}
                  <td className="text-right p-1 text-white font-semibold">{option.putLast.toFixed(2)}</td>
                  <td className="text-right p-1 text-white">{option.putAsk.toFixed(2)}</td>
                  <td className="text-right p-1 text-white">{option.putBid.toFixed(2)}</td>
                  <td className="text-right p-1 text-red-400">{option.putIV.toFixed(1)}%</td>
                  <td className="text-right p-1 text-gray-300">{option.putVolume.toLocaleString()}</td>
                  <td className="text-right p-1 text-gray-300">{option.putOI.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}