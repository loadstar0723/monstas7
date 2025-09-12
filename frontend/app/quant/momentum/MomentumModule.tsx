'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimePrice, useRealtimeKlines } from '@/lib/hooks/useOptimizedWebSocket'
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

  // 최적화된 WebSocket 훅 사용
  const realtimePrice = useRealtimePrice(selectedCoin, { enabled: true })
  const { currentKline, klines, isConnected } = useRealtimeKlines(selectedCoin, '1m', { enabled: true })

  // 실시간 가격 데이터를 coinData로 변환
  useEffect(() => {
    if (realtimePrice.price > 0) {
      const coin = SUPPORTED_COINS.find(c => c.symbol === selectedCoin)
      setCoinData({
        symbol: selectedCoin,
        name: coin?.name || selectedCoin,
        price: realtimePrice.price,
        change24h: realtimePrice.changePercent,
        volume24h: realtimePrice.volume,
        high24h: realtimePrice.high,
        low24h: realtimePrice.low,
        marketCap: realtimePrice.volume * realtimePrice.price // 근사치
      })
      setLoading(false)
    }
  }, [realtimePrice, selectedCoin])

  // K라인 데이터를 priceHistory로 변환
  useEffect(() => {
    if (klines.length > 0) {
      const formattedHistory = klines.map(kline => ({
        time: kline.openTime,
        open: kline.open,
        high: kline.high,
        low: kline.low,
        close: kline.close,
        volume: kline.volume
      }))
      setPriceHistory(formattedHistory)
    }
  }, [klines])

  // 현재 K라인으로 실시간 가격 히스토리 업데이트
  useEffect(() => {
    if (currentKline && !currentKline.isKlineClosed) {
      setPriceHistory(prev => {
        const updated = [...prev]
        const currentTime = currentKline.openTime
        
        // 마지막 캔들이 현재 시간과 같으면 업데이트, 아니면 추가
        const lastIndex = updated.length - 1
        if (updated[lastIndex] && updated[lastIndex].time === currentTime) {
          updated[lastIndex] = {
            time: currentTime,
            open: currentKline.open,
            high: currentKline.high,
            low: currentKline.low,
            close: currentKline.close,
            volume: currentKline.volume
          }
        } else {
          updated.push({
            time: currentTime,
            open: currentKline.open,
            high: currentKline.high,
            low: currentKline.low,
            close: currentKline.close,
            volume: currentKline.volume
          })
        }
        
        return updated.slice(-500) // 최근 500개 유지
      })
    }
  }, [currentKline])

  // 초기 히스토리 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Binance API에서 초기 K라인 데이터 가져오기
      const response = await fetch(`/api/binance/klines?symbol=${selectedCoin}&interval=1m&limit=500`)
      if (!response.ok) throw new Error('Failed to fetch initial data')
      
      const klineData = await response.json()
      
      if (Array.isArray(klineData)) {
        const formattedHistory = klineData.map((kline: any) => ({
          time: kline[0], // openTime
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }))
        
        setPriceHistory(formattedHistory)
      }
    } catch (err) {
      console.error('초기 데이터 로드 실패:', err)
      setError(err instanceof Error ? err.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [selectedCoin])

  // 선택된 코인 변경 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
  }, [selectedCoin, loadInitialData])

  // 모멘텀 지표 계산
  const calculateMomentumIndicators = useCallback((prices: number[]): MomentumData | null => {
    if (prices.length < 20) return null

    try {
      // RSI 계산 (14기간)
      const rsi = calculateRSI(prices.slice(-14))
      
      // MACD 계산 (12, 26, 9)
      const macd = calculateMACD(prices)
      
      // Stochastic 계산 (14, 3, 3)
      const stochastic = calculateStochastic(priceHistory.slice(-14))
      
      // Williams %R 계산 (14)
      const williams = calculateWilliamsR(priceHistory.slice(-14))
      
      // ROC 계산 (10기간)
      const roc = calculateROC(prices.slice(-10))
      
      // 모멘텀 점수 계산 (0-100)
      const momentumScore = calculateMomentumScore({ rsi, macd, stochastic, williams, roc })
      
      // 트렌드 판단
      const trend = determineTrend(momentumScore, rsi, macd.macd)

      return {
        rsi,
        macd,
        stochastic,
        williams,
        roc,
        momentumScore,
        trend
      }
    } catch (err) {
      console.error('모멘텀 지표 계산 오류:', err)
      return null
    }
  }, [priceHistory])

  // 가격 데이터가 업데이트될 때마다 모멘텀 지표 재계산
  useEffect(() => {
    if (priceHistory.length >= 20) {
      const prices = priceHistory.map(p => p.close)
      const newMomentumData = calculateMomentumIndicators(prices)
      setMomentumData(newMomentumData)
    }
  }, [priceHistory, calculateMomentumIndicators])

  // RSI 계산 함수
  function calculateRSI(prices: number[]): number {
    if (prices.length < 2) return 50
    
    let gains = 0, losses = 0
    
    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1]
      if (diff > 0) gains += diff
      else losses += Math.abs(diff)
    }
    
    const avgGain = gains / (prices.length - 1)
    const avgLoss = losses / (prices.length - 1)
    
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  // MACD 계산 함수
  function calculateMACD(prices: number[]) {
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

  // EMA 계산 함수
  function calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0
    
    const k = 2 / (period + 1)
    let ema = prices[0]
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * k) + (ema * (1 - k))
    }
    
    return ema
  }

  // Stochastic 계산 함수
  function calculateStochastic(candles: any[]) {
    if (candles.length < 14) return { k: 50, d: 50 }
    
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)
    const closes = candles.map(c => c.close)
    
    const highestHigh = Math.max(...highs)
    const lowestLow = Math.min(...lows)
    const currentClose = closes[closes.length - 1]
    
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
    const d = k // 간단화된 계산
    
    return { k, d }
  }

  // Williams %R 계산 함수
  function calculateWilliamsR(candles: any[]): number {
    if (candles.length < 14) return -50
    
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)
    const currentClose = candles[candles.length - 1].close
    
    const highestHigh = Math.max(...highs)
    const lowestLow = Math.min(...lows)
    
    return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100
  }

  // ROC (Rate of Change) 계산 함수
  function calculateROC(prices: number[]): number {
    if (prices.length < 2) return 0
    
    const currentPrice = prices[prices.length - 1]
    const pastPrice = prices[0]
    
    return ((currentPrice - pastPrice) / pastPrice) * 100
  }

  // 모멘텀 점수 계산 함수
  function calculateMomentumScore(indicators: {
    rsi: number
    macd: any
    stochastic: any
    williams: number
    roc: number
  }): number {
    const { rsi, macd, stochastic, williams, roc } = indicators
    
    // RSI 점수 (0-30: 0점, 30-70: 50점, 70-100: 100점)
    let rsiScore = 50
    if (rsi < 30) rsiScore = 0
    else if (rsi > 70) rsiScore = 100
    else rsiScore = ((rsi - 30) / 40) * 100
    
    // MACD 점수
    const macdScore = macd.histogram > 0 ? 75 : 25
    
    // Stochastic 점수
    const stochScore = stochastic.k > stochastic.d ? 75 : 25
    
    // Williams %R 점수
    const williamsScore = williams > -20 ? 100 : williams < -80 ? 0 : 50
    
    // ROC 점수
    const rocScore = roc > 0 ? 75 : 25
    
    // 가중 평균 계산
    return (rsiScore * 0.3 + macdScore * 0.25 + stochScore * 0.2 + williamsScore * 0.15 + rocScore * 0.1)
  }

  // 트렌드 판단 함수
  function determineTrend(
    momentumScore: number, 
    rsi: number, 
    macd: number
  ): 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish' {
    if (momentumScore >= 80 && rsi > 70 && macd > 0) return 'strong_bullish'
    if (momentumScore >= 60 && (rsi > 50 || macd > 0)) return 'bullish'
    if (momentumScore <= 20 && rsi < 30 && macd < 0) return 'strong_bearish'
    if (momentumScore <= 40 && (rsi < 50 || macd < 0)) return 'bearish'
    return 'neutral'
  }

  // 연결 상태 표시 문자열
  const getConnectionStatus = () => {
    if (!isConnected) return '연결 중...'
    return '실시간 연결됨'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📈 모멘텀 트레이딩 시스템
          </h1>
          <p className="text-gray-400">
            실시간 모멘텀 지표 분석 및 트레이딩 전략
          </p>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
            }`}>
              {getConnectionStatus()}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg">
            <p className="text-red-400">⚠️ {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <CoinSelector
              coins={SUPPORTED_COINS}
              selectedCoin={selectedCoin}
              onCoinChange={setSelectedCoin}
              coinData={coinData}
            />
          </div>
          
          <div className="lg:col-span-3">
            <MomentumOverview
              coinData={coinData}
              momentumData={momentumData}
              loading={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
            <PriceChart
              symbol={selectedCoin}
              priceHistory={priceHistory}
              momentumData={momentumData}
              loading={loading}
            />
          </div>
          
          <div>
            <MomentumIndicators
              momentumData={momentumData}
              loading={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <VolumeAnalysis
            priceHistory={priceHistory}
            loading={loading}
          />
          
          <TrendStrength
            momentumData={momentumData}
            priceHistory={priceHistory}
            loading={loading}
          />
          
          <SignalGenerator
            momentumData={momentumData}
            coinData={coinData}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PositionSizer
            coinData={coinData}
            momentumData={momentumData}
            loading={loading}
          />
          
          <RiskManager
            coinData={coinData}
            momentumData={momentumData}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BacktestResults
            symbol={selectedCoin}
            momentumData={momentumData}
            priceHistory={priceHistory}
            loading={loading}
          />
          
          <LivePerformance
            coinData={coinData}
            momentumData={momentumData}
            loading={loading}
          />
        </div>

        <TradingStrategy
          momentumData={momentumData}
          coinData={coinData}
          priceHistory={priceHistory}
          loading={loading}
        />
      </div>
    </div>
  )
}