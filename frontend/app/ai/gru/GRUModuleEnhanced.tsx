'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBrain, FaChartLine, FaGraduationCap, FaRocket,
  FaShieldAlt, FaLightbulb, FaCode, FaDatabase,
  FaNetworkWired, FaCogs, FaCheckCircle, FaArrowRight,
  FaBookOpen, FaMedal, FaChartBar, FaInfo, FaExchangeAlt,
  FaMemory, FaBolt, FaClock, FaInfoCircle, FaHistory, 
  FaRobot, FaCog, FaExclamationTriangle
} from 'react-icons/fa'
import { BiChip } from 'react-icons/bi'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  // 로딩 상태 관리
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
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
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-6 w-full bg-gray-800/50 backdrop-blur-sm p-1 rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-green-600">
                <FaInfoCircle className="mr-2" />
                개요
              </TabsTrigger>
              <TabsTrigger value="gates" className="data-[state=active]:bg-green-600">
                <FaExchangeAlt className="mr-2" />
                게이트 분석
              </TabsTrigger>
              <TabsTrigger value="comparison" className="data-[state=active]:bg-green-600">
                <FaChartBar className="mr-2" />
                성능 비교
              </TabsTrigger>
              <TabsTrigger value="hyperparameter" className="data-[state=active]:bg-green-600">
                <FaCogs className="mr-2" />
                하이퍼파라미터
              </TabsTrigger>
              <TabsTrigger value="realtime" className="data-[state=active]:bg-green-600">
                <FaRobot className="mr-2" />
                실시간
              </TabsTrigger>
              <TabsTrigger value="training" className="data-[state=active]:bg-green-600">
                <FaGraduationCap className="mr-2" />
                학습
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <ModuleSection
                    title="GRU 모델 완전 가이드"
                    description="Gated Recurrent Unit의 모든 것을 상세히 알아봅니다"
                  >
                    <ModelOverview />
                  </ModuleSection>
                </TabsContent>

                <TabsContent value="gates" className="space-y-6 mt-6">
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
                </TabsContent>

                <TabsContent value="comparison" className="space-y-6 mt-6">
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
                </TabsContent>

                <TabsContent value="hyperparameter" className="space-y-6 mt-6">
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
                </TabsContent>

                <TabsContent value="realtime" className="space-y-6 mt-6">
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
                </TabsContent>

                <TabsContent value="training" className="space-y-6 mt-6">
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
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>

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
      </div>
    </div>
  </ErrorBoundary>
  )
}