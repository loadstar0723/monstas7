'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FaCubes, FaChartLine, FaExclamationTriangle, FaCheckCircle,
  FaArrowUp, FaArrowDown, FaExchangeAlt, FaInfoCircle
} from 'react-icons/fa'
import { formatPrice, formatPercentage } from '@/lib/formatters'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'

interface VolumeProfileData {
  levels: any[]
  poc: number
  vah: number
  val: number
  totalVolume: number
  buyVolume: number
  sellVolume: number
  hvnLevels: number[]
  lvnLevels: number[]
}

interface MarketStructureProps {
  data: VolumeProfileData | null
  priceHistory: any[]
  currentPrice: number
}

export default function MarketStructure({ data, priceHistory, currentPrice }: MarketStructureProps) {
  // 시장 구조 분석
  const marketStructure = useMemo(() => {
    if (!data || !priceHistory || priceHistory.length === 0) {
      return {
        trend: 'neutral',
        structure: 'ranging',
        keyLevels: [],
        priceAction: 'sideways',
        momentum: 0,
        volatility: 'normal',
        marketPhase: 'accumulation'
      }
    }
    
    // 가격 추세 분석
    const recentPrices = priceHistory.slice(-20).map(p => p.close)
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    const priceAboveAvg = currentPrice > avgPrice
    
    // 고점/저점 분석
    const highs = priceHistory.map(p => p.high)
    const lows = priceHistory.map(p => p.low)
    const recentHigh = Math.max(...highs.slice(-20))
    const recentLow = Math.min(...lows.slice(-20))
    
    // 추세 판단
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    const pricePosition = (currentPrice - recentLow) / (recentHigh - recentLow)
    if (pricePosition > 0.7 && priceAboveAvg) trend = 'bullish'
    else if (pricePosition < 0.3 && !priceAboveAvg) trend = 'bearish'
    
    // 시장 구조
    let structure: 'trending' | 'ranging' | 'breakout' = 'ranging'
    const range = recentHigh - recentLow
    const rangePercent = (range / avgPrice) * 100
    
    if (rangePercent > 10 && (pricePosition > 0.8 || pricePosition < 0.2)) {
      structure = 'breakout'
    } else if (rangePercent > 5 && trend !== 'neutral') {
      structure = 'trending'
    }
    
    // 주요 레벨
    const keyLevels = [
      { name: 'POC', price: data.poc, type: 'poc' },
      { name: 'VAH', price: data.vah, type: 'resistance' },
      { name: 'VAL', price: data.val, type: 'support' },
      { name: '최근 고점', price: recentHigh, type: 'resistance' },
      { name: '최근 저점', price: recentLow, type: 'support' }
    ].sort((a, b) => b.price - a.price)
    
    // 모멘텀 계산
    const momentum = priceHistory.length > 10 
      ? ((priceHistory[priceHistory.length - 1].close - priceHistory[priceHistory.length - 10].close) / priceHistory[priceHistory.length - 10].close) * 100
      : 0
    
    // 변동성 분석
    const volatilityValues = priceHistory.slice(-20).map((p, i, arr) => {
      if (i === 0) return 0
      return Math.abs((p.close - arr[i-1].close) / arr[i-1].close) * 100
    })
    const avgVolatility = volatilityValues.reduce((a, b) => a + b, 0) / volatilityValues.length
    
    let volatility: 'low' | 'normal' | 'high' = 'normal'
    if (avgVolatility < 1) volatility = 'low'
    else if (avgVolatility > 3) volatility = 'high'
    
    // 시장 단계
    let marketPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown' = 'accumulation'
    if (trend === 'bullish' && structure === 'trending') marketPhase = 'markup'
    else if (trend === 'bearish' && structure === 'trending') marketPhase = 'markdown'
    else if (pricePosition > 0.7 && volatility === 'high') marketPhase = 'distribution'
    
    return {
      trend,
      structure,
      keyLevels,
      priceAction: trend,
      momentum,
      volatility,
      marketPhase,
      pricePosition,
      rangePercent
    }
  }, [data, priceHistory, currentPrice])
  
  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return []
    
    return priceHistory.slice(-50).map((p, index) => ({
      time: index,
      price: p.close,
      high: p.high,
      low: p.low,
      volume: p.volume
    }))
  }, [priceHistory])
  
  return (
    <div className="space-y-6">
      {/* 시장 구조 개요 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCubes className="text-purple-400" />
          시장 구조 분석
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">추세</p>
            <div className="flex items-center gap-2">
              {marketStructure.trend === 'bullish' ? (
                <FaArrowUp className="text-green-400" />
              ) : marketStructure.trend === 'bearish' ? (
                <FaArrowDown className="text-red-400" />
              ) : (
                <FaExchangeAlt className="text-yellow-400" />
              )}
              <span className={`font-bold ${
                marketStructure.trend === 'bullish' ? 'text-green-400' :
                marketStructure.trend === 'bearish' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {marketStructure.trend === 'bullish' ? '상승' :
                 marketStructure.trend === 'bearish' ? '하락' : '중립'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">구조</p>
            <span className={`font-bold ${
              marketStructure.structure === 'trending' ? 'text-blue-400' :
              marketStructure.structure === 'breakout' ? 'text-purple-400' :
              'text-gray-300'
            }`}>
              {marketStructure.structure === 'trending' ? '추세형' :
               marketStructure.structure === 'breakout' ? '돌파' : '횡보'}
            </span>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">변동성</p>
            <span className={`font-bold ${
              marketStructure.volatility === 'high' ? 'text-red-400' :
              marketStructure.volatility === 'low' ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              {marketStructure.volatility === 'high' ? '높음' :
               marketStructure.volatility === 'low' ? '낮음' : '보통'}
            </span>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">시장 단계</p>
            <span className="text-purple-400 font-bold">
              {marketStructure.marketPhase === 'accumulation' ? '축적' :
               marketStructure.marketPhase === 'markup' ? '상승' :
               marketStructure.marketPhase === 'distribution' ? '분배' : '하락'}
            </span>
          </div>
        </div>
        
        {/* 가격 차트 with 볼륨 프로파일 레벨 */}
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" hide />
              <YAxis 
                domain={['dataMin', 'dataMax']} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelFormatter={() => ''}
              />
              
              {/* Value Area 영역 */}
              {data && (
                <ReferenceArea
                  y1={data.val}
                  y2={data.vah}
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                />
              )}
              
              {/* POC 라인 */}
              {data && (
                <ReferenceLine 
                  y={data.poc} 
                  stroke="#facc15" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: "POC", position: "right", fill: "#facc15" }}
                />
              )}
              
              {/* 현재 가격 */}
              <ReferenceLine 
                y={currentPrice} 
                stroke="#a855f7" 
                strokeWidth={2}
                label={{ value: "현재", position: "right", fill: "#a855f7" }}
              />
              
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
              
              {/* 고저 범위 */}
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#10b981" 
                strokeWidth={1}
                strokeOpacity={0.3}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="#ef4444" 
                strokeWidth={1}
                strokeOpacity={0.3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* 주요 레벨 */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">주요 가격 레벨</h4>
          <div className="space-y-2">
            {marketStructure.keyLevels.map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 bg-gray-900/50 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded ${
                    level.type === 'poc' ? 'bg-yellow-400' :
                    level.type === 'resistance' ? 'bg-red-400' :
                    'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{level.name}</p>
                    <p className="text-gray-400 text-xs">
                      ${formatPrice(level.price)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm ${
                    currentPrice > level.price ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {currentPrice > level.price ? '↑' : '↓'} {formatPercentage(Math.abs((currentPrice - level.price) / level.price * 100))}%
                  </p>
                  <p className="text-gray-500 text-xs">
                    {Math.abs(currentPrice - level.price).toFixed(2)} 차이
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 시장 단계 설명 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
          <FaInfoCircle className="text-purple-400" />
          현재 시장 단계: {
            marketStructure.marketPhase === 'accumulation' ? '축적 단계' :
            marketStructure.marketPhase === 'markup' ? '상승 단계' :
            marketStructure.marketPhase === 'distribution' ? '분배 단계' : '하락 단계'
          }
        </h4>
        
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          {marketStructure.marketPhase === 'accumulation' && 
            '스마트 머니가 포지션을 축적하는 단계입니다. 가격은 횡보하며 거래량은 점진적으로 증가합니다. 장기 투자자에게 좋은 진입 기회가 될 수 있습니다.'}
          {marketStructure.marketPhase === 'markup' && 
            '가격이 활발히 상승하는 단계입니다. 추세 추종 전략이 유효하며, 조정 시 매수 기회를 노려볼 수 있습니다.'}
          {marketStructure.marketPhase === 'distribution' && 
            '스마트 머니가 포지션을 정리하는 단계입니다. 변동성이 증가하며 상단이 무거워집니다. 리스크 관리가 중요합니다.'}
          {marketStructure.marketPhase === 'markdown' && 
            '가격이 하락하는 단계입니다. 손절매 설정이 중요하며, 바닥 신호가 나타날 때까지 관망하는 것이 안전합니다.'}
        </p>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FaChartLine className="text-blue-400" />
            <span className="text-gray-300">
              모멘텀: <span className={marketStructure.momentum > 0 ? 'text-green-400' : 'text-red-400'}>
                {marketStructure.momentum > 0 ? '+' : ''}{formatPercentage(marketStructure.momentum)}%
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-400" />
            <span className="text-gray-300">
              레인지: <span className="text-yellow-400">
                {formatPercentage(marketStructure.rangePercent || 0)}%
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}