'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

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

const RiskManagement = dynamic(() => import('./components/RiskManagement'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const StrategyGuide = dynamic(() => import('./components/StrategyGuide'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

const AIRecommendation = dynamic(() => import('./components/AIRecommendation'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-800/50 rounded-lg" />,
  ssr: false
})

// 10개 주요 코인 정보
export const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', color: '#F7931A', initialPrice: 98000 },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', initialPrice: 3500 },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🔸', color: '#F3BA2F', initialPrice: 700 },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎', color: '#14F195', initialPrice: 240 },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕', color: '#23292F', initialPrice: 2.5 },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', color: '#0033AD', initialPrice: 1.0 },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð', color: '#C2A633', initialPrice: 0.4 },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺', color: '#E84142', initialPrice: 45 },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬟', color: '#8247E5', initialPrice: 1.5 },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '⚪', color: '#E6007A', initialPrice: 10 }
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

export default function MeanReversionModule() {
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket 연결 관리
  const connectWebSocket = (symbol: string) => {
    try {
      // 기존 연결 정리
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.onerror = null
        wsRef.current.onmessage = null
        wsRef.current.close()
        wsRef.current = null
      }

      // 재연결 타이머 정리
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
      
      try {
        wsRef.current = new WebSocket(wsUrl)
      } catch (e) {
        console.log('WebSocket 생성 실패, 3초 후 재시도')
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(symbol)
        }, 3000)
        return
      }

      wsRef.current.onopen = () => {
        console.log(`WebSocket 연결 성공: ${symbol}`)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          setMarketData(prev => ({
            price: parseFloat(data.c) || prev?.price || 0,
            change24h: parseFloat(data.P) || prev?.change24h || 0,
            volume24h: parseFloat(data.v) || prev?.volume24h || 0,
            high24h: parseFloat(data.h) || prev?.high24h || 0,
            low24h: parseFloat(data.l) || prev?.low24h || 0,
            sma20: prev?.sma20 || parseFloat(data.c),
            sma50: prev?.sma50 || parseFloat(data.c),
            sma200: prev?.sma200 || parseFloat(data.c),
            upperBand: prev?.upperBand || parseFloat(data.c) * 1.02,
            lowerBand: prev?.lowerBand || parseFloat(data.c) * 0.98,
            zScore: prev?.zScore || 0,
            rsi: prev?.rsi || 50
          }))
        } catch (error) {
          console.log('데이터 파싱 에러:', error)
        }
      }

      wsRef.current.onerror = (event) => {
        console.log('WebSocket 연결 에러, 3초 후 재연결 시도')
      }

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket 연결 종료 (코드: ${event.code})`)
        wsRef.current = null
        
        // 정상 종료가 아닌 경우 재연결
        if (event.code !== 1000) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('WebSocket 재연결 시도...')
            connectWebSocket(symbol)
          }, 3000)
        }
      }
    } catch (error) {
      console.log('WebSocket 설정 에러:', error)
      // 3초 후 재시도
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket(symbol)
      }, 3000)
    }
  }

  // 과거 데이터 로드
  const loadHistoricalData = async (symbol: string) => {
    try {
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=1d&limit=200`)
      if (response.ok) {
        const data = await response.json()
        setHistoricalData(data)
        
        // 이동평균 계산
        if (data.length >= 200) {
          const prices = data.map((d: any) => parseFloat(d[4]))
          const sma20 = prices.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20
          const sma50 = prices.slice(-50).reduce((a: number, b: number) => a + b, 0) / 50
          const sma200 = prices.reduce((a: number, b: number) => a + b, 0) / 200
          
          // 볼린저 밴드 계산
          const stdDev = Math.sqrt(
            prices.slice(-20).reduce((sum: number, price: number) => {
              return sum + Math.pow(price - sma20, 2)
            }, 0) / 20
          )
          
          // Z-Score 계산
          const currentPrice = prices[prices.length - 1]
          const zScore = (currentPrice - sma20) / stdDev
          
          // RSI 계산 (간단 버전)
          let gains = 0, losses = 0
          for (let i = prices.length - 14; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1]
            if (change > 0) gains += change
            else losses += Math.abs(change)
          }
          const avgGain = gains / 14
          const avgLoss = losses / 14
          const rs = avgGain / (avgLoss || 1)
          const rsi = 100 - (100 / (1 + rs))
          
          // 24시간 최고/최저가 계산
          const recent24h = data.slice(-24)
          const high24h = Math.max(...recent24h.map((d: any) => parseFloat(d[2])))
          const low24h = Math.min(...recent24h.map((d: any) => parseFloat(d[3])))
          
          setMarketData(prev => ({
            ...prev!,
            sma20,
            sma50,
            sma200,
            upperBand: sma20 + (stdDev * 2),
            lowerBand: sma20 - (stdDev * 2),
            zScore,
            rsi,
            high24h,
            low24h
          }))
        }
      }
    } catch (error) {
      console.error('과거 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 코인 변경 시
  useEffect(() => {
    setLoading(true)
    setMarketData({
      price: selectedCoin.initialPrice,
      change24h: 0,
      volume24h: 0,
      high24h: selectedCoin.initialPrice * 1.05,
      low24h: selectedCoin.initialPrice * 0.95,
      sma20: selectedCoin.initialPrice,
      sma50: selectedCoin.initialPrice,
      sma200: selectedCoin.initialPrice,
      upperBand: selectedCoin.initialPrice * 1.02,
      lowerBand: selectedCoin.initialPrice * 0.98,
      zScore: 0,
      rsi: 50
    })
    
    connectWebSocket(selectedCoin.symbol)
    loadHistoricalData(selectedCoin.symbol)

    return () => {
      // 정리 시 재연결 방지
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      
      if (wsRef.current) {
        // 이벤트 핸들러 제거로 재연결 방지
        wsRef.current.onclose = null
        wsRef.current.onerror = null
        wsRef.current.onmessage = null
        wsRef.current.onopen = null
        
        // 정상 종료 코드로 닫기
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, 'Component unmounting')
        }
        wsRef.current = null
      }
    }
  }, [selectedCoin])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 */}
      <div className="border-b border-gray-800 sticky top-0 bg-black/90 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            평균회귀 전문 분석
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">
            Mean Reversion Strategy - 가격은 결국 평균으로 돌아온다
          </p>
        </div>
      </div>

      {/* 코인 선택 */}
      <div className="sticky top-[73px] bg-black/90 backdrop-blur-sm z-30 border-b border-gray-800">
        <CoinSelector 
          coins={COINS}
          selectedCoin={selectedCoin}
          onSelectCoin={setSelectedCoin}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 개념 설명 섹션 */}
        <ConceptSection coinName={selectedCoin.name} />

        {/* 실시간 분석 */}
        <RealtimeAnalysis 
          coin={selectedCoin}
          marketData={marketData}
          loading={loading}
        />

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceChart 
            coin={selectedCoin}
            historicalData={historicalData}
            marketData={marketData}
          />
          <BollingerBands 
            coin={selectedCoin}
            historicalData={historicalData}
            marketData={marketData}
          />
        </div>

        {/* 지표 분석 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ZScoreAnalysis 
            coin={selectedCoin}
            marketData={marketData}
            historicalData={historicalData}
          />
          <RSIDivergence 
            coin={selectedCoin}
            marketData={marketData}
            historicalData={historicalData}
          />
        </div>

        {/* 트레이딩 시그널 */}
        <TradingSignals 
          coin={selectedCoin}
          marketData={marketData}
        />

        {/* 백테스팅 결과 */}
        <BacktestResults 
          coin={selectedCoin}
          historicalData={historicalData}
        />

        {/* 리스크 관리 */}
        <RiskManagement 
          coin={selectedCoin}
          marketData={marketData}
        />

        {/* 전략 가이드 */}
        <StrategyGuide 
          coin={selectedCoin}
          marketData={marketData}
        />

        {/* AI 추천 */}
        <AIRecommendation 
          coin={selectedCoin}
          marketData={marketData}
        />
      </div>
    </div>
  )
}