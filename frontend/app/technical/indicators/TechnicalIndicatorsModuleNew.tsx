'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaChartLine, FaChartBar, FaChartArea, FaBalanceScale,
  FaRobot, FaChartPie, FaWaveSquare, FaTachometerAlt,
  FaBitcoin, FaEthereum, FaSync, FaBell
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot } from 'react-icons/si'
import WebSocketManager from '@/lib/websocketManager'
import * as TI from '@/lib/technicalIndicators'
import { loadTradingConfig, getStrategyConfig, calculateConfidence } from '@/lib/configLoader'

// 탭 컴포넌트들
import {
  ComprehensiveTab,
  TrendTab,
  MomentumTab,
  VolatilityTab,
  VolumeTab,
  OscillatorTab,
  AIPredictionTab
} from './TabComponents'

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
  { id: '종합', label: '종합 분석', icon: <FaChartPie className="w-4 h-4" />, description: '모든 지표 종합' },
  { id: '추세', label: '추세 지표', icon: <FaChartLine className="w-4 h-4" />, description: '이동평균, ADX, 일목균형표' },
  { id: '모멘텀', label: '모멘텀', icon: <FaWaveSquare className="w-4 h-4" />, description: 'RSI, MACD, Stochastic' },
  { id: '변동성', label: '변동성', icon: <FaChartArea className="w-4 h-4" />, description: '볼린저밴드, ATR, 켈트너' },
  { id: '거래량', label: '거래량', icon: <FaChartBar className="w-4 h-4" />, description: 'OBV, MFI, CMF' },
  { id: '오실레이터', label: '오실레이터', icon: <FaTachometerAlt className="w-4 h-4" />, description: 'CCI, Williams %R' },
  { id: 'AI예측', label: 'AI 예측', icon: <FaRobot className="w-4 h-4" />, description: 'ML 기반 가격 예측' }
]

export default function TechnicalIndicatorsModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(98000)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('종합')
  const [config, setConfig] = useState<any>(null)
  
  // 과거 데이터
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [volumeHistory, setVolumeHistory] = useState<number[]>([])
  
  // WebSocket
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)
  
  // 지표 상태
  const [indicators, setIndicators] = useState<any>({
    // 이동평균
    sma: { sma10: 0, sma20: 0, sma50: 0, sma100: 0, sma200: 0 },
    ema: { ema12: 0, ema26: 0, ema50: 0, ema200: 0 },
    wma: 0,
    vwap: 0,
    hma: 0,
    vwma: 0,
    
    // 모멘텀
    rsi: 50,
    macd: { macdLine: 0, signal: 0, histogram: 0 },
    stochastic: { k: 50, d: 50 },
    cci: 0,
    williamsR: -50,
    roc: 0,
    ultimateOscillator: 50,
    
    // 변동성
    bollingerBands: { upper: 0, middle: 0, lower: 0, bandwidth: 0 },
    atr: 0,
    keltnerChannels: { upper: 0, middle: 0, lower: 0 },
    donchianChannels: { upper: 0, middle: 0, lower: 0 },
    standardDeviation: 0,
    choppiness: 50,
    
    // 거래량
    obv: 0,
    cmf: 0,
    mfi: 50,
    adLine: 0,
    
    // 트렌드
    adx: 0,
    parabolicSAR: 0,
    ichimoku: { tenkan: 0, kijun: 0, senkouA: 0, senkouB: 0, chikou: 0 },
    superTrend: 0,
    aroon: { up: 50, down: 50 },
    dmi: { plusDI: 0, minusDI: 0, adx: 0 },
    trix: 0,
    
    // 피보나치
    fibonacci: { level_0: 0, level_236: 0, level_382: 0, level_500: 0, level_618: 0, level_786: 0, level_1000: 0 },
    
    // 피벗
    pivotPoints: { pivot: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 }
  })

  // 설정 로드
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const tradingConfig = await loadTradingConfig()
        setConfig(tradingConfig)
      } catch (error) {
        console.error('설정 로드 실패:', error)
      }
    }
    loadConfig()
  }, [])

  // 과거 데이터 로드 (3000+ 포인트)
  const loadHistoricalData = useCallback(async () => {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${selectedSymbol}&interval=1m&limit=3000`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const processedData = data.data.map((kline: any) => ({
          time: new Date(kline[0]).toLocaleTimeString(),
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }))
        
        setHistoricalData(processedData)
        setPriceHistory(processedData.map((d: any) => d.close))
        setVolumeHistory(processedData.map((d: any) => d.volume))
        
        // 지표 계산
        calculateAllIndicators(processedData)
      }
    } catch (error) {
      console.error('과거 데이터 로드 실패:', error)
    }
  }, [selectedSymbol])

  // 모든 지표 계산
  const calculateAllIndicators = useCallback((data: any[]) => {
    if (data.length < 50) return
    
    const closes = data.map(d => d.close)
    const highs = data.map(d => d.high)
    const lows = data.map(d => d.low)
    const volumes = data.map(d => d.volume)
    
    // 이동평균
    const sma10 = TI.calculateSMA(closes, 10)
    const sma20 = TI.calculateSMA(closes, 20)
    const sma50 = TI.calculateSMA(closes, 50)
    const sma100 = TI.calculateSMA(closes, 100)
    const sma200 = TI.calculateSMA(closes, 200)
    
    const ema12 = TI.calculateEMA(closes, 12)
    const ema26 = TI.calculateEMA(closes, 26)
    const ema50 = TI.calculateEMA(closes, 50)
    const ema200 = TI.calculateEMA(closes, 200)
    
    // 모멘텀
    const rsi = TI.calculateRSI(closes)
    const macd = TI.calculateMACD(closes)
    const stochastic = TI.calculateStochastic(highs, lows, closes)
    const cci = TI.calculateCCI(highs, lows, closes)
    const williamsR = TI.calculateWilliamsR(highs, lows, closes)
    
    // 변동성
    const bollingerBands = TI.calculateBollingerBands(closes)
    const atr = TI.calculateATR(highs, lows, closes)
    const keltnerChannels = TI.calculateKeltnerChannels(highs, lows, closes)
    const standardDeviation = TI.calculateStandardDeviation(closes)
    
    // 거래량
    const obv = TI.calculateOBV(closes, volumes)
    const mfi = TI.calculateMFI(highs, lows, closes, volumes)
    const cmf = TI.calculateCMF(highs, lows, closes, volumes)
    const adLine = TI.calculateADLine(highs, lows, closes, volumes)
    const vwap = TI.calculateVWAP(highs, lows, closes, volumes)
    
    // 트렌드
    const adx = TI.calculateADX(highs, lows, closes)
    const parabolicSAR = TI.calculateParabolicSAR(highs, lows)
    const ichimoku = TI.calculateIchimoku(highs, lows, closes)
    const aroon = TI.calculateAroon(highs, lows)
    const dmi = TI.calculateDMI(highs, lows, closes)
    
    setIndicators({
      sma: { 
        sma10: sma10[sma10.length - 1] || 0,
        sma20: sma20[sma20.length - 1] || 0,
        sma50: sma50[sma50.length - 1] || 0,
        sma100: sma100[sma100.length - 1] || 0,
        sma200: sma200[sma200.length - 1] || 0
      },
      ema: {
        ema12: ema12[ema12.length - 1] || 0,
        ema26: ema26[ema26.length - 1] || 0,
        ema50: ema50[ema50.length - 1] || 0,
        ema200: ema200[ema200.length - 1] || 0
      },
      rsi: rsi[rsi.length - 1] || 50,
      macd: macd[macd.length - 1] || { macdLine: 0, signal: 0, histogram: 0 },
      stochastic: stochastic[stochastic.length - 1] || { k: 50, d: 50 },
      cci: cci[cci.length - 1] || 0,
      williamsR: williamsR[williamsR.length - 1] || -50,
      bollingerBands: bollingerBands[bollingerBands.length - 1] || { upper: 0, middle: 0, lower: 0, bandwidth: 0 },
      atr: atr[atr.length - 1] || 0,
      keltnerChannels: keltnerChannels[keltnerChannels.length - 1] || { upper: 0, middle: 0, lower: 0 },
      standardDeviation: standardDeviation[standardDeviation.length - 1] || 0,
      obv: obv[obv.length - 1] || 0,
      mfi: mfi[mfi.length - 1] || 50,
      cmf: cmf[cmf.length - 1] || 0,
      adLine: adLine[adLine.length - 1] || 0,
      vwap: vwap[vwap.length - 1] || 0,
      adx: adx[adx.length - 1] || 0,
      parabolicSAR: parabolicSAR[parabolicSAR.length - 1] || 0,
      ichimoku: ichimoku[ichimoku.length - 1] || { tenkan: 0, kijun: 0, senkouA: 0, senkouB: 0, chikou: 0 },
      aroon: aroon[aroon.length - 1] || { up: 50, down: 50 },
      dmi: dmi[dmi.length - 1] || { plusDI: 0, minusDI: 0, adx: 0 },
      choppiness: 50,
      roc: 0,
      ultimateOscillator: 50,
      trix: 0,
      wma: 0,
      hma: 0,
      vwma: 0,
      donchianChannels: { upper: 0, middle: 0, lower: 0 },
      superTrend: 0,
      fibonacci: { level_0: 0, level_236: 0, level_382: 0, level_500: 0, level_618: 0, level_786: 0, level_1000: 0 },
      pivotPoints: { pivot: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 }
    })
  }, [])

  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@ticker`)
    
    ws.onopen = () => {
      setLoading(false)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentPrice(parseFloat(data.c))
      setPriceChange(parseFloat(data.P))
      setVolume24h(parseFloat(data.v))
      
      // 실시간 데이터로 지표 업데이트
      if (historicalData.length > 0) {
        const newData = [...historicalData.slice(1), {
          time: new Date().toLocaleTimeString(),
          open: parseFloat(data.o),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          close: parseFloat(data.c),
          volume: parseFloat(data.v)
        }]
        setHistoricalData(newData)
        calculateAllIndicators(newData)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error)
      setLoading(false)
    }

    ws.onclose = () => {
      // 재연결 로직
      setTimeout(() => {
        if (wsRef.current === ws) {
          connectWebSocket()
        }
      }, 5000)
    }

    wsRef.current = ws
  }, [selectedSymbol, historicalData, calculateAllIndicators])

  // 심볼 변경 처리
  const handleSymbolChange = useCallback((symbol: string) => {
    // 기존 연결 종료
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    // 연결 지연
    clearTimeout(connectionDelayRef.current!)
    connectionDelayRef.current = setTimeout(() => {
      setSelectedSymbol(symbol)
      const symbolData = TRACKED_SYMBOLS.find(s => s.symbol === symbol)
      if (symbolData) {
        setCurrentPrice(symbolData.initialPrice)
      }
      setLoading(true)
      loadHistoricalData()
    }, 500)
  }, [loadHistoricalData])

  // 초기 로드
  useEffect(() => {
    loadHistoricalData()
  }, [loadHistoricalData])

  useEffect(() => {
    if (historicalData.length > 0) {
      connectWebSocket()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      clearTimeout(connectionDelayRef.current!)
    }
  }, [historicalData.length, connectWebSocket])

  // 탭 렌더링
  const renderTabContent = () => {
    const tabProps = {
      indicators,
      historicalData,
      currentPrice,
      priceHistory,
      volumeHistory,
      config
    }

    switch (activeTab) {
      case '종합':
        return <ComprehensiveTab {...tabProps} />
      case '추세':
        return <TrendTab {...tabProps} />
      case '모멘텀':
        return <MomentumTab {...tabProps} />
      case '변동성':
        return <VolatilityTab {...tabProps} />
      case '거래량':
        return <VolumeTab {...tabProps} />
      case '오실레이터':
        return <OscillatorTab {...tabProps} />
      case 'AI예측':
        return <AIPredictionTab {...tabProps} />
      default:
        return <ComprehensiveTab {...tabProps} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            📊 기술적 분석 지표
          </h1>
          <p className="text-gray-400 mt-2">30+ 지표를 활용한 실시간 AI 트레이딩 분석</p>
        </div>

        {/* 심볼 선택 */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">코인 선택</h3>
            <div className="flex items-center gap-2">
              <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''} text-gray-400`} />
              <span className="text-sm text-gray-400">실시간 업데이트</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {TRACKED_SYMBOLS.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => handleSymbolChange(coin.symbol)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedSymbol === coin.symbol
                    ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl">{coin.icon}</div>
                  <span className="text-xs font-medium">{coin.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 현재 가격 정보 */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">현재 가격</div>
              <div className="text-2xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">24시간 변화</div>
              <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">24시간 거래량</div>
              <div className="text-2xl font-bold text-white">
                {(volume24h / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-2 mb-6 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 border border-purple-500 text-white'
                    : 'bg-gray-800/50 border border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
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
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FaSync className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                  <p className="text-gray-400">데이터 로딩 중...</p>
                </div>
              </div>
            ) : (
              renderTabContent()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}