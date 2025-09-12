'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { FaArrowUp, FaArrowDown, FaFireAlt } from 'react-icons/fa'

interface Trade {
  id: string
  time: string
  price: number
  quantity: number
  isBuyerMaker: boolean
  isLarge: boolean
}

interface TradeTapeProps {
  symbol: string
  currentPrice: number
}

// 대량 거래 임계값
const LARGE_TRADE_THRESHOLD: Record<string, number> = {
  'BTCUSDT': 1,
  'ETHUSDT': 10,
  'BNBUSDT': 50,
  'SOLUSDT': 500,
  'XRPUSDT': 10000,
  'ADAUSDT': 10000,
  'DOGEUSDT': 50000,
  'AVAXUSDT': 300,
  'MATICUSDT': 10000,
  'DOTUSDT': 500,
}

export default function TradeTape({ symbol, currentPrice }: TradeTapeProps) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState({
    buyVolume: 0,
    sellVolume: 0,
    totalVolume: 0,
    largeTradeCount: 0,
  })
  const wsRef = useRef<WebSocket | null>(null)
  const tradesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 초기 거래 데이터 로드
    fetchRecentTrades()
    
    // WebSocket 연결
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol])

  const fetchRecentTrades = async () => {
    try {
      const response = await fetch(`/api/binance/trades?symbol=${symbol}&limit=50`)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        const formattedTrades = data.map((trade: any, idx: number) => ({
          id: trade.id ? String(trade.id) : `${trade.time}-${idx}`,
          time: new Date(trade.time).toLocaleTimeString('ko-KR'),
          price: parseFloat(trade.price),
          quantity: parseFloat(trade.qty),
          isBuyerMaker: trade.isBuyerMaker,
          isLarge: parseFloat(trade.qty) >= (LARGE_TRADE_THRESHOLD[symbol] || 1)
        }))
        setTrades(formattedTrades.slice(0, 100))
        updateStats(formattedTrades)
      }
    } catch (error) {
      console.error('거래 데이터 로드 실패:', error)
    }
  }

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.onerror = null
      wsRef.current.onmessage = null
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000)
      }
      wsRef.current = null
    }

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`)
    let isActive = true
    
    ws.onmessage = (event) => {
      if (!isActive) return
      try {
        const data = JSON.parse(event.data)
        const timestamp = Date.now()
        const newTrade: Trade = {
          id: data.t ? String(data.t) : `${timestamp}-${Math.floor((Date.now() % 10000))}`,
          time: new Date(data.T).toLocaleTimeString('ko-KR'),
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          isBuyerMaker: data.m,
          isLarge: parseFloat(data.q) >= (LARGE_TRADE_THRESHOLD[symbol] || 1)
        }
        
        setTrades(prev => [newTrade, ...prev].slice(0, 100))
        updateStatsRealtime(newTrade)
        
        // 자동 스크롤
        if (tradesContainerRef.current) {
          tradesContainerRef.current.scrollTop = 0
        }
      } catch (error) {
        console.error('Trade 데이터 파싱 오류:', error)
      }
    }

    ws.onerror = () => {
      if (!isActive) return
      console.error('WebSocket 연결 오류')
    }

    ws.onclose = (event) => {
      if (!isActive) return
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
  }

  const updateStats = (tradeList: Trade[]) => {
    const buyVol = tradeList.filter(t => !t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
    const sellVol = tradeList.filter(t => t.isBuyerMaker).reduce((sum, t) => sum + t.quantity, 0)
    const largeCount = tradeList.filter(t => t.isLarge).length
    
    setStats({
      buyVolume: buyVol,
      sellVolume: sellVol,
      totalVolume: buyVol + sellVol,
      largeTradeCount: largeCount
    })
  }

  const updateStatsRealtime = (trade: Trade) => {
    setStats(prev => ({
      buyVolume: prev.buyVolume + (!trade.isBuyerMaker ? trade.quantity : 0),
      sellVolume: prev.sellVolume + (trade.isBuyerMaker ? trade.quantity : 0),
      totalVolume: prev.totalVolume + trade.quantity,
      largeTradeCount: prev.largeTradeCount + (trade.isLarge ? 1 : 0)
    }))
  }

  const buyRatio = stats.totalVolume > 0 ? (stats.buyVolume / stats.totalVolume * 100) : 50

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">📊 실시간 거래 테이프</h3>
        
        {/* 통계 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-green-900/30 rounded-lg p-2">
            <p className="text-green-400 text-xs mb-1">매수 거래량</p>
            <p className="text-white font-bold">{safeFixed(stats.buyVolume, 4)}</p>
          </div>
          <div className="bg-red-900/30 rounded-lg p-2">
            <p className="text-red-400 text-xs mb-1">매도 거래량</p>
            <p className="text-white font-bold">{safeFixed(stats.sellVolume, 4)}</p>
          </div>
        </div>
        
        {/* 매수/매도 비율 바 */}
        <div className="bg-gray-900 rounded-lg overflow-hidden h-6 relative">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-300"
            style={{ width: `${buyRatio}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              매수 {safeFixed(buyRatio, 1)}% / 매도 {(100 - buyRatio).toFixed(1)}%
            </span>
          </div>
        </div>
        
        {/* 대량 거래 카운트 */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-gray-400 text-sm">대량 거래</span>
          <div className="flex items-center gap-2">
            <FaFireAlt className="text-orange-400" />
            <span className="text-orange-400 font-bold">{stats.largeTradeCount}건</span>
          </div>
        </div>
      </div>
      
      {/* 거래 목록 헤더 */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
        <div>시간</div>
        <div className="text-right">가격</div>
        <div className="text-right">수량</div>
        <div className="text-center">타입</div>
      </div>
      
      {/* 거래 목록 */}
      <div 
        ref={tradesContainerRef}
        className="overflow-y-auto" 
        style={{ height: '400px' }}
      >
        {trades.map((trade, index) => (
          <div 
            key={`${trade.id}-${index}`}
            className={`grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-800 hover:bg-gray-700/30 transition ${
              trade.isLarge ? 'animate-pulse bg-yellow-900/20' : ''
            }`}
          >
            <div className="text-gray-400 text-xs">{trade.time}</div>
            <div className={`text-right text-sm font-medium ${
              trade.price > currentPrice ? 'text-green-400' : 'text-red-400'
            }`}>
              ${safePrice(trade.price, 2)}
            </div>
            <div className={`text-right text-sm ${
              trade.isLarge ? 'font-bold text-yellow-400' : 'text-gray-300'
            }`}>
              {safeAmount(trade.quantity)}
            </div>
            <div className="flex justify-center">
              {!trade.isBuyerMaker ? (
                <FaArrowUp className="text-green-400" />
              ) : (
                <FaArrowDown className="text-red-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}