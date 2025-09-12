'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRealtimePrice, useRealtimeKlines } from '@/lib/hooks/useOptimizedWebSocket'

// 컴포넌트 동적 임포트 (성능 최적화)
const CoinSelector = dynamic(() => import('./components/CoinSelector'), {
  loading: () => <div className="animate-pulse h-16 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const ConceptSection = dynamic(() => import('./components/ConceptSection'), {
  loading: () => <div className="animate-pulse h-48 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const RealtimeAnalysis = dynamic(() => import('./components/RealtimeAnalysis'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const PriceChart = dynamic(() => import('./components/PriceChart'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const BollingerBands = dynamic(() => import('./components/BollingerBands'), {
  loading: () => <div className="animate-pulse h-80 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const ZScoreAnalysis = dynamic(() => import('./components/ZScoreAnalysis'), {
  loading: () => <div className="animate-pulse h-80 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const RSIDivergence = dynamic(() => import('./components/RSIDivergence'), {
  loading: () => <div className="animate-pulse h-80 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const TradingSignals = dynamic(() => import('./components/TradingSignals'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const BacktestResults = dynamic(() => import('./components/BacktestResults'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

// LiveTrading 컴포넌트는 TradingSignals로 통합됨

// 코인 리스트 (초기 가격과 함께)
const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', initialPrice: 98000 },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', initialPrice: 3500 },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🔸', initialPrice: 700 },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎', initialPrice: 200 },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕', initialPrice: 2.4 },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', initialPrice: 1.1 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð', initialPrice: 0.4 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺', initialPrice: 45 },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬡', initialPrice: 0.5 },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●', initialPrice: 8 }
]

interface MarketData {
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  sma20: number
  sma50: number
  sma200: number
  upperBand: number
  lowerBand: number
  zScore: number
  rsi: number
}

interface PricePoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function MeanReversionModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 최적화된 WebSocket 훅 사용
  const realtimePrice = useRealtimePrice(selectedCoin, { enabled: true })
  const { currentKline, klines, isConnected } = useRealtimeKlines(selectedCoin, '1m', { enabled: true })

  // 실시간 가격 데이터를 marketData로 변환
  useEffect(() => {
    if (realtimePrice.price > 0 && priceHistory.length > 0) {
      // 이동평균선 계산을 위한 가격 히스토리
      const prices = priceHistory.map(p => p.close).slice(-200)
      if (prices.length > 0) {
        prices.push(realtimePrice.price)
      }

      // SMA 계산
      const sma20 = calculateSMA(prices.slice(-20))
      const sma50 = calculateSMA(prices.slice(-50))
      const sma200 = calculateSMA(prices.slice(-200))

      // 볼린저 밴드 계산
      const { upperBand, lowerBand } = calculateBollingerBands(prices.slice(-20))

      // Z-Score 계산
      const zScore = calculateZScore(realtimePrice.price, prices.slice(-20))

      // RSI 계산
      const rsi = calculateRSI(prices.slice(-14))

      setMarketData({
        price: realtimePrice.price,
        change24h: realtimePrice.changePercent,
        volume24h: realtimePrice.volume,
        high24h: realtimePrice.high,
        low24h: realtimePrice.low,
        sma20: sma20 || realtimePrice.price,
        sma50: sma50 || realtimePrice.price,
        sma200: sma200 || realtimePrice.price,
        upperBand: upperBand || realtimePrice.price * 1.02,
        lowerBand: lowerBand || realtimePrice.price * 0.98,
        zScore: zScore || 0,
        rsi: rsi || 50
      })
      setLoading(false)
    }
  }, [realtimePrice.price, realtimePrice.changePercent, realtimePrice.volume, realtimePrice.high, realtimePrice.low, priceHistory.length])

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
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Binance API에서 초기 K라인 데이터 가져오기
        const response = await fetch(`/api/binance/klines?symbol=${selectedCoin}&interval=1m&limit=500`)
        if (!response.ok) {
          console.warn('Failed to fetch initial data, using WebSocket data only')
          return
        }
        
        const result = await response.json()
        
        // 새로운 API 응답 형식 처리
        const klineData = result.data || result.klines || result
        
        if (Array.isArray(klineData)) {
          const formattedHistory = klineData.map((kline: any) => {
            // 이미 처리된 형식인지 확인
            if (kline.openTime !== undefined) {
              return {
                time: kline.openTime,
                open: kline.open,
                high: kline.high,
                low: kline.low,
                close: kline.close,
                volume: kline.volume
              }
            }
            // 원시 Binance 형식
            return {
              time: kline[0], // openTime
              open: parseFloat(kline[1]),
              high: parseFloat(kline[2]),
              low: parseFloat(kline[3]),
              close: parseFloat(kline[4]),
              volume: parseFloat(kline[5])
            }
          })
          
          setPriceHistory(formattedHistory)
        }
      } catch (err) {
        console.error('초기 데이터 로드 실패:', err)
        setError(err instanceof Error ? err.message : '데이터 로드 실패')
        
        // 에러 시 기본값 설정
        const coin = COINS.find(c => c.symbol === selectedCoin)
        if (coin) {
          setMarketData({
            price: coin.initialPrice,
            change24h: 0,
            volume24h: 0,
            high24h: coin.initialPrice * 1.05,
            low24h: coin.initialPrice * 0.95,
            sma20: coin.initialPrice,
            sma50: coin.initialPrice,
            sma200: coin.initialPrice,
            upperBand: coin.initialPrice * 1.02,
            lowerBand: coin.initialPrice * 0.98,
            zScore: 0,
            rsi: 50
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [selectedCoin])

  // SMA 계산 함수
  function calculateSMA(prices: number[]): number | null {
    if (prices.length === 0) return null
    const sum = prices.reduce((acc, price) => acc + price, 0)
    return sum / prices.length
  }

  // 볼린거 밴드 계산 함수
  function calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2) {
    if (prices.length < period) {
      return { upperBand: null, lowerBand: null, middleBand: null }
    }

    const sma = calculateSMA(prices.slice(-period))
    if (!sma) return { upperBand: null, lowerBand: null, middleBand: null }

    // 표준편차 계산
    const squaredDiffs = prices.slice(-period).map(price => Math.pow(price - sma, 2))
    const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / period
    const stdDev = Math.sqrt(variance)

    return {
      upperBand: sma + (stdDev * multiplier),
      lowerBand: sma - (stdDev * multiplier),
      middleBand: sma
    }
  }

  // Z-Score 계산 함수
  function calculateZScore(currentPrice: number, prices: number[]): number | null {
    if (prices.length < 2) return null

    const mean = calculateSMA(prices)
    if (!mean) return null

    const squaredDiffs = prices.map(price => Math.pow(price - mean, 2))
    const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / prices.length
    const stdDev = Math.sqrt(variance)

    if (stdDev === 0) return 0
    return (currentPrice - mean) / stdDev
  }

  // RSI 계산 함수
  function calculateRSI(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null

    let gains = 0
    let losses = 0

    // 첫 번째 RS 계산
    for (let i = 1; i <= period; i++) {
      const difference = prices[i] - prices[i - 1]
      if (difference >= 0) {
        gains += difference
      } else {
        losses -= difference
      }
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  // 연결 상태 표시
  const getConnectionStatus = () => {
    if (!isConnected) return '연결 중...'
    return '실시간 연결됨'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔄 평균 회귀 트레이딩 시스템
          </h1>
          <p className="text-gray-400">
            볼린저 밴드, Z-Score, RSI 다이버전스 기반 평균 회귀 전략
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
            <p className="text-sm text-gray-400 mt-1">기본값으로 표시 중입니다.</p>
          </div>
        )}

        {/* 코인 선택기 */}
        <div className="mb-8">
          <CoinSelector 
            coins={COINS}
            selectedCoin={selectedCoin}
            onCoinChange={setSelectedCoin}
          />
        </div>

        {/* 개념 설명 섹션 */}
        <div className="mb-8">
          <ConceptSection />
        </div>

        {/* 실시간 분석 섹션 */}
        <div className="mb-8">
          <RealtimeAnalysis 
            marketData={marketData}
            loading={loading}
          />
        </div>

        {/* 메인 차트 */}
        <div className="mb-8">
          <PriceChart 
            symbol={selectedCoin}
            historicalData={priceHistory}
            marketData={marketData}
            loading={loading}
          />
        </div>

        {/* 지표 분석 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <BollingerBands 
            historicalData={priceHistory}
            marketData={marketData}
            loading={loading}
          />
          
          <ZScoreAnalysis 
            coin={COINS.find(c => c.symbol === selectedCoin)}
            historicalData={priceHistory}
            marketData={marketData}
            loading={loading}
          />
          
          <RSIDivergence 
            historicalData={priceHistory}
            marketData={marketData}
            loading={loading}
          />
        </div>

        {/* 트레이딩 시그널과 백테스트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TradingSignals 
            coin={COINS.find(c => c.symbol === selectedCoin)}
            marketData={marketData}
            priceHistory={priceHistory}
            loading={loading}
          />
          
          <BacktestResults 
            symbol={selectedCoin}
            priceHistory={priceHistory}
            loading={loading}
          />
        </div>

        {/* 라이브 트레이딩 섹션 - TradingSignals에 통합됨 */}
      </div>
    </div>
  )
}