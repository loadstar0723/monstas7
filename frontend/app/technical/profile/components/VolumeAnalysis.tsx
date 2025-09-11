'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, FaArrowUp, FaArrowDown, FaBalanceScale,
  FaTachometerAlt, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa'
import { formatPrice, formatVolume, formatPercentage } from '@/lib/formatters'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface VolumeLevel {
  price: number
  buyVolume: number
  sellVolume: number
  totalVolume: number
  percentage: number
}

interface VolumeProfileData {
  levels: VolumeLevel[]
  poc: number
  vah: number
  val: number
  totalVolume: number
  buyVolume: number
  sellVolume: number
  hvnLevels: number[]
  lvnLevels: number[]
}

interface VolumeAnalysisProps {
  data: VolumeProfileData | null
  currentPrice: number
}

export default function VolumeAnalysis({ data, currentPrice }: VolumeAnalysisProps) {
  // 볼륨 분석 계산
  const analysis = useMemo(() => {
    if (!data || !data.levels || data.levels.length === 0) {
      return {
        buyPressure: 50,
        sellPressure: 50,
        volumeDistribution: [],
        priceRangeAnalysis: {
          aboveVA: 0,
          inVA: 0,
          belowVA: 0
        },
        volumeTrend: 'neutral',
        marketBalance: 'balanced',
        dominantSide: 'neutral',
        volumeScore: 0
      }
    }
    
    const buyPressure = (data.buyVolume / data.totalVolume) * 100
    const sellPressure = (data.sellVolume / data.totalVolume) * 100
    
    // 가격대별 볼륨 분포
    const volumeDistribution = data.levels
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 10)
      .map(level => ({
        price: formatPrice(level.price),
        volume: level.totalVolume,
        percentage: level.percentage,
        type: level.buyVolume > level.sellVolume ? 'buy' : 'sell'
      }))
    
    // 가격 범위별 볼륨 분석
    let aboveVA = 0, inVA = 0, belowVA = 0
    data.levels.forEach(level => {
      if (level.price > data.vah) {
        aboveVA += level.totalVolume
      } else if (level.price >= data.val) {
        inVA += level.totalVolume
      } else {
        belowVA += level.totalVolume
      }
    })
    
    const total = aboveVA + inVA + belowVA
    const priceRangeAnalysis = {
      aboveVA: (aboveVA / total) * 100,
      inVA: (inVA / total) * 100,
      belowVA: (belowVA / total) * 100
    }
    
    // 볼륨 트렌드 판단
    let volumeTrend: 'increasing' | 'decreasing' | 'neutral' = 'neutral'
    if (buyPressure > 60) volumeTrend = 'increasing'
    else if (sellPressure > 60) volumeTrend = 'decreasing'
    
    // 시장 균형 상태
    let marketBalance: 'balanced' | 'imbalanced' | 'extreme' = 'balanced'
    const balanceDiff = Math.abs(buyPressure - sellPressure)
    if (balanceDiff > 30) marketBalance = 'extreme'
    else if (balanceDiff > 15) marketBalance = 'imbalanced'
    
    // 지배적인 측
    const dominantSide = buyPressure > sellPressure ? 'buyers' : 'sellers'
    
    // 볼륨 스코어 (0-100)
    const volumeScore = Math.min(100, 
      (data.hvnLevels.length * 10) + 
      (priceRangeAnalysis.inVA > 70 ? 30 : priceRangeAnalysis.inVA * 0.4) +
      (balanceDiff < 10 ? 20 : 0)
    )
    
    return {
      buyPressure,
      sellPressure,
      volumeDistribution,
      priceRangeAnalysis,
      volumeTrend,
      marketBalance,
      dominantSide,
      volumeScore
    }
  }, [data])
  
  // 차트 색상
  const COLORS = {
    buy: '#10b981',
    sell: '#ef4444',
    neutral: '#6b7280',
    va: '#8b5cf6'
  }
  
  const pieData = [
    { name: '매수', value: analysis.buyPressure, color: COLORS.buy },
    { name: '매도', value: analysis.sellPressure, color: COLORS.sell }
  ]
  
  const rangeData = [
    { name: 'VA 위', value: analysis.priceRangeAnalysis.aboveVA, color: '#3b82f6' },
    { name: 'VA 내부', value: analysis.priceRangeAnalysis.inVA, color: '#8b5cf6' },
    { name: 'VA 아래', value: analysis.priceRangeAnalysis.belowVA, color: '#f59e0b' }
  ]
  
  return (
    <div className="space-y-6">
      {/* 메인 볼륨 분석 카드 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartBar className="text-purple-400" />
          볼륨 분석
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 매수/매도 압력 */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">매수/매도 압력</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${formatPercentage(value)}%`}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-gray-300 text-sm">
                  매수 {formatPercentage(analysis.buyPressure)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-gray-300 text-sm">
                  매도 {formatPercentage(analysis.sellPressure)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* 가격 범위별 분포 */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">가격 범위별 볼륨 분포</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rangeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {rangeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${formatPercentage(value)}%`}
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4">
              {rangeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-300 text-sm">{item.name}</span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {formatPercentage(item.value)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 시장 상태 지표 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">볼륨 트렌드</p>
            <div className="flex items-center gap-2">
              {analysis.volumeTrend === 'increasing' ? (
                <FaArrowUp className="text-green-400" />
              ) : analysis.volumeTrend === 'decreasing' ? (
                <FaArrowDown className="text-red-400" />
              ) : (
                <FaBalanceScale className="text-yellow-400" />
              )}
              <span className={`font-medium ${
                analysis.volumeTrend === 'increasing' ? 'text-green-400' :
                analysis.volumeTrend === 'decreasing' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {analysis.volumeTrend === 'increasing' ? '증가' :
                 analysis.volumeTrend === 'decreasing' ? '감소' : '중립'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">시장 균형</p>
            <div className="flex items-center gap-2">
              {analysis.marketBalance === 'balanced' ? (
                <FaCheckCircle className="text-green-400" />
              ) : analysis.marketBalance === 'imbalanced' ? (
                <FaExclamationTriangle className="text-yellow-400" />
              ) : (
                <FaExclamationTriangle className="text-red-400" />
              )}
              <span className={`font-medium ${
                analysis.marketBalance === 'balanced' ? 'text-green-400' :
                analysis.marketBalance === 'imbalanced' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {analysis.marketBalance === 'balanced' ? '균형' :
                 analysis.marketBalance === 'imbalanced' ? '불균형' : '극단'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">지배 세력</p>
            <span className={`font-medium ${
              analysis.dominantSide === 'buyers' ? 'text-green-400' : 'text-red-400'
            }`}>
              {analysis.dominantSide === 'buyers' ? '매수자' : '매도자'}
            </span>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">볼륨 스코어</p>
            <div className="flex items-center gap-2">
              <FaTachometerAlt className={`text-sm ${
                analysis.volumeScore >= 70 ? 'text-green-400' :
                analysis.volumeScore >= 40 ? 'text-yellow-400' :
                'text-red-400'
              }`} />
              <span className={`font-medium ${
                analysis.volumeScore >= 70 ? 'text-green-400' :
                analysis.volumeScore >= 40 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {analysis.volumeScore}/100
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 상위 볼륨 레벨 */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h4 className="text-lg font-bold text-white mb-4">상위 거래량 가격대</h4>
        
        <div className="space-y-3">
          {analysis.volumeDistribution.slice(0, 5).map((level, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-500">
                  #{index + 1}
                </span>
                <div>
                  <p className="text-white font-medium">${level.price}</p>
                  <p className="text-gray-400 text-sm">
                    {formatVolume(level.volume)} ({formatPercentage(level.percentage)}%)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 bg-gray-700 rounded-full overflow-hidden"
                  style={{ width: '100px' }}
                >
                  <div
                    className={`h-full ${
                      level.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${level.percentage}%` }}
                  />
                </div>
                <span className={`text-sm ${
                  level.type === 'buy' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {level.type === 'buy' ? '매수' : '매도'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* 분석 요약 */}
        <div className="mt-4 p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg">
          <p className="text-purple-300 text-sm">
            💡 <strong>분석 요약:</strong> 
            {analysis.marketBalance === 'balanced' 
              ? ' 현재 시장은 균형 상태입니다. 명확한 방향성이 나타날 때까지 관망하세요.'
              : analysis.dominantSide === 'buyers'
              ? ' 매수 압력이 우세합니다. 상승 모멘텀을 주시하세요.'
              : ' 매도 압력이 우세합니다. 하락 리스크에 주의하세요.'}
          </p>
        </div>
      </div>
    </div>
  )
}