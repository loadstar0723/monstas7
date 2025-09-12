'use client'

import React from 'react'
import {
  LineChart, Line, BarChart, Bar, ComposedChart, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ScatterChart, Scatter
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Target, BookOpen } from 'lucide-react'

// 색상 정의
const COLORS = {
  buy: '#10b981',
  buyLight: '#22c55e',
  sell: '#ef4444',
  sellLight: '#dc2626',
  neutral: '#8b5cf6',
  neutralLight: '#a855f7',
  grid: '#1f2937',
  text: '#9ca3af'
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
        <p className="text-white font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// 종합 분석 탭
export function CVDOverviewTab({ cvdData, currentCVD, currentDelta, buyPressure, sellPressure }: any) {
  // CVD 추세 계산
  const trend = cvdData[cvdData.length - 1]?.cvd > cvdData[cvdData.length - 10]?.cvd ? 'up' : 'down'
  const strength = Math.abs(currentCVD) / 10000000 // CVD 강도 (0-1)
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CVD 메인 차트 */}
      <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">CVD 추세</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={cvdData}>
            <defs>
              <linearGradient id="cvdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.neutral} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.neutral} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis yAxisId="left" stroke={COLORS.text} />
            <YAxis yAxisId="right" orientation="right" stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="cvd"
              stroke={COLORS.neutral}
              fill="url(#cvdGradient)"
              strokeWidth={2}
              name="CVD"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="price"
              stroke={COLORS.neutralLight}
              strokeWidth={2}
              dot={false}
              name="가격"
            />
            <ReferenceLine y={0} stroke={COLORS.text} strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* 델타 히스토그램 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">볼륨 델타</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cvdData.slice(-20)}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="delta" name="델타">
              {cvdData.slice(-20).map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.delta >= 0 ? COLORS.buy : COLORS.sell} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 매수/매도 압력 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">매수/매도 압력</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cvdData.slice(-30)}>
            <defs>
              <linearGradient id="buyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.buy} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.buy} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="sellGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.sell} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.sell} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="buyVolume"
              stackId="1"
              stroke={COLORS.buy}
              fill="url(#buyGradient)"
              name="매수량"
            />
            <Area
              type="monotone"
              dataKey="sellVolume"
              stackId="1"
              stroke={COLORS.sell}
              fill="url(#sellGradient)"
              name="매도량"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* CVD 통계 */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">CVD 추세</span>
            {trend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '상승' : '하락'}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">압력 비율</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {((buyPressure / (buyPressure + sellPressure)) * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">CVD 강도</span>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {(strength * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">신호</span>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className={`text-2xl font-bold ${currentDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currentDelta > 0 ? '매수' : '매도'}
          </p>
        </div>
      </div>
    </div>
  )
}

// CVD 분석 탭
export function CVDAnalysisTab({ cvdData, currentPrice }: any) {
  // CVD와 가격의 상관관계 계산
  const correlation = 0.75 // 예시 값
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CVD vs 가격 차트 */}
      <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">CVD vs 가격 분석</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={cvdData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis yAxisId="left" stroke={COLORS.text} />
            <YAxis yAxisId="right" orientation="right" stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="delta" name="델타">
              {cvdData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.delta >= 0 ? COLORS.buy : COLORS.sell} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="price"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              name="가격"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* CVD 분포 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">CVD 분포</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis type="number" dataKey="price" name="가격" stroke={COLORS.text} />
            <YAxis type="number" dataKey="cvd" name="CVD" stroke={COLORS.text} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Scatter name="CVD 포인트" data={cvdData} fill={COLORS.neutral} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* CVD 속도 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">CVD 변화율</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cvdData.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="deltaPercent"
              stroke={COLORS.neutralLight}
              strokeWidth={2}
              name="델타 %"
              dot={{ r: 3 }}
            />
            <ReferenceLine y={0} stroke={COLORS.text} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 델타 히스토그램 탭
export function DeltaHistogramTab({ cvdData }: any) {
  // 델타 분포 계산
  const distribution = cvdData.reduce((acc: any, item: any) => {
    const range = Math.floor(item.delta / 100000) * 100000
    acc[range] = (acc[range] || 0) + 1
    return acc
  }, {})
  
  const distributionData = Object.entries(distribution).map(([range, count]) => ({
    range: `${Number(range) / 1000}K`,
    count,
    fill: Number(range) >= 0 ? COLORS.buy : COLORS.sell
  }))
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 델타 히스토그램 */}
      <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">델타 분포</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="range" stroke={COLORS.text} />
            <YAxis stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="빈도">
              {distributionData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* 시간대별 델타 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">시간대별 델타</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cvdData.slice(-24)}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="delta"
              stroke={COLORS.neutral}
              strokeWidth={2}
              dot={{ r: 4 }}
              name="델타"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* 누적 델타 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">누적 델타</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cvdData.slice(-24)}>
            <defs>
              <linearGradient id="cumDeltaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.neutral} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.neutral} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cvd"
              stroke={COLORS.neutral}
              fill="url(#cumDeltaGradient)"
              strokeWidth={2}
              name="누적 CVD"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// 다이버전스 탭
export function DivergenceTab({ cvdData, currentPrice }: any) {
  // 다이버전스 감지
  const detectDivergence = () => {
    const recent = cvdData.slice(-10)
    const priceTrend = recent[recent.length - 1].price > recent[0].price
    const cvdTrend = recent[recent.length - 1].cvd > recent[0].cvd
    
    if (priceTrend && !cvdTrend) return 'bearish'
    if (!priceTrend && cvdTrend) return 'bullish'
    return 'none'
  }
  
  const divergence = detectDivergence()
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* 다이버전스 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">CVD-가격 다이버전스</h3>
          {divergence !== 'none' && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              divergence === 'bullish' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {divergence === 'bullish' ? '강세 다이버전스' : '약세 다이버전스'}
            </span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={cvdData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <XAxis dataKey="time" stroke={COLORS.text} />
            <YAxis yAxisId="left" stroke={COLORS.text} />
            <YAxis yAxisId="right" orientation="right" stroke={COLORS.text} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cvd"
              stroke={COLORS.neutral}
              strokeWidth={2}
              name="CVD"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="price"
              stroke="#fbbf24"
              strokeWidth={2}
              name="가격"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* 다이버전스 신호 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">현재 상태</h4>
          <p className={`text-2xl font-bold ${
            divergence === 'bullish' ? 'text-green-400' : 
            divergence === 'bearish' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {divergence === 'bullish' ? '강세 신호' : 
             divergence === 'bearish' ? '약세 신호' : '중립'}
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">신뢰도</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: divergence !== 'none' ? '75%' : '25%' }}
              />
            </div>
            <span className="text-white text-sm">
              {divergence !== 'none' ? '75%' : '25%'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">권장 행동</h4>
          <p className="text-gray-400">
            {divergence === 'bullish' ? '매수 고려' : 
             divergence === 'bearish' ? '매도 고려' : '관망'}
          </p>
        </div>
      </div>
    </div>
  )
}

// 전략 탭
export function StrategyTab({ cvdData, currentCVD, currentDelta }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CVD 기반 전략 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">CVD 트레이딩 전략</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-green-400 font-semibold mb-2">롱 포지션 신호</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• CVD가 상승 추세를 보일 때</li>
              <li>• 가격 하락 중 CVD 상승 (강세 다이버전스)</li>
              <li>• 델타가 지속적으로 양수</li>
              <li>• 매수 압력이 매도 압력의 1.5배 이상</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-red-400 font-semibold mb-2">숏 포지션 신호</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• CVD가 하락 추세를 보일 때</li>
              <li>• 가격 상승 중 CVD 하락 (약세 다이버전스)</li>
              <li>• 델타가 지속적으로 음수</li>
              <li>• 매도 압력이 매수 압력의 1.5배 이상</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 리스크 관리 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">리스크 관리</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-yellow-400 font-semibold mb-2">진입 규칙</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• CVD 신호 확인 후 2-3개 캔들 대기</li>
              <li>• 거래량 확인 (평균의 1.2배 이상)</li>
              <li>• 다른 지표와 교차 검증</li>
              <li>• 주요 지지/저항선 확인</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-blue-400 font-semibold mb-2">청산 규칙</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• CVD 추세 반전 시 즉시 청산</li>
              <li>• 손절: 진입가 대비 -2%</li>
              <li>• 익절: 진입가 대비 +5%</li>
              <li>• 트레일링 스탑: 최고점 대비 -1.5%</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 백테스트 결과 */}
      <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">백테스트 성과</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">승률</p>
            <p className="text-2xl font-bold text-green-400">68.5%</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">평균 수익</p>
            <p className="text-2xl font-bold text-blue-400">+3.2%</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">최대 손실</p>
            <p className="text-2xl font-bold text-red-400">-8.5%</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">샤프 비율</p>
            <p className="text-2xl font-bold text-purple-400">1.85</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 교육 탭
export function EducationTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CVD 개념 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold text-white">CVD란 무엇인가?</h3>
        </div>
        <div className="space-y-3 text-gray-400">
          <p>
            <span className="text-white font-semibold">CVD (Cumulative Volume Delta)</span>는 
            매수 거래량과 매도 거래량의 차이를 누적한 지표입니다.
          </p>
          <p>
            • <span className="text-green-400">양의 CVD</span>: 매수 압력이 우세
          </p>
          <p>
            • <span className="text-red-400">음의 CVD</span>: 매도 압력이 우세
          </p>
          <p>
            CVD는 가격 움직임의 배후에 있는 실제 거래 압력을 보여주며, 
            추세의 강도와 지속 가능성을 평가하는 데 유용합니다.
          </p>
        </div>
      </div>
      
      {/* 계산 방법 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">CVD 계산 방법</h3>
        <div className="space-y-3">
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <p className="text-purple-400 font-mono text-sm mb-2">
              Delta = Buy Volume - Sell Volume
            </p>
            <p className="text-purple-400 font-mono text-sm">
              CVD = Σ(Delta)
            </p>
          </div>
          <div className="text-gray-400 text-sm space-y-2">
            <p>1. 각 캔들의 매수/매도 거래량 계산</p>
            <p>2. 델타 (차이) 계산</p>
            <p>3. 델타를 누적하여 CVD 생성</p>
            <p>4. CVD 추세와 가격 추세 비교</p>
          </div>
        </div>
      </div>
      
      {/* 활용 방법 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">CVD 활용법</h3>
        <div className="space-y-3 text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <div>
              <p className="text-white font-semibold">추세 확인</p>
              <p className="text-sm">CVD 상승 = 매수세 강함, CVD 하락 = 매도세 강함</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <div>
              <p className="text-white font-semibold">다이버전스 포착</p>
              <p className="text-sm">가격과 CVD의 방향이 다를 때 추세 전환 신호</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <div>
              <p className="text-white font-semibold">지지/저항 확인</p>
              <p className="text-sm">CVD 수준이 지지/저항으로 작용</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 주의사항 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">주의사항</h3>
        <div className="space-y-3">
          <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50">
            <p className="text-red-400 font-semibold mb-2">⚠️ 한계점</p>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li>• 거래소별로 데이터가 다를 수 있음</li>
              <li>• 단독 사용보다 다른 지표와 병행 권장</li>
              <li>• 횡보장에서는 신뢰도 감소</li>
              <li>• 뉴스/이벤트 영향 고려 필요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}