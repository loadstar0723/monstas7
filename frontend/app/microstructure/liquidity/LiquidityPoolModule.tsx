'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import WebSocketManager from '@/lib/websocketManager'
import LiquidityDepthHeatmap from './components/LiquidityDepthHeatmap'
import OrderBookVisualizer from './components/OrderBookVisualizer'
import LiquidityMetrics from './components/LiquidityMetrics'
import LiquidityRadar from './components/LiquidityRadar'
import WallDetector from './components/WallDetector'
import SpoofingDetector from './components/SpoofingDetector'
import ExecutableLiquidity from './components/ExecutableLiquidity'
import TradingStrategy from './components/TradingStrategy'
import ConceptGuide from './components/ConceptGuide'
import DepthChart from './components/DepthChart'
import CoinSelector from './components/CoinSelector'
import { ChevronUpIcon } from '@heroicons/react/24/outline'

// 10개 주요 코인
const SUPPORTED_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🟡' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬣' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●' }
]

export default function LiquidityPoolModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [orderbook, setOrderbook] = useState<any>(null)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  const wsManager = useRef(WebSocketManager.getInstance())
  const orderbookHistoryRef = useRef<any[]>([])
  const prevCoinRef = useRef<string>('')
  
  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 오더북 데이터
      const orderbookResponse = await fetch(`/api/binance/orderbook?symbol=${selectedCoin}&limit=100`)
      if (!orderbookResponse.ok) {
        console.warn('오더북 데이터 로드 실패, depth API 사용')
        // Depth API 시도
        const depthResponse = await fetch(`/api/binance/depth?symbol=${selectedCoin}&limit=20`)
        if (depthResponse.ok) {
          const depthData = await depthResponse.json()
          setOrderbook({
            bids: depthData.bids.map((bid: string[]) => ({
              price: parseFloat(bid[0]),
              amount: parseFloat(bid[1]),
              total: parseFloat(bid[0]) * parseFloat(bid[1])
            })),
            asks: depthData.asks.map((ask: string[]) => ({
              price: parseFloat(ask[0]),
              amount: parseFloat(ask[1]),
              total: parseFloat(ask[0]) * parseFloat(ask[1])
            })),
            lastUpdateId: depthData.lastUpdateId
          })
        }
      } else {
        const orderbookData = await orderbookResponse.json()
        setOrderbook(orderbookData)
      }
      
      // 24시간 통계
      const ticker24hrResponse = await fetch(`/api/binance/ticker/24hr?symbol=${selectedCoin}`)
      if (!ticker24hrResponse.ok) {
        console.warn('티커 데이터 로드 실패, 기본값 사용')
        // 기본값 설정
        setCurrentPrice(98000)
        setVolume24h(1000000)
        setPriceChange24h(2.5)
      } else {
        const ticker24hrData = await ticker24hrResponse.json()
        setCurrentPrice(parseFloat(ticker24hrData.lastPrice) || 98000)
        setVolume24h(parseFloat(ticker24hrData.volume) || 1000000)
        setPriceChange24h(parseFloat(ticker24hrData.priceChangePercent) || 0)
      }
      
    } catch (err) {
      console.error('초기 데이터 로드 에러:', err)
      setError(err instanceof Error ? err.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [selectedCoin])
  
  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    const depthUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@depth20@100ms`
    const tickerUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@ticker`
    
    // 오더북 WebSocket
    wsManager.current.connect(
      `depth-${selectedCoin}`,
      depthUrl,
      (data) => {
        if (data.e === 'depthUpdate') {
          setOrderbook((prev: any) => {
            if (!prev) return null
            
            const newOrderbook = {
              ...prev,
              bids: data.b.map((bid: string[]) => ({
                price: parseFloat(bid[0]),
                amount: parseFloat(bid[1]),
                total: parseFloat(bid[0]) * parseFloat(bid[1])
              })),
              asks: data.a.map((ask: string[]) => ({
                price: parseFloat(ask[0]),
                amount: parseFloat(ask[1]),
                total: parseFloat(ask[0]) * parseFloat(ask[1])
              })),
              lastUpdateId: data.u
            }
            
            // 히스토리 저장 (최근 100개만)
            orderbookHistoryRef.current = [...orderbookHistoryRef.current, newOrderbook].slice(-100)
            
            return newOrderbook
          })
        }
      }
    )
    
    // 티커 WebSocket
    wsManager.current.connect(
      `ticker-${selectedCoin}`,
      tickerUrl,
      (data) => {
        if (data.e === '24hrTicker') {
          setCurrentPrice(parseFloat(data.c))
          setVolume24h(parseFloat(data.v))
          setPriceChange24h(parseFloat(data.P))
        }
      }
    )
  }, [selectedCoin])
  
  // 코인 변경 시
  useEffect(() => {
    // 이전 코인의 WebSocket 연결 해제
    if (prevCoinRef.current) {
      wsManager.current.disconnect(`depth-${prevCoinRef.current}`)
      wsManager.current.disconnect(`ticker-${prevCoinRef.current}`)
    }
    
    // 상태 초기화
    setOrderbook(null)
    setCurrentPrice(0)
    setVolume24h(0)
    setPriceChange24h(0)
    orderbookHistoryRef.current = []
    
    // 새 데이터 로드 및 연결
    loadInitialData()
    connectWebSocket()
    
    // 현재 코인 저장
    prevCoinRef.current = selectedCoin
    
    return () => {
      wsManager.current.disconnect(`depth-${selectedCoin}`)
      wsManager.current.disconnect(`ticker-${selectedCoin}`)
    }
  }, [selectedCoin, loadInitialData, connectWebSocket])
  
  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // 맨 위로 스크롤
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                유동성 풀 전문 분석
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                실시간 오더북 깊이 & 유동성 메트릭 분석
              </p>
            </div>
            
            {/* 실시간 가격 정보 */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-gray-400 text-xs">현재가</p>
                <p className="text-xl font-bold">
                  ${currentPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">24h 변동</p>
                <p className={`text-lg font-bold ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange24h >= 0 ? '+' : ''}{safePrice(priceChange24h, 2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">24h 거래량</p>
                <p className="text-lg font-bold">
                  ${(volume24h * currentPrice / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 코인 선택 탭 */}
      <CoinSelector 
        coins={SUPPORTED_COINS}
        selectedCoin={selectedCoin}
        onSelectCoin={setSelectedCoin}
      />
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="ml-4 text-gray-400">데이터 로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={loadInitialData}
              className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 섹션 1: 3D 유동성 히트맵 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">📊</span>
                3D 유동성 히트맵
              </h2>
              <LiquidityDepthHeatmap 
                orderbook={orderbook}
                currentPrice={currentPrice}
              />
            </section>
            
            {/* 섹션 2: 실시간 오더북 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-blue-400">📈</span>
                실시간 오더북 시각화
              </h2>
              <OrderBookVisualizer 
                orderbook={orderbook}
                currentPrice={currentPrice}
              />
            </section>
            
            {/* 섹션 3: 유동성 메트릭 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-green-400">📉</span>
                유동성 메트릭 대시보드
              </h2>
              <LiquidityMetrics 
                orderbook={orderbook}
                currentPrice={currentPrice}
                symbol={selectedCoin}
              />
            </section>
            
            {/* 섹션 4: 유동성 레이더 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-400">🎯</span>
                유동성 레이더
              </h2>
              <LiquidityRadar 
                orderbook={orderbook}
                history={orderbookHistoryRef.current}
              />
            </section>
            
            {/* 섹션 5: Wall & 스푸핑 탐지 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-red-400">🚧</span>
                  Wall 탐지기
                </h2>
                <WallDetector 
                  orderbook={orderbook}
                  currentPrice={currentPrice}
                />
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-orange-400">⚠️</span>
                  스푸핑 탐지기
                </h2>
                <SpoofingDetector 
                  orderbook={orderbook}
                  history={orderbookHistoryRef.current}
                />
              </section>
            </div>
            
            {/* 섹션 6: 실행 가능 유동성 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-cyan-400">💧</span>
                실행 가능 유동성 분석
              </h2>
              <ExecutableLiquidity 
                orderbook={orderbook}
                currentPrice={currentPrice}
              />
            </section>
            
            {/* 섹션 7: 깊이 차트 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-indigo-400">📊</span>
                누적 깊이 차트
              </h2>
              <DepthChart 
                orderbook={orderbook}
                currentPrice={currentPrice}
              />
            </section>
            
            {/* 섹션 8: 트레이딩 전략 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-pink-400">🎯</span>
                유동성 기반 트레이딩 전략
              </h2>
              <TradingStrategy 
                orderbook={orderbook}
                currentPrice={currentPrice}
                priceChange24h={priceChange24h}
                volume24h={volume24h}
              />
            </section>
            
            {/* 섹션 9: 개념 가이드 */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-400">📚</span>
                유동성 개념 가이드
              </h2>
              <ConceptGuide />
            </section>
          </div>
        )}
      </div>
      
      {/* 화면 위로 가기 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-all duration-300 group"
          aria-label="맨 위로 이동"
        >
          <ChevronUpIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  )
}