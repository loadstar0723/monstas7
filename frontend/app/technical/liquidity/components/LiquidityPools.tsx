'use client'

import { useState, useMemo } from 'react'

interface LiquidityPool {
  exchange: string
  symbol: string
  liquidity: number
  volume24h: number
  fee: number
  ratio: number
  apy?: number
}

interface LiquidityPoolsProps {
  pools: LiquidityPool[]
  symbol: string
  currentPrice: number
}

export default function LiquidityPools({ pools, symbol, currentPrice }: LiquidityPoolsProps) {
  const [sortBy, setSortBy] = useState<'liquidity' | 'volume' | 'apy' | 'fee'>('liquidity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedExchange, setSelectedExchange] = useState<string>('all')

  // 정렬된 풀 데이터
  const sortedPools = useMemo(() => {
    let filtered = pools
    
    if (selectedExchange !== 'all') {
      filtered = pools.filter(pool => pool.exchange === selectedExchange)
    }

    return [...filtered].sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortBy) {
        case 'liquidity':
          aValue = a.liquidity
          bValue = b.liquidity
          break
        case 'volume':
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case 'apy':
          aValue = a.apy || 0
          bValue = b.apy || 0
          break
        case 'fee':
          aValue = a.fee
          bValue = b.fee
          break
        default:
          return 0
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })
  }, [pools, sortBy, sortOrder, selectedExchange])

  // 통계 계산
  const stats = useMemo(() => {
    const totalLiquidity = pools.reduce((sum, pool) => sum + pool.liquidity, 0)
    const totalVolume = pools.reduce((sum, pool) => sum + pool.volume24h, 0)
    const averageFee = pools.reduce((sum, pool) => sum + pool.fee, 0) / pools.length
    const averageApy = pools.filter(p => p.apy).reduce((sum, pool) => sum + (pool.apy || 0), 0) / pools.filter(p => p.apy).length
    
    return {
      totalLiquidity,
      totalVolume,
      averageFee,
      averageApy: averageApy || 0,
      exchangeCount: new Set(pools.map(p => p.exchange)).size
    }
  }, [pools])

  // 값 포맷팅
  const formatValue = (value: number, type: 'currency' | 'percentage' = 'currency') => {
    if (type === 'percentage') {
      return `${value.toFixed(2)}%`
    }
    
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  // 정렬 함수
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // 거래소별 색상
  const getExchangeColor = (exchange: string) => {
    const colors: Record<string, string> = {
      'Binance': 'text-yellow-400',
      'Coinbase': 'text-blue-400',
      'Kraken': 'text-purple-400',
      'Uniswap V3': 'text-pink-400',
      'OKX': 'text-green-400',
      'KuCoin': 'text-indigo-400'
    }
    return colors[exchange] || 'text-gray-400'
  }

  // 거래소별 아이콘
  const getExchangeIcon = (exchange: string) => {
    const icons: Record<string, string> = {
      'Binance': '🟡',
      'Coinbase': '🔵', 
      'Kraken': '🟣',
      'Uniswap V3': '🦄',
      'OKX': '🟢',
      'KuCoin': '🔷'
    }
    return icons[exchange] || '🏢'
  }

  // 유동성 상태 평가
  const getLiquidityStatus = (liquidity: number, totalLiquidity: number) => {
    const ratio = liquidity / totalLiquidity
    if (ratio > 0.4) return { label: '높음', color: 'text-green-400' }
    if (ratio > 0.2) return { label: '보통', color: 'text-yellow-400' }
    return { label: '낮음', color: 'text-red-400' }
  }

  // 거래소 목록
  const exchanges = ['all', ...new Set(pools.map(pool => pool.exchange))]

  return (
    <div className="space-y-6">
      {/* 헤더 및 필터 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">유동성 풀 분석</h3>
          <p className="text-sm text-gray-400">
            {symbol} 거래소별 유동성 및 거래량 비교
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">거래소:</span>
            <select
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600"
            >
              <option value="all">전체</option>
              {exchanges.slice(1).map(exchange => (
                <option key={exchange} value={exchange}>{exchange}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">총 유동성</div>
          <div className="text-xl font-bold text-white">
            {formatValue(stats.totalLiquidity)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">24시간 거래량</div>
          <div className="text-xl font-bold text-blue-400">
            {formatValue(stats.totalVolume)}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">평균 수수료</div>
          <div className="text-xl font-bold text-yellow-400">
            {formatValue(stats.averageFee * 100, 'percentage')}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">평균 APY</div>
          <div className="text-xl font-bold text-green-400">
            {formatValue(stats.averageApy, 'percentage')}
          </div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">거래소 수</div>
          <div className="text-xl font-bold text-purple-400">
            {stats.exchangeCount}개
          </div>
        </div>
      </div>

      {/* 풀 테이블 */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="bg-gray-700/50 px-6 py-3">
          <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-300">
            <div>거래소</div>
            <div 
              className="cursor-pointer hover:text-white flex items-center gap-1"
              onClick={() => handleSort('liquidity')}
            >
              유동성
              {sortBy === 'liquidity' && (
                <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
              )}
            </div>
            <div 
              className="cursor-pointer hover:text-white flex items-center gap-1"
              onClick={() => handleSort('volume')}
            >
              24h 거래량
              {sortBy === 'volume' && (
                <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
              )}
            </div>
            <div 
              className="cursor-pointer hover:text-white flex items-center gap-1"
              onClick={() => handleSort('fee')}
            >
              수수료
              {sortBy === 'fee' && (
                <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
              )}
            </div>
            <div>비율</div>
            <div 
              className="cursor-pointer hover:text-white flex items-center gap-1"
              onClick={() => handleSort('apy')}
            >
              APY
              {sortBy === 'apy' && (
                <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
              )}
            </div>
            <div>상태</div>
          </div>
        </div>

        {/* 테이블 바디 */}
        <div className="divide-y divide-gray-700">
          {sortedPools.map((pool, index) => {
            const liquidityStatus = getLiquidityStatus(pool.liquidity, stats.totalLiquidity)
            const marketShare = (pool.liquidity / stats.totalLiquidity) * 100
            
            return (
              <div 
                key={index} 
                className="px-6 py-4 hover:bg-gray-700/30 transition-colors"
              >
                <div className="grid grid-cols-7 gap-4 text-sm">
                  {/* 거래소 */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getExchangeIcon(pool.exchange)}</span>
                    <div>
                      <div className={`font-medium ${getExchangeColor(pool.exchange)}`}>
                        {pool.exchange}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pool.symbol}
                      </div>
                    </div>
                  </div>

                  {/* 유동성 */}
                  <div>
                    <div className="text-white font-medium">
                      {formatValue(pool.liquidity)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {marketShare.toFixed(1)}% 점유율
                    </div>
                  </div>

                  {/* 24시간 거래량 */}
                  <div>
                    <div className="text-white font-medium">
                      {formatValue(pool.volume24h)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {((pool.volume24h / pool.liquidity) * 100).toFixed(1)}% 회전율
                    </div>
                  </div>

                  {/* 수수료 */}
                  <div>
                    <div className="text-white font-medium">
                      {formatValue(pool.fee * 100, 'percentage')}
                    </div>
                    <div className="text-xs text-gray-400">
                      거래 수수료
                    </div>
                  </div>

                  {/* 비율 */}
                  <div>
                    <div className="text-white font-medium">
                      {formatValue(pool.ratio * 100, 'percentage')}
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pool.ratio * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* APY */}
                  <div>
                    {pool.apy ? (
                      <>
                        <div className="text-green-400 font-medium">
                          {formatValue(pool.apy, 'percentage')}
                        </div>
                        <div className="text-xs text-gray-400">
                          연수익률
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500">-</div>
                    )}
                  </div>

                  {/* 상태 */}
                  <div>
                    <div className={`font-medium ${liquidityStatus.color}`}>
                      {liquidityStatus.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      유동성 수준
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 유동성 분포 차트 */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">유동성 분포</h4>
          <div className="space-y-3">
            {sortedPools.slice(0, 5).map((pool, index) => {
              const percentage = (pool.liquidity / stats.totalLiquidity) * 100
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-32">
                    <span>{getExchangeIcon(pool.exchange)}</span>
                    <span className="text-sm text-gray-300 truncate">
                      {pool.exchange}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>{percentage.toFixed(1)}%</span>
                      <span>{formatValue(pool.liquidity)}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-yellow-400' :
                          index === 1 ? 'bg-blue-400' :
                          index === 2 ? 'bg-green-400' :
                          index === 3 ? 'bg-purple-400' :
                          'bg-pink-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 거래량 vs 유동성 */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">효율성 분석</h4>
          <div className="space-y-4">
            {sortedPools.slice(0, 5).map((pool, index) => {
              const efficiency = pool.volume24h / pool.liquidity
              return (
                <div key={index} className="bg-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getExchangeIcon(pool.exchange)}</span>
                      <span className="text-sm font-medium text-white">
                        {pool.exchange}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      효율성: {efficiency.toFixed(2)}x
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                    <div>
                      <div className="text-gray-500">유동성</div>
                      <div className="text-white">{formatValue(pool.liquidity)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">거래량</div>
                      <div className="text-white">{formatValue(pool.volume24h)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">수수료</div>
                      <div className="text-white">{formatValue(pool.fee * 100, 'percentage')}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}