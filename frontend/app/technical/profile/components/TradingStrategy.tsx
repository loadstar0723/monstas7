'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  FaRocket, FaChartLine, FaShieldAlt, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaTachometerAlt, FaCoins,
  FaBullhorn, FaChartBar, FaLightbulb, FaCalculator
} from 'react-icons/fa'
import { formatPrice, formatPercentage, formatVolume } from '@/lib/formatters'

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

interface TradingStrategyProps {
  data: VolumeProfileData | null
  currentPrice: number
  symbol: string
}

interface Strategy {
  id: string
  name: string
  type: 'long' | 'short' | 'neutral'
  confidence: number
  entry: number
  target1: number
  target2: number
  stopLoss: number
  riskReward: number
  description: string
  conditions: string[]
  pros: string[]
  cons: string[]
}

export default function TradingStrategy({ data, currentPrice, symbol }: TradingStrategyProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [riskAmount, setRiskAmount] = useState(1000) // 리스크 금액
  const [leverage, setLeverage] = useState(3) // 레버리지
  
  // 현재 시장 상태 분석
  const marketState = useMemo(() => {
    if (!data) return { position: 'neutral', trend: 'sideways', strength: 0 }
    
    const priceVsPOC = ((currentPrice - data.poc) / data.poc) * 100
    const isInValueArea = currentPrice >= data.val && currentPrice <= data.vah
    const buyPressure = (data.buyVolume / data.totalVolume) * 100
    
    let position: 'above_va' | 'in_va' | 'below_va' = 'in_va'
    if (currentPrice > data.vah) position = 'above_va'
    else if (currentPrice < data.val) position = 'below_va'
    
    let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways'
    if (position === 'above_va' && buyPressure > 55) trend = 'bullish'
    else if (position === 'below_va' && buyPressure < 45) trend = 'bearish'
    
    const strength = Math.abs(priceVsPOC) > 2 ? 'strong' : 'weak'
    
    return { position, trend, strength, buyPressure, priceVsPOC, isInValueArea }
  }, [data, currentPrice])
  
  // 전략 생성
  const strategies = useMemo<Strategy[]>(() => {
    if (!data) return []
    
    const strategies: Strategy[] = []
    
    // 1. POC 평균 회귀 전략
    if (Math.abs(currentPrice - data.poc) / data.poc > 0.02) {
      const isAbovePOC = currentPrice > data.poc
      strategies.push({
        id: 'poc-reversion',
        name: 'POC 평균 회귀',
        type: isAbovePOC ? 'short' : 'long',
        confidence: Math.min(85, 60 + Math.abs((currentPrice - data.poc) / data.poc) * 100),
        entry: currentPrice,
        target1: data.poc + (isAbovePOC ? data.poc * 0.002 : -data.poc * 0.002),
        target2: data.poc,
        stopLoss: isAbovePOC ? 
          currentPrice * 1.015 : 
          currentPrice * 0.985,
        riskReward: 2.5,
        description: `가격이 POC에서 ${formatPercentage(Math.abs((currentPrice - data.poc) / data.poc * 100))}% 이탈. POC로의 회귀 가능성 높음`,
        conditions: [
          `현재 가격이 POC에서 2% 이상 이탈`,
          `볼륨 프로파일이 명확한 POC 형성`,
          `최근 POC 근처에서 반등/저항 이력`
        ],
        pros: [
          '높은 승률 (역사적으로 70%+)',
          '명확한 타겟 설정 가능',
          '리스크 관리 용이'
        ],
        cons: [
          '강한 트렌드 시 손실 가능',
          '진입 타이밍 중요',
          '횡보장에서만 효과적'
        ]
      })
    }
    
    // 2. Value Area 돌파 전략
    if (marketState.position === 'above_va' && marketState.buyPressure > 60) {
      strategies.push({
        id: 'va-breakout-long',
        name: 'Value Area 상향 돌파',
        type: 'long',
        confidence: 75,
        entry: currentPrice,
        target1: data.vah + (data.vah - data.val) * 0.382,
        target2: data.vah + (data.vah - data.val) * 0.618,
        stopLoss: data.vah - (currentPrice - data.vah) * 1.5,
        riskReward: 3.0,
        description: 'Value Area 상단 돌파 후 추가 상승 모멘텀',
        conditions: [
          'VAH 돌파 후 유지',
          '매수 볼륨 60% 이상',
          '상승 트렌드 확인'
        ],
        pros: [
          '강한 모멘텀 활용',
          '높은 수익 잠재력',
          '트렌드 방향 일치'
        ],
        cons: [
          'False breakout 위험',
          '변동성 증가',
          'FOMO 주의 필요'
        ]
      })
    }
    
    // 3. HVN 지지/저항 전략
    const nearestHVN = data.hvnLevels.reduce((nearest, hvn) => {
      const currentDist = Math.abs(currentPrice - hvn)
      const nearestDist = Math.abs(currentPrice - nearest)
      return currentDist < nearestDist ? hvn : nearest
    }, data.hvnLevels[0] || data.poc)
    
    if (nearestHVN && Math.abs(currentPrice - nearestHVN) / currentPrice < 0.01) {
      const isApproachingFromAbove = currentPrice > nearestHVN
      strategies.push({
        id: 'hvn-bounce',
        name: 'HVN 레벨 반등',
        type: isApproachingFromAbove ? 'long' : 'short',
        confidence: 70,
        entry: nearestHVN * (isApproachingFromAbove ? 1.001 : 0.999),
        target1: isApproachingFromAbove ? 
          nearestHVN * 1.015 : 
          nearestHVN * 0.985,
        target2: isApproachingFromAbove ? 
          nearestHVN * 1.025 : 
          nearestHVN * 0.975,
        stopLoss: isApproachingFromAbove ? 
          nearestHVN * 0.992 : 
          nearestHVN * 1.008,
        riskReward: 2.0,
        description: `HVN 레벨 ${formatPrice(nearestHVN)} 근처에서 반등 예상`,
        conditions: [
          'HVN 레벨 1% 이내 접근',
          '이전 반등 이력 확인',
          '볼륨 증가 신호'
        ],
        pros: [
          '높은 확률의 지지/저항',
          '명확한 레벨',
          '리스크 제한적'
        ],
        cons: [
          '제한적인 수익',
          '돌파 시 손실',
          '타이밍 중요'
        ]
      })
    }
    
    // 4. LVN 돌파 전략
    const nearestLVN = data.lvnLevels.reduce((nearest, lvn) => {
      const currentDist = Math.abs(currentPrice - lvn)
      const nearestDist = Math.abs(currentPrice - nearest)
      return currentDist < nearestDist ? lvn : nearest
    }, data.lvnLevels[0] || currentPrice)
    
    if (nearestLVN && Math.abs(currentPrice - nearestLVN) / currentPrice < 0.005) {
      const direction = currentPrice > nearestLVN ? 'long' : 'short'
      strategies.push({
        id: 'lvn-breakout',
        name: 'LVN 빠른 돌파',
        type: direction,
        confidence: 65,
        entry: currentPrice,
        target1: direction === 'long' ? 
          nearestLVN * 1.02 : 
          nearestLVN * 0.98,
        target2: direction === 'long' ? 
          nearestLVN * 1.035 : 
          nearestLVN * 0.965,
        stopLoss: direction === 'long' ? 
          nearestLVN * 0.995 : 
          nearestLVN * 1.005,
        riskReward: 2.5,
        description: `LVN 레벨 ${formatPrice(nearestLVN)} 빠른 통과 예상`,
        conditions: [
          'LVN 레벨 0.5% 이내',
          '모멘텀 지표 확인',
          '볼륨 급증 신호'
        ],
        pros: [
          '빠른 가격 움직임',
          '높은 R:R 비율',
          '명확한 돌파 신호'
        ],
        cons: [
          'False signal 위험',
          '빠른 손절 필요',
          '슬리피지 발생'
        ]
      })
    }
    
    return strategies.sort((a, b) => b.confidence - a.confidence)
  }, [data, currentPrice, marketState])
  
  // 포지션 계산기
  const calculatePosition = (strategy: Strategy) => {
    const stopDistance = Math.abs(strategy.entry - strategy.stopLoss) / strategy.entry
    const positionSize = riskAmount / (stopDistance * leverage)
    const target1Profit = Math.abs(strategy.target1 - strategy.entry) / strategy.entry * positionSize * leverage
    const target2Profit = Math.abs(strategy.target2 - strategy.entry) / strategy.entry * positionSize * leverage
    
    return {
      positionSize,
      requiredMargin: positionSize / leverage,
      potentialLoss: riskAmount,
      target1Profit,
      target2Profit,
      stopDistance: stopDistance * 100
    }
  }
  
  return (
    <div className="space-y-6">
      {/* 시장 상태 요약 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartBar className="text-purple-400" />
          현재 시장 상태 분석
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">가격 위치</p>
            <p className="text-xl font-bold text-white">
              {marketState.position === 'above_va' && 'Value Area 위'}
              {marketState.position === 'in_va' && 'Value Area 내부'}
              {marketState.position === 'below_va' && 'Value Area 아래'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              POC 대비 {marketState.priceVsPOC > 0 ? '+' : ''}{formatPercentage(marketState.priceVsPOC)}%
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">시장 트렌드</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">
                <span className={
                  marketState.trend === 'bullish' ? 'text-green-400' :
                  marketState.trend === 'bearish' ? 'text-red-400' :
                  'text-yellow-400'
                }>
                  {marketState.trend === 'bullish' && '상승세'}
                  {marketState.trend === 'bearish' && '하락세'}
                  {marketState.trend === 'sideways' && '횡보'}
                </span>
              </p>
              <span className={`text-sm px-2 py-1 rounded ${
                marketState.strength === 'strong' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {marketState.strength === 'strong' ? '강함' : '약함'}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">매수/매도 압력</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  style={{ width: `${marketState.buyPressure}%` }}
                />
              </div>
              <span className={`font-bold ${
                marketState.buyPressure > 55 ? 'text-green-400' : 
                marketState.buyPressure < 45 ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {formatPercentage(marketState.buyPressure)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 추천 전략 목록 */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaRocket className="text-purple-400" />
          추천 트레이딩 전략
        </h3>
        
        {strategies.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
            <FaExclamationTriangle className="text-yellow-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-300">
              현재 시장 상황에서 명확한 전략을 찾을 수 없습니다.
              더 명확한 시그널을 기다려주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strategies.map((strategy) => (
              <motion.div
                key={strategy.id}
                whileHover={{ scale: 1.02 }}
                className={`bg-gray-800/50 rounded-xl p-5 border cursor-pointer transition-all ${
                  selectedStrategy === strategy.id
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedStrategy(strategy.id === selectedStrategy ? null : strategy.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{strategy.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        strategy.type === 'long' ? 'bg-green-500/20 text-green-400' :
                        strategy.type === 'short' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {strategy.type === 'long' ? '롱' : strategy.type === 'short' ? '숏' : '중립'}
                      </span>
                      <span className="text-gray-400 text-sm">
                        R:R {strategy.riskReward}:1
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <FaTachometerAlt className={`text-sm ${
                        strategy.confidence >= 80 ? 'text-green-400' :
                        strategy.confidence >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`} />
                      <span className={`text-2xl font-bold ${
                        strategy.confidence >= 80 ? 'text-green-400' :
                        strategy.confidence >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {strategy.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">신뢰도</p>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-900/50 rounded p-2">
                    <p className="text-gray-400 text-xs">진입가</p>
                    <p className="text-white font-medium">${formatPrice(strategy.entry)}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-2">
                    <p className="text-gray-400 text-xs">손절가</p>
                    <p className="text-red-400 font-medium">${formatPrice(strategy.stopLoss)}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-2">
                    <p className="text-gray-400 text-xs">목표가 1</p>
                    <p className="text-green-400 font-medium">${formatPrice(strategy.target1)}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded p-2">
                    <p className="text-gray-400 text-xs">목표가 2</p>
                    <p className="text-green-400 font-medium">${formatPrice(strategy.target2)}</p>
                  </div>
                </div>
                
                {selectedStrategy === strategy.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-700 space-y-3"
                  >
                    <div>
                      <h5 className="font-medium text-white mb-2 flex items-center gap-2">
                        <FaCheckCircle className="text-green-400 text-sm" />
                        진입 조건
                      </h5>
                      <ul className="space-y-1">
                        {strategy.conditions.map((condition, i) => (
                          <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-gray-500 mt-0.5">•</span>
                            <span>{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h5 className="font-medium text-green-400 mb-2 text-sm">장점</h5>
                        <ul className="space-y-1">
                          {strategy.pros.map((pro, i) => (
                            <li key={i} className="text-gray-300 text-xs flex items-start gap-1">
                              <span className="text-green-400 mt-0.5">+</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-400 mb-2 text-sm">단점</h5>
                        <ul className="space-y-1">
                          {strategy.cons.map((con, i) => (
                            <li key={i} className="text-gray-300 text-xs flex items-start gap-1">
                              <span className="text-red-400 mt-0.5">-</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* 포지션 계산기 */}
      {selectedStrategy && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCalculator className="text-purple-400" />
            포지션 크기 계산기
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    리스크 금액 (USDT)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={riskAmount}
                      onChange={(e) => setRiskAmount(Number(e.target.value))}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
                      min="10"
                      step="100"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setRiskAmount(100)}
                        className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        $100
                      </button>
                      <button
                        onClick={() => setRiskAmount(1000)}
                        className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        $1k
                      </button>
                      <button
                        onClick={() => setRiskAmount(5000)}
                        className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        $5k
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    레버리지
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      min="1"
                      max="20"
                      step="1"
                      className="flex-1"
                    />
                    <span className="w-12 text-center font-bold text-purple-400">
                      {leverage}x
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1x</span>
                    <span>10x</span>
                    <span>20x</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              {(() => {
                const strategy = strategies.find(s => s.id === selectedStrategy)
                if (!strategy) return null
                
                const position = calculatePosition(strategy)
                
                return (
                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">포지션 크기</span>
                      <span className="text-xl font-bold text-white">
                        {formatVolume(position.positionSize)} {symbol.replace('USDT', '')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">필요 증거금</span>
                      <span className="font-medium text-yellow-400">
                        ${formatPrice(position.requiredMargin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">최대 손실</span>
                      <span className="font-medium text-red-400">
                        -${formatPrice(position.potentialLoss)} ({formatPercentage(position.stopDistance)}%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">목표 1 수익</span>
                      <span className="font-medium text-green-400">
                        +${formatPrice(position.target1Profit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">목표 2 수익</span>
                      <span className="font-medium text-green-400">
                        +${formatPrice(position.target2Profit)}
                      </span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-700">
                      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-3">
                        <p className="text-yellow-400 text-sm">
                          <FaExclamationTriangle className="inline mr-1" />
                          리스크 관리: 전체 자본의 1-2%만 리스크에 노출하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* 실행 가이드 */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-700/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLightbulb className="text-green-400" />
          전략 실행 가이드
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-sm">1</span>
              진입 전 확인
            </h4>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• 전체 시장 상황 체크</li>
              <li>• 뉴스/이벤트 확인</li>
              <li>• 리스크 계산 완료</li>
              <li>• 멘탈 상태 점검</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
              <span className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-sm">2</span>
              포지션 관리
            </h4>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• 분할 진입/청산</li>
              <li>• 손절 이동 금지</li>
              <li>• 목표가에서 일부 실현</li>
              <li>• 감정 배제 원칙</li>
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-sm">3</span>
              사후 분석
            </h4>
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>• 매매 일지 작성</li>
              <li>• 실수 분석/개선점</li>
              <li>• 전략 유효성 평가</li>
              <li>• 다음 기회 준비</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}