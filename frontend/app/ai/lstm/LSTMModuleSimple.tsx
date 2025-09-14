'use client'

import React, { useState, useEffect } from 'react'
import { FaBrain, FaChartLine, FaMemory, FaClock } from 'react-icons/fa'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function LSTMModuleSimple() {
  const [loading, setLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(50000)
  const [predictions, setPredictions] = useState({
    '1h': 50500,
    '4h': 51000,
    '24h': 52000,
    '7d': 55000
  })

  // 더미 차트 데이터
  const chartData = [
    { time: '현재', price: 50000 },
    { time: '1시간', price: 50500 },
    { time: '4시간', price: 51000 },
    { time: '24시간', price: 52000 },
    { time: '7일', price: 55000 }
  ]

  useEffect(() => {
    // 초기 로딩 완료
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaBrain className="text-6xl text-purple-500 animate-pulse mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">LSTM 모델 로딩 중...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FaBrain className="text-4xl text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-white">LSTM 예측 모델</h1>
              <p className="text-gray-400">Long Short-Term Memory 시계열 예측</p>
            </div>
          </div>
        </div>

        {/* 핵심 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FaChartLine className="text-3xl text-purple-400 mb-2" />
            <h3 className="text-gray-300 text-sm">현재 가격</h3>
            <p className="text-2xl font-bold text-white">${currentPrice.toLocaleString()}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FaClock className="text-3xl text-blue-400 mb-2" />
            <h3 className="text-gray-300 text-sm">1시간 예측</h3>
            <p className="text-2xl font-bold text-green-400">${predictions['1h'].toLocaleString()}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FaClock className="text-3xl text-yellow-400 mb-2" />
            <h3 className="text-gray-300 text-sm">24시간 예측</h3>
            <p className="text-2xl font-bold text-green-400">${predictions['24h'].toLocaleString()}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <FaMemory className="text-3xl text-green-400 mb-2" />
            <h3 className="text-gray-300 text-sm">예측 신뢰도</h3>
            <p className="text-2xl font-bold text-white">85.3%</p>
          </div>
        </div>

        {/* 예측 차트 */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">가격 예측 차트</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* LSTM 설명 */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">LSTM 모델 특징</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">장점</h4>
              <ul className="space-y-1 text-sm">
                <li>• 장기 의존성 학습 가능</li>
                <li>• 시계열 데이터에 최적화</li>
                <li>• 복잡한 패턴 인식</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">활용</h4>
              <ul className="space-y-1 text-sm">
                <li>• 가격 추세 예측</li>
                <li>• 변동성 예측</li>
                <li>• 거래 신호 생성</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}