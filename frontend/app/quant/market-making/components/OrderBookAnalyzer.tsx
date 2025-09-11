'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { BINANCE_CONFIG } from '@/lib/binanceConfig'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

interface OrderBookLevel {
  price: string
  quantity: string
  total?: number
}

interface OrderBookData {
  lastUpdateId: number
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

export default function OrderBookAnalyzer({ selectedCoin }: Props) {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null)
  const [spread, setSpread] = useState<{ value: number; percentage: number } | null>(null)
  const [midPrice, setMidPrice] = useState<number>(0)
  const [imbalance, setImbalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [depth, setDepth] = useState(20)
  const wsRef = useRef<WebSocket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  useEffect(() => {
    // 초기 오더북 로드
    fetchInitialOrderBook()
    
    // WebSocket 연결
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin.fullSymbol])

  const fetchInitialOrderBook = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/binance/depth?symbol=${selectedCoin.fullSymbol}&limit=${depth}`)
      const data = await response.json()
      
      const processedData = processOrderBook(data)
      setOrderBook(processedData)
      calculateMetrics(processedData)
      setLoading(false)
    } catch (error) {
      console.error('오더북 로드 실패:', error)
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const wsUrl = `${BINANCE_CONFIG.WS_BASE}/${selectedCoin.fullSymbol.toLowerCase()}@depth20@100ms`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      setConnectionStatus('connected')
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const processedData = processOrderBook({
        lastUpdateId: data.u,
        bids: data.b,
        asks: data.a
      })
      setOrderBook(processedData)
      calculateMetrics(processedData)
    }

    wsRef.current.onerror = () => {
      setConnectionStatus('disconnected')
    }

    wsRef.current.onclose = () => {
      setConnectionStatus('disconnected')
      // 재연결 시도
      setTimeout(() => connectWebSocket(), 3000)
    }
  }

  const processOrderBook = (data: any): OrderBookData => {
    const processBids = (bids: any[]) => {
      if (!bids || !Array.isArray(bids)) return []
      let total = 0
      return bids.slice(0, depth).map((bid) => {
        total += parseFloat(bid[1])
        return {
          price: bid[0],
          quantity: bid[1],
          total
        }
      })
    }

    const processAsks = (asks: any[]) => {
      if (!asks || !Array.isArray(asks)) return []
      let total = 0
      return asks.slice(0, depth).map((ask) => {
        total += parseFloat(ask[1])
        return {
          price: ask[0],
          quantity: ask[1],
          total
        }
      })
    }

    return {
      lastUpdateId: data.lastUpdateId || 0,
      bids: processBids(data.bids),
      asks: processAsks(data.asks)
    }
  }

  const calculateMetrics = (book: OrderBookData) => {
    if (book.bids.length === 0 || book.asks.length === 0) return

    const bestBid = parseFloat(book.bids[0].price)
    const bestAsk = parseFloat(book.asks[0].price)
    
    // 스프레드 계산
    const spreadValue = bestAsk - bestBid
    const spreadPercentage = (spreadValue / bestAsk) * 100
    setSpread({ value: spreadValue, percentage: spreadPercentage })
    
    // 중간가 계산
    setMidPrice((bestBid + bestAsk) / 2)
    
    // 불균형도 계산
    const bidVolume = book.bids.reduce((sum, bid) => sum + parseFloat(bid.quantity), 0)
    const askVolume = book.asks.reduce((sum, ask) => sum + parseFloat(ask.quantity), 0)
    const totalVolume = bidVolume + askVolume
    const imbalanceValue = totalVolume > 0 ? ((bidVolume - askVolume) / totalVolume) * 100 : 0
    setImbalance(imbalanceValue)
  }

  const formatPrice = (price: string) => {
    const p = parseFloat(price)
    if (p >= 10000) return safeFixed(p, 0)
    if (p >= 100) return safeFixed(p, 2)
    if (p >= 1) return safeFixed(p, 3)
    return safeFixed(p, 6)
  }

  const formatQuantity = (quantity: string) => {
    const q = parseFloat(quantity)
    if (q >= 1000) return `${(q / 1000).toFixed(2)}K`
    if (q >= 1) return safeFixed(q, 3)
    return safeFixed(q, 6)
  }

  const getBarWidth = (total: number, maxTotal: number) => {
    return `${(total / maxTotal) * 100}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
            <FaChartBar className={`text-xl ${selectedCoin.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">오더북 분석</h2>
            <p className="text-gray-400">{selectedCoin.name} 실시간 호가창</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">오더북 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  const maxBidTotal = Math.max(...(orderBook?.bids.map(b => b.total || 0) || [1]))
  const maxAskTotal = Math.max(...(orderBook?.asks.map(a => a.total || 0) || [1]))
  const maxTotal = Math.max(maxBidTotal, maxAskTotal)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
            <FaChartBar className={`text-xl ${selectedCoin.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">오더북 분석</h2>
            <p className="text-gray-400">{selectedCoin.name} 실시간 호가창</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-400">
            {connectionStatus === 'connected' ? '실시간' : 
             connectionStatus === 'connecting' ? '연결 중' : '연결 끊김'}
          </span>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">스프레드</p>
          <p className="text-xl font-bold text-white">
            ${spread?.safeFixed(value, 2) || '0'}
          </p>
          <p className="text-sm text-gray-400">
            {spread?.safePercent(percentage) || '0'}%
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">중간가</p>
          <p className="text-xl font-bold text-white">
            ${formatPrice(midPrice.toString())}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">오더북 불균형</p>
          <div className="flex items-center gap-2">
            <p className={`text-xl font-bold ${
              imbalance > 10 ? 'text-green-400' : 
              imbalance < -10 ? 'text-red-400' : 'text-white'
            }`}>
              {safeFixed(imbalance, 1)}%
            </p>
            {imbalance > 10 && <FaArrowUp className="text-green-400" />}
            {imbalance < -10 && <FaArrowDown className="text-red-400" />}
          </div>
          <p className="text-xs text-gray-400">
            {imbalance > 10 ? '매수 우세' : imbalance < -10 ? '매도 우세' : '균형'}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">깊이</p>
          <select 
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
          >
            <option value="10">10단계</option>
            <option value="20">20단계</option>
            <option value="50">50단계</option>
          </select>
        </div>
      </div>

      {/* 오더북 테이블 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 매도 호가 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-red-400 mb-4">매도 호가 (Asks)</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-xs text-gray-400 mb-2">
              <span>가격</span>
              <span className="text-right">수량</span>
              <span className="text-right">누적</span>
            </div>
            {orderBook?.asks.slice().reverse().map((ask, index) => (
              <div key={index} className="grid grid-cols-3 text-sm relative">
                <div 
                  className="absolute inset-0 bg-red-500/10"
                  style={{ width: getBarWidth(ask.total || 0, maxTotal) }}
                />
                <span className="text-red-400 z-10">${formatPrice(ask.price)}</span>
                <span className="text-gray-300 text-right z-10">{formatQuantity(ask.quantity)}</span>
                <span className="text-gray-400 text-right z-10">{formatQuantity((ask.total || 0).toString())}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 매수 호가 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-4">매수 호가 (Bids)</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-xs text-gray-400 mb-2">
              <span>가격</span>
              <span className="text-right">수량</span>
              <span className="text-right">누적</span>
            </div>
            {orderBook?.bids.map((bid, index) => (
              <div key={index} className="grid grid-cols-3 text-sm relative">
                <div 
                  className="absolute inset-0 bg-green-500/10"
                  style={{ width: getBarWidth(bid.total || 0, maxTotal) }}
                />
                <span className="text-green-400 z-10">${formatPrice(bid.price)}</span>
                <span className="text-gray-300 text-right z-10">{formatQuantity(bid.quantity)}</span>
                <span className="text-gray-400 text-right z-10">{formatQuantity((bid.total || 0).toString())}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 마켓 메이킹 인사이트 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">마켓 메이킹 인사이트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-purple-400 font-semibold mb-2">현재 상황</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 스프레드가 {spread?.safePercent(percentage)}%로 {spread && spread.percentage < 0.1 ? '타이트' : '넓은'} 상태</li>
              <li>• {Math.abs(imbalance) < 10 ? '균형잡힌' : imbalance > 0 ? '매수 우세' : '매도 우세'} 오더북</li>
              <li>• 중간가 기준 변동성 {orderBook ? '측정 중' : '대기'}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-pink-400 font-semibold mb-2">전략 제안</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 권장 스프레드: {spread && spread.percentage < 0.05 ? '0.05-0.10%' : '0.10-0.15%'}</li>
              <li>• 포지션 방향: {imbalance > 10 ? '매도 우선' : imbalance < -10 ? '매수 우선' : '중립 유지'}</li>
              <li>• 주문 크기: 평균 호가 수량의 30-50%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}