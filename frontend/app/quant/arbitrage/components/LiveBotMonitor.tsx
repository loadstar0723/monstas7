'use client'

import { useState, useEffect, useRef } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
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
            uptime: hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
          }))
        }
      }, 1000)
      
      // 기회 생성 제거 - 실제 API로 부터 데이터 수신
      // fetchArbitrageOpportunities를 통해 실제 데이터 사용
      
      return () => {
        // opportunityInterval 제거됨
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
        const ws = new WebSocket('wss://stream.binance.com:9443/ws/' + symbol + 'usdt@ticker')
        
        ws.onopen = () => {
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
          // 재연결 시도
          if (retryCount < maxRetries) {
            retryCount++
            reconnectTimeout = setTimeout(() => {
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
  
  // 실제 API에서 차익거래 기회 가져오기
  const fetchArbitrageOpportunities = async () => {
    try {
      const response = await fetch('/api/arbitrage/opportunities?symbol=' + selectedCoin.symbol + 'USDT')
      const data = await response.json()
      
      if (data.opportunities && data.opportunities.length > 0) {
        // 실제 차익거래 기회 처리
        data.opportunities.forEach((opp: any) => {
          const opportunity: Opportunity = {
            id: opp.id,
            timestamp: new Date(opp.timestamp),
            type: botConfig.strategy,
            buyExchange: opp.buyExchange,
            sellExchange: opp.sellExchange,
            buyPrice: opp.buyPrice,
            sellPrice: opp.sellPrice,
            spread: opp.spread,
            profit: opp.profit * botConfig.maxPosition * 0.01, // 포지션 크기에 따른 수익
            volume: botConfig.maxPosition,
            status: botConfig.autoExecute ? 'executing' : 'pending'
          }
          
          // 최소 수익률 필터
          if (opp.profit >= botConfig.minProfit) {
            setOpportunities(prev => {
              const exists = prev.some(p => 
                p.buyExchange === opportunity.buyExchange && 
                p.sellExchange === opportunity.sellExchange &&
                Math.abs(p.spread - opportunity.spread) < 0.01
              )
              if (!exists) {
                return [opportunity, ...prev.slice(0, 9)]
              }
              return prev
            })
            
            // 자동 실행 모드일 때
            if (botConfig.autoExecute) {
              setTimeout(() => {
                setOpportunities(prev => 
                  prev.map(prevOpp => 
                    prevOpp.id === opportunity.id 
                      ? { ...prevOpp, status: 'completed' }
                      : prevOpp
                  )
                )
                
                // 통계 업데이트
                setStats(prev => ({
                  ...prev,
                  totalTrades: prev.totalTrades + 1,
                  successfulTrades: prev.successfulTrades + 1,
                  totalProfit: prev.totalProfit + opportunity.profit,
                  avgProfit: (prev.totalProfit + opportunity.profit) / (prev.totalTrades + 1),
                  bestTrade: Math.max(prev.bestTrade, opportunity.profit),
                  worstTrade: prev.worstTrade === 0 ? opportunity.profit : Math.min(prev.worstTrade, opportunity.profit)
                }))
              }, 3000)
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch arbitrage opportunities:', error)
    }
  }
  
  // 정기적으로 차익거래 기회 체크
  useEffect(() => {
    if (botStatus === 'running') {
      fetchArbitrageOpportunities() // 즉시 실행
      const interval = setInterval(fetchArbitrageOpportunities, 5000) // 5초마다 체크
      return () => clearInterval(interval)
    }
  }, [botStatus, selectedCoin, botConfig])
  
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
            ${safeFixed(stats.totalProfit, 2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            평균: ${safeFixed(stats.avgProfit, 2)}
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
                          ${safeFixed(opp.buyPrice, 2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">매도가</span>
                        <div className="font-mono text-white">
                          ${safeFixed(opp.sellPrice, 2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">스프레드</span>
                        <div className="font-mono text-green-400">
                          {safeFixed(opp.spread, 2)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">예상 수익</span>
                        <div className="font-mono text-green-400">
                          ${safeFixed(opp.profit, 2)}
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
              +${safeFixed(stats.bestTrade, 2)}
            </div>
          </div>
          
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
            <div className="text-sm text-red-400 mb-1">워스트 거래</div>
            <div className="text-2xl font-bold text-white">
              ${safeFixed(stats.worstTrade, 2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}