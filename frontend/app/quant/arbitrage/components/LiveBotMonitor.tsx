'use client'

import { useState, useEffect, useRef } from 'react'
import type { BotConfig } from '../ArbitrageBotModule'

interface LiveBotMonitorProps {
  selectedCoin: {
    symbol: string
    name: string
    color: string
    bgColor: string
  }
  botStatus: 'running' | 'paused' | 'stopped' | 'initializing'
  botConfig: BotConfig
}

interface Opportunity {
  id: string
  timestamp: Date
  type: string
  buyExchange: string
  sellExchange: string
  buyPrice: number
  sellPrice: number
  spread: number
  profit: number
  volume: number
  status: 'pending' | 'executing' | 'completed' | 'failed'
}

export default function LiveBotMonitor({ selectedCoin, botStatus, botConfig }: LiveBotMonitorProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState({
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
    totalProfit: 0,
    avgProfit: 0,
    bestTrade: 0,
    worstTrade: 0,
    uptime: '00:00:00'
  })
  const [currentPrice, setCurrentPrice] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const uptimeRef = useRef<NodeJS.Timer | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  
  // 봇 상태에 따른 실시간 데이터 시뮬레이션
  useEffect(() => {
    if (botStatus === 'running') {
      startTimeRef.current = new Date()
      
      // Uptime 타이머
      uptimeRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current.getTime()
          const hours = Math.floor(elapsed / 3600000)
          const minutes = Math.floor((elapsed % 3600000) / 60000)
          const seconds = Math.floor((elapsed % 60000) / 1000)
          setStats(prev => ({
            ...prev,
            uptime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          }))
        }
      }, 1000)
      
      // 기회 생성 시뮬레이션 (실제로는 API에서 받아옴)
      const opportunityInterval = setInterval(() => {
        if (botStatus === 'running') {
          generateOpportunity()
        }
      }, 3000 + Math.random() * 7000) // 3-10초마다
      
      return () => {
        clearInterval(opportunityInterval)
        if (uptimeRef.current) clearInterval(uptimeRef.current)
      }
    } else {
      if (uptimeRef.current) {
        clearInterval(uptimeRef.current)
        uptimeRef.current = null
      }
    }
  }, [botStatus])
  
  // WebSocket 연결 (실제 가격 데이터)
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout
    let retryCount = 0
    const maxRetries = 5
    
    const connectWebSocket = () => {
      try {
        const symbol = selectedCoin.symbol.toLowerCase()
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}usdt@ticker`)
        
        ws.onopen = () => {
          console.log(`WebSocket connected for ${symbol}`)
          retryCount = 0
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.c) {
              setCurrentPrice(parseFloat(data.c))
            }
          } catch (err) {
            console.error('Error parsing WebSocket data:', err)
          }
        }
        
        ws.onerror = (error) => {
          console.warn(`WebSocket error for ${symbol}:`, error)
          // 폴백 가격 설정
          const fallbackPrices: Record<string, number> = {
            'BTC': 98000,
            'ETH': 3500,
            'BNB': 700,
            'SOL': 250,
            'XRP': 2.5,
            'ADA': 1.2,
            'DOGE': 0.45,
            'AVAX': 55,
            'DOT': 10,
            'MATIC': 1.5
          }
          setCurrentPrice(fallbackPrices[selectedCoin.symbol] || 100)
        }
        
        ws.onclose = () => {
          console.log(`WebSocket closed for ${symbol}`)
          // 재연결 시도
          if (retryCount < maxRetries) {
            retryCount++
            reconnectTimeout = setTimeout(() => {
              console.log(`Reconnecting WebSocket... (attempt ${retryCount})`)
              connectWebSocket()
            }, 3000 * retryCount)
          }
        }
        
        wsRef.current = ws
      } catch (err) {
        console.error('Failed to create WebSocket:', err)
        // 폴백 가격 설정
        setCurrentPrice(selectedCoin.symbol === 'BTC' ? 98000 : 3500)
      }
    }
    
    connectWebSocket()
    
    return () => {
      clearTimeout(reconnectTimeout)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [selectedCoin])
  
  const generateOpportunity = () => {
    const exchanges = ['Binance', 'Upbit', 'Coinbase', 'Kraken', 'Bybit']
    const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)]
    let sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)]
    while (sellExchange === buyExchange) {
      sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)]
    }
    
    const basePrice = currentPrice || (selectedCoin.symbol === 'BTC' ? 98000 : 3500)
    const spread = (botConfig.minProfit + Math.random() * 2) / 100
    const buyPrice = basePrice * (1 - spread / 2)
    const sellPrice = basePrice * (1 + spread / 2)
    const volume = Math.random() * botConfig.maxPosition
    const profit = (sellPrice - buyPrice) * (volume / buyPrice)
    
    const opportunity: Opportunity = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type: botConfig.strategy,
      buyExchange,
      sellExchange,
      buyPrice,
      sellPrice,
      spread: spread * 100,
      profit,
      volume,
      status: botConfig.autoExecute ? 'executing' : 'pending'
    }
    
    setOpportunities(prev => [opportunity, ...prev.slice(0, 9)])
    
    // 자동 실행 모드일 때
    if (botConfig.autoExecute) {
      setTimeout(() => {
        setOpportunities(prev => 
          prev.map(opp => 
            opp.id === opportunity.id 
              ? { ...opp, status: Math.random() > 0.1 ? 'completed' : 'failed' }
              : opp
          )
        )
        
        // 통계 업데이트
        if (Math.random() > 0.1) {
          setStats(prev => ({
            ...prev,
            totalTrades: prev.totalTrades + 1,
            successfulTrades: prev.successfulTrades + 1,
            totalProfit: prev.totalProfit + profit,
            avgProfit: (prev.totalProfit + profit) / (prev.totalTrades + 1),
            bestTrade: Math.max(prev.bestTrade, profit),
            worstTrade: prev.worstTrade === 0 ? profit : Math.min(prev.worstTrade, profit)
          }))
        } else {
          setStats(prev => ({
            ...prev,
            totalTrades: prev.totalTrades + 1,
            failedTrades: prev.failedTrades + 1
          }))
        }
      }, 2000)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* 실시간 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">총 거래</div>
          <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
          <div className="text-xs text-gray-500 mt-1">
            성공: {stats.successfulTrades} | 실패: {stats.failedTrades}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">총 수익</div>
          <div className="text-2xl font-bold text-green-400">
            ${stats.totalProfit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            평균: ${stats.avgProfit.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">성공률</div>
          <div className="text-2xl font-bold text-yellow-400">
            {stats.totalTrades > 0 
              ? ((stats.successfulTrades / stats.totalTrades) * 100).toFixed(1)
              : '0'
            }%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.successfulTrades}/{stats.totalTrades}
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">가동 시간</div>
          <div className="text-2xl font-bold text-blue-400">
            {stats.uptime}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            상태: {botStatus === 'running' ? '실행 중' : botStatus === 'paused' ? '일시정지' : '정지'}
          </div>
        </div>
      </div>
      
      {/* 실시간 기회 목록 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-300">실시간 차익거래 기회</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-gray-400">실시간 스캔 중</span>
          </div>
        </div>
        
        {opportunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {botStatus === 'running' 
              ? '차익거래 기회를 스캔하고 있습니다...'
              : '봇을 시작하면 기회 스캔이 시작됩니다'
            }
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map(opp => (
              <div
                key={opp.id}
                className={`p-4 rounded-lg border transition-all ${
                  opp.status === 'executing' 
                    ? 'bg-yellow-900/20 border-yellow-500/30 animate-pulse'
                    : opp.status === 'completed'
                    ? 'bg-green-900/20 border-green-500/30'
                    : opp.status === 'failed'
                    ? 'bg-red-900/20 border-red-500/30'
                    : 'bg-gray-900/50 border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        {opp.buyExchange} → {opp.sellExchange}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        opp.status === 'executing' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : opp.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : opp.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {opp.status === 'executing' ? '실행 중' :
                         opp.status === 'completed' ? '완료' :
                         opp.status === 'failed' ? '실패' :
                         '대기 중'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">매수가</span>
                        <div className="font-mono text-white">
                          ${opp.buyPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">매도가</span>
                        <div className="font-mono text-white">
                          ${opp.sellPrice.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">스프레드</span>
                        <div className="font-mono text-green-400">
                          {opp.spread.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">예상 수익</span>
                        <div className="font-mono text-green-400">
                          ${opp.profit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {opp.timestamp.toLocaleTimeString()}
                    </div>
                    {opp.status === 'pending' && botConfig.autoExecute === false && (
                      <button className="mt-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs transition-colors">
                        수동 실행
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 베스트/워스트 거래 */}
      {stats.totalTrades > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
            <div className="text-sm text-green-400 mb-1">베스트 거래</div>
            <div className="text-2xl font-bold text-white">
              +${stats.bestTrade.toFixed(2)}
            </div>
          </div>
          
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <div className="text-sm text-red-400 mb-1">워스트 거래</div>
            <div className="text-2xl font-bold text-white">
              ${stats.worstTrade.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}