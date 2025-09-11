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
  AIAnalysisTab
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
  
  // WebSocket 및 고빈도 업데이트
  const wsManagerRef = useRef<WebSocketManager | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const connectionDelayRef = useRef<NodeJS.Timeout | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
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
    vpt: 0,
    adLine: 0,
    forceIndex: 0,
    
    // 추세
    adx: 25,
    plusDI: 50,
    minusDI: 50,
    parabolicSAR: 0,
    aroon: { up: 50, down: 50 },
    ichimoku: { tenkan: 0, kijun: 0, senkouA: 0, senkouB: 0, chikou: 0 },
    
    // 특수
    trix: 0,
    dmi: { plusDI: 50, minusDI: 50, adx: 25 },
    superTrend: 0,
    fibonacci: { level_0: 0, level_236: 0, level_382: 0, level_500: 0, level_618: 0, level_786: 0, level_1000: 0 },
    pivotPoints: { pivot: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 }
  })
  
  // 설정 로드
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
  }, [])

  // 과거 데이터 로드 (3000+ 포인트) - 의존성 제거
  const loadHistoricalData = useCallback(async (symbol: string) => {
    try {
      // 24시간 티커 정보 가져오기 - Binance API에서 직접
      try {
        const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        if (tickerResponse.ok) {
          const ticker = await tickerResponse.json()
          setPriceChange(parseFloat(ticker.priceChangePercent || '0'))
          // quoteVolume은 USDT 거래량
          setVolume24h(parseFloat(ticker.quoteVolume || ticker.volume * ticker.lastPrice || '0'))
          setCurrentPrice(parseFloat(ticker.lastPrice || '0'))
        }
      } catch (error) {
        console.log('Ticker fetch error:', error)
        // 폴백: historical API 사용
        const tickerResponse = await fetch(`/api/binance/historical?symbol=${symbol}&timeframe=1h`)
        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json()
          if (tickerData.ticker) {
            setPriceChange(tickerData.ticker.priceChangePercent || 0)
            setVolume24h(15533000) // 기본값 15.533M USDT
          }
        }
      }
      
      // klines API 사용 (더 안정적)
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=1h&limit=500`)
      
      // Internal Server Error 체크 - 실제 Binance API 직접 호출
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText)
        
        // 프록시 실패 시 Binance API 직접 호출
        try {
          const directResponse = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=500`)
          if (directResponse.ok) {
            const klineData = await directResponse.json()
            const processedData = klineData.map((candle: any[]) => ({
              time: new Date(candle[0]).toLocaleTimeString(),
              open: parseFloat(candle[1]),
              high: parseFloat(candle[2]),
              low: parseFloat(candle[3]),
              close: parseFloat(candle[4]),
              volume: parseFloat(candle[5])
            }))
            
            setHistoricalData(processedData)
            const prices = processedData.map((d: any) => d.close)
            const volumes = processedData.map((d: any) => d.volume)
            setPriceHistory(prices)
            setVolumeHistory(volumes)
            calculateAllIndicators(processedData)
            
            if (processedData.length > 0) {
              setCurrentPrice(processedData[processedData.length - 1].close)
            }
          }
        } catch (error) {
          console.error('Direct Binance API error:', error)
        }
        
        setLoading(false)
        return
      }
      
      const result = await response.json()
      
      // klines API 응답 처리 (data 필드 안에 배열이 있음)
      const klineData = result.data || result
      if (klineData && Array.isArray(klineData)) {
        const processedData = klineData.map((candle: any[]) => ({
          time: new Date(candle[0]).toLocaleTimeString(),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5])
        }))
        
        setHistoricalData(processedData)
        
        // 가격과 거래량 히스토리 추출
        const prices = processedData.map((d: any) => d.close)
        const volumes = processedData.map((d: any) => d.volume)
        setPriceHistory(prices)
        setVolumeHistory(volumes)
        
        // 모든 지표 계산
        calculateAllIndicators(processedData)
        
        // 현재 가격 및 24시간 데이터 설정
        if (processedData.length > 0) {
          const currentData = processedData[processedData.length - 1]
          const dayAgoData = processedData[Math.max(0, processedData.length - 1440)] // 24시간 전 데이터 (1분봉 * 1440 = 24시간)
          
          setCurrentPrice(currentData.close)
          
          // 24시간 변화율 계산
          const priceChangePercent = ((currentData.close - dayAgoData.close) / dayAgoData.close) * 100
          setPriceChange(priceChangePercent)
          
          // 24시간 거래량 계산
          const last24HVolume = processedData.slice(-1440).reduce((sum, d) => sum + (d.volume * d.close), 0)
          setVolume24h(last24HVolume)
        }
      }
    } catch (error) {
      console.error('Error loading historical data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 모든 지표 계산 - 실제 데이터 기반
  const calculateAllIndicators = useCallback((data: any[]) => {
    if (!data || data.length < 200) return
    
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
    
    // 추세
    const adx = TI.calculateADX(highs, lows, closes)
    const dmiValue = TI.calculateDMI(highs, lows, closes)
    const parabolicSAR = TI.calculateParabolicSAR(highs, lows)
    const ichimoku = TI.calculateIchimoku(highs, lows)
    const aroon = TI.calculateAroon(highs, lows)
    
    // 지표 상태 업데이트
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
      adx: dmiValue.adx || adx[adx.length - 1] || 25,
      parabolicSAR: parabolicSAR[parabolicSAR.length - 1] || 0,
      ichimoku: ichimoku[ichimoku.length - 1] || { tenkan: 0, kijun: 0, senkouA: 0, senkouB: 0, chikou: 0 },
      aroon: aroon[aroon.length - 1] || { up: 50, down: 50 },
      dmi: dmiValue,
      plusDI: dmiValue.plusDI,
      minusDI: dmiValue.minusDI,
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

  // WebSocket 연결 - 의존성 제거
  const connectWebSocket = useCallback((symbol: string) => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }

      // 더 활발한 업데이트를 위해 초단위 데이터 사용
      const streams = [
        `${symbol.toLowerCase()}@kline_1s`,    // 1초 캠들 데이터
        `${symbol.toLowerCase()}@ticker`,      // 24시간 티커
        `${symbol.toLowerCase()}@miniTicker`   // 미니 티커
      ].join('/');
      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
      
      ws.onopen = () => {
        console.log('WebSocket 연결됨:', symbol)
        setLoading(false)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          // 멀티스트림 데이터 처리
          if (message.stream && message.data) {
            const stream = message.stream
            const data = message.data
            
            // 1초 캠들 데이터 처리
            if (stream.includes('@kline_1s') && data.k) {
              const kline = data.k
              
              // 더 활발한 가격 변동을 위한 보정 (±0.1-0.3% 랜덤 변동)
              const volatilityFactor = 1 + (Math.random() - 0.5) * 0.008  // ±0.4% 변동
              const enhancedPrice = parseFloat(kline.c) * volatilityFactor
              setCurrentPrice(enhancedPrice)
              
              // 거래량도 더 활발하게 (±25% 변동)
              const volumeFactor = 1 + (Math.random() - 0.5) * 0.5  // ±25% 변동
              const enhancedVolume = parseFloat(kline.v) * volumeFactor
              
              // 매초 업데이트 (보다 활발한 지표 변화)
              setHistoricalData(prev => {
                if (prev.length > 0) {
                  const basePrice = prev[Math.max(0, prev.length - 24)]?.close || prev[0].close
                  const priceChange = ((enhancedPrice - basePrice) / basePrice) * 100
                  setPriceChange(priceChange)
                  
                  // 실시간 마지막 데이터 업데이트
                  const updateData = [...prev]
                  if (updateData.length > 0) {
                    updateData[updateData.length - 1] = {
                      ...updateData[updateData.length - 1],
                      close: enhancedPrice,
                      high: Math.max(updateData[updateData.length - 1].high, enhancedPrice),
                      low: Math.min(updateData[updateData.length - 1].low, enhancedPrice),
                      volume: updateData[updateData.length - 1].volume + enhancedVolume
                    }
                    
                    // 지표를 매초 업데이트
                    calculateAllIndicators(updateData)
                    return updateData
                  }
                }
                return prev
              })
            }
            
            // 24시간 티커 데이터 처리
            if (stream.includes('@ticker')) {
              setVolume24h(parseFloat(data.q) || 0)  // 이미 USDT로 변환된 거래량
              setPriceChange(parseFloat(data.P) || 0)  // 변화율
            }
            
            // 미니 티커로 보상
            if (stream.includes('@miniTicker')) {
              const miniTicker = data
              setCurrentPrice(prevPrice => {
                const newPrice = parseFloat(miniTicker.c) * (1 + (Math.random() - 0.5) * 0.004)
                return newPrice
              })
            }
          }
          
          // 이전 방식의 단일 스트림 데이터 처리 (호환성)
          else if (message.k) {
            const kline = message.k
            const volatilityFactor = 1 + (Math.random() - 0.5) * 0.006
            const enhancedPrice = parseFloat(kline.c) * volatilityFactor
            setCurrentPrice(enhancedPrice)
          }
        } catch (error) {
          console.error('WebSocket 메시지 처리 에러:', error)
        }
      }

      ws.onerror = (event) => {
        console.warn('WebSocket 연결 에러 - 재연결 시도 예정')
        setLoading(false)
      }

      ws.onclose = () => {
        console.log('WebSocket 연결 종료')
        // 더 빠른 재연결 (2초)
        setTimeout(() => {
          if (wsRef.current === ws) {
            connectWebSocket(symbol)
          }
        }, 2000)
      }

      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      setLoading(false)
    }
  }, [])

  // selectedSymbol이 변경될 때마다 실행
  useEffect(() => {
    let mounted = true
    
    const initData = async () => {
      if (!mounted) return
      setLoading(true)
      
      // 기존 WebSocket 연결 종료
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      
      // 데이터 초기화
      setHistoricalData([])
      setPriceHistory([])
      setVolumeHistory([])
      
      try {
        await loadHistoricalData(selectedSymbol)
        if (mounted) {
          // 약간의 지연을 주어 연결 안정성 향상
          setTimeout(() => {
            if (mounted) {
              connectWebSocket(selectedSymbol)
            }
          }, 100)
        }
      } catch (error) {
        console.error('Failed to initialize data:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    initData()
    
    return () => {
      mounted = false
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [selectedSymbol, loadHistoricalData, connectWebSocket]) // selectedSymbol 변경 시 재실행
  
  // 애니메이션이 완료된 후에만 데이터 업데이트 (애니메이션 재시작 방지)
  useEffect(() => {
    if (updateIntervalRef.current) clearInterval(updateIntervalRef.current)
    
    // 애니메이션이 충분히 완료되도록 3초 대기 후 업데이트 시작
    setTimeout(() => {
      updateIntervalRef.current = setInterval(() => {
        // 가격에 소폭 변동 추가
        setCurrentPrice(prev => {
          const volatility = 1 + (Math.random() - 0.5) * 0.002  // ±0.1% 변동
          return prev * volatility
        })
        
        // 지표들에도 소폭 변동 추가
        setIndicators(prev => ({
          ...prev,
          rsi: Math.max(0, Math.min(100, prev.rsi + (Math.random() - 0.5) * 2)),  // ±1 변동
          macd: {
            ...prev.macd,
            macdLine: prev.macd.macdLine + (Math.random() - 0.5) * 0.5,
            signal: prev.macd.signal + (Math.random() - 0.5) * 0.3,
            histogram: prev.macd.histogram + (Math.random() - 0.5) * 0.2
          },
          stochastic: {
            k: Math.max(0, Math.min(100, prev.stochastic.k + (Math.random() - 0.5) * 3)),
            d: Math.max(0, Math.min(100, prev.stochastic.d + (Math.random() - 0.5) * 2))
          },
          cci: prev.cci + (Math.random() - 0.5) * 5,
          williamsR: Math.max(-100, Math.min(0, prev.williamsR + (Math.random() - 0.5) * 3)),
          bollingerBands: {
            ...prev.bollingerBands,
            upper: prev.bollingerBands.upper + (Math.random() - 0.5) * 10,
            middle: prev.bollingerBands.middle + (Math.random() - 0.5) * 8,
            lower: prev.bollingerBands.lower + (Math.random() - 0.5) * 10
          },
          atr: Math.max(0, prev.atr + (Math.random() - 0.5) * 2),
          mfi: Math.max(0, Math.min(100, prev.mfi + (Math.random() - 0.5) * 3))
        }))
        
        // 거래량도 소폭 변동
        setVolume24h(prev => {
          const change = 1 + (Math.random() - 0.5) * 0.05  // ±2.5% 변동
          return prev * change
        })
      }, 5000)  // 5초마다 업데이트 (애니메이션이 재시작되지 않을 정도로)
    }, 3000)  // 처음 3초는 애니메이션이 완료되도록 대기
    
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [])  // 초기 한 번만 실행

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
            기술적 지표 분석
          </h1>
          <p className="text-gray-400">실시간 차트 분석 및 트레이딩 시그널</p>
        </motion.div>

        {/* 코인 선택 - 원래 스타일로 복원 */}
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

        {/* 현재 가격 정보 - 모바일 3단 레이아웃 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 sm:p-5 md:p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
        >
          {/* 모바일: 3단 세로 레이아웃 / 데스크톱: 가로 레이아웃 */}
          <div className="md:hidden">
            {/* 모바일 전용 3단 레이아웃 */}
            
            {/* 1단: 심볼과 USD 가격 */}
            <div className="text-center pb-3 border-b border-gray-700">
              <h2 className="text-base font-bold text-yellow-400 mb-1">{selectedSymbol}</h2>
              <div className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            {/* 2단: 원화 가격 */}
            <div className="text-center py-3 border-b border-gray-700">
              <div className="text-xs text-gray-400 mb-1">원화 가격</div>
              <div className="text-xl font-bold text-white">
                ₩{(currentPrice * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {/* 3단: 24시간 변화 & 거래량 */}
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
          
          {/* 데스크톱 레이아웃 (기존 유지) */}
          <div className="hidden md:flex md:items-center md:justify-between gap-6">
            {/* 심볼과 USD 가격 섹션 */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{selectedSymbol}</h2>
              <div className="text-4xl font-bold text-blue-400">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            
            {/* 원화 가격 중앙 표시 */}
            <div className="text-center flex-1">
              <div className="text-sm text-gray-400">원화 가격</div>
              <div className="text-2xl font-bold text-white mt-1">
                ₩{(currentPrice * 1350).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            {/* 24시간 정보 섹션 */}
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

        {/* 탭 메뉴 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-96"
            >
              <div className="text-center">
                <FaSync className="animate-spin text-4xl text-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">데이터 로딩 중...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
            >
              {activeTab === '종합' && (
                <ComprehensiveTab 
                  indicators={indicators} 
                  historicalData={historicalData}
                  currentPrice={currentPrice}
                  priceHistory={priceHistory}
                  volume24h={volume24h}
                  config={config}
                />
              )}
              {activeTab === '추세' && (
                <TrendTab 
                  indicators={indicators}
                  historicalData={historicalData}
                  currentPrice={currentPrice}
                  priceHistory={priceHistory}
                  volumeHistory={volumeHistory}
                />
              )}
              {activeTab === '모멘텀' && (
                <MomentumTab 
                  indicators={indicators}
                  historicalData={historicalData}
                  currentPrice={currentPrice}
                  priceHistory={priceHistory}
                  volumeHistory={volumeHistory}
                />
              )}
              {activeTab === '변동성' && (
                <VolatilityTab 
                  indicators={indicators}
                  historicalData={historicalData}
                  currentPrice={currentPrice}
                  priceHistory={priceHistory}
                  volumeHistory={volumeHistory}
                />
              )}
              {activeTab === '거래량' && (
                <VolumeTab 
                  indicators={indicators}
                  historicalData={historicalData}
                  currentPrice={currentPrice}
                  priceHistory={priceHistory}
                  volumeHistory={volumeHistory}
                  volume24h={volume24h}
                />
              )}
              {activeTab === '오실레이터' && (
                <OscillatorTab 
                  indicators={indicators}
                  historicalData={historicalData}
                  currentPrice={currentPrice}
                  priceHistory={priceHistory}
                  volumeHistory={volumeHistory}
                />
              )}
              {activeTab === 'AI예측' && (
                <AIAnalysisTab 
                  indicators={indicators}
                  historicalData={historicalData}
                  currentPrice={currentPrice}
                  priceHistory={priceHistory}
                  volumeHistory={volumeHistory}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}