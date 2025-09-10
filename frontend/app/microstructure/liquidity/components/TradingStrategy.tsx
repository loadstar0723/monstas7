'use client'

import { useMemo } from 'react'
import { 
  ArrowUpIcon as ArrowTrendingUpIcon, 
  ArrowDownIcon as ArrowTrendingDownIcon,
  LightBulbIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface TradingStrategyProps {
  orderbook: any
  currentPrice: number
  priceChange24h: number
  volume24h: number
}

export default function TradingStrategy({ 
  orderbook, 
  currentPrice, 
  priceChange24h,
  volume24h 
}: TradingStrategyProps) {
  
  // 전략 분석
  const strategy = useMemo(() => {
    if (!orderbook) return null
    
    // 유동성 분석
    const bidLiquidity = orderbook.bids.slice(0, 10).reduce((sum: number, b: any) => sum + b.total, 0)
    const askLiquidity = orderbook.asks.slice(0, 10).reduce((sum: number, a: any) => sum + a.total, 0)
    const liquidityRatio = bidLiquidity / (askLiquidity || 1)
    
    // 스프레드 분석
    const spread = orderbook.asks[0]?.price - orderbook.bids[0]?.price
    const spreadPercent = (spread / currentPrice) * 100
    
    // Wall 분석
    const avgBidSize = bidLiquidity / 10
    const avgAskSize = askLiquidity / 10
    const hasBuyWall = orderbook.bids.some((b: any) => b.total > avgBidSize * 3)
    const hasSellWall = orderbook.asks.some((a: any) => a.total > avgAskSize * 3)
    
    // 방향성 판단
    let direction = 'neutral'
    let confidence = 50
    
    if (liquidityRatio > 1.3 && priceChange24h > 0) {
      direction = 'bullish'
      confidence = Math.min(90, 50 + (liquidityRatio - 1) * 40 + priceChange24h * 2)
    } else if (liquidityRatio < 0.7 && priceChange24h < 0) {
      direction = 'bearish'
      confidence = Math.min(90, 50 + (1 - liquidityRatio) * 40 + Math.abs(priceChange24h) * 2)
    }
    
    // 진입 전략
    const entryStrategy = {
      long: {
        entry: orderbook.bids[0]?.price * 0.9995,  // 0.05% 아래
        stopLoss: orderbook.bids[0]?.price * 0.99,  // 1% 손절
        takeProfit1: orderbook.asks[0]?.price * 1.005,  // 0.5% 익절1
        takeProfit2: orderbook.asks[0]?.price * 1.01,   // 1% 익절2
        takeProfit3: orderbook.asks[0]?.price * 1.02    // 2% 익절3
      },
      short: {
        entry: orderbook.asks[0]?.price * 1.0005,  // 0.05% 위
        stopLoss: orderbook.asks[0]?.price * 1.01,  // 1% 손절
        takeProfit1: orderbook.bids[0]?.price * 0.995,  // 0.5% 익절1
        takeProfit2: orderbook.bids[0]?.price * 0.99,   // 1% 익절2
        takeProfit3: orderbook.bids[0]?.price * 0.98    // 2% 익절3
      }
    }
    
    // 레버리지 추천
    let recommendedLeverage = 1
    if (spreadPercent < 0.05 && confidence > 70) {
      recommendedLeverage = 3
    } else if (spreadPercent < 0.1 && confidence > 60) {
      recommendedLeverage = 2
    }
    
    // 포지션 크기 추천
    const volatilityFactor = Math.abs(priceChange24h) / 10
    const positionSizePercent = Math.max(1, Math.min(5, 3 / (1 + volatilityFactor)))
    
    return {
      direction,
      confidence,
      liquidityRatio,
      spreadPercent,
      hasBuyWall,
      hasSellWall,
      entryStrategy,
      recommendedLeverage,
      positionSizePercent
    }
  }, [orderbook, currentPrice, priceChange24h])
  
  if (!strategy) return null
  
  // 시장 상태 색상
  const getDirectionColor = (direction: string) => {
    switch(direction) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }
  
  const getDirectionIcon = (direction: string) => {
    switch(direction) {
      case 'bullish': return ArrowTrendingUpIcon
      case 'bearish': return ArrowTrendingDownIcon
      default: return ChartBarIcon
    }
  }
  
  const DirectionIcon = getDirectionIcon(strategy.direction)
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">유동성 기반 트레이딩 전략</h3>
        <p className="text-gray-400 text-sm">실시간 오더북 분석 기반 전략 추천</p>
      </div>
      
      {/* 시장 방향성 */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <DirectionIcon className={`w-8 h-8 ${getDirectionColor(strategy.direction)}`} />
            <div>
              <p className="text-gray-400 text-sm">시장 방향성</p>
              <p className={`text-2xl font-bold ${getDirectionColor(strategy.direction)}`}>
                {strategy.direction === 'bullish' ? '상승' : 
                 strategy.direction === 'bearish' ? '하락' : '중립'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">신뢰도</p>
            <p className="text-2xl font-bold text-white">{strategy.confidence.toFixed(0)}%</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              strategy.confidence >= 70 ? 'bg-green-500' :
              strategy.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${strategy.confidence}%` }}
          />
        </div>
      </div>
      
      {/* 진입 전략 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 롱 포지션 */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5" />
            롱 포지션 전략
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">진입가:</span>
              <span className="text-white font-mono">${strategy.entryStrategy.long.entry.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">손절가:</span>
              <span className="text-red-400 font-mono">${strategy.entryStrategy.long.stopLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">익절 1:</span>
              <span className="text-green-400 font-mono">${strategy.entryStrategy.long.takeProfit1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">익절 2:</span>
              <span className="text-green-400 font-mono">${strategy.entryStrategy.long.takeProfit2.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">익절 3:</span>
              <span className="text-green-400 font-mono">${strategy.entryStrategy.long.takeProfit3.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* 숏 포지션 */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
            <ArrowTrendingDownIcon className="w-5 h-5" />
            숏 포지션 전략
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">진입가:</span>
              <span className="text-white font-mono">${strategy.entryStrategy.short.entry.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">손절가:</span>
              <span className="text-red-400 font-mono">${strategy.entryStrategy.short.stopLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">익절 1:</span>
              <span className="text-green-400 font-mono">${strategy.entryStrategy.short.takeProfit1.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">익절 2:</span>
              <span className="text-green-400 font-mono">${strategy.entryStrategy.short.takeProfit2.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">익절 3:</span>
              <span className="text-green-400 font-mono">${strategy.entryStrategy.short.takeProfit3.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 리스크 관리 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">권장 레버리지</span>
          </div>
          <p className="text-2xl font-bold text-white">{strategy.recommendedLeverage}x</p>
          <p className="text-xs text-gray-500 mt-1">
            {strategy.recommendedLeverage === 1 ? '낮은 신뢰도' :
             strategy.recommendedLeverage === 2 ? '중간 신뢰도' : '높은 신뢰도'}
          </p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400 text-sm">포지션 크기</span>
          </div>
          <p className="text-2xl font-bold text-white">{strategy.positionSizePercent.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">총 자본 대비</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400 text-sm">타임프레임</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {strategy.spreadPercent < 0.05 ? '1-5분' :
             strategy.spreadPercent < 0.1 ? '5-15분' : '15분+'}
          </p>
          <p className="text-xs text-gray-500 mt-1">스캘핑/데이</p>
        </div>
      </div>
      
      {/* 시장 조건 */}
      <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
        <h4 className="text-white font-semibold mb-3">현재 시장 조건</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">유동성 비율</p>
            <p className={`font-semibold ${
              strategy.liquidityRatio > 1.2 ? 'text-green-400' :
              strategy.liquidityRatio < 0.8 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {strategy.liquidityRatio.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">스프레드</p>
            <p className={`font-semibold ${
              strategy.spreadPercent < 0.05 ? 'text-green-400' :
              strategy.spreadPercent < 0.1 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {strategy.spreadPercent.toFixed(3)}%
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">매수 벽</p>
            <p className={`font-semibold ${strategy.hasBuyWall ? 'text-green-400' : 'text-gray-500'}`}>
              {strategy.hasBuyWall ? '있음' : '없음'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">매도 벽</p>
            <p className={`font-semibold ${strategy.hasSellWall ? 'text-red-400' : 'text-gray-500'}`}>
              {strategy.hasSellWall ? '있음' : '없음'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 실행 권장사항 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-yellow-400" />
          실행 권장사항
        </h4>
        <div className="space-y-2 text-sm text-gray-300">
          {strategy.direction === 'bullish' && (
            <>
              <p>✅ 롱 포지션 우선 고려 (신뢰도 {strategy.confidence.toFixed(0)}%)</p>
              <p>📊 레버리지 {strategy.recommendedLeverage}x로 제한</p>
              <p>💰 총 자본의 {strategy.positionSizePercent.toFixed(1)}%만 투입</p>
              <p>⏱️ {strategy.spreadPercent < 0.05 ? '단기 스캘핑' : '중단기 스윙'} 전략 추천</p>
            </>
          )}
          {strategy.direction === 'bearish' && (
            <>
              <p>⚠️ 숏 포지션 우선 고려 (신뢰도 {strategy.confidence.toFixed(0)}%)</p>
              <p>📊 레버리지 {strategy.recommendedLeverage}x로 제한</p>
              <p>💰 총 자본의 {strategy.positionSizePercent.toFixed(1)}%만 투입</p>
              <p>🛡️ 타이트한 손절 설정 필수</p>
            </>
          )}
          {strategy.direction === 'neutral' && (
            <>
              <p>⏸️ 관망 또는 레인지 트레이딩 추천</p>
              <p>📊 레버리지 1x 유지</p>
              <p>💰 포지션 최소화 (자본의 1-2%)</p>
              <p>🔄 양방향 주문으로 브레이크아웃 대비</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}