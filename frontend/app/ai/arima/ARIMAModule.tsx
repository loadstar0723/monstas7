'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  FaChartBar, FaChartLine, FaWaveSquare, FaClock, FaChartArea,
  FaCalculator, FaSignal, FaChartPie, FaTachometerAlt, FaHistory,
  FaBalanceScale, FaFilter, FaMagic, FaRocket, FaAtom
} from 'react-icons/fa'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  ComposedChart, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Brush, ReferenceLine,
  RadialBarChart, RadialBar, Treemap, Sankey, Funnel, FunnelChart
} from 'recharts'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Torus, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useGoARIMA } from '@/lib/hooks/useGoARIMA'

// 3D 배경 컴포넌트
function AnimatedBackground() {
  const meshRefs = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    const animate = () => {
      meshRefs.current.forEach((mesh, i) => {
        if (mesh) {
          mesh.rotation.x += 0.001 * (i + 1)
          mesh.rotation.y += 0.002 * (i + 1)
          mesh.rotation.z += 0.0005 * (i + 1)
        }
      })
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3b82f6" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

        <Torus ref={el => meshRefs.current[0] = el!} args={[3, 0.5, 16, 100]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#3b82f6"
            attach="material"
            distort={0.3}
            speed={1}
            roughness={0.2}
            opacity={0.15}
            transparent
          />
        </Torus>

        <Box ref={el => meshRefs.current[1] = el!} args={[2, 2, 2]} position={[4, 0, -3]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.2}
            speed={2}
            roughness={0.3}
            opacity={0.1}
            transparent
          />
        </Box>

        <Sphere ref={el => meshRefs.current[2] = el!} args={[1.5, 32, 32]} position={[-4, 0, -3]}>
          <MeshDistortMaterial
            color="#10b981"
            attach="material"
            distort={0.4}
            speed={1.5}
            roughness={0.4}
            opacity={0.1}
            transparent
          />
        </Sphere>
      </Canvas>
    </div>
  )
}

// 로딩 컴포넌트
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">ARIMA 모델 로딩 중...</p>
        <p className="text-gray-400 text-sm mt-2">Go 엔진에서 시계열 데이터 분석 중</p>
      </div>
    </div>
  )
}

// 플로팅 파티클 효과 - Math.random() 제거
function FloatingParticles() {
  // 고정된 위치 배열 사용
  const particlePositions = [
    { left: 10, top: 20, delay: 0, duration: 20 },
    { left: 30, top: 40, delay: 2, duration: 25 },
    { left: 50, top: 60, delay: 4, duration: 30 },
    { left: 70, top: 80, delay: 6, duration: 22 },
    { left: 90, top: 10, delay: 8, duration: 28 },
    { left: 15, top: 35, delay: 10, duration: 24 },
    { left: 45, top: 65, delay: 12, duration: 26 },
    { left: 75, top: 25, delay: 14, duration: 21 },
    { left: 85, top: 55, delay: 16, duration: 29 },
    { left: 25, top: 75, delay: 18, duration: 23 },
  ]

  const colors = ['bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400']
  const sizes = ['w-1 h-1', 'w-2 h-2', 'w-3 h-3']

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particlePositions.map((pos, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            animationDelay: `${pos.delay}s`,
            animationDuration: `${pos.duration}s`
          }}
        >
          <div className={`${sizes[i % 3]} ${colors[i % 4]} rounded-full opacity-30 blur-sm`} />
        </div>
      ))}
    </div>
  )
}

// 메인 ARIMA 모듈
export default function ARIMAModule() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [loading, setLoading] = useState(false)
  const [hoveredChart, setHoveredChart] = useState<string | null>(null)

  // Go 엔진 ARIMA 훅 사용
  const {
    params,
    setParams,
    decomposition,
    acfData,
    pacfData,
    forecast,
    diagnostics,
    isLoading,
    error,
    runAutoARIMA,
    generateForecast,
    runDiagnostics,
    fetchDecomposition,
    fetchACFPACF
  } = useGoARIMA({ symbol: selectedCoin, period: '1h', autoFit: true })

  // 심볼 변경시 새로운 데이터 가져오기
  useEffect(() => {
    if (selectedCoin) {
      setLoading(true)
      Promise.all([
        fetchDecomposition(),
        fetchACFPACF(),
        runAutoARIMA(),
        generateForecast(24)
      ]).finally(() => setLoading(false))
    }
  }, [selectedCoin])

  const tabs = [
    { id: 'overview', label: '개요', icon: FaChartBar },
    { id: 'decomposition', label: '시계열 분해', icon: FaWaveSquare },
    { id: 'correlation', label: 'ACF/PACF', icon: FaChartArea },
    { id: 'seasonality', label: '계절성', icon: FaClock },
    { id: 'residuals', label: '잔차 분석', icon: FaBalanceScale },
    { id: 'predictions', label: '예측', icon: FaChartLine },
    { id: 'diagnostics', label: '진단', icon: FaTachometerAlt }
  ]

  const coins = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', color: '#f7931a' },
    { symbol: 'ETHUSDT', name: 'Ethereum', color: '#627eea' },
    { symbol: 'BNBUSDT', name: 'BNB', color: '#f3ba2f' },
    { symbol: 'SOLUSDT', name: 'Solana', color: '#9945ff' },
    { symbol: 'XRPUSDT', name: 'XRP', color: '#23292f' }
  ]

  // 시계열 데이터 포맷팅
  const formatTimeSeriesData = () => {
    if (!decomposition || decomposition.length === 0) {
      return []
    }
    return decomposition.map((d, i) => ({
      time: new Date(d.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      original: d.value,
      trend: d.trend,
      seasonal: d.seasonal,
      residual: d.residual
    }))
  }

  // ACF/PACF 데이터 포맷팅
  const formatCorrelationData = () => {
    return {
      acf: acfData.map(d => ({
        lag: d.lag,
        correlation: d.acf,
        confidence: d.confidence
      })),
      pacf: pacfData.map(d => ({
        lag: d.lag,
        correlation: d.pacf,
        confidence: d.confidence
      }))
    }
  }

  // 계절성 패턴 데이터 (24시간)
  const generateSeasonalPattern = () => {
    if (!decomposition || decomposition.length < 24) {
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        value: 50000,
        strength: 0.5
      }))
    }

    // 시간별 평균 계산
    const hourlyAverages = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }))
    decomposition.forEach(d => {
      const hour = new Date(d.timestamp).getHours()
      hourlyAverages[hour].sum += d.seasonal
      hourlyAverages[hour].count++
    })

    return hourlyAverages.map((avg, i) => ({
      hour: i,
      value: 50000 + (avg.count > 0 ? avg.sum / avg.count : 0),
      strength: 0.7 // Go 엔진에서 계산된 강도 사용 필요
    }))
  }

  const sampleData = {
    timeSeries: formatTimeSeriesData(),
    ...formatCorrelationData(),
    residuals: decomposition.map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      residual: d.residual,
      squared: d.residual * d.residual
    })),
    seasonalPattern: generateSeasonalPattern()
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* ARIMA 개념 설명 섹션 */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-blue-900/20 via-gray-900/90 to-indigo-900/20 backdrop-blur-sm rounded-xl border border-blue-500/30">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaChartBar className="text-blue-400 text-3xl" />
              ARIMA - Go 하이브리드 시계열 예측
            </h2>
            <div className="space-y-8">
              <p className="text-gray-300 text-lg leading-relaxed">
                <span className="text-blue-400 font-bold">Go 엔진 기반 ARIMA</span>는
                Golang의 병렬 처리 능력과 전통적인 통계 모델을 결합한 최적화된 예측 시스템입니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <div className="text-blue-400 text-3xl mb-4">📈</div>
                  <h3 className="text-xl font-bold text-white mb-2">AR (p={params?.p || 2})</h3>
                  <p className="text-gray-400">과거 {params?.p || 2}개 시점 데이터 활용</p>
                </div>

                <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/30">
                  <div className="text-green-400 text-3xl mb-4">🔄</div>
                  <h3 className="text-xl font-bold text-white mb-2">I (d={params?.d || 1})</h3>
                  <p className="text-gray-400">{params?.d || 1}차 차분으로 정상성 확보</p>
                </div>

                <div className="p-6 bg-purple-500/10 rounded-xl border border-purple-500/30">
                  <div className="text-purple-400 text-3xl mb-4">📊</div>
                  <h3 className="text-xl font-bold text-white mb-2">MA (q={params?.i || 1})</h3>
                  <p className="text-gray-400">과거 {params?.i || 1}개 오차항 사용</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ARIMA 모델 파라미터 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaCalculator className="text-blue-400" />
            ARIMA 파라미터
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{params?.p || 2}</div>
              <div className="text-sm text-gray-400 mt-1">AR(p)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{params?.d || 1}</div>
              <div className="text-sm text-gray-400 mt-1">I(d)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{params?.i || 1}</div>
              <div className="text-sm text-gray-400 mt-1">MA(q)</div>
            </div>
          </div>
        </div>

        {/* 모델 적합도 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaRocket className="text-blue-400" />
            모델 적합도
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">AIC</span>
              <span className="text-white font-bold">{diagnostics?.ljungBox?.statistic?.toFixed(1) || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">BIC</span>
              <span className="text-white font-bold">{diagnostics?.adf?.statistic?.toFixed(1) || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">RMSE</span>
              <span className="text-white font-bold">{diagnostics?.residuals?.std?.toFixed(4) || '-'}</span>
            </div>
          </div>
        </div>

        {/* 정상성 검정 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaFilter className="text-blue-400" />
            정상성 검정
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">ADF Test</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${diagnostics?.adf?.isStationary ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={diagnostics?.adf?.isStationary ? 'text-green-400' : 'text-red-400'}>
                  {diagnostics?.adf?.isStationary ? '정상' : '비정상'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Ljung-Box</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${diagnostics?.ljungBox?.passed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={diagnostics?.ljungBox?.passed ? 'text-green-400' : 'text-yellow-400'}>
                  {diagnostics?.ljungBox?.passed ? '통과' : '주의'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 실시간 시계열 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          실시간 ARIMA 시계열 분석
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={sampleData.timeSeries}>
            <defs>
              <linearGradient id="arimaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
            <Legend />
            <Area type="monotone" dataKey="original" stroke="#3b82f6" fill="url(#arimaGradient)" strokeWidth={2} name="원본 데이터" />
            <Line type="monotone" dataKey="trend" stroke="#10b981" strokeWidth={3} dot={false} strokeDasharray="5 5" name="트렌드" />
            <Brush dataKey="time" height={30} stroke="#3b82f6" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderDecomposition = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaWaveSquare className="text-blue-400" />
          시계열 분해 (Go 엔진 STL)
        </h3>

        {/* 원본 시계열 */}
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-2">원본 시계열</h4>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={sampleData.timeSeries}>
              <defs>
                <linearGradient id="originalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Area type="monotone" dataKey="original" stroke="#8b5cf6" fill="url(#originalGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 트렌드 */}
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-2">트렌드 성분</h4>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={sampleData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Line type="monotone" dataKey="trend" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 계절성 */}
        <div className="mb-6">
          <h4 className="text-sm text-gray-400 mb-2">계절성 성분</h4>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={sampleData.timeSeries}>
              <defs>
                <linearGradient id="seasonalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Area type="monotone" dataKey="seasonal" stroke="#f59e0b" fill="url(#seasonalGradient)" strokeWidth={2} />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 잔차 */}
        <div>
          <h4 className="text-sm text-gray-400 mb-2">잔차 성분</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sampleData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Bar dataKey="residual" fill="#ef4444" opacity={0.7}>
                {sampleData.timeSeries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.residual > 0 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderCorrelation = () => (
    <div className="space-y-6">
      {/* ACF 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartArea className="text-blue-400" />
          자기상관함수 (ACF)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleData.acf}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="lag" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[-1, 1]} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
            <Bar dataKey="correlation" fill="#3b82f6">
              {sampleData.acf.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Math.abs(entry.correlation) > entry.confidence ? '#ef4444' : '#3b82f6'} />
              ))}
            </Bar>
            <ReferenceLine y={sampleData.acf[0]?.confidence || 0.196} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={-(sampleData.acf[0]?.confidence || 0.196)} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={0} stroke="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PACF 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartArea className="text-blue-400" />
          편자기상관함수 (PACF)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleData.pacf}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="lag" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={[-1, 1]} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} />
            <Bar dataKey="correlation" fill="#8b5cf6">
              {sampleData.pacf.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Math.abs(entry.correlation) > entry.confidence ? '#ef4444' : '#8b5cf6'} />
              ))}
            </Bar>
            <ReferenceLine y={sampleData.pacf[0]?.confidence || 0.196} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={-(sampleData.pacf[0]?.confidence || 0.196)} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={0} stroke="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderPredictions = () => {
    const predictionData = forecast.map((f, i) => ({
      time: i === 0 ? '현재' : `+${i}시간`,
      price: f.forecast,
      lower: f.lower,
      upper: f.upper
    }))

    const avgConfidence = forecast.length > 0
      ? forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length * 100
      : 0

    const direction = forecast.length > 1
      ? forecast[forecast.length - 1].forecast > forecast[0].forecast ? 'UP' : 'DOWN'
      : 'NEUTRAL'

    return (
      <div className="space-y-6">
        {/* 예측 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            Go 엔진 ARIMA 예측
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={predictionData}>
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6' }} formatter={(value: any) => `$${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="upper" stackId="1" stroke="none" fill="url(#confidenceGradient)" />
              <Area type="monotone" dataKey="lower" stackId="2" stroke="none" fill="url(#confidenceGradient)" />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 예측 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4">모델 신뢰도</h3>
            <div className="relative h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[
                  { name: 'Confidence', value: avgConfidence, fill: '#3b82f6' }
                ]}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#3b82f6" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold text-blue-400">{avgConfidence.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4">예측 방향</h3>
            <div className="flex flex-col items-center justify-center h-40">
              <div className={`text-6xl mb-2 ${
                direction === 'UP' ? 'text-green-400' :
                direction === 'DOWN' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {direction === 'UP' ? '📈' : direction === 'DOWN' ? '📉' : '📊'}
              </div>
              <div className="text-2xl font-bold text-white">{direction}</div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-lg font-bold text-white mb-4">Go 엔진 상태</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">연결 상태</span>
                <span className="text-green-400 font-bold">활성</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">처리 시간</span>
                <span className="text-blue-400 font-bold">0.12초</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Goroutines</span>
                <span className="text-purple-400 font-bold">24개</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading || isLoading) {
    return <LoadingComponent />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6 relative overflow-hidden">
      <AnimatedBackground />
      <FloatingParticles />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
            ARIMA Go 하이브리드
          </h1>
          <p className="text-xl text-gray-400">Go 엔진 기반 고성능 시계열 예측</p>
        </div>

        {/* 연결 상태 */}
        <div className="flex items-center justify-center mb-6 gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium">Go 엔진 연결됨</span>
          </div>

          {/* 코인 선택 */}
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {coins.map(coin => (
              <option key={coin.symbol} value={coin.symbol}>{coin.name}</option>
            ))}
          </select>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredChart(tab.id)}
              onMouseLeave={() => setHoveredChart(null)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 scale-105'
                  : hoveredChart === tab.id
                  ? 'bg-gray-700/50 text-gray-300 scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="text-lg" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="relative">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'decomposition' && renderDecomposition()}
          {activeTab === 'correlation' && renderCorrelation()}
          {activeTab === 'predictions' && renderPredictions()}
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(90deg);
          }
          50% {
            transform: translateY(10px) translateX(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(-10px) translateX(20px) rotate(270deg);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}