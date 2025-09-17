'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBitcoin, FaEthereum, FaBrain, FaChartLine,
  FaHistory, FaRobot, FaChartBar, FaCog,
  FaExclamationTriangle, FaInfoCircle, FaBolt,
  FaStream, FaMemory, FaTachometerAlt
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
// Tabs removed - using button navigation instead
import { DarkWaveBackground3D } from '@/components/backgrounds/DarkWaveBackground3D'

// 컴포넌트 임포트
import { ErrorBoundary } from './components/ErrorBoundary'
import ModelOverview from './components/ModelOverview'
import ModelArchitecture3D from './components/ModelArchitecture3D'
import PerformanceMetrics from './components/PerformanceMetrics'
import BacktestingCenter from './components/BacktestingCenter'
import RealtimePrediction from './components/RealtimePrediction'
import DynamicAnalysis from './components/DynamicAnalysis'

// Go 하이브리드 엔진 연동
import { useGoLSTM } from '@/lib/hooks/useGoLSTM'
import GoEngineStatus from '@/components/GoEngineStatus'

// Go 전용 컴포넌트
import GoParallelProcessing from './components/GoParallelProcessing'
import GoStreamProcessing from './components/GoStreamProcessing'
import GoMemoryManagement from './components/GoMemoryManagement'
import GoPerformanceBenchmark from './components/GoPerformanceBenchmark'

// 코인 정보
const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <FaBitcoin className="text-yellow-500" /> },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <FaEthereum className="text-blue-500" /> },
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
    <ErrorBoundary moduleName={title || 'LSTM Section'}>
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

export default function LSTMModuleEnhanced() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Go 하이브리드 엔진 연동
  const {
    prediction,
    isLoading: goPredictionLoading,
    error: goError,
    isConnected: goConnected,
    performance: goPerformance,
    getTradingSignal,
    getBacktestMetrics,
    refresh: refreshGoPrediction
  } = useGoLSTM({ symbol: selectedCoin })

  // 로딩 상태 관리
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">LSTM AI 모델 로딩 중...</h2>
          <p className="text-gray-400">고급 예측 엔진을 준비하고 있습니다</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary moduleName="LSTM Main">
      <div className="min-h-screen relative">
        {/* 어두운 3D 배경 */}
        <DarkWaveBackground3D />
        
        <div className="relative z-10 p-4">
          <div className="max-w-7xl mx-auto">
          {/* Go 엔진 상태 표시 */}
          <div className="mb-4">
            <GoEngineStatus />
          </div>

          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  <FaBrain className="text-purple-500" />
                  LSTM 딥러닝 예측 모델
                </h1>
                <p className="text-gray-400 mt-2">
                  Long Short-Term Memory 신경망 기반 고급 가격 예측 시스템
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <FaCog />
                  설정
                </button>
              </div>
            </div>

            {/* 코인 선택 */}
            <div className="flex gap-2 flex-wrap bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              {COINS.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin.symbol)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCoin === coin.symbol
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {coin.icon}
                  <span className="font-medium">{coin.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 탭 네비게이션 - 버튼 형태로 변경 */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
            <motion.button
              onClick={() => setActiveTab('overview')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
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
              onClick={() => setActiveTab('architecture')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'architecture'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaBrain className="text-xl" />
                <span className="text-xs">아키텍처</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('performance')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'performance'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
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
              onClick={() => setActiveTab('backtesting')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'backtesting'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-1">
                <FaHistory className="text-xl" />
                <span className="text-xs">백테스팅</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('realtime')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'realtime'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
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
              onClick={() => setActiveTab('go-parallel')}
              className={`relative p-3 rounded-xl backdrop-blur-sm transition-all ${
                activeTab === 'go-parallel'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
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
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
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
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
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
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
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

          {/* 탭 컨텐츠 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                  <ModuleSection
                    title="LSTM 모델 완전 가이드"
                    description="Long Short-Term Memory 신경망의 모든 것을 상세히 알아봅니다"
                  >
                    <ModelOverview />
                  </ModuleSection>
              )}

              {activeTab === 'architecture' && (
                  <ModuleSection
                    title="LSTM 아키텍처 & 작동 원리"
                    description="게이트 메커니즘과 메모리 셀의 상호작용을 3D로 시각화합니다"
                  >
                    <ModelArchitecture3D />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="architecture" />
                    </div>
                    
                    {/* 추가 설명 섹션 */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-lg font-bold text-white mb-4">LSTM의 장점</h3>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            장기 의존성 학습: 긴 시퀀스의 패턴을 효과적으로 포착
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            기울기 소실 문제 해결: 게이트 메커니즘으로 안정적 학습
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            선택적 정보 보존: 중요한 정보만 장기간 유지
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span>
                            시계열 예측 최적화: 금융 데이터 분석에 특화
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-lg font-bold text-white mb-4">실전 적용 사례</h3>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            주가 예측: 과거 가격 패턴 기반 미래 가격 예측
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            변동성 예측: 시장 불안정성 사전 감지
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            거래량 예측: 유동성 변화 패턴 분석
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            추세 전환 감지: 상승/하락 전환점 포착
                          </li>
                        </ul>
                      </div>
                    </div>
                  </ModuleSection>
              )}

              {activeTab === 'performance' && (
                  <ModuleSection
                    title="고급 성능 메트릭 대시보드"
                    description="모델의 실시간 성능을 다각도로 분석하고 추적합니다"
                  >
                    <PerformanceMetrics />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="performance" />
                    </div>
                  </ModuleSection>
              )}

              {activeTab === 'backtesting' && (
                  <ModuleSection
                    title="백테스팅 & 과거 성과 분석"
                    description="과거 데이터를 통해 전략의 유효성을 검증합니다"
                  >
                    <BacktestingCenter />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="backtesting" />
                    </div>
                  </ModuleSection>
              )}

              {activeTab === 'realtime' && (
                  <ModuleSection
                    title="실시간 AI 예측 엔진"
                    description="LSTM 모델의 실시간 예측과 거래 신호를 제공합니다"
                  >
                    <RealtimePrediction symbol={selectedCoin} />
                    
                    {/* 동적 분석 추가 */}
                    <div className="mt-8">
                      <DynamicAnalysis type="realtime" />
                    </div>
                  </ModuleSection>
              )}

              {activeTab === 'go-parallel' && (
                  <ModuleSection
                    title="Go 병렬 처리 엔진"
                    description="Goroutines를 활용한 초고속 LSTM 병렬 처리"
                  >
                    <GoParallelProcessing />
                  </ModuleSection>
              )}

              {activeTab === 'go-stream' && (
                  <ModuleSection
                    title="Go 실시간 스트리밍"
                    description="무한 스트림 처리와 백프레셔 제어"
                  >
                    <GoStreamProcessing />
                  </ModuleSection>
              )}

              {activeTab === 'go-memory' && (
                  <ModuleSection
                    title="Go 메모리 최적화"
                    description="GC 튜닝과 제로카피 메모리 관리"
                  >
                    <GoMemoryManagement />
                  </ModuleSection>
              )}

              {activeTab === 'go-bench' && (
                  <ModuleSection
                    title="Go 성능 벤치마크"
                    description="Python/PyTorch/TensorFlow 대비 성능 비교"
                  >
                    <GoPerformanceBenchmark />
                  </ModuleSection>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 하단 정보 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30"
          >
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-purple-400 text-xl mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">LSTM 모델 정보</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  이 LSTM 모델은 최신 딥러닝 기술을 활용하여 암호화폐 가격을 예측합니다. 
                  과거 가격 데이터, 거래량, 시장 지표 등 다양한 특성을 학습하여 
                  단기부터 장기까지 다양한 시간대의 가격을 예측할 수 있습니다. 
                  모든 예측은 신뢰구간과 함께 제공되며, 실시간으로 모델 성능이 모니터링됩니다.
                </p>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}