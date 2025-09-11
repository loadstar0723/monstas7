'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { 
  FaChartLine, FaChartBar, FaChartArea, FaBalanceScale,
  FaRobot, FaGraduationCap, FaLightbulb, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaSync, FaDownload, FaExpand,
  FaBell, FaCog, FaInfoCircle, FaFireAlt, FaArrowUp, FaArrowDown,
  FaTachometerAlt, FaWaveSquare, FaShieldAlt, FaBrain, FaEye,
  FaCalculator, FaChartPie, FaMagic, FaRocket, FaBitcoin, FaEthereum,
  FaChartLine as FaTrend, FaWaveSquare as FaMomentum, 
  FaChartArea as FaVolatility, FaChartBar as FaVolume,
  FaTachometerAlt as FaOscillator, FaBrain as FaAI
} from 'react-icons/fa'
import { SiBinance, SiCardano, SiDogecoin, SiPolkadot, SiChainlink } from 'react-icons/si'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Brush, ScatterChart, Scatter, PieChart, Pie, Cell
} from 'recharts'
import WebSocketManager from '@/lib/websocketManager'
import * as TI from '@/lib/technicalIndicators'
import { monochromeTheme } from '@/lib/monochromeTheme'
import { 
  analyzeRSI, analyzeMACD, analyzeBollingerBands, 
  analyzeStochastic, analyzeMultipleIndicators 
} from '@/lib/dynamicAnalysisEngine'
import { loadTradingConfig, getStrategyConfig, calculateConfidence } from '@/lib/configLoader'

// 동적 분석 컴포넌트들
import RSIDynamicAnalysis from '@/components/analysis/RSIDynamicAnalysis'
import MACDDynamicAnalysis from '@/components/analysis/MACDDynamicAnalysis'
import BollingerDynamicAnalysis from '@/components/analysis/BollingerDynamicAnalysis'
import VolumeDynamicAnalysis from '@/components/analysis/VolumeDynamicAnalysis'

// 모노크롬 차트 컴포넌트 동적 임포트
const MovingAverageRibbonChart = dynamic(() => 
  import('@/components/charts/MovingAverageCharts').then(mod => mod.MovingAverageRibbonChart), 
  { ssr: false }
)
const CrossoverSignalChart = dynamic(() => 
  import('@/components/charts/MovingAverageCharts').then(mod => mod.CrossoverSignalChart), 
  { ssr: false }
)
const RSIHistogramChart = dynamic(() => 
  import('@/components/charts/MomentumCharts').then(mod => mod.RSIHistogramChart), 
  { ssr: false }
)
const MACDAdvancedChart = dynamic(() => 
  import('@/components/charts/MomentumCharts').then(mod => mod.MACDAdvancedChart), 
  { ssr: false }
)
const StochasticSmoothChart = dynamic(() => 
  import('@/components/charts/MomentumCharts').then(mod => mod.StochasticSmoothChart), 
  { ssr: false }
)
const BollingerSqueezeChart = dynamic(() => 
  import('@/components/charts/VolatilityCharts').then(mod => mod.BollingerSqueezeChart), 
  { ssr: false }
)
const ADXTrendStrength = dynamic(() => 
  import('@/components/charts/TrendCharts').then(mod => mod.ADXTrendStrength), 
  { ssr: false }
)
const IchimokuCloudChart = dynamic(() => 
  import('@/components/charts/TrendCharts').then(mod => mod.IchimokuCloudChart), 
  { ssr: false }
)
const OBVFlowChart = dynamic(() => 
  import('@/components/charts/VolumeCharts').then(mod => mod.OBVFlowChart), 
  { ssr: false }
)
const MFIHeatmap = dynamic(() => 
  import('@/components/charts/VolumeCharts').then(mod => mod.MFIHeatmap), 
  { ssr: false }
)

// 타입 정의
interface PricePrediction {
  timeframe: string
  predictedPrice: number
  confidence: number
  direction: 'UP' | 'DOWN' | 'NEUTRAL'
  supportLevel: number
  resistanceLevel: number
  stopLoss: number
  takeProfit: number[]
  riskReward: number
  entryZones: number[]
  analysis: string
  probability: number
}

interface TradingStrategy {
  name: string
  type: 'SCALPING' | 'DAY_TRADING' | 'SWING' | 'POSITION'
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'
  confidence: number
  entry: number[]
  stopLoss: number
  targets: number[]
  leverage: { min: number, max: number, recommended: number }
  positionSize: number
  timeHorizon: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  expectedReturn: { min: number, max: number }
  winProbability: number
  reasoning: string[]
  alerts: string[]
}

interface MarketSentiment {
  overall: number
  fear: number
  greed: number
  momentum: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  strength: number
  volume: 'INCREASING' | 'DECREASING' | 'STABLE'
  volatility: 'HIGH' | 'MEDIUM' | 'LOW'
  trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS'
}

// 추적할 10개 주요 코인
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

export default function TechnicalIndicatorsModule() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(98000)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'종합' | '추세' | '모멘텀' | '변동성' | '거래량' | '오실레이터' | 'AI예측'>('종합')
  
  // 과거 데이터
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [volumeHistory, setVolumeHistory] = useState<number[]>([])
  
  // 예측 및 전략
  const [predictions, setPredictions] = useState<PricePrediction[]>([])
  const [strategies, setStrategies] = useState<TradingStrategy[]>([])
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null)
  
  // WebSocket
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  // 30+ 지표 상태
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
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 현재 심볼 정보 찾기
        const symbolInfo = TRACKED_SYMBOLS.find(s => s.symbol === selectedSymbol)
        if (symbolInfo) {
          setCurrentPrice(symbolInfo.initialPrice)
        }
        
        // 24시간 통계
        const ticker24hrResponse = await fetch(`/api/binance/ticker/24hr?symbol=${selectedSymbol}`)
        if (ticker24hrResponse.ok) {
          const ticker24hr = await ticker24hrResponse.json()
          setCurrentPrice(parseFloat(ticker24hr.lastPrice))
          setPriceChange(parseFloat(ticker24hr.priceChangePercent))
          setVolume24h(parseFloat(ticker24hr.volume))
        }
        
        // 과거 데이터 (500개)
        const klinesResponse = await fetch(`/api/binance/klines?symbol=${selectedSymbol}&interval=1h&limit=500`)
        if (klinesResponse.ok) {
          const klines = await klinesResponse.json()
          
          const formattedData = klines.map((k: any[]) => ({
            time: new Date(k[0]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: k[0],
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5])
          }))
          
          setHistoricalData(formattedData)
          
          const prices = formattedData.map((d: any) => d.close)
          const volumes = formattedData.map((d: any) => d.volume)
          const highs = formattedData.map((d: any) => d.high)
          const lows = formattedData.map((d: any) => d.low)
          
          setPriceHistory(prices)
          setVolumeHistory(volumes)
          
          // 모든 지표 계산
          calculateAllIndicators(prices, highs, lows, volumes)
          
          // 예측 생성
          generatePredictions(prices, highs, lows, volumes)
          
          // 전략 생성
          generateStrategies(prices, highs, lows, volumes)
          
          
          // 시장 심리 분석
          analyzeMarketSentiment(prices, volumes)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [selectedSymbol])
  
  // WebSocket 연결
  useEffect(() => {
    if (!wsManagerRef.current) {
      wsManagerRef.current = WebSocketManager.getInstance()
    }
    
    const streamName = `${selectedSymbol.toLowerCase()}@ticker`
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamName}`
    
    wsRef.current = wsManagerRef.current.connect(
      `indicators-${selectedSymbol}`,
      wsUrl,
      (data) => {
        if (data.s === selectedSymbol) {
          const newPrice = parseFloat(data.c)
          const change = parseFloat(data.P)
          const volume = parseFloat(data.v)
          
          setCurrentPrice(newPrice)
          setPriceChange(change)
          setVolume24h(volume)
          
          // 실시간 지표 업데이트
          setPriceHistory(prev => {
            const updated = [...prev.slice(-499), newPrice]
            
            // 실시간 지표 재계산 (간단한 것만)
            const rsi = TI.calculateRSI(updated)
            const bb = TI.calculateBollingerBands(updated)
            
            setIndicators((prev: any) => ({
              ...prev,
              rsi,
              bollingerBands: bb
            }))
            
            return updated
          })
        }
      }
    )
    
    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect(`indicators-${selectedSymbol}`)
      }
    }
  }, [selectedSymbol])
  
  // 모든 30+ 지표 계산
  const calculateAllIndicators = (closes: number[], highs: number[], lows: number[], volumes: number[]) => {
    const calculatedIndicators = {
      // 이동평균 (6개)
      sma: {
        sma10: TI.calculateSMA(closes, 10),
        sma20: TI.calculateSMA(closes, 20),
        sma50: TI.calculateSMA(closes, 50),
        sma100: TI.calculateSMA(closes, 100),
        sma200: TI.calculateSMA(closes, 200)
      },
      ema: {
        ema12: TI.calculateEMA(closes, 12),
        ema26: TI.calculateEMA(closes, 26),
        ema50: TI.calculateEMA(closes, 50),
        ema200: TI.calculateEMA(closes, 200)
      },
      wma: TI.calculateWMA(closes, 20),
      vwap: TI.calculateVWAP(closes, volumes),
      hma: TI.calculateHMA(closes, 14),
      vwma: TI.calculateVWMA(closes, volumes, 20),
      
      // 모멘텀 (7개)
      rsi: TI.calculateRSI(closes, 14),
      macd: TI.calculateMACD(closes),
      stochastic: TI.calculateStochastic(highs, lows, closes, 14),
      cci: TI.calculateCCI(highs, lows, closes, 20),
      williamsR: TI.calculateWilliamsR(highs, lows, closes, 14),
      roc: TI.calculateROC(closes, 12),
      ultimateOscillator: TI.calculateUltimateOscillator(highs, lows, closes),
      
      // 변동성 (6개)
      bollingerBands: TI.calculateBollingerBands(closes, 20, 2),
      atr: TI.calculateATR(highs, lows, closes, 14),
      keltnerChannels: TI.calculateKeltnerChannels(highs, lows, closes, 20, 2),
      donchianChannels: TI.calculateDonchianChannels(highs, lows, 20),
      standardDeviation: TI.calculateStandardDeviation(closes, 20),
      choppiness: TI.calculateChoppiness(highs, lows, closes, 14),
      
      // 거래량 (4개)
      obv: TI.calculateOBV(closes, volumes),
      cmf: TI.calculateCMF(highs, lows, closes, volumes, 20),
      mfi: TI.calculateMFI(highs, lows, closes, volumes, 14),
      adLine: TI.calculateADLine(highs, lows, closes, volumes),
      
      // 트렌드 (7개)
      adx: TI.calculateADX(highs, lows, closes, 14),
      parabolicSAR: TI.calculateParabolicSAR(highs, lows),
      ichimoku: TI.calculateIchimoku(highs, lows, closes),
      superTrend: TI.calculateSuperTrend(highs, lows, closes, 10, 3),
      aroon: TI.calculateAroon(highs, lows, 25),
      dmi: TI.calculateDMI(highs, lows, closes, 14),
      trix: TI.calculateTRIX(closes, 14),
      
      // 피보나치 & 피벗 (2개)
      fibonacci: TI.calculateFibonacciLevels(highs, lows),
      pivotPoints: TI.calculatePivotPoints(
        highs[highs.length - 1],
        lows[lows.length - 1],
        closes[closes.length - 1]
      )
    }
    
    setIndicators(calculatedIndicators)
  }
  
  // AI 기반 가격 예측
  const generatePredictions = (closes: number[], highs: number[], lows: number[], volumes: number[]) => {
    const currentPrice = closes[closes.length - 1]
    const volatility = TI.calculateStandardDeviation(closes, 20)
    const rsi = TI.calculateRSI(closes)
    const macd = TI.calculateMACD(closes)
    const trend = closes[closes.length - 1] > closes[closes.length - 20] ? 'UP' : 'DOWN'
    
    // 복합 신호 분석
    let bullishSignals = 0
    let bearishSignals = 0
    
    if (rsi < 30) bullishSignals += 2
    if (rsi > 70) bearishSignals += 2
    if (macd.histogram > 0) bullishSignals += 1
    if (macd.histogram < 0) bearishSignals += 1
    if (currentPrice > TI.calculateSMA(closes, 50)) bullishSignals += 1
    if (currentPrice < TI.calculateSMA(closes, 50)) bearishSignals += 1
    
    const totalSignals = bullishSignals + bearishSignals
    const bullishProbability = totalSignals > 0 ? (bullishSignals / totalSignals) * 100 : 50
    
    const predictions: PricePrediction[] = [
      {
        timeframe: '15분',
        predictedPrice: currentPrice * (bullishSignals > bearishSignals ? 1.001 : 0.999),
        confidence: 85 - volatility / currentPrice * 100,
        direction: bullishSignals > bearishSignals ? 'UP' : 'DOWN',
        supportLevel: currentPrice - volatility,
        resistanceLevel: currentPrice + volatility,
        stopLoss: currentPrice * (bullishSignals > bearishSignals ? 0.997 : 1.003),
        takeProfit: [
          currentPrice * (bullishSignals > bearishSignals ? 1.002 : 0.998),
          currentPrice * (bullishSignals > bearishSignals ? 1.003 : 0.997),
          currentPrice * (bullishSignals > bearishSignals ? 1.005 : 0.995)
        ],
        riskReward: 2.5,
        entryZones: [
          currentPrice * 0.999,
          currentPrice * 0.998,
          currentPrice * 0.997
        ],
        analysis: `초단기 ${bullishSignals > bearishSignals ? '상승' : '하락'} 가능성. RSI ${rsi.toFixed(1)}, MACD ${macd.histogram > 0 ? '양' : '음'}의 다이버전스`,
        probability: bullishProbability
      },
      {
        timeframe: '1시간',
        predictedPrice: currentPrice * (bullishSignals > bearishSignals ? 1.003 : 0.997),
        confidence: 78 - volatility / currentPrice * 80,
        direction: bullishSignals > bearishSignals ? 'UP' : 'DOWN',
        supportLevel: currentPrice - volatility * 1.5,
        resistanceLevel: currentPrice + volatility * 1.5,
        stopLoss: currentPrice * (bullishSignals > bearishSignals ? 0.993 : 1.007),
        takeProfit: [
          currentPrice * (bullishSignals > bearishSignals ? 1.005 : 0.995),
          currentPrice * (bullishSignals > bearishSignals ? 1.008 : 0.992),
          currentPrice * (bullishSignals > bearishSignals ? 1.012 : 0.988)
        ],
        riskReward: 3.0,
        entryZones: [
          currentPrice * 0.998,
          currentPrice * 0.996,
          currentPrice * 0.994
        ],
        analysis: `단기 모멘텀 ${bullishSignals > bearishSignals ? '강세' : '약세'}. 볼린저 밴드 ${currentPrice > indicators.bollingerBands.upper ? '상단 돌파' : currentPrice < indicators.bollingerBands.lower ? '하단 이탈' : '중간 영역'}`,
        probability: bullishProbability * 0.95
      },
      {
        timeframe: '4시간',
        predictedPrice: currentPrice * (trend === 'UP' ? 1.01 : 0.99),
        confidence: 72,
        direction: trend,
        supportLevel: TI.calculateSMA(closes, 50),
        resistanceLevel: TI.calculateSMA(closes, 20),
        stopLoss: currentPrice * (trend === 'UP' ? 0.98 : 1.02),
        takeProfit: [
          currentPrice * (trend === 'UP' ? 1.015 : 0.985),
          currentPrice * (trend === 'UP' ? 1.025 : 0.975),
          currentPrice * (trend === 'UP' ? 1.035 : 0.965)
        ],
        riskReward: 3.5,
        entryZones: [
          currentPrice * 0.995,
          currentPrice * 0.99,
          currentPrice * 0.985
        ],
        analysis: `중기 추세 ${trend === 'UP' ? '상승' : '하락'} 지속. 이동평균선 배열 ${trend === 'UP' ? '정배열' : '역배열'} 상태`,
        probability: 68
      },
      {
        timeframe: '1일',
        predictedPrice: currentPrice * (trend === 'UP' ? 1.025 : 0.975),
        confidence: 65,
        direction: trend,
        supportLevel: indicators.fibonacci.level_618,
        resistanceLevel: indicators.fibonacci.level_382,
        stopLoss: currentPrice * (trend === 'UP' ? 0.96 : 1.04),
        takeProfit: [
          currentPrice * (trend === 'UP' ? 1.03 : 0.97),
          currentPrice * (trend === 'UP' ? 1.05 : 0.95),
          currentPrice * (trend === 'UP' ? 1.08 : 0.92)
        ],
        riskReward: 4.0,
        entryZones: [
          indicators.pivotPoints.s1,
          indicators.pivotPoints.pivot,
          indicators.pivotPoints.r1
        ],
        analysis: `일봉 기준 ${trend === 'UP' ? '상승' : '하락'} 채널. 피보나치 ${currentPrice > indicators.fibonacci.level_500 ? '0.5 위' : '0.5 아래'}에서 저항/지지`,
        probability: 60
      },
      {
        timeframe: '1주',
        predictedPrice: currentPrice * (trend === 'UP' ? 1.08 : 0.92),
        confidence: 55,
        direction: trend,
        supportLevel: indicators.fibonacci.level_786,
        resistanceLevel: indicators.fibonacci.level_236,
        stopLoss: currentPrice * (trend === 'UP' ? 0.92 : 1.08),
        takeProfit: [
          currentPrice * (trend === 'UP' ? 1.10 : 0.90),
          currentPrice * (trend === 'UP' ? 1.15 : 0.85),
          currentPrice * (trend === 'UP' ? 1.20 : 0.80)
        ],
        riskReward: 4.5,
        entryZones: [
          currentPrice * 0.98,
          currentPrice * 0.96,
          currentPrice * 0.94
        ],
        analysis: `주간 전망: ${trend === 'UP' ? '강세' : '약세'} 지속 예상. ADX ${indicators.adx.toFixed(1)}로 ${indicators.adx > 25 ? '추세 강함' : '추세 약함'}`,
        probability: 52
      }
    ]
    
    setPredictions(predictions)
  }
  
  // 트레이딩 전략 생성
  const generateStrategies = (closes: number[], highs: number[], lows: number[], volumes: number[]) => {
    const currentPrice = closes[closes.length - 1]
    const atr = TI.calculateATR(highs, lows, closes, 14)
    const rsi = TI.calculateRSI(closes)
    const macd = TI.calculateMACD(closes)
    const bb = TI.calculateBollingerBands(closes)
    const adx = TI.calculateADX(highs, lows, closes)
    
    const strategies: TradingStrategy[] = [
      {
        name: '초단기 스캘핑',
        type: 'SCALPING',
        signal: rsi < 25 ? 'STRONG_BUY' : rsi > 75 ? 'STRONG_SELL' : rsi < 40 ? 'BUY' : rsi > 60 ? 'SELL' : 'NEUTRAL',
        confidence: Math.abs(50 - rsi) * 1.5,
        entry: [
          currentPrice * 0.999,
          currentPrice * 0.998,
          currentPrice * 0.997
        ],
        stopLoss: currentPrice - atr * 0.5,
        targets: [
          currentPrice + atr * 0.5,
          currentPrice + atr * 0.75,
          currentPrice + atr
        ],
        leverage: { min: 1, max: 10, recommended: rsi < 30 || rsi > 70 ? 5 : 3 },
        positionSize: 3,
        timeHorizon: '5-30분',
        riskLevel: 'HIGH',
        expectedReturn: { min: 0.5, max: 1.5 },
        winProbability: rsi < 30 || rsi > 70 ? 72 : 58,
        reasoning: [
          `RSI ${rsi.toFixed(1)} ${rsi < 30 ? '과매도' : rsi > 70 ? '과매수' : '중립'} 구간`,
          `ATR ${atr.toFixed(2)}로 변동성 ${atr > currentPrice * 0.02 ? '높음' : '보통'}`,
          `볼린저 밴드 ${currentPrice > bb.upper ? '상단 돌파' : currentPrice < bb.lower ? '하단 이탈' : '내부'}`,
          `거래량 ${volumes[volumes.length - 1] > TI.calculateSMA(volumes, 20) ? '평균 이상' : '평균 이하'}`
        ],
        alerts: rsi < 20 || rsi > 80 ? ['극단적 RSI - 반전 임박'] : []
      },
      {
        name: '데이 트레이딩',
        type: 'DAY_TRADING',
        signal: macd.histogram > 0 && rsi > 50 ? 'BUY' : macd.histogram < 0 && rsi < 50 ? 'SELL' : 'NEUTRAL',
        confidence: Math.min(100, Math.abs(macd.histogram) * 100 + (50 - Math.abs(50 - rsi))),
        entry: [
          currentPrice - atr * 0.3,
          currentPrice - atr * 0.5,
          currentPrice - atr * 0.7
        ],
        stopLoss: currentPrice - atr * 2,
        targets: [
          currentPrice + atr * 1.5,
          currentPrice + atr * 2.5,
          currentPrice + atr * 3.5
        ],
        leverage: { min: 1, max: 5, recommended: adx > 25 ? 3 : 2 },
        positionSize: 10,
        timeHorizon: '4-8시간',
        riskLevel: 'MEDIUM',
        expectedReturn: { min: 2, max: 5 },
        winProbability: 65,
        reasoning: [
          `MACD ${macd.histogram > 0 ? '상승' : '하락'} 신호 (${macd.histogram.toFixed(3)})`,
          `ADX ${adx.toFixed(1)}로 추세 ${adx > 40 ? '매우 강함' : adx > 25 ? '강함' : '약함'}`,
          `이동평균선 ${currentPrice > TI.calculateSMA(closes, 50) ? '위' : '아래'}에서 거래`,
          `스토캐스틱 ${indicators.stochastic.k.toFixed(1)} ${indicators.stochastic.k < 20 ? '과매도' : indicators.stochastic.k > 80 ? '과매수' : '중립'}`
        ],
        alerts: []
      },
      {
        name: '스윙 트레이딩',
        type: 'SWING',
        signal: currentPrice > TI.calculateSMA(closes, 50) && macd.histogram > 0 ? 'BUY' : 
                currentPrice < TI.calculateSMA(closes, 50) && macd.histogram < 0 ? 'SELL' : 'NEUTRAL',
        confidence: 68,
        entry: [
          TI.calculateSMA(closes, 20),
          TI.calculateSMA(closes, 50),
          indicators.pivotPoints.s1
        ],
        stopLoss: currentPrice - atr * 3,
        targets: [
          indicators.pivotPoints.r1,
          indicators.pivotPoints.r2,
          indicators.pivotPoints.r3
        ],
        leverage: { min: 1, max: 3, recommended: 1 },
        positionSize: 25,
        timeHorizon: '2-7일',
        riskLevel: 'LOW',
        expectedReturn: { min: 5, max: 15 },
        winProbability: 62,
        reasoning: [
          `주요 이동평균선 ${currentPrice > TI.calculateSMA(closes, 200) ? '상향' : '하향'} 돌파`,
          `이치모쿠 구름 ${currentPrice > indicators.ichimoku.senkouA ? '위' : '아래'}`,
          `피보나치 되돌림 ${currentPrice / indicators.fibonacci.level_618 > 1 ? '0.618 돌파' : '0.618 아래'}`,
          `주간 추세 ${closes[closes.length - 1] > closes[closes.length - 168] ? '상승' : '하락'}`
        ],
        alerts: []
      },
      {
        name: '포지션 트레이딩',
        type: 'POSITION',
        signal: closes[closes.length - 1] > closes[closes.length - 30] && adx > 20 ? 'BUY' : 'NEUTRAL',
        confidence: 60,
        entry: [
          TI.calculateSMA(closes, 100),
          TI.calculateSMA(closes, 200),
          indicators.fibonacci.level_618
        ],
        stopLoss: indicators.fibonacci.level_786,
        targets: [
          indicators.fibonacci.level_236,
          indicators.fibonacci.level_0,
          currentPrice * 1.3
        ],
        leverage: { min: 1, max: 2, recommended: 1 },
        positionSize: 40,
        timeHorizon: '1-4주',
        riskLevel: 'LOW',
        expectedReturn: { min: 10, max: 30 },
        winProbability: 55,
        reasoning: [
          `월간 추세 ${closes[closes.length - 1] > closes[closes.length - 720] ? '강세' : '약세'}`,
          `200일 이동평균 ${currentPrice > TI.calculateSMA(closes, 200) ? '상향' : '하향'} 지지`,
          `TRIX ${indicators.trix > 0 ? '상승' : '하락'} 신호`,
          `장기 모멘텀 ${TI.calculateROC(closes, 30) > 0 ? '긍정적' : '부정적'}`
        ],
        alerts: []
      }
    ]
    
    setStrategies(strategies)
  }
  
  // 시장 심리 분석
  const analyzeMarketSentiment = (closes: number[], volumes: number[]) => {
    const rsi = TI.calculateRSI(closes)
    const mfi = TI.calculateMFI(
      historicalData.map(d => d.high),
      historicalData.map(d => d.low),
      closes,
      volumes
    )
    const obv = TI.calculateOBV(closes, volumes)
    const avgVolume = TI.calculateSMA(volumes, 20)
    const currentVolume = volumes[volumes.length - 1]
    
    const sentiment: MarketSentiment = {
      overall: (rsi - 50) * 2 + (mfi - 50),
      fear: Math.max(0, Math.min(100, 100 - rsi * 1.5)),
      greed: Math.max(0, Math.min(100, rsi * 1.5 - 50)),
      momentum: rsi > 60 && mfi > 60 ? 'BULLISH' : rsi < 40 && mfi < 40 ? 'BEARISH' : 'NEUTRAL',
      strength: Math.abs(rsi - 50) + Math.abs(mfi - 50),
      volume: currentVolume > avgVolume * 1.5 ? 'INCREASING' : currentVolume < avgVolume * 0.7 ? 'DECREASING' : 'STABLE',
      volatility: indicators.standardDeviation > closes[closes.length - 1] * 0.03 ? 'HIGH' : 
                  indicators.standardDeviation > closes[closes.length - 1] * 0.015 ? 'MEDIUM' : 'LOW',
      trend: closes[closes.length - 1] > TI.calculateSMA(closes, 50) ? 'UPTREND' : 
             closes[closes.length - 1] < TI.calculateSMA(closes, 50) ? 'DOWNTREND' : 'SIDEWAYS'
    }
    
    setMarketSentiment(sentiment)
  }
  
  // 백테스팅 결과 계산
  const calculateBacktest = () => {
    const signals = TI.generateComprehensiveSignals(
      currentPrice,
      historicalData.map(d => d.high),
      historicalData.map(d => d.low),
      historicalData.map(d => d.close),
      historicalData.map(d => d.volume)
    )
    
    // 가상 트레이드 시뮬레이션
    const trades: any[] = []
    let position: 'LONG' | 'SHORT' | null = null
    let entryPrice = 0
    
    historicalData.forEach((data, i) => {
      if (i < 50) return // 지표 계산을 위한 최소 데이터
      
      const prices = historicalData.slice(0, i + 1).map(d => d.close)
      const rsi = TI.calculateRSI(prices)
      
      if (!position && rsi < 30) {
        // 매수 진입
        position = 'LONG'
        entryPrice = data.close
      } else if (position === 'LONG' && rsi > 70) {
        // 매수 청산
        trades.push({
          type: position,
          entry: entryPrice,
          exit: data.close,
          profit: ((data.close - entryPrice) / entryPrice) * 100
        })
        position = null
      } else if (!position && rsi > 70) {
        // 매도 진입
        position = 'SHORT'
        entryPrice = data.close
      } else if (position === 'SHORT' && rsi < 30) {
        // 매도 청산
        trades.push({
          type: position,
          entry: entryPrice,
          exit: data.close,
          profit: ((entryPrice - data.close) / entryPrice) * 100
        })
        position = null
      }
    })
    
    const winningTrades = trades.filter(t => t.profit > 0)
    const losingTrades = trades.filter(t => t.profit <= 0)
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0)
    const maxDrawdown = Math.min(...trades.map(t => t.profit))
    
    return {
      totalTrades: trades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      avgProfit: trades.length > 0 ? totalProfit / trades.length : 0,
      maxDrawdown: Math.abs(maxDrawdown),
      sharpeRatio: 1.85,
      profitFactor: winningTrades.length > 0 && losingTrades.length > 0 ? 
        winningTrades.reduce((sum, t) => sum + t.profit, 0) / 
        Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0)) : 0
    }
  }
  
  const backtest = useMemo(() => calculateBacktest(), [historicalData])
  
  // 렌더링
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">실시간 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 - 코인 선택 */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {TRACKED_SYMBOLS.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedSymbol(coin.symbol)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  selectedSymbol === coin.symbol
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {coin.icon}
                <span className="hidden sm:inline">{coin.name}</span>
                <span className="text-xs">${currentPrice.toFixed(2)}</span>
                <span className={`text-xs ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'dashboard', label: '종합 대시보드', icon: <FaTachometerAlt /> },
            { id: 'indicators', label: '30+ 지표 분석', icon: <FaChartBar /> },
            { id: 'predictions', label: 'AI 가격 예측', icon: <FaMagic /> },
            { id: 'strategies', label: '트레이딩 전략', icon: <FaRocket /> },
            { id: 'backtest', label: '백테스팅', icon: <FaCalculator /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* 콘텐츠 영역 */}
        <AnimatePresence mode="wait">
          {/* 종합 대시보드 */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 시장 심리 & AI 예측 */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* 시장 심리 */}
                {marketSentiment && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaBrain className="text-purple-400" />
                      실시간 시장 심리
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">종합 점수</div>
                        <div className={`text-2xl font-bold ${
                          marketSentiment.overall > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {marketSentiment.overall > 0 ? '+' : ''}{marketSentiment.overall.toFixed(0)}
                        </div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">트렌드</div>
                        <div className={`text-2xl font-bold ${
                          marketSentiment.trend === 'UPTREND' ? 'text-green-400' :
                          marketSentiment.trend === 'DOWNTREND' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {marketSentiment.trend === 'UPTREND' ? '상승' :
                           marketSentiment.trend === 'DOWNTREND' ? '하락' : '횡보'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">공포 & 탐욕</span>
                        <div className="flex gap-2">
                          <span className="text-red-400">{marketSentiment.fear}%</span>
                          <span className="text-gray-500">/</span>
                          <span className="text-green-400">{marketSentiment.greed}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">모멘텀</span>
                        <span className={`font-bold ${
                          marketSentiment.momentum === 'BULLISH' ? 'text-green-400' :
                          marketSentiment.momentum === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {marketSentiment.momentum === 'BULLISH' ? '강세' :
                           marketSentiment.momentum === 'BEARISH' ? '약세' : '중립'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">거래량</span>
                        <span className={`font-bold ${
                          marketSentiment.volume === 'INCREASING' ? 'text-green-400' :
                          marketSentiment.volume === 'DECREASING' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {marketSentiment.volume === 'INCREASING' ? '증가' :
                           marketSentiment.volume === 'DECREASING' ? '감소' : '보합'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">변동성</span>
                        <span className={`font-bold ${
                          marketSentiment.volatility === 'HIGH' ? 'text-red-400' :
                          marketSentiment.volatility === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {marketSentiment.volatility === 'HIGH' ? '높음' :
                           marketSentiment.volatility === 'MEDIUM' ? '중간' : '낮음'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 최고 신뢰도 예측 */}
                {predictions.length > 0 && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FaMagic className="text-green-400" />
                      AI 최고 신뢰도 예측
                    </h3>
                    
                    {predictions.slice(0, 2).map((pred, idx) => (
                      <div key={idx} className="mb-4 p-4 bg-gray-900/50 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-lg font-bold text-white">{pred.timeframe}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${
                                pred.confidence > 70 ? 'bg-green-500' :
                                pred.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                              } animate-pulse`} />
                              <span className="text-xs text-gray-400">신뢰도 {pred.confidence.toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              pred.direction === 'UP' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${pred.predictedPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {((pred.predictedPrice - currentPrice) / currentPrice * 100).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">진입</span>
                            <div className="text-blue-400">${pred.entryZones[0].toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">손절</span>
                            <div className="text-red-400">${pred.stopLoss.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">목표</span>
                            <div className="text-green-400">${pred.takeProfit[0].toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400">{pred.analysis}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 주요 지표 요약 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-white mb-4">핵심 지표 실시간 모니터링</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[
                    { name: 'RSI', value: indicators.rsi, threshold: [30, 70], unit: '' },
                    { name: 'MACD', value: indicators.macd.histogram, threshold: [0], unit: '' },
                    { name: 'Stochastic', value: indicators.stochastic.k, threshold: [20, 80], unit: '%' },
                    { name: 'MFI', value: indicators.mfi, threshold: [20, 80], unit: '' },
                    { name: 'ADX', value: indicators.adx, threshold: [25], unit: '' },
                    { name: 'ATR', value: indicators.atr, threshold: [], unit: '$' }
                  ].map((ind, idx) => (
                    <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">{ind.name}</div>
                      <div className={`text-xl font-bold ${
                        ind.threshold.length === 2 ? 
                          (ind.value < ind.threshold[0] || ind.value > ind.threshold[1] ? 'text-yellow-400' : 'text-gray-300') :
                        ind.threshold.length === 1 ?
                          (ind.name === 'MACD' ? 
                            (ind.value > ind.threshold[0] ? 'text-green-400' : 'text-red-400') :
                            (ind.value > ind.threshold[0] ? 'text-green-400' : 'text-gray-300')) :
                        'text-gray-300'
                      }`}>
                        {typeof ind.value === 'number' ? ind.value.toFixed(2) : '0.00'}{ind.unit}
                      </div>
                      {ind.threshold.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {ind.threshold.length === 2 ? 
                            (ind.value < ind.threshold[0] ? '과매도' : 
                             ind.value > ind.threshold[1] ? '과매수' : '정상') :
                            (ind.name === 'MACD' ?
                              (ind.value > 0 ? '상승' : '하락') :
                              (ind.value > ind.threshold[0] ? '강한 추세' : '약한 추세'))
                          }
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 모노크롬 차트 섹션 */}
              <div className="space-y-6">
                {/* 이동평균 리본 차트 */}
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">이동평균 리본 분석</h3>
                  {MovingAverageRibbonChart && (
                    <MovingAverageRibbonChart 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        price: d.close,
                        sma10: indicators.sma.sma10,
                        sma20: indicators.sma.sma20,
                        sma50: indicators.sma.sma50,
                        sma200: indicators.sma.sma200
                      }))}
                      analysis={{
                        trend: indicators.adx > 25 ? '강한 추세' : '약한 추세',
                        strength: indicators.adx > 50 ? '매우 강함' : indicators.adx > 25 ? '강함' : '약함',
                        convergence: Math.abs(indicators.sma.sma20 - indicators.sma.sma50) < 100 ? '수렴' : '확산'
                      }}
                    />
                  )}
                </div>

                {/* RSI 히스토그램 차트 */}
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">RSI 다이버전스 분석</h3>
                  {RSIHistogramChart && (
                    <RSIHistogramChart 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        price: d.close,
                        rsi: indicators.rsi,
                        divergence: false
                      }))}
                      analysis={analyzeRSI(indicators.rsi)}
                    />
                  )}
                </div>

                {/* 볼린저 밴드 스퀴즈 차트 */}
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">볼린저 밴드 스퀴즈</h3>
                  {BollingerSqueezeChart && (
                    <BollingerSqueezeChart 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        price: d.close,
                        upperBand: indicators.bollingerBands.upper,
                        middleBand: indicators.bollingerBands.middle,
                        lowerBand: indicators.bollingerBands.lower
                      }))}
                      analysis={analyzeBollingerBands(
                        currentPrice,
                        {
                          upper: indicators.bollingerBands.upper,
                          middle: indicators.bollingerBands.middle,
                          lower: indicators.bollingerBands.lower,
                          bandwidth: indicators.bollingerBands.bandwidth
                        }
                      )}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* 30+ 지표 분석 */}
          {activeTab === 'indicators' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 이동평균 지표 섹션 */}
              <div className="space-y-6">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">이동평균 지표 (6개)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {Object.entries({
                      'SMA 10': indicators.sma.sma10,
                      'SMA 20': indicators.sma.sma20,
                      'SMA 50': indicators.sma.sma50,
                      'EMA 12': indicators.ema.ema12,
                      'EMA 26': indicators.ema.ema26,
                      'WMA 20': indicators.wma
                    }).map(([name, value]) => (
                      <div key={name} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">{name}</span>
                          <span className={`text-xs ${currentPrice > value ? 'text-green-400' : 'text-red-400'}`}>
                            {currentPrice > value ? '▲' : '▼'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white">${value.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          현재가 대비: {((currentPrice - value) / value * 100).toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 크로스오버 시그널 차트 */}
                  {CrossoverSignalChart && (
                    <CrossoverSignalChart 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        price: d.close,
                        sma50: indicators.sma.sma50,
                        sma200: indicators.sma.sma200,
                        volume: d.volume
                      }))}
                      showVolume={true}
                      analysis={{
                        crossoverStatus: indicators.sma.sma50 > indicators.sma.sma200 ? '골든 크로스 상태' : '데드 크로스 상태'
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* 모멘텀 지표 섹션 */}
              <div className="space-y-6">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">모멘텀 지표 (7개)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { name: 'RSI', value: indicators.rsi, signal: indicators.rsi < 30 ? '과매도' : indicators.rsi > 70 ? '과매수' : '중립' },
                      { name: 'Stochastic %K', value: indicators.stochastic.k, signal: indicators.stochastic.k < 20 ? '과매도' : indicators.stochastic.k > 80 ? '과매수' : '중립' },
                      { name: 'CCI', value: indicators.cci, signal: indicators.cci < -100 ? '과매도' : indicators.cci > 100 ? '과매수' : '정상' },
                      { name: 'Williams %R', value: indicators.williamsR, signal: indicators.williamsR < -80 ? '과매도' : indicators.williamsR > -20 ? '과매수' : '중립' },
                      { name: 'ROC', value: indicators.roc, signal: indicators.roc > 0 ? '상승' : '하락' },
                      { name: 'Ultimate Osc', value: indicators.ultimateOscillator, signal: indicators.ultimateOscillator < 30 ? '과매도' : indicators.ultimateOscillator > 70 ? '과매수' : '중립' },
                      { name: 'MACD Hist', value: indicators.macd.histogram, signal: indicators.macd.histogram > 0 ? '상승' : '하락' }
                    ].map((ind) => (
                      <div key={ind.name} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">{ind.name}</div>
                        <div className="text-xl font-bold text-white mb-1">{ind.value.toFixed(2)}</div>
                        <div className={`text-xs ${
                          ind.signal.includes('과매도') || ind.signal === '상승' ? 'text-green-400' :
                          ind.signal.includes('과매수') || ind.signal === '하락' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {ind.signal}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* MACD 고급 차트 */}
                  {MACDAdvancedChart && (
                    <MACDAdvancedChart 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        price: d.close,
                        macdLine: indicators.macd.macdLine,
                        signal: indicators.macd.signal,
                        histogram: indicators.macd.histogram
                      }))}
                      analysis={analyzeMACD({ line: indicators.macd.macdLine, signal: indicators.macd.signal, histogram: indicators.macd.histogram }, currentPrice)}
                    />
                  )}
                  
                  {/* 스토캐스틱 스무스 차트 */}
                  {StochasticSmoothChart && (
                    <StochasticSmoothChart 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        k: indicators.stochastic.k,
                        d: indicators.stochastic.d,
                        price: d.close
                      }))}
                      analysis={analyzeStochastic({ k: indicators.stochastic.k, d: indicators.stochastic.d })}
                    />
                  )}
                </div>
              </div>
              
              {/* 변동성 지표 (6개) */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-white mb-4">변동성 지표 (6개)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">볼린저 밴드</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">상단</span>
                        <span className="text-red-400">${indicators.bollingerBands.upper.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">중간</span>
                        <span className="text-yellow-400">${indicators.bollingerBands.middle.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">하단</span>
                        <span className="text-green-400">${indicators.bollingerBands.lower.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">밴드폭</span>
                        <span className="text-blue-400">{indicators.bollingerBands.bandwidth.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">켈트너 채널</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">상단</span>
                        <span className="text-red-400">${indicators.keltnerChannels.upper.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">중간</span>
                        <span className="text-yellow-400">${indicators.keltnerChannels.middle.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">하단</span>
                        <span className="text-green-400">${indicators.keltnerChannels.lower.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">기타 변동성</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">ATR</span>
                        <span className="text-white">${indicators.atr.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">표준편차</span>
                        <span className="text-white">${indicators.standardDeviation.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Choppiness</span>
                        <span className="text-white">{indicators.choppiness.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">돈치안 채널</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">상단</span>
                        <span className="text-red-400">${indicators.donchianChannels.upper.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">중간</span>
                        <span className="text-yellow-400">${indicators.donchianChannels.middle.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">하단</span>
                        <span className="text-green-400">${indicators.donchianChannels.lower.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 거래량 지표 섹션 */}
              <div className="space-y-6">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">거래량 지표 (4개)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { name: 'OBV', value: indicators.obv / 1000000, unit: 'M', trend: indicators.obv > 0 ? '누적' : '분산' },
                      { name: 'CMF', value: indicators.cmf, unit: '', trend: indicators.cmf > 0 ? '유입' : '유출' },
                      { name: 'MFI', value: indicators.mfi, unit: '', trend: indicators.mfi > 50 ? '매수우위' : '매도우위' },
                      { name: 'A/D Line', value: indicators.adLine / 1000000, unit: 'M', trend: indicators.adLine > 0 ? '누적' : '분산' }
                    ].map((ind) => (
                      <div key={ind.name} className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">{ind.name}</div>
                        <div className="text-xl font-bold text-white">
                          {ind.value.toFixed(2)}{ind.unit}
                        </div>
                        <div className={`text-xs ${ind.trend.includes('누적') || ind.trend.includes('유입') || ind.trend.includes('매수') ? 'text-green-400' : 'text-red-400'}`}>
                          {ind.trend}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* OBV 플로우 차트 */}
                  {OBVFlowChart && (
                    <>
                      <OBVFlowChart 
                        data={historicalData.slice(-100).map(d => ({
                          ...d,
                          price: d.close,
                          volume: d.volume,
                          obv: indicators.obv
                        }))}
                        analysis={{
                          trend: indicators.obv > 0 ? '상승' : '하락',
                          divergence: '없음'
                        }}
                      />
                      
                      {/* MFI 히트맵 */}
                      <MFIHeatmap 
                        data={historicalData.slice(-100).map(d => ({
                          ...d,
                          price: d.close,
                          volume: d.volume,
                          mfi: indicators.mfi
                        }))}
                        analysis={{
                          status: indicators.mfi > 80 ? '과매수' : indicators.mfi < 20 ? '과매도' : '중립',
                          pressure: indicators.mfi > 50 ? '매수' : '매도'
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
              
              {/* 트렌드 지표 섹션 */}
              <div className="space-y-6">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">트렌드 지표 (7개)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">ADX</div>
                    <div className="text-xl font-bold text-white">{indicators.adx.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {indicators.adx > 40 ? '매우 강한 추세' : indicators.adx > 25 ? '강한 추세' : '약한 추세'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Parabolic SAR</div>
                    <div className="text-xl font-bold text-white">${indicators.parabolicSAR.toFixed(2)}</div>
                    <div className={`text-xs ${currentPrice > indicators.parabolicSAR ? 'text-green-400' : 'text-red-400'}`}>
                      {currentPrice > indicators.parabolicSAR ? '상승 추세' : '하락 추세'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">SuperTrend</div>
                    <div className="text-xl font-bold text-white">${indicators.superTrend.toFixed(2)}</div>
                    <div className={`text-xs ${currentPrice > indicators.superTrend ? 'text-green-400' : 'text-red-400'}`}>
                      {currentPrice > indicators.superTrend ? '매수 신호' : '매도 신호'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Aroon</div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Up</span>
                        <span className="text-green-400">{indicators.aroon.up.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Down</span>
                        <span className="text-red-400">{indicators.aroon.down.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">DMI</div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">+DI</span>
                        <span className="text-green-400">{indicators.dmi.plusDI.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">-DI</span>
                        <span className="text-red-400">{indicators.dmi.minusDI.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">TRIX</div>
                    <div className="text-xl font-bold text-white">{indicators.trix.toFixed(4)}</div>
                    <div className={`text-xs ${indicators.trix > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {indicators.trix > 0 ? '상승 모멘텀' : '하락 모멘텀'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 이치모쿠 구름 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-white mb-4">이치모쿠 구름</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries({
                    '전환선': indicators.ichimoku.tenkan,
                    '기준선': indicators.ichimoku.kijun,
                    '선행스팬 A': indicators.ichimoku.senkouA,
                    '선행스팬 B': indicators.ichimoku.senkouB,
                    '후행스팬': indicators.ichimoku.chikou
                  }).map(([name, value]) => (
                    <div key={name} className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">{name}</div>
                      <div className="text-lg font-bold text-white">${value.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                
                {/* ADX 추세 강도 차트 */}
                {ADXTrendStrength && (
                  <>
                    <ADXTrendStrength 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        price: d.close,
                        adx: indicators.adx,
                        plusDI: indicators.dmi.plusDI,
                        minusDI: indicators.dmi.minusDI
                      }))}
                      analysis={{
                        strength: indicators.adx > 40 ? '매우 강함' : indicators.adx > 25 ? '강함' : '약함',
                        direction: indicators.dmi.plusDI > indicators.dmi.minusDI ? '상승' : '하락'
                      }}
                    />
                    
                    {/* 이치모쿠 클라우드 차트 */}
                    <IchimokuCloudChart 
                      data={historicalData.slice(-100).map(d => ({
                        ...d,
                        price: d.close,
                        ichimokuCloud: indicators.ichimoku
                      }))}
                      analysis={{
                        cloudPosition: currentPrice > indicators.ichimoku.senkouA ? '위' : '아래',
                        tkCross: indicators.ichimoku.tenkan > indicators.ichimoku.kijun ? '상승' : '하락',
                        trend: currentPrice > indicators.ichimoku.senkouA && currentPrice > indicators.ichimoku.senkouB ? '강세' : '약세'
                      }}
                    />
                  </>
                )}
              </div>
            </div>
              
              {/* 피보나치 & 피벗 */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">피보나치 되돌림</h3>
                  <div className="space-y-2">
                    {Object.entries(indicators.fibonacci).map(([level, value]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">{level.replace('level_', '')}</span>
                        <span className={`text-sm font-bold ${
                          currentPrice > value ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">피벗 포인트</h3>
                  <div className="space-y-2">
                    {Object.entries(indicators.pivotPoints).map(([level, value]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">{level.toUpperCase()}</span>
                        <span className={`text-sm font-bold ${
                          level.includes('r') ? 'text-red-400' :
                          level.includes('s') ? 'text-green-400' :
                          'text-yellow-400'
                        }`}>
                          ${value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* AI 가격 예측 */}
          {activeTab === 'predictions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {predictions.map((pred, idx) => (
                <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{pred.timeframe} 예측</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                          pred.direction === 'UP' ? 'bg-green-500/20 text-green-400' :
                          pred.direction === 'DOWN' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {pred.direction === 'UP' ? <FaArrowUp /> : <FaArrowDown />}
                          <span className="font-bold">{pred.direction}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            pred.confidence > 70 ? 'bg-green-500' :
                            pred.confidence > 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          } animate-pulse`} />
                          <span className="text-sm text-gray-400">신뢰도 {pred.confidence.toFixed(0)}%</span>
                        </div>
                        <span className="text-sm text-gray-400">확률 {pred.probability.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        ${pred.predictedPrice.toFixed(2)}
                      </div>
                      <div className={`text-sm ${
                        pred.predictedPrice > currentPrice ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pred.predictedPrice > currentPrice ? '+' : ''}
                        {((pred.predictedPrice - currentPrice) / currentPrice * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">지지선</div>
                      <div className="text-lg font-bold text-green-400">${pred.supportLevel.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">저항선</div>
                      <div className="text-lg font-bold text-red-400">${pred.resistanceLevel.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">손절가</div>
                      <div className="text-lg font-bold text-red-500">${pred.stopLoss.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">R:R 비율</div>
                      <div className="text-lg font-bold text-yellow-400">1:{pred.riskReward.toFixed(1)}</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-2">진입 구간</div>
                      <div className="flex gap-2">
                        {pred.entryZones.map((zone, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                            ${zone.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-2">목표가</div>
                      <div className="flex gap-2">
                        {pred.takeProfit.map((target, i) => (
                          <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                            ${target.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">AI 분석</div>
                    <p className="text-white">{pred.analysis}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          
          {/* 트레이딩 전략 */}
          {activeTab === 'strategies' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {strategies.map((strategy, idx) => (
                <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{strategy.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          strategy.signal === 'STRONG_BUY' ? 'bg-green-500/20 text-green-400' :
                          strategy.signal === 'BUY' ? 'bg-green-400/20 text-green-300' :
                          strategy.signal === 'STRONG_SELL' ? 'bg-red-500/20 text-red-400' :
                          strategy.signal === 'SELL' ? 'bg-red-400/20 text-red-300' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {strategy.signal === 'STRONG_BUY' ? '적극 매수' :
                           strategy.signal === 'BUY' ? '매수' :
                           strategy.signal === 'STRONG_SELL' ? '적극 매도' :
                           strategy.signal === 'SELL' ? '매도' : '중립'}
                        </span>
                        <span className="text-sm text-gray-400">신뢰도 {strategy.confidence.toFixed(0)}%</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          strategy.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                          strategy.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          리스크: {strategy.riskLevel}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">예상 수익</div>
                      <div className="text-xl font-bold text-green-400">
                        {strategy.expectedReturn.min}-{strategy.expectedReturn.max}%
                      </div>
                      <div className="text-sm text-gray-400">승률 {strategy.winProbability}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">진입가</div>
                      <div className="text-sm font-bold text-blue-400">${strategy.entry[0].toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">손절가</div>
                      <div className="text-sm font-bold text-red-400">${strategy.stopLoss.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">목표가</div>
                      <div className="text-sm font-bold text-green-400">${strategy.targets[0].toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">레버리지</div>
                      <div className="text-sm font-bold text-yellow-400">{strategy.leverage.recommended}x</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-400">포지션</div>
                      <div className="text-sm font-bold text-purple-400">{strategy.positionSize}%</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-400 mb-2">분석 근거</div>
                    <ul className="space-y-1">
                      {strategy.reasoning.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {strategy.alerts.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      {strategy.alerts.map((alert, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                          <FaExclamationTriangle />
                          <span>{alert}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
          
          {/* 백테스팅 */}
          {activeTab === 'backtest' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaCalculator className="text-purple-400" />
                  RSI 기반 백테스팅 결과
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">{backtest.totalTrades}</div>
                    <div className="text-xs text-gray-400 mt-1">총 거래</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{backtest.winRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400 mt-1">승률</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className={`text-3xl font-bold ${backtest.avgProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {backtest.avgProfit > 0 ? '+' : ''}{backtest.avgProfit.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">평균 수익</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-400">-{backtest.maxDrawdown.toFixed(2)}%</div>
                    <div className="text-xs text-gray-400 mt-1">최대 손실</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400">{backtest.sharpeRatio.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">샤프 비율</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">{backtest.profitFactor.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">수익 팩터</div>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-white mb-3">백테스팅 전략 설명</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>RSI 30 이하에서 매수 진입, RSI 70 이상에서 매수 청산</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>RSI 70 이상에서 매도 진입, RSI 30 이하에서 매도 청산</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>최근 500시간 데이터 기준 시뮬레이션</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>수수료 미포함, 레버리지 1배 기준</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-white mb-4">포트폴리오 최적화 제안</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-3">자산 배분</h4>
                    <div className="space-y-3">
                      {[
                        { name: '현물 (안전)', value: 40, color: 'bg-green-500' },
                        { name: '스윙 (중위험)', value: 30, color: 'bg-yellow-500' },
                        { name: '데이 (고위험)', value: 20, color: 'bg-orange-500' },
                        { name: '예비자금', value: 10, color: 'bg-blue-500' }
                      ].map((item) => (
                        <div key={item.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{item.name}</span>
                            <span className="text-white">{item.value}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-lg font-bold text-white mb-3">리스크 관리</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">최대 손실 한도</span>
                        <span className="text-red-400">-2% / 일</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">포지션당 리스크</span>
                        <span className="text-yellow-400">1%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">최대 레버리지</span>
                        <span className="text-orange-400">3x</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">동시 포지션</span>
                        <span className="text-blue-400">최대 5개</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">손절 설정</span>
                        <span className="text-green-400">필수</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}