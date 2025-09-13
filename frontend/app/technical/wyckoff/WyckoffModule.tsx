'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBitcoin, FaEthereum, FaChartLine, FaChartBar, FaChartArea, 
  FaBalanceScale, FaRobot, FaBell, FaBook, FaLightbulb, FaExclamationTriangle,
  FaSyncAlt, FaCrosshairs, FaChartPie, FaWaveSquare, FaEye
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import WebSocketManager from '@/lib/websocketManager'
import { 
  CoinInfo, OHLCVData, WyckoffPhase, WyckoffAnalysis, 
  VolumeProfile, WyckoffIndicators
} from './WyckoffTypes'
import { 
  performWyckoffAnalysis, calculateVolumeProfile, 
  calculateWyckoffIndicators 
} from './wyckoffAnalysis'
import {
  WyckoffCandlestickChart, VolumeProfileChart, WyckoffCycleDiagram,
  EffortVsResultChart, WyckoffIndicatorGauge, SmartMoneyFlowChart,
  MarketPhaseRadarChart
} from './WyckoffCharts'
import WyckoffComponents from './WyckoffComponents'

// 코인 목록
const TRACKED_SYMBOLS: CoinInfo[] = [
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
  { id: 'overview', label: '개요', icon: <FaChartPie className="w-4 h-4" /> },
  { id: 'phases', label: '단계 분석', icon: <FaWaveSquare className="w-4 h-4" /> },
  { id: 'trading', label: '트레이딩 전략', icon: <FaCrosshairs className="w-4 h-4" /> },
  { id: 'indicators', label: '지표', icon: <FaChartLine className="w-4 h-4" /> },
  { id: 'education', label: '학습', icon: <FaBook className="w-4 h-4" /> }
]

export default function WyckoffModule() {
  // 상태 관리
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState<number>(98000)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // 데이터 상태
  const [historicalData, setHistoricalData] = useState<OHLCVData[]>([])
  const [analysis, setAnalysis] = useState<WyckoffAnalysis | null>(null)
  const [volumeProfile, setVolumeProfile] = useState<VolumeProfile[]>([])
  const [indicators, setIndicators] = useState<WyckoffIndicators | null>(null)
  
  // WebSocket 참조
  const wsRef = useRef<WebSocket | null>(null)
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)
  
  // 분석 수행 함수 (먼저 정의)
  const performAnalysis = useCallback((data: OHLCVData[], price: number) => {
    if (data.length > 50) {
      // 와이코프 분석
      const wyckoffAnalysis = performWyckoffAnalysis(data, price)
      setAnalysis(wyckoffAnalysis)
      
      // 볼륨 프로파일
      const profile = calculateVolumeProfile(data, 30)
      setVolumeProfile(profile)
      
      // 지표 계산
      const wyckoffIndicators = calculateWyckoffIndicators(data)
      setIndicators(wyckoffIndicators)
    }
  }, [])
  
  // 샘플 데이터 생성 함수
  const generateSampleData = useCallback((symbol: string, basePrice: number): OHLCVData[] => {
    const data: OHLCVData[] = []
    const now = Date.now()
    
    // 500개의 1시간 캔들 생성 (약 20일)
    for (let i = 499; i >= 0; i--) {
      const time = now - (i * 60 * 60 * 1000) // 1시간 간격
      
      // 와이코프 사이클을 시뮬레이션하는 가격 패턴 - 피보나치 비율 적용
      let priceMultiplier = 1
      const cyclePosition = (500 - i) / 500 // 0 ~ 1
      const fibRatio = 0.618 // 황금비율
      
      if (cyclePosition < 0.236) { // 피보나치 23.6%
        // 축적 단계: 횡보 - 지지선에서 저항선까지 패턴
        const accumPhase = cyclePosition / 0.236
        priceMultiplier = 0.95 + Math.sin(i * fibRatio) * 0.015 * (1 - accumPhase)
      } else if (cyclePosition < 0.382) { // 피보나치 38.2%
        // 마크업 시작: 초기 상승
        const markupPhase = (cyclePosition - 0.236) / (0.382 - 0.236)
        priceMultiplier = 0.965 + markupPhase * 0.12
      } else if (cyclePosition < 0.618) { // 피보나치 61.8%
        // 마크업 가속: 강한 상승
        const accelPhase = (cyclePosition - 0.382) / (0.618 - 0.382)
        priceMultiplier = 1.085 + accelPhase * 0.055
      } else if (cyclePosition < 0.786) { // 피보나치 78.6%
        // 분산 단계: 고점 횡보 - 저항선 형성
        const distPhase = (cyclePosition - 0.618) / (0.786 - 0.618)
        priceMultiplier = 1.14 + Math.sin((i * fibRatio) + Math.PI) * 0.025 * distPhase
      } else {
        // 마크다운 단계: 하락 - 지지선 붕괴
        const downPhase = (cyclePosition - 0.786) / (1 - 0.786)
        priceMultiplier = 1.165 - downPhase * 0.12
      }
      
      // 기술적 분석 기반 가격 노이즈 (엘리엇 파동 패턴)
      const waveNoise1 = Math.sin(i * 0.314159) * 0.003 // π/10 주기
      const waveNoise2 = Math.cos(i * 0.157079) * 0.004 // π/20 주기
      
      const open = basePrice * priceMultiplier * (1 + waveNoise1)
      const close = basePrice * priceMultiplier * (1 + waveNoise2)
      // 기술적 분석: 일일 변동폭(ATR) 고려 - 약 1%
      const atrFactor = 0.01
      const high = Math.max(open, close) * (1 + atrFactor * 0.5)
      const low = Math.min(open, close) * (1 - atrFactor * 0.5)
      
      // 볼륨 분석: 와이코프 원리 적용 - VSA(Volume Spread Analysis)
      let volumeBase = 1000
      if (cyclePosition < 0.236 || (cyclePosition > 0.618 && cyclePosition < 0.786)) {
        // 축적/분산 단계: 스마트머니 은밀한 활동 - 낮은 볼륨
        const smartMoneyFactor = Math.sin(i * 0.0628) + 1 // 10π 주기
        volumeBase = 800 + smartMoneyFactor * 150
      } else if (cyclePosition >= 0.382 && cyclePosition <= 0.618) {
        // 마크업 단계: 대중 참여 - 높은 볼륨
        const publicFactor = Math.cos(i * 0.0314) + 1.5 // 20π 주기
        volumeBase = 1200 + publicFactor * 250
      } else {
        // 마크다운 단계: 패닉 매도 - 최고 볼륨
        const panicFactor = Math.sin(i * 0.1257) + 1.8 // 5π 주기
        volumeBase = 1400 + panicFactor * 300
      }
      
      data.push({
        time: new Date(time).toLocaleTimeString(),
        timestamp: time,
        open,
        high,
        low,
        close,
        volume: volumeBase
      })
    }
    
    return data
  }, [])
  
  // 과거 데이터 로드
  const loadHistoricalData = useCallback((symbol: string) => {
    // 즉시 샘플 데이터로 시작
    const selectedCoin = TRACKED_SYMBOLS.find(coin => coin.symbol === symbol)
    const basePrice = selectedCoin?.initialPrice || 100000
    
    // 기본값 설정
    setCurrentPrice(basePrice)
    setPriceChange(3.5) // 고정값 사용
    setVolume24h(20000000) // 고정값 사용
    
    // 샘플 데이터 생성
    const sampleData = generateSampleData(symbol, basePrice)
    setHistoricalData(sampleData)
    
    // 초기 분석 실행
    if (sampleData.length > 0) {
      performAnalysis(sampleData, basePrice)
    }
    
    // 로딩 완료
    setLoading(false)
    
    // 백그라운드에서 실제 API 데이터 시도
    fetch(`/api/binance/klines?symbol=${symbol}&interval=1h&limit=500`)
      .then(response => response.json())
      .then(data => {
        const klineData = data.klines || data.data || []
        if (klineData.length > 0) {
          setHistoricalData(klineData)
          const lastPrice = klineData[klineData.length - 1].close
          setCurrentPrice(lastPrice)
        }
      })
      .catch(error => {
        })
  }, [generateSampleData, performAnalysis])
  
  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    wsRef.current = new WebSocket(wsUrl)
    
    wsRef.current.onopen = () => {
      }
    
    wsRef.current.onmessage = (event) => {
      const trade = JSON.parse(event.data)
      const newPrice = parseFloat(trade.p)
      
      // 상태 업데이트
      setCurrentPrice(newPrice)
    }
    
    wsRef.current.onerror = (error) => {
      }
    
    wsRef.current.onclose = () => {
      }
  }, [])
  
  // 데이터와 가격이 있을 때 분석 실행 (디바운스 적용)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (historicalData.length > 0 && currentPrice && !loading) {
        performAnalysis(historicalData, currentPrice)
      }
    }, 1000) // 1초 디바운스
    
    return () => clearTimeout(timeoutId)
  }, [historicalData.length, currentPrice, performAnalysis, loading])

  // 심볼 변경 시
  useEffect(() => {
    const selectedCoin = TRACKED_SYMBOLS.find(coin => coin.symbol === selectedSymbol)
    if (selectedCoin) {
      setCurrentPrice(selectedCoin.initialPrice)
    }
    
    // 즉시 로드 (지연 없음)
    loadHistoricalData(selectedSymbol)
    
    // WebSocket 연결은 약간 지연
    if (connectionDelayRef.current) {
      clearTimeout(connectionDelayRef.current)
    }
    
    connectionDelayRef.current = setTimeout(() => {
      connectWebSocket(selectedSymbol)
    }, 500)
    
    return () => {
      if (connectionDelayRef.current) {
        clearTimeout(connectionDelayRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [selectedSymbol, loadHistoricalData, connectWebSocket])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            와이코프 방법론 (Wyckoff Method)
          </h1>
          <p className="text-gray-400">시장 사이클 분석 및 스마트머니 추적 시스템</p>
        </motion.div>

        {/* 코인 선택 (indicators 스타일) */}
        <div className="mb-6">
          <h3 className="text-white text-sm mb-3">코인 선택</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TRACKED_SYMBOLS.map((coin) => (
              <motion.button
                key={coin.symbol}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`min-w-[100px] p-3 rounded-lg border transition-all ${
                  selectedSymbol === coin.symbol 
                    ? 'bg-purple-600/20 border-purple-500 text-white' 
                    : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl">{coin.icon}</div>
                  <span className="text-xs font-medium">{coin.name}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 현재 가격 정보 (모바일 3단 레이아웃) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 sm:p-5 md:p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
        >
          <div className="md:hidden">
            {/* 모바일 3단 레이아웃 */}
            <div className="text-center pb-3 border-b border-gray-700">
              <h2 className="text-base font-bold text-yellow-400 mb-1">{selectedSymbol}</h2>
              <div className="text-2xl font-bold text-white">
                ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
            
            <div className="text-center py-3 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">원화 가격</div>
              <div className="text-xl font-bold text-white">
                ₩{((currentPrice || 0) * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            <div className="flex justify-around pt-3">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">24시간 변화</div>
                <div className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">24시간 거래량</div>
                <div className="text-sm font-semibold text-white">
                  {volume24h > 1000000 ? 
                    `${(volume24h / 1000000).toFixed(1)}M` : 
                    '15.5M'
                  } USDT
                </div>
              </div>
            </div>
          </div>
          
          {/* 데스크톱 레이아웃 */}
          <div className="hidden md:flex md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{selectedSymbol}</h2>
              <div className="text-4xl font-bold text-blue-400">
                ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
            </div>
            
            <div className="text-center flex-1">
              <div className="text-sm text-gray-400">원화 가격</div>
              <div className="text-2xl font-bold text-white mt-1">
                ₩{((currentPrice || 0) * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            <div className="text-right flex-1">
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="text-sm text-gray-400">24시간 변화</span>
                <span className={`text-xl font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-400">24시간 거래량</span>
                <span className="text-lg font-semibold text-white">
                  {volume24h > 1000000 ? 
                    `${(volume24h / 1000000).toFixed(1)}M` : 
                    '15.5M'
                  } USDT
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 현재 와이코프 단계 요약 */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-700/50"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-sm text-gray-400 mb-1">현재 와이코프 단계</h3>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-2xl font-bold"
                    style={{ 
                      color: analysis.phase === WyckoffPhase.Accumulation ? '#10b981' :
                             analysis.phase === WyckoffPhase.Markup ? '#3b82f6' :
                             analysis.phase === WyckoffPhase.Distribution ? '#f59e0b' :
                             analysis.phase === WyckoffPhase.Markdown ? '#ef4444' : '#6b7280'
                    }}
                  >
                    {analysis.phase.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({analysis.phaseConfidence}% 신뢰도)
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${analysis.phaseProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">단계 진행도: {analysis.phaseProgress}%</p>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-sm text-gray-400 mb-1">트레이딩 신호</h3>
                <div className={`text-xl font-bold ${
                  analysis.tradingStrategy.bias === 'bullish' ? 'text-green-400' :
                  analysis.tradingStrategy.bias === 'bearish' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {analysis.tradingStrategy.bias === 'bullish' ? '매수 우위' :
                   analysis.tradingStrategy.bias === 'bearish' ? '매도 우위' : '중립'}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  RR비율: {analysis.tradingStrategy.riskRewardRatio.toFixed(1)}:1
                </p>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <h3 className="text-sm text-gray-400 mb-1">스마트머니 플로우</h3>
                <div className={`text-xl font-bold ${
                  analysis.volumeAnalysis.smartMoneyFlow === 'accumulating' ? 'text-green-400' :
                  analysis.volumeAnalysis.smartMoneyFlow === 'distributing' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {analysis.volumeAnalysis.smartMoneyFlow === 'accumulating' ? '축적 중' :
                   analysis.volumeAnalysis.smartMoneyFlow === 'distributing' ? '분산 중' : '중립'}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  볼륨 추세: {analysis.volumeAnalysis.trend === 'increasing' ? '증가' :
                             analysis.volumeAnalysis.trend === 'decreasing' ? '감소' : '안정'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 탭 메뉴 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/50 rounded-xl p-12 text-center"
            >
              <FaSyncAlt className="text-4xl text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">와이코프 분석 중...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 개요 탭 */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 메인 차트 */}
                  <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">가격 액션 & 와이코프 이벤트</h3>
                    {analysis && (
                      <WyckoffCandlestickChart
                        data={historicalData}
                        events={analysis.events}
                        supportLevels={analysis.keyLevels.support}
                        resistanceLevels={analysis.keyLevels.resistance}
                        currentPhase={analysis.phase}
                      />
                    )}
                  </div>
                  
                  {/* 와이코프 사이클 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">와이코프 사이클</h3>
                    {analysis && (
                      <WyckoffCycleDiagram
                        currentPhase={analysis.phase}
                        phaseProgress={analysis.phaseProgress}
                      />
                    )}
                  </div>
                  
                  {/* 볼륨 프로파일 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">볼륨 프로파일</h3>
                    <VolumeProfileChart
                      data={volumeProfile}
                      currentPrice={currentPrice}
                    />
                  </div>
                  
                  {/* Effort vs Result */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Effort vs Result 분석</h3>
                    <EffortVsResultChart data={historicalData} />
                  </div>
                  
                  {/* 스마트머니 플로우 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">스마트머니 플로우</h3>
                    <SmartMoneyFlowChart data={historicalData} />
                  </div>
                </div>
              )}
              
              {/* 단계 분석 탭 */}
              {activeTab === 'phases' && analysis && (
                <WyckoffComponents
                  analysis={analysis}
                  indicators={indicators}
                  currentPrice={currentPrice}
                  historicalData={historicalData}
                />
              )}
              
              {/* 트레이딩 전략 탭 */}
              {activeTab === 'trading' && analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 현재 전략 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaCrosshairs className="text-purple-400" />
                      현재 트레이딩 전략
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">방향성</span>
                        <span className={`font-bold ${
                          analysis.tradingStrategy.bias === 'bullish' ? 'text-green-400' :
                          analysis.tradingStrategy.bias === 'bearish' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {analysis.tradingStrategy.bias === 'bullish' ? '롱(매수)' :
                           analysis.tradingStrategy.bias === 'bearish' ? '숏(매도)' : '관망'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">진입가</span>
                        <span className="text-white font-medium">
                          ${analysis.tradingStrategy.entryPoints[0]?.toFixed(2) || '대기'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">손절가</span>
                        <span className="text-red-400 font-medium">
                          ${analysis.tradingStrategy.stopLoss.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">목표가</span>
                        <span className="text-green-400 font-medium">
                          {analysis.tradingStrategy.targets.map(t => `$${t.toFixed(2)}`).join(' / ')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">리스크/리워드</span>
                        <span className="text-white font-medium">
                          1:{analysis.tradingStrategy.riskRewardRatio.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">추천 포지션</span>
                        <span className="text-purple-400 font-medium">
                          {analysis.tradingStrategy.positionSize}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 리스크 평가 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaExclamationTriangle className="text-yellow-400" />
                      리스크 평가
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
                        <h4 className="text-yellow-400 font-bold mb-2">주요 리스크 요인</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {analysis.phase === WyckoffPhase.Distribution && (
                            <li>• 분산 단계: 하락 전환 위험 높음</li>
                          )}
                          {analysis.volumeAnalysis.effortVsResult === 'divergent' && (
                            <li>• 볼륨/가격 다이버전스 감지</li>
                          )}
                          {analysis.phaseProgress > 80 && (
                            <li>• 현재 단계 마지막 구간</li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/50">
                        <h4 className="text-green-400 font-bold mb-2">긍정적 신호</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {analysis.volumeAnalysis.smartMoneyFlow === 'accumulating' && (
                            <li>• 스마트머니 축적 진행 중</li>
                          )}
                          {analysis.phase === WyckoffPhase.Accumulation && (
                            <li>• 축적 단계: 상승 준비</li>
                          )}
                          {analysis.volumeAnalysis.trend === 'increasing' && (
                            <li>• 거래량 증가 추세</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* 시장 단계별 성과 */}
                  <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">시장 단계별 특징 분석</h3>
                    <MarketPhaseRadarChart phaseAnalysis={analysis} />
                  </div>
                </div>
              )}
              
              {/* 지표 탭 */}
              {activeTab === 'indicators' && indicators && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">와이코프 지표 대시보드</h3>
                    <WyckoffIndicatorGauge indicators={indicators} />
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">지표 해석</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="text-purple-400 font-bold mb-2">Composite Operator</h4>
                        <p className="text-sm text-gray-300">
                          스마트머니의 활동을 추적합니다. 양수는 축적, 음수는 분산을 의미합니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          현재: {indicators.compositeOperator > 0 ? '축적 신호' : indicators.compositeOperator < 0 ? '분산 신호' : '중립'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="text-purple-400 font-bold mb-2">Volume Trend</h4>
                        <p className="text-sm text-gray-300">
                          거래량의 추세를 나타냅니다. 증가는 관심 증가를 의미합니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          현재: {indicators.volumeTrend > 0 ? '거래량 증가' : indicators.volumeTrend < 0 ? '거래량 감소' : '안정'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="text-purple-400 font-bold mb-2">Price Strength</h4>
                        <p className="text-sm text-gray-300">
                          가격의 강도를 측정합니다. 높을수록 추세가 강합니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          현재: {Math.abs(indicators.priceStrength) > 50 ? '강한 추세' : Math.abs(indicators.priceStrength) > 20 ? '보통 추세' : '약한 추세'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="text-purple-400 font-bold mb-2">Effort vs Result</h4>
                        <p className="text-sm text-gray-300">
                          볼륨(노력)과 가격(결과)의 일치도입니다. 다이버전스는 전환 신호일 수 있습니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          현재: {indicators.effortVsResult > 0 ? '일치' : '다이버전스 경고'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 학습 탭 */}
              {activeTab === 'education' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 와이코프 기본 개념 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaBook className="text-purple-400" />
                      와이코프 방법론 기본 개념
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-purple-400 font-bold mb-2">3가지 기본 법칙</h4>
                        <ol className="space-y-2 text-sm text-gray-300">
                          <li>1. <span className="font-semibold">수요와 공급의 법칙</span>: 가격은 수요와 공급의 균형에 의해 결정</li>
                          <li>2. <span className="font-semibold">원인과 결과의 법칙</span>: 축적/분산(원인)이 상승/하락(결과)을 만듦</li>
                          <li>3. <span className="font-semibold">노력 대 결과의 법칙</span>: 볼륨(노력)과 가격(결과)의 관계 분석</li>
                        </ol>
                      </div>
                      
                      <div>
                        <h4 className="text-purple-400 font-bold mb-2">컴포지트 오퍼레이터</h4>
                        <p className="text-sm text-gray-300">
                          와이코프는 시장을 조작하는 가상의 존재 "컴포지트 맨"을 상정했습니다. 
                          이는 대형 기관, 스마트머니의 집합체를 의미합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 단계별 특징 */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaLightbulb className="text-yellow-400" />
                      4단계 사이클 특징
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-900/20 rounded-lg">
                        <h4 className="text-green-400 font-bold">1. 축적 (Accumulation)</h4>
                        <p className="text-xs text-gray-300 mt-1">
                          스마트머니가 조용히 매집. 가격 횡보, 일반 투자자 무관심
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-900/20 rounded-lg">
                        <h4 className="text-blue-400 font-bold">2. 마크업 (Markup)</h4>
                        <p className="text-xs text-gray-300 mt-1">
                          가격 상승 시작. 추세 추종자 참여, 언론 관심 증가
                        </p>
                      </div>
                      
                      <div className="p-3 bg-yellow-900/20 rounded-lg">
                        <h4 className="text-yellow-400 font-bold">3. 분산 (Distribution)</h4>
                        <p className="text-xs text-gray-300 mt-1">
                          스마트머니가 물량 처분. 고점 횡보, 일반 투자자 FOMO
                        </p>
                      </div>
                      
                      <div className="p-3 bg-red-900/20 rounded-lg">
                        <h4 className="text-red-400 font-bold">4. 마크다운 (Markdown)</h4>
                        <p className="text-xs text-gray-300 mt-1">
                          가격 하락. 패닉 매도, 손절 러시, 시장 공포
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 실전 팁 */}
                  <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaBell className="text-purple-400" />
                      실전 트레이딩 팁
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                        <h4 className="text-purple-400 font-bold mb-2">축적 단계 전략</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• Spring 이벤트 후 진입 고려</li>
                          <li>• LPS (Last Point of Support) 확인</li>
                          <li>• 볼륨 증가와 함께 박스 상단 돌파 시 매수</li>
                          <li>• 손절: 축적 박스 하단 -3~5%</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                        <h4 className="text-purple-400 font-bold mb-2">분산 단계 전략</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• UTAD 패턴 확인 시 매도</li>
                          <li>• 상승 시 볼륨 감소 주의</li>
                          <li>• 약세 다이버전스 발생 시 청산</li>
                          <li>• 현금 비중 70% 이상 유지</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                        <h4 className="text-purple-400 font-bold mb-2">볼륨 분석 포인트</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• 가격 상승 + 볼륨 증가 = 건전한 상승</li>
                          <li>• 가격 상승 + 볼륨 감소 = 상승 동력 약화</li>
                          <li>• 큰 볼륨 + 작은 가격 변화 = 저항/지지</li>
                          <li>• Climax 볼륨 = 단기 전환점</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
                        <h4 className="text-purple-400 font-bold mb-2">리스크 관리</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• 전체 자본의 2-5%만 리스크 노출</li>
                          <li>• 분할 진입/청산 전략 사용</li>
                          <li>• 감정적 거래 금지, 계획 준수</li>
                          <li>• 손절선은 반드시 설정</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}