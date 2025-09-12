'use client'

import { MomentumData } from '../MomentumModule'

interface MomentumIndicatorsProps {
  momentumData: MomentumData | null
}

export default function MomentumIndicators({ momentumData }: MomentumIndicatorsProps) {
  const getRSIStatus = (value: number) => {
    if (value > 70) return { text: '과매수', color: 'text-red-400', bg: 'bg-red-900/20' }
    if (value < 30) return { text: '과매도', color: 'text-green-400', bg: 'bg-green-900/20' }
    return { text: '중립', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
  }

  const getStochasticStatus = (k: number, d: number) => {
    if (k > 80) return { text: '과매수', color: 'text-red-400' }
    if (k < 20) return { text: '과매도', color: 'text-green-400' }
    return { text: '중립', color: 'text-gray-400' }
  }

  const getWilliamsStatus = (value: number) => {
    if (value > -20) return { text: '과매수', color: 'text-red-400' }
    if (value < -80) return { text: '과매도', color: 'text-green-400' }
    return { text: '중립', color: 'text-gray-400' }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">모멘텀 지표</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RSI */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">RSI (14)</h3>
            {momentumData && (
              <span className={`text-xs px-2 py-1 rounded ${getRSIStatus(momentumData.rsi).bg} ${getRSIStatus(momentumData.rsi).color}`}>
                {getRSIStatus(momentumData.rsi).text}
              </span>
            )}
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-bold text-white">
              {momentumData?.rsi ? momentumData.rsi.toFixed(1) : '0.0'}
            </span>
          </div>
          <div className="relative">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="absolute left-[30%] w-[40%] h-full bg-gray-600"></div>
              <div 
                className="relative h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${momentumData?.rsi || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>30</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* MACD */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">MACD</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              momentumData?.macd?.histogram > 0 
                ? 'bg-green-900/20 text-green-400' 
                : 'bg-red-900/20 text-red-400'
            }`}>
              {momentumData?.macd?.histogram > 0 ? '상승' : '하락'}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">MACD</span>
              <span className="text-sm font-semibold text-white">
                {momentumData?.macd?.macd ? momentumData.macd.macd.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Signal</span>
              <span className="text-sm font-semibold text-white">
                {momentumData?.macd?.signal ? momentumData.macd.signal.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Histogram</span>
              <span className={`text-sm font-semibold ${
                momentumData?.macd?.histogram > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {momentumData?.macd?.histogram ? momentumData.macd.histogram.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Stochastic */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">Stochastic</h3>
            {momentumData && (
              <span className={`text-xs px-2 py-1 rounded bg-gray-700 ${
                getStochasticStatus(momentumData.stochastic?.k || 0, momentumData.stochastic?.d || 0).color
              }`}>
                {getStochasticStatus(momentumData.stochastic?.k || 0, momentumData.stochastic?.d || 0).text}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">%K</span>
              <span className="text-sm font-semibold text-white">
                {momentumData?.stochastic?.k ? momentumData.stochastic.k.toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">%D</span>
              <span className="text-sm font-semibold text-white">
                {momentumData?.stochastic?.d ? momentumData.stochastic.d.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${momentumData?.stochastic?.k || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Williams %R */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">Williams %R</h3>
            {momentumData && (
              <span className={`text-xs px-2 py-1 rounded bg-gray-700 ${
                getWilliamsStatus(momentumData.williams).color
              }`}>
                {getWilliamsStatus(momentumData.williams).text}
              </span>
            )}
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-2xl font-bold text-white">
              {momentumData?.williams ? momentumData.williams.toFixed(1) : '0.0'}
            </span>
            <span className="text-gray-500 text-sm mb-1">%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.abs(momentumData?.williams || 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 지표 설명 */}
      <div className="mt-6 p-4 bg-purple-900/10 rounded-lg border border-purple-800/20">
        <h4 className="text-sm font-semibold text-purple-400 mb-2">지표 해석 가이드</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-400">
          <div>
            <span className="text-purple-300">RSI:</span> 30 이하는 과매도, 70 이상은 과매수 신호
          </div>
          <div>
            <span className="text-purple-300">MACD:</span> 히스토그램이 양수면 상승, 음수면 하락 추세
          </div>
          <div>
            <span className="text-purple-300">Stochastic:</span> 20 이하는 매수, 80 이상은 매도 시그널
          </div>
          <div>
            <span className="text-purple-300">Williams %R:</span> -80 이하는 과매도, -20 이상은 과매수
          </div>
        </div>
      </div>
    </div>
  )
}