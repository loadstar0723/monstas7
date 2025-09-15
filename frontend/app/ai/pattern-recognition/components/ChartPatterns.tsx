'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FaShapes, FaChartLine, FaInfoCircle, FaCheckCircle,
  FaExclamationTriangle, FaArrowRight, FaClock
} from 'react-icons/fa'
import { BiShapeTriangle, BiShapeSquare } from 'react-icons/bi'
import { 
  LineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Cell
} from 'recharts'

interface ChartPatternsProps {
  symbol: string
  timeframe: string
}

export default function ChartPatterns({ symbol, timeframe }: ChartPatternsProps) {
  const [selectedPattern, setSelectedPattern] = useState('head-shoulders')

  // 차트 패턴 종류
  const chartPatterns = [
    {
      id: 'head-shoulders',
      name: '머리어깨형',
      category: '반전',
      description: '상승 추세 종료를 알리는 대표적인 패턴',
      reliability: 88,
      avgReturn: -12.5,
      duration: '2-4주',
      keyPoints: ['왼쪽 어깨', '머리', '오른쪽 어깨', '넥라인']
    },
    {
      id: 'triangle',
      name: '삼각형',
      category: '지속',
      description: '수렴하는 추세선으로 형성되는 패턴',
      reliability: 75,
      avgReturn: 8.3,
      duration: '1-3주',
      keyPoints: ['상향 추세선', '하향 추세선', '정점', '돌파']
    },
    {
      id: 'flag',
      name: '깃발형',
      category: '지속',
      description: '급격한 움직임 후 나타나는 조정 패턴',
      reliability: 82,
      avgReturn: 15.2,
      duration: '3-7일',
      keyPoints: ['깃대', '깃발', '돌파점']
    },
    {
      id: 'double-top',
      name: '이중 천정',
      category: '반전',
      description: '두 개의 고점으로 형성되는 하락 반전 패턴',
      reliability: 85,
      avgReturn: -10.8,
      duration: '2-6주',
      keyPoints: ['첫 번째 고점', '두 번째 고점', '골', '넥라인']
    },
    {
      id: 'wedge',
      name: '쐐기형',
      category: '반전/지속',
      description: '수렴하는 채널 형태의 패턴',
      reliability: 78,
      avgReturn: 9.5,
      duration: '2-4주',
      keyPoints: ['상단선', '하단선', '수렴점']
    }
  ]

  // 패턴별 차트 데이터 생성
  const generatePatternData = (patternType: string) => {
    const data = []
    const points = 100
    
    for (let i = 0; i < points; i++) {
      let price = 50000
      
      switch (patternType) {
        case 'head-shoulders':
          if (i < 30) price = 50000 + i * 100
          else if (i < 40) price = 53000 - (i - 30) * 200
          else if (i < 60) price = 51000 + (i - 40) * 150
          else if (i < 70) price = 54000 - (i - 60) * 300
          else if (i < 90) price = 51000 - (i - 70) * 50
          else price = 50000 - (i - 90) * 200
          break
          
        case 'triangle':
          const base = 50000
          const amplitude = 1000 * (1 - i / points)
          price = base + Math.sin(i * 0.3) * amplitude
          break
          
        case 'flag':
          if (i < 20) price = 50000 + i * 200
          else if (i < 60) price = 54000 - (i - 20) * 30
          else price = 52800 + (i - 60) * 150
          break
          
        default:
          price = 50000 + Math.sin(i * 0.1) * 1000 + (Math.random() - 0.5) * 500
      }
      
      data.push({
        time: i,
        price: price + (Math.random() - 0.5) * 200,
        volume: Math.random() * 1000000
      })
    }
    
    return data
  }

  const chartData = generatePatternData(selectedPattern)
  const currentPattern = chartPatterns.find(p => p.id === selectedPattern)

  // 실시간 패턴 스캔 결과 (모의)
  const scanResults = [
    { pattern: '삼각형', symbol: 'BTC/USDT', confidence: 92, stage: '형성 중' },
    { pattern: '머리어깨형', symbol: 'ETH/USDT', confidence: 78, stage: '완성' },
    { pattern: '깃발형', symbol: 'BNB/USDT', confidence: 85, stage: '돌파 대기' },
    { pattern: '이중 천정', symbol: 'SOL/USDT', confidence: 71, stage: '형성 초기' }
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <BiShapeTriangle className="text-yellow-400" />
          기하학적 차트 패턴 분석
        </h3>
        <p className="text-gray-400">
          삼각형, 깃발형, 머리어깨형 등 클래식 차트 패턴을 AI로 자동 인식합니다
        </p>
      </div>

      {/* 패턴 선택 탭 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {chartPatterns.map((pattern) => (
          <button
            key={pattern.id}
            onClick={() => setSelectedPattern(pattern.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedPattern === pattern.id
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {pattern.name}
          </button>
        ))}
      </div>

      {/* 선택된 패턴 차트 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-white">{currentPattern?.name} 패턴</h4>
          <span className={`px-3 py-1 rounded-full text-sm ${
            currentPattern?.category === '반전' 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {currentPattern?.category} 패턴
          </span>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="patternGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
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
            
            {/* 패턴 주요 포인트 표시 */}
            {selectedPattern === 'head-shoulders' && (
              <>
                <ReferenceLine x={30} stroke="#ef4444" strokeDasharray="3 3" label="왼쪽 어깨" />
                <ReferenceLine x={60} stroke="#ef4444" strokeDasharray="3 3" label="머리" />
                <ReferenceLine x={90} stroke="#ef4444" strokeDasharray="3 3" label="오른쪽 어깨" />
                <ReferenceLine y={51000} stroke="#10b981" strokeDasharray="3 3" label="넥라인" />
              </>
            )}
            
            <Area
              type="monotone"
              dataKey="price"
              stroke="#f59e0b"
              strokeWidth={3}
              fill="url(#patternGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* 패턴 정보 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">신뢰도</p>
            <p className="text-xl font-bold text-white">{currentPattern?.reliability}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">평균 수익률</p>
            <p className={`text-xl font-bold ${
              currentPattern?.avgReturn && currentPattern.avgReturn > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentPattern?.avgReturn && currentPattern.avgReturn > 0 ? '+' : ''}{currentPattern?.avgReturn}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">형성 기간</p>
            <p className="text-xl font-bold text-white">{currentPattern?.duration}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">주요 포인트</p>
            <p className="text-xl font-bold text-white">{currentPattern?.keyPoints.length}개</p>
          </div>
        </div>
      </div>

      {/* 패턴 설명 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-400" />
          패턴 상세 설명
        </h4>
        <p className="text-gray-300 mb-4">{currentPattern?.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-yellow-400 font-semibold mb-2">주요 구성 요소</h5>
            <ul className="space-y-1 text-sm text-gray-300">
              {currentPattern?.keyPoints.map((point, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-400 text-xs" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-orange-400 font-semibold mb-2">트레이딩 전략</h5>
            <ul className="space-y-1 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-orange-400 text-xs" />
                진입: 패턴 완성 후 돌파 시점
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-orange-400 text-xs" />
                목표가: 패턴 높이의 1.5배
              </li>
              <li className="flex items-center gap-2">
                <FaArrowRight className="text-orange-400 text-xs" />
                손절가: 패턴 무효화 지점
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 실시간 스캔 결과 */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FaClock className="text-purple-400" />
          실시간 패턴 스캔 결과
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">심볼</th>
                <th className="text-left py-2 text-gray-400">패턴</th>
                <th className="text-center py-2 text-gray-400">신뢰도</th>
                <th className="text-center py-2 text-gray-400">상태</th>
              </tr>
            </thead>
            <tbody>
              {scanResults.map((result, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-700/50"
                >
                  <td className="py-3 text-white font-medium">{result.symbol}</td>
                  <td className="py-3 text-white">{result.pattern}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.confidence > 85 ? 'bg-green-500/20 text-green-400' :
                      result.confidence > 75 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {result.confidence}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`text-sm ${
                      result.stage === '완성' ? 'text-green-400' :
                      result.stage === '돌파 대기' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {result.stage}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}