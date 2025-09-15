'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartBar, FaArrowUp, FaArrowDown, FaInfoCircle,
  FaStar, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa'
import { 
  BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ErrorBar
} from 'recharts'

interface CandlestickPatternsProps {
  symbol: string
  timeframe: string
}

export default function CandlestickPatterns({ symbol, timeframe }: CandlestickPatternsProps) {
  const candlestickPatterns = [
    {
      name: '도지 (Doji)',
      type: 'neutral',
      reliability: 65,
      description: '시가와 종가가 거의 같은 패턴',
      signal: '추세 전환 가능성',
      frequency: 15
    },
    {
      name: '해머 (Hammer)',
      type: 'bullish',
      reliability: 82,
      description: '하락 추세 후 나타나는 반전 신호',
      signal: '상승 전환',
      frequency: 8
    },
    {
      name: '샛별 (Morning Star)',
      type: 'bullish',
      reliability: 88,
      description: '3개 캔들로 구성된 강한 상승 신호',
      signal: '강한 상승 전환',
      frequency: 5
    },
    {
      name: '장악형 (Engulfing)',
      type: 'bearish',
      reliability: 85,
      description: '이전 캔들을 완전히 감싸는 패턴',
      signal: '하락 전환',
      frequency: 7
    },
    {
      name: '십자성 (Evening Star)',
      type: 'bearish',
      reliability: 87,
      description: '상승 추세 정점에서 나타나는 패턴',
      signal: '강한 하락 전환',
      frequency: 4
    },
    {
      name: '핀바 (Pin Bar)',
      type: 'bullish',
      reliability: 78,
      description: '긴 꼬리를 가진 반전 캔들',
      signal: '지지/저항 확인',
      frequency: 12
    }
  ]

  // 최근 탐지된 패턴 (모의 데이터)
  const recentDetections = [
    {
      pattern: '해머',
      time: '14:30',
      price: 48500,
      result: 'success',
      profit: 2.3
    },
    {
      pattern: '장악형',
      time: '12:15',
      price: 49200,
      result: 'success',
      profit: 1.8
    },
    {
      pattern: '도지',
      time: '10:45',
      price: 48800,
      result: 'pending',
      profit: 0
    },
    {
      pattern: '샛별',
      time: '09:20',
      price: 47900,
      result: 'success',
      profit: 3.5
    },
    {
      pattern: '십자성',
      time: '08:30',
      price: 49500,
      result: 'fail',
      profit: -1.2
    }
  ]

  // 캔들스틱 차트 데이터 (모의)
  const candleData = Array.from({ length: 20 }, (_, i) => {
    const open = 48000 + Math.random() * 2000
    const close = open + (Math.random() - 0.5) * 500
    const high = Math.max(open, close) + Math.random() * 200
    const low = Math.min(open, close) - Math.random() * 200
    
    return {
      time: `${9 + Math.floor(i/2)}:${i % 2 === 0 ? '00' : '30'}`,
      open,
      close,
      high,
      low,
      volume: Math.random() * 1000000,
      pattern: i === 15 ? 'hammer' : i === 10 ? 'doji' : null
    }
  })

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <FaChartBar className="text-green-400" />
          캔들스틱 패턴 분석
        </h3>
        <p className="text-gray-400">
          일본식 캔들스틱 차트에서 나타나는 28가지 패턴을 실시간으로 탐지합니다
        </p>
      </div>

      {/* 실시간 캔들 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4">실시간 차트 & 패턴 탐지</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={candleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 200', 'dataMax + 200']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            
            {/* 캔들스틱 */}
            <Bar dataKey="high" fill="transparent">
              {candleData.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
              <ErrorBar 
                dataKey="low" 
                width={0} 
                stroke="#9ca3af"
                strokeWidth={1}
                direction="y"
              />
            </Bar>
            
            <Bar dataKey="close" fill="#10b981">
              {candleData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.close > entry.open ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
            
            {/* 패턴 마커 */}
            {candleData.map((entry, index) => {
              if (entry.pattern) {
                return (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={() => entry.low - 100}
                    stroke="none"
                    dot={{
                      r: 8,
                      fill: entry.pattern === 'hammer' ? '#10b981' : '#f59e0b'
                    }}
                  />
                )
              }
              return null
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 패턴 종류별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candlestickPatterns.map((pattern, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-green-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h5 className="font-bold text-white">{pattern.name}</h5>
                <p className="text-xs text-gray-400">{pattern.description}</p>
              </div>
              <div className={`p-2 rounded-lg ${
                pattern.type === 'bullish' ? 'bg-green-500/20 text-green-400' :
                pattern.type === 'bearish' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {pattern.type === 'bullish' ? <FaArrowUp /> :
                 pattern.type === 'bearish' ? <FaArrowDown /> :
                 <FaInfoCircle />}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">신뢰도</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        pattern.reliability > 80 ? 'bg-green-500' :
                        pattern.reliability > 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pattern.reliability}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">{pattern.reliability}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">발생 빈도</span>
                <span className="text-white">{pattern.frequency}%</span>
              </div>
              
              <div className="text-xs text-gray-500 italic">
                {pattern.signal}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 최근 탐지 기록 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaStar className="text-yellow-400" />
          최근 탐지된 패턴
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400">시간</th>
                <th className="text-left py-3 text-gray-400">패턴</th>
                <th className="text-right py-3 text-gray-400">가격</th>
                <th className="text-center py-3 text-gray-400">결과</th>
                <th className="text-right py-3 text-gray-400">수익률</th>
              </tr>
            </thead>
            <tbody>
              {recentDetections.map((detection, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 text-white">{detection.time}</td>
                  <td className="py-3 text-white font-medium">{detection.pattern}</td>
                  <td className="py-3 text-right text-white">${detection.price.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    {detection.result === 'success' ? (
                      <span className="text-green-400"><FaCheckCircle /></span>
                    ) : detection.result === 'fail' ? (
                      <span className="text-red-400"><FaExclamationTriangle /></span>
                    ) : (
                      <span className="text-yellow-400">대기중</span>
                    )}
                  </td>
                  <td className={`py-3 text-right font-semibold ${
                    detection.profit > 0 ? 'text-green-400' :
                    detection.profit < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {detection.profit > 0 ? '+' : ''}{detection.profit}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 패턴 활용 팁 */}
      <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-green-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-green-400" />
          캔들스틱 패턴 활용 팁
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h5 className="text-green-400 font-semibold mb-2">신뢰도 높은 패턴</h5>
            <ul className="space-y-1">
              <li>• 샛별/십자성: 3개 캔들 조합으로 신뢰도 높음</li>
              <li>• 장악형: 모멘텀 전환의 강한 신호</li>
              <li>• 해머/역해머: 지지/저항에서 효과적</li>
            </ul>
          </div>
          <div>
            <h5 className="text-emerald-400 font-semibold mb-2">주의사항</h5>
            <ul className="space-y-1">
              <li>• 단독 패턴보다 조합 패턴이 더 신뢰성 높음</li>
              <li>• 거래량 확인 필수 (패턴 확정)</li>
              <li>• 주요 지지/저항 레벨과 함께 분석</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}