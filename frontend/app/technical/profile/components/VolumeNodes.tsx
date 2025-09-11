'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FaTh, FaExclamationTriangle, FaCheckCircle, FaArrowRight,
  FaLightbulb, FaShieldAlt, FaBolt, FaChartBar
} from 'react-icons/fa'
import { formatPrice, formatVolume, formatPercentage } from '@/lib/formatters'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

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

interface VolumeNodesProps {
  data: VolumeProfileData | null
  currentPrice: number
}

interface NodeAnalysis {
  type: 'HVN' | 'LVN'
  price: number
  distance: number
  distancePercent: number
  direction: 'above' | 'below'
  strength: 'strong' | 'moderate' | 'weak'
  action: string
}

export default function VolumeNodes({ data, currentPrice }: VolumeNodesProps) {
  // HVN/LVN 분석
  const nodeAnalysis = useMemo(() => {
    if (!data || !data.levels) {
      return {
        nearestHVN: null,
        nearestLVN: null,
        hvnAnalysis: [],
        lvnAnalysis: [],
        currentPriceNode: 'normal',
        tradingZone: 'neutral'
      }
    }
    
    // HVN 분석
    const hvnAnalysis: NodeAnalysis[] = data.hvnLevels.map(price => {
      const distance = Math.abs(currentPrice - price)
      const distancePercent = (distance / currentPrice) * 100
      const direction = currentPrice > price ? 'below' : 'above'
      
      let strength: 'strong' | 'moderate' | 'weak' = 'moderate'
      if (distancePercent < 1) strength = 'strong'
      else if (distancePercent > 3) strength = 'weak'
      
      let action = ''
      if (direction === 'above' && distancePercent < 2) {
        action = 'HVN이 저항으로 작용 중. 돌파 시도 주시'
      } else if (direction === 'below' && distancePercent < 2) {
        action = 'HVN이 지지로 작용 중. 반등 가능성'
      }
      
      return {
        type: 'HVN' as const,
        price,
        distance,
        distancePercent,
        direction,
        strength,
        action
      }
    }).sort((a, b) => a.distance - b.distance)
    
    // LVN 분석
    const lvnAnalysis: NodeAnalysis[] = data.lvnLevels.map(price => {
      const distance = Math.abs(currentPrice - price)
      const distancePercent = (distance / currentPrice) * 100
      const direction = currentPrice > price ? 'below' : 'above'
      
      let strength: 'strong' | 'moderate' | 'weak' = 'moderate'
      if (distancePercent < 0.5) strength = 'strong'
      else if (distancePercent > 2) strength = 'weak'
      
      let action = ''
      if (distancePercent < 1) {
        action = 'LVN 근처 - 빠른 가격 이동 예상'
      } else if (direction === 'above' && distancePercent < 2) {
        action = 'LVN 접근 중 - 돌파 준비'
      }
      
      return {
        type: 'LVN' as const,
        price,
        distance,
        distancePercent,
        direction,
        strength,
        action
      }
    }).sort((a, b) => a.distance - b.distance)
    
    // 현재 가격이 위치한 노드 타입
    const nearestHVN = hvnAnalysis[0]
    const nearestLVN = lvnAnalysis[0]
    
    let currentPriceNode = 'normal'
    if (nearestHVN && nearestHVN.distancePercent < 0.5) {
      currentPriceNode = 'HVN'
    } else if (nearestLVN && nearestLVN.distancePercent < 0.5) {
      currentPriceNode = 'LVN'
    }
    
    // 거래 구역 판단
    let tradingZone = 'neutral'
    if (nearestHVN && nearestHVN.distancePercent < 1 && nearestHVN.direction === 'below') {
      tradingZone = 'support'
    } else if (nearestHVN && nearestHVN.distancePercent < 1 && nearestHVN.direction === 'above') {
      tradingZone = 'resistance'
    } else if (nearestLVN && nearestLVN.distancePercent < 1) {
      tradingZone = 'breakout'
    }
    
    return {
      nearestHVN,
      nearestLVN,
      hvnAnalysis,
      lvnAnalysis,
      currentPriceNode,
      tradingZone
    }
  }, [data, currentPrice])
  
  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!data || !data.levels) return []
    
    return data.levels
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 20)
      .map(level => ({
        price: formatPrice(level.price),
        volume: level.totalVolume,
        isHVN: data.hvnLevels.includes(level.price),
        isLVN: data.lvnLevels.includes(level.price),
        isCurrent: Math.abs(level.price - currentPrice) / currentPrice < 0.001
      }))
  }, [data, currentPrice])
  
  // 바 색상 결정
  const getBarColor = (entry: any) => {
    if (entry.isCurrent) return '#a855f7'
    if (entry.isHVN) return '#3b82f6'
    if (entry.isLVN) return '#f59e0b'
    return '#6b7280'
  }
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaTh className="text-purple-400" />
        HVN/LVN 노드 분석
      </h3>
      
      {/* 현재 상태 요약 */}
      <div className={`p-4 rounded-lg mb-6 ${
        nodeAnalysis.tradingZone === 'support' ? 'bg-green-900/20 border-green-700/30' :
        nodeAnalysis.tradingZone === 'resistance' ? 'bg-red-900/20 border-red-700/30' :
        nodeAnalysis.tradingZone === 'breakout' ? 'bg-yellow-900/20 border-yellow-700/30' :
        'bg-gray-900/50 border-gray-700'
      } border`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">거래 구역</p>
            <p className={`text-xl font-bold ${
              nodeAnalysis.tradingZone === 'support' ? 'text-green-400' :
              nodeAnalysis.tradingZone === 'resistance' ? 'text-red-400' :
              nodeAnalysis.tradingZone === 'breakout' ? 'text-yellow-400' :
              'text-gray-300'
            }`}>
              {nodeAnalysis.tradingZone === 'support' ? 'HVN 지지 구간' :
               nodeAnalysis.tradingZone === 'resistance' ? 'HVN 저항 구간' :
               nodeAnalysis.tradingZone === 'breakout' ? 'LVN 돌파 구간' :
               '중립 구간'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {nodeAnalysis.tradingZone === 'support' && <FaShieldAlt className="text-green-400 text-2xl" />}
            {nodeAnalysis.tradingZone === 'resistance' && <FaExclamationTriangle className="text-red-400 text-2xl" />}
            {nodeAnalysis.tradingZone === 'breakout' && <FaBolt className="text-yellow-400 text-2xl" />}
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mt-2">
          {nodeAnalysis.tradingZone === 'support' && 'HVN이 강력한 지지선 역할. 반등 매수 기회 포착 가능.'}
          {nodeAnalysis.tradingZone === 'resistance' && 'HVN이 저항선으로 작용 중. 돌파 확인 필요.'}
          {nodeAnalysis.tradingZone === 'breakout' && 'LVN 구간에서 빠른 가격 움직임 예상. 돌파 매매 준비.'}
          {nodeAnalysis.tradingZone === 'neutral' && '특별한 볼륨 노드 없음. 다른 지표 참고 필요.'}
        </p>
      </div>
      
      {/* 가장 가까운 노드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 가장 가까운 HVN */}
        {nodeAnalysis.nearestHVN && (
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-blue-400 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                    HVN
                  </div>
                  가장 가까운 고볼륨 노드
                </h4>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                nodeAnalysis.nearestHVN.strength === 'strong' ? 'bg-blue-500/20 text-blue-400' :
                nodeAnalysis.nearestHVN.strength === 'moderate' ? 'bg-gray-700 text-gray-300' :
                'bg-gray-800 text-gray-500'
              }`}>
                {nodeAnalysis.nearestHVN.strength === 'strong' ? '강함' :
                 nodeAnalysis.nearestHVN.strength === 'moderate' ? '보통' : '약함'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">가격</span>
                <span className="text-white font-medium">
                  ${formatPrice(nodeAnalysis.nearestHVN.price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">거리</span>
                <span className={`font-medium ${
                  nodeAnalysis.nearestHVN.direction === 'above' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {nodeAnalysis.nearestHVN.direction === 'above' ? '↑' : '↓'} {formatPercentage(nodeAnalysis.nearestHVN.distancePercent)}%
                </span>
              </div>
            </div>
            
            {nodeAnalysis.nearestHVN.action && (
              <p className="text-gray-300 text-sm mt-3 p-2 bg-gray-800/50 rounded">
                {nodeAnalysis.nearestHVN.action}
              </p>
            )}
          </div>
        )}
        
        {/* 가장 가까운 LVN */}
        {nodeAnalysis.nearestLVN && (
          <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-orange-400 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded flex items-center justify-center">
                    LVN
                  </div>
                  가장 가까운 저볼륨 노드
                </h4>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                nodeAnalysis.nearestLVN.strength === 'strong' ? 'bg-orange-500/20 text-orange-400' :
                nodeAnalysis.nearestLVN.strength === 'moderate' ? 'bg-gray-700 text-gray-300' :
                'bg-gray-800 text-gray-500'
              }`}>
                {nodeAnalysis.nearestLVN.strength === 'strong' ? '강함' :
                 nodeAnalysis.nearestLVN.strength === 'moderate' ? '보통' : '약함'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">가격</span>
                <span className="text-white font-medium">
                  ${formatPrice(nodeAnalysis.nearestLVN.price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">거리</span>
                <span className={`font-medium ${
                  nodeAnalysis.nearestLVN.direction === 'above' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {nodeAnalysis.nearestLVN.direction === 'above' ? '↑' : '↓'} {formatPercentage(nodeAnalysis.nearestLVN.distancePercent)}%
                </span>
              </div>
            </div>
            
            {nodeAnalysis.nearestLVN.action && (
              <p className="text-gray-300 text-sm mt-3 p-2 bg-gray-800/50 rounded">
                {nodeAnalysis.nearestLVN.action}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* 볼륨 노드 차트 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">볼륨 분포 및 노드 위치</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="price" 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
              />
              <Tooltip
                formatter={(value: any) => formatVolume(value)}
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
              <Bar dataKey="volume">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-gray-300 text-sm">HVN (고볼륨)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span className="text-gray-300 text-sm">LVN (저볼륨)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span className="text-gray-300 text-sm">현재 가격</span>
          </div>
        </div>
      </div>
      
      {/* 트레이딩 전략 가이드 */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-900/20 to-orange-900/20 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3 flex items-center gap-2">
            <FaLightbulb className="text-yellow-400" />
            HVN/LVN 트레이딩 전략
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="text-blue-400 font-medium">HVN 활용법</h5>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 text-xs" />
                  <span>지지/저항선으로 활용</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 text-xs" />
                  <span>Range 트레이딩 구간</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 text-xs" />
                  <span>목표가/손절가 설정</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-green-400 mt-0.5 text-xs" />
                  <span>포지션 축적 구간</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h5 className="text-orange-400 font-medium">LVN 활용법</h5>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <FaArrowRight className="text-yellow-400 mt-0.5 text-xs" />
                  <span>돌파 매매 기회</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaArrowRight className="text-yellow-400 mt-0.5 text-xs" />
                  <span>빠른 가격 이동 예상</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaArrowRight className="text-yellow-400 mt-0.5 text-xs" />
                  <span>타이트한 손절 설정</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaArrowRight className="text-yellow-400 mt-0.5 text-xs" />
                  <span>모멘텀 트레이딩</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 현재 권장 액션 */}
        <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
          <p className="text-purple-300 text-sm">
            💡 <strong>현재 권장 액션:</strong>
            {nodeAnalysis.tradingZone === 'support' && 
              ' HVN 지지선에서 반등 매수 준비. 지지선 하향 돌파 시 손절.'}
            {nodeAnalysis.tradingZone === 'resistance' && 
              ' HVN 저항선 돌파 대기. 돌파 확인 후 추격 매수 고려.'}
            {nodeAnalysis.tradingZone === 'breakout' && 
              ' LVN 구간 돌파 시 빠른 움직임 예상. 돌파 방향 확인 후 진입.'}
            {nodeAnalysis.tradingZone === 'neutral' && 
              ' 명확한 볼륨 노드 없음. VA 경계나 POC 레벨 참고 권장.'}
          </p>
        </div>
      </div>
    </div>
  )
}