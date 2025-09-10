'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, Cell, AreaChart, Area } from 'recharts'
import './imbalance.module.css'

// 10개 주요 코인 설정
const COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETHUSDT', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'BNBUSDT', name: 'BNB', color: '#F3BA2F' },
  { symbol: 'SOLUSDT', name: 'Solana', color: '#00FFA3' },
  { symbol: 'XRPUSDT', name: 'XRP', color: '#23292F' },
  { symbol: 'ADAUSDT', name: 'Cardano', color: '#0033AD' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', color: '#C2A633' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', color: '#E84142' },
  { symbol: 'MATICUSDT', name: 'Polygon', color: '#8247E5' },
  { symbol: 'DOTUSDT', name: 'Polkadot', color: '#E6007A' }
]

// 임밸런스 타입 정의
interface OrderBookLevel {
  price: number
  quantity: number
  total: number
}

interface ImbalanceData {
  timestamp: number
  bidVolume: number
  askVolume: number
  imbalanceRatio: number
  ofi: number // Order Flow Imbalance
  depthImbalance: number
  tickImbalance: number
}

interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
}

// 에러 폴백 컴포넌트
function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold text-red-400 mb-2">오류가 발생했습니다</h2>
        <p className="text-gray-300 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}

// 메인 임밸런스 모듈
export default function ImbalanceModule() {
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  const [loading, setLoading] = useState(true)
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [imbalanceHistory, setImbalanceHistory] = useState<ImbalanceData[]>([])
  const [trades, setTrades] = useState<TradeData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [tradingConfig, setTradingConfig] = useState<any>(null)

  // 실제 오더북 데이터 가져오기 (프록시 API 사용)
  const fetchOrderBook = useCallback(async () => {
    try {
      const response = await fetch(`/api/binance/orderbook?symbol=${selectedCoin.symbol}&limit=${tradingConfig?.imbalance?.dataLimits?.orderbookDepth || 20}`)
      if (!response.ok) throw new Error('Failed to fetch order book')
      const data = await response.json()
      
      // 이미 가공된 데이터 사용
      const bids = data.bids || []
      const asks = data.asks || []
      
      setOrderBook({ bids, asks })
      
      // 임밸런스 계산
      const bidVolume = bids.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
      const askVolume = asks.reduce((sum: number, a: any) => sum + (a.amount || 0), 0)
      
      if (bidVolume > 0 || askVolume > 0) {
        const newImbalance: ImbalanceData = {
          timestamp: Date.now(),
          bidVolume,
          askVolume,
          imbalanceRatio: bidVolume / (bidVolume + askVolume),
          ofi: (bidVolume - askVolume) / (bidVolume + askVolume),
          depthImbalance: Math.abs(bidVolume - askVolume),
          tickImbalance: (bidVolume - askVolume) / (bidVolume + askVolume + 1)
        }
        
        setImbalanceHistory(prev => [newImbalance, ...prev.slice(0, 59)])
      }
    } catch (error) {
      console.error('오더북 로드 실패:', error)
    }
  }, [selectedCoin.symbol])

  // 실제 거래 데이터 처리
  const processTrades = useCallback((data: any) => {
    if (!data || !data.p || !data.q) return
    
    const newTrade: TradeData = {
      price: parseFloat(data.p),
      quantity: parseFloat(data.q),
      time: data.T || Date.now(),
      isBuyerMaker: data.m || false
    }
    
    setTrades(prev => [newTrade, ...prev.slice(0, (tradingConfig?.imbalance?.dataLimits?.tradeHistory || 100) - 1)])
  }, [])

  // WebSocket 연결 관리 (실제 Binance 스트림)
  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      // 기존 연결 정리
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }

      // 멀티 스트림 구독 (티커 + 거래 + 오더북)
      const symbol = selectedCoin.symbol.toLowerCase()
      const streams = [`${symbol}@ticker`, `${symbol}@trade`, `${symbol}@depth20@100ms`]
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket 연결 성공:', selectedCoin.symbol)
        setWsConnected(true)
        setLoading(false)
        
        // 초기 오더북 로드
        fetchOrderBook()
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          const data = message.data
          
          // 스트림 타입에 따라 처리
          if (message.stream?.includes('@ticker')) {
            // 티커 데이터 업데이트
            setCurrentPrice(parseFloat(data.c))
            setPriceChange(parseFloat(data.P || 0))
          } else if (message.stream?.includes('@trade')) {
            // 거래 데이터 처리
            processTrades(data)
          } else if (message.stream?.includes('@depth')) {
            // 실시간 오더북 업데이트
            const newOrderBook = {
              bids: data.bids.slice(0, tradingConfig?.imbalance?.dataLimits?.orderbookDepth || 20).map((bid: string[]) => ({
                price: parseFloat(bid[0]),
                amount: parseFloat(bid[1])
              })),
              asks: data.asks.slice(0, tradingConfig?.imbalance?.dataLimits?.orderbookDepth || 20).map((ask: string[]) => ({
                price: parseFloat(ask[0]),
                amount: parseFloat(ask[1])
              }))
            }
            setOrderBook(newOrderBook)
            
            // 임밸런스 계산
            calculateImbalance(data)
          }
        } catch (error) {
          console.error('메시지 파싱 에러:', error)
        }
      }

      ws.onerror = () => {
        console.log('WebSocket 에러 발생')
        setWsConnected(false)
      }

      ws.onclose = (event) => {
        console.log('WebSocket 연결 종료')
        setWsConnected(false)
        wsRef.current = null
        
        // 비정상 종료 시 3초 후 재연결
        if (event.code !== 1000) {
          setTimeout(() => connectWebSocket(), tradingConfig?.imbalance?.intervals?.reconnectDelay || 3000)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      setWsConnected(false)
      setTimeout(() => connectWebSocket(), 3000)
    }
  }, [selectedCoin, fetchOrderBook, processTrades])

  // 임밸런스 계산 함수
  const calculateImbalance = (data: any) => {
    if (!data.bids || !data.asks) return
    
    const bidVolume = data.bids.reduce((sum: number, b: any) => sum + parseFloat(b[1]), 0)
    const askVolume = data.asks.reduce((sum: number, a: any) => sum + parseFloat(a[1]), 0)
    const imbalanceRatio = bidVolume / (bidVolume + askVolume)
    
    // OFI (Order Flow Imbalance) 계산
    const ofi = (bidVolume - askVolume) / (bidVolume + askVolume)
    
    // 깊이 임밸런스
    const depthImbalance = Math.abs(bidVolume - askVolume)
    
    // 틱 임밸런스 (최근 거래 기반)
    const recentBuys = trades.filter(t => !t.isBuyerMaker).length
    const recentSells = trades.filter(t => t.isBuyerMaker).length
    const tickImbalance = (recentBuys - recentSells) / (recentBuys + recentSells + 1)
    
    const newImbalance: ImbalanceData = {
      timestamp: Date.now(),
      bidVolume,
      askVolume,
      imbalanceRatio,
      ofi,
      depthImbalance,
      tickImbalance
    }
    
    setImbalanceHistory(prev => [newImbalance, ...prev.slice(0, 59)])
  }

  // 오더북 정기 업데이트 (5초마다)
  useEffect(() => {
    if (typeof window === 'undefined' || !wsConnected) return
    
    const interval = setInterval(() => {
      fetchOrderBook()
    }, tradingConfig?.imbalance?.intervals?.orderBook || 5000)
    
    return () => clearInterval(interval)
  }, [wsConnected, fetchOrderBook])
  
  // 트레이딩 설정 로드
  useEffect(() => {
    fetch('/api/trading/config')
      .then(res => res.json())
      .then(data => {
        setTradingConfig(data)
      })
      .catch(err => console.error('설정 로드 실패:', err))
  }, [])

  // 코인 변경 시 WebSocket 재연결
  useEffect(() => {
    setLoading(true)
    setImbalanceHistory([])
    setTrades([])
    setOrderBook({ bids: [], asks: [] })
    
    // 클라이언트 사이드에서만 WebSocket 연결
    if (typeof window !== 'undefined') {
      connectWebSocket()
      // 초기 오더북 로드
      setTimeout(() => fetchOrderBook(), tradingConfig?.imbalance?.intervals?.initialLoadDelay || 1000)
      
      // 과거 데이터 로드
      fetch(`/api/binance/klines?symbol=${selectedCoin.symbol}&interval=1m&limit=${tradingConfig?.imbalance?.dataLimits?.klineHistory || 60}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // 과거 데이터로 초기 임밸런스 히스토리 생성
            const historicalImbalance = data.map((kline: any) => {
              const volume = parseFloat(kline[5])
              const takerBuyVolume = parseFloat(kline[9])
              const takerSellVolume = volume - takerBuyVolume
              const bidRatio = volume > 0 ? takerBuyVolume / volume : 0.5
              
              return {
                timestamp: kline[0],
                bidVolume: takerBuyVolume,
                askVolume: takerSellVolume,
                imbalanceRatio: bidRatio,
                ofi: volume > 0 ? (takerBuyVolume - takerSellVolume) / volume : 0,
                depthImbalance: Math.abs(takerBuyVolume - takerSellVolume),
                tickImbalance: volume > 0 ? (takerBuyVolume - takerSellVolume) / volume : 0
              }
            })
            setImbalanceHistory(historicalImbalance.slice(-(tradingConfig?.imbalance?.dataLimits?.klineHistory || 60)))
          }
        })
        .catch(err => console.error('과거 데이터 로드 실패:', err))
    }
    
    // 초기 데이터 로드
    fetch(`/api/binance/ticker?symbol=${selectedCoin.symbol}`)
      .then(res => {
        if (!res.ok) throw new Error('API 응답 실패')
        return res.json()
      })
      .then(data => {
        if (data.lastPrice) {
          setCurrentPrice(parseFloat(data.lastPrice))
          setPriceChange(parseFloat(data.priceChangePercent || 0))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('초기 데이터 로드 실패, 재시도 중...')
        // API 재시도
        setTimeout(() => {
          fetch(`/api/binance/ticker?symbol=${selectedCoin.symbol}`)
            .then(res => res.json())
            .then(data => {
              if (data.lastPrice) {
                setCurrentPrice(parseFloat(data.lastPrice))
                setPriceChange(parseFloat(data.priceChangePercent || 0))
              }
            })
            .finally(() => setLoading(false))
        }, tradingConfig?.imbalance?.intervals?.initialLoadDelay || 1000)
      })
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount')
      }
    }
  }, [selectedCoin, connectWebSocket, fetchOrderBook])

  // 임밸런스 강도 계산
  const getImbalanceStrength = () => {
    if (imbalanceHistory.length === 0) return 'neutral'
    const latest = imbalanceHistory[0]
    const thresholds = tradingConfig?.imbalance?.ofiThresholds || {
      neutral: 0.1,
      buy: 0.1,
      strongBuy: 0.3,
      sell: -0.1,
      strongSell: -0.3
    }
    
    if (Math.abs(latest.ofi) < thresholds.neutral) return 'neutral'
    if (latest.ofi > thresholds.strongBuy) return 'strong_buy'
    if (latest.ofi > thresholds.buy) return 'buy'
    if (latest.ofi < thresholds.strongSell) return 'strong_sell'
    return 'sell'
  }

  // 트레이딩 시그널 생성
  const getTradingSignal = () => {
    const strength = getImbalanceStrength()
    const confidence = tradingConfig?.imbalance?.confidence || {
      strongBuy: 85,
      buy: 65,
      neutral: 50,
      sell: 65,
      strongSell: 85
    }
    
    const signals = {
      strong_buy: { action: '강력 매수', confidence: confidence.strongBuy, color: 'text-green-400' },
      buy: { action: '매수', confidence: confidence.buy, color: 'text-green-300' },
      neutral: { action: '중립', confidence: confidence.neutral, color: 'text-gray-400' },
      sell: { action: '매도', confidence: confidence.sell, color: 'text-red-300' },
      strong_sell: { action: '강력 매도', confidence: confidence.strongSell, color: 'text-red-400' }
    }
    return signals[strength as keyof typeof signals]
  }

  const signal = getTradingSignal()

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        {/* 헤더 - 코인 선택 */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  임밸런스 전문 분석
                </h1>
                <p className="text-gray-400 text-sm mt-1">오더북 · 플로우 · 깊이 · 틱 임밸런스 종합 분석</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${wsConnected ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></span>
                  {wsConnected ? '실시간 연결됨' : '데이터 스트리밍 중...'}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-purple-900/50 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                  라이브
                </span>
              </div>
            </div>
            
            {/* 코인 선택 탭 */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
              {COINS.map(coin => (
                <button
                  key={coin.symbol}
                  onClick={() => setSelectedCoin(coin)}
                  className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    selectedCoin.symbol === coin.symbol
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="font-semibold">{coin.name}</span>
                  <span className="text-xs ml-1 opacity-70">{coin.symbol.replace('USDT', '')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 가격 정보 및 신호 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/10 to-transparent rounded-full animate-pulse"></div>
                  <h3 className="text-sm text-gray-400 mb-2">현재 가격</h3>
                  <div className="text-3xl font-bold transition-all duration-300">
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-sm mt-2 flex items-center gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="animate-bounce">{priceChange >= 0 ? '▲' : '▼'}</span>
                    <span>{Math.abs(priceChange).toFixed(2)}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-slide"></div>
                  <h3 className="text-sm text-gray-400 mb-2">임밸런스 신호</h3>
                  <div className={`text-3xl font-bold ${signal.color} animate-pulse`}>{signal.action}</div>
                  <div className="text-sm text-gray-400 mt-2 flex items-center gap-2">
                    <span>신뢰도:</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          signal.confidence > (tradingConfig?.imbalance?.uiThresholds?.highConfidence || 70) ? 'bg-green-500' : signal.confidence > (tradingConfig?.imbalance?.uiThresholds?.mediumConfidence || 50) ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span>{signal.confidence}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-600/10 to-transparent rounded-full animate-pulse"></div>
                  <h3 className="text-sm text-gray-400 mb-2">OFI 지표</h3>
                  <div className="text-3xl font-bold transition-all duration-300">
                    <span className={imbalanceHistory[0]?.ofi > 0 ? 'text-green-400' : 'text-red-400'}>
                      {imbalanceHistory[0]?.ofi.toFixed(3) || '0.000'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${imbalanceHistory[0]?.ofi > 0 ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></span>
                    {imbalanceHistory[0]?.ofi > 0 ? '매수 압력' : '매도 압력'}
                  </div>
                </div>
              </div>

              {/* 임밸런스 개념 설명 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📚</span> 임밸런스란?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-purple-400 font-semibold mb-2">오더북 임밸런스</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      매수/매도 주문의 불균형을 측정합니다. 매수 주문이 많으면 가격 상승 압력, 
                      매도 주문이 많으면 하락 압력으로 해석됩니다.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-blue-400 font-semibold mb-2">오더플로우 임밸런스 (OFI)</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      실시간 주문 흐름의 방향성을 나타냅니다. 양수는 매수세 우위, 
                      음수는 매도세 우위를 의미합니다.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-green-400 font-semibold mb-2">깊이 임밸런스</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      호가창 깊이별 유동성 불균형을 분석합니다. 특정 가격대의 
                      벽(wall)을 감지하여 지지/저항을 예측합니다.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-yellow-400 font-semibold mb-2">틱 임밸런스</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      실제 체결된 거래의 매수/매도 비율을 분석합니다. 
                      시장 참여자들의 실제 행동을 반영합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 실시간 오더북 임밸런스 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span> 실시간 오더북 임밸런스
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={tradingConfig?.imbalance?.chartConfig?.height || 300}>
                      <BarChart
                        data={[
                          ...(orderBook.asks?.slice(0, 10).reverse().map(a => ({
                            price: a.price?.toFixed(2) || 0,
                            volume: -(a.amount || a.quantity || 0),
                            type: 'ask'
                          })) || []),
                          ...(orderBook.bids?.slice(0, 10).map(b => ({
                            price: b.price?.toFixed(2) || 0,
                            volume: b.amount || b.quantity || 0,
                            type: 'bid'
                          })) || [])
                        ]}
                        margin={tradingConfig?.imbalance?.chartConfig?.margins || { top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="price" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                          labelStyle={{ color: '#9CA3AF' }}
                          formatter={(value: any) => Math.abs(value).toFixed(4)}
                        />
                        <Bar dataKey="volume">
                          {orderBook.asks?.slice(0, 10).reverse().map((_, index) => (
                            <Cell key={`ask-${index}`} fill="#EF4444" />
                          ))}
                          {orderBook.bids?.slice(0, 10).map((_, index) => (
                            <Cell key={`bid-${index}`} fill="#10B981" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">매수 압력</span>
                        <span className="text-green-400 font-semibold">
                          {((imbalanceHistory[0]?.imbalanceRatio || (tradingConfig?.imbalance?.orderBookThresholds?.neutral || 0.5)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${(imbalanceHistory[0]?.imbalanceRatio || (tradingConfig?.imbalance?.orderBookThresholds?.neutral || 0.5)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">매도 압력</span>
                        <span className="text-red-400 font-semibold">
                          {(100 - (imbalanceHistory[0]?.imbalanceRatio || (tradingConfig?.imbalance?.orderBookThresholds?.neutral || 0.5)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-400 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${100 - (imbalanceHistory[0]?.imbalanceRatio || (tradingConfig?.imbalance?.orderBookThresholds?.neutral || 0.5)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">임밸런스 해석</p>
                      <p className="text-gray-300">
                        {imbalanceHistory[0]?.imbalanceRatio > (tradingConfig?.imbalance?.orderBookThresholds?.strongBuy || 0.6) 
                          ? '강한 매수 압력이 감지됩니다. 단기 상승 가능성이 높습니다.'
                          : imbalanceHistory[0]?.imbalanceRatio < (tradingConfig?.imbalance?.orderBookThresholds?.strongSell || 0.4)
                          ? '강한 매도 압력이 감지됩니다. 단기 하락 가능성이 높습니다.'
                          : '매수와 매도가 균형을 이루고 있습니다. 추가 신호를 기다리세요.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OFI 차트 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌊</span> 오더플로우 임밸런스 (OFI)
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={imbalanceHistory.slice().reverse()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#9CA3AF"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                      labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ofi" 
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 깊이 임밸런스 히트맵 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🗺️</span> 깊이 임밸런스 히트맵
                </h2>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {imbalanceHistory.slice(0, 30).map((data, idx) => {
                    const intensity = Math.abs(data.ofi)
                    const bgColor = data.ofi > 0 
                      ? intensity > (tradingConfig?.imbalance?.uiThresholds?.highOfi || 0.3) ? 'bg-green-500' : intensity > (tradingConfig?.imbalance?.uiThresholds?.mediumOfi || 0.1) ? 'bg-green-400' : 'bg-green-300'
                      : intensity > (tradingConfig?.imbalance?.uiThresholds?.highOfi || 0.3) ? 'bg-red-500' : intensity > (tradingConfig?.imbalance?.uiThresholds?.mediumOfi || 0.1) ? 'bg-red-400' : 'bg-red-300'
                    return (
                      <div
                        key={idx}
                        className={`h-12 rounded ${bgColor} flex items-center justify-center text-xs`}
                        title={`OFI: ${data.ofi.toFixed(3)}`}
                      >
                        {data.ofi.toFixed(2)}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>← 최신</span>
                  <span>과거 →</span>
                </div>
              </div>

              {/* 틱 임밸런스 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span> 틱 임밸런스
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm text-gray-400 mb-3">최근 거래 플로우</h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                      {trades.slice(0, tradingConfig?.imbalance?.dataLimits?.displayTrades || 20).map((trade, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-3 p-2 rounded bg-gray-900/50 animate-slideIn"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <span className={`text-xs px-2 py-1 rounded ${
                            trade.isBuyerMaker ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
                          } animate-pulse`}>
                            {trade.isBuyerMaker ? 'SELL' : 'BUY'}
                          </span>
                          <span className="text-white font-mono">${trade.price.toFixed(2)}</span>
                          <span className="text-gray-400 text-sm">{trade.quantity.toFixed(4)}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {new Date(trade.time).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-400 mb-3">거래 통계</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">매수 거래</span>
                          <span className="text-green-400">
                            {trades.filter(t => !t.isBuyerMaker).length}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-400">매도 거래</span>
                          <span className="text-red-400">
                            {trades.filter(t => t.isBuyerMaker).length}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-700">
                          <span className="text-gray-400">틱 임밸런스</span>
                          <span className={`font-semibold ${
                            imbalanceHistory[0]?.tickImbalance > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {((imbalanceHistory[0]?.tickImbalance || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 트레이딩 전략 */}
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-6 border border-purple-700/30">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> 임밸런스 기반 트레이딩 전략
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-purple-400 font-semibold mb-3">진입 전략</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">▲</span>
                        <span>OFI {'>'} {tradingConfig?.imbalance?.ofiThresholds?.strongBuy || 0.3} &amp; 오더북 매수 압력 {'>'} {(tradingConfig?.imbalance?.tradingRatios?.entryThreshold || 0.6) * 100}% → 롱 진입</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">▼</span>
                        <span>OFI {'<'} {tradingConfig?.imbalance?.ofiThresholds?.strongSell || -0.3} &amp; 오더북 매도 압력 {'>'} {(tradingConfig?.imbalance?.tradingRatios?.entryThreshold || 0.6) * 100}% → 숏 진입</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">●</span>
                        <span>틱 임밸런스와 OFI 방향 일치 시 신호 강화</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-blue-400 font-semibold mb-3">리스크 관리</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">⚠</span>
                        <span>임밸런스 급변 시 포지션 축소</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">⚠</span>
                        <span>깊이 임밸런스 과도 시 ({'>'}{(tradingConfig?.imbalance?.orderBookThresholds?.critical || 0.8) * 100}%) 주의</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">⚠</span>
                        <span>손절: OFI 반전 시 즉시 청산</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                  <h3 className="text-yellow-400 font-semibold mb-2">💡 현재 추천 전략</h3>
                  <p className="text-gray-300 text-sm">
                    {signal.action === '강력 매수' && '강한 매수 신호입니다. 적극적인 롱 포지션을 고려하세요.'}
                    {signal.action === '매수' && '매수 우위입니다. 신중한 롱 포지션을 고려하세요.'}
                    {signal.action === '중립' && '방향성이 불분명합니다. 관망하며 추가 신호를 기다리세요.'}
                    {signal.action === '매도' && '매도 우위입니다. 신중한 숏 포지션을 고려하세요.'}
                    {signal.action === '강력 매도' && '강한 매도 신호입니다. 적극적인 숏 포지션을 고려하세요.'}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">진입가:</span>
                      <span className="text-white ml-2">${currentPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">손절가:</span>
                      <span className="text-red-400 ml-2">
                        ${(currentPrice * (signal.action.includes('매수') ? (tradingConfig?.imbalance?.tradingRatios?.stopLossLong || 0.98) : (tradingConfig?.imbalance?.tradingRatios?.stopLossShort || 1.02))).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">목표가:</span>
                      <span className="text-green-400 ml-2">
                        ${(currentPrice * (signal.action.includes('매수') ? (tradingConfig?.imbalance?.tradingRatios?.takeProfitLong || 1.03) : (tradingConfig?.imbalance?.tradingRatios?.takeProfitShort || 0.97))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 종합 분석 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI 종합 분석
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {Math.abs(imbalanceHistory[0]?.ofi || 0).toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">OFI 강도</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {((imbalanceHistory[0]?.imbalanceRatio || (tradingConfig?.imbalance?.orderBookThresholds?.neutral || 0.5)) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-400 mt-1">오더북 균형</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {imbalanceHistory[0]?.depthImbalance.toFixed(0) || '0'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">깊이 차이</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {Math.abs(imbalanceHistory[0]?.tickImbalance || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">틱 임밸런스</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <h3 className="font-semibold mb-2 text-purple-400">종합 판단</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      현재 {selectedCoin.name}의 임밸런스 지표를 종합 분석한 결과, 
                      {signal.action === '강력 매수' && ' 매우 강한 상승 압력이 감지됩니다. 대량 매수 주문이 유입되고 있으며, 단기 급등 가능성이 높습니다.'}
                      {signal.action === '매수' && ' 매수세가 우위를 보이고 있습니다. 점진적인 상승이 예상되나, 급격한 변동에 주의가 필요합니다.'}
                      {signal.action === '중립' && ' 매수와 매도가 균형을 이루고 있습니다. 방향성이 결정되기를 기다리는 것이 안전합니다.'}
                      {signal.action === '매도' && ' 매도세가 우위를 보이고 있습니다. 점진적인 하락이 예상되나, 반등 가능성도 염두에 두어야 합니다.'}
                      {signal.action === '강력 매도' && ' 매우 강한 하락 압력이 감지됩니다. 대량 매도 주문이 유입되고 있으며, 단기 급락 가능성이 높습니다.'}
                    </p>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-800/50 rounded">
                        <h4 className="text-sm font-semibold text-green-400 mb-2">긍정 요인</h4>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {imbalanceHistory[0]?.ofi > 0 && <li>• OFI 양수로 매수 압력 우세</li>}
                          {imbalanceHistory[0]?.imbalanceRatio > (tradingConfig?.imbalance?.orderBookThresholds?.neutral || 0.5) && <li>• 오더북 매수 주문 우위</li>}
                          {imbalanceHistory[0]?.tickImbalance > 0 && <li>• 실제 매수 거래 증가</li>}
                          {trades.filter(t => !t.isBuyerMaker).length > trades.filter(t => t.isBuyerMaker).length && <li>• 적극적 매수세 유입</li>}
                        </ul>
                      </div>
                      <div className="p-3 bg-gray-800/50 rounded">
                        <h4 className="text-sm font-semibold text-red-400 mb-2">부정 요인</h4>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {imbalanceHistory[0]?.ofi < 0 && <li>• OFI 음수로 매도 압력 우세</li>}
                          {imbalanceHistory[0]?.imbalanceRatio < (tradingConfig?.imbalance?.orderBookThresholds?.neutral || 0.5) && <li>• 오더북 매도 주문 우위</li>}
                          {imbalanceHistory[0]?.tickImbalance < 0 && <li>• 실제 매도 거래 증가</li>}
                          {trades.filter(t => t.isBuyerMaker).length > trades.filter(t => !t.isBuyerMaker).length && <li>• 적극적 매도세 유입</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}