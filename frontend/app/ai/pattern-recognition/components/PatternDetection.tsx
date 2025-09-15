'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaBrain, FaChartLine, FaCheckCircle, FaExclamationTriangle,
  FaClock, FaArrowUp, FaArrowDown, FaMagic
} from 'react-icons/fa'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Cell, Bar
} from 'recharts'

interface PatternDetectionProps {
  symbol: string
  timeframe: string
}

export default function PatternDetection({ symbol, timeframe }: PatternDetectionProps) {
  const [detectedPatterns, setDetectedPatterns] = useState<any[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [confidence, setConfidence] = useState(0)

  // 모의 차트 데이터 생성
  const generateChartData = () => {
    const data = []
    const basePrice = 50000
    for (let i = 0; i < 100; i++) {
      const trend = Math.sin(i * 0.1) * 2000
      const noise = (Math.random() - 0.5) * 500
      data.push({
        time: i,
        price: basePrice + trend + noise,
        volume: Math.random() * 1000000,
        high: basePrice + trend + noise + Math.random() * 200,
        low: basePrice + trend + noise - Math.random() * 200,
        pattern: i > 70 && i < 85 ? 'head-shoulders' : null
      })
    }
    return data
  }

  const [chartData] = useState(generateChartData())

  // 패턴 탐지 시뮬레이션
  const detectPatterns = () => {
    setIsScanning(true)
    setDetectedPatterns([])
    
    setTimeout(() => {
      const patterns = [
        {
          type: '머리어깨형',
          confidence: 92,
          position: { start: 70, end: 85 },
          direction: 'bearish',
          target: -8.5,
          stopLoss: 2.3,
          risk: 'high',
          description: '강한 하락 반전 신호'
        },
        {
          type: '상승 삼각형',
          confidence: 78,
          position: { start: 30, end: 50 },
          direction: 'bullish',
          target: 12.3,
          stopLoss: -3.5,
          risk: 'medium',
          description: '상승 돌파 가능성'
        },
        {
          type: '이중 바닥',
          confidence: 85,
          position: { start: 10, end: 25 },
          direction: 'bullish',
          target: 15.7,
          stopLoss: -4.2,
          risk: 'low',
          description: '바닥 형성 완료'
        }
      ]
      
      setDetectedPatterns(patterns)
      setConfidence(88)
      setIsScanning(false)
    }, 2000)
  }

  useEffect(() => {
    detectPatterns()
  }, [symbol, timeframe])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaBrain className="text-purple-400" />
          AI 패턴 탐지 결과
        </h3>
        <button
          onClick={detectPatterns}
          disabled={isScanning}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
            isScanning 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              스캐닝 중...
            </>
          ) : (
            <>
              <FaMagic />
              패턴 재탐지
            </>
          )}
        </button>
      </div>

      {/* 차트 with 패턴 오버레이 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" domain={['dataMin - 500', 'dataMax + 500']} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            
            {/* 패턴 영역 표시 */}
            {detectedPatterns.map((pattern, index) => (
              <ReferenceArea
                key={index}
                x1={pattern.position.start}
                x2={pattern.position.end}
                fill={pattern.direction === 'bullish' ? '#10b981' : '#ef4444'}
                fillOpacity={0.1}
                stroke={pattern.direction === 'bullish' ? '#10b981' : '#ef4444'}
                strokeDasharray="3 3"
              />
            ))}
            
            <Area
              type="monotone"
              dataKey="price"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
            
            <Bar dataKey="volume" fill="#6366f1" opacity={0.3} yAxisId="right" />
            
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 탐지된 패턴 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {detectedPatterns.map((pattern, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">{pattern.type}</h4>
                <p className="text-sm text-gray-400">{pattern.description}</p>
              </div>
              <div className={`p-2 rounded-lg ${
                pattern.direction === 'bullish' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {pattern.direction === 'bullish' ? <FaArrowUp /> : <FaArrowDown />}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">신뢰도</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        pattern.confidence > 85 ? 'bg-green-500' :
                        pattern.confidence > 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pattern.confidence}%` }}
                    />
                  </div>
                  <span className="text-white font-semibold">{pattern.confidence}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">목표가</span>
                <span className={`font-semibold ${
                  pattern.target > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {pattern.target > 0 ? '+' : ''}{pattern.target}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">손절가</span>
                <span className="text-red-400 font-semibold">
                  {pattern.stopLoss}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">리스크</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  pattern.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                  pattern.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {pattern.risk.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI 분석 요약 */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/30">
        <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-purple-400" />
          AI 분석 요약
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 mb-1">전체 신뢰도</p>
            <p className="text-2xl font-bold text-white">{confidence}%</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">주요 신호</p>
            <p className="text-2xl font-bold text-red-400">매도 우세</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">권장 포지션</p>
            <p className="text-2xl font-bold text-white">30% Short</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-gray-300 text-sm leading-relaxed">
            <FaExclamationTriangle className="inline-block text-yellow-400 mr-2" />
            강한 머리어깨형 패턴이 형성되었습니다. 추가 하락 가능성이 높으므로 
            매도 포지션 진입을 고려하세요. 손절가는 현재가 대비 +2.3% 수준에서 설정하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  )
}