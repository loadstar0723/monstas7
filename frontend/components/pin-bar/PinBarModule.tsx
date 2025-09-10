'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import dynamic from 'next/dynamic'

// 동적 임포트로 각 컴포넌트 로드
const PinBarConcept = dynamic(() => import('./PinBarConcept'), { 
  loading: () => <ComponentLoader name="개념 설명" />,
  ssr: false 
})

const PinBarDetector = dynamic(() => import('./PinBarDetector'), { 
  loading: () => <ComponentLoader name="패턴 감지" />,
  ssr: false 
})

const PinBarChart = dynamic(() => import('./PinBarChart'), { 
  loading: () => <ComponentLoader name="차트 시각화" />,
  ssr: false 
})

const PinBarDashboard = dynamic(() => import('./PinBarDashboard'), { 
  loading: () => <ComponentLoader name="대시보드" />,
  ssr: false 
})

const PinBarSignals = dynamic(() => import('./PinBarSignals'), { 
  loading: () => <ComponentLoader name="시그널" />,
  ssr: false 
})

const PinBarStrategy = dynamic(() => import('./PinBarStrategy'), { 
  loading: () => <ComponentLoader name="전략" />,
  ssr: false 
})

const PinBarHistory = dynamic(() => import('./PinBarHistory'), { 
  loading: () => <ComponentLoader name="히스토리" />,
  ssr: false 
})

const PinBarAlerts = dynamic(() => import('./PinBarAlerts'), { 
  loading: () => <ComponentLoader name="알림" />,
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

// 타임프레임 목록
const TIMEFRAMES = [
  { value: '1m', label: '1분' },
  { value: '5m', label: '5분' },
  { value: '15m', label: '15분' },
  { value: '1h', label: '1시간' },
  { value: '4h', label: '4시간' },
  { value: '1d', label: '1일' },
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

export default function PinBarModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [showConcept, setShowConcept] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket 연결 관리
  const connectWebSocket = useCallback(() => {
    // 기존 연결 정리
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      wsRef.current.onopen = null
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Switching symbol')
      }
      wsRef.current = null
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@ticker`)
    let isActive = true
    
    ws.onopen = () => {
      if (!isActive) return
      console.log('WebSocket 연결됨:', selectedCoin)
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      if (!isActive) return
      try {
        const data = JSON.parse(event.data)
        if (data.s === selectedCoin) {
          setCurrentPrice(parseFloat(data.c))
          setPriceChange(parseFloat(data.P))
        }
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error)
      }
    }

    ws.onerror = (error) => {
      if (!isActive) return
      console.log('WebSocket 연결 오류')
      setWsConnected(false)
    }

    ws.onclose = (event) => {
      if (!isActive) return
      console.log('WebSocket 연결 종료')
      setWsConnected(false)
      // 정상 종료가 아닌 경우에만 재연결
      if (event.code !== 1000 && event.code !== 1001) {
        setTimeout(() => {
          if (isActive && wsRef.current === ws) {
            connectWebSocket()
          }
        }, 5000)
      }
    }

    wsRef.current = ws
    
    return () => {
      isActive = false
    }
  }, [selectedCoin])

  useEffect(() => {
    setCurrentPrice(0)
    setPriceChange(0)
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [selectedCoin, connectWebSocket])

  // 초기 데이터 로드
  useEffect(() => {
    fetch(`/api/binance/ticker?symbol=${selectedCoin}`)
      .then(res => res.json())
      .then(data => {
        if (data.price) {
          setCurrentPrice(data.price)
          setPriceChange(data.priceChangePercent)
        }
      })
      .catch(err => console.error('초기 데이터 로드 실패:', err))
  }, [selectedCoin])

  const tabs = [
    { id: 'dashboard', label: '📊 대시보드', icon: '📊' },
    { id: 'chart', label: '📈 차트 분석', icon: '📈' },
    { id: 'signals', label: '🔔 시그널', icon: '🔔' },
    { id: 'strategy', label: '🎯 전략', icon: '🎯' },
    { id: 'history', label: '📜 히스토리', icon: '📜' },
    { id: 'alerts', label: '⚡ 알림 설정', icon: '⚡' },
  ]

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* 헤더 */}
        <div className="max-w-[1920px] mx-auto mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  📍 핀 바(Pin Bar) 패턴 분석
                </h1>
                <p className="text-gray-400">실시간 핀 바 패턴 감지 및 트레이딩 시그널</p>
              </div>
              
              {/* 연결 상태 */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-400">
                  {wsConnected ? '실시간 연결됨' : '연결 중...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 코인 선택 및 타임프레임 */}
        <div className="max-w-[1920px] mx-auto mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            {/* 코인 선택 */}
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

            {/* 타임프레임 선택 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setSelectedTimeframe(tf.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedTimeframe === tf.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tf.label}
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
                <p className="text-gray-400 text-sm mb-1">타임프레임</p>
                <p className="text-2xl font-bold text-purple-400">
                  {TIMEFRAMES.find(tf => tf.value === selectedTimeframe)?.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="max-w-[1920px] mx-auto mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {!showConcept && tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
              
              {/* 핀 바 이론 버튼 */}
              <button
                onClick={() => setShowConcept(!showConcept)}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  showConcept 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {showConcept ? (
                  <>
                    <span>📈</span>
                    <span>실전 분석으로</span>
                  </>
                ) : (
                  <>
                    <span>📚</span>
                    <span className="font-bold">핀 바 이론</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-[1920px] mx-auto">
          {showConcept ? (
            <PinBarConcept />
          ) : (
            <div className="space-y-6">
              {activeTab === 'dashboard' && (
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <PinBarDashboard 
                    coins={COINS}
                    selectedTimeframe={selectedTimeframe}
                  />
                </ErrorBoundary>
              )}
              
              {activeTab === 'chart' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <PinBarChart 
                      symbol={selectedCoin}
                      timeframe={selectedTimeframe}
                      currentPrice={currentPrice}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <PinBarDetector 
                      symbol={selectedCoin}
                      timeframe={selectedTimeframe}
                    />
                  </ErrorBoundary>
                </div>
              )}
              
              {activeTab === 'signals' && (
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <PinBarSignals 
                    symbol={selectedCoin}
                    timeframe={selectedTimeframe}
                    currentPrice={currentPrice}
                  />
                </ErrorBoundary>
              )}
              
              {activeTab === 'strategy' && (
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <PinBarStrategy 
                    symbol={selectedCoin}
                    currentPrice={currentPrice}
                  />
                </ErrorBoundary>
              )}
              
              {activeTab === 'history' && (
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <PinBarHistory 
                    symbol={selectedCoin}
                    timeframe={selectedTimeframe}
                  />
                </ErrorBoundary>
              )}
              
              {activeTab === 'alerts' && (
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <PinBarAlerts 
                    symbol={selectedCoin}
                    timeframe={selectedTimeframe}
                  />
                </ErrorBoundary>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}