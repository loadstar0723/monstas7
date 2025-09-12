'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi'
import { 
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaInfoCircle, FaCrosshairs, FaShieldAlt, FaBolt,
  FaBrain, FaEye, FaTachometerAlt
} from 'react-icons/fa'
import { BiPulse, BiBarChart } from 'react-icons/bi'

// 색상 정의
const COLORS = {
  buy: '#10b981',
  buyLight: '#22c55e',
  sell: '#ef4444',
  sellLight: '#dc2626',
  neutral: '#8b5cf6',
  neutralLight: '#a855f7'
}

// CVD 개념 카드
export function CVDConceptCard() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <FaBrain className="w-6 h-6 text-purple-500" />
        <h3 className="text-xl font-bold text-white">CVD 이해하기</h3>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-900/50 rounded-lg">
          <h4 className="text-white font-semibold mb-2">CVD란?</h4>
          <p className="text-gray-400 text-sm">
            CVD (Cumulative Volume Delta)는 매수 거래량과 매도 거래량의 차이를 누적한 지표입니다. 
            시장의 실제 매수/매도 압력을 보여주며, 가격 움직임의 강도를 측정합니다.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
            <p className="text-green-400 font-semibold text-sm mb-1">양의 CVD</p>
            <p className="text-gray-400 text-xs">매수 압력 우세</p>
          </div>
          <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/30">
            <p className="text-red-400 font-semibold text-sm mb-1">음의 CVD</p>
            <p className="text-gray-400 text-xs">매도 압력 우세</p>
          </div>
        </div>
        
        <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
          <p className="text-purple-400 font-semibold text-sm mb-2">핵심 포인트</p>
          <ul className="space-y-1 text-gray-400 text-xs">
            <li>• CVD 상승 = 누적 매수 압력 증가</li>
            <li>• CVD 하락 = 누적 매도 압력 증가</li>
            <li>• 가격과 CVD 다이버전스 = 추세 전환 신호</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// 매수/매도 압력 게이지
export function BuySellPressureGauge({ buyPressure, sellPressure }: any) {
  const total = buyPressure + sellPressure
  const buyPercent = (buyPressure / total * 100).toFixed(1)
  const sellPercent = (sellPressure / total * 100).toFixed(1)
  const netPressure = buyPressure - sellPressure
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <FaTachometerAlt className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold text-white">시장 압력</h3>
      </div>
      
      {/* 압력 게이지 */}
      <div className="relative h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* 배경 호 */}
          <path
            d="M 20 80 A 60 60 0 0 1 180 80"
            fill="none"
            stroke="#374151"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* 매수 압력 호 */}
          <path
            d={`M 20 80 A 60 60 0 0 1 ${20 + (160 * buyPressure / total)} 80`}
            fill="none"
            stroke={COLORS.buy}
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* 중심 표시 */}
          <circle cx="100" cy="80" r="4" fill="white" />
          
          {/* 바늘 */}
          <line
            x1="100"
            y1="80"
            x2={100 + 55 * Math.cos(Math.PI - Math.PI * (buyPressure / total))}
            y2={80 - 55 * Math.sin(Math.PI - Math.PI * (buyPressure / total))}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center mt-4">
          <div className="text-center">
            <p className={`text-2xl font-bold ${netPressure > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netPressure > 0 ? buyPercent : sellPercent}%
            </p>
            <p className="text-gray-400 text-xs">
              {netPressure > 0 ? '매수 우세' : '매도 우세'}
            </p>
          </div>
        </div>
      </div>
      
      {/* 압력 바 */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-400">매수 압력</span>
            <span className="text-green-400">{buyPercent}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${buyPercent}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-400">매도 압력</span>
            <span className="text-red-400">{sellPercent}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sellPercent}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* 압력 강도 */}
      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">압력 강도</span>
          <div className="flex items-center gap-2">
            {Math.abs(netPressure) > 500000 ? (
              <>
                <FaBolt className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">강함</span>
              </>
            ) : Math.abs(netPressure) > 200000 ? (
              <>
                <BiPulse className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold">보통</span>
              </>
            ) : (
              <>
                <FaInfoCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 font-semibold">약함</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 추세 신호
export function TrendSignals({ cvdData }: any) {
  // 추세 신호 계산
  const signals = []
  
  // 최근 CVD 추세
  const recentTrend = cvdData.slice(-10)
  const cvdUp = recentTrend[recentTrend.length - 1].cvd > recentTrend[0].cvd
  const priceUp = recentTrend[recentTrend.length - 1].price > recentTrend[0].price
  
  // 신호 생성
  if (cvdUp && priceUp) {
    signals.push({ type: 'bullish', label: '강세 지속', icon: HiTrendingUp, color: 'text-green-400' })
  } else if (!cvdUp && !priceUp) {
    signals.push({ type: 'bearish', label: '약세 지속', icon: HiTrendingDown, color: 'text-red-400' })
  } else if (!priceUp && cvdUp) {
    signals.push({ type: 'bullish', label: '강세 다이버전스', icon: FaCheckCircle, color: 'text-green-400' })
  } else if (priceUp && !cvdUp) {
    signals.push({ type: 'bearish', label: '약세 다이버전스', icon: FaExclamationTriangle, color: 'text-red-400' })
  }
  
  // 델타 신호
  const recentDelta = cvdData[cvdData.length - 1].delta
  if (Math.abs(recentDelta) > 500000) {
    signals.push({
      type: recentDelta > 0 ? 'bullish' : 'bearish',
      label: recentDelta > 0 ? '강한 매수' : '강한 매도',
      icon: FaBolt,
      color: recentDelta > 0 ? 'text-green-400' : 'text-red-400'
    })
  }
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <FaEye className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-white">추세 신호</h3>
      </div>
      
      <div className="space-y-3">
        {signals.map((signal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border ${
              signal.type === 'bullish' 
                ? 'bg-green-900/20 border-green-700/30' 
                : 'bg-red-900/20 border-red-700/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <signal.icon className={`w-5 h-5 ${signal.color}`} />
              <div className="flex-1">
                <p className={`font-semibold ${signal.color}`}>{signal.label}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {signal.type === 'bullish' ? '매수 기회' : '매도 고려'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {signals.length === 0 && (
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-gray-400 text-center">현재 뚜렷한 신호 없음</p>
          </div>
        )}
      </div>
      
      {/* 신호 강도 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs mb-1">신뢰도</p>
          <p className="text-purple-400 font-bold">
            {signals.length > 0 ? `${Math.min(signals.length * 25, 100)}%` : '0%'}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs mb-1">강도</p>
          <p className={`font-bold ${
            signals.filter(s => s.type === 'bullish').length > 
            signals.filter(s => s.type === 'bearish').length 
              ? 'text-green-400' : 'text-red-400'
          }`}>
            {signals.length > 2 ? '강함' : signals.length > 0 ? '보통' : '약함'}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs mb-1">방향</p>
          <p className={`font-bold ${
            signals.filter(s => s.type === 'bullish').length > 
            signals.filter(s => s.type === 'bearish').length 
              ? 'text-green-400' : signals.filter(s => s.type === 'bearish').length > 0
              ? 'text-red-400' : 'text-gray-400'
          }`}>
            {signals.filter(s => s.type === 'bullish').length > 
             signals.filter(s => s.type === 'bearish').length 
              ? '상승' : signals.filter(s => s.type === 'bearish').length > 0
              ? '하락' : '횡보'}
          </p>
        </div>
      </div>
    </div>
  )
}

// 트레이딩 전략 카드
export function TradingStrategyCard({ currentCVD, currentDelta }: any) {
  // 전략 추천
  const strategies = []
  
  if (currentCVD > 0 && currentDelta > 0) {
    strategies.push({
      name: '추세 추종',
      type: 'long',
      confidence: 85,
      entry: '현재가 또는 풀백 시',
      stop: '최근 저점 -2%',
      target: '+5% ~ +10%',
      description: 'CVD와 델타 모두 양수로 상승 추세 지속'
    })
  } else if (currentCVD < 0 && currentDelta < 0) {
    strategies.push({
      name: '추세 추종',
      type: 'short',
      confidence: 85,
      entry: '현재가 또는 반등 시',
      stop: '최근 고점 +2%',
      target: '-5% ~ -10%',
      description: 'CVD와 델타 모두 음수로 하락 추세 지속'
    })
  } else if (currentCVD > 0 && currentDelta < 0) {
    strategies.push({
      name: '관망',
      type: 'neutral',
      confidence: 50,
      entry: '신호 대기',
      stop: 'N/A',
      target: 'N/A',
      description: '혼재된 신호로 방향성 불명확'
    })
  }
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <FaCrosshairs className="w-6 h-6 text-purple-500" />
        <h3 className="text-xl font-bold text-white">트레이딩 전략</h3>
      </div>
      
      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              strategy.type === 'long' 
                ? 'bg-green-900/20 border-green-700/30'
                : strategy.type === 'short'
                ? 'bg-red-900/20 border-red-700/30'
                : 'bg-gray-900/50 border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-bold ${
                strategy.type === 'long' 
                  ? 'text-green-400'
                  : strategy.type === 'short'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}>
                {strategy.name}
              </h4>
              <div className="flex items-center gap-2">
                <FaShieldAlt className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm">{strategy.confidence}% 신뢰도</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-3">{strategy.description}</p>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-900/50 rounded p-2">
                <p className="text-gray-500 mb-1">진입</p>
                <p className="text-white">{strategy.entry}</p>
              </div>
              <div className="bg-gray-900/50 rounded p-2">
                <p className="text-gray-500 mb-1">손절</p>
                <p className="text-red-400">{strategy.stop}</p>
              </div>
              <div className="bg-gray-900/50 rounded p-2">
                <p className="text-gray-500 mb-1">목표</p>
                <p className="text-green-400">{strategy.target}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* 리스크 경고 */}
        <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 font-semibold text-sm mb-1">리스크 관리</p>
              <p className="text-gray-400 text-xs">
                모든 거래에는 리스크가 있습니다. 포지션 크기를 적절히 조절하고, 
                반드시 손절선을 설정하세요. CVD는 보조 지표로 활용하시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// CVD 지표 카드
export function CVDIndicatorCard({ value, label, trend, description }: any) {
  const isPositive = value >= 0
  const trendIcon = trend === 'up' ? HiTrendingUp : trend === 'down' ? HiTrendingDown : BiPulse
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        {React.createElement(trendIcon, {
          className: `w-4 h-4 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`
        })}
      </div>
      
      <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      
      {description && (
        <p className="text-gray-500 text-xs mt-2">{description}</p>
      )}
    </motion.div>
  )
}

// CVD 히트맵 레전드
export function CVDHeatmapLegend() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
      <h4 className="text-white font-semibold mb-3">CVD 강도</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: COLORS.buyLight }} />
          <span className="text-gray-400 text-sm">매우 강한 매수</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: COLORS.buy }} />
          <span className="text-gray-400 text-sm">강한 매수</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-600" />
          <span className="text-gray-400 text-sm">중립</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: COLORS.sell }} />
          <span className="text-gray-400 text-sm">강한 매도</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: COLORS.sellLight }} />
          <span className="text-gray-400 text-sm">매우 강한 매도</span>
        </div>
      </div>
    </div>
  )
}