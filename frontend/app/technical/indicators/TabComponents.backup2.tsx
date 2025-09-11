'use client'

import React, { useMemo } from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import RSIDynamicAnalysis from '@/components/analysis/RSIDynamicAnalysis'
import MACDDynamicAnalysis from '@/components/analysis/MACDDynamicAnalysis'
import BollingerDynamicAnalysis from '@/components/analysis/BollingerDynamicAnalysis'
import VolumeDynamicAnalysis from '@/components/analysis/VolumeDynamicAnalysis'
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from 'lucide-react'

interface TabComponentProps {
  indicators: any
  historicalData: any[]
  currentPrice: number
  priceHistory: number[]
  volumeHistory: number[]
  config?: any
}

// 종합 탭 - 모든 지표 요약
export function ComprehensiveTab({ indicators, historicalData, currentPrice, priceHistory, config }: TabComponentProps) {
  const analysis = useMemo(() => {
    const signals = []
    
    // RSI 신호
    if (indicators.rsi < 30) signals.push({ type: 'buy', indicator: 'RSI', strength: 'strong', message: 'RSI 과매도 구간' })
    else if (indicators.rsi > 70) signals.push({ type: 'sell', indicator: 'RSI', strength: 'strong', message: 'RSI 과매수 구간' })
    
    // MACD 신호
    if (indicators.macd.histogram > 0 && indicators.macd.macdLine > indicators.macd.signal) {
      signals.push({ type: 'buy', indicator: 'MACD', strength: 'medium', message: 'MACD 골든크로스' })
    } else if (indicators.macd.histogram < 0 && indicators.macd.macdLine < indicators.macd.signal) {
      signals.push({ type: 'sell', indicator: 'MACD', strength: 'medium', message: 'MACD 데드크로스' })
    }
    
    // 볼린저밴드 신호
    if (currentPrice < indicators.bollingerBands.lower) {
      signals.push({ type: 'buy', indicator: 'BB', strength: 'strong', message: '볼린저 하단 돌파' })
    } else if (currentPrice > indicators.bollingerBands.upper) {
      signals.push({ type: 'sell', indicator: 'BB', strength: 'strong', message: '볼린저 상단 돌파' })
    }
    
    // 종합 점수 계산
    const buySignals = signals.filter(s => s.type === 'buy').length
    const sellSignals = signals.filter(s => s.type === 'sell').length
    const totalScore = (buySignals - sellSignals) * 20
    
    return { signals, buySignals, sellSignals, totalScore }
  }, [indicators, currentPrice])

  return (
    <div className="space-y-6">
      {/* 종합 신호 대시보드 */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 종합 기술적 분석</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">종합 신호</div>
            <div className={`text-2xl font-bold ${
              analysis.totalScore > 20 ? 'text-green-500' :
              analysis.totalScore < -20 ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {analysis.totalScore > 20 ? '강한 매수' :
               analysis.totalScore < -20 ? '강한 매도' :
               '중립'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              점수: {analysis.totalScore}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">매수 신호</div>
            <div className="text-2xl font-bold text-green-500">
              {analysis.buySignals}개
            </div>
            <div className="text-xs text-gray-500 mt-1">
              활성화된 매수 지표
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">매도 신호</div>
            <div className="text-2xl font-bold text-red-500">
              {analysis.sellSignals}개
            </div>
            <div className="text-xs text-gray-500 mt-1">
              활성화된 매도 지표
            </div>
          </div>
        </div>
        
        {/* 개별 신호 목록 */}
        <div className="space-y-2">
          {analysis.signals.map((signal, index) => (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
              signal.type === 'buy' ? 'bg-green-900/20 border border-green-500/30' :
              'bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="flex items-center gap-3">
                {signal.type === 'buy' ? 
                  <TrendingUp className="w-5 h-5 text-green-500" /> :
                  <TrendingDown className="w-5 h-5 text-red-500" />
                }
                <div>
                  <span className="font-bold text-white">{signal.indicator}</span>
                  <span className="text-gray-400 ml-2 text-sm">{signal.message}</span>
                </div>
              </div>
              <div className={`text-sm font-bold ${
                signal.strength === 'strong' ? 'text-yellow-500' :
                signal.strength === 'medium' ? 'text-blue-500' :
                'text-gray-500'
              }`}>
                {signal.strength === 'strong' ? '강함' :
                 signal.strength === 'medium' ? '보통' : '약함'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주요 지표 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">가격 & 이동평균</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData.slice(-100)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line type="monotone" dataKey="close" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sma20" stroke="#3B82F6" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="sma50" stroke="#EF4444" strokeWidth={1} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">RSI & MACD</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData.slice(-100)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="5 5" />
              <ReferenceLine y={30} stroke="#10B981" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="rsi" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// 추세 탭 - 이동평균, ADX, Ichimoku 등
export function TrendTab({ indicators, historicalData, currentPrice, config }: TabComponentProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📈 추세 분석</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">SMA 20</div>
            <div className={`text-lg font-bold ${currentPrice > indicators.sma.sma20 ? 'text-green-500' : 'text-red-500'}`}>
              {indicators.sma.sma20.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">SMA 50</div>
            <div className={`text-lg font-bold ${currentPrice > indicators.sma.sma50 ? 'text-green-500' : 'text-red-500'}`}>
              {indicators.sma.sma50.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">EMA 12</div>
            <div className={`text-lg font-bold ${currentPrice > indicators.ema.ema12 ? 'text-green-500' : 'text-red-500'}`}>
              {indicators.ema.ema12.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">ADX</div>
            <div className={`text-lg font-bold ${indicators.adx > 25 ? 'text-green-500' : 'text-yellow-500'}`}>
              {indicators.adx.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-white mb-3">추세 강도 분석</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">현재 추세</span>
              <span className={`font-bold ${
                indicators.adx > 25 && indicators.dmi.plusDI > indicators.dmi.minusDI ? 'text-green-500' :
                indicators.adx > 25 && indicators.dmi.plusDI < indicators.dmi.minusDI ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {indicators.adx > 25 && indicators.dmi.plusDI > indicators.dmi.minusDI ? '강한 상승세' :
                 indicators.adx > 25 && indicators.dmi.plusDI < indicators.dmi.minusDI ? '강한 하락세' :
                 '횡보'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">추세 강도</span>
              <span className="text-white font-bold">
                {indicators.adx > 40 ? '매우 강함' :
                 indicators.adx > 25 ? '강함' :
                 indicators.adx > 20 ? '보통' : '약함'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 모멘텀 탭 - RSI, MACD, Stochastic 등
export function MomentumTab({ indicators, historicalData, currentPrice, priceHistory, config }: TabComponentProps) {
  const historicalRSI = useMemo(() => {
    return historicalData.slice(-100).map(d => d.rsi || 50)
  }, [historicalData])

  const historicalMACD = useMemo(() => {
    return historicalData.slice(-100).map(d => d.macd || { macdLine: 0, signal: 0, histogram: 0 })
  }, [historicalData])

  return (
    <div className="space-y-6">
      {indicators.rsi && (
        <RSIDynamicAnalysis 
          rsi={indicators.rsi}
          historicalRSI={historicalRSI || []}
          price={currentPrice}
          historicalPrices={priceHistory || []}
        />
      )}
      
      {indicators.macd && (
        <MACDDynamicAnalysis
          macd={indicators.macd}
          historicalMACD={historicalMACD || []}
          price={currentPrice}
        />
      )}
      
      {/* Stochastic 분석 */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 스토캐스틱 분석</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">%K</div>
            <div className={`text-lg font-bold ${
              indicators.stochastic.k < 20 ? 'text-green-500' :
              indicators.stochastic.k > 80 ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {indicators.stochastic.k.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">%D</div>
            <div className={`text-lg font-bold ${
              indicators.stochastic.d < 20 ? 'text-green-500' :
              indicators.stochastic.d > 80 ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {indicators.stochastic.d.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 변동성 탭 - Bollinger Bands, ATR, Keltner 등
export function VolatilityTab({ indicators, historicalData, currentPrice, priceHistory, config }: TabComponentProps) {
  const historicalBB = useMemo(() => {
    return historicalData.slice(-100).map(d => d.bollingerBands || { upper: 0, middle: 0, lower: 0, bandwidth: 0 })
  }, [historicalData])

  return (
    <div className="space-y-6">
      {indicators.bollingerBands && (
        <BollingerDynamicAnalysis
          bollingerBands={indicators.bollingerBands}
          historicalBands={historicalBB || []}
          price={currentPrice}
          historicalPrices={priceHistory || []}
        />
      )}
      
      {/* ATR 분석 */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 변동성 지표</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">ATR</div>
            <div className="text-lg font-bold text-white">
              {indicators.atr.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              변동성: {indicators.atr > currentPrice * 0.02 ? '높음' : '보통'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">표준편차</div>
            <div className="text-lg font-bold text-white">
              {indicators.standardDeviation.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">Choppiness</div>
            <div className={`text-lg font-bold ${
              indicators.choppiness > 61.8 ? 'text-yellow-500' :
              indicators.choppiness < 38.2 ? 'text-green-500' :
              'text-gray-400'
            }`}>
              {indicators.choppiness.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 거래량 탭 - OBV, MFI, CMF 등
export function VolumeTab({ indicators, historicalData, currentPrice, volumeHistory, config }: TabComponentProps) {
  const volume = useMemo(() => ({
    obv: indicators.obv,
    mfi: indicators.mfi,
    cmf: indicators.cmf,
    adLine: indicators.adLine
  }), [indicators])

  return (
    <div className="space-y-6">
      {indicators.obv && (
        <VolumeDynamicAnalysis
          obv={indicators.obv}
          mfi={indicators.mfi}
          cmf={indicators.cmf}
          historicalOBV={volumeHistory || []}
          currentPrice={currentPrice}
          volume24h={volume24h}
        />
      )}
      
      {/* 추가 거래량 지표 */}
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 거래량 추가 분석</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">A/D Line</div>
            <div className="text-lg font-bold text-white">
              {indicators.adLine.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">
              누적 분산 지표
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">VWAP</div>
            <div className={`text-lg font-bold ${
              currentPrice > indicators.vwap ? 'text-green-500' : 'text-red-500'
            }`}>
              {indicators.vwap.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              거래량 가중 평균가
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 오실레이터 탭 - CCI, Williams %R, Ultimate Oscillator 등
export function OscillatorTab({ indicators, historicalData, currentPrice, config }: TabComponentProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 오실레이터 분석</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">CCI</div>
            <div className={`text-lg font-bold ${
              indicators.cci < -100 ? 'text-green-500' :
              indicators.cci > 100 ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {indicators.cci.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {indicators.cci < -100 ? '과매도' :
               indicators.cci > 100 ? '과매수' : '중립'}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">Williams %R</div>
            <div className={`text-lg font-bold ${
              indicators.williamsR < -80 ? 'text-green-500' :
              indicators.williamsR > -20 ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {indicators.williamsR.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {indicators.williamsR < -80 ? '과매도' :
               indicators.williamsR > -20 ? '과매수' : '중립'}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400">Ultimate Osc</div>
            <div className={`text-lg font-bold ${
              indicators.ultimateOscillator < 30 ? 'text-green-500' :
              indicators.ultimateOscillator > 70 ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {indicators.ultimateOscillator.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {indicators.ultimateOscillator < 30 ? '과매도' :
               indicators.ultimateOscillator > 70 ? '과매수' : '중립'}
            </div>
          </div>
        </div>

        {/* 오실레이터 종합 신호 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-white mb-3">오실레이터 종합 신호</h4>
          <div className="space-y-2">
            {indicators.cci < -100 && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">CCI 과매도 - 매수 신호</span>
              </div>
            )}
            {indicators.williamsR < -80 && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Williams %R 과매도 - 매수 신호</span>
              </div>
            )}
            {indicators.ultimateOscillator < 30 && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Ultimate Oscillator 과매도 - 매수 신호</span>
              </div>
            )}
            {indicators.cci > 100 && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">CCI 과매수 - 매도 신호</span>
              </div>
            )}
            {indicators.williamsR > -20 && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Williams %R 과매수 - 매도 신호</span>
              </div>
            )}
            {indicators.ultimateOscillator > 70 && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Ultimate Oscillator 과매수 - 매도 신호</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// AI 예측 탭 - ML 모델 기반 예측
export function AIPredictionTab({ indicators, historicalData, currentPrice, config }: TabComponentProps) {
  const prediction = useMemo(() => {
    // AI 예측 로직 (실제로는 API 호출이나 ML 모델 사용)
    const trend = indicators.sma.sma20 > indicators.sma.sma50 ? 'up' : 'down'
    const momentum = indicators.rsi > 50 ? 'bullish' : 'bearish'
    const volatility = indicators.atr > currentPrice * 0.02 ? 'high' : 'low'
    
    // 예측 가격 계산 (실제로는 ML 모델 사용)
    const shortTermTarget = trend === 'up' ? 
      currentPrice * (1 + indicators.atr / currentPrice) :
      currentPrice * (1 - indicators.atr / currentPrice)
    
    const confidence = 
      (indicators.adx > 25 ? 30 : 0) +
      (Math.abs(indicators.rsi - 50) > 20 ? 20 : 0) +
      (indicators.macd.histogram > 0 === (trend === 'up') ? 25 : 0) +
      (volatility === 'low' ? 25 : 0)
    
    return {
      shortTermTarget,
      trend,
      momentum,
      volatility,
      confidence
    }
  }, [indicators, currentPrice])

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">🤖 AI 가격 예측</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-white mb-3">단기 예측 (24시간)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">목표가</span>
                  <span className={`font-bold ${
                    prediction.shortTermTarget > currentPrice ? 'text-green-500' : 'text-red-500'
                  }`}>
                    ${prediction.shortTermTarget.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">변화율</span>
                  <span className={`font-bold ${
                    prediction.shortTermTarget > currentPrice ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {((prediction.shortTermTarget - currentPrice) / currentPrice * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">신뢰도</span>
                  <span className={`font-bold ${
                    prediction.confidence > 70 ? 'text-green-500' :
                    prediction.confidence > 40 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {prediction.confidence}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-white mb-3">시장 상태 분석</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">추세</span>
                  <span className={`font-bold ${
                    prediction.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {prediction.trend === 'up' ? '상승' : '하락'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">모멘텀</span>
                  <span className={`font-bold ${
                    prediction.momentum === 'bullish' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {prediction.momentum === 'bullish' ? '강세' : '약세'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">변동성</span>
                  <span className={`font-bold ${
                    prediction.volatility === 'high' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {prediction.volatility === 'high' ? '높음' : '낮음'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-sm font-bold text-white mb-3">AI 트레이딩 제안</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                <div className="text-sm font-bold text-blue-400 mb-1">포지션</div>
                <div className="text-white">
                  {prediction.trend === 'up' && prediction.confidence > 60 ? '롱 포지션 추천' :
                   prediction.trend === 'down' && prediction.confidence > 60 ? '숏 포지션 추천' :
                   '관망 추천'}
                </div>
              </div>
              
              <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded">
                <div className="text-sm font-bold text-purple-400 mb-1">진입 전략</div>
                <div className="text-white text-sm">
                  {prediction.volatility === 'high' ? 
                    '분할 매수/매도 추천 (높은 변동성)' :
                    '일괄 진입 가능 (낮은 변동성)'}
                </div>
              </div>
              
              <div className="p-3 bg-green-900/20 border border-green-500/30 rounded">
                <div className="text-sm font-bold text-green-400 mb-1">리스크 관리</div>
                <div className="text-white text-sm">
                  손절가: ${(currentPrice * 0.98).toFixed(2)} (-2%)<br />
                  목표가: ${(currentPrice * 1.03).toFixed(2)} (+3%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}