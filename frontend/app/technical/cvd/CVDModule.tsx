'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBitcoin, FaEthereum, FaChartLine, FaChartBar, FaChartArea, 
  FaGraduationCap, FaRobot, FaBalanceScale
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import { 
  FaTrophy, FaShieldAlt, FaBolt, FaBrain,
  FaVolumeUp, FaCrosshairs, FaSignal
} from 'react-icons/fa'
import { BiLineChart, BiBarChart } from 'react-icons/bi'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { CVDOverviewTab, CVDAnalysisTab, DeltaHistogramTab, DivergenceTab, StrategyTab, EducationTab } from './CVDCharts'
import { CVDConceptCard, BuySellPressureGauge, TrendSignals, TradingStrategyCard } from './CVDAnalysis'

// 추적할 코인 목록
const TRACKED_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: <FaBitcoin className="text-yellow-500" />, initialPrice: 98000 },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: <FaEthereum className="text-blue-500" />, initialPrice: 3500 },
  { symbol: 'BNBUSDT', name: 'BNB', icon: <SiBinance className="text-yellow-600" />, initialPrice: 700 },
  { symbol: 'SOLUSDT', name: 'Solana', icon: <div className="text-purple-500 font-bold">◎</div>, initialPrice: 240 },
  { symbol: 'XRPUSDT', name: 'XRP', icon: <div className="text-gray-400 font-bold">XRP</div>, initialPrice: 2.4 },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: <SiCardano className="text-blue-600" />, initialPrice: 1.05 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: <SiDogecoin className="text-yellow-500" />, initialPrice: 0.42 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: <div className="text-red-500 font-bold">AVAX</div>, initialPrice: 48 },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: <div className="text-purple-600 font-bold">MATIC</div>, initialPrice: 1.45 },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: <SiPolkadot className="text-pink-500" />, initialPrice: 8.5 }
]

// 탭 정의
const TABS = [
  { id: '종합', label: '종합 분석', icon: <FaChartLine className="w-4 h-4" />, description: 'CVD 종합 대시보드' },
  { id: 'CVD분석', label: 'CVD 분석', icon: <BiLineChart className="w-4 h-4" />, description: '누적 볼륨 델타 분석' },
  { id: '델타히스토그램', label: '델타 히스토그램', icon: <FaChartBar className="w-4 h-4" />, description: '델타 분포 분석' },
  { id: '다이버전스', label: '다이버전스', icon: <FaSignal className="w-4 h-4" />, description: '가격-CVD 다이버전스' },
  { id: '전략', label: '전략', icon: <FaCrosshairs className="w-4 h-4" />, description: '트레이딩 전략' },
  { id: '교육', label: '교육', icon: <FaGraduationCap className="w-4 h-4" />, description: 'CVD 학습 가이드' }
]

// CVD 데이터 생성 함수
function generateCVDData(length: number = 100) {
  const data = []
  let cvd = 0
  let price = 98000
  
  for (let i = 0; i < length; i++) {
    const buyVolume = Math.random() * 1000000 + 500000
    const sellVolume = Math.random() * 1000000 + 500000
    const delta = buyVolume - sellVolume
    cvd += delta
    
    // 가격 변동 (CVD와 약간 연관)
    price = price * (1 + (delta / 10000000) + (Math.random() - 0.5) * 0.002)
    
    data.push({
      time: new Date(Date.now() - (length - i) * 60000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(price),
      buyVolume: Math.round(buyVolume),
      sellVolume: Math.round(sellVolume),
      delta: Math.round(delta),
      cvd: Math.round(cvd),
      deltaPercent: ((buyVolume - sellVolume) / (buyVolume + sellVolume) * 100).toFixed(2)
    })
  }
  
  return data
}

export default function CVDModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(98000)
  const [priceChange, setPriceChange] = useState(2.45)
  const [volume24h, setVolume24h] = useState(25533000000)
  const [activeTab, setActiveTab] = useState('종합')
  const [cvdData, setCvdData] = useState(() => generateCVDData())
  const [isLoading, setIsLoading] = useState(false)
  
  // 실시간 업데이트
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 현재 CVD 값과 델타
  const currentCVD = cvdData[cvdData.length - 1]?.cvd || 0
  const currentDelta = cvdData[cvdData.length - 1]?.delta || 0
  const buyPressure = cvdData[cvdData.length - 1]?.buyVolume || 0
  const sellPressure = cvdData[cvdData.length - 1]?.sellVolume || 0
  
  // 선택된 코인 정보
  const selectedCoin = TRACKED_SYMBOLS.find(s => s.symbol === selectedSymbol)
  
  // 심볼 변경 핸들러
  const handleSymbolChange = useCallback((symbol: string) => {
    setIsLoading(true)
    setSelectedSymbol(symbol)
    
    // 새 코인 데이터 생성
    const coin = TRACKED_SYMBOLS.find(s => s.symbol === symbol)
    if (coin) {
      setCurrentPrice(coin.initialPrice)
      setPriceChange((Math.random() - 0.3) * 10) // -3% ~ +7%
      setVolume24h(Math.random() * 50000000000 + 10000000000) // 10B ~ 60B
      setCvdData(generateCVDData())
    }
    
    setTimeout(() => setIsLoading(false), 300)
  }, [])
  
  // 5초마다 실시간 업데이트
  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      setCvdData(prev => {
        const newData = [...prev.slice(1)]
        const lastItem = prev[prev.length - 1]
        
        const buyVolume = Math.random() * 1000000 + 500000
        const sellVolume = Math.random() * 1000000 + 500000
        const delta = buyVolume - sellVolume
        const newCvd = lastItem.cvd + delta
        const newPrice = lastItem.price * (1 + (delta / 10000000) + (Math.random() - 0.5) * 0.002)
        
        newData.push({
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          price: Math.round(newPrice),
          buyVolume: Math.round(buyVolume),
          sellVolume: Math.round(sellVolume),
          delta: Math.round(delta),
          cvd: Math.round(newCvd),
          deltaPercent: ((buyVolume - sellVolume) / (buyVolume + sellVolume) * 100).toFixed(2)
        })
        
        // 현재 가격 업데이트
        setCurrentPrice(Math.round(newPrice))
        setPriceChange(prev => prev + (Math.random() - 0.5) * 0.1)
        
        return newData
      })
    }, 5000)
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-2 md:p-6">
      {/* 헤더 */}
      <div className="max-w-[1920px] mx-auto mb-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BiBarChart className="w-8 h-8 text-purple-500" />
                CVD (Cumulative Volume Delta) 분석
              </h1>
              <p className="text-gray-400">누적 볼륨 델타를 통한 시장 압력 분석</p>
            </div>
            
            {/* 코인 선택기 */}
            <div className="flex flex-wrap gap-2">
              {TRACKED_SYMBOLS.map(coin => (
                <button
                  key={coin.symbol}
                  onClick={() => handleSymbolChange(coin.symbol)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    selectedSymbol === coin.symbol
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {coin.icon}
                  <span className="font-medium">{coin.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 가격 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">현재 가격</p>
              <p className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">현재 CVD</p>
              <p className={`text-2xl font-bold ${currentCVD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentCVD >= 0 ? '+' : ''}{(currentCVD / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm text-gray-400 mt-1">누적 델타</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">현재 델타</p>
              <p className={`text-2xl font-bold ${currentDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {currentDelta >= 0 ? '+' : ''}{(currentDelta / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {currentDelta >= 0 ? '매수 우세' : '매도 우세'}
              </p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">24시간 거래량</p>
              <p className="text-2xl font-bold text-blue-400">
                ${(volume24h / 1000000000).toFixed(2)}B
              </p>
              <p className="text-sm text-gray-400 mt-1">USDT</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 탭 */}
      <div className="max-w-[1920px] mx-auto mb-6">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="ml-2 text-xs opacity-80">{tab.description}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/50 rounded-xl p-12 text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">데이터 로딩 중...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === '종합' && (
                <CVDOverviewTab 
                  cvdData={cvdData}
                  currentCVD={currentCVD}
                  currentDelta={currentDelta}
                  buyPressure={buyPressure}
                  sellPressure={sellPressure}
                />
              )}
              {activeTab === 'CVD분석' && (
                <CVDAnalysisTab 
                  cvdData={cvdData}
                  currentPrice={currentPrice}
                />
              )}
              {activeTab === '델타히스토그램' && (
                <DeltaHistogramTab 
                  cvdData={cvdData}
                />
              )}
              {activeTab === '다이버전스' && (
                <DivergenceTab 
                  cvdData={cvdData}
                  currentPrice={currentPrice}
                />
              )}
              {activeTab === '전략' && (
                <StrategyTab 
                  cvdData={cvdData}
                  currentCVD={currentCVD}
                  currentDelta={currentDelta}
                />
              )}
              {activeTab === '교육' && (
                <EducationTab />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}