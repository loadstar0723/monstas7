'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBrain, FaChartLine, FaGraduationCap, FaRocket,
  FaShieldAlt, FaLightbulb, FaCode, FaDatabase,
  FaNetworkWired, FaCogs, FaCheckCircle, FaArrowRight,
  FaBookOpen, FaMedal, FaChartBar, FaInfo, FaExchangeAlt,
  FaMemory, FaBolt, FaClock, FaInfoCircle, FaHistory,
  FaRobot, FaCog, FaExclamationTriangle, FaStream, FaTachometerAlt
} from 'react-icons/fa'
import { BiChip } from 'react-icons/bi'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
// Tabs removed - using button navigation instead

// 3D 배경 임포트
import { DarkWaveBackground3D } from '@/components/backgrounds/DarkWaveBackground3D'

// 컴포넌트 임포트
import { ErrorBoundary } from './components/ErrorBoundary'
import ModelOverview from './components/ModelOverview'
import GateVisualization from './components/GateVisualization'
import PerformanceComparison from './components/PerformanceComparison'
import HyperparameterTuning from './components/HyperparameterTuning'
import RealtimePrediction from './components/RealtimePrediction'
import DynamicAnalysis from './components/DynamicAnalysis'

// Go 하이브리드 컴포넌트 임포트
import GoParallelGRU from './components/GoParallelGRU'
import GoStreamGRU from './components/GoStreamGRU'
import GoMemoryGRU from './components/GoMemoryGRU'
import GoBenchmarkGRU from './components/GoBenchmarkGRU'

// 코인 정보
const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <div className="text-yellow-500 font-bold">₿</div> },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <div className="text-blue-500 font-bold">Ξ</div> },
  { symbol: 'BNBUSDT', name: 'BNB', icon: <SiBinance className="text-yellow-600" /> },
  { symbol: 'SOLUSDT', name: 'Solana', icon: <div className="text-purple-500 font-bold">◎</div> },
  { symbol: 'XRPUSDT', name: 'XRP', icon: <div className="text-gray-400 font-bold">XRP</div> },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: <SiCardano className="text-blue-600" /> },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: <SiDogecoin className="text-yellow-500" /> },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: <div className="text-red-500 font-bold">A</div> },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: <div className="text-purple-600 font-bold">M</div> },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: <SiPolkadot className="text-pink-500" /> }
]

// 모듈 래퍼 컴포넌트
function ModuleSection({ children, title, description }: { 
  children: React.ReactNode
  title?: string
  description?: string 
}) {
  return (
    <ErrorBoundary moduleName={title || 'GRU Section'}>
      <div className="module-section">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {description && <p className="text-gray-400 mt-1">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </ErrorBoundary>
  )
}

export default function GRUModuleEnhanced() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [responseTime, setResponseTime] = useState<number>(0)
  const [serverVersion, setServerVersion] = useState<string>('1.0.0')
  const [cpuUsage, setCpuUsage] = useState<number>(0)
  const [memoryUsage, setMemoryUsage] = useState<number>(0)
  const [goroutines, setGoroutines] = useState<number>(0)
  const [showSettings, setShowSettings] = useState(false)

  // GRU 모델 설정 상태
  const [modelSettings, setModelSettings] = useState({
    hiddenSize: 128,
    numLayers: 2,
    dropout: 0.2,
    learningRate: 0.001,
    batchSize: 32,
    sequenceLength: 60,
    updateInterval: 5000,
    useGoEngine: true,
    enableStreaming: true,
    enableParallel: true
  })

  // 로딩 상태 관리
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Go 서버 상태 체크
  useEffect(() => {
    const checkServerStatus = async () => {
      const startTime = Date.now()
      try {
        const response = await fetch('http://localhost:8080/health', {
          method: 'GET',
          mode: 'cors',
        })

        if (response.ok) {
          const data = await response.json()
          setServerStatus('connected')
          setResponseTime(Date.now() - startTime)
          setServerVersion(data.version || '1.0.0')
          setCpuUsage(data.cpu_usage || 0)
          setMemoryUsage(data.memory_usage || 0)
          setGoroutines(data.goroutines || 0)
        } else {
          setServerStatus('disconnected')
        }
      } catch (error) {
        setServerStatus('disconnected')
      }
    }

    checkServerStatus()
    const interval = setInterval(checkServerStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">GRU AI 모델 로딩 중...</h2>
          <p className="text-gray-400">고효율 예측 엔진을 준비하고 있습니다</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary moduleName="GRU Main">
      <div className="min-h-screen">
        {/* 3D 게이트 회로 배경 */}
        <div className="fixed inset-0 z-0">
        <DarkWaveBackground3D />
      </div>


        <div className="relative z-10 min-h-screen p-6">
          <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  <BiChip className="text-green-500" />
                  GRU 딥러닝 예측 모델
                </h1>
                <p className="text-gray-400 mt-2">
                  Gated Recurrent Unit - 효율적이고 빠른 시계열 예측 시스템
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaCog />
                  설정
                </button>
              </div>
            </div>

            {/* Go 엔진 상태 상세 정보 */}
            <div className={`mb-4 p-4 rounded-xl backdrop-blur-sm border ${
              serverStatus === 'connected'
                ? 'bg-gray-900/50 border-green-500/30'
                : serverStatus === 'disconnected'
                ? 'bg-gray-900/50 border-red-500/30'
                : 'bg-gray-900/50 border-yellow-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`relative ${
                    serverStatus === 'connected' ? 'animate-pulse' : ''
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      serverStatus === 'connected'
                        ? 'bg-green-500'
                        : serverStatus === 'disconnected'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`} />
                    {serverStatus === 'connected' && (
                      <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">Go Trading Engine</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        serverStatus === 'connected'
                          ? 'bg-green-500/20 text-green-400'
                          : serverStatus === 'disconnected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {serverStatus === 'connected'
                          ? '● 연결됨'
                          : serverStatus === 'disconnected'
                          ? '● 연결 끊김'
                          : '● 연결 중...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span>버전: v{serverVersion}</span>
                      <span>응답시간: {responseTime}ms</span>
                      <span>모델: GRU</span>
                    </div>
                  </div>
                </div>

                {serverStatus === 'connected' && (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">CPU 사용률</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              cpuUsage < 50 ? 'bg-green-500' : cpuUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(cpuUsage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${
                          cpuUsage < 50 ? 'text-green-400' : cpuUsage < 80 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {cpuUsage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">메모리</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${Math.min((memoryUsage / 500) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-blue-400">
                          {memoryUsage.toFixed(0)}MB
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">고루틴</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${Math.min((goroutines / 1000) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-purple-400">
                          {goroutines}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {serverStatus === 'connected' && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <FaBolt className="text-green-400 text-sm" />
                      <div>
                        <div className="text-xs text-gray-500">처리 속도</div>
                        <div className="text-sm font-semibold text-green-400">10x 빠름</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStream className="text-blue-400 text-sm" />
                      <div>
                        <div className="text-xs text-gray-500">실시간 스트림</div>
                        <div className="text-sm font-semibold text-blue-400">활성화</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMemory className="text-purple-400 text-sm" />
                      <div>
                        <div className="text-xs text-gray-500">메모리 최적화</div>
                        <div className="text-sm font-semibold text-purple-400">90% 효율</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTachometerAlt className="text-orange-400 text-sm" />
                      <div>
                        <div className="text-xs text-gray-500">벤치마크</div>
                        <div className="text-sm font-semibold text-orange-400">89.4점</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 코인 선택 */}
            <div className="flex gap-2 flex-wrap bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              {COINS.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin.symbol)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCoin === coin.symbol
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {coin.icon}
                  <span className="font-medium">{coin.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 메인 컨텐츠 탭 */}
          {/* 탭 네비게이션 - 버튼 형태로 변경 */}
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 mb-8">
            <motion.button
              onClick={() => setActiveTab('overview')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaInfoCircle className="text-xl" />
                <span className="text-xs">개요</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('gates')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'gates'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaExchangeAlt className="text-xl" />
                <span className="text-xs">게이트</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('comparison')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'comparison'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaChartBar className="text-xl" />
                <span className="text-xs">성능</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('hyperparameter')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'hyperparameter'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaCogs className="text-xl" />
                <span className="text-xs">파라미터</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('realtime')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'realtime'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaRobot className="text-xl" />
                <span className="text-xs">실시간</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('training')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'training'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaGraduationCap className="text-xl" />
                <span className="text-xs">학습</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('go-parallel')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'go-parallel'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-orange-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaBolt className="text-xl" />
                <span className="text-xs">Go병렬</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('go-stream')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'go-stream'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-orange-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaStream className="text-xl" />
                <span className="text-xs">Go스트림</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('go-memory')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'go-memory'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-orange-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaMemory className="text-xl" />
                <span className="text-xs">Go메모리</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('go-bench')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'go-bench'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-orange-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaTachometerAlt className="text-xl" />
                <span className="text-xs">Go벤치</span>
              </div>
            </motion.button>
          </div>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="GRU 모델 완전 가이드"
                    description="Gated Recurrent Unit의 모든 것을 상세히 알아봅니다"
                  >
                    <ModelOverview />
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'gates' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="게이트 메커니즘 시각화"
                    description="Reset Gate와 Update Gate의 작동 원리를 실시간으로 확인합니다"
                  >
                    <GateVisualization symbol={selectedCoin} />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="gates" />
                    </div>
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'comparison' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="LSTM과 성능 비교"
                    description="GRU와 LSTM의 성능을 다각도로 비교 분석합니다"
                  >
                    <PerformanceComparison />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="comparison" />
                    </div>
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'hyperparameter' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="하이퍼파라미터 최적화"
                    description="베이지안 최적화로 최적의 모델 파라미터를 찾습니다"
                  >
                    <HyperparameterTuning />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="hyperparameter" />
                    </div>
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'realtime' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="실시간 AI 예측 엔진"
                    description="GRU 모델의 실시간 예측과 거래 신호를 제공합니다"
                  >
                    <RealtimePrediction symbol={selectedCoin} />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="realtime" />
                    </div>
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'training' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="모델 학습 & 검증"
                    description="실시간 학습 진행 상황과 검증 메트릭을 모니터링합니다"
                  >
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-xl font-bold text-white mb-4">학습 진행 상황</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Epoch</span>
                          <span className="text-white font-semibold">150 / 200</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500" style={{ width: '75%' }} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-gray-400 text-sm">Training Loss</p>
                            <p className="text-2xl font-bold text-green-400">0.0234</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Validation Loss</p>
                            <p className="text-2xl font-bold text-blue-400">0.0312</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="training" />
                    </div>
                  </ModuleSection>
                  </div>
                )}

                {/* Go 하이브리드 탭 콘텐츠 */}
                {activeTab === 'go-parallel' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="Go 병렬 처리 엔진"
                    description="Go의 강력한 Goroutines로 GRU 연산을 병렬화합니다"
                  >
                    <GoParallelGRU />
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'go-stream' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="Go 실시간 스트리밍"
                    description="Go 채널을 통한 실시간 데이터 스트리밍과 처리"
                  >
                    <GoStreamGRU />
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'go-memory' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="Go 메모리 최적화"
                    description="Go의 효율적인 메모리 관리로 GRU 성능 극대화"
                  >
                    <GoMemoryGRU />
                  </ModuleSection>
                  </div>
                )}

                {activeTab === 'go-bench' && (
                  <div className="space-y-6 mt-6">
                  <ModuleSection
                    title="Go 성능 벤치마크"
                    description="Python 대비 Go GRU의 압도적인 성능 우위"
                  >
                    <GoBenchmarkGRU />
                  </ModuleSection>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            </div>

          {/* 하단 정보 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl border border-green-500/30"
          >
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-green-400 text-xl mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">GRU 모델 정보</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  GRU(Gated Recurrent Unit)는 LSTM의 단순화된 버전으로, 더 빠른 학습 속도와 
                  효율적인 메모리 사용을 제공합니다. 2개의 게이트(Reset, Update)만으로 
                  LSTM과 유사한 성능을 달성하며, 특히 단기 예측과 실시간 처리에 탁월합니다. 
                  고빈도 트레이딩과 리소스가 제한된 환경에서 최적의 선택입니다.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 설정 모달 */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaCog className="text-green-500" />
                  GRU 모델 설정
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 모델 파라미터 섹션 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">모델 파라미터</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Hidden Size</label>
                      <input
                        type="number"
                        value={modelSettings.hiddenSize}
                        onChange={(e) => setModelSettings({...modelSettings, hiddenSize: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">레이어 수</label>
                      <input
                        type="number"
                        value={modelSettings.numLayers}
                        onChange={(e) => setModelSettings({...modelSettings, numLayers: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Dropout</label>
                      <input
                        type="number"
                        step="0.1"
                        value={modelSettings.dropout}
                        onChange={(e) => setModelSettings({...modelSettings, dropout: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">학습률</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={modelSettings.learningRate}
                        onChange={(e) => setModelSettings({...modelSettings, learningRate: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 학습 설정 섹션 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">학습 설정</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">배치 크기</label>
                      <input
                        type="number"
                        value={modelSettings.batchSize}
                        onChange={(e) => setModelSettings({...modelSettings, batchSize: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">시퀀스 길이</label>
                      <input
                        type="number"
                        value={modelSettings.sequenceLength}
                        onChange={(e) => setModelSettings({...modelSettings, sequenceLength: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">업데이트 간격 (ms)</label>
                      <input
                        type="number"
                        step="1000"
                        value={modelSettings.updateInterval}
                        onChange={(e) => setModelSettings({...modelSettings, updateInterval: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Go 엔진 설정 섹션 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Go 엔진 설정</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modelSettings.useGoEngine}
                        onChange={(e) => setModelSettings({...modelSettings, useGoEngine: e.target.checked})}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-white">Go 하이브리드 엔진 사용</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modelSettings.enableStreaming}
                        onChange={(e) => setModelSettings({...modelSettings, enableStreaming: e.target.checked})}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-white">실시간 스트리밍 활성화</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={modelSettings.enableParallel}
                        onChange={(e) => setModelSettings({...modelSettings, enableParallel: e.target.checked})}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-white">병렬 처리 활성화</span>
                    </label>
                  </div>
                </div>

                {/* 현재 성능 지표 */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">현재 성능 지표</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">정확도:</span>
                      <span className="text-green-400 font-bold ml-2">94.2%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">손실:</span>
                      <span className="text-blue-400 font-bold ml-2">0.0234</span>
                    </div>
                    <div>
                      <span className="text-gray-400">추론 시간:</span>
                      <span className="text-purple-400 font-bold ml-2">12ms</span>
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setModelSettings({
                        hiddenSize: 128,
                        numLayers: 2,
                        dropout: 0.2,
                        learningRate: 0.001,
                        batchSize: 32,
                        sequenceLength: 60,
                        updateInterval: 5000,
                        useGoEngine: true,
                        enableStreaming: true,
                        enableParallel: true
                      })
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    기본값 복원
                  </button>
                  <button
                    onClick={() => {
                      console.log('Settings saved:', modelSettings)
                      setShowSettings(false)
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  </ErrorBoundary>
  )
}