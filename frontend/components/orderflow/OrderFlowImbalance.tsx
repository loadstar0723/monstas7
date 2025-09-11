'use client'

import { useEffect, useState, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { getBinanceWebSocket } from '@/lib/binanceWebSocket'

interface OrderFlowImbalanceProps {
  symbol: string
}

interface OrderbookData {
  bids: Array<{ price: number; amount: number; total: number }>
  asks: Array<{ price: number; amount: number; total: number }>
  bidTotal: number
  askTotal: number
  imbalance: number
  pressure: 'buy' | 'sell' | 'neutral'
}

export default function OrderFlowImbalance({ symbol }: OrderFlowImbalanceProps) {
  const [orderbookData, setOrderbookData] = useState<OrderbookData>({
    bids: [],
    asks: [],
    bidTotal: 0,
    askTotal: 0,
    imbalance: 0,
    pressure: 'neutral',
  })
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    const fetchOrderbook = async () => {
      try {
        const response = await fetch(`/api/binance/orderbook?symbol=${symbol}&limit=20`)
        if (!response.ok) throw new Error('Failed to fetch orderbook')
        const data = await response.json()
        
        // 총 매수/매도 물량 계산
        const bidTotal = data.bids.reduce((sum: number, bid: any) => sum + bid.total, 0)
        const askTotal = data.asks.reduce((sum: number, ask: any) => sum + ask.total, 0)
        
        // 임밸런스 계산 (-100 ~ 100)
        const imbalance = ((bidTotal - askTotal) / (bidTotal + askTotal)) * 100
        
        // 압력 판단
        let pressure: 'buy' | 'sell' | 'neutral' = 'neutral'
        if (imbalance > 20) pressure = 'buy'
        else if (imbalance < -20) pressure = 'sell'
        
        setOrderbookData({
          bids: data.bids.slice(0, 5), // 상위 5개만 표시
          asks: data.asks.slice(0, 5),
          bidTotal,
          askTotal,
          imbalance,
          pressure,
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Orderbook fetch error:', error)
        setIsLoading(false)
      }
    }
    
    fetchOrderbook()
    intervalRef.current = setInterval(fetchOrderbook, 1000) // 1초마다 업데이트
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [symbol])

  // 임밸런스 게이지 색상 계산
  const getGaugeColor = (imbalance: number) => {
    if (imbalance > 40) return 'from-green-600 to-green-400'
    if (imbalance > 20) return 'from-green-500 to-green-300'
    if (imbalance < -40) return 'from-red-600 to-red-400'
    if (imbalance < -20) return 'from-red-500 to-red-300'
    return 'from-gray-500 to-gray-400'
  }

  // 압력 지표 텍스트
  const getPressureText = (pressure: string) => {
    switch (pressure) {
      case 'buy': return '강한 매수 압력'
      case 'sell': return '강한 매도 압력'
      default: return '균형 상태'
    }
  }

  // 가격 포맷
  const formatPrice = (price: number) => {
    if (price > 10000) return safePrice(price, 0)
    if (price > 100) return safePrice(price, 2)
    return safePrice(price, 4)
  }

  // 물량 포맷
  const formatAmount = (amount: number) => {
    if (amount > 1000) return (amount / 1000).toFixed(2) + 'K'
    return safeAmount(amount)
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📊</span>
        오더플로우 임밸런스 (OFI)
      </h3>

      {/* 임밸런스 게이지 */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-gray-400">매도 압력</span>
          <span className={`text-lg font-bold ${orderbookData.pressure === 'buy' ? 'text-green-400' : orderbookData.pressure === 'sell' ? 'text-red-400' : 'text-gray-400'}`}>
            {getPressureText(orderbookData.pressure)}
          </span>
          <span className="text-sm text-gray-400">매수 압력</span>
        </div>
        
        {/* 게이지 바 */}
        <div className="relative h-12 bg-gray-800 rounded-lg overflow-hidden">
          {/* 중앙선 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600 z-10"></div>
          
          {/* 임밸런스 표시 */}
          <div 
            className="absolute top-0 bottom-0 transition-all duration-500"
            style={{
              left: orderbookData.imbalance > 0 ? '50%' : `${50 + orderbookData.imbalance / 2}%`,
              width: `${Math.abs(orderbookData.imbalance) / 2}%`,
            }}
          >
            <div className={`h-full bg-gradient-to-r ${getGaugeColor(orderbookData.imbalance)} opacity-80`}></div>
          </div>
          
          {/* 수치 표시 */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <span className="text-white font-bold text-lg">{safeFixed(orderbookData.imbalance, 1)}%</span>
          </div>
        </div>
        
        {/* 스케일 마커 */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>-100%</span>
          <span>-50%</span>
          <span>0</span>
          <span>+50%</span>
          <span>+100%</span>
        </div>
      </div>

      {/* 오더북 요약 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 매수 호가 */}
        <div>
          <h4 className="text-sm font-medium text-green-400 mb-2">매수 호가 (Bids)</h4>
          <div className="space-y-1">
            {orderbookData.bids.map((bid, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-400">{formatAmount(bid.amount)}</span>
                <span className="text-green-400">{formatPrice(bid.price)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">총 매수량</span>
              <span className="text-green-400 font-medium">${(orderbookData.bidTotal / 1000).toFixed(2)}K</span>
            </div>
          </div>
        </div>

        {/* 매도 호가 */}
        <div>
          <h4 className="text-sm font-medium text-red-400 mb-2">매도 호가 (Asks)</h4>
          <div className="space-y-1">
            {orderbookData.asks.map((ask, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-red-400">{formatPrice(ask.price)}</span>
                <span className="text-gray-400">{formatAmount(ask.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">총 매도량</span>
              <span className="text-red-400 font-medium">${(orderbookData.askTotal / 1000).toFixed(2)}K</span>
            </div>
          </div>
        </div>
      </div>

      {/* 시그널 해석 */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-purple-400 mb-2">📈 오더플로우 시그널 해석</h4>
        <div className="text-xs text-gray-300 space-y-1">
          {orderbookData.imbalance > 40 && (
            <>
              <p>• 매우 강한 매수 압력 감지 - 상승 가능성 높음</p>
              <p>• 대량 매수 주문이 시장에 대기 중</p>
              <p className="text-green-400 font-medium">💡 전략: 단기 롱 포지션 고려</p>
            </>
          )}
          {orderbookData.imbalance > 20 && orderbookData.imbalance <= 40 && (
            <>
              <p>• 중간 정도의 매수 우세 - 상승 모멘텀 형성</p>
              <p>• 매수세가 점진적으로 강해지는 중</p>
              <p className="text-green-400 font-medium">💡 전략: 추세 확인 후 진입</p>
            </>
          )}
          {orderbookData.imbalance >= -20 && orderbookData.imbalance <= 20 && (
            <>
              <p>• 매수/매도 균형 상태 - 방향성 불명확</p>
              <p>• 시장 참여자들이 관망하는 구간</p>
              <p className="text-gray-400 font-medium">💡 전략: 관망 또는 스캘핑</p>
            </>
          )}
          {orderbookData.imbalance < -20 && orderbookData.imbalance >= -40 && (
            <>
              <p>• 중간 정도의 매도 우세 - 하락 압력 존재</p>
              <p>• 매도 물량이 점진적으로 증가</p>
              <p className="text-red-400 font-medium">💡 전략: 숏 포지션 고려</p>
            </>
          )}
          {orderbookData.imbalance < -40 && (
            <>
              <p>• 매우 강한 매도 압력 감지 - 하락 가능성 높음</p>
              <p>• 대량 매도 주문이 시장에 쌓여있음</p>
              <p className="text-red-400 font-medium">💡 전략: 리스크 회피, 숏 포지션</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}