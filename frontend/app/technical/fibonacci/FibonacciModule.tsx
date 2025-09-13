'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaChartLine, FaChartBar, FaChartArea, FaBalanceScale,
  FaRobot, FaChartPie, FaWaveSquare, FaTachometerAlt,
  FaBitcoin, FaEthereum, FaSync, FaBell, FaInfoCircle,
  FaBookOpen, FaGraduationCap, FaCalculator
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import WebSocketManager from '@/lib/websocketManager'
import * as FibAnalysis from '@/lib/fibonacciAnalysis'
import { loadTradingConfig } from '@/lib/configLoader'

// 탭 컴포넌트들 (동적 임포트)
const ComprehensiveTab = dynamic(() => import('./TabComponents').then(mod => mod.ComprehensiveTab))
const ConceptTab = dynamic(() => import('./TabComponents').then(mod => mod.ConceptTab))
const RetracementTab = dynamic(() => import('./TabComponents').then(mod => mod.RetracementTab))
const ExtensionTab = dynamic(() => import('./TabComponents').then(mod => mod.ExtensionTab))
const FanArcTab = dynamic(() => import('./TabComponents').then(mod => mod.FanArcTab))
const ClusterTab = dynamic(() => import('./TabComponents').then(mod => mod.ClusterTab))
const SignalTab = dynamic(() => import('./TabComponents').then(mod => mod.SignalTab))
const AIAnalysisTab = dynamic(() => import('./TabComponents').then(mod => mod.AIAnalysisTab))

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
  { id: '종합', label: '종합 대시보드', icon: <FaChartPie className="w-4 h-4" />, description: '모든 피보나치 도구' },
  { id: '개념', label: '개념 설명', icon: <FaBookOpen className="w-4 h-4" />, description: '이론 & AI 예측' },
  { id: '되돌림', label: '되돌림 분석', icon: <FaChartLine className="w-4 h-4" />, description: 'Retracement 상세' },
  { id: '확장', label: '확장 분석', icon: <FaChartArea className="w-4 h-4" />, description: 'Extension 타겟' },
  { id: '팬/아크', label: '팬 & 아크', icon: <FaWaveSquare className="w-4 h-4" />, description: '시간대별 분석' },
  { id: '클러스터', label: '클러스터', icon: <FaBalanceScale className="w-4 h-4" />, description: '합류점 분석' },
  { id: '시그널', label: '실시간 시그널', icon: <FaBell className="w-4 h-4" />, description: '자동 레벨 탐지' },
  { id: 'AI예측', label: 'AI 예측', icon: <FaRobot className="w-4 h-4" />, description: 'ML 패턴 인식' }
]

export default function FibonacciModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(98000)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('종합')
  const [config, setConfig] = useState<any>(null)
  const [showConcept, setShowConcept] = useState(false)
  
  // 과거 데이터
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [volumeHistory, setVolumeHistory] = useState<number[]>([])
  const [candleData, setCandleData] = useState<any[]>([])
  
  // 피보나치 데이터
  const [fibonacciData, setFibonacciData] = useState<FibAnalysis.FibonacciData | null>(null)
  const [tradingStrategy, setTradingStrategy] = useState<FibAnalysis.FibonacciTradingStrategy | null>(null)
  
  // WebSocket 및 고빈도 업데이트
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // 피보나치 계산 상태 - 기본값 설정
  const [swingHigh, setSwingHigh] = useState(100000)
  const [swingLow, setSwingLow] = useState(95000)
  const [swing3, setSwing3] = useState(97000)
  
  // 설정 로드 및 초기 피보나치 계산
  useEffect(() => {
    async function loadConfig() {
      try {
        const tradingConfig = await loadTradingConfig()
        setConfig(tradingConfig)
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }
    loadConfig()
    
    // 초기 피보나치 데이터 계산
    const initialFibData = FibAnalysis.performComprehensiveFibonacciAnalysis(
      100000,
      95000,
      98000,
      97000,
      [{ high: 100000, low: 95000 }]
    )
    setFibonacciData(initialFibData)
    
    const initialStrategy = FibAnalysis.generateFibonacciTradingStrategy(initialFibData, 98000, 2)
    setTradingStrategy(initialStrategy)
  }, [])

  // 과거 데이터 로드
  const loadHistoricalData = useCallback(async (symbol: string) => {
    try {
      // 24시간 티커 정보 가져오기
      try {
        const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        if (tickerResponse.ok) {
          const ticker = await tickerResponse.json()
          setPriceChange(parseFloat(ticker.priceChangePercent || '0'))
          setVolume24h(parseFloat(ticker.quoteVolume || ticker.volume * ticker.lastPrice || '0'))
          setCurrentPrice(parseFloat(ticker.lastPrice || '0'))
        }
      } catch (error) {
        }
      
      // Kline 데이터 가져오기 (프록시 서버 사용)
      const klineResponse = await fetch(`/api/binance/klines?symbol=${symbol}&interval=15m&limit=500`)
      if (klineResponse.ok) {
        const klines = await klineResponse.json()
        
        // 캔들 데이터 변환 (배열 확인)
        const candles = Array.isArray(klines) ? klines.map((k: any) => ({
          time: new Date(k[0]),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5])
        })) : []
        
        setCandleData(candles)
        
        // 가격 히스토리
        const prices = candles.map((c: any) => c.close)
        setPriceHistory(prices)
        
        // 볼륨 히스토리
        const volumes = candles.map((c: any) => c.volume)
        setVolumeHistory(volumes)
        
        // 스윙 고점/저점 찾기
        const highs = candles.map((c: any) => c.high)
        const lows = candles.map((c: any) => c.low)
        const maxHigh = highs.length > 0 ? Math.max(...highs.slice(-100)) : 100000
        const minLow = lows.length > 0 ? Math.min(...lows.slice(-100)) : 95000
        const recentSwing = prices[prices.length - 20] || prices[prices.length - 1] || 97000
        
        setSwingHigh(maxHigh)
        setSwingLow(minLow)
        setSwing3(recentSwing)
        
        // 히스토리컬 데이터
        const historical = candles.slice(-200).map((c: any, i: number) => ({
          time: c.time,
          price: c.close,
          high: c.high,
          low: c.low,
          volume: c.volume,
          index: i
        }))
        
        setHistoricalData(historical)
        
        // 즉시 피보나치 데이터 계산
        const selectedCoin = TRACKED_SYMBOLS.find(s => s.symbol === symbol)
        const lastPrice = prices[prices.length - 1] || selectedCoin?.initialPrice || 0
        if (maxHigh > 0 && minLow > 0 && lastPrice > 0) {
          const historicalHighLow = historical.map(d => ({ high: d.high, low: d.low }))
          const fibData = FibAnalysis.performComprehensiveFibonacciAnalysis(
            maxHigh,
            minLow,
            lastPrice,
            recentSwing,
            historicalHighLow
          )
          setFibonacciData(fibData)
          
          // 트레이딩 전략 생성
          const strategy = FibAnalysis.generateFibonacciTradingStrategy(fibData, lastPrice, 2)
          setTradingStrategy(strategy)
        }
      }
    } catch (error) {
      console.error('Failed to load historical data:', error)
      // 에러 시 초기값 사용
      const selectedCoin = TRACKED_SYMBOLS.find(s => s.symbol === symbol)
      if (selectedCoin) {
        const price = selectedCoin.initialPrice
        setCurrentPrice(price)
        const high = price * 1.2
        const low = price * 0.8
        const swing = price * 0.95
        setSwingHigh(high)
        setSwingLow(low)
        setSwing3(swing)
        
        // 초기 피보나치 데이터 생성
        const fibData = FibAnalysis.performComprehensiveFibonacciAnalysis(
          high,
          low,
          price,
          swing,
          []
        )
        setFibonacciData(fibData)
        
        // 트레이딩 전략 생성
        const strategy = FibAnalysis.generateFibonacciTradingStrategy(fibData, price, 2)
        setTradingStrategy(strategy)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    // 기존 연결 정리
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    try {
      const streamName = `${symbol.toLowerCase()}@ticker`
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)
      
      ws.onopen = () => {
        }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const price = parseFloat(data.c || data.p || '0')
          const changePercent = parseFloat(data.P || '0')
          const volume = parseFloat(data.q || '0')
          
          if (price > 0) {
            setCurrentPrice(price)
            setPriceChange(changePercent)
            if (volume > 0) setVolume24h(volume)
            
            // 가격 히스토리 업데이트
            setPriceHistory(prev => {
              const newHistory = [...prev, price]
              return newHistory.slice(-500)
            })
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }
      
      ws.onerror = (event) => {
        // 에러 발생 시 재연결 시도를 위해 연결 종료
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
      
      ws.onclose = (event) => {
        // 정상 종료가 아닌 경우에만 재연결
        if (event.code !== 1000 && event.code !== 1001) {
          setError('WebSocket 연결이 끊어졌습니다. 재연결 중...')
          setTimeout(() => {
            if (wsRef.current === ws) {
              setError(null)
              connectWebSocket(symbol)
            }
          }, 3000)
        }
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket connection error:', error)
    }
  }, [])

  // 심볼 변경 시 처리
  useEffect(() => {
    // 기존 연결 정리
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    // 초기값 설정
    const selectedCoin = TRACKED_SYMBOLS.find(s => s.symbol === selectedSymbol)
    if (selectedCoin) {
      setCurrentPrice(selectedCoin.initialPrice)
    }
    
    // 데이터 로드
    setLoading(true)
    loadHistoricalData(selectedSymbol)
    
    // WebSocket 연결 지연
    clearTimeout(connectionDelayRef.current)
    connectionDelayRef.current = setTimeout(() => {
      connectWebSocket(selectedSymbol)
    }, 500)
    
    return () => {
      clearTimeout(connectionDelayRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [selectedSymbol, connectWebSocket, loadHistoricalData])

  // 피보나치 데이터 계산
  useEffect(() => {
    if (swingHigh > 0 && swingLow > 0 && currentPrice > 0) {
      const historicalHighLow = historicalData.length > 0 
        ? historicalData.map(d => ({ high: d.high, low: d.low }))
        : []
      
      const fibData = FibAnalysis.performComprehensiveFibonacciAnalysis(
        swingHigh,
        swingLow,
        currentPrice,
        swing3 > 0 ? swing3 : currentPrice * 0.95,
        historicalHighLow
      )
      setFibonacciData(fibData)
      
      // 트레이딩 전략 생성
      const strategy = FibAnalysis.generateFibonacciTradingStrategy(fibData, currentPrice, 2)
      setTradingStrategy(strategy)
    }
  }, [swingHigh, swingLow, currentPrice, swing3, historicalData])

  // 탭 컴포넌트 렌더링
  const renderTabContent = () => {
    const props = {
      fibonacciData,
      tradingStrategy,
      currentPrice,
      priceHistory,
      volumeHistory,
      candleData,
      historicalData,
      selectedSymbol,
      swingHigh,
      swingLow,
      swing3
    }
    
    switch (activeTab) {
      case '종합':
        return <ComprehensiveTab {...props} />
      case '개념':
        return <ConceptTab {...props} />
      case '되돌림':
        return <RetracementTab {...props} />
      case '확장':
        return <ExtensionTab {...props} />
      case '팬/아크':
        return <FanArcTab {...props} />
      case '클러스터':
        return <ClusterTab {...props} />
      case '시그널':
        return <SignalTab {...props} />
      case 'AI예측':
        return <AIAnalysisTab {...props} />
      default:
        return <ComprehensiveTab {...props} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 섹션 */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaChartLine className="text-purple-500" />
                피보나치 전문 분석
              </h1>
              <p className="text-gray-400 mt-1">황금비율 기반 정밀 가격 분석 및 예측 시스템</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowConcept(!showConcept)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
              >
                <FaBookOpen />
                <span className="hidden sm:inline">개념 설명</span>
              </button>
              <button
                onClick={() => loadHistoricalData(selectedSymbol)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FaSync className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">새로고침</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 피보나치 개념 설명 (토글 가능) */}
      <AnimatePresence>
        {showConcept && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-purple-700/30 overflow-hidden"
          >
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-purple-400" />
                    황금비율 (Golden Ratio)
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    피보나치 수열에서 나타나는 신비한 비율 1.618...
                    자연과 예술, 금융시장에서 반복적으로 관찰됩니다.
                  </p>
                  <div className="flex items-center justify-center py-4">
                    <div className="text-4xl font-bold text-purple-400">Φ = 1.618</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <FaGraduationCap className="text-blue-400" />
                    주요 되돌림 레벨
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">23.6%</span>
                      <span className="text-blue-400">약한 되돌림</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">38.2%</span>
                      <span className="text-green-400">보통 되돌림</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">61.8%</span>
                      <span className="text-red-400 font-bold">황금 되돌림</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">78.6%</span>
                      <span className="text-purple-400">깊은 되돌림</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <FaCalculator className="text-green-400" />
                    실전 활용법
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>상승 추세: 38.2%, 50%, 61.8% 되돌림에서 매수</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>하락 추세: 반등 레벨에서 매도 진입</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>목표가: 161.8%, 261.8% 확장 레벨</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 코인 선택 섹션 */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {TRACKED_SYMBOLS.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`p-3 rounded-lg transition-all ${
                  selectedSymbol === coin.symbol
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{coin.icon}</span>
                  <span className="text-sm font-medium">{coin.name.slice(0, 4)}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* 현재 선택된 코인 정보 */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400">현재 가격</div>
              <div className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </div>
              <div className={`text-sm mt-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400">24시간 거래량</div>
              <div className="text-2xl font-bold text-white">
                ${(volume24h / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-gray-500 mt-1">USDT</div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400">피보나치 위치</div>
              <div className="text-lg font-bold text-purple-400">
                {fibonacciData?.currentPosition || '계산 중...'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                추세: <span className={`font-bold ${
                  fibonacciData?.trend === 'bullish' ? 'text-green-400' : 
                  fibonacciData?.trend === 'bearish' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {fibonacciData?.trend === 'bullish' ? '상승' :
                   fibonacciData?.trend === 'bearish' ? '하락' : '중립'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-800 sticky top-[72px] z-30">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto scrollbar-hide py-3 gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="text-center">
              <FaSync className="text-6xl text-purple-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">데이터 로딩 중...</h2>
              <p className="text-gray-400">실시간 피보나치 분석을 준비하고 있습니다</p>
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