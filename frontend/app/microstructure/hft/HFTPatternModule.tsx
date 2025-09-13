'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import WebSocketManager from '@/lib/websocketManager'
import CoinSelector from './components/CoinSelector'
import ConceptGuide from './components/ConceptGuide'
import AlgoActivityHeatmap from './components/AlgoActivityHeatmap'
import PatternClassifier from './components/PatternClassifier'
import BotBehaviorAnalysis from './components/BotBehaviorAnalysis'
import StrategyInference from './components/StrategyInference'
import MarketManipulationDetector from './components/MarketManipulationDetector'
import TradingStrategy from './components/TradingStrategy'
import VolumeProfile from './components/VolumeProfile'
import PerformanceMetrics from './components/PerformanceMetrics'
import { ChevronUpIcon } from '@heroicons/react/24/outline'

// 10개 주요 코인
const SUPPORTED_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', color: 'orange' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', color: 'blue' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🟡', color: 'yellow' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎', color: 'purple' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕', color: 'gray' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳', color: 'blue' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð', color: 'yellow' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺', color: 'red' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬣', color: 'purple' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●', color: 'pink' }
]

// HFT 패턴 타입 정의
interface HFTPattern {
  timestamp: number
  type: 'market_making' | 'arbitrage' | 'momentum' | 'scalping' | 'spoofing'
  confidence: number
  volume: number
  price: number
  impact: 'low' | 'medium' | 'high'
}

// 거래 데이터 타입
interface TradeData {
  price: number
  quantity: number
  time: number
  isBuyerMaker: boolean
  aggTradeId: number
}

export default function HFTPatternModule() {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [volume24h, setVolume24h] = useState(0)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [trades, setTrades] = useState<TradeData[]>([])
  const [patterns, setPatterns] = useState<HFTPattern[]>([])
  const [orderbook, setOrderbook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const wsManager = useRef(WebSocketManager.getInstance())
  const tradesHistoryRef = useRef<TradeData[]>([])
  const patternsHistoryRef = useRef<HFTPattern[]>([])
  const patternDetectorRef = useRef<any>(null)
  
  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 24시간 통계
      const ticker24hrResponse = await fetch(`/api/binance/ticker/24hr?symbol=${selectedCoin}`)
      if (ticker24hrResponse.ok) {
        const ticker24hrData = await ticker24hrResponse.json()
        setCurrentPrice(parseFloat(ticker24hrData.lastPrice) || 0)
        setVolume24h(parseFloat(ticker24hrData.volume) || 0)
        setPriceChange24h(parseFloat(ticker24hrData.priceChangePercent) || 0)
      }
      
      // 오더북 데이터
      const orderbookResponse = await fetch(`/api/binance/depth?symbol=${selectedCoin}&limit=100`)
      if (orderbookResponse.ok) {
        const orderbookData = await orderbookResponse.json()
        setOrderbook({
          bids: orderbookData.bids.map((bid: string[]) => ({
            price: parseFloat(bid[0]),
            amount: parseFloat(bid[1])
          })),
          asks: orderbookData.asks.map((ask: string[]) => ({
            price: parseFloat(ask[0]),
            amount: parseFloat(ask[1])
          })),
          lastUpdateId: orderbookData.lastUpdateId
        })
      }
      
      // 최근 거래 데이터
      const tradesResponse = await fetch(`/api/binance/aggTrades?symbol=${selectedCoin}&limit=500`)
      if (tradesResponse.ok) {
        const tradesData = await tradesResponse.json()
        const formattedTrades = tradesData.map((trade: any) => ({
          price: parseFloat(trade.p),
          quantity: parseFloat(trade.q),
          time: trade.T,
          isBuyerMaker: trade.m,
          aggTradeId: trade.a
        }))
        setTrades(formattedTrades)
        tradesHistoryRef.current = formattedTrades
        
        // 초기 패턴 분석
        analyzeHFTPatterns(formattedTrades)
      }
      
    } catch (err) {
      console.error('초기 데이터 로드 에러:', err)
      setError(err instanceof Error ? err.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [selectedCoin])
  
  // HFT 패턴 분석 함수
  const analyzeHFTPatterns = useCallback((trades: TradeData[]) => {
    if (trades.length < 10) return
    
    const newPatterns: HFTPattern[] = []
    const now = Date.now()
    
    // 거래 빈도 분석 (1초 단위)
    const tradeFrequency = trades.filter(t => now - t.time < 1000).length
    
    // 양방향 거래 비율 (마켓 메이킹 탐지)
    const buyTrades = trades.filter(t => !t.isBuyerMaker).length
    const sellTrades = trades.filter(t => t.isBuyerMaker).length
    const bidAskRatio = Math.min(buyTrades, sellTrades) / Math.max(buyTrades, sellTrades)
    
    // 마켓 메이킹 패턴 탐지
    if (bidAskRatio > 0.8 && tradeFrequency > 20) {
      newPatterns.push({
        timestamp: now,
        type: 'market_making',
        confidence: bidAskRatio * 100,
        volume: trades.reduce((sum, t) => sum + t.quantity, 0),
        price: trades[0].price,
        impact: tradeFrequency > 50 ? 'high' : tradeFrequency > 30 ? 'medium' : 'low'
      })
    }
    
    // 모멘텀 패턴 탐지 (일방향 거래)
    const recentTrades = trades.slice(0, 20)
    const buyRatio = recentTrades.filter(t => !t.isBuyerMaker).length / recentTrades.length
    
    if (buyRatio > 0.8 || buyRatio < 0.2) {
      newPatterns.push({
        timestamp: now,
        type: 'momentum',
        confidence: Math.abs(buyRatio - 0.5) * 200,
        volume: recentTrades.reduce((sum, t) => sum + t.quantity, 0),
        price: recentTrades[0].price,
        impact: Math.abs(buyRatio - 0.5) > 0.4 ? 'high' : 'medium'
      })
    }
    
    // 스캘핑 패턴 탐지 (빠른 진입/청산)
    const priceRange = Math.max(...trades.map(t => t.price)) - Math.min(...trades.map(t => t.price))
    const avgPrice = trades.reduce((sum, t) => sum + t.price, 0) / trades.length
    const priceVolatility = (priceRange / avgPrice) * 100
    
    if (tradeFrequency > 30 && priceVolatility < 0.1) {
      newPatterns.push({
        timestamp: now,
        type: 'scalping',
        confidence: Math.min(tradeFrequency / 50 * 100, 100),
        volume: trades.slice(0, 50).reduce((sum, t) => sum + t.quantity, 0),
        price: avgPrice,
        impact: tradeFrequency > 40 ? 'high' : 'medium'
      })
    }
    
    // 차익거래 패턴 탐지 (대량 거래)
    const largeTrades = trades.filter(t => t.quantity > trades.reduce((sum, t) => sum + t.quantity, 0) / trades.length * 3)
    
    if (largeTrades.length > 0) {
      newPatterns.push({
        timestamp: now,
        type: 'arbitrage',
        confidence: Math.min(largeTrades.length / 5 * 100, 100),
        volume: largeTrades.reduce((sum, t) => sum + t.quantity, 0),
        price: largeTrades[0].price,
        impact: largeTrades.length > 3 ? 'high' : 'medium'
      })
    }
    
    // 패턴 업데이트
    const updatedPatterns = [...newPatterns, ...patternsHistoryRef.current].slice(0, 100)
    setPatterns(updatedPatterns)
    patternsHistoryRef.current = updatedPatterns
  }, [])
  
  // WebSocket 연결
  const connectWebSocket = useCallback(() => {
    // 집계 거래 스트림
    const aggTradeUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@aggTrade`
    
    wsManager.current.connect(
      `aggTrade-${selectedCoin}`,
      aggTradeUrl,
      (data) => {
        if (data.e === 'aggTrade') {
          const newTrade: TradeData = {
            price: parseFloat(data.p),
            quantity: parseFloat(data.q),
            time: data.T,
            isBuyerMaker: data.m,
            aggTradeId: data.a
          }
          
          // 거래 데이터 업데이트
          setTrades(prev => {
            const updated = [newTrade, ...prev].slice(0, 500)
            tradesHistoryRef.current = updated
            
            // 실시간 패턴 분석
            if (updated.length % 10 === 0) {
              analyzeHFTPatterns(updated.slice(0, 50))
            }
            
            return updated
          })
        }
      }
    )
    
    // 티커 스트림
    const tickerUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@ticker`
    
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
    
    // 오더북 스트림
    const depthUrl = `wss://stream.binance.com:9443/ws/${selectedCoin.toLowerCase()}@depth20@100ms`
    
    wsManager.current.connect(
      `depth-${selectedCoin}`,
      depthUrl,
      (data) => {
        if (data.e === 'depthUpdate') {
          setOrderbook({
            bids: data.b.map((bid: string[]) => ({
              price: parseFloat(bid[0]),
              amount: parseFloat(bid[1])
            })),
            asks: data.a.map((ask: string[]) => ({
              price: parseFloat(ask[0]),
              amount: parseFloat(ask[1])
            })),
            lastUpdateId: data.u
          })
        }
      }
    )
  }, [selectedCoin, analyzeHFTPatterns])
  
  // 코인 변경 처리
  const handleCoinChange = useCallback((coin: string) => {
    // WebSocket 연결 종료
    wsManager.current.disconnect(`aggTrade-${selectedCoin}`)
    wsManager.current.disconnect(`ticker-${selectedCoin}`)
    wsManager.current.disconnect(`depth-${selectedCoin}`)
    
    // 데이터 초기화
    setTrades([])
    setPatterns([])
    setOrderbook(null)
    tradesHistoryRef.current = []
    patternsHistoryRef.current = []
    
    // 새 코인 설정
    setSelectedCoin(coin)
  }, [selectedCoin])

  // 초기 데이터 로드 및 WebSocket 연결
  useEffect(() => {
    loadInitialData()
    connectWebSocket()
    
    return () => {
      wsManager.current.disconnect(`aggTrade-${selectedCoin}`)
      wsManager.current.disconnect(`ticker-${selectedCoin}`)
      wsManager.current.disconnect(`depth-${selectedCoin}`)
    }
  }, [selectedCoin, loadInitialData, connectWebSocket])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">🤖 HFT 패턴 분석</h1>
              <p className="text-gray-400 text-sm mt-1">고빈도 거래 패턴 실시간 탐지 시스템</p>
            </div>
            
            {/* 코인 선택기 */}
            <CoinSelector
              coins={SUPPORTED_COINS}
              selected={selectedCoin}
              onChange={handleCoinChange}
              currentPrice={currentPrice}
              priceChange24h={priceChange24h}
            />
          </div>
          
          {/* 실시간 지표 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">현재가</p>
              <p className="text-white font-bold text-lg">
                ${currentPrice.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">24시간 변동</p>
              <p className={`font-bold text-lg ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h >= 0 ? '+' : ''}{safePrice(priceChange24h, 2)}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">24시간 거래량</p>
              <p className="text-white font-bold text-lg">
                {(volume24h / 1000000).toFixed(2)}M
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-gray-400 text-xs">감지된 패턴</p>
              <p className="text-purple-400 font-bold text-lg">
                {patterns.length}개
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <p className="text-red-400">에러: {error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 개념 가이드 */}
            <ConceptGuide />
            
            {/* 알고리즘 활동 히트맵 */}
            <AlgoActivityHeatmap
              trades={trades}
              patterns={patterns}
              selectedCoin={selectedCoin}
            />
            
            {/* 패턴 분류기 */}
            <PatternClassifier
              patterns={patterns}
              trades={trades}
            />
            
            {/* 봇 행동 분석 */}
            <BotBehaviorAnalysis
              patterns={patterns}
              trades={trades}
              orderbook={orderbook}
            />
            
            {/* 전략 추론 도구 */}
            <StrategyInference
              patterns={patterns}
              trades={trades}
              currentPrice={currentPrice}
            />
            
            {/* 시장 조작 탐지 */}
            <MarketManipulationDetector
              trades={trades}
              orderbook={orderbook}
              patterns={patterns}
            />
            
            {/* 거래량 프로파일 */}
            <VolumeProfile
              trades={trades}
              currentPrice={currentPrice}
            />
            
            {/* 트레이딩 전략 */}
            <TradingStrategy
              patterns={patterns}
              currentPrice={currentPrice}
              priceChange24h={priceChange24h}
              volume24h={volume24h}
            />
            
            {/* 성능 지표 */}
            <PerformanceMetrics
              patterns={patterns}
              trades={trades}
            />
          </div>
        )}
      </div>
      
    </div>
  )
}