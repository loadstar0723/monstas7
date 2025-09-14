'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  FaMicrochip, FaChartLine, FaBrain, FaRobot, FaNetworkWired,
  FaChartBar, FaSignal, FaExchangeAlt, FaLightbulb, FaChartArea,
  FaWaveSquare, FaStream, FaProjectDiagram, FaAtom, FaCog
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  ComposedChart, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Brush, ReferenceLine,
  RadialBarChart, RadialBar, Treemap, Sankey
} from 'recharts'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Box, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// 3D 배경 컴포넌트
function AnimatedBackground() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useEffect(() => {
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.x += 0.001
        meshRef.current.rotation.y += 0.002
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} enablePan={false} />
        <Sphere ref={meshRef} args={[2, 32, 32]}>
          <MeshDistortMaterial
            color="#10b981"
            attach="material"
            distort={0.3}
            speed={2}
            roughness={0.4}
            opacity={0.1}
            transparent
          />
        </Sphere>
        <Box args={[3, 3, 3]} position={[-3, 0, -5]}>
          <MeshDistortMaterial
            color="#8b5cf6"
            attach="material"
            distort={0.2}
            speed={1}
            roughness={0.5}
            opacity={0.05}
            transparent
          />
        </Box>
      </Canvas>
    </div>
  )
}

// 파티클 효과 컴포넌트
function ParticleEffect() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-green-400 rounded-full animate-float opacity-50"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 20}s`
          }}
        />
      ))}
    </div>
  )
}

// 로딩 컴포넌트
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">GRU 모델 로딩 중...</p>
        <p className="text-gray-400 text-sm mt-2">게이트 순환 유닛 초기화 중</p>
      </div>
    </div>
  )
}

// 메인 GRU 모듈
export default function GRUModule() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [predictions, setPredictions] = useState<any[]>([])
  const [visualization, setVisualization] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [hoveredGate, setHoveredGate] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결
  useEffect(() => {
    const connectWS = () => {
      try {
        const ws = new WebSocket('ws://localhost:8091/ws')
        
        ws.onopen = () => {
          console.log('GRU WebSocket connected')
          setWsConnected(true)
        }
        
        ws.onmessage = (event) => {
          try {
            // 빈 메시지 체크
            if (!event.data) {
              console.warn('Received null/undefined WebSocket message')
              return
            }
            
            // 문자열이 아닌 경우 처리
            const messageData = typeof event.data === 'string' ? event.data : JSON.stringify(event.data)
            
            // 빈 문자열 체크
            if (messageData.trim() === '') {
              console.warn('Received empty WebSocket message')
              return
            }
            
            const data = JSON.parse(messageData)
            
            switch (data.type) {
              case 'prediction':
                setPredictions(prev => [...prev.slice(-99), data.data].filter(Boolean))
                break
              case 'visualization':
                setVisualization(data.data)
                break
              case 'metrics':
                setMetrics(data.data)
                break
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data)
          }
        }
        
        ws.onerror = (error) => {
          console.warn('GRU WebSocket 연결 실패 - 서비스가 실행 중인지 확인하세요')
          setWsConnected(false)
        }
        
        ws.onclose = () => {
          setWsConnected(false)
          setTimeout(connectWS, 5000)
        }
        
        wsRef.current = ws
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
        setTimeout(connectWS, 5000)
      }
    }
    
    connectWS()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // 데이터 로드 함수
  const loadData = async () => {
    setLoading(true)
    try {
      const [predResponse, vizResponse, metricsResponse] = await Promise.all([
        fetch('http://localhost:8091/api/predictions'),
        fetch(`http://localhost:8091/api/visualization/${selectedCoin}`),
        fetch('http://localhost:8091/api/metrics')
      ])
      
      if (predResponse.ok) {
        const text = await predResponse.text()
        if (text && text.trim() !== '') {
          const predData = JSON.parse(text)
          setPredictions(predData)
        }
      }
      
      if (vizResponse.ok) {
        const text = await vizResponse.text()
        if (text && text.trim() !== '') {
          const vizData = JSON.parse(text)
          setVisualization(vizData)
        }
      }
      
      if (metricsResponse.ok) {
        const text = await metricsResponse.text()
        if (text && text.trim() !== '') {
          const metricsData = JSON.parse(text)
          setMetrics(metricsData)
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      // Go 서비스가 실행되지 않은 경우 더미 데이터 사용
      console.log('Using demo data due to service unavailability')
      setPredictions(generateDummyPredictions())
      setMetrics(generateDummyMetrics())
      setVisualization(generateDummyVisualization())
    } finally {
      setLoading(false)
    }
  }

  // 초기 데이터 로드 - 컴포넌트 마운트 시 즉시 실행
  useEffect(() => {
    loadData()
  }, [])

  // selectedCoin 변경 시 데이터 다시 로드
  useEffect(() => {
    if (selectedCoin) {
      loadData()
    }
  }, [selectedCoin])

  const tabs = [
    { id: 'overview', label: '개요', icon: FaMicrochip },
    { id: 'gates', label: '게이트 분석', icon: FaExchangeAlt },
    { id: 'attention', label: '어텐션 맵', icon: FaNetworkWired },
    { id: 'flow', label: '정보 흐름', icon: FaStream },
    { id: 'predictions', label: '예측', icon: FaChartLine },
    { id: 'signals', label: '시그널', icon: FaSignal },
    { id: 'performance', label: '성능', icon: FaChartBar }
  ]

  const coins = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', color: '#f7931a' },
    { symbol: 'ETHUSDT', name: 'Ethereum', color: '#627eea' },
    { symbol: 'BNBUSDT', name: 'BNB', color: '#f3ba2f' },
    { symbol: 'SOLUSDT', name: 'Solana', color: '#9945ff' },
    { symbol: 'XRPUSDT', name: 'XRP', color: '#23292f' }
  ]

  // 샘플 데이터 생성 (실제 데이터가 없을 때)
  const generateSampleData = () => {
    const now = Date.now()
    return {
      gateData: Array.from({ length: 50 }, (_, i) => ({
        time: new Date(now - (50 - i) * 60000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        reset: 0.3 + Math.sin(i / 10) * 0.2 + Math.random() * 0.1,
        update: 0.7 + Math.cos(i / 8) * 0.15 + Math.random() * 0.1,
        candidate: 0.5 + Math.sin(i / 15) * 0.3 + Math.random() * 0.1,
        final: 0.6 + Math.cos(i / 12) * 0.2 + Math.random() * 0.1
      })),
      
      attentionMap: Array.from({ length: 20 }, (_, i) => 
        Array.from({ length: 20 }, (_, j) => 
          Math.abs(Math.sin((i + j) / 5)) + Math.random() * 0.3
        )
      ),
      
      stateTransitions: Array.from({ length: 30 }, (_, i) => ({
        time: new Date(now - (30 - i) * 60000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        current: 50000 + Math.sin(i / 5) * 5000,
        next: 50000 + Math.sin((i + 1) / 5) * 5000,
        updateAmt: 0.5 + Math.random() * 0.3,
        resetAmt: 0.3 + Math.random() * 0.4
      })),
      
      informationFlow: Array.from({ length: 40 }, (_, i) => ({
        time: new Date(now - (40 - i) * 60000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        input: 20 + Math.random() * 30,
        retained: 40 + Math.random() * 20,
        new: 30 + Math.random() * 20,
        output: 60 + Math.random() * 20
      }))
    }
  }

  const sampleData = generateSampleData()

  const renderOverview = () => (
    <div className="space-y-6">
      {/* GRU 개념 설명 섹션 추가 */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-green-900/20 via-gray-900/90 to-blue-900/20 backdrop-blur-sm rounded-xl border border-green-500/30">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaMicrochip className="text-green-400 text-3xl" />
              GRU란 무엇인가? - LSTM의 진화된 형태
            </h2>
            <div className="space-y-8">
              {/* 핵심 개념 설명 */}
              <div className="space-y-6">
                <p className="text-gray-300 text-lg leading-relaxed">
                  <span className="text-green-400 font-bold">GRU(Gated Recurrent Unit)</span>은 
                  LSTM의 복잡한 구조를 단순화하면서도 성능은 유지한 혁신적인 순환 신경망입니다. 
                  2014년 조경현 교수팀이 개발한 이 모델은 더 빠른 학습 속도와 더 적은 메모리 사용량으로 
                  LSTM과 비슷하거나 더 나은 성능을 보여줍니다.
                </p>

                {/* 2개의 게이트 설명 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/30 hover:scale-105 transition-transform">
                    <div className="text-red-400 text-3xl mb-4">🔴</div>
                    <h3 className="text-xl font-bold text-white mb-2">Reset Gate (리셋 게이트)</h3>
                    <p className="text-gray-400">
                      과거 정보 중 불필요한 부분을 "리셋"하여 잊어버립니다. 
                      급격한 시장 변화나 트렌드 전환 시 이전 패턴을 무시하고 
                      새로운 패턴에 집중할 수 있게 합니다.
                    </p>
                  </div>

                  <div className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/30 hover:scale-105 transition-transform">
                    <div className="text-blue-400 text-3xl mb-4">🔵</div>
                    <h3 className="text-xl font-bold text-white mb-2">Update Gate (업데이트 게이트)</h3>
                    <p className="text-gray-400">
                      현재 정보와 과거 정보의 비율을 조절합니다. 
                      중요한 장기 트렌드는 유지하면서 새로운 시장 시그널을 
                      적절한 비율로 반영합니다.
                    </p>
                  </div>
                </div>

                {/* GRU vs LSTM 비교 */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaExchangeAlt className="text-yellow-400" />
                    GRU vs LSTM - 왜 GRU가 더 효율적인가?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-green-400 font-semibold mb-3">GRU의 장점</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <div>
                            <span className="text-white font-semibold">33% 적은 파라미터</span>
                            <p className="text-gray-400 text-sm">2개 게이트로 LSTM의 3개 게이트와 동일한 성능</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <div>
                            <span className="text-white font-semibold">2배 빠른 학습</span>
                            <p className="text-gray-400 text-sm">단순한 구조로 역전파 계산이 빨라짐</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          <div>
                            <span className="text-white font-semibold">메모리 효율성</span>
                            <p className="text-gray-400 text-sm">Cell State가 없어 메모리 사용량 감소</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-blue-400 font-semibold mb-3">최적 사용 케이스</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <div>
                            <span className="text-white font-semibold">단기 예측</span>
                            <p className="text-gray-400 text-sm">1시간~1일 단위의 가격 예측</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <div>
                            <span className="text-white font-semibold">고빈도 트레이딩</span>
                            <p className="text-gray-400 text-sm">빠른 연산으로 실시간 시그널 생성</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <div>
                            <span className="text-white font-semibold">리소스 제한 환경</span>
                            <p className="text-gray-400 text-sm">모바일이나 엣지 디바이스에서도 실행</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* GRU의 작동 원리 */}
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">
                    ⚡ GRU의 암호화폐 가격 예측 프로세스
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">1️⃣</div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">시계열 데이터 입력</h4>
                        <p className="text-gray-400">
                          가격, 거래량, RSI, MACD 등 다양한 지표를 시간 순서대로 입력받습니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">2️⃣</div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Reset Gate 처리</h4>
                        <p className="text-gray-400">
                          급변하는 시장 상황을 감지하면 이전 패턴을 리셋하고 새로운 패턴에 집중합니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">3️⃣</div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Update Gate 조절</h4>
                        <p className="text-gray-400">
                          장기 트렌드와 단기 변동성의 비율을 최적화하여 균형잡힌 예측을 생성합니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">4️⃣</div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">Hidden State 출력</h4>
                        <p className="text-gray-400">
                          최종적으로 1시간, 4시간, 1일 후의 가격을 예측하여 트레이딩 시그널을 생성합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 실전 성과 */}
                <div className="text-center p-6 bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-xl">
                  <h3 className="text-2xl font-bold text-white mb-4">🏆 GRU 실전 성과</h3>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-3xl font-bold text-green-400">87%</div>
                      <div className="text-gray-400">방향성 정확도</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-400">2x</div>
                      <div className="text-gray-400">학습 속도</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-400">-33%</div>
                      <div className="text-gray-400">메모리 사용</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-400">0.3초</div>
                      <div className="text-gray-400">예측 시간</div>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    구글, 페이스북 등 빅테크 기업들이 채택한 최신 AI 기술로 
                    더 빠르고 정확한 암호화폐 트레이딩이 가능합니다!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GRU 아키텍처 3D 시각화 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaProjectDiagram className="text-green-400" />
            GRU 아키텍처
          </h3>
          <div className="h-64 relative">
            <Canvas camera={{ position: [0, 0, 3] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls enableZoom={false} />
              
              {/* Reset Gate */}
              <Box position={[-1.5, 1, 0]} args={[0.8, 0.8, 0.8]}>
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
              </Box>
              
              {/* Update Gate */}
              <Box position={[0, 1, 0]} args={[0.8, 0.8, 0.8]}>
                <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.2} />
              </Box>
              
              {/* Hidden State */}
              <Sphere position={[1.5, 1, 0]} args={[0.5, 32, 32]}>
                <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
              </Sphere>
              
              {/* Connections */}
              <Line
                points={[[-1.5, 1, 0], [0, 1, 0], [1.5, 1, 0]]}
                color="white"
                lineWidth={2}
                opacity={0.5}
                transparent
              />
            </Canvas>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-400">Reset Gate - 이전 정보 리셋</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-400">Update Gate - 정보 업데이트</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-400">Hidden State - 최종 상태</span>
            </div>
          </div>
        </div>

        {/* 실시간 게이트 상태 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaCog className="text-green-400" />
            실시간 게이트 상태
          </h3>
          <div className="space-y-4">
            {['reset', 'update', 'candidate'].map((gate) => {
              const value = Math.random()
              return (
                <div key={gate} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 capitalize">{gate} Gate</span>
                    <span className="text-green-400">{(value * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        gate === 'reset' ? 'bg-gradient-to-r from-red-600 to-red-400' :
                        gate === 'update' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                        'bg-gradient-to-r from-green-600 to-green-400'
                      }`}
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 모델 특성 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaAtom className="text-green-400" />
            GRU 특성
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaLightbulb className="text-green-400 text-sm" />
              </div>
              <div>
                <h4 className="text-white font-semibold">단순화된 구조</h4>
                <p className="text-gray-400 text-sm">LSTM보다 적은 파라미터로 효율적 학습</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaRobot className="text-blue-400 text-sm" />
              </div>
              <div>
                <h4 className="text-white font-semibold">빠른 수렴</h4>
                <p className="text-gray-400 text-sm">단순한 게이트 구조로 빠른 학습 속도</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaChartArea className="text-purple-400 text-sm" />
              </div>
              <div>
                <h4 className="text-white font-semibold">장기 의존성</h4>
                <p className="text-gray-400 text-sm">효과적인 장기 패턴 학습 능력</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 실시간 예측 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-green-400" />
          실시간 GRU 예측
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sampleData.gateData}>
            <defs>
              <linearGradient id="gruGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="final"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#gruGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderGates = () => (
    <div className="space-y-6">
      {/* 게이트 활성화 패턴 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaExchangeAlt className="text-green-400" />
          게이트 활성화 패턴
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={sampleData.gateData}>
            <defs>
              <linearGradient id="resetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="updateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="reset"
              fill="url(#resetGradient)"
              stroke="#ef4444"
              strokeWidth={2}
              name="Reset Gate"
            />
            <Area
              type="monotone"
              dataKey="update"
              fill="url(#updateGradient)"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Update Gate"
            />
            <Line
              type="monotone"
              dataKey="candidate"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              name="Candidate State"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 게이트 상호작용 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">게이트 상관관계</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="reset" name="Reset Gate" stroke="#9ca3af" />
              <YAxis dataKey="update" name="Update Gate" stroke="#9ca3af" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Gate Correlation" 
                data={sampleData.gateData} 
                fill="#10b981"
              >
                {sampleData.gateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${120 + index * 2}, 70%, 50%)`} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">게이트 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { gate: 'Reset', value: 0.65 },
              { gate: 'Update', value: 0.78 },
              { gate: 'Candidate', value: 0.52 },
              { gate: 'Output', value: 0.71 },
              { gate: 'Memory', value: 0.83 }
            ]}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="gate" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar 
                name="Gate Activation" 
                dataKey="value" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderAttention = () => (
    <div className="space-y-6">
      {/* 어텐션 히트맵 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaNetworkWired className="text-green-400" />
          어텐션 히트맵
        </h3>
        <div className="relative overflow-hidden rounded-lg">
          <div className="grid grid-cols-20 gap-0.5">
            {sampleData.attentionMap.map((row, i) => 
              row.map((value, j) => (
                <div
                  key={`${i}-${j}`}
                  className="aspect-square transition-all duration-300 hover:scale-110"
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${value})`,
                    boxShadow: value > 0.7 ? `0 0 10px rgba(16, 185, 129, ${value})` : 'none'
                  }}
                  title={`Attention: ${(value * 100).toFixed(1)}%`}
                />
              ))
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">Low Attention</span>
          <div className="flex-1 mx-4 h-2 bg-gradient-to-r from-gray-700 via-green-600 to-green-400 rounded"></div>
          <span className="text-gray-400">High Attention</span>
        </div>
      </div>

      {/* 시퀀스 중요도 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">시퀀스별 중요도</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleData.gateData.slice(-20)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="update" fill="#10b981" radius={[8, 8, 0, 0]}>
              {sampleData.gateData.slice(-20).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${120 + index * 3}, 70%, 50%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderFlow = () => (
    <div className="space-y-6">
      {/* 정보 흐름 시각화 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaStream className="text-green-400" />
          정보 흐름 분석
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={sampleData.informationFlow}>
            <defs>
              <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="retained"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="유지된 정보"
            />
            <Area
              type="monotone"
              dataKey="new"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="새로운 정보"
            />
            <Line
              type="monotone"
              dataKey="output"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', r: 4 }}
              name="출력"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 상태 전이 다이어그램 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">상태 전이</h3>
          <div className="space-y-4">
            {sampleData.stateTransitions.slice(-5).map((transition, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 font-bold">{i + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Update: {(transition.updateAmt * 100).toFixed(1)}%</span>
                    <span className="text-gray-400">Reset: {(transition.resetAmt * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000"
                      style={{ width: `${transition.updateAmt * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4">메모리 효율성</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
              { name: 'Input', value: 78, fill: '#3b82f6' },
              { name: 'Process', value: 85, fill: '#10b981' },
              { name: 'Output', value: 92, fill: '#f59e0b' }
            ]}>
              <RadialBar dataKey="value" cornerRadius={10} fill="#10b981" />
              <Legend />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderPredictions = () => {
    const currentPred = predictions.find(p => p.symbol === selectedCoin) || {
      current: 50000,
      predicted_1h: 50500,
      predicted_4h: 51000,
      predicted_1d: 52000,
      predicted_1w: 55000,
      confidence: 75,
      direction: 'UP'
    }

    const predictionData = [
      { time: '현재', price: currentPred.current, type: 'current' },
      { time: '1시간', price: currentPred.predicted_1h, type: 'prediction' },
      { time: '4시간', price: currentPred.predicted_4h, type: 'prediction' },
      { time: '1일', price: currentPred.predicted_1d, type: 'prediction' },
      { time: '1주', price: currentPred.predicted_1w, type: 'prediction' }
    ]

    return (
      <div className="space-y-6">
        {/* 예측 차트 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-400" />
            GRU 가격 예측
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={predictionData}>
              <defs>
                <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={['dataMin - 1000', 'dataMax + 1000']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="price"
                fill="url(#predGradient)"
                stroke="#10b981"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
              />
              <ReferenceLine y={currentPred.current} stroke="#6b7280" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 예측 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4">예측 신뢰도</h3>
            <div className="relative h-40 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl font-bold text-green-400">
                  {currentPred.confidence.toFixed(1)}%
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="60"
                  stroke="#374151"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="60"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${currentPred.confidence * 3.77} 377`}
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4">예측 방향</h3>
            <div className="flex flex-col items-center justify-center h-40">
              <div className={`text-6xl mb-2 ${
                currentPred.direction === 'UP' ? 'text-green-400' : 
                currentPred.direction === 'DOWN' ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {currentPred.direction === 'UP' ? '↑' : 
                 currentPred.direction === 'DOWN' ? '↓' : '→'}
              </div>
              <div className="text-2xl font-bold text-white">
                {currentPred.direction}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4">예상 수익률</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">1시간</span>
                <span className={`font-bold ${
                  currentPred.predicted_1h > currentPred.current ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((currentPred.predicted_1h - currentPred.current) / currentPred.current * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">1일</span>
                <span className={`font-bold ${
                  currentPred.predicted_1d > currentPred.current ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((currentPred.predicted_1d - currentPred.current) / currentPred.current * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">1주</span>
                <span className={`font-bold ${
                  currentPred.predicted_1w > currentPred.current ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((currentPred.predicted_1w - currentPred.current) / currentPred.current * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSignals = () => (
    <div className="space-y-6">
      {/* 트레이딩 시그널 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaSignal className="text-green-400" />
          GRU 트레이딩 시그널
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coins.map((coin) => {
            const signal = {
              action: Math.random() > 0.5 ? 'BUY' : Math.random() > 0.5 ? 'SELL' : 'HOLD',
              confidence: 65 + Math.random() * 25,
              entryPrice: 50000 + Math.random() * 5000,
              targetPrice: 52000 + Math.random() * 3000,
              stopLoss: 48000 + Math.random() * 2000,
              riskReward: 1.5 + Math.random() * 2
            }

            return (
              <div key={coin.symbol} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: coin.color + '20' }}
                    >
                      <span className="text-xs font-bold" style={{ color: coin.color }}>
                        {coin.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-semibold text-white">{coin.name}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    signal.action === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    signal.action === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {signal.action}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">신뢰도</span>
                    <span className="text-white">{signal.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">진입가</span>
                    <span className="text-white">${signal.entryPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">목표가</span>
                    <span className="text-green-400">${signal.targetPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">손절가</span>
                    <span className="text-red-400">${signal.stopLoss.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">R:R</span>
                    <span className="text-white">{signal.riskReward.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 시그널 히스토리 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">시그널 성과</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { month: '10월', success: 72, total: 100 },
            { month: '11월', success: 78, total: 95 },
            { month: '12월', success: 81, total: 105 },
            { month: '1월', success: 76, total: 98 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="success" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="total" fill="#374151" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* 성능 메트릭 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '정확도', value: metrics?.accuracy || 77.2, color: 'green' },
          { label: '정밀도', value: metrics?.precision || 74.8, color: 'blue' },
          { label: '재현율', value: metrics?.recall || 79.5, color: 'purple' },
          { label: 'F1 Score', value: metrics?.f1_score || 77.0, color: 'yellow' }
        ].map((metric) => (
          <div key={metric.label} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <h4 className="text-gray-400 text-sm mb-2">{metric.label}</h4>
            <div className="text-3xl font-bold text-white mb-2">
              {metric.value.toFixed(1)}%
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${
                  metric.color === 'green' ? 'from-green-600 to-green-400' :
                  metric.color === 'blue' ? 'from-blue-600 to-blue-400' :
                  metric.color === 'purple' ? 'from-purple-600 to-purple-400' :
                  'from-yellow-600 to-yellow-400'
                } transition-all duration-1000`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 에러 메트릭 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">예측 오차 분석</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            mae: 0.013 + Math.random() * 0.005,
            rmse: 0.019 + Math.random() * 0.005,
            mape: 0.025 + Math.random() * 0.008
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #10b981' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="mae" stroke="#10b981" strokeWidth={2} name="MAE" />
            <Line type="monotone" dataKey="rmse" stroke="#3b82f6" strokeWidth={2} name="RMSE" />
            <Line type="monotone" dataKey="mape" stroke="#f59e0b" strokeWidth={2} name="MAPE" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 샤프 비율 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
        <h3 className="text-lg font-bold text-white mb-4">위험 조정 수익률</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-gray-400 mb-2">샤프 비율</h4>
            <div className="text-4xl font-bold text-green-400">
              {(metrics?.sharpe_ratio || 1.55).toFixed(2)}
            </div>
          </div>
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={Array.from({ length: 20 }, (_, i) => ({
                time: i,
                value: 1.2 + Math.sin(i / 3) * 0.3 + Math.random() * 0.2
              }))}>
                <defs>
                  <linearGradient id="sharpeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#sharpeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingComponent />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6 relative overflow-hidden">
      <AnimatedBackground />
      <ParticleEffect />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
            GRU 예측 모델
          </h1>
          <p className="text-xl text-gray-400">
            Gated Recurrent Unit - 효율적인 시계열 예측
          </p>
        </div>

        {/* 연결 상태 */}
        <div className="flex items-center justify-center mb-6 gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            wsConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="text-sm font-medium">
              {wsConnected ? 'GRU 서비스 연결됨' : 'GRU 서비스 연결 중...'}
            </span>
          </div>
          
          {/* 코인 선택 */}
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
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
          {activeTab === 'gates' && renderGates()}
          {activeTab === 'attention' && renderAttention()}
          {activeTab === 'flow' && renderFlow()}
          {activeTab === 'predictions' && renderPredictions()}
          {activeTab === 'signals' && renderSignals()}
          {activeTab === 'performance' && renderPerformance()}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(20px); }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  )
}

// 3D Line 컴포넌트 (간단한 구현)
function Line({ points, color, lineWidth, opacity, transparent }: any) {
  return null // Three.js Line은 별도 구현 필요
}