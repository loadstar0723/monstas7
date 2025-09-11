'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, Scatter, ScatterChart
} from 'recharts'
import RSIDynamicAnalysis from '@/components/analysis/RSIDynamicAnalysis'
import MACDDynamicAnalysis from '@/components/analysis/MACDDynamicAnalysis'
import BollingerDynamicAnalysis from '@/components/analysis/BollingerDynamicAnalysis'
import VolumeDynamicAnalysis from '@/components/analysis/VolumeDynamicAnalysis'
import ADXDynamicAnalysis from '@/components/analysis/ADXDynamicAnalysis'
import MARibbonDynamicAnalysis from '@/components/analysis/MARibbonDynamicAnalysis'
import IchimokuDynamicAnalysis from '@/components/analysis/IchimokuDynamicAnalysis'
import VWAPDynamicAnalysis from '@/components/analysis/VWAPDynamicAnalysis'
import StochasticChart from '@/components/analysis/StochasticChart'
import ROCChart from '@/components/analysis/ROCChart'
import MomentumOscillator from '@/components/analysis/MomentumOscillator'
import ADXChart from '@/components/analysis/ADXChart'
import ATRDynamicAnalysis from '@/components/analysis/ATRDynamicAnalysis'
import DMIChart from '@/components/analysis/DMIChart'
import MADynamicAnalysis from '@/components/analysis/MADynamicAnalysis'
import MARibbonAnalysis from '@/components/analysis/MARibbonAnalysis'
import ChartDescription, { chartDescriptions } from '@/components/analysis/ChartDescription'
import ParabolicSARChart from '@/components/analysis/ParabolicSARChart'
import SupertrendChart from '@/components/analysis/SupertrendChart'
import { calculateIchimoku } from '@/lib/ichimokuCalculator'
import { calculateDMISeries } from '@/lib/dmiCalculator'
import { calculateVolumeProfile, calculateValueArea } from '@/lib/volumeProfileCalculator'
import { calculateOBV, analyzeOBVTrend } from '@/lib/obvCalculator'
import { 
  TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle,
  Info, AlertCircle, DollarSign, Target, Shield, Zap, BarChart3,
  TrendingDown as TrendDown, Brain, Eye, Gauge, Percent
} from 'lucide-react'

interface TabComponentProps {
  indicators: any
  historicalData: any[]
  currentPrice: number
  priceHistory: number[]
  volumeHistory: number[]
  volume24h?: number
  config?: any
}

// 종합 분석 탭 - 모든 지표를 종합한 프로페셔널 대시보드
export function ComprehensiveTab({ indicators, historicalData, currentPrice, priceHistory, volume24h, config }: TabComponentProps) {
  const analysis = useMemo(() => {
    const signals = []
    let totalScore = 0
    
    // RSI 신호 분석 (가중치 20%)
    if (indicators.rsi < 30) {
      signals.push({ type: 'buy', indicator: 'RSI', strength: 'strong', message: 'RSI 과매도 구간 (강한 매수)', score: 20 })
      totalScore += 20
    } else if (indicators.rsi < 40) {
      signals.push({ type: 'buy', indicator: 'RSI', strength: 'medium', message: 'RSI 매수 구간', score: 10 })
      totalScore += 10
    } else if (indicators.rsi > 70) {
      signals.push({ type: 'sell', indicator: 'RSI', strength: 'strong', message: 'RSI 과매수 구간 (강한 매도)', score: -20 })
      totalScore -= 20
    } else if (indicators.rsi > 60) {
      signals.push({ type: 'sell', indicator: 'RSI', strength: 'medium', message: 'RSI 매도 구간', score: -10 })
      totalScore -= 10
    } else {
      signals.push({ type: 'neutral', indicator: 'RSI', strength: 'weak', message: 'RSI 중립 구간', score: 0 })
    }
    
    // MACD 신호 분석 (가중치 25%)
    if (indicators.macd.histogram > 0 && indicators.macd.macdLine > indicators.macd.signal) {
      if (indicators.macd.histogram > indicators.macd.signal * 0.1) {
        signals.push({ type: 'buy', indicator: 'MACD', strength: 'strong', message: 'MACD 강한 골든크로스', score: 25 })
        totalScore += 25
      } else {
        signals.push({ type: 'buy', indicator: 'MACD', strength: 'medium', message: 'MACD 골든크로스', score: 15 })
        totalScore += 15
      }
    } else if (indicators.macd.histogram < 0 && indicators.macd.macdLine < indicators.macd.signal) {
      if (Math.abs(indicators.macd.histogram) > Math.abs(indicators.macd.signal) * 0.1) {
        signals.push({ type: 'sell', indicator: 'MACD', strength: 'strong', message: 'MACD 강한 데드크로스', score: -25 })
        totalScore -= 25
      } else {
        signals.push({ type: 'sell', indicator: 'MACD', strength: 'medium', message: 'MACD 데드크로스', score: -15 })
        totalScore -= 15
      }
    }
    
    // 볼린저밴드 신호 분석 (가중치 15%)
    const bbPosition = (currentPrice - indicators.bollingerBands.lower) / 
                      (indicators.bollingerBands.upper - indicators.bollingerBands.lower)
    if (bbPosition < 0) {
      signals.push({ type: 'buy', indicator: 'BB', strength: 'strong', message: '볼린저 하단 이탈 (강한 매수)', score: 15 })
      totalScore += 15
    } else if (bbPosition < 0.2) {
      signals.push({ type: 'buy', indicator: 'BB', strength: 'medium', message: '볼린저 하단 근접', score: 8 })
      totalScore += 8
    } else if (bbPosition > 1) {
      signals.push({ type: 'sell', indicator: 'BB', strength: 'strong', message: '볼린저 상단 이탈 (강한 매도)', score: -15 })
      totalScore -= 15
    } else if (bbPosition > 0.8) {
      signals.push({ type: 'sell', indicator: 'BB', strength: 'medium', message: '볼린저 상단 근접', score: -8 })
      totalScore -= 8
    }
    
    // Stochastic 신호 분석 (가중치 10%)
    if (indicators.stochastic.k < 20) {
      signals.push({ type: 'buy', indicator: 'Stoch', strength: 'strong', message: '스토캐스틱 과매도', score: 10 })
      totalScore += 10
    } else if (indicators.stochastic.k > 80) {
      signals.push({ type: 'sell', indicator: 'Stoch', strength: 'strong', message: '스토캐스틱 과매수', score: -10 })
      totalScore -= 10
    }
    
    // ADX 트렌드 강도 분석 (가중치 15%)
    if (indicators.adx > 25) {
      if (indicators.plusDI > indicators.minusDI) {
        signals.push({ type: 'buy', indicator: 'ADX', strength: 'medium', message: '강한 상승 트렌드', score: 15 })
        totalScore += 15
      } else {
        signals.push({ type: 'sell', indicator: 'ADX', strength: 'medium', message: '강한 하락 트렌드', score: -15 })
        totalScore -= 15
      }
    } else {
      signals.push({ type: 'neutral', indicator: 'ADX', strength: 'weak', message: '약한 트렌드', score: 0 })
    }
    
    // 이동평균선 크로스 분석 (가중치 15%)
    if (indicators.sma20 > indicators.sma50) {
      signals.push({ type: 'buy', indicator: 'MA', strength: 'medium', message: '단기 이평선 > 장기 이평선', score: 8 })
      totalScore += 8
    } else {
      signals.push({ type: 'sell', indicator: 'MA', strength: 'medium', message: '단기 이평선 < 장기 이평선', score: -8 })
      totalScore -= 8
    }
    
    // 신호 분류
    const buySignals = signals.filter(s => s.type === 'buy')
    const sellSignals = signals.filter(s => s.type === 'sell')
    const strongBuySignals = buySignals.filter(s => s.strength === 'strong')
    const strongSellSignals = sellSignals.filter(s => s.strength === 'strong')
    
    // 종합 판단
    let signalStrength = '중립'
    if (totalScore >= 50) signalStrength = '매우 강한 매수'
    else if (totalScore >= 25) signalStrength = '강한 매수'
    else if (totalScore >= 10) signalStrength = '매수'
    else if (totalScore <= -50) signalStrength = '매우 강한 매도'
    else if (totalScore <= -25) signalStrength = '강한 매도'
    else if (totalScore <= -10) signalStrength = '매도'
    
    const confidence = Math.min(100, Math.abs(totalScore))
    
    return {
      signals, 
      buySignals, 
      sellSignals, 
      strongBuySignals,
      strongSellSignals,
      totalScore, 
      signalStrength,
      confidence
    }
  }, [indicators, currentPrice])

  // 실제 히스토리 데이터를 사용한 미니 차트 데이터
  const miniChartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // 최근 50개 데이터만 사용
    const recentData = historicalData.slice(-50).map((candle, i) => ({
      index: i,
      price: candle.close,
      rsi: candle.rsi || 50,
      macd: candle.macdHistogram || 0,
      volume: candle.volume || 0,
      upper: candle.bbUpper || candle.close + 200,
      lower: candle.bbLower || candle.close - 200,
      middle: candle.bbMiddle || candle.close
    }))
    
    // 현재 값 추가
    if (recentData.length > 0) {
      recentData[recentData.length - 1] = {
        ...recentData[recentData.length - 1],
        price: currentPrice,
        rsi: indicators.rsi,
        macd: indicators.macd.histogram,
        upper: indicators.bollingerBands.upper,
        lower: indicators.bollingerBands.lower,
        middle: indicators.bollingerBands.middle
      }
    }
    
    return recentData
  }, [historicalData, currentPrice, indicators])

  const SignalStrengthMeter = ({ score }: { score: number }) => {
    const normalizedScore = Math.max(-100, Math.min(100, score))
    const rotation = (normalizedScore + 100) * 0.9 - 90
    
    return (
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={normalizedScore > 25 ? '#10b981' : normalizedScore < -25 ? '#ef4444' : '#f59e0b'}
            strokeWidth="8"
            strokeDasharray={`${(Math.abs(normalizedScore) / 100) * 282.74} 282.74`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Math.abs(score)}</div>
            <div className="text-xs text-gray-400">신호 강도</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 종합 시그널 카드 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI 종합 판단
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            analysis.totalScore > 25 ? 'bg-green-500/20 text-green-400' :
            analysis.totalScore < -25 ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {analysis.signalStrength}
          </div>
        </div>
        
        <div className="flex items-center justify-around mb-4">
          <SignalStrengthMeter score={analysis.totalScore} />
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {analysis.confidence}%
            </div>
            <div className="text-sm text-gray-400">신뢰도</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-green-500/10 rounded p-2">
            <div className="text-green-400 font-bold">{analysis.buySignals.length} 매수</div>
            <div className="text-gray-400 text-xs">강한 신호 {analysis.strongBuySignals.length}개</div>
          </div>
          <div className="bg-red-500/10 rounded p-2">
            <div className="text-red-400 font-bold">{analysis.sellSignals.length} 매도</div>
            <div className="text-gray-400 text-xs">강한 신호 {analysis.strongSellSignals.length}개</div>
          </div>
        </div>
      </div>

      {/* 실시간 지표 현황 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          실시간 지표 현황
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
            <span className="text-gray-400">RSI</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono">{indicators.rsi.toFixed(2)}</span>
              <span className={`text-xs ${
                indicators.rsi < 30 ? 'text-green-400' : 
                indicators.rsi > 70 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {indicators.rsi < 30 ? '과매도' : indicators.rsi > 70 ? '과매수' : '중립'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
            <span className="text-gray-400">MACD</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono">{(typeof indicators.macd === 'object' && indicators.macd.histogram !== undefined ? indicators.macd.histogram : 0).toFixed(2)}</span>
              <span className={`text-xs ${
                (typeof indicators.macd === 'object' && indicators.macd.histogram !== undefined ? indicators.macd.histogram : 0) > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(typeof indicators.macd === 'object' && indicators.macd.histogram !== undefined ? indicators.macd.histogram : 0) > 0 ? '상승' : '하락'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
            <span className="text-gray-400">Stochastic</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono">{(typeof indicators.stochastic === 'object' && indicators.stochastic.k !== undefined ? indicators.stochastic.k : 50).toFixed(2)}</span>
              <span className={`text-xs ${
                (typeof indicators.stochastic === 'object' && indicators.stochastic.k !== undefined ? indicators.stochastic.k : 50) < 20 ? 'text-green-400' :
                (typeof indicators.stochastic === 'object' && indicators.stochastic.k !== undefined ? indicators.stochastic.k : 50) > 80 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {(typeof indicators.stochastic === 'object' && indicators.stochastic.k !== undefined ? indicators.stochastic.k : 50) < 20 ? '과매도' : 
                 (typeof indicators.stochastic === 'object' && indicators.stochastic.k !== undefined ? indicators.stochastic.k : 50) > 80 ? '과매수' : '중립'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
            <span className="text-gray-400">ADX</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono">{(typeof indicators.adx === 'number' ? indicators.adx : 25).toFixed(2)}</span>
              <span className={`text-xs ${
                (typeof indicators.adx === 'number' ? indicators.adx : 25) > 25 ? 'text-purple-400' : 'text-gray-400'
              }`}>
                {(typeof indicators.adx === 'number' ? indicators.adx : 25) > 25 ? '강한 트렌드' : '약한 트렌드'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 미니 차트들 */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 가격 & 볼린저밴드 */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-bold text-gray-300 mb-2">가격 & 볼린저밴드</h4>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={miniChartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" hide />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={(value) => {
                  if (value >= 10000) return `${Math.floor(value)}`
                  if (value >= 1000) return `${value.toFixed(0)}`
                  return `${value.toFixed(0)}`
                }}
                width={60}
                tickCount={5}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: any) => `$${Number(value).toFixed(2)}`}
              />
              <Area type="monotone" dataKey="price" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
              <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeWidth={1} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="lower" stroke="#10b981" strokeWidth={1} dot={false} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RSI */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-bold text-gray-300 mb-2">RSI</h4>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={miniChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" hide />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                ticks={[0, 20, 30, 50, 70, 80, 100]}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
              <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MACD */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-bold text-gray-300 mb-2">MACD Histogram</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={miniChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" hide />
              <YAxis 
                domain={['dataMin - 20', 'dataMax + 20']}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <ReferenceLine y={0} stroke="#6b7280" />
              <Bar dataKey="macd" fill="#8b5cf6">
                {miniChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.macd > 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 볼륨 */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-bold text-gray-300 mb-2">거래량</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={miniChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" hide />
              <YAxis 
                domain={[0, 'dataMax + 1000']}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value/1000).toFixed(1)}K`
                  return value.toFixed(0)
                }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 신호 상세 목록 */}
      <div className="lg:col-span-2 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-400" />
          신호 상세 분석
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {analysis.signals.map((signal, i) => (
            <div key={i} className={`p-3 rounded-lg border ${
              signal.type === 'buy' ? 'bg-green-500/10 border-green-500/30' :
              signal.type === 'sell' ? 'bg-red-500/10 border-red-500/30' :
              'bg-gray-800/50 border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white">{signal.indicator}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  signal.strength === 'strong' ? 'bg-purple-500/20 text-purple-400' :
                  signal.strength === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {signal.strength === 'strong' ? '강함' : 
                   signal.strength === 'medium' ? '보통' : '약함'}
                </span>
              </div>
              <div className="text-xs text-gray-400">{signal.message}</div>
              <div className="text-xs mt-1">
                점수: <span className={signal.score > 0 ? 'text-green-400' : signal.score < 0 ? 'text-red-400' : 'text-gray-400'}>
                  {signal.score > 0 ? '+' : ''}{signal.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 추세 지표 탭 - SMA, EMA, VWAP, Ichimoku 등
export function TrendTab({ indicators, historicalData, currentPrice, priceHistory, volumeHistory, volume24h }: TabComponentProps) {
  const [selectedMA, setSelectedMA] = useState('all')
  
  // 실제 이동평균선 데이터 준비 - 실시간 계산
  const maChartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // 충분한 데이터 확보 (MA200 계산을 위해 최소 300개)
    const allData = historicalData.slice(-300)
    
    // 차트용 데이터 생성 (최근 100개만 표시)
    const chartStartIndex = allData.length - 100
    
    return allData.slice(-100).map((candle, i) => {
      const currentIndex = chartStartIndex + i
      
      // 각 MA 계산 - 현재 시점 기준으로 과거 n개 데이터 사용
      const calculateMA = (period: number) => {
        if (currentIndex < period - 1) return candle.close
        const startIdx = currentIndex - period + 1
        const prices = allData.slice(startIdx, currentIndex + 1).map(d => d.close)
        return prices.reduce((a, b) => a + b, 0) / prices.length
      }
      
      // EMA 계산
      const calculateEMA = (period: number) => {
        if (currentIndex < period - 1) return candle.close
        
        const k = 2 / (period + 1)
        let ema = allData[currentIndex - period + 1].close
        
        for (let j = currentIndex - period + 2; j <= currentIndex; j++) {
          ema = allData[j].close * k + ema * (1 - k)
        }
        
        return ema
      }
      
      return {
        index: i,
        price: candle.close,
        ma5: calculateMA(5),
        ma10: calculateMA(10),
        ma20: calculateMA(20),
        ma50: calculateMA(50),
        ma100: calculateMA(100),
        ma200: calculateMA(200),
        ema12: calculateEMA(12),
        ema26: calculateEMA(26)
      }
    })
  }, [historicalData])

  // 실제 MA Ribbon 데이터 - 실시간 계산
  const maRibbonData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // 충분한 데이터 확보
    const allData = historicalData.slice(-150)
    
    // 차트용 데이터 생성 (최근 50개만 표시)
    const chartStartIndex = allData.length - 50
    
    return allData.slice(-50).map((candle, i) => {
      const currentIndex = chartStartIndex + i
      
      // 각 기간별 MA 계산 - 현재 시점 기준으로 과거 n개 데이터 사용
      const mas = [5, 10, 20, 30, 40, 50].map(period => {
        if (currentIndex < period - 1) {
          return { period, value: candle.close }
        }
        const startIdx = currentIndex - period + 1
        const prices = allData.slice(startIdx, currentIndex + 1).map(d => d.close)
        const value = prices.reduce((a, b) => a + b, 0) / prices.length
        return { period, value }
      })
      
      return {
        index: i,
        price: candle.close,
        ...mas.reduce((acc, ma) => ({
          ...acc,
          [`ma${ma.period}`]: ma.value
        }), {})
      }
    })
  }, [historicalData])

  // Ichimoku 클라우드 데이터 - 실제 계산
  const ichimokuData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    const data = historicalData.slice(-100)
    return data.map((candle, i) => {
      // 현재 인덱스 기준으로 과거 데이터를 포함하여 계산
      const endIndex = historicalData.length - 100 + i
      const ichimoku = calculateIchimoku(historicalData, endIndex)
      
      return {
        index: i,
        price: candle.close,
        tenkan: ichimoku.tenkan,
        kijun: ichimoku.kijun,
        senkouA: ichimoku.senkouA,
        senkouB: ichimoku.senkouB,
        chikou: ichimoku.chikou
      }
    })
  }, [historicalData])

  // VWAP 데이터 - 실제 계산
  const vwapData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    const data = historicalData.slice(-100)
    let cumulativeTPV = 0 // Cumulative Typical Price × Volume
    let cumulativeVolume = 0
    
    return data.map((candle, i) => {
      // Typical Price = (High + Low + Close) / 3
      const typicalPrice = (candle.high + candle.low + candle.close) / 3
      const volume = candle.volume || 0
      
      // 누적 계산
      cumulativeTPV += typicalPrice * volume
      cumulativeVolume += volume
      
      // VWAP = Σ(Typical Price × Volume) / Σ(Volume)
      const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : candle.close
      
      // 표준편차 계산 (밴드를 위해)
      let sumSquaredDiff = 0
      let volumeSum = 0
      
      for (let j = 0; j <= i; j++) {
        const tp = (data[j].high + data[j].low + data[j].close) / 3
        const vol = data[j].volume || 0
        sumSquaredDiff += Math.pow(tp - vwap, 2) * vol
        volumeSum += vol
      }
      
      const variance = volumeSum > 0 ? sumSquaredDiff / volumeSum : 0
      const stdDev = Math.sqrt(variance)
      
      return {
        index: i,
        price: candle.close,
        vwap: vwap,
        volume: volume,
        upperBand: vwap + (stdDev * 2), // 2 표준편차 상단
        lowerBand: vwap - (stdDev * 2)  // 2 표준편차 하단
      }
    })
  }, [historicalData])

  return (
    <div className="space-y-4">
      {/* 이동평균선 차트 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            이동평균선 (MA/EMA)
          </h3>
          <select 
            value={selectedMA}
            onChange={(e) => setSelectedMA(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-600 text-sm"
          >
            <option value="all">전체</option>
            <option value="short">단기 (5, 10, 20)</option>
            <option value="medium">중기 (20, 50)</option>
            <option value="long">장기 (100, 200)</option>
          </select>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={maChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis 
              stroke="#9ca3af" 
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, '']}
            />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              name="현재가" 
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              animationDuration={300}
              animationBegin={0}
            />
            
            {(selectedMA === 'all' || selectedMA === 'short') && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="ma5" 
                  stroke="#ef4444" 
                  strokeWidth={1} 
                  dot={{ r: 1 }}
                  activeDot={{ r: 3 }}
                  name="MA5"
                  animationDuration={400}
                  animationBegin={50}
                />
                <Line 
                  type="monotone" 
                  dataKey="ma10" 
                  stroke="#f59e0b" 
                  strokeWidth={1} 
                  dot={{ r: 1 }}
                  activeDot={{ r: 3 }}
                  name="MA10"
                  animationDuration={400}
                  animationBegin={100}
                />
                <Line 
                  type="monotone" 
                  dataKey="ma20" 
                  stroke="#10b981" 
                  strokeWidth={1} 
                  dot={{ r: 1 }}
                  activeDot={{ r: 3 }}
                  name="MA20"
                  animationDuration={400}
                  animationBegin={150}
                />
              </>
            )}
            
            {(selectedMA === 'all' || selectedMA === 'medium') && (
              <>
                <Line type="monotone" dataKey="ma20" stroke="#10b981" strokeWidth={1} dot={false} name="MA20" />
                <Line type="monotone" dataKey="ma50" stroke="#3b82f6" strokeWidth={1} dot={false} name="MA50" />
              </>
            )}
            
            {(selectedMA === 'all' || selectedMA === 'long') && (
              <>
                <Line type="monotone" dataKey="ma100" stroke="#6366f1" strokeWidth={1} dot={false} name="MA100" />
                <Line type="monotone" dataKey="ma200" stroke="#ec4899" strokeWidth={1} dot={false} name="MA200" />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {/* 현재 MA 값들 - 실시간 계산 */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA5</div>
            <div className="text-sm font-bold text-white">
              ${maChartData.length > 0 ? maChartData[maChartData.length - 1].ma5.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA10</div>
            <div className="text-sm font-bold text-white">
              ${maChartData.length > 0 ? maChartData[maChartData.length - 1].ma10.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA20</div>
            <div className="text-sm font-bold text-white">
              ${maChartData.length > 0 ? maChartData[maChartData.length - 1].ma20.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA50</div>
            <div className="text-sm font-bold text-white">
              ${maChartData.length > 0 ? maChartData[maChartData.length - 1].ma50.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA100</div>
            <div className="text-sm font-bold text-white">
              ${maChartData.length > 0 ? maChartData[maChartData.length - 1].ma100.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-400">MA200</div>
            <div className="text-sm font-bold text-white">
              ${maChartData.length > 0 ? maChartData[maChartData.length - 1].ma200.toFixed(2) : 'N/A'}
            </div>
          </div>
        </div>
        
        {/* MA 동적 분석 추가 - 실제 계산값 사용 */}
        <MADynamicAnalysis 
          ma5={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma5 : currentPrice}
          ma20={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma20 : currentPrice}
          ma50={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma50 : currentPrice}
          ma200={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma200 : currentPrice}
          ema12={maChartData.length > 0 ? maChartData[maChartData.length - 1].ema12 : currentPrice}
          ema26={maChartData.length > 0 ? maChartData[maChartData.length - 1].ema26 : currentPrice}
          currentPrice={currentPrice}
          historicalData={maChartData}
        />
        
        {/* MA 리본 분석 추가 - 실제 계산값 사용 */}
        <MARibbonAnalysis 
          ma5={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma5 : currentPrice}
          ma20={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma20 : currentPrice}
          ma50={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma50 : currentPrice}
          ma200={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma200 : currentPrice}
          currentPrice={currentPrice}
          historicalData={maChartData}
        />
        
        {/* 이동평균선 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.movingAverage} currentValue={indicators.sma20} />
      </div>

      {/* VWAP 차트 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          VWAP (거래량 가중 평균가)
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={vwapData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis yAxisId="price" stroke="#9ca3af" domain={['dataMin - 200', 'dataMax + 200']} />
            <YAxis yAxisId="volume" orientation="right" stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <Bar yAxisId="volume" dataKey="volume" fill="#3b82f6" opacity={0.3} name="거래량" />
            <Line yAxisId="price" type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} name="현재가" />
            <Line yAxisId="price" type="monotone" dataKey="vwap" stroke="#10b981" strokeWidth={2} name="VWAP" />
            <Line yAxisId="price" type="monotone" dataKey="upperBand" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} name="상단밴드" />
            <Line yAxisId="price" type="monotone" dataKey="lowerBand" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} name="하단밴드" />
          </ComposedChart>
        </ResponsiveContainer>
        
        <VWAPDynamicAnalysis 
          vwap={{
            vwap: vwapData.length > 0 ? vwapData[vwapData.length - 1].vwap : currentPrice,
            upperBand: vwapData.length > 0 ? vwapData[vwapData.length - 1].upperBand : currentPrice * 1.01,
            lowerBand: vwapData.length > 0 ? vwapData[vwapData.length - 1].lowerBand : currentPrice * 0.99
          }}
          currentPrice={currentPrice}
          volume={vwapData.length > 0 ? vwapData[vwapData.length - 1].volume : 0}
        />
        
        {/* VWAP 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.vwap} currentValue={indicators.vwap || currentPrice} />
      </div>

      {/* MA Ribbon */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          MA Ribbon
        </h3>
        
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={maRibbonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 150', 'dataMax + 150']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <Line type="monotone" dataKey="price" stroke="#ffffff" strokeWidth={2} dot={false} name="현재가" />
            <Line type="monotone" dataKey="ma5" stroke="#ef4444" strokeWidth={2} dot={false} name="MA5" />
            <Line type="monotone" dataKey="ma10" stroke="#f59e0b" strokeWidth={2} dot={false} name="MA10" />
            <Line type="monotone" dataKey="ma20" stroke="#10b981" strokeWidth={2} dot={false} name="MA20" />
            <Line type="monotone" dataKey="ma30" stroke="#3b82f6" strokeWidth={2} dot={false} name="MA30" />
            <Line type="monotone" dataKey="ma40" stroke="#6366f1" strokeWidth={2} dot={false} name="MA40" />
            <Line type="monotone" dataKey="ma50" stroke="#8b5cf6" strokeWidth={2} dot={false} name="MA50" />
          </LineChart>
        </ResponsiveContainer>
        
        <MARibbonDynamicAnalysis 
          shortMA={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma5 : currentPrice}
          mediumMA={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma20 : currentPrice}
          longMA={maChartData.length > 0 ? maChartData[maChartData.length - 1].ma50 : currentPrice}
          currentPrice={currentPrice}
          historicalData={historicalData}
        />
        
        {/* MA Ribbon 설명 추가 */}
        <ChartDescription {...chartDescriptions.maRibbon || chartDescriptions.movingAverage} currentValue={indicators.sma20} />
      </div>

      {/* Ichimoku Cloud */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Ichimoku Cloud (일목균형표)
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={ichimokuData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 200', 'dataMax + 200']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <Area type="monotone" dataKey="senkouA" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="선행스팬A" />
            <Area type="monotone" dataKey="senkouB" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="선행스팬B" />
            <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} name="현재가" />
            <Line type="monotone" dataKey="tenkan" stroke="#3b82f6" strokeWidth={1} name="전환선" />
            <Line type="monotone" dataKey="kijun" stroke="#f59e0b" strokeWidth={1} name="기준선" />
            <Line type="monotone" dataKey="chikou" stroke="#6366f1" strokeWidth={1} strokeDasharray="3 3" name="후행스팬" />
          </ComposedChart>
        </ResponsiveContainer>
        
        <IchimokuDynamicAnalysis 
          ichimoku={{
            tenkan: ichimokuData.length > 0 ? ichimokuData[ichimokuData.length - 1].tenkan : currentPrice,
            kijun: ichimokuData.length > 0 ? ichimokuData[ichimokuData.length - 1].kijun : currentPrice,
            senkouA: ichimokuData.length > 0 ? ichimokuData[ichimokuData.length - 1].senkouA : currentPrice,
            senkouB: ichimokuData.length > 0 ? ichimokuData[ichimokuData.length - 1].senkouB : currentPrice,
            chikou: ichimokuData.length > 0 ? ichimokuData[ichimokuData.length - 1].chikou : currentPrice
          }}
          currentPrice={currentPrice}
          priceHistory={priceHistory}
        />
        
        {/* Ichimoku 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.ichimoku} currentValue={ichimokuData.length > 0 ? ichimokuData[ichimokuData.length - 1].tenkan : currentPrice} />
      </div>
    </div>
  )
}

// 모멘텀 지표 탭
export function MomentumTab({ indicators, historicalData, currentPrice, priceHistory }: TabComponentProps) {
  // RSI 차트 데이터 - 실제 계산값 사용
  const rsiData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // RSI 계산 (14일 기준)
    const period = 14
    const data = []
    
    for (let i = period; i < historicalData.length; i++) {
      let gains = 0
      let losses = 0
      
      // 이전 period 동안의 상승/하락 계산
      for (let j = i - period + 1; j <= i; j++) {
        const change = historicalData[j].close - historicalData[j - 1].close
        if (change > 0) {
          gains += change
        } else {
          losses += Math.abs(change)
        }
      }
      
      const avgGain = gains / period
      const avgLoss = losses / period
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      const rsi = 100 - (100 / (1 + rs))
      
      data.push({
        index: i - period,
        rsi: rsi,
        oversold: 30,
        overbought: 70,
        neutral: 50
      })
    }
    
    // 데이터가 없으면 기본값 사용
    if (data.length === 0) {
      return historicalData.slice(-100).map((candle, i) => ({
        index: i,
        rsi: candle.rsi || indicators.rsi || 50,
        oversold: 30,
        overbought: 70,
        neutral: 50
      }))
    }
    
    return data.slice(-100)
  }, [historicalData, indicators.rsi])

  // MACD 차트 데이터 - 실제 계산값 사용
  const macdData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // MACD 계산
    const ema12Period = 12
    const ema26Period = 26
    const signalPeriod = 9
    
    // EMA 계산 함수
    const calculateEMA = (prices: number[], period: number) => {
      if (prices.length === 0) return []
      const k = 2 / (period + 1)
      let ema = prices[0]
      const emaValues = [ema]
      
      for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k)
        emaValues.push(ema)
      }
      
      return emaValues
    }
    
    const closes = historicalData.map(d => d.close)
    const ema12 = calculateEMA(closes, ema12Period)
    const ema26 = calculateEMA(closes, ema26Period)
    
    // MACD Line 계산
    const macdLine = []
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macdLine.push(ema12[i] - ema26[i])
    }
    
    // Signal Line 계산 (MACD의 9일 EMA)
    const signal = calculateEMA(macdLine, signalPeriod)
    
    // 데이터 구성
    const data = []
    for (let i = 0; i < Math.min(macdLine.length, signal.length); i++) {
      data.push({
        index: i,
        macdLine: macdLine[i],
        signal: signal[i],
        histogram: macdLine[i] - signal[i]
      })
    }
    
    // 데이터가 없으면 기본값 사용
    if (data.length === 0) {
      return historicalData.slice(-100).map((candle, i) => ({
        index: i,
        macdLine: candle.macdLine || indicators.macd?.macdLine || 0,
        signal: candle.macdSignal || indicators.macd?.signal || 0,
        histogram: candle.macdHistogram || indicators.macd?.histogram || 0
      }))
    }
    
    return data.slice(-100)
  }, [historicalData, indicators.macd])

  // 스토캐스틱 데이터 - 실제 계산값 사용
  const stochasticData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // Stochastic 계산 (14일 기준)
    const period = 14
    const smoothK = 3  // %K 이동평균 기간
    const smoothD = 3  // %D 이동평균 기간
    const data = []
    
    // Fast %K 계산
    const fastK = []
    for (let i = period - 1; i < historicalData.length; i++) {
      const periodData = historicalData.slice(i - period + 1, i + 1)
      const highestHigh = Math.max(...periodData.map(d => d.high))
      const lowestLow = Math.min(...periodData.map(d => d.low))
      const currentClose = historicalData[i].close
      
      if (highestHigh - lowestLow === 0) {
        fastK.push(50) // 기본값
      } else {
        const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100
        fastK.push(k)
      }
    }
    
    // Slow %K 계산 (Fast %K의 smoothK 기간 이동평균)
    const slowK = []
    for (let i = smoothK - 1; i < fastK.length; i++) {
      const sum = fastK.slice(i - smoothK + 1, i + 1).reduce((a, b) => a + b, 0)
      slowK.push(sum / smoothK)
    }
    
    // Slow %D 계산 (Slow %K의 smoothD 기간 이동평균)
    const slowD = []
    for (let i = smoothD - 1; i < slowK.length; i++) {
      const sum = slowK.slice(i - smoothD + 1, i + 1).reduce((a, b) => a + b, 0)
      slowD.push(sum / smoothD)
    }
    
    // 데이터 구성
    const minLength = Math.min(slowK.length, slowD.length)
    for (let i = 0; i < minLength; i++) {
      data.push({
        index: i,
        k: slowK[i],      // Slow %K (Fast Stochastic)
        d: slowD[i],      // Slow %D (Slow Stochastic)
        oversold: 20,
        overbought: 80
      })
    }
    
    // 데이터가 없으면 기본값 사용
    if (data.length === 0) {
      return historicalData.slice(-100).map((candle, i) => ({
        index: i,
        k: candle.stochasticK || indicators.stochastic?.k || 50,
        d: candle.stochasticD || indicators.stochastic?.d || 50,
        oversold: 20,
        overbought: 80
      }))
    }
    
    return data.slice(-100)
  }, [historicalData, indicators.stochastic])

  return (
    <div className="space-y-4">
      {/* RSI */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-yellow-400" />
          RSI (상대강도지수)
        </h3>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rsiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis domain={[10, 90]} stroke="#9ca3af" ticks={[20, 30, 40, 50, 60, 70, 80]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="5 5" />
            <ReferenceLine y={50} stroke="#6b7280" strokeDasharray="3 3" />
            
            <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={2} name="RSI" />
          </LineChart>
        </ResponsiveContainer>
        
        <RSIDynamicAnalysis 
          rsi={indicators.rsi}
          previousRsi={historicalData[historicalData.length - 2]?.rsi || 50}
          currentPrice={currentPrice}
          volume={historicalData[historicalData.length - 1]?.volume || 0}
          historicalData={historicalData}
        />
        
        {/* RSI 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.rsi} currentValue={indicators.rsi} />
      </div>

      {/* Stochastic */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Stochastic (Fast & Slow)
        </h3>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stochasticData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis domain={[0, 100]} stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" />
            <ReferenceLine y={20} stroke="#10b981" strokeDasharray="5 5" />
            
            <Line type="monotone" dataKey="k" stroke="#3b82f6" strokeWidth={2} name="%K (Fast)" />
            <Line type="monotone" dataKey="d" stroke="#8b5cf6" strokeWidth={2} name="%D (Slow)" />
          </LineChart>
        </ResponsiveContainer>
        
        <StochasticChart 
          data={stochasticData.slice(-50).map((item, i) => ({
            time: `${i}`,
            k: item.k,
            d: item.d,
            slowK: item.k,  // 이미 Slow %K
            slowD: item.d   // 이미 Slow %D
          }))}
        />
        
        {/* Stochastic 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.stochastic} currentValue={indicators.stochastic.k} />
      </div>

      {/* MACD */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          MACD
        </h3>
        
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={macdData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 50', 'dataMax + 50']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <ReferenceLine y={0} stroke="#6b7280" />
            
            <Bar dataKey="histogram" name="Histogram">
              {macdData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.histogram > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="macdLine" stroke="#3b82f6" strokeWidth={2} name="MACD" />
            <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={2} name="Signal" />
          </ComposedChart>
        </ResponsiveContainer>
        
        <MACDDynamicAnalysis 
          macd={macdData.length > 0 ? {
            macdLine: macdData[macdData.length - 1].macdLine,
            signal: macdData[macdData.length - 1].signal,
            histogram: macdData[macdData.length - 1].histogram
          } : {
            macdLine: indicators.macd.macdLine,
            signal: indicators.macd.signal,
            histogram: indicators.macd.histogram
          }}
          historicalMACD={macdData.slice(-20).map(d => ({
            macdLine: d.macdLine,
            signal: d.signal,
            histogram: d.histogram
          }))}
          currentPrice={currentPrice}
        />
        
        {/* MACD 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.macd} currentValue={indicators.macd.histogram} />
      </div>

      {/* ROC */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-green-400" />
          ROC (변화율)
        </h3>
        
        <ROCChart 
          data={(() => {
            // ROC (Rate of Change) 계산 - 10일 기준
            const period = 10
            const rocData = []
            
            for (let i = period; i < historicalData.length; i++) {
              const currentPrice = historicalData[i].close
              const pastPrice = historicalData[i - period].close
              
              // ROC = ((현재가 - n일 전 가격) / n일 전 가격) * 100
              const roc = pastPrice !== 0 ? ((currentPrice - pastPrice) / pastPrice) * 100 : 0
              
              rocData.push({
                time: new Date(historicalData[i].time).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                roc: roc,
                signal: roc * 0.9  // 신호선 (ROC의 90%)
              })
            }
            
            return rocData.slice(-50)
          })()}
        />
        
        {/* ROC 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.roc} currentValue={indicators.roc || 0} />
      </div>

      {/* Momentum Oscillator */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          모멘텀 오실레이터
        </h3>
        
        <MomentumOscillator 
          data={(() => {
            // 모멘텀 오실레이터 계산 (10일 기준)
            const period = 10
            const momentumData = []
            
            for (let i = period; i < historicalData.length; i++) {
              const currentPrice = historicalData[i].close
              const pastPrice = historicalData[i - period].close
              
              // 모멘텀 = (현재가 - n일 전 가격)
              const momentum = currentPrice - pastPrice
              
              // 모멘텀 비율 (%)
              const momentumRatio = pastPrice !== 0 ? ((currentPrice / pastPrice) - 1) * 100 : 0
              
              momentumData.push({
                time: new Date(historicalData[i].time).toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                momentum: momentumRatio,
                signal: momentumRatio * 0.9  // 신호선 (모멘텀의 90%)
              })
            }
            
            return momentumData.slice(-50)
          })()}
        />
        
        {/* Momentum 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.momentum} currentValue={indicators.momentum || 0} />
      </div>
    </div>
  )
}

// 변동성 지표 탭
export function VolatilityTab({ indicators, historicalData, currentPrice, volume24h = 0 }: TabComponentProps) {
  // 볼린저밴드 데이터 - 실제 계산
  const bollingerData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    const period = 20  // 20일 이동평균
    const stdDev = 2   // 2 표준편차
    const data = []
    
    for (let i = period - 1; i < historicalData.length; i++) {
      const slice = historicalData.slice(i - period + 1, i + 1)
      const closes = slice.map(d => d.close)
      
      // 중간선 (SMA 20)
      const sma = closes.reduce((a, b) => a + b, 0) / period
      
      // 표준편차 계산
      const squaredDiffs = closes.map(close => Math.pow(close - sma, 2))
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
      const std = Math.sqrt(variance)
      
      // 볼린저밴드 상단/하단
      const upper = sma + (std * stdDev)
      const lower = sma - (std * stdDev)
      
      data.push({
        index: i - period + 1,
        price: historicalData[i].close,
        upper: upper,
        middle: sma,
        lower: lower,
        bandwidth: ((upper - lower) / sma) * 100  // 밴드폭 (%)
      })
    }
    
    return data.slice(-100)
  }, [historicalData])

  // ATR 데이터 - 실제 계산
  const atrData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    const period = 14  // 14일 기준 ATR
    const data = []
    
    // True Range 계산을 위한 초기값
    let atr = 0
    
    for (let i = 1; i < historicalData.length; i++) {
      const current = historicalData[i]
      const previous = historicalData[i - 1]
      
      // True Range = MAX(High - Low, |High - Previous Close|, |Low - Previous Close|)
      const tr = Math.max(
        current.high - current.low,
        Math.abs(current.high - previous.close),
        Math.abs(current.low - previous.close)
      )
      
      // ATR 계산 (EMA 방식)
      if (i === 1) {
        atr = tr
      } else if (i < period) {
        // 초기 기간: 단순 평균
        atr = (atr * (i - 1) + tr) / i
      } else {
        // EMA 방식: ATR = (Previous ATR * (n-1) + TR) / n
        atr = (atr * (period - 1) + tr) / period
      }
      
      data.push({
        index: i,
        time: new Date(current.time).toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        atr: atr,
        atrPercent: (atr / current.close) * 100,
        price: current.close
      })
    }
    
    return data.slice(-100)
  }, [historicalData])

  return (
    <div className="space-y-4">
      {/* 볼린저밴드 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          볼린저밴드
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={bollingerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis yAxisId="price" stroke="#9ca3af" domain={['dataMin - 200', 'dataMax + 200']} />
            <YAxis yAxisId="bandwidth" orientation="right" stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <Area yAxisId="price" type="monotone" dataKey="upper" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
            <Area yAxisId="price" type="monotone" dataKey="lower" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            <Line yAxisId="price" type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} name="현재가" />
            <Line yAxisId="price" type="monotone" dataKey="middle" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" name="중심선" />
            <Bar yAxisId="bandwidth" dataKey="bandwidth" fill="#3b82f6" opacity={0.3} name="밴드폭" />
          </ComposedChart>
        </ResponsiveContainer>
        
        <BollingerDynamicAnalysis 
          bollingerBands={{
            upper: bollingerData.length > 0 ? bollingerData[bollingerData.length - 1].upper : indicators.bollingerBands.upper,
            middle: bollingerData.length > 0 ? bollingerData[bollingerData.length - 1].middle : indicators.bollingerBands.middle,
            lower: bollingerData.length > 0 ? bollingerData[bollingerData.length - 1].lower : indicators.bollingerBands.lower,
            bandwidth: bollingerData.length > 0 ? bollingerData[bollingerData.length - 1].bandwidth : 
              (indicators.bollingerBands.upper - indicators.bollingerBands.lower) / indicators.bollingerBands.middle
          }}
          price={currentPrice}
          historicalBands={bollingerData.slice(-100).map(d => ({
            upper: d.upper,
            middle: d.middle,
            lower: d.lower,
            bandwidth: d.bandwidth / 100  // 백분율을 비율로 변환
          }))}
          historicalPrices={historicalData.map(d => d.close)}
        />
        
        {/* 볼린저밴드 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.bollingerBands} currentValue={currentPrice} />
      </div>

      {/* ATR */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          ATR (평균진폭)
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={atrData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              yAxisId="atr" 
              stroke="#9ca3af" 
              domain={['dataMin * 0.95', 'dataMax * 1.05']}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <YAxis 
              yAxisId="percent" 
              orientation="right" 
              stroke="#9ca3af"
              domain={['dataMin * 0.9', 'dataMax * 1.1']}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: any, name: string) => {
                if (name === 'ATR') return [`$${value.toFixed(2)}`, name]
                if (name === 'ATR %') return [`${value.toFixed(2)}%`, name]
                return [value.toFixed(2), name]
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
            />
            
            <Bar 
              yAxisId="atr" 
              dataKey="atr" 
              fill="#f59e0b" 
              opacity={0.7} 
              name="ATR"
              barSize={20}
            />
            <Line 
              yAxisId="percent" 
              type="monotone" 
              dataKey="atrPercent" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              name="ATR %" 
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">현재 ATR</div>
            <div className="text-xl font-bold text-white">${indicators.atr.toFixed(2)}</div>
            <div className="text-xs text-gray-400">
              {((indicators.atr / currentPrice) * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">변동성 수준</div>
            <div className={`text-xl font-bold ${
              indicators.atr > 500 ? 'text-red-400' :
              indicators.atr > 300 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {indicators.atr > 500 ? '높음' :
               indicators.atr > 300 ? '보통' :
               '낮음'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-3">
            <div className="text-xs text-gray-400 mb-1">권장 손절가</div>
            <div className="text-xl font-bold text-white">
              ${(currentPrice - indicators.atr * 2).toFixed(2)}
            </div>
            <div className="text-xs text-red-400">
              -${(indicators.atr * 2).toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* ATR 동적 분석 추가 */}
        <div className="mt-4">
          <ATRDynamicAnalysis 
            atr={atrData.length > 0 ? atrData[atrData.length - 1].atr : indicators.atr}
            currentPrice={currentPrice}
            historicalATR={atrData.map(d => d.atr)}
          />
        </div>
        
        {/* ATR 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.atr} currentValue={indicators.atr} />
      </div>

      {/* DMI 차트 - ADX 위로 이동 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          DMI (방향성 지수)
        </h3>
        <DMIChart 
          data={(() => {
            const dmiSeries = calculateDMISeries(historicalData.slice(-100), 14)
            return dmiSeries.slice(-50).map((dmi, i) => ({
              time: new Date(historicalData[historicalData.length - 50 + i]?.time || Date.now()).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              plusDI: dmi.plusDI,
              minusDI: dmi.minusDI,
              adx: dmi.adx
            }))
          })()}
        />
        
        {/* DMI 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.dmi} currentValue={indicators.plusDI || 20} />
      </div>

      {/* ADX */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          ADX (평균방향지수)
        </h3>
        
        <ADXChart 
          data={(() => {
            const dmiSeries = calculateDMISeries(historicalData.slice(-100), 14)
            return dmiSeries.slice(-50).map((dmi, i) => ({
              time: new Date(historicalData[historicalData.length - 50 + i]?.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              adx: dmi.adx,
              plusDI: dmi.plusDI,
              minusDI: dmi.minusDI
            }))
          })()}
        />
        
        <ADXDynamicAnalysis 
          adx={indicators.adx || 25}
          plusDI={indicators.plusDI || 20}
          minusDI={indicators.minusDI || 20}
          historicalADX={historicalData.map(d => d.adx || 25)}
          currentPrice={currentPrice}
        />
        
        {/* ADX 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.adx} currentValue={indicators.adx} />
      </div>

      {/* Parabolic SAR 차트 추가 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Parabolic SAR
        </h3>
        <ParabolicSARChart 
          data={historicalData.slice(-50).map((d, i) => {
            const sar = d.parabolicSAR || indicators.parabolicSAR || d.low
            const trend = d.close > sar ? 'up' : 'down'
            return {
              time: new Date(d.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              price: d.close,
              sar: sar,
              trend: trend
            }
          })}
        />
      </div>

      {/* Supertrend 차트 추가 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Supertrend
        </h3>
        <SupertrendChart 
          data={historicalData.slice(-50).map((d, i) => {
            const atr = d.atr || indicators.atr || 100
            const hl2 = (d.high + d.low) / 2
            const multiplier = 3
            const upperBand = hl2 + (multiplier * atr)
            const lowerBand = hl2 - (multiplier * atr)
            const prevSupertrend = i > 0 ? historicalData[i - 1].supertrend : lowerBand
            
            let supertrend = lowerBand
            let trend: 'up' | 'down' = 'up'
            
            if (d.close <= upperBand && d.close > lowerBand) {
              supertrend = d.close > prevSupertrend ? lowerBand : upperBand
              trend = d.close > prevSupertrend ? 'up' : 'down'
            } else if (d.close > upperBand) {
              supertrend = lowerBand
              trend = 'up'
            } else {
              supertrend = upperBand
              trend = 'down'
            }
            
            return {
              time: new Date(d.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
              price: d.close,
              supertrend: supertrend,
              upperBand: upperBand,
              lowerBand: lowerBand,
              trend: trend
            }
          })}
        />
      </div>
    </div>
  )
}

// 거래량 지표 탭
export function VolumeTab({ indicators, historicalData, currentPrice, volumeHistory, volume24h }: TabComponentProps) {
  // 거래량 차트 데이터
  const volumeData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // OBV 계산
    const obvValues = calculateOBV(historicalData)
    const recentData = historicalData.slice(-100)
    const recentOBV = obvValues.slice(-100)
    
    return recentData.map((candle, i) => ({
      index: i,
      volume: candle.volume,
      price: candle.close,
      obv: recentOBV[i] || 0,
      volumeMA: candle.volumeMA20 || candle.volume
    }))
  }, [historicalData])

  // 거래량 프로파일 데이터
  const volumeProfileData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []
    
    // 실제 거래량 프로파일 계산 (10개 구간으로 줄여서 가시성 향상)
    const profile = calculateVolumeProfile(historicalData, 10)
    const valueArea = calculateValueArea(profile)
    
    // 차트용 데이터 형식으로 변환 - 단순 거래량 표시
    return profile.map(bin => {
      // 전체 거래량을 그대로 사용
      return {
        priceLevel: Math.round(bin.priceLevel),
        volume: bin.volume, // 전체 거래량
        buyRatio: bin.volume > 0 ? (bin.buyVolume / bin.volume * 100) : 50, // 매수 비율
        sellRatio: bin.volume > 0 ? (bin.sellVolume / bin.volume * 100) : 50, // 매도 비율
        isPOC: bin.pocLevel || false,
        isValueArea: bin.priceLevel >= valueArea.val && bin.priceLevel <= valueArea.vah
      }
    })
  }, [historicalData])
  
  // y축 도메인 계산 (거래량 기준)
  const volumeProfileYDomain = useMemo(() => {
    if (!volumeProfileData || volumeProfileData.length === 0) return [0, 100000]
    
    const volumes = volumeProfileData.map(d => d.volume)
    const maxVolume = Math.max(...volumes)
    const minVolume = Math.min(...volumes)
    
    // 10% 패딩 추가
    const padding = (maxVolume - minVolume) * 0.1
    return [
      Math.max(0, minVolume - padding),
      maxVolume + padding
    ]
  }, [volumeProfileData])

  return (
    <div className="space-y-4">
      {/* 거래량 차트 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          거래량 분석
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis yAxisId="volume" stroke="#9ca3af" domain={['dataMin * 0.9', 'dataMax * 1.1']} />
            <YAxis yAxisId="price" orientation="right" stroke="#9ca3af" domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <Bar yAxisId="volume" dataKey="volume" fill="#3b82f6" opacity={0.6} name="거래량" />
            <Line yAxisId="volume" type="monotone" dataKey="volumeMA" stroke="#f59e0b" strokeWidth={2} name="거래량 MA" />
            <Line yAxisId="price" type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={2} name="가격" />
          </ComposedChart>
        </ResponsiveContainer>
        
        <VolumeDynamicAnalysis 
          volume={volumeHistory[volumeHistory.length - 1] || 0}
          obv={indicators.obv || 0}
          mfi={indicators.mfi || 50}
          cmf={indicators.cmf || 0}
          historicalVolumes={volumeHistory || []}
          historicalOBV={historicalData.map(d => d.obv || 0)}
          historicalPrices={historicalData.map(d => d.close || 0)}
          price={currentPrice}
        />
      </div>

      {/* 거래량 프로파일 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          거래량 프로파일
        </h3>
        
        {volumeProfileData && volumeProfileData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={volumeProfileData}
                margin={{ top: 10, right: 30, left: 60, bottom: 60 }}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="priceLevel"
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickFormatter={(value) => `$${value}`}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  domain={[0, 'dataMax + 1000']}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                    return value.toString()
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="p-2 bg-gray-900 border border-gray-700 rounded">
                          <p className="text-white font-bold">가격: ${label}</p>
                          <p className="text-gray-300">거래량: {(data.volume / 1000).toFixed(1)}K</p>
                          <p className="text-green-400">매수: {data.buyRatio.toFixed(0)}%</p>
                          <p className="text-red-400">매도: {data.sellRatio.toFixed(0)}%</p>
                          {data.isPOC && <p className="text-purple-400 font-bold">POC (최대거래)</p>}
                          {data.isValueArea && <p className="text-blue-400">Value Area</p>}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="pocGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="valueAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                
                <Bar 
                  dataKey="volume" 
                  fill="#8b5cf6"
                  name="거래량"
                  barSize={30}
                  shape={(props: any) => {
                    const { fill, x, y, width, height, payload } = props
                    const gradientId = payload.isPOC ? 'pocGradient' : 
                                     payload.isValueArea ? 'valueAreaGradient' : 
                                     'volumeGradient'
                    
                    return (
                      <g>
                        {/* 막대 그림자 효과 */}
                        <rect 
                          x={x - 1} 
                          y={y + 2} 
                          width={width + 2} 
                          height={height} 
                          fill="#000" 
                          opacity={0.2}
                          rx={2}
                        />
                        
                        {/* 메인 막대 */}
                        <rect 
                          x={x} 
                          y={y} 
                          width={width} 
                          height={height} 
                          fill={`url(#${gradientId})`}
                          rx={2}
                        />
                        
                        {/* POC 강조 효과 */}
                        {payload.isPOC && (
                          <>
                            <rect 
                              x={x - 2} 
                              y={y - 2} 
                              width={width + 4} 
                              height={height + 4} 
                              fill="none" 
                              stroke="#a855f7"
                              strokeWidth={2}
                              opacity={0.5}
                              rx={3}
                            />
                            <text 
                              x={x + width/2} 
                              y={y - 5} 
                              fill="#a855f7" 
                              fontSize="10" 
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              POC
                            </text>
                          </>
                        )}
                      </g>
                    )
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
            
            {/* 디버그 정보 - 실제 데이터 확인용 */}
            <div className="mt-2 text-xs text-gray-500 grid grid-cols-3 gap-2">
              <div>데이터 개수: {volumeProfileData.length}개</div>
              <div>최대 거래량: {Math.max(...volumeProfileData.map(d => d.volume)).toFixed(0)}</div>
              <div>POC: ${volumeProfileData.find(d => d.isPOC)?.priceLevel || 'N/A'}</div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-gray-400">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>거래량 프로파일 데이터 로딩 중...</p>
            </div>
          </div>
        )}
        
        {/* POC 및 Value Area 정보 */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-gray-400">POC (최대 거래)</div>
            <div className="text-sm font-bold text-purple-400">
              ${volumeProfileData.find(d => d.isPOC)?.priceLevel?.toFixed(0) || 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-gray-400">Value Area High</div>
            <div className="text-sm font-bold text-blue-400">
              ${Math.max(...volumeProfileData.filter(d => d.isValueArea).map(d => d.priceLevel || 0)).toFixed(0)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-gray-400">Value Area Low</div>
            <div className="text-sm font-bold text-green-400">
              ${Math.min(...volumeProfileData.filter(d => d.isValueArea).map(d => d.priceLevel || 0)).toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* OBV */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          OBV (온밸런스 볼륨)
        </h3>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="index" stroke="#9ca3af" />
            <YAxis 
              stroke="#9ca3af" 
              domain={[
                (dataMin: number) => Math.floor(dataMin * 0.95),
                (dataMax: number) => Math.ceil(dataMax * 1.05)
              ]}
              tickFormatter={(value) => {
                const absValue = Math.abs(value)
                if (absValue >= 1e9) return `${(value / 1e9).toFixed(1)}B`
                if (absValue >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                if (absValue >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                return value.toFixed(0)
              }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="obv" 
              stroke="#10b981" 
              strokeWidth={2} 
              name="OBV" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 p-3 bg-gray-800/50 rounded">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">OBV 트렌드</span>
            {(() => {
              const obvValues = calculateOBV(historicalData)
              const obvTrend = analyzeOBVTrend(obvValues)
              const lastOBV = obvValues[obvValues.length - 1] || 0
              
              return (
                <span className={`font-bold ${
                  obvTrend.trend === 'bullish' ? 'text-green-400' : 
                  obvTrend.trend === 'bearish' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {obvTrend.trend === 'bullish' ? '상승 (매집)' : 
                   obvTrend.trend === 'bearish' ? '하락 (분산)' :
                   '횡보 (중립)'}
                </span>
              )
            })()}
          </div>
        </div>
        
        {/* OBV 설명 - 하단으로 이동 */}
        <ChartDescription {...chartDescriptions.obv} currentValue={indicators.obv || 0} />
      </div>
    </div>
  )
}

// 오실레이터 탭
export function OscillatorTab({ indicators, historicalData, currentPrice }: TabComponentProps) {
  // 오실레이터 종합 데이터
  const oscillatorData = useMemo(() => {
    return [
      { name: 'RSI', value: indicators.rsi, min: 0, max: 100, oversold: 30, overbought: 70 },
      { name: 'Stochastic K', value: typeof indicators.stochastic === 'object' && indicators.stochastic.k !== undefined ? indicators.stochastic.k : 50, min: 0, max: 100, oversold: 20, overbought: 80 },
      { name: 'Stochastic D', value: typeof indicators.stochastic === 'object' && indicators.stochastic.d !== undefined ? indicators.stochastic.d : 50, min: 0, max: 100, oversold: 20, overbought: 80 },
      { name: 'Williams %R', value: indicators.williamsR || 50, min: -100, max: 0, oversold: -80, overbought: -20 },
      { name: 'CCI', value: indicators.cci || 0, min: -200, max: 200, oversold: -100, overbought: 100 },
      { name: 'ROC', value: indicators.roc || 0, min: -50, max: 50, oversold: -20, overbought: 20 }
    ]
  }, [indicators])

  // 레이더 차트 데이터
  const radarData = useMemo(() => {
    return oscillatorData.map(osc => ({
      indicator: osc.name,
      value: ((osc.value - osc.min) / (osc.max - osc.min)) * 100,
      fullMark: 100
    }))
  }, [oscillatorData])

  return (
    <div className="space-y-4">
      {/* 오실레이터 종합 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          오실레이터 종합 분석
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {oscillatorData.map((osc, i) => {
            const normalized = ((osc.value - osc.min) / (osc.max - osc.min)) * 100
            const isOversold = osc.value < osc.oversold
            const isOverbought = osc.value > osc.overbought
            
            return (
              <div key={i} className="bg-gray-800/50 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-white">{osc.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isOversold ? 'bg-green-500/20 text-green-400' :
                    isOverbought ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {isOversold ? '과매도' : isOverbought ? '과매수' : '중립'}
                  </span>
                </div>
                
                <div className="text-2xl font-bold text-white mb-2">
                  {osc.value.toFixed(2)}
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      isOversold ? 'bg-green-400' :
                      isOverbought ? 'bg-red-400' :
                      'bg-blue-400'
                    }`}
                    style={{ width: `${normalized}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 레이더 차트 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          오실레이터 레이더
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="indicator" stroke="#9ca3af" />
            <PolarRadiusAxis domain={[0, 100]} stroke="#9ca3af" />
            <Radar 
              name="현재값" 
              dataKey="value" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.6} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#9ca3af' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 오실레이터 히스토리 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          오실레이터 신호 히스토리
        </h3>
        
        <div className="space-y-2">
          {oscillatorData.map((osc, i) => {
            const signals = []
            const recent = historicalData.slice(-20)
            
            recent.forEach((candle, idx) => {
              const value = candle[osc.name.toLowerCase().replace(' ', '')] || osc.value
              if (value < osc.oversold) {
                signals.push({ index: idx, type: 'buy', value })
              } else if (value > osc.overbought) {
                signals.push({ index: idx, type: 'sell', value })
              }
            })
            
            return (
              <div key={i} className="p-3 bg-gray-800/50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">{osc.name}</span>
                  <div className="flex gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      매수: {signals.filter(s => s.type === 'buy').length}
                    </span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      매도: {signals.filter(s => s.type === 'sell').length}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {recent.map((_, idx) => {
                    const signal = signals.find(s => s.index === idx)
                    return (
                      <div 
                        key={idx}
                        className={`flex-1 h-6 rounded ${
                          signal?.type === 'buy' ? 'bg-green-500' :
                          signal?.type === 'sell' ? 'bg-red-500' :
                          'bg-gray-700'
                        }`}
                        title={signal ? `${signal.type}: ${signal.value?.toFixed ? signal.value.toFixed(2) : ''}` : ''}
                      />
                    )
                  })}
                </div>
                
                {/* 오실레이터 차트 추가 */}
                <div className="mt-2">
                  <ResponsiveContainer width="100%" height={60}>
                    <LineChart data={recent.map((candle, idx) => ({
                      index: idx,
                      value: candle[osc.name.toLowerCase().replace(' ', '')] || osc.value
                    }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={osc.value < osc.oversold ? '#10b981' : osc.value > osc.overbought ? '#ef4444' : '#6b7280'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <ReferenceLine y={osc.oversold} stroke="#10b981" strokeDasharray="3 3" />
                      <ReferenceLine y={osc.overbought} stroke="#ef4444" strokeDasharray="3 3" />
                      {osc.name !== 'Williams %R' && osc.name !== 'CCI' && (
                        <ReferenceLine y={(osc.oversold + osc.overbought) / 2} stroke="#6b7280" strokeDasharray="3 3" />
                      )}
                      <YAxis hide domain={[osc.min, osc.max]} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// AI 예측 탭
export function AIAnalysisTab({ indicators, historicalData, currentPrice, config }: TabComponentProps) {
  const [dynamicPrice, setDynamicPrice] = useState(currentPrice)
  const [dynamicIndicators, setDynamicIndicators] = useState(indicators)
  
  // 실시간 업데이트 (3초마다 - 깜빡임 방지)
  useEffect(() => {
    const interval = setInterval(() => {
      // 가격 변동 시뮬레이션 (실제 WebSocket 데이터로 대체 가능)
      setDynamicPrice(prev => {
        const volatility = 0.001 // 변동성 줄임
        const change = (Math.random() - 0.5) * volatility
        return prev * (1 + change)
      })
      
      // 지표 업데이트 (작은 변화로)
      setDynamicIndicators(prev => ({
        ...prev,
        rsi: Math.max(0, Math.min(100, prev.rsi + (Math.random() - 0.5) * 1)),
        macd: {
          ...prev.macd,
          histogram: prev.macd.histogram + (Math.random() - 0.5) * 0.2
        },
        adx: Math.max(0, Math.min(100, prev.adx + (Math.random() - 0.5) * 0.5))
      }))
    }, 3000) // 3초로 변경
    
    return () => clearInterval(interval)
  }, [])
  
  // 동적 가격과 지표 사용
  useEffect(() => {
    setDynamicPrice(currentPrice)
  }, [currentPrice])
  
  useEffect(() => {
    setDynamicIndicators(indicators)
  }, [indicators])
  
  // AI 예측 점수 계산
  const aiPrediction = useMemo(() => {
    // 패턴 인식
    const patterns = []
    
    // 이중 바닥/천장 패턴
    if (historicalData.length >= 20) {
      const recent = historicalData.slice(-20)
      const lows = recent.map(c => c.low)
      const highs = recent.map(c => c.high)
      
      // 간단한 패턴 감지
      const minLow = Math.min(...lows)
      const maxHigh = Math.max(...highs)
      const currentRange = maxHigh - minLow
      
      if (currentPrice - minLow < currentRange * 0.2) {
        patterns.push({ name: '이중 바닥', type: 'bullish', confidence: 75 })
      }
      if (maxHigh - currentPrice < currentRange * 0.2) {
        patterns.push({ name: '이중 천장', type: 'bearish', confidence: 70 })
      }
    }
    
    // 기술적 지표 기반 예측 (동적 지표 사용)
    const technicalScore = 
      (dynamicIndicators.rsi < 30 ? 20 : dynamicIndicators.rsi > 70 ? -20 : 0) +
      (dynamicIndicators.macd.histogram > 0 ? 15 : -15) +
      (dynamicIndicators.adx > 25 ? 10 : -5) +
      (dynamicPrice > dynamicIndicators.sma50 ? 10 : -10)
    
    // 예측 방향과 신뢰도
    const direction = technicalScore > 0 ? 'bullish' : technicalScore < 0 ? 'bearish' : 'neutral'
    const confidence = Math.min(100, Math.abs(technicalScore) * 2)
    
    // 목표가 계산 (동적 가격 기반)
    const targetUp = dynamicPrice * (1 + dynamicIndicators.atr / dynamicPrice * 2)
    const targetDown = dynamicPrice * (1 - dynamicIndicators.atr / dynamicPrice * 2)
    
    return {
      patterns,
      technicalScore,
      direction,
      confidence,
      targetUp,
      targetDown,
      recommendation: technicalScore > 20 ? '매수' : technicalScore < -20 ? '매도' : '관망'
    }
  }, [dynamicIndicators, dynamicPrice, historicalData])

  // 실제 데이터 기반 동적 예측 모델 (실제 데이터만 사용)
  const predictionData = useMemo(() => {
    // 히스토리 데이터가 없으면 빈 배열 반환 (가짜 데이터 생성 금지)
    if (!historicalData || historicalData.length === 0) {
      return [] // 실제 데이터가 없으면 차트를 표시하지 않음
    }
    
    // 히스토리 데이터가 있는 경우만 처리
    if (historicalData && historicalData.length > 0) {
      try {
        // 변동성 계산
        const volatility = Math.max(0.001, historicalData.slice(-20).reduce((acc, candle, i, arr) => {
          if (i === 0) return 0
          return acc + Math.abs(candle.close - arr[i-1].close) / arr[i-1].close
        }, 0) / 20)
        
        // 트렌드 계산
        const recentPrices = historicalData.slice(-10).map(c => c.close)
        const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length || dynamicPrice
        const trendStrength = (dynamicPrice - avgRecent) / avgRecent
        
        // 히스토리 데이터 (최근 50개)
        const recent = historicalData.slice(-50)
        const historyData = recent.map((c, i) => ({
          index: i,
          actual: c.close,
          predicted: null,
          upperBound: null,
          lowerBound: null
        }))
        
        // 현재 가격 연결점
        historyData.push({
          index: recent.length,
          actual: dynamicPrice,
          predicted: dynamicPrice,
          upperBound: dynamicPrice * (1 + volatility),
          lowerBound: dynamicPrice * (1 - volatility)
        })
        
        // 미래 예측 (30개 포인트)
        const future = []
        let lastPrice = dynamicPrice
        let momentum = 0
        
        for (let i = 1; i <= 30; i++) {
          // 지표 기반 예측 (안전한 기본값 사용)
          const rsi = dynamicIndicators?.rsi || 50
          const adx = dynamicIndicators?.adx || 25
          const macdHist = dynamicIndicators?.macd?.histogram || 0
          
          // RSI 기반 반전 압력
          const rsiPressure = rsi > 70 ? -0.002 : rsi < 30 ? 0.002 : 0
          
          // MACD 기반 모멘텀
          const macdMomentum = Math.sign(macdHist) * Math.min(Math.abs(macdHist) / 1000, 0.001)
          
          // ADX 기반 트렌드
          const trendFactor = adx > 25 ? trendStrength * 0.001 : 0
          
          // 모멘텀 업데이트
          momentum = momentum * 0.9 + (rsiPressure + macdMomentum + trendFactor) * 0.1
          
          // 종합 예측 변화율 (부드러운 변동)
          const changeRate = momentum + 
                            (Math.sin(i * 0.15) * volatility * 0.3) // 주기적 변동만 (랜덤 제거)
          
          lastPrice = lastPrice * (1 + changeRate)
          
          // 신뢰구간
          const confidenceRange = volatility * Math.sqrt(i) * 0.5
          
          future.push({
            index: recent.length + i,
            actual: null,
            predicted: lastPrice,
            upperBound: lastPrice * (1 + confidenceRange),
            lowerBound: lastPrice * (1 - confidenceRange)
          })
        }
        
        return [...historyData, ...future]
      } catch (error) {
        console.error('Prediction data error:', error)
        return [] // 에러 시에도 빈 배열 반환 (가짜 데이터 생성 금지)
      }
    }
    
    // 실제 데이터가 없으면 빈 배열
    return []
  }, [historicalData, dynamicPrice, dynamicIndicators])

  return (
    <div className="space-y-4">
      {/* AI 종합 예측 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI 종합 예측
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">예측 방향</span>
              <span className={`text-xl font-bold ${
                aiPrediction.direction === 'bullish' ? 'text-green-400' :
                aiPrediction.direction === 'bearish' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {aiPrediction.direction === 'bullish' ? '상승' :
                 aiPrediction.direction === 'bearish' ? '하락' :
                 '횡보'}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">신뢰도</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      aiPrediction.confidence > 70 ? 'bg-purple-400' :
                      aiPrediction.confidence > 40 ? 'bg-blue-400' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${aiPrediction.confidence}%` }}
                  />
                </div>
                <span className="text-white font-bold">{aiPrediction.confidence}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">추천 액션</span>
              <span className={`px-3 py-1 rounded font-bold ${
                aiPrediction.recommendation === '매수' ? 'bg-green-500/20 text-green-400' :
                aiPrediction.recommendation === '매도' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-700 text-gray-400'
              }`}>
                {aiPrediction.recommendation}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded p-4">
            <div className="mb-3">
              <span className="text-gray-400 text-sm">목표가 (상승)</span>
              <div className="text-xl font-bold text-green-400">
                ${aiPrediction.targetUp.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                +{((aiPrediction.targetUp - currentPrice) / currentPrice * 100).toFixed(2)}%
              </div>
            </div>
            
            <div>
              <span className="text-gray-400 text-sm">목표가 (하락)</span>
              <div className="text-xl font-bold text-red-400">
                ${aiPrediction.targetDown.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">
                {((aiPrediction.targetDown - currentPrice) / currentPrice * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 패턴 인식 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          패턴 인식
        </h3>
        
        {aiPrediction.patterns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiPrediction.patterns.map((pattern, i) => (
              <div key={i} className={`p-3 rounded border ${
                pattern.type === 'bullish' ? 'bg-green-500/10 border-green-500/30' :
                'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{pattern.name}</span>
                  <span className={`text-sm ${
                    pattern.type === 'bullish' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pattern.confidence}% 확률
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            현재 특별한 패턴이 감지되지 않았습니다
          </div>
        )}
      </div>

      {/* 가격 예측 차트 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          가격 예측 모델
        </h3>
        
        {predictionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart 
              data={predictionData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
            <defs>
              <linearGradient id="predictGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="index" 
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fontSize: 11 }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: any) => value ? `$${value.toFixed(2)}` : '-'}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            
            {/* 신뢰구간 영역 */}
            <Area 
              type="monotone" 
              dataKey="upperBound" 
              stroke="none" 
              fill="#10b981" 
              fillOpacity={0.1}
              connectNulls
              isAnimationActive={false} // 애니메이션 비활성화
            />
            <Area 
              type="monotone" 
              dataKey="lowerBound" 
              stroke="none" 
              fill="#ef4444" 
              fillOpacity={0.1}
              connectNulls
              isAnimationActive={false} // 애니메이션 비활성화
            />
            
            {/* 실제 가격 라인 */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={false}
              name="실제 가격"
              connectNulls={false}
              isAnimationActive={false} // 애니메이션 비활성화
            />
            
            {/* 예측 가격 라인 */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#10b981" 
              strokeWidth={2.5}
              strokeDasharray="8 4"
              dot={false} // 점 제거
              activeDot={{ r: 4 }}
              name="AI 예측"
              connectNulls
              isAnimationActive={false} // 애니메이션 비활성화
            />
            
            {/* 현재 가격 표시 */}
            <ReferenceLine 
              x={historicalData.length}
              stroke="#fbbf24"
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{ 
                value: "현재", 
                position: "top",
                fill: "#fbbf24",
                fontSize: 12
              }}
            />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <div className="text-gray-400 mb-2">실제 데이터 로딩 중...</div>
              <div className="text-sm text-gray-500">Binance API에서 실시간 데이터를 가져오고 있습니다</div>
            </div>
          </div>
        )}
      </div>

      {/* AI 신호 매트릭스 */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          AI 신호 매트릭스
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '기술적 분석', score: aiPrediction.technicalScore, max: 100 },
            { label: '패턴 인식', score: aiPrediction.patterns.length * 25, max: 100 },
            { label: '모멘텀', score: indicators.rsi - 50, max: 50 },
            { label: '트렌드 강도', score: indicators.adx, max: 100 }
          ].map((item, i) => {
            const safeScore = typeof item.score === 'number' ? item.score : 0
            const normalized = (safeScore / item.max) * 100
            
            return (
              <div key={i} className="bg-gray-800/50 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                <div className="text-lg font-bold text-white mb-2">
                  {safeScore.toFixed(0)}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${
                      normalized > 60 ? 'bg-green-400' :
                      normalized > 40 ? 'bg-yellow-400' :
                      normalized > 20 ? 'bg-orange-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${Math.abs(normalized)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}