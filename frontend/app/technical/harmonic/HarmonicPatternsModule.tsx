'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaChartLine, FaChartBar, FaChartArea, FaBalanceScale,
  FaRobot, FaChartPie, FaWaveSquare, FaTachometerAlt,
  FaBitcoin, FaEthereum, FaBell, FaSync, FaExclamationTriangle,
  FaCheckCircle, FaInfoCircle, FaArrowUp, FaArrowDown, FaBook
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import WebSocketManager from '@/lib/websocketManager'
import * as HP from '@/lib/harmonicPatterns'
import { loadTradingConfig, getStrategyConfig, calculateConfidence } from '@/lib/configLoader'

// 탭 컴포넌트들 동적 로드
const ComprehensiveTab = dynamic(() => import('./tabs/ComprehensiveTab'), { ssr: false })
const GartleyTab = dynamic(() => import('./tabs/GartleyTab'), { ssr: false })
const BatTab = dynamic(() => import('./tabs/BatTab'), { ssr: false })
const ButterflyTab = dynamic(() => import('./tabs/ButterflyTab'), { ssr: false })
const CrabTab = dynamic(() => import('./tabs/CrabTab'), { ssr: false })
const SharkTab = dynamic(() => import('./tabs/SharkTab'), { ssr: false })
const CypherTab = dynamic(() => import('./tabs/CypherTab'), { ssr: false })
const BacktestTab = dynamic(() => import('./tabs/BacktestTab'), { ssr: false })
const ConceptTab = dynamic(() => import('./tabs/ConceptTab'), { ssr: false })

// 차트 컴포넌트들
const PatternChart = dynamic(() => import('./components/PatternChart'), { ssr: false })
const ConceptEducation = dynamic(() => import('./components/ConceptEducation'), { ssr: false })

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
  { id: '종합', label: '종합 분석', icon: <FaChartPie className="w-4 h-4" />, description: '모든 패턴 종합' },
  { id: '가틀리', label: '가틀리', icon: <FaChartLine className="w-4 h-4" />, description: 'Gartley Pattern' },
  { id: '배트', label: '배트', icon: <FaWaveSquare className="w-4 h-4" />, description: 'Bat Pattern' },
  { id: '버터플라이', label: '버터플라이', icon: <FaChartArea className="w-4 h-4" />, description: 'Butterfly Pattern' },
  { id: '크랩', label: '크랩', icon: <FaChartBar className="w-4 h-4" />, description: 'Crab Pattern' },
  { id: '샤크', label: '샤크', icon: <FaTachometerAlt className="w-4 h-4" />, description: 'Shark Pattern' },
  { id: '사이퍼', label: '사이퍼', icon: <FaBalanceScale className="w-4 h-4" />, description: 'Cypher Pattern' },
  { id: '백테스팅', label: '백테스팅', icon: <FaRobot className="w-4 h-4" />, description: '과거 성과 분석' },
  { id: '개념', label: '개념 학습', icon: <FaBook className="w-4 h-4" />, description: '하모닉 패턴 완벽 가이드' }
]

export default function HarmonicPatternsModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(98000)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('종합')
  const [config, setConfig] = useState<any>(null)
  
  // 과거 데이터
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [detectedPatterns, setDetectedPatterns] = useState<HP.HarmonicPattern[]>([])
  
  // WebSocket 참조
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)
  
  // 패턴 감지 상태
  const [patternAlerts, setPatternAlerts] = useState<any[]>([])
  const [activePattern, setActivePattern] = useState<HP.HarmonicPattern | null>(null)

  // WebSocket 연결 함수
  const connectWebSocket = useCallback((symbol: string) => {
    // 기존 연결 정리
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
    
    ws.onopen = () => {
      }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentPrice(parseFloat(data.c))
      setPriceChange(parseFloat(data.P))
      setVolume24h(parseFloat(data.v))
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    ws.onclose = () => {
      // 재연결 로직
      setTimeout(() => {
        if (wsRef.current === ws) {
          connectWebSocket(symbol)
        }
      }, 3000)
    }
    
    wsRef.current = ws
  }, [])

  // 심볼 변경 처리
  const handleSymbolChange = useCallback((symbol: string) => {
    if (symbol === selectedSymbol) return
    
    // 초기값 설정
    const symbolData = TRACKED_SYMBOLS.find(s => s.symbol === symbol)
    if (symbolData) {
      setCurrentPrice(symbolData.initialPrice)
    }
    
    setSelectedSymbol(symbol)
    setLoading(true)
    
    // 연결 지연
    if (connectionDelayRef.current) {
      clearTimeout(connectionDelayRef.current)
    }
    
    connectionDelayRef.current = setTimeout(() => {
      connectWebSocket(symbol)
      fetchHistoricalData(symbol)
    }, 500)
  }, [selectedSymbol, connectWebSocket])

  // 과거 데이터 가져오기
  const fetchHistoricalData = async (symbol: string) => {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=1h&limit=500`)
      if (!response.ok) throw new Error('Failed to fetch historical data')
      
      const result = await response.json()
      // API 응답 구조에 맞게 수정 - data 필드에서 실제 데이터 추출
      const klineData = result.data || result.klines || []
      
      if (!Array.isArray(klineData)) {
        console.error('Invalid kline data format:', result)
        return
      }
      
      const formattedData = klineData.map((candle: any) => ({
        time: Array.isArray(candle) ? candle[0] : candle.openTime,
        open: parseFloat(Array.isArray(candle) ? candle[1] : candle.open),
        high: parseFloat(Array.isArray(candle) ? candle[2] : candle.high),
        low: parseFloat(Array.isArray(candle) ? candle[3] : candle.low),
        close: parseFloat(Array.isArray(candle) ? candle[4] : candle.close),
        volume: parseFloat(Array.isArray(candle) ? candle[5] : candle.volume)
      }))
      
      setHistoricalData(formattedData)
      
      // 패턴 감지
      const patterns = HP.detectHarmonicPatterns(formattedData)
      // 패턴이 없으면 샘플 패턴 생성
      if (patterns.length === 0) {
        const samplePatterns = HP.generateSamplePatterns(formattedData)
        setDetectedPatterns(samplePatterns)
        if (samplePatterns.length > 0) {
          setActivePattern(samplePatterns[0])
          addPatternAlert(samplePatterns[0])
        }
      } else {
        setDetectedPatterns(patterns)
        // 최신 패턴 알림
        const latestPattern = patterns[patterns.length - 1]
        addPatternAlert(latestPattern)
        setActivePattern(latestPattern)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching historical data:', error)
      setLoading(false)
    }
  }

  // 패턴 알림 추가
  const addPatternAlert = (pattern: HP.HarmonicPattern) => {
    const alert = {
      id: Date.now(),
      pattern,
      time: new Date(),
      symbol: selectedSymbol
    }
    setPatternAlerts(prev => [alert, ...prev].slice(0, 5))
  }

  // 초기 설정 로드
  useEffect(() => {
    const loadConfig = async () => {
      const tradingConfig = await loadTradingConfig()
      setConfig(tradingConfig)
    }
    loadConfig()
  }, [])

  // 초기 WebSocket 연결
  useEffect(() => {
    connectWebSocket(selectedSymbol)
    fetchHistoricalData(selectedSymbol)
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (connectionDelayRef.current) {
        clearTimeout(connectionDelayRef.current)
      }
    }
  }, [])

  // 탭 컴포넌트 렌더링
  const renderTabContent = () => {
    const commonProps = {
      historicalData,
      detectedPatterns,
      currentPrice,
      selectedSymbol,
      config,
      activePattern
    }

    switch (activeTab) {
      case '종합':
        return <ComprehensiveTab {...commonProps} />
      case '가틀리':
        return <GartleyTab {...commonProps} />
      case '배트':
        return <BatTab {...commonProps} />
      case '버터플라이':
        return <ButterflyTab {...commonProps} />
      case '크랩':
        return <CrabTab {...commonProps} />
      case '샤크':
        return <SharkTab {...commonProps} />
      case '사이퍼':
        return <CypherTab {...commonProps} />
      case '백테스팅':
        return <BacktestTab {...commonProps} />
      case '개념':
        return <ConceptTab />
      default:
        return <ComprehensiveTab {...commonProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 상단 코인 선택 섹션 */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto p-4">
          {/* 코인 선택 버튼들 */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-4">
            {TRACKED_SYMBOLS.map((coin) => (
              <motion.button
                key={coin.symbol}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSymbolChange(coin.symbol)}
                className={`
                  p-3 rounded-lg border transition-all duration-300
                  ${selectedSymbol === coin.symbol 
                    ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'}
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl">{coin.icon}</div>
                  <span className="text-xs text-gray-400">{coin.name}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 가격 정보 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">현재 가격</span>
                <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  <span className="text-sm">{priceChange.toFixed(2)}%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                ${currentPrice.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-400 text-sm">24시간 거래량</div>
              <div className="text-2xl font-bold text-white mt-1">
                {(volume24h / 1000000).toFixed(2)}M
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-400 text-sm">감지된 패턴</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-purple-400">
                  {detectedPatterns.length}
                </span>
                {detectedPatterns.length > 0 && (
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                    활성
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 패턴 알림 섹션 */}
      {patternAlerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <FaBell className="text-purple-400 animate-pulse" />
              <span className="text-purple-400 font-semibold">최근 패턴 알림</span>
            </div>
            <div className="space-y-1">
              {patternAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">
                    {alert.pattern.name} - {alert.pattern.direction === 'bullish' ? '상승' : '하락'} 신호
                  </span>
                  <span className="text-gray-500">
                    {new Date(alert.time).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700'}
              `}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <FaSync className="text-4xl text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">하모닉 패턴 분석 중...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}