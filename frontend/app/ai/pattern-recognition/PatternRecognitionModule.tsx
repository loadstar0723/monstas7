'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaChartLine, FaSearchPlus, FaShapes, FaBrain,
  FaChartBar, FaExclamationTriangle, FaCheckCircle,
  FaLightbulb, FaHistory, FaTachometerAlt, FaFilter,
  FaRobot, FaMagic, FaEye, FaChartArea
} from 'react-icons/fa'
import { BiShapeTriangle, BiShapeSquare } from 'react-icons/bi'
import { MdPattern } from 'react-icons/md'

import dynamic from 'next/dynamic'

// 3D 신경망 배경 (Neural 페이지와 동일)
const NeuralBackground3D = dynamic(
  () => import('./components/NeuralBackground3D'),
  { ssr: false }
)

const ErrorBoundary = dynamic(() => import('./components/ErrorBoundary'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ModelOverview = dynamic(() => import('./components/ModelOverview'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const PatternDetection = dynamic(() => import('./components/PatternDetection'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const CandlestickPatterns = dynamic(() => import('./components/CandlestickPatterns'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const ChartPatterns = dynamic(() => import('./components/ChartPatterns'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const PatternPerformance = dynamic(() => import('./components/PatternPerformance'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const RealtimeScanner = dynamic(() => import('./components/RealtimeScanner'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

const DynamicAnalysis = dynamic(() => import('./components/DynamicAnalysis'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-800 rounded-xl h-96" />
})

// 탭 설정
interface TabConfig {
  id: string
  title: string
  icon: React.ReactNode
  description: string
  color: string
}

// 코인 목록
const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'XRP' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' },
  { symbol: 'MATICUSDT', name: 'Polygon' },
  { symbol: 'DOTUSDT', name: 'Polkadot' }
]

export default function PatternRecognitionModule() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [timeframe, setTimeframe] = useState('1h')

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      title: '개요',
      icon: <FaChartLine className="text-2xl" />,
      description: '패턴 인식 시스템 소개',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'detection',
      title: 'AI 패턴 탐지',
      icon: <FaBrain className="text-2xl" />,
      description: 'CNN 기반 패턴 탐지',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'candlestick',
      title: '캔들스틱',
      icon: <FaChartBar className="text-2xl" />,
      description: '캔들스틱 패턴 분석',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'chart',
      title: '차트 패턴',
      icon: <BiShapeTriangle className="text-2xl" />,
      description: '기하학적 차트 패턴',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'performance',
      title: '성능 분석',
      icon: <FaTachometerAlt className="text-2xl" />,
      description: '패턴별 성공률',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'scanner',
      title: '실시간 스캐너',
      icon: <FaSearchPlus className="text-2xl" />,
      description: '실시간 패턴 탐색',
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return (
          <ErrorBoundary>
            <ModelOverview />
            <DynamicAnalysis type="overview" symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'detection':
        return (
          <ErrorBoundary>
            <PatternDetection symbol={selectedSymbol} timeframe={timeframe} />
            <DynamicAnalysis type="detection" symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'candlestick':
        return (
          <ErrorBoundary>
            <CandlestickPatterns symbol={selectedSymbol} timeframe={timeframe} />
            <DynamicAnalysis type="candlestick" symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'chart':
        return (
          <ErrorBoundary>
            <ChartPatterns symbol={selectedSymbol} timeframe={timeframe} />
            <DynamicAnalysis type="chart" symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'performance':
        return (
          <ErrorBoundary>
            <PatternPerformance symbol={selectedSymbol} />
            <DynamicAnalysis type="performance" symbol={selectedSymbol} />
          </ErrorBoundary>
        )
      case 'scanner':
        return (
          <ErrorBoundary>
            <RealtimeScanner timeframe={timeframe} />
            <DynamicAnalysis type="scanner" />
          </ErrorBoundary>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
        {/* 3D 패턴 매트릭스 배경 */}
        <div className="fixed inset-0 z-0">
        <NeuralBackground3D />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-8">

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            AI Pattern Recognition System
          </h1>
          <p className="text-xl text-gray-300">
            CNN 딥러닝 기반 차트 패턴 자동 인식 및 예측 시스템
          </p>
        </motion.div>

        {/* 컨트롤 패널 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* 심볼 선택 */}
          <select
            value={selectedSymbol}
            onChange={(e) => {
              if (e && e.target && e.target.value) {
                setSelectedSymbol(e.target.value)
              }
            }}
            className="bg-gray-800/50 backdrop-blur-sm text-white rounded-lg px-6 py-3 border border-gray-700 focus:border-purple-500 transition-all"
          >
            {COINS.map(coin => (
              <option key={coin.symbol} value={coin.symbol}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>

          {/* 시간대 선택 */}
          <select
            value={timeframe}
            onChange={(e) => {
              if (e && e.target && e.target.value) {
                setTimeframe(e.target.value)
              }
            }}
            className="bg-gray-800/50 backdrop-blur-sm text-white rounded-lg px-6 py-3 border border-gray-700 focus:border-purple-500 transition-all"
          >
            <option value="1m">1분</option>
            <option value="5m">5분</option>
            <option value="15m">15분</option>
            <option value="1h">1시간</option>
            <option value="4h">4시간</option>
            <option value="1d">1일</option>
          </select>
        </div>

        {/* 탭 네비게이션 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`relative p-4 rounded-xl backdrop-blur-sm transition-all ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg scale-105'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex flex-col items-center gap-2">
                {tab.icon}
                <span className="text-sm font-medium">{tab.title}</span>
              </div>
              
              {selectedTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* 탭 설명 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-8"
          >
            <p className="text-lg text-gray-400">
              {tabs.find(tab => tab.id === selectedTab)?.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 컨텐츠 영역 */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-800"
        >
          {renderContent()}
        </motion.div>

        {/* 통계 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <MdPattern className="text-3xl text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">48</div>
            <div className="text-sm text-gray-400">인식 가능 패턴</div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <FaTachometerAlt className="text-3xl text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">87%</div>
            <div className="text-sm text-gray-400">평균 정확도</div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <FaRobot className="text-3xl text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">CNN</div>
            <div className="text-sm text-gray-400">딥러닝 모델</div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 text-center border border-gray-700/50">
            <FaChartArea className="text-3xl text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">실시간</div>
            <div className="text-sm text-gray-400">패턴 스캐닝</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}