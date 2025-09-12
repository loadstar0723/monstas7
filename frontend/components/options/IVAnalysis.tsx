'use client'

import { useState, useMemo } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { TrendingUp, TrendingDown, AlertCircle, Activity } from 'lucide-react'
import { LineChart, ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface Props {
  coin: string
  optionChainData: any[] | null
}

export default function IVAnalysis({ coin, optionChainData }: Props) {
  const [viewType, setViewType] = useState<'skew' | 'surface' | 'rank'>('skew')

  // IV 스큐 데이터 계산
  const ivSkewData = useMemo(() => {
    if (!optionChainData) return []
    
    return optionChainData
      .filter(row => row.call?.iv || row.put?.iv)
      .map(row => ({
        strike: row.strike,
        callIV: row.call?.iv ? row.call.iv * 100 : null,
        putIV: row.put?.iv ? row.put.iv * 100 : null,
        avgIV: ((row.call?.iv || 0) + (row.put?.iv || 0)) * 50
      }))
  }, [optionChainData])

  // 평균 IV 계산
  const avgIV = useMemo(() => {
    if (ivSkewData.length === 0) return 0
    const sum = ivSkewData.reduce((acc, data) => acc + (data.avgIV || 0), 0)
    return sum / ivSkewData.length
  }, [ivSkewData])

  // IV 랭크 계산 (시뮬레이션 데이터)
  const ivRank = Math.floor((((Date.now() % 1000) / 1000) * 30 + 35)) // 35-65 사이
  const ivPercentile = Math.floor((((Date.now() % 1000) / 1000) * 30 + 40)) // 40-70 사이

  // 역사적 IV 데이터 (시뮬레이션)
  const historicalIV = Array.from({ length: 30 }, (_, i) => ({
    day: i - 29,
    iv: avgIV + ((((Date.now() % 1000) / 1000) - 0.5) * 20),
    hv: avgIV - 5 + ((((Date.now() % 1000) / 1000) - 0.5) * 15)
  }))

  // Deribit은 BTC와 ETH만 지원
  if (!['BTC', 'ETH'].includes(coin)) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">내재변동성(IV) 분석</h3>
        <div className="text-center py-12">
          <p className="text-gray-400">
            {coin}는 현재 IV 데이터를 제공하지 않습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">내재변동성(IV) 분석</h3>

      {/* 뷰 타입 선택 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewType('skew')}
          className={`px-4 py-2 rounded-lg text-sm ${
            viewType === 'skew' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          IV 스큐
        </button>
        <button
          onClick={() => setViewType('surface')}
          className={`px-4 py-2 rounded-lg text-sm ${
            viewType === 'surface' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          역사적 IV
        </button>
        <button
          onClick={() => setViewType('rank')}
          className={`px-4 py-2 rounded-lg text-sm ${
            viewType === 'rank' ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          IV 랭크
        </button>
      </div>

      {/* IV 스큐 차트 */}
      {viewType === 'skew' && (
        <div>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ivSkewData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                
                <XAxis 
                  dataKey="strike" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: any) => [`${value?.toFixed(1)}%`, 'IV']}
                  labelFormatter={(value: any) => `Strike: $${value.toLocaleString()}`}
                />
                
                <Line
                  type="monotone"
                  dataKey="callIV"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Call IV"
                  dot={{ fill: '#10B981', r: 4 }}
                />
                
                <Line
                  type="monotone"
                  dataKey="putIV"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Put IV"
                  dot={{ fill: '#EF4444', r: 4 }}
                />
                
                <ReferenceLine y={avgIV} stroke="#6B7280" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2">IV 스큐 해석</h4>
            <p className="text-sm text-gray-300">
              {avgIV > 50 ? (
                '현재 높은 IV는 시장의 불확실성을 반영합니다. 옵션 매도 전략이 유리할 수 있습니다.'
              ) : (
                '현재 낮은 IV는 안정적인 시장을 나타냅니다. 옵션 매수 전략을 고려해보세요.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* 역사적 IV vs HV */}
      {viewType === 'surface' && (
        <div>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalIV} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value}d`}
                />
                
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: any) => [`${safeFixed(value, 1)}%`]}
                />
                
                <Line
                  type="monotone"
                  dataKey="iv"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="내재변동성 (IV)"
                  dot={false}
                />
                
                <Line
                  type="monotone"
                  dataKey="hv"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="역사적변동성 (HV)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">현재 IV</span>
                <span className="text-lg font-bold text-purple-400">{safeFixed(avgIV, 1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">30일 HV</span>
                <span className="text-lg font-bold text-yellow-400">{(avgIV - 5).toFixed(1)}%</span>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h5 className="text-sm font-semibold mb-1">IV/HV 비율</h5>
              <p className="text-2xl font-bold text-white">
                {(avgIV / (avgIV - 5)).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {avgIV > avgIV - 5 ? 'IV 프리미엄' : 'IV 디스카운트'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IV 랭크 & 퍼센타일 */}
      {viewType === 'rank' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-6">
              <h4 className="font-semibold mb-4">IV 랭크</h4>
              <div className="relative">
                <div className="w-full bg-gray-600 rounded-full h-8 mb-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-red-500 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ width: `${ivRank}%` }}
                  >
                    {ivRank}%
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>낮음</span>
                  <span>높음</span>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-4">
                지난 1년간 IV 대비 현재 위치
              </p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h4 className="font-semibold mb-4">IV 퍼센타일</h4>
              <div className="relative">
                <div className="w-full bg-gray-600 rounded-full h-8 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ width: `${ivPercentile}%` }}
                  >
                    {ivPercentile}%
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              <p className="text-sm text-gray-300 mt-4">
                지난 1년간 {ivPercentile}%의 날이 현재보다 낮은 IV
              </p>
            </div>
          </div>

          {/* IV 기반 전략 추천 */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-3">IV 기반 전략 추천</h4>
            <div className="space-y-2">
              {ivRank < 30 ? (
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium">낮은 IV - 옵션 매수 유리</p>
                    <p className="text-sm text-gray-400">롱 스트래들, 롱 스트랭글 전략 추천</p>
                  </div>
                </div>
              ) : ivRank > 70 ? (
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="font-medium">높은 IV - 옵션 매도 유리</p>
                    <p className="text-sm text-gray-400">아이언 컨도르, 숏 스트랭글 전략 추천</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium">중간 IV - 방향성 전략</p>
                    <p className="text-sm text-gray-400">불/베어 스프레드, 캘린더 스프레드 추천</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3 mt-3 pt-3 border-t border-gray-600">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <p className="text-sm text-gray-300">
                  IV는 이벤트(업데이트, 규제 발표 등) 전후로 크게 변동할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}