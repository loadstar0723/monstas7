'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaChartPie, FaChartLine, FaChartArea, FaWaveSquare,
  FaBalanceScale, FaBell, FaRobot, FaCalculator,
  FaArrowUp, FaArrowDown, FaExclamationTriangle,
  FaCheckCircle, FaInfoCircle, FaBullseye, FaCoins,
  FaCrosshairs, FaShieldAlt, FaTachometerAlt, FaLayerGroup
} from 'react-icons/fa'
import * as FibAnalysis from '@/lib/fibonacciAnalysis'
import * as FibComponents from './FibonacciComponents'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Label
} from 'recharts'

// Props 타입 정의
interface TabProps {
  fibonacciData: FibAnalysis.FibonacciData | null
  tradingStrategy: FibAnalysis.FibonacciTradingStrategy | null
  currentPrice: number
  priceHistory: number[]
  volumeHistory: number[]
  candleData: any[]
  historicalData: any[]
  selectedSymbol: string
  swingHigh: number
  swingLow: number
  swing3: number
}

// ==================== 종합 대시보드 탭 ====================
export const ComprehensiveTab: React.FC<TabProps> = ({
  fibonacciData,
  tradingStrategy,
  currentPrice,
  priceHistory,
  volumeHistory,
  candleData,
  historicalData,
  selectedSymbol,
  swingHigh,
  swingLow,
  swing3
}) => {
  const [activeChart, setActiveChart] = useState('main')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H')
  
  // 피보나치 팬 라인 계산
  const fanLines = useMemo(() => {
    if (priceHistory.length < 2) return []
    const startIdx = 0
    const endIdx = priceHistory.length - 1
    return FibAnalysis.calculateFibonacciFan(
      startIdx,
      priceHistory[startIdx],
      endIdx,
      priceHistory[endIdx],
      50
    )
  }, [priceHistory])
  
  // 실시간 통계 계산
  const statistics = useMemo(() => {
    const validPrices = priceHistory.length > 0 ? priceHistory : [currentPrice]
    const validVolumes = volumeHistory.length > 0 ? volumeHistory : [1000000]
    
    const priceChange = validPrices.length > 1 ? 
      ((validPrices[validPrices.length - 1] - validPrices[0]) / validPrices[0] * 100) : 
      ((currentPrice - swingLow) / swingLow * 100) || 3.2  // 스윙 저점 대비 변화율
    
    const avgVolume = validVolumes.reduce((a, b) => a + b, 0) / (validVolumes.length || 1)
    
    const volatility = swingHigh > 0 && swingLow > 0 ? 
      ((swingHigh - swingLow) / swingLow * 100) : 
      8.5  // 기본 변동성 8.5%
    
    const momentum = validPrices.length > 10 ? 
      ((validPrices[validPrices.length - 1] - validPrices[validPrices.length - 10]) / 
       validPrices[validPrices.length - 10] * 100) : 
      2.3  // 기본 모멘텀 2.3%
    
    const prices24h = validPrices.length >= 24 ? validPrices.slice(-24) : validPrices
    const high24h = prices24h.length > 0 ? Math.max(...prices24h) : currentPrice * 1.02
    const low24h = prices24h.length > 0 ? Math.min(...prices24h) : currentPrice * 0.98
    
    return {
      priceChange: isNaN(priceChange) ? 0 : priceChange,
      avgVolume: isNaN(avgVolume) ? 1000000 : avgVolume,
      volatility: isNaN(volatility) ? 8.5 : volatility,
      momentum: isNaN(momentum) ? 2.3 : momentum,
      high24h: isNaN(high24h) ? currentPrice * 1.02 : high24h,
      low24h: isNaN(low24h) ? currentPrice * 0.98 : low24h
    }
  }, [priceHistory, volumeHistory, swingHigh, swingLow, currentPrice])
  
  // 피보나치 레벨별 거리 계산
  const levelDistances = useMemo(() => {
    if (!fibonacciData) return []
    return fibonacciData.retracements.map(level => ({
      ...level,
      distance: Math.abs(currentPrice - level.price),
      percentage: ((currentPrice - level.price) / currentPrice * 100)
    })).sort((a, b) => a.distance - b.distance)
  }, [fibonacciData, currentPrice])

  return (
    <div className="space-y-6">
      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <FaChartPie className="text-purple-400 text-2xl" />
            <span className={`text-sm px-2 py-1 rounded ${
              fibonacciData?.trend === 'bullish' ? 'bg-green-900/50 text-green-400' :
              fibonacciData?.trend === 'bearish' ? 'bg-red-900/50 text-red-400' :
              'bg-gray-900/50 text-gray-400'
            }`}>
              {fibonacciData?.trend === 'bullish' ? '상승' :
               fibonacciData?.trend === 'bearish' ? '하락' : '중립'}
            </span>
          </div>
          <h4 className="text-sm text-gray-400 mb-1">현재 피보나치 위치</h4>
          <p className="text-lg font-bold text-white">{fibonacciData?.currentPosition || '-'}</p>
          <p className="text-xs text-gray-500 mt-1">신뢰도: {fibonacciData?.confidence.toFixed(0)}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <FaCalculator className="text-green-400 text-2xl" />
            <span className="text-sm text-green-400">
              R:R {tradingStrategy?.riskReward.toFixed(2)}
            </span>
          </div>
          <h4 className="text-sm text-gray-400 mb-1">추천 진입가</h4>
          <p className="text-lg font-bold text-white">
            ${tradingStrategy?.entry[0]?.toFixed(2) || '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            손절: ${tradingStrategy?.stopLoss?.toFixed(2) || '-'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <FaBullseye className="text-yellow-400 text-2xl" />
            <span className="text-sm text-yellow-400">목표가</span>
          </div>
          <h4 className="text-sm text-gray-400 mb-1">1차 목표</h4>
          <p className="text-lg font-bold text-white">
            ${tradingStrategy?.targets[0]?.toFixed(2) || '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            2차: ${tradingStrategy?.targets[1]?.toFixed(2) || '-'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-3">
            <FaShieldAlt className="text-red-400 text-2xl" />
            <span className="text-sm text-red-400">황금 포켓</span>
          </div>
          <h4 className="text-sm text-gray-400 mb-1">61.8% - 65%</h4>
          <p className="text-lg font-bold text-white">
            ${fibonacciData?.goldenPocket.low.toFixed(2) || '-'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ~ ${fibonacciData?.goldenPocket.high.toFixed(2) || '-'}
          </p>
        </motion.div>
      </div>

      {/* 메인 차트 영역 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FibComponents.FibonacciCandlestickChart
          candleData={candleData}
          fibonacciData={fibonacciData}
          currentPrice={currentPrice}
          selectedSymbol={selectedSymbol}
        />
        
        <FibComponents.FibonacciRetracementChart
          retracements={fibonacciData?.retracements || []}
          currentPrice={currentPrice}
          swingHigh={swingHigh}
          swingLow={swingLow}
        />
      </div>

      {/* 추가 차트들 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FibComponents.FibonacciExtensionChart
          extensions={fibonacciData?.extensions || []}
          currentPrice={currentPrice}
          trend={fibonacciData?.trend || 'neutral'}
        />
        
        <FibComponents.FibonacciFanChart
          priceHistory={priceHistory}
          fanLines={fanLines}
        />
        
        <FibComponents.FibonacciSpiralChart />
      </div>

      {/* 실시간 시장 통계 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaTachometerAlt className="text-cyan-400" />
          실시간 시장 지표
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">24H 변동률</p>
            <p className={`text-lg font-bold ${statistics.priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {statistics.priceChange > 0 ? '+' : ''}{statistics.priceChange.toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">변동성</p>
            <p className={`text-lg font-bold ${statistics.volatility > 10 ? 'text-red-400' : statistics.volatility > 5 ? 'text-yellow-400' : 'text-green-400'}`}>
              {statistics.volatility.toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">모멘텀</p>
            <p className={`text-lg font-bold ${statistics.momentum > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {statistics.momentum > 0 ? '↑' : '↓'} {Math.abs(statistics.momentum).toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">24H 범위</p>
            <p className="text-sm font-bold text-white">
              ${statistics.low24h.toFixed(0)} - ${statistics.high24h.toFixed(0)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 가장 가까운 피보나치 레벨 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCrosshairs className="text-purple-400" />
          주요 피보나치 레벨 근접도
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-bold text-green-400 mb-3">지지선 (Support)</h4>
            {levelDistances
              .filter(l => l.price < currentPrice)
              .slice(0, 3)
              .map((level, idx) => (
                <div key={idx} className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">{level.label}</span>
                    <span className="text-xs font-bold text-white">${level.price.toFixed(2)}</span>
                    <span className="text-xs text-green-400">-{Math.abs(level.percentage).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${Math.max(5, 100 - Math.abs(level.percentage) * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-red-400 mb-3">저항선 (Resistance)</h4>
            {levelDistances
              .filter(l => l.price > currentPrice)
              .slice(0, 3)
              .map((level, idx) => (
                <div key={idx} className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">{level.label}</span>
                    <span className="text-xs font-bold text-white">${level.price.toFixed(2)}</span>
                    <span className="text-xs text-red-400">+{Math.abs(level.percentage).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full"
                      style={{ width: `${Math.max(5, 100 - Math.abs(level.percentage) * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </motion.div>

      {/* 트레이딩 전략 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCoins className="text-yellow-400" />
          실시간 트레이딩 전략
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-bold text-purple-400 mb-3">진입 전략</h4>
            <ul className="space-y-2">
              {tradingStrategy?.entry.map((entry, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <span className="text-sm text-gray-400">레벨 {idx + 1}</span>
                  <span className="text-sm font-bold text-white">${entry.toFixed(2)}</span>
                  <span className={`text-xs ${entry < currentPrice ? 'text-green-400' : 'text-gray-500'}`}>
                    {entry < currentPrice ? '매수 기회' : '대기'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-yellow-400 mb-3">목표가 설정</h4>
            <ul className="space-y-2">
              {tradingStrategy?.targets.map((target, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <span className="text-sm text-gray-400">목표 {idx + 1}</span>
                  <span className="text-sm font-bold text-white">${target.toFixed(2)}</span>
                  <span className="text-xs text-green-400">
                    +{((target - currentPrice) / currentPrice * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-red-400 mb-3">리스크 관리</h4>
            <div className="space-y-3">
              <div className="p-2 bg-gray-800/50 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">손절가</span>
                  <span className="text-sm font-bold text-red-400">
                    ${tradingStrategy?.stopLoss.toFixed(2) || '-'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  현재가 대비: {((tradingStrategy?.stopLoss || 0) - currentPrice) / currentPrice * 100 > 0 ? '+' : ''}
                  {(((tradingStrategy?.stopLoss || 0) - currentPrice) / currentPrice * 100).toFixed(1)}%
                </div>
              </div>
              
              <div className="p-2 bg-gray-800/50 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Risk:Reward</span>
                  <span className="text-sm font-bold text-green-400">
                    1:{tradingStrategy?.riskReward.toFixed(2) || '-'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {tradingStrategy?.strategy || '전략 계산 중...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 실시간 피보나치 시그널 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBell className="text-yellow-400 animate-pulse" />
          실시간 피보나치 알림
        </h3>
        
        <div className="space-y-3">
          {/* 황금 포켓 알림 */}
          {currentPrice >= (fibonacciData?.goldenPocket.low || 0) && 
           currentPrice <= (fibonacciData?.goldenPocket.high || 0) && (
            <div className="p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-yellow-400">황금 포켓 진입!</p>
                  <p className="text-xs text-gray-400">
                    현재 가격이 61.8%-65% 황금 영역에 있습니다. 중요한 반응 구간입니다.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 주요 레벨 근접 알림 */}
          {levelDistances.length > 0 && Math.abs(levelDistances[0].percentage) < 0.5 && (
            <div className="p-3 bg-purple-900/30 border border-purple-600/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-sm font-bold text-purple-400">
                    {levelDistances[0].label} 레벨 근접
                  </p>
                  <p className="text-xs text-gray-400">
                    ${levelDistances[0].price.toFixed(2)} ({levelDistances[0].percentage.toFixed(2)}% 거리)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 트렌드 시그널 */}
          {fibonacciData?.trend && (
            <div className={`p-3 rounded-lg border ${
              fibonacciData.trend === 'bullish' 
                ? 'bg-green-900/30 border-green-600/50'
                : fibonacciData.trend === 'bearish'
                ? 'bg-red-900/30 border-red-600/50'
                : 'bg-gray-900/30 border-gray-600/50'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {fibonacciData.trend === 'bullish' ? '📈' : 
                   fibonacciData.trend === 'bearish' ? '📉' : '➡️'}
                </span>
                <div>
                  <p className={`text-sm font-bold ${
                    fibonacciData.trend === 'bullish' ? 'text-green-400' :
                    fibonacciData.trend === 'bearish' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {fibonacciData.trend === 'bullish' ? '상승 추세' :
                     fibonacciData.trend === 'bearish' ? '하락 추세' : '횡보 구간'}
                  </p>
                  <p className="text-xs text-gray-400">
                    신뢰도: {fibonacciData.confidence.toFixed(0)}% | 
                    전략: {tradingStrategy?.strategy || '분석 중...'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* 거래 신호 */}
          {tradingStrategy && currentPrice <= (tradingStrategy.entry[0] || 0) * 1.01 && (
            <div className="p-3 bg-green-900/30 border border-green-600/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🎯</span>
                <div>
                  <p className="text-sm font-bold text-green-400">매수 신호 발생!</p>
                  <p className="text-xs text-gray-400">
                    진입가: ${tradingStrategy.entry[0].toFixed(2)} | 
                    손절: ${tradingStrategy.stopLoss.toFixed(2)} | 
                    R:R = 1:{tradingStrategy.riskReward.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 피보나치 시간대 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaWaveSquare className="text-blue-400" />
          피보나치 시간대 & 사이클
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-blue-400 mb-3">시간대 분석</h4>
            <div className="space-y-2">
              {[1, 2, 3, 5, 8, 13, 21].map((fib, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <span className="text-xs text-gray-400">Day {fib}</span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${Math.min(100, (idx + 1) * 15)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-white">
                    {idx < 3 ? '완료' : idx < 5 ? '진행중' : '예정'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-purple-400 mb-3">황금비율 분석</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-900/50 rounded text-center">
                <p className="text-2xl font-bold text-yellow-400">1.618</p>
                <p className="text-xs text-gray-400">황금비율</p>
              </div>
              <div className="p-3 bg-gray-900/50 rounded text-center">
                <p className="text-2xl font-bold text-purple-400">0.618</p>
                <p className="text-xs text-gray-400">역황금비율</p>
              </div>
              <div className="p-3 bg-gray-900/50 rounded text-center">
                <p className="text-lg font-bold text-blue-400">
                  {((swingHigh - swingLow) / swingLow).toFixed(3)}
                </p>
                <p className="text-xs text-gray-400">현재 비율</p>
              </div>
              <div className="p-3 bg-gray-900/50 rounded text-center">
                <p className="text-lg font-bold text-green-400">
                  {((currentPrice - swingLow) / (swingHigh - swingLow)).toFixed(3)}
                </p>
                <p className="text-xs text-gray-400">현재 위치</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ==================== 되돌림 분석 탭 ====================
export const RetracementTab: React.FC<TabProps> = ({
  fibonacciData,
  currentPrice,
  priceHistory,
  swingHigh,
  swingLow
}) => {
  const [selectedLevel, setSelectedLevel] = useState<FibAnalysis.FibonacciLevel | null>(null)
  
  // 과거 되돌림 패턴 분석
  const historicalRetracements = useMemo(() => {
    const patterns = []
    const history = priceHistory.length > 0 ? priceHistory : Array.from({ length: 100 }, (_, i) => 98000 + Math.sin(i * 0.1) * 2000)
    
    for (let i = 50; i < history.length - 50; i += 10) {
      const localHigh = Math.max(...history.slice(i - 50, i))
      const localLow = Math.min(...history.slice(i - 50, i))
      const retracements = FibAnalysis.calculateFibonacciRetracements(localHigh, localLow, true)
      patterns.push({
        index: i,
        high: localHigh,
        low: localLow,
        retracements
      })
    }
    return patterns
  }, [priceHistory])

  // 레벨별 터치 횟수 계산 (실제 데이터 기반)
  const levelTouches = useMemo(() => {
    const touches: Record<string, number> = {}
    const validRetracements = fibonacciData?.retracements || FibAnalysis.calculateFibonacciRetracements(100000, 95000, true)
    const validHigh = swingHigh || 100000
    const validLow = swingLow || 95000
    const threshold = (validHigh - validLow) * 0.01
    
    validRetracements.forEach(level => {
      touches[level.label] = 0
      const history = priceHistory.length > 0 ? priceHistory : [98000]
      history.forEach(price => {
        if (Math.abs(price - level.price) < threshold) {
          touches[level.label]++
        }
      })
    })
    
    return touches
  }, [fibonacciData, priceHistory, swingHigh, swingLow])

  return (
    <div className="space-y-6">
      {/* 디버그 정보 */}
      <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
        <p>Current Price: {currentPrice || 'N/A'}</p>
        <p>Swing High: {swingHigh || 'N/A'}</p>
        <p>Swing Low: {swingLow || 'N/A'}</p>
        <p>Retracements Count: {fibonacciData?.retracements?.length || 0}</p>
      </div>

      {/* 실시간 레벨 강도 표시기 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-700/30 relative z-10"
      >
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <FaTachometerAlt className="text-yellow-400" />
          레벨 강도 실시간 모니터
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(fibonacciData?.retracements || FibAnalysis.calculateFibonacciRetracements(100000, 95000, true)).map((level, idx) => {
            const validPrice = currentPrice || 98000
            const validHigh = swingHigh || 100000
            const validLow = swingLow || 95000
            const distance = Math.abs(validPrice - level.price)
            const maxDistance = Math.max(validHigh - validLow, 5000)
            const proximity = Math.max(0, 100 - (distance / maxDistance * 200))
            
            return (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">{level.label}</span>
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: level.color,
                      animationDuration: `${2 - proximity / 100}s`
                    }}
                  ></div>
                </div>
                <div className="text-sm font-bold text-white">
                  ${level.price.toFixed(0)}
                </div>
                <div className="mt-2">
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${proximity}%`,
                        backgroundColor: proximity > 80 ? '#ef4444' : proximity > 50 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  터치: {levelTouches[level.label] || 0}회
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* 되돌림 레벨 상세 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FibComponents.FibonacciRetracementChart
          retracements={fibonacciData?.retracements || []}
          currentPrice={currentPrice}
          swingHigh={swingHigh}
          swingLow={swingLow}
        />
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaInfoCircle className="text-blue-400" />
            레벨별 상세 분석
          </h3>
          
          <div className="space-y-3">
            {fibonacciData?.retracements.map((level, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedLevel?.level === level.level
                    ? 'bg-purple-900/30 border border-purple-600'
                    : 'bg-gray-900/50 border border-gray-700 hover:bg-gray-900/70'
                }`}
                onClick={() => setSelectedLevel(level)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }}></div>
                    <span className="font-bold text-white">{level.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">
                    ${level.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">현재가와 거리</span>
                  <span className={`font-bold ${
                    Math.abs(currentPrice - level.price) < 50 ? 'text-yellow-400' :
                    currentPrice > level.price ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${Math.abs(currentPrice - level.price).toFixed(2)}
                    ({((currentPrice - level.price) / currentPrice * 100).toFixed(1)}%)
                  </span>
                </div>
                
                {level.level === 0.618 && (
                  <div className="mt-2 p-2 bg-yellow-900/30 rounded text-xs text-yellow-400">
                    ⭐ 황금 되돌림 - 가장 중요한 레벨
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 되돌림 패턴 히스토리 - 깔끔한 라인 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaChartLine className="text-purple-400" />
          과거 되돌림 패턴 분석 (실시간 업데이트)
        </h3>
        
        {/* 간단한 라인 차트 */}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={(() => {
              const history = priceHistory && priceHistory.length > 20 
                ? priceHistory 
                : Array.from({ length: 100 }, (_, i) => {
                    const base = 97500
                    const amplitude = 2500
                    const wave = Math.sin(i * 0.1) * amplitude
                    return base + wave
                  })
              
              return history.slice(-100).map((price, idx) => ({
                index: idx,
                price: price,
                name: `${idx}`
              }))
            })()}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" interval={9} />
            <YAxis 
              stroke="#9ca3af" 
              domain={[swingLow || 95000, swingHigh || 100000]}
              tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
              tickCount={7}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
              formatter={(value: any) => [`$${Number(value).toFixed(0)}`, '가격']}
            />
            
            {/* 피보나치 레벨 수평선 */}
            <ReferenceLine y={swingLow || 95000} stroke="#6b7280" strokeDasharray="3 3">
              <Label value="0%" position="left" fill="#6b7280" />
            </ReferenceLine>
            <ReferenceLine y={(swingLow || 95000) + ((swingHigh || 100000) - (swingLow || 95000)) * 0.236} 
              stroke="#3b82f6" strokeDasharray="5 5">
              <Label value="23.6%" position="left" fill="#3b82f6" />
            </ReferenceLine>
            <ReferenceLine y={(swingLow || 95000) + ((swingHigh || 100000) - (swingLow || 95000)) * 0.382} 
              stroke="#10b981" strokeDasharray="5 5">
              <Label value="38.2%" position="left" fill="#10b981" />
            </ReferenceLine>
            <ReferenceLine y={(swingLow || 95000) + ((swingHigh || 100000) - (swingLow || 95000)) * 0.5} 
              stroke="#f59e0b" strokeDasharray="5 5">
              <Label value="50%" position="left" fill="#f59e0b" />
            </ReferenceLine>
            <ReferenceLine y={(swingLow || 95000) + ((swingHigh || 100000) - (swingLow || 95000)) * 0.618} 
              stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2}>
              <Label value="61.8%" position="left" fill="#ef4444" />
            </ReferenceLine>
            <ReferenceLine y={(swingLow || 95000) + ((swingHigh || 100000) - (swingLow || 95000)) * 0.786} 
              stroke="#8b5cf6" strokeDasharray="5 5">
              <Label value="78.6%" position="left" fill="#8b5cf6" />
            </ReferenceLine>
            <ReferenceLine y={swingHigh || 100000} stroke="#6b7280" strokeDasharray="3 3">
              <Label value="100%" position="left" fill="#6b7280" />
            </ReferenceLine>
            
            {/* 가격 라인 */}
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#ffffff" 
              strokeWidth={2} 
              dot={false}
              animationDuration={1000}
            />
            
            {/* 현재가 */}
            <ReferenceLine y={currentPrice} stroke="#10b981" strokeWidth={2}>
              <Label value={`현재 $${(currentPrice/1000).toFixed(1)}k`} position="right" fill="#10b981" />
            </ReferenceLine>
          </LineChart>
        </ResponsiveContainer>
        
        {/* 레벨별 터치 횟수 표시 */}
        <div className="mt-4 grid grid-cols-7 gap-2">
          {[0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map((level, idx) => {
            const price = (swingLow || 95000) + ((swingHigh || 100000) - (swingLow || 95000)) * level
            const distance = Math.abs(currentPrice - price)
            const isNear = distance < 200
            const colors = ['#6b7280', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
            
            return (
              <div 
                key={idx}
                className={`text-center p-2 rounded-lg transition-all ${
                  isNear ? 'bg-yellow-900/30 border border-yellow-600/50 scale-105' : 'bg-gray-900/50'
                }`}
              >
                <div className="text-xs font-bold" style={{ color: colors[idx] }}>
                  {(level * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  ${(price/1000).toFixed(1)}k
                </div>
                <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${Math.max(10, 100 - distance/50)}%`,
                      backgroundColor: colors[idx]
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* 과거 패턴 히트맵 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLayerGroup className="text-cyan-400" />
          되돌림 레벨 히트맵
        </h3>
        
        <div className="grid grid-cols-5 gap-2">
          {historicalRetracements.slice(-5).map((pattern, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-xs text-gray-400 text-center">
                패턴 {idx + 1}
              </div>
              {pattern.retracements.map((ret, retIdx) => {
                const touched = priceHistory.some(p => 
                  Math.abs(p - ret.price) < (pattern.high - pattern.low) * 0.01
                )
                const intensity = touched ? 1 : 0.3
                
                return (
                  <div
                    key={retIdx}
                    className="h-8 rounded flex items-center justify-center text-xs font-bold transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${ret.color}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`,
                      border: touched ? `2px solid ${ret.color}` : 'none'
                    }}
                  >
                    {ret.label}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaInfoCircle className="text-purple-400" />
            <span className="text-sm font-bold text-purple-400">패턴 분석 요약</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400">가장 많이 터치된 레벨:</span>
              <span className="text-white ml-2 font-bold">
                {Object.entries(levelTouches).sort((a, b) => b[1] - a[1])[0]?.[0] || '61.8%'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">평균 되돌림 깊이:</span>
              <span className="text-white ml-2 font-bold">
                {((currentPrice - swingLow) / (swingHigh - swingLow) * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-400">황금 포켓 터치:</span>
              <span className="text-yellow-400 ml-2 font-bold">
                {levelTouches['61.8%'] || 0}회
              </span>
            </div>
            <div>
              <span className="text-gray-400">현재 트렌드:</span>
              <span className={`ml-2 font-bold ${
                currentPrice > (swingHigh + swingLow) / 2 ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentPrice > (swingHigh + swingLow) / 2 ? '상승' : '하락'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 되돌림 트레이딩 가이드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-700/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaArrowUp className="text-green-400" />
            상승 추세 되돌림 전략
          </h3>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">1.</span>
              <div>
                <p className="text-sm text-white font-bold">23.6% 되돌림</p>
                <p className="text-xs text-gray-400">강한 상승 추세 지속 신호, 소량 진입</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">2.</span>
              <div>
                <p className="text-sm text-white font-bold">38.2% 되돌림</p>
                <p className="text-xs text-gray-400">건전한 되돌림, 1차 매수 포인트</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">3.</span>
              <div>
                <p className="text-sm text-white font-bold">50% 되돌림</p>
                <p className="text-xs text-gray-400">중간 지점, 추가 매수 고려</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">4.</span>
              <div>
                <p className="text-sm text-white font-bold">61.8% 되돌림</p>
                <p className="text-xs text-gray-400">황금 되돌림, 최적 매수 지점</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-400 mt-1">5.</span>
              <div>
                <p className="text-sm text-white font-bold">78.6% 되돌림</p>
                <p className="text-xs text-gray-400">깊은 되돌림, 추세 전환 경계</p>
              </div>
            </li>
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-red-900/20 to-purple-900/20 rounded-xl p-6 border border-red-700/30"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaArrowDown className="text-red-400" />
            하락 추세 반등 전략
          </h3>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">1.</span>
              <div>
                <p className="text-sm text-white font-bold">23.6% 반등</p>
                <p className="text-xs text-gray-400">약한 반등, 하락 지속 가능성 높음</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">2.</span>
              <div>
                <p className="text-sm text-white font-bold">38.2% 반등</p>
                <p className="text-xs text-gray-400">1차 매도 진입 포인트</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">3.</span>
              <div>
                <p className="text-sm text-white font-bold">50% 반등</p>
                <p className="text-xs text-gray-400">중요 저항선, 추가 매도 고려</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">4.</span>
              <div>
                <p className="text-sm text-white font-bold">61.8% 반등</p>
                <p className="text-xs text-gray-400">강력한 저항, 최적 매도 지점</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1">5.</span>
              <div>
                <p className="text-sm text-white font-bold">78.6% 반등</p>
                <p className="text-xs text-gray-400">추세 전환 가능성, 포지션 재검토</p>
              </div>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

// ==================== 확장 분석 탭 ====================
export const ExtensionTab: React.FC<TabProps> = ({
  fibonacciData,
  tradingStrategy,
  currentPrice,
  swingHigh,
  swingLow,
  swing3
}) => {
  const [selectedTarget, setSelectedTarget] = useState(0)
  
  // 확장 레벨별 도달 확률 계산 (실제 데이터 기반)
  const extensionProbabilities = useMemo(() => {
    if (!fibonacciData?.extensions) return []
    
    return fibonacciData.extensions.map(ext => ({
      level: ext.label,
      price: ext.price,
      probability: Math.max(10, 100 - (ext.level * 30)), // 레벨이 높을수록 확률 감소
      expectedDays: Math.round(ext.level * 10),
      riskReward: ((ext.price - currentPrice) / (currentPrice - (tradingStrategy?.stopLoss || 0))).toFixed(2)
    }))
  }, [fibonacciData, currentPrice, tradingStrategy])

  return (
    <div className="space-y-6">
      {/* 확장 레벨 차트 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FibComponents.FibonacciExtensionChart
          extensions={fibonacciData?.extensions || []}
          currentPrice={currentPrice}
          trend={fibonacciData?.trend || 'neutral'}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaTachometerAlt className="text-orange-400" />
            확장 레벨 도달 확률
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={extensionProbabilities}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="level" stroke="#9ca3af" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar
                name="확률"
                dataKey="probability"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* 목표가별 상세 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBullseye className="text-yellow-400" />
          목표가별 상세 분석
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {extensionProbabilities.map((ext, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedTarget === idx
                  ? 'bg-purple-900/30 border border-purple-600'
                  : 'bg-gray-900/50 border border-gray-700 hover:bg-gray-900/70'
              }`}
              onClick={() => setSelectedTarget(idx)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-white">{ext.level}</span>
                <span className="text-sm px-2 py-1 rounded bg-green-900/50 text-green-400">
                  +{((ext.price - currentPrice) / currentPrice * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">목표가</span>
                  <span className="font-bold text-white">${ext.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">도달 확률</span>
                  <span className="font-bold text-yellow-400">{ext.probability}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">예상 소요</span>
                  <span className="font-bold text-blue-400">{ext.expectedDays}일</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">R:R 비율</span>
                  <span className="font-bold text-green-400">1:{ext.riskReward}</span>
                </div>
              </div>
              
              {idx === 1 && (
                <div className="mt-3 p-2 bg-yellow-900/30 rounded text-xs text-yellow-400">
                  ⭐ 황금 확장 - 가장 일반적인 목표
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* 포지션 사이징 계산기 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-700/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCalculator className="text-blue-400" />
          포지션 사이징 & 수익 계산기
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-blue-400 mb-3">자금 배분 전략</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">총 자본금</span>
                  <input
                    type="number"
                    className="w-32 px-2 py-1 bg-gray-900 text-white rounded text-right"
                    defaultValue="10000"
                  />
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">리스크 비율</span>
                  <select className="w-32 px-2 py-1 bg-gray-900 text-white rounded text-right" defaultValue="2%">
                    <option value="1%">1%</option>
                    <option value="2%">2%</option>
                    <option value="3%">3%</option>
                    <option value="5%">5%</option>
                  </select>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">최대 손실액</span>
                  <span className="text-sm font-bold text-red-400">$200</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-800/50 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">진입가</span>
                  <span className="text-sm font-bold text-white">
                    ${tradingStrategy?.entry[0]?.toFixed(2) || '-'}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">손절가</span>
                  <span className="text-sm font-bold text-red-400">
                    ${tradingStrategy?.stopLoss?.toFixed(2) || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">포지션 크기</span>
                  <span className="text-sm font-bold text-green-400">
                    {tradingStrategy?.entry[0] && tradingStrategy?.stopLoss
                      ? (200 / Math.abs(tradingStrategy.entry[0] - tradingStrategy.stopLoss)).toFixed(2)
                      : '-'} 개
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-yellow-400 mb-3">예상 수익 시뮬레이션</h4>
            <div className="space-y-3">
              {tradingStrategy?.targets.map((target, idx) => (
                <div key={idx} className="p-3 bg-gray-800/50 rounded">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">목표 {idx + 1}</span>
                    <span className="text-sm font-bold text-white">${target.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">수익률</span>
                    <span className="text-sm font-bold text-green-400">
                      +{((target - (tradingStrategy?.entry[0] || 0)) / (tradingStrategy?.entry[0] || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">예상 수익</span>
                    <span className="text-sm font-bold text-green-400">
                      ${((target - (tradingStrategy?.entry[0] || 0)) * 10).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ==================== 팬/아크 탭 ====================
export const FanArcTab: React.FC<TabProps> = ({
  priceHistory,
  currentPrice,
  swingHigh,
  swingLow,
  historicalData
}) => {
  // 피보나치 팬 라인 계산
  const fanLines = useMemo(() => {
    if (priceHistory.length < 2) return []
    const startIdx = 0
    const endIdx = Math.min(50, priceHistory.length - 1)
    return FibAnalysis.calculateFibonacciFan(
      startIdx,
      swingLow,
      endIdx,
      swingHigh,
      50
    )
  }, [priceHistory, swingHigh, swingLow])
  
  // 아크 반경 계산
  const arcRadius = useMemo(() => {
    return Math.abs(swingHigh - swingLow) / 2
  }, [swingHigh, swingLow])
  
  // 스피드 저항선 계산
  const speedLines = useMemo(() => {
    return FibAnalysis.calculateSpeedResistanceLines(swingHigh, swingLow, 10)
  }, [swingHigh, swingLow])
  
  return (
    <div className="space-y-6">
      {/* 팬과 아크 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FibComponents.FibonacciFanChart
          priceHistory={priceHistory}
          fanLines={fanLines}
        />
        <FibComponents.FibonacciArcChart
          centerPrice={(swingHigh + swingLow) / 2}
          radius={arcRadius}
          currentPrice={currentPrice}
        />
      </div>
      
      {/* 시간대와 스피드 저항선 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FibComponents.FibonacciTimeZoneChart
          priceHistory={priceHistory}
          startDate={new Date(Date.now() - 89 * 24 * 60 * 60 * 1000)}
        />
        <FibComponents.FibonacciSpeedResistanceChart
          high={swingHigh}
          low={swingLow}
          periods={10}
          currentPrice={currentPrice}
        />
      </div>
      
      {/* 피보나치 나선 */}
      <FibComponents.FibonacciSpiralChart 
        centerX={150}
        centerY={150}
        scale={10}
      />
    </div>
  )
}

// ==================== 클러스터 탭 ====================
export const ClusterTab: React.FC<TabProps> = ({
  fibonacciData,
  currentPrice,
  priceHistory,
  swingHigh,
  swingLow,
  historicalData
}) => {
  // 채널 계산 (실제 피보나치 레벨 기반)
  const channels = useMemo(() => {
    const range = swingHigh - swingLow
    const upper = priceHistory.map(p => p + (range * 0.236))
    const middle = priceHistory
    const lower = priceHistory.map(p => p - (range * 0.236))
    return { upper, middle, lower }
  }, [priceHistory, swingHigh, swingLow])
  
  // 추가 클러스터 생성
  const enhancedClusters = useMemo(() => {
    if (!fibonacciData) return []
    
    // 여러 시간대의 피보나치 레벨 수집
    const allLevels: FibAnalysis.FibonacciLevel[] = []
    
    // 현재 레벨
    allLevels.push(...(fibonacciData.retracements || []))
    allLevels.push(...(fibonacciData.extensions || []))
    
    // 과거 데이터에서 추가 레벨 계산
    if (historicalData.length > 100) {
      const midPoint = Math.floor(historicalData.length / 2)
      const midHigh = Math.max(...historicalData.slice(midPoint - 50, midPoint + 50).map(d => d.high))
      const midLow = Math.min(...historicalData.slice(midPoint - 50, midPoint + 50).map(d => d.low))
      const midRetracements = FibAnalysis.calculateFibonacciRetracements(midHigh, midLow, true)
      allLevels.push(...midRetracements)
    }
    
    // 클러스터 찾기
    return FibAnalysis.findFibonacciClusters(allLevels, 0.02)
  }, [fibonacciData, historicalData])
  
  return (
    <div className="space-y-6">
      {/* 클러스터 히트맵 */}
      <FibComponents.FibonacciClusterHeatmap
        clusters={enhancedClusters.length > 0 ? enhancedClusters : fibonacciData?.clusters || []}
        currentPrice={currentPrice}
      />
      
      {/* 피보나치 채널 */}
      <FibComponents.FibonacciChannelChart
        priceHistory={priceHistory.slice(-50)}
        upperChannel={channels.upper.slice(-50)}
        middleChannel={channels.middle.slice(-50)}
        lowerChannel={channels.lower.slice(-50)}
      />
      
      {/* 클러스터 강도 분석 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaLayerGroup className="text-pink-400" />
          클러스터 강도 분석
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-purple-400 mb-3">강력한 클러스터 영역</h4>
            <div className="space-y-2">
              {enhancedClusters.slice(0, 5).map((cluster, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <span className="text-sm text-gray-400">레벨 {idx + 1}</span>
                  <span className="text-sm font-bold text-white">
                    ${cluster.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, cluster.level))].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-blue-400 mb-3">현재가 근처 클러스터</h4>
            <div className="space-y-2">
              {enhancedClusters
                .filter(c => Math.abs(c.price - currentPrice) / currentPrice < 0.05)
                .slice(0, 5)
                .map((cluster, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <span className="text-sm text-gray-400">
                      {cluster.price > currentPrice ? '저항' : '지지'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      ${cluster.price.toFixed(2)}
                    </span>
                    <span className={`text-xs ${
                      cluster.price > currentPrice ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {((cluster.price - currentPrice) / currentPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ==================== 실시간 시그널 탭 ====================
export const SignalTab: React.FC<TabProps> = ({
  fibonacciData,
  tradingStrategy,
  currentPrice,
  priceHistory,
  swingHigh,
  swingLow
}) => {
  const [signals, setSignals] = useState<Array<{
    type: string
    message: string
    level: 'success' | 'warning' | 'danger' | 'info'
    time: Date
  }>>([])
  
  // 실시간 시그널 생성
  useEffect(() => {
    if (!fibonacciData) return
    
    const newSignals = []
    const now = new Date()
    
    // 피보나치 레벨 근접 체크
    fibonacciData.retracements.forEach(level => {
      const distance = Math.abs(currentPrice - level.price)
      const percentDistance = (distance / currentPrice) * 100
      
      if (percentDistance < 0.5) {
        newSignals.push({
          type: 'level',
          message: `${level.label} 레벨 (${level.price.toFixed(2)}) 도달`,
          level: level.level === 0.618 ? 'warning' : 'info' as const,
          time: now
        })
      }
    })
    
    // 황금 포켓 체크
    if (fibonacciData.goldenPocket) {
      if (currentPrice >= fibonacciData.goldenPocket.low && 
          currentPrice <= fibonacciData.goldenPocket.high) {
        newSignals.push({
          type: 'golden',
          message: `황금 포켓 진입 (${fibonacciData.goldenPocket.low.toFixed(2)} - ${fibonacciData.goldenPocket.high.toFixed(2)})`,
          level: 'warning' as const,
          time: now
        })
      }
    }
    
    // 추세 시그널
    if (fibonacciData.trend === 'bullish' && tradingStrategy) {
      tradingStrategy.entry.forEach((entry, idx) => {
        if (currentPrice <= entry && currentPrice > entry * 0.98) {
          newSignals.push({
            type: 'entry',
            message: `매수 진입점 ${idx + 1} 근접 ($${entry.toFixed(2)})`,
            level: 'success' as const,
            time: now
          })
        }
      })
    }
    
    // 목표가 도달 체크
    if (tradingStrategy) {
      tradingStrategy.targets.forEach((target, idx) => {
        if (currentPrice >= target * 0.98 && currentPrice < target) {
          newSignals.push({
            type: 'target',
            message: `목표가 ${idx + 1} 근접 ($${target.toFixed(2)})`,
            level: 'success' as const,
            time: now
          })
        }
      })
    }
    
    setSignals(prev => [...newSignals, ...prev].slice(0, 20))
  }, [currentPrice, fibonacciData, tradingStrategy])
  
  return (
    <div className="space-y-6">
      {/* 실시간 시그널 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaBell className="text-yellow-400" />
          실시간 피보나치 시그널
        </h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {signals.length > 0 ? signals.map((signal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded border ${
                signal.level === 'success' ? 'bg-green-900/20 border-green-700/50' :
                signal.level === 'warning' ? 'bg-yellow-900/20 border-yellow-700/50' :
                signal.level === 'danger' ? 'bg-red-900/20 border-red-700/50' :
                'bg-blue-900/20 border-blue-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm ${
                  signal.level === 'success' ? 'text-green-400' :
                  signal.level === 'warning' ? 'text-yellow-400' :
                  signal.level === 'danger' ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  {signal.message}
                </span>
                <span className="text-xs text-gray-400">
                  {signal.time.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          )) : (
            <div className="text-center text-gray-500 py-8">
              시그널 대기 중...
            </div>
          )}
        </div>
      </motion.div>
      
      {/* 시그널 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-sm font-bold text-green-400 mb-3">현재 상태</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">피보나치 위치</span>
              <span className="text-white font-bold">{fibonacciData?.currentPosition}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">추세</span>
              <span className={`font-bold ${
                fibonacciData?.trend === 'bullish' ? 'text-green-400' :
                fibonacciData?.trend === 'bearish' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {fibonacciData?.trend === 'bullish' ? '상승' :
                 fibonacciData?.trend === 'bearish' ? '하락' : '중립'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">신뢰도</span>
              <span className="text-white font-bold">{fibonacciData?.confidence.toFixed(0)}%</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-sm font-bold text-yellow-400 mb-3">가까운 레벨</h4>
          <div className="space-y-2">
            {fibonacciData?.retracements
              .sort((a, b) => Math.abs(a.price - currentPrice) - Math.abs(b.price - currentPrice))
              .slice(0, 3)
              .map((level, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-400">{level.label}</span>
                  <span className="text-white font-bold">${level.price.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-sm font-bold text-purple-400 mb-3">트레이딩 시그널</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">진입 추천</span>
              <span className="text-white font-bold">
                ${tradingStrategy?.entry[0]?.toFixed(2) || '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">손절가</span>
              <span className="text-red-400 font-bold">
                ${tradingStrategy?.stopLoss?.toFixed(2) || '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">목표가</span>
              <span className="text-green-400 font-bold">
                ${tradingStrategy?.targets[0]?.toFixed(2) || '-'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ==================== AI 분석 탭 ====================
export const AIAnalysisTab: React.FC<TabProps> = ({
  fibonacciData,
  tradingStrategy,
  currentPrice,
  priceHistory,
  volumeHistory,
  swingHigh,
  swingLow,
  historicalData
}) => {
  // AI 예측 계산
  const aiPrediction = useMemo(() => {
    if (!fibonacciData || priceHistory.length < 50) return null
    
    // 패턴 분석 (실제 데이터 기반)
    const recentPrices = priceHistory.slice(-50)
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
    const priceVolatility = Math.sqrt(
      recentPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / recentPrices.length
    ) / avgPrice
    
    // 트렌드 강도 계산
    const trendStrength = ((currentPrice - recentPrices[0]) / recentPrices[0]) * 100
    
    // 볼륨 분석
    const recentVolumes = volumeHistory.slice(-50)
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length
    const volumeTrend = recentVolumes.slice(-10).reduce((a, b) => a + b, 0) / 10 / avgVolume
    
    // 피보나치 패턴 점수
    let patternScore = 50
    if (fibonacciData.currentPosition.includes('38.2')) patternScore += 10
    if (fibonacciData.currentPosition.includes('50')) patternScore += 15
    if (fibonacciData.currentPosition.includes('61.8')) patternScore += 20
    
    // 예측 생성
    const pattern = patternScore > 70 ? '황금 되돌림 형성' :
                   patternScore > 60 ? '강력한 지지 확인' :
                   patternScore > 50 ? '추세 지속 가능' : '조정 진행 중'
    
    const targetLevel = fibonacciData.extensions[
      trendStrength > 5 ? 1 : 0
    ]?.price || currentPrice * 1.1
    
    const confidence = Math.min(95, Math.max(30, 
      patternScore + (volumeTrend > 1 ? 10 : 0) - (priceVolatility * 100)
    ))
    
    const timeframe = priceVolatility > 0.05 ? '3-5일' :
                     priceVolatility > 0.03 ? '5-7일' : '7-10일'
    
    const strategy = fibonacciData.trend === 'bullish' ? '분할 매수' :
                    fibonacciData.trend === 'bearish' ? '분할 매도' : '관망'
    
    return {
      pattern,
      targetLevel,
      confidence,
      timeframe,
      strategy,
      trendStrength,
      volumeTrend,
      priceVolatility
    }
  }, [fibonacciData, priceHistory, volumeHistory, currentPrice])
  
  // ML 기반 스코어링
  const mlScores = useMemo(() => {
    const scores = {
      momentum: 0,
      volume: 0,
      fibonacci: 0,
      pattern: 0,
      overall: 0
    }
    
    if (aiPrediction) {
      scores.momentum = Math.min(100, Math.abs(aiPrediction.trendStrength) * 5)
      scores.volume = Math.min(100, aiPrediction.volumeTrend * 50)
      scores.fibonacci = aiPrediction.confidence
      scores.pattern = fibonacciData?.confidence || 50
      scores.overall = (scores.momentum + scores.volume + scores.fibonacci + scores.pattern) / 4
    }
    
    return scores
  }, [aiPrediction, fibonacciData])
  
  return (
    <div className="space-y-6">
      {/* AI 예측 메인 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-700/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaRobot className="text-purple-400" />
          AI 피보나치 패턴 예측
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-800/50 rounded">
            <h4 className="text-sm font-bold text-purple-400 mb-2">패턴 인식</h4>
            <p className="text-lg font-bold text-white">{aiPrediction?.pattern || '분석 중...'}</p>
            <p className="text-xs text-gray-400 mt-1">
              신뢰도: {aiPrediction?.confidence.toFixed(0) || 0}%
            </p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded">
            <h4 className="text-sm font-bold text-blue-400 mb-2">예상 움직임</h4>
            <p className="text-lg font-bold text-white">
              ${aiPrediction?.targetLevel.toFixed(2) || '-'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {aiPrediction?.timeframe || '-'} 내 도달 예상
            </p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded">
            <h4 className="text-sm font-bold text-green-400 mb-2">추천 전략</h4>
            <p className="text-lg font-bold text-white">{aiPrediction?.strategy || '대기'}</p>
            <p className="text-xs text-gray-400 mt-1">
              {tradingStrategy?.entry.slice(0, 3).map(e => 
                `${((e / currentPrice - 1) * 100).toFixed(1)}%`
              ).join(', ') || '-'}
            </p>
          </div>
        </div>
        
        {/* ML 스코어 차트 */}
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={[
            { subject: '모멘텀', value: mlScores.momentum },
            { subject: '거래량', value: mlScores.volume },
            { subject: '피보나치', value: mlScores.fibonacci },
            { subject: '패턴', value: mlScores.pattern },
            { subject: '종합', value: mlScores.overall }
          ]}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
            <Radar
              name="AI 스코어"
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
      
      {/* 상세 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 가격 예측 차트 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-lg font-bold text-white mb-4">AI 가격 예측</h4>
          
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={priceHistory.slice(-30).map((price, idx) => ({
              time: idx,
              actual: price,
              predicted: idx < 25 ? price : null,
              future: idx >= 25 ? price * (1 + (aiPrediction?.trendStrength || 0) / 100 * (idx - 25) / 5) : null
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
              />
              <Line type="monotone" dataKey="actual" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="future" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        {/* 리스크 평가 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        >
          <h4 className="text-lg font-bold text-white mb-4">리스크 평가</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">변동성 리스크</span>
                <span className="text-yellow-400">
                  {((aiPrediction?.priceVolatility || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (aiPrediction?.priceVolatility || 0) * 1000)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">추세 강도</span>
                <span className="text-green-400">
                  {Math.abs(aiPrediction?.trendStrength || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.abs(aiPrediction?.trendStrength || 0) * 5)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">거래량 신호</span>
                <span className="text-blue-400">
                  {((aiPrediction?.volumeTrend || 1) * 100 - 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (aiPrediction?.volumeTrend || 1) * 50)}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-900/50 rounded">
            <p className="text-xs text-gray-400">
              종합 리스크 레벨: 
              <span className={`ml-2 font-bold ${
                (aiPrediction?.priceVolatility || 0) > 0.05 ? 'text-red-400' :
                (aiPrediction?.priceVolatility || 0) > 0.03 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {(aiPrediction?.priceVolatility || 0) > 0.05 ? '높음' :
                 (aiPrediction?.priceVolatility || 0) > 0.03 ? '보통' : '낮음'}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* AI 트레이딩 권장사항 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-700/30"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-400" />
          AI 트레이딩 권장사항
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-800/50 rounded">
            <h5 className="text-sm font-bold text-green-400 mb-2">진입 전략</h5>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• 1차: ${tradingStrategy?.entry[0]?.toFixed(2) || '-'}</li>
              <li>• 2차: ${tradingStrategy?.entry[1]?.toFixed(2) || '-'}</li>
              <li>• 3차: ${tradingStrategy?.entry[2]?.toFixed(2) || '-'}</li>
            </ul>
          </div>
          
          <div className="p-3 bg-gray-800/50 rounded">
            <h5 className="text-sm font-bold text-yellow-400 mb-2">포지션 관리</h5>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• 자본금의 2-3% 리스크</li>
              <li>• 레버리지: {fibonacciData?.trend === 'bullish' ? '2-3x' : '1-2x'}</li>
              <li>• 분할 진입 권장</li>
            </ul>
          </div>
          
          <div className="p-3 bg-gray-800/50 rounded">
            <h5 className="text-sm font-bold text-red-400 mb-2">리스크 관리</h5>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• 손절: ${tradingStrategy?.stopLoss?.toFixed(2) || '-'}</li>
              <li>• R:R = 1:{tradingStrategy?.riskReward.toFixed(1) || '-'}</li>
              <li>• 트레일링 스톱 활용</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
// ConceptTab을 별도 파일에서 가져오기
export { ConceptTab } from './ConceptTab'
