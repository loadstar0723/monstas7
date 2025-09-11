'use client'

import { useState, useEffect } from 'react'
import { safeFixed, safePrice, safeAmount, safePercent, safeMillion, safeThousand } from '@/lib/safeFormat'
import { TrendingUp, TrendingDown, Activity, Clock, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  coin: string
  optionChainData: any[] | null
}

export default function GreeksDisplay({ coin, optionChainData }: Props) {
  const [selectedGreek, setSelectedGreek] = useState<'delta' | 'gamma' | 'theta' | 'vega'>('delta')
  const [selectedType, setSelectedType] = useState<'call' | 'put'>('call')

  // 그리스 설명
  const greekDescriptions = {
    delta: {
      name: '델타 (Delta)',
      symbol: 'Δ',
      description: '기초자산 가격이 1달러 변할 때 옵션 가격의 변화량',
      range: '콜: 0~1, 풋: -1~0',
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    gamma: {
      name: '감마 (Gamma)', 
      symbol: 'Γ',
      description: '기초자산 가격이 1달러 변할 때 델타의 변화량',
      range: '항상 양수',
      icon: Activity,
      color: 'text-green-400'
    },
    theta: {
      name: '세타 (Theta)',
      symbol: 'Θ',
      description: '시간이 하루 경과할 때 옵션 가격의 변화량',
      range: '보통 음수 (시간가치 소멸)',
      icon: Clock,
      color: 'text-red-400'
    },
    vega: {
      name: '베가 (Vega)',
      symbol: 'V',
      description: '변동성이 1% 변할 때 옵션 가격의 변화량',
      range: '항상 양수',
      icon: Zap,
      color: 'text-purple-400'
    }
  }

  const currentGreek = greekDescriptions[selectedGreek]
  const Icon = currentGreek.icon

  // 차트 데이터 준비
  const chartData = optionChainData?.map(row => ({
    strike: row.strike,
    value: selectedType === 'call' 
      ? row.call?.[selectedGreek] || 0
      : row.put?.[selectedGreek] || 0
  })).filter(d => d.value !== 0)

  // Deribit은 BTC와 ETH만 지원
  if (!['BTC', 'ETH'].includes(coin)) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">그리스(Greeks) 분석</h3>
        <div className="text-center py-12">
          <p className="text-gray-400">
            {coin}는 현재 옵션 그리스 데이터를 제공하지 않습니다.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 그리스 선택 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">그리스(Greeks) 분석</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(greekDescriptions).map(([key, greek]) => {
            const GreekIcon = greek.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedGreek(key as any)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedGreek === key
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <GreekIcon className={`w-5 h-5 ${greek.color}`} />
                  <span className="text-2xl font-bold">{greek.symbol}</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{greek.name}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* 선택된 그리스 상세 정보 */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`w-6 h-6 ${currentGreek.color}`} />
            <h4 className="text-lg font-bold">{currentGreek.name}</h4>
          </div>
          <p className="text-gray-300 mb-2">{currentGreek.description}</p>
          <p className="text-sm text-gray-400">범위: {currentGreek.range}</p>
        </div>

        {/* 옵션 타입 선택 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedType('call')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedType === 'call'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            콜 옵션
          </button>
          <button
            onClick={() => setSelectedType('put')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedType === 'put'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            풋 옵션
          </button>
        </div>

        {/* 그리스 차트 */}
        {chartData && chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="strike" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: any) => safeFixed(value, 4)}
                />
                <Line 
                  type="monotone" 
                  dataKey="value"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">데이터 로딩 중...</p>
          </div>
        )}
      </div>

      {/* 그리스 활용 전략 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">그리스 활용 전략</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-blue-400">델타 헤징</h4>
            <p className="text-sm text-gray-300">
              포트폴리오의 델타를 중립(0)으로 만들어 방향성 리스크 제거
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-green-400">감마 스캘핑</h4>
            <p className="text-sm text-gray-300">
              높은 감마 포지션에서 기초자산 매매로 수익 창출
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-red-400">세타 수익</h4>
            <p className="text-sm text-gray-300">
              옵션 매도를 통해 시간가치 소멸로 수익 획득
            </p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-purple-400">베가 트레이딩</h4>
            <p className="text-sm text-gray-300">
              변동성 변화를 예측하여 수익 창출
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-400">
            💡 그리스는 지속적으로 변화하므로 실시간 모니터링이 중요합니다.
          </p>
        </div>
      </div>
    </div>
  )
}