'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Activity, TrendingUp, BarChart3, History } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 정적 임포트 사용 (빌드 오류 해결용)
import CoinSelector from './components/CoinSelector'
import ConceptGuide from './components/ConceptGuide'
import SweepHeatmap from './components/SweepHeatmap'
import LiquiditySweptChart from './components/LiquiditySweptChart'
import SweepVolumeAnalysis from './components/SweepVolumeAnalysis'
import PriceImpactChart from './components/PriceImpactChart'
import SweepPatternDetector from './components/SweepPatternDetector'
import HistoricalSweepsV2 from './components/HistoricalSweepsV2'
import TradingStrategy from './components/TradingStrategy'
import RiskAlert from './components/RiskAlert'
import RealtimeMonitor from './components/RealtimeMonitor'

// 지원하는 코인 목록
const SUPPORTED_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', icon: '🅱' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: '🐕' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '🟣' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '⚪' }
]

// 스윕 타입 정의
interface Sweep {
  id: string
  timestamp: number
  symbol: string
  price: number
  volume: number
  side: 'buy' | 'sell'
  impact: number
  type: 'aggressive' | 'stealth' | 'ladder' | 'iceberg'
}

// WebSocket 확장 인터페이스
interface ExtendedWebSocket extends WebSocket {
  pingInterval?: NodeJS.Timer
}

const SweepDetectionModule: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT')
  const [sweeps, setSweeps] = useState<Sweep[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const [currentPrice, setCurrentPrice] = useState(0)
  const [orderBookData, setOrderBookData] = useState<any>({
    bids: [],
    asks: [],
    lastUpdateId: Date.now()
  })
  
  const wsRef = useRef<ExtendedWebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 초기 가격 설정 (대략적인 시장가)
  const initialPrices: Record<string, number> = {
    'BTCUSDT': 98000,
    'ETHUSDT': 3500,
    'BNBUSDT': 700,
    'SOLUSDT': 100,
    'XRPUSDT': 0.6,
    'ADAUSDT': 0.5,
    'DOGEUSDT': 0.08,
    'AVAXUSDT': 40,
    'MATICUSDT': 0.8,
    'DOTUSDT': 7
  }

  // 스윕 타입 감지 함수
  const detectSweepType = (volume: number, threshold: number): Sweep['type'] => {
    const ratio = volume / threshold
    
    if (ratio >= 10) return 'aggressive'
    if (ratio >= 5) return 'ladder'
    if (ratio >= 3) return 'iceberg'
    return 'stealth'
  }

  // REST API를 통한 거래 데이터 가져오기 (폴백용)
  const fetchRecentTrades = useCallback(async (symbol: string) => {
    try {
      console.log(`🔍 거래 데이터 가져오기 시도: ${symbol}`)
      // API 프록시 사용 - CORS 회피
      const response = await fetch(`/api/binance/trades?symbol=${symbol}&limit=50`)
      console.log(`📊 응답 상태: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const trades = await response.json()
        
        // 코인별 임계값 (테스트를 위해 낮춤)
        const thresholds: Record<string, number> = {
          'BTCUSDT': 0.1,      // 0.1 BTC
          'ETHUSDT': 1,        // 1 ETH
          'BNBUSDT': 5,        // 5 BNB
          'SOLUSDT': 10,       // 10 SOL
          'XRPUSDT': 5000,     // 5,000 XRP
          'ADAUSDT': 10000,    // 10,000 ADA
          'DOGEUSDT': 50000,   // 50,000 DOGE
          'AVAXUSDT': 10,      // 10 AVAX
          'MATICUSDT': 5000,   // 5,000 MATIC
          'DOTUSDT': 20        // 20 DOT
        }
        
        const threshold = thresholds[symbol] || 1
        
        // 대량 거래만 필터링하여 sweep으로 변환
        // Binance aggTrades API 응답 형식: {a: aggTradeId, p: price, q: quantity, f: firstTradeId, l: lastTradeId, T: timestamp, m: isBuyerMaker, M: wasBestPrice}
        const newSweeps: Sweep[] = trades
          .filter((trade: any) => parseFloat(trade.q) >= threshold)
          .map((trade: any) => ({
            id: `${trade.a}-${trade.T}`,
            timestamp: trade.T,
            symbol: symbol,
            price: parseFloat(trade.p),
            volume: parseFloat(trade.q),
            side: trade.m ? 'sell' : 'buy',
            impact: (parseFloat(trade.q) * parseFloat(trade.p)) / 1000000,
            type: detectSweepType(parseFloat(trade.q), threshold)
          }))
        
        if (newSweeps.length > 0) {
          setSweeps(prev => [...newSweeps, ...prev].slice(0, 100))
          console.log(`📈 ${symbol} REST API로 ${newSweeps.length}개 스윕 로드`)
        }
      } else {
        console.error(`❌ API 응답 실패: ${response.status}`)
        const errorText = await response.text()
        console.error('에러 내용:', errorText)
      }
    } catch (error) {
      console.error('❌ 거래 데이터 가져오기 실패:', error)
      console.error('에러 타입:', error instanceof Error ? error.name : typeof error)
      console.error('에러 메시지:', error instanceof Error ? error.message : error)
    }
  }, [])

  // 주기적인 오더북 업데이트
  const updateOrderBook = useCallback(async (symbol: string) => {
    try {
      // API 프록시 사용 - CORS 회피
      const response = await fetch(`/api/binance/depth?symbol=${symbol}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setOrderBookData(data)
      }
    } catch (error) {
      console.error('오더북 업데이트 실패:', error)
    }
  }, [])

  // WebSocket 연결 함수
  const connectWebSocket = useCallback((symbol: string) => {
    try {
      // 기존 연결 정리
      if (wsRef.current) {
        wsRef.current.close(1000, 'Switching symbols')
      }

      // 재연결 타이머 정리
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      // 초기 가격 설정
      setCurrentPrice(initialPrices[symbol] || 0)

      console.log('WebSocket 연결 시도:', symbol)
      
      // WebSocket URL 구성 - aggTrade 스트림 사용
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`
      console.log('WebSocket URL:', wsUrl)
      
      const ws = new WebSocket(wsUrl) as ExtendedWebSocket
      
      // 연결 타임아웃 설정 (10초)
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.log('WebSocket 연결 타임아웃')
          ws.close()
          setConnectionError('연결 시간 초과 - 네트워크를 확인해주세요')
        }
      }, 10000)
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log('✅ WebSocket 연결 성공:', symbol)
        setIsConnected(true)
        setConnectionError('')
        
        // 연결 성공 시 ping 메시지 전송 (Binance 요구사항)
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: "ping" }))
          }
        }, 30000)
        
        // cleanup 함수에서 pingInterval 정리하도록 저장
        ws.pingInterval = pingInterval
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // pong 응답 무시
          if (data.result === null) return
          
          // 현재가 업데이트
          const price = parseFloat(data.p)
          setCurrentPrice(price)
          
          // 스윕 감지 로직 (대량 거래 감지)
          const volume = parseFloat(data.q)
          
          // 코인별 임계값 설정 (테스트를 위해 낮춤)
          const thresholds: Record<string, number> = {
            'BTCUSDT': 0.1,      // 0.1 BTC
            'ETHUSDT': 1,        // 1 ETH
            'BNBUSDT': 5,        // 5 BNB
            'SOLUSDT': 10,       // 10 SOL
            'XRPUSDT': 5000,     // 5,000 XRP
            'ADAUSDT': 10000,    // 10,000 ADA
            'DOGEUSDT': 50000,   // 50,000 DOGE
            'AVAXUSDT': 10,      // 10 AVAX
            'MATICUSDT': 5000,   // 5,000 MATIC
            'DOTUSDT': 20        // 20 DOT
          }
          
          const threshold = thresholds[symbol] || 1
          
          if (volume >= threshold) {
            const newSweep: Sweep = {
              id: `${data.a}-${data.T}`,
              timestamp: data.T || Date.now(),
              symbol: symbol,
              price: price,
              volume: volume,
              side: data.m ? 'sell' : 'buy',
              impact: (volume * price) / 1000000, // 백만 달러 단위
              type: detectSweepType(volume, threshold)
            }
            
            setSweeps(prev => [newSweep, ...prev.slice(0, 99)])
          }
        } catch (error) {
          console.error('데이터 처리 오류:', error)
        }
      }

      ws.onerror = (event) => {
        clearTimeout(connectionTimeout)
        console.warn('⚠️ WebSocket 연결 문제 발생 - REST API로 전환')
        
        // 에러 발생 시 대체 메시지 설정
        if (!isConnected) {
          setConnectionError('실시간 연결 중... REST API 사용 중')
          
          // REST API로 즉시 폴백
          fetchRecentTrades(symbol)
          updateOrderBook(symbol)
        }
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        
        // ping interval 정리
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval)
        }
        
        console.log('WebSocket 연결 종료')
        setIsConnected(false)
        
        // 정상 종료가 아닌 경우 REST API 사용
        if (event.code !== 1000 && event.code !== 1001) {
          setConnectionError('REST API 모드로 작동 중')
          
          // REST API 폴백으로만 동작
          fetchRecentTrades(symbol)
          updateOrderBook(symbol)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.warn('WebSocket 사용 불가 - REST API 모드 활성화')
      setConnectionError('REST API 모드로 작동 중')
      
      // REST API만 사용
      fetchRecentTrades(symbol)
      updateOrderBook(symbol)
    }
  }, [initialPrices, isConnected, fetchRecentTrades, updateOrderBook])

  // 초기 가격 및 오더북 데이터 가져오기
  const fetchInitialData = async (symbol: string) => {
    try {
      console.log(`🚀 초기 데이터 가져오기 시작: ${symbol}`)
      
      // 1. 현재 가격 가져오기
      const priceUrl = `/api/binance/ticker?symbol=${symbol}`
      console.log(`📍 가격 API 호출: ${priceUrl}`)
      
      const priceResponse = await fetch(priceUrl)
      console.log(`💰 가격 API 응답: ${priceResponse.status}`)
      
      if (priceResponse.ok) {
        const data = await priceResponse.json()
        // Binance ticker/price API는 price 필드를 사용
        const price = data.price
        if (price) {
          setCurrentPrice(parseFloat(price))
          console.log(`✅ ${symbol} 초기 가격 로드: $${price}`)
        }
      }
      
      // 2. 오더북 데이터 가져오기 (선택적)
      const depthResponse = await fetch(`/api/binance/depth?symbol=${symbol}&limit=20`)
      if (depthResponse.ok) {
        const depthData = await depthResponse.json()
        setOrderBookData(depthData)
        console.log(`📊 ${symbol} 오더북 로드 완료`)
      } else {
        console.error(`❌ 오더북 API 실패: ${depthResponse.status}`)
      }
    } catch (error) {
      console.error('❌ 초기 데이터 가져오기 실패:', error)
      console.error('에러 상세:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      // 실패 시 기본값 사용
      setCurrentPrice(initialPrices[symbol] || 0)
    }
  }

  // 코인 변경 시 WebSocket 재연결 및 초기 데이터 가져오기
  useEffect(() => {
    // 초기 데이터 먼저 가져오기
    fetchInitialData(selectedCoin)
    fetchRecentTrades(selectedCoin)
    
    // WebSocket 연결 약간 지연
    const connectionDelay = setTimeout(() => {
      connectWebSocket(selectedCoin)
    }, 1000)
    
    // WebSocket 연결 실패 시 REST API 폴백 사용
    const fallbackInterval = setInterval(() => {
      if (!isConnected) {
        fetchRecentTrades(selectedCoin)
        updateOrderBook(selectedCoin)
      }
    }, 5000) // 5초마다 업데이트
    
    return () => {
      clearTimeout(connectionDelay)
      clearInterval(fallbackInterval)
      
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [selectedCoin, connectWebSocket, isConnected, fetchRecentTrades, updateOrderBook])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Sweep Detection</h1>
          <p className="text-gray-400">실시간 대량 주문 감지 & 시장 영향 분석</p>
          
          {/* 연결 상태 표시 */}
          <div className="mt-4">
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-500">WebSocket 연결됨</span>
              </div>
            ) : connectionError ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-500">REST API 모드 (정상 작동 중)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm text-yellow-500">연결 시도 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* 코인 선택 */}
        <div className="mb-8">
          <CoinSelector 
            selectedCoin={selectedCoin}
            onCoinChange={setSelectedCoin}
            coins={SUPPORTED_COINS}
          />
        </div>

        {/* 탭 네비게이션 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900/50">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="realtime">실시간</TabsTrigger>
            <TabsTrigger value="patterns">패턴</TabsTrigger>
            <TabsTrigger value="history">히스토리</TabsTrigger>
            <TabsTrigger value="strategy">전략</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <ConceptGuide />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SweepHeatmap orderBook={orderBookData} currentPrice={currentPrice} symbol={selectedCoin} />
              <LiquiditySweptChart sweeps={sweeps} symbol={selectedCoin} />
            </div>
            
            <RiskAlert sweeps={sweeps} currentPrice={currentPrice} symbol={selectedCoin} />
          </TabsContent>

          {/* 실시간 탭 */}
          <TabsContent value="realtime" className="space-y-6">
            <RealtimeMonitor sweeps={sweeps} currentPrice={currentPrice} symbol={selectedCoin} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SweepVolumeAnalysis sweeps={sweeps} symbol={selectedCoin} />
              <PriceImpactChart sweeps={sweeps} currentPrice={currentPrice} symbol={selectedCoin} />
            </div>
          </TabsContent>

          {/* 패턴 탭 */}
          <TabsContent value="patterns" className="space-y-6">
            <SweepPatternDetector sweeps={sweeps} symbol={selectedCoin} />
          </TabsContent>

          {/* 히스토리 탭 */}
          <TabsContent value="history" className="space-y-6">
            <HistoricalSweepsV2 sweeps={sweeps} currentPrice={currentPrice} symbol={selectedCoin} />
          </TabsContent>

          {/* 전략 탭 */}
          <TabsContent value="strategy" className="space-y-6">
            <TradingStrategy sweeps={sweeps} currentPrice={currentPrice} symbol={selectedCoin} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default SweepDetectionModule