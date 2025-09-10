'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import dynamic from 'next/dynamic'

// 동적 임포트로 각 컴포넌트 로드
const ConceptGuide = dynamic(() => import('./ConceptGuide'), { 
  loading: () => <ComponentLoader name="개념 정리" />,
  ssr: false 
})

const TradeTape = dynamic(() => import('./TradeTape'), { 
  loading: () => <ComponentLoader name="실시간 테이프" />,
  ssr: false 
})

const VolumeProfile = dynamic(() => import('./VolumeProfile'), { 
  loading: () => <ComponentLoader name="거래량 프로파일" />,
  ssr: false 
})

const OrderFlowAnalysis = dynamic(() => import('./OrderFlowAnalysis'), { 
  loading: () => <ComponentLoader name="주문 흐름" />,
  ssr: false 
})

const LargeTrades = dynamic(() => import('./LargeTrades'), { 
  loading: () => <ComponentLoader name="대량 거래" />,
  ssr: false 
})

const PriceAction = dynamic(() => import('./PriceAction'), { 
  loading: () => <ComponentLoader name="가격 액션" />,
  ssr: false 
})

const TradingSignals = dynamic(() => import('./TradingSignals'), { 
  loading: () => <ComponentLoader name="트레이딩 시그널" />,
  ssr: false 
})

const ComprehensiveAnalysis = dynamic(() => import('./ComprehensiveAnalysis'), { 
  loading: () => <ComponentLoader name="종합 분석" />,
  ssr: false 
})

// 코인 목록
const COINS = [
  { symbol: 'BTCUSDT', name: '비트코인', color: 'from-orange-500 to-orange-600' },
  { symbol: 'ETHUSDT', name: '이더리움', color: 'from-blue-500 to-blue-600' },
  { symbol: 'BNBUSDT', name: '바이낸스', color: 'from-yellow-500 to-yellow-600' },
  { symbol: 'SOLUSDT', name: '솔라나', color: 'from-purple-500 to-purple-600' },
  { symbol: 'XRPUSDT', name: '리플', color: 'from-gray-500 to-gray-600' },
  { symbol: 'ADAUSDT', name: '카르다노', color: 'from-blue-400 to-blue-500' },
  { symbol: 'DOGEUSDT', name: '도지', color: 'from-yellow-400 to-yellow-500' },
  { symbol: 'AVAXUSDT', name: '아발란체', color: 'from-red-500 to-red-600' },
  { symbol: 'MATICUSDT', name: '폴리곤', color: 'from-purple-400 to-purple-500' },
  { symbol: 'DOTUSDT', name: '폴카닷', color: 'from-pink-500 to-pink-600' },
]

// 컴포넌트 로더
function ComponentLoader({ name }: { name: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
      <p className="text-gray-400 text-sm">{name} 로딩 중...</p>
    </div>
  )
}

// 에러 폴백 컴포넌트
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
      <h3 className="text-red-400 font-bold mb-2">오류 발생</h3>
      <p className="text-gray-400 mb-4">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        다시 시도
      </button>
    </div>
  )
}

export default function TapeReadingModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [showConcept, setShowConcept] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결 관리
  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin])

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@ticker`)
    
    ws.onopen = () => {
      console.log('WebSocket 연결됨:', selectedCoin)
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCurrentPrice(parseFloat(data.c))
      setPriceChange(parseFloat(data.P))
      setVolume24h(parseFloat(data.v))
    }

    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error)
      setWsConnected(false)
    }

    ws.onclose = () => {
      console.log('WebSocket 연결 종료')
      setWsConnected(false)
      // 5초 후 재연결
      setTimeout(() => {
        connectWebSocket()
      }, 5000)
    }

    wsRef.current = ws
  }, [selectedCoin])

  // 초기 데이터 로드
  useEffect(() => {
    fetch(`/api/binance/ticker?symbol=${selectedCoin}`)
      .then(res => res.json())
      .then(data => {
        if (data.price) {
          setCurrentPrice(data.price)
          setPriceChange(data.priceChangePercent)
          setVolume24h(data.volume)
        }
      })
      .catch(err => console.error('초기 데이터 로드 실패:', err))
  }, [selectedCoin])

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* 헤더 */}
        <div className="max-w-[1920px] mx-auto mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  📊 테이프 리딩 전문 분석
                </h1>
                <p className="text-gray-400">실시간 체결 데이터와 주문 흐름 분석</p>
              </div>
              
              {/* 연결 상태 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-400">
                    {wsConnected ? 'WebSocket 연결됨' : 'WebSocket 연결 중...'}
                  </span>
                </div>
                <button
                  onClick={() => setShowConcept(!showConcept)}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition"
                >
                  {showConcept ? '📈 실전 분석' : '📚 개념 정리'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 코인 선택기 */}
        <div className="max-w-[1920px] mx-auto mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex flex-wrap gap-2 mb-4">
              {COINS.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin.symbol)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCoin === coin.symbol
                      ? `bg-gradient-to-r ${coin.color} text-white`
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {coin.name}
                </button>
              ))}
            </div>

            {/* 현재 가격 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">현재 가격</p>
                <p className="text-2xl font-bold text-white">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">24시간 변동</p>
                <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-gray-400 text-sm mb-1">24시간 거래량</p>
                <p className="text-2xl font-bold text-white">
                  {(volume24h / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-[1920px] mx-auto">
          {showConcept ? (
            <ConceptGuide />
          ) : (
            <div className="space-y-6">
              {/* 첫 번째 행: 실시간 테이프와 거래량 프로파일 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <TradeTape symbol={selectedCoin} currentPrice={currentPrice} />
                </ErrorBoundary>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <VolumeProfile symbol={selectedCoin} />
                </ErrorBoundary>
              </div>

              {/* 두 번째 행: 주문 흐름과 대량 거래 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <OrderFlowAnalysis symbol={selectedCoin} />
                </ErrorBoundary>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <LargeTrades symbol={selectedCoin} />
                </ErrorBoundary>
              </div>

              {/* 세 번째 행: 가격 액션과 트레이딩 시그널 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <PriceAction symbol={selectedCoin} currentPrice={currentPrice} />
                </ErrorBoundary>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <TradingSignals symbol={selectedCoin} currentPrice={currentPrice} />
                </ErrorBoundary>
              </div>

              {/* 네 번째 행: 종합 분석 */}
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ComprehensiveAnalysis 
                  symbol={selectedCoin} 
                  currentPrice={currentPrice}
                  priceChange={priceChange}
                  volume24h={volume24h}
                />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}