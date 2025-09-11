'use client'

import { useMemo, useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

interface SpoofingDetectorProps {
  orderbook: any
  history: any[]
}

export default function SpoofingDetector({ orderbook, history }: SpoofingDetectorProps) {
  const [suspiciousOrders, setSuspiciousOrders] = useState<any[]>([])
  const [spoofingAlerts, setSpoofingAlerts] = useState<any[]>([])
  
  // 스푸핑 감지 로직
  useMemo(() => {
    if (!orderbook || history.length < 5) return
    
    // 최근 5개 스냅샷 분석
    const recentHistory = history.slice(-5)
    const currentBids = new Map(orderbook.bids.map((b: any) => [`${b.price}`, b]))
    const currentAsks = new Map(orderbook.asks.map((a: any) => [`${a.price}`, a]))
    
    // 의심스러운 패턴 감지
    const suspicious: any[] = []
    const alerts: any[] = []
    
    // 패턴 1: 빠르게 나타났다 사라지는 대량 주문
    recentHistory.forEach((snapshot, index) => {
      if (index === 0) return
      
      const prevSnapshot = recentHistory[index - 1]
      
      // 이전에 있었지만 현재 없는 대량 주문 찾기
      prevSnapshot.bids.forEach((prevBid: any) => {
        if (prevBid.total > 100000 && !currentBids.has(`${prevBid.price}`)) {
          suspicious.push({
            type: 'disappearing',
            side: 'buy',
            price: prevBid.price,
            amount: prevBid.amount,
            total: prevBid.total,
            timestamp: Date.now()
          })
        }
      })
      
      prevSnapshot.asks.forEach((prevAsk: any) => {
        if (prevAsk.total > 100000 && !currentAsks.has(`${prevAsk.price}`)) {
          suspicious.push({
            type: 'disappearing',
            side: 'sell',
            price: prevAsk.price,
            amount: prevAsk.amount,
            total: prevAsk.total,
            timestamp: Date.now()
          })
        }
      })
    })
    
    // 패턴 2: 현재가에서 멀리 떨어진 대량 주문
    const avgBidSize = orderbook.bids.reduce((sum: number, b: any) => sum + b.total, 0) / orderbook.bids.length
    const avgAskSize = orderbook.asks.reduce((sum: number, a: any) => sum + a.total, 0) / orderbook.asks.length
    
    orderbook.bids.forEach((bid: any) => {
      const priceDistance = Math.abs(bid.price - orderbook.bids[0].price) / orderbook.bids[0].price
      if (bid.total > avgBidSize * 5 && priceDistance > 0.005) {
        suspicious.push({
          type: 'distant_large',
          side: 'buy',
          price: bid.price,
          amount: bid.amount,
          total: bid.total,
          distance: priceDistance * 100,
          timestamp: Date.now()
        })
      }
    })
    
    orderbook.asks.forEach((ask: any) => {
      const priceDistance = Math.abs(ask.price - orderbook.asks[0].price) / orderbook.asks[0].price
      if (ask.total > avgAskSize * 5 && priceDistance > 0.005) {
        suspicious.push({
          type: 'distant_large',
          side: 'sell',
          price: ask.price,
          amount: ask.amount,
          total: ask.total,
          distance: priceDistance * 100,
          timestamp: Date.now()
        })
      }
    })
    
    // 패턴 3: 레이어링 (여러 가격대에 균등한 대량 주문)
    const checkLayering = (orders: any[], side: string) => {
      const largeOrders = orders.filter((o: any) => o.total > (side === 'buy' ? avgBidSize : avgAskSize) * 3)
      if (largeOrders.length >= 3) {
        const amounts = largeOrders.map((o: any) => o.amount)
        const avgAmount = amounts.reduce((sum: number, a: number) => sum + a, 0) / amounts.length
        const variance = amounts.reduce((sum: number, a: number) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length
        const stdDev = Math.sqrt(variance)
        
        if (stdDev / avgAmount < 0.1) {  // 10% 이내 편차
          alerts.push({
            type: 'layering',
            side,
            levels: largeOrders.length,
            avgAmount: avgAmount,
            totalValue: largeOrders.reduce((sum: number, o: any) => sum + o.total, 0),
            timestamp: Date.now()
          })
        }
      }
    }
    
    checkLayering(orderbook.bids.slice(0, 10), 'buy')
    checkLayering(orderbook.asks.slice(0, 10), 'sell')
    
    setSuspiciousOrders(suspicious.slice(-10))  // 최근 10개만
    setSpoofingAlerts(alerts.slice(-5))  // 최근 5개만
    
  }, [orderbook, history])
  
  // 리스크 레벨 계산
  const riskLevel = useMemo(() => {
    const totalSuspicious = suspiciousOrders.length + spoofingAlerts.length
    if (totalSuspicious === 0) return { level: 'safe', color: 'text-green-400', text: '안전' }
    if (totalSuspicious <= 2) return { level: 'low', color: 'text-blue-400', text: '낮음' }
    if (totalSuspicious <= 5) return { level: 'medium', color: 'text-yellow-400', text: '중간' }
    return { level: 'high', color: 'text-red-400', text: '높음' }
  }, [suspiciousOrders, spoofingAlerts])
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">스푸핑 탐지기</h3>
        <p className="text-gray-400 text-sm">시장 조작 패턴 실시간 감지</p>
      </div>
      
      {/* 탐지 상태 */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {riskLevel.level === 'safe' ? (
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            ) : (
              <ExclamationTriangleIcon className={`w-5 h-5 ${riskLevel.color}`} />
            )}
            <span className={`font-semibold ${riskLevel.color}`}>
              스푸핑 리스크: {riskLevel.text}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">의심 패턴</p>
            <p className="text-lg font-bold text-white">
              {suspiciousOrders.length + spoofingAlerts.length}
            </p>
          </div>
        </div>
      </div>
      
      {/* 레이어링 알림 */}
      {spoofingAlerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-orange-400 font-semibold mb-2">⚠️ 레이어링 감지</h4>
          <div className="space-y-2">
            {spoofingAlerts.map((alert: any, index: number) => (
              <div key={index} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-400 font-semibold">
                    {alert.side === 'buy' ? '매수' : '매도'} 레이어링
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">레벨 수: </span>
                    <span className="text-white">{alert.levels}개</span>
                  </div>
                  <div>
                    <span className="text-gray-400">평균 수량: </span>
                    <span className="text-white">{safeFixed(alert.avgAmount, 4)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">총 가치: </span>
                    <span className="text-yellow-400">
                      ${(alert.totalValue / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 의심 주문 목록 */}
      <div>
        <h4 className="text-yellow-400 font-semibold mb-2">의심 주문 패턴</h4>
        {suspiciousOrders.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {suspiciousOrders.map((order: any, index: number) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${
                      order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {order.side === 'buy' ? '매수' : '매도'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                      {order.type === 'disappearing' ? '사라짐' :
                       order.type === 'distant_large' ? '원거리' : '기타'}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {new Date(order.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">가격: </span>
                    <span className="text-white font-mono">${safePrice(order.price, 2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">수량: </span>
                    <span className="text-white">{safeAmount(order.amount)}</span>
                  </div>
                  {order.distance && (
                    <div>
                      <span className="text-gray-400">거리: </span>
                      <span className="text-yellow-400">{safeFixed(order.distance, 2)}%</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">가치: </span>
                    <span className="text-purple-400">${(order.total / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <p className="text-gray-500">의심스러운 패턴 없음</p>
          </div>
        )}
      </div>
      
      {/* 스푸핑 대응 가이드 */}
      <div className="mt-4 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">🛡️ 스푸핑 대응 전략</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 대량 주문이 빠르게 사라지면 허위 신호일 가능성</li>
          <li>• 레이어링 감지 시 해당 방향 진입 주의</li>
          <li>• 원거리 대량 주문은 심리적 압박용일 수 있음</li>
          <li>• 실제 체결되는 주문만 신뢰하고 거래</li>
        </ul>
      </div>
    </div>
  )
}