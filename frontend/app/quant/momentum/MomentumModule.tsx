'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import CoinSelector from './components/CoinSelector'
import MomentumOverview from './components/MomentumOverview'
import PriceChart from './components/PriceChart'
import MomentumIndicators from './components/MomentumIndicators'
import VolumeAnalysis from './components/VolumeAnalysis'
import TrendStrength from './components/TrendStrength'
import SignalGenerator from './components/SignalGenerator'
import PositionSizer from './components/PositionSizer'
import RiskManager from './components/RiskManager'
import BacktestResults from './components/BacktestResults'
import LivePerformance from './components/LivePerformance'
import TradingStrategy from './components/TradingStrategy'

export interface CoinData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  marketCap: number
}

export interface MomentumData {
  rsi: number
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  stochastic: {
    k: number
    d: number
  }
  williams: number
  roc: number
  momentumScore: number
  trend: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish'
}

const SUPPORTED_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🔸' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬡' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●' }
]

export default function MomentumModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [coinData, setCoinData] = useState<CoinData | null>(null)
  const [momentumData, setMomentumData] = useState<MomentumData | null>(null)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 코인 정보 가져오기
  const fetchCoinData = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
      if (!response.ok) throw new Error('Failed to fetch coin data')
      
      const data = await response.json()
      const coin = SUPPORTED_COINS.find(c => c.symbol === symbol)
      
      setCoinData({
        symbol: data.symbol,
        name: coin?.name || symbol,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.volume),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        marketCap: parseFloat(data.quoteVolume)
      })
    } catch (err) {
      console.error('Error fetching coin data:', err)
      setError('코인 데이터를 불러오는데 실패했습니다')
    }
  }, [])

  // 히스토리컬 데이터 가져오기
  const fetchHistoricalData = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`
      )
      if (!response.ok) throw new Error('Failed to fetch historical data')
      
      const data = await response.json()
      const formattedData = data.map((candle: any) => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }))
      
      setPriceHistory(formattedData)
      calculateMomentumIndicators(formattedData)
    } catch (err) {
      console.error('Error fetching historical data:', err)
    }
  }, [])

  // 모멘텀 지표 계산
  const calculateMomentumIndicators = (data: any[]) => {
    if (data.length < 14) return

    const closes = data.map(d => d.close)
    
    // RSI 계산
    const rsi = calculateRSI(closes, 14)
    
    // MACD 계산
    const macd = calculateMACD(closes)
    
    // Stochastic 계산
    const stochastic = calculateStochastic(data, 14, 3)
    
    // Williams %R 계산
    const williams = calculateWilliams(data, 14)
    
    // ROC 계산
    const roc = calculateROC(closes, 12)
    
    // 모멘텀 스코어 계산
    const momentumScore = calculateMomentumScore(rsi, macd, stochastic, williams, roc)
    
    // 트렌드 판단
    const trend = determineTrend(momentumScore, rsi, macd)
    
    setMomentumData({
      rsi,
      macd,
      stochastic,
      williams,
      roc,
      momentumScore,
      trend
    })
  }

  // RSI 계산
  const calculateRSI = (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50

    let gains = 0
    let losses = 0

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) {
        gains += change
      } else {
        losses -= change
      }
    }

    const avgGain = gains / period
    const avgLoss = losses / period
    
    if (avgLoss === 0) return 100
    
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  // MACD 계산
  const calculateMACD = (prices: number[]) => {
    const ema12 = calculateEMA(prices, 12)
    const ema26 = calculateEMA(prices, 26)
    const macdLine = ema12 - ema26
    const signalLine = calculateEMA([macdLine], 9)
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    }
  }

  // EMA 계산
  const calculateEMA = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1]
    
    const multiplier = 2 / (period + 1)
    let ema = data.slice(0, period).reduce((a, b) => a + b) / period
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema
    }
    
    return ema
  }

  // Stochastic 계산
  const calculateStochastic = (data: any[], period: number, smooth: number) => {
    const highs = data.slice(-period).map(d => d.high)
    const lows = data.slice(-period).map(d => d.low)
    const close = data[data.length - 1].close
    
    const highest = Math.max(...highs)
    const lowest = Math.min(...lows)
    
    const k = ((close - lowest) / (highest - lowest)) * 100
    const d = k // Simplified for now
    
    return { k, d }
  }

  // Williams %R 계산
  const calculateWilliams = (data: any[], period: number): number => {
    const highs = data.slice(-period).map(d => d.high)
    const lows = data.slice(-period).map(d => d.low)
    const close = data[data.length - 1].close
    
    const highest = Math.max(...highs)
    const lowest = Math.min(...lows)
    
    return ((highest - close) / (highest - lowest)) * -100
  }

  // ROC 계산
  const calculateROC = (prices: number[], period: number): number => {
    if (prices.length < period + 1) return 0
    
    const currentPrice = prices[prices.length - 1]
    const pastPrice = prices[prices.length - 1 - period]
    
    return ((currentPrice - pastPrice) / pastPrice) * 100
  }

  // 모멘텀 스코어 계산
  const calculateMomentumScore = (
    rsi: number,
    macd: any,
    stochastic: any,
    williams: number,
    roc: number
  ): number => {
    let score = 0
    
    // RSI 점수 (0-25점)
    if (rsi > 70) score += 25
    else if (rsi > 60) score += 20
    else if (rsi > 50) score += 15
    else if (rsi > 40) score += 10
    else if (rsi > 30) score += 5
    
    // MACD 점수 (0-25점)
    if (macd.histogram > 0) score += 25
    else score += 10
    
    // Stochastic 점수 (0-25점)
    if (stochastic.k > 80) score += 25
    else if (stochastic.k > 60) score += 20
    else if (stochastic.k > 40) score += 15
    else if (stochastic.k > 20) score += 10
    else score += 5
    
    // Williams %R 점수 (0-25점)
    if (williams > -20) score += 25
    else if (williams > -40) score += 20
    else if (williams > -60) score += 15
    else if (williams > -80) score += 10
    else score += 5
    
    return Math.min(100, score)
  }

  // 트렌드 판단
  const determineTrend = (score: number, rsi: number, macd: any): MomentumData['trend'] => {
    if (score > 80 && rsi > 70) return 'strong_bullish'
    if (score > 60) return 'bullish'
    if (score < 20 && rsi < 30) return 'strong_bearish'
    if (score < 40) return 'bearish'
    return 'neutral'
  }

  // WebSocket 연결
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }

    const streamName = symbol.toLowerCase() + '@ticker'
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)

    ws.onopen = () => {
      console.log('WebSocket connected for', symbol)
      setError(null)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.e === '24hrTicker') {
        const coin = SUPPORTED_COINS.find(c => c.symbol === symbol)
        setCoinData(prev => ({
          ...prev!,
          symbol: data.s,
          name: coin?.name || symbol,
          price: parseFloat(data.c),
          change24h: parseFloat(data.P),
          volume24h: parseFloat(data.v),
          high24h: parseFloat(data.h),
          low24h: parseFloat(data.l),
          marketCap: parseFloat(data.q)
        }))
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('WebSocket 연결 오류')
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      // 재연결 로직
      reconnectTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          connectWebSocket(symbol)
        }
      }, 5000)
    }

    wsRef.current = ws
  }, [])

  // 코인 변경 시
  useEffect(() => {
    setLoading(true)
    setError(null)
    
    // 데이터 초기화
    setCoinData(null)
    setMomentumData(null)
    setPriceHistory([])
    
    // 새 데이터 로드
    fetchCoinData(selectedCoin)
    fetchHistoricalData(selectedCoin)
    connectWebSocket(selectedCoin)
    
    // 로딩 완료
    const timer = setTimeout(() => setLoading(false), 1000)
    
    return () => {
      clearTimeout(timer)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [selectedCoin, fetchCoinData, fetchHistoricalData, connectWebSocket])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">모멘텀 데이터 분석 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-400 mb-2">오류 발생</p>
          <p className="text-gray-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* 코인 선택기 */}
      <CoinSelector 
        coins={SUPPORTED_COINS}
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
        coinData={coinData}
      />

      {/* 메인 대시보드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 모멘텀 개요 */}
        <MomentumOverview coinData={coinData} momentumData={momentumData} />

        {/* 가격 차트 */}
        <PriceChart 
          symbol={selectedCoin}
          priceHistory={priceHistory}
          currentPrice={coinData?.price || 0}
        />

        {/* 모멘텀 지표 */}
        <MomentumIndicators momentumData={momentumData} />

        {/* 거래량 분석 */}
        <VolumeAnalysis 
          symbol={selectedCoin}
          volumeData={priceHistory}
        />

        {/* 추세 강도 */}
        <TrendStrength 
          momentumData={momentumData}
          priceHistory={priceHistory}
        />

        {/* 신호 생성기 */}
        <SignalGenerator 
          momentumData={momentumData}
          coinData={coinData}
        />

        {/* 포지션 사이저 */}
        <PositionSizer 
          momentumData={momentumData}
          coinData={coinData}
        />

        {/* 리스크 관리 */}
        <RiskManager 
          momentumData={momentumData}
          coinData={coinData}
        />

        {/* 백테스팅 결과 */}
        <BacktestResults 
          symbol={selectedCoin}
          priceHistory={priceHistory}
        />

        {/* 실시간 성과 */}
        <LivePerformance 
          symbol={selectedCoin}
          momentumData={momentumData}
        />

        {/* 종합 트레이딩 전략 */}
        <TradingStrategy 
          momentumData={momentumData}
          coinData={coinData}
        />
      </div>
    </div>
  )
}