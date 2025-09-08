'use client'

import { useState, useEffect } from 'react'
import { FaCalendarAlt, FaLock, FaUnlock, FaChartLine, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

interface TokenUnlockEvent {
  date: string
  tokenSymbol: string
  tokenName: string
  unlockAmount: number
  unlockValueUSD: number
  percentOfSupply: number
  type: string
  round: string
  recipients: string[]
  vestingContract?: string
  chainId: number
  verified: boolean
}

interface UnlockStats {
  totalEvents: number
  totalValueLocked: number
  upcomingUnlocks: number
  nextUnlock: TokenUnlockEvent | null
  largestUnlock: TokenUnlockEvent | null
}

export default function TokenUnlockSchedule() {
  const [unlockEvents, setUnlockEvents] = useState<TokenUnlockEvent[]>([])
  const [stats, setStats] = useState<UnlockStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedToken, setSelectedToken] = useState('ALL')
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past' | 'all'>('all') // 기본값을 all로 변경

  useEffect(() => {
    fetchUnlockData()
    const interval = setInterval(fetchUnlockData, 60000) // 1분마다 업데이트
    return () => clearInterval(interval)
  }, [selectedToken, timeframe])

  const fetchUnlockData = async () => {
    try {
      const response = await fetch(
        `/api/token-unlocks-v2?symbol=${selectedToken}&timeframe=${timeframe}`
      )
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUnlockEvents(result.data.events)
          setStats(result.data.stats)
        }
      }
    } catch (error) {
      console.error('Failed to fetch unlock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatValue = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`
    return amount.toFixed(0)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const dateFormat = date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    if (diffDays > 0) {
      return `${dateFormat} (D-${diffDays})`
    } else if (diffDays === 0) {
      return `${dateFormat} (오늘)`
    } else {
      return `${dateFormat} (${Math.abs(diffDays)}일 전)`
    }
  }

  const getImpactColor = (percentOfSupply: number) => {
    if (percentOfSupply >= 10) return 'text-red-500'
    if (percentOfSupply >= 5) return 'text-orange-500'
    if (percentOfSupply >= 1) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getImpactLevel = (percentOfSupply: number) => {
    if (percentOfSupply >= 10) return { text: '매우 높음', color: 'bg-red-500' }
    if (percentOfSupply >= 5) return { text: '높음', color: 'bg-orange-500' }
    if (percentOfSupply >= 1) return { text: '중간', color: 'bg-yellow-500' }
    return { text: '낮음', color: 'bg-green-500' }
  }

  const uniqueTokens = Array.from(new Set(unlockEvents.map(e => e.tokenSymbol)))

  return (
    <div className="space-y-4">
      {/* 헤더 및 필터 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaCalendarAlt className="text-purple-400" />
            토큰 언락 일정 (실제 온체인 데이터)
          </h3>
          <div className="flex gap-2">
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="bg-gray-800 text-white px-3 py-1 rounded text-sm border border-gray-700"
            >
              <option value="ALL">모든 토큰</option>
              {uniqueTokens.map(token => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-gray-800 text-white px-3 py-1 rounded text-sm border border-gray-700"
            >
              <option value="upcoming">예정된 언락</option>
              <option value="past">완료된 언락</option>
              <option value="all">전체</option>
            </select>
          </div>
        </div>

        {/* 통계 정보 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">총 언락 이벤트</div>
              <div className="text-lg font-bold text-white">{stats.totalEvents}</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">총 언락 가치</div>
              <div className="text-lg font-bold text-purple-400">
                {formatValue(stats.totalValueLocked)}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-400">예정된 언락</div>
              <div className="text-lg font-bold text-yellow-400">{stats.upcomingUnlocks}</div>
            </div>
            {stats.nextUnlock && (
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">다음 언락</div>
                <div className="text-sm font-bold text-red-400">
                  {stats.nextUnlock.tokenSymbol} - {formatDate(stats.nextUnlock.date).split(' ')[1]}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 경고 메시지 */}
        {stats?.nextUnlock && new Date(stats.nextUnlock.date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-red-400 mt-1" />
              <div>
                <div className="text-sm font-bold text-red-400">⚠️ 주의: 대규모 언락 임박</div>
                <div className="text-xs text-gray-300 mt-1">
                  {stats.nextUnlock.tokenName} ({stats.nextUnlock.tokenSymbol}) - {' '}
                  {formatAmount(stats.nextUnlock.unlockAmount)} 토큰 ({stats.nextUnlock.percentOfSupply.toFixed(2)}% 공급량)이 {' '}
                  {formatDate(stats.nextUnlock.date).split(' (')[1].replace(')', '')} 언락 예정
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 언락 이벤트 목록 */}
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-2"></div>
              <div>실제 온체인 데이터 로딩 중...</div>
            </div>
          ) : unlockEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              해당 기간에 예정된 언락 이벤트가 없습니다
            </div>
          ) : (
            unlockEvents.map((event, idx) => {
              const impact = getImpactLevel(event.percentOfSupply)
              const isUpcoming = new Date(event.date) > new Date()
              
              return (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isUpcoming ? 'bg-yellow-900/30' : 'bg-gray-900/30'}`}>
                        {isUpcoming ? (
                          <FaLock className={`text-yellow-400`} />
                        ) : (
                          <FaUnlock className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold">{event.tokenName}</span>
                          <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded">
                            {event.tokenSymbol}
                          </span>
                          {event.verified && (
                            <FaCheckCircle className="text-green-400 text-xs" title="검증됨" />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatDate(event.date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${getImpactColor(event.percentOfSupply)}`}>
                        {event.percentOfSupply.toFixed(2)}% 공급량
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${impact.color} bg-opacity-20 text-white mt-1`}>
                        영향도: {impact.text}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">언락 수량</div>
                      <div className="text-sm font-bold text-white">
                        {formatAmount(event.unlockAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">언락 가치</div>
                      <div className="text-sm font-bold text-purple-400">
                        {formatValue(event.unlockValueUSD)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">타입</div>
                      <div className="text-sm font-bold text-blue-400">
                        {event.type}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">라운드</div>
                      <div className="text-sm font-bold text-green-400">
                        {event.round}
                      </div>
                    </div>
                  </div>

                  {event.vestingContract && (
                    <div className="text-xs text-gray-500 truncate">
                      컨트랙트: {event.vestingContract}
                    </div>
                  )}

                  {/* 시장 영향 예측 */}
                  {isUpcoming && event.percentOfSupply >= 5 && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="flex items-center gap-2 text-xs">
                        <FaChartLine className="text-orange-400" />
                        <span className="text-orange-400 font-bold">시장 영향 예측:</span>
                        <span className="text-gray-300">
                          대규모 물량 출회로 단기 매도압력 증가 예상
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 데이터 소스 정보 */}
      <div className="text-xs text-gray-500 text-center">
        데이터 출처: Token Unlocks, Messari, DeFi Llama, 온체인 베스팅 컨트랙트
      </div>
    </div>
  )
}