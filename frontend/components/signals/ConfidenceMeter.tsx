'use client'

import { motion } from 'framer-motion'
import { FaBrain, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

interface ConfidenceFactors {
  name: string
  value: boolean
  weight: number
}

interface ConfidenceMeterProps {
  confidence: number
  factors?: ConfidenceFactors[]
  analysis?: string
}

/**
 * AI 신뢰도 미터 컴포넌트
 * 신호의 신뢰도와 근거를 시각화
 */
export default function ConfidenceMeter({ confidence, factors, analysis }: ConfidenceMeterProps) {
  const getConfidenceLevel = () => {
    if (confidence >= 90) return { text: '매우 높음', color: 'text-green-400', bg: 'bg-green-400' }
    if (confidence >= 75) return { text: '높음', color: 'text-blue-400', bg: 'bg-blue-400' }
    if (confidence >= 60) return { text: '보통', color: 'text-yellow-400', bg: 'bg-yellow-400' }
    if (confidence >= 40) return { text: '낮음', color: 'text-orange-400', bg: 'bg-orange-400' }
    return { text: '매우 낮음', color: 'text-red-400', bg: 'bg-red-400' }
  }

  const level = getConfidenceLevel()
  
  // 기본 팩터들 (props로 안 받았을 때)
  const defaultFactors: ConfidenceFactors[] = factors || [
    { name: '기술적 지표 일치', value: confidence > 70, weight: 25 },
    { name: '거래량 증가', value: confidence > 60, weight: 20 },
    { name: '시장 심리 긍정', value: confidence > 65, weight: 20 },
    { name: '패턴 확인', value: confidence > 75, weight: 20 },
    { name: '백테스팅 성공', value: confidence > 80, weight: 15 }
  ]

  const calculateActualConfidence = () => {
    const totalWeight = defaultFactors.reduce((acc, f) => acc + f.weight, 0)
    const achievedWeight = defaultFactors.reduce((acc, f) => acc + (f.value ? f.weight : 0), 0)
    return Math.round((achievedWeight / totalWeight) * 100)
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/30">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <FaBrain className="text-purple-400 text-2xl" />
        <h3 className="text-xl font-bold text-white">AI 신뢰도 분석</h3>
      </div>

      {/* 메인 신뢰도 표시 */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-400">종합 신뢰도</span>
          <span className={`font-bold ${level.color}`}>{level.text}</span>
        </div>
        
        {/* 신뢰도 바 */}
        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full ${level.bg} relative`}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
          </motion.div>
          
          {/* 구간 표시 */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <div className="flex w-full">
              <div className="w-1/5 border-r border-gray-600 h-full" />
              <div className="w-1/5 border-r border-gray-600 h-full" />
              <div className="w-1/5 border-r border-gray-600 h-full" />
              <div className="w-1/5 border-r border-gray-600 h-full" />
              <div className="w-1/5 h-full" />
            </div>
          </div>
        </div>
        
        {/* 신뢰도 숫자 */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className={`text-5xl font-bold ${level.color}`}
          >
            {confidence}%
          </motion.div>
        </div>
      </div>

      {/* 신뢰도 요인들 */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-bold text-gray-400 uppercase">신뢰도 요인</h4>
        {defaultFactors.map((factor, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {factor.value ? (
                <FaCheckCircle className="text-green-400" />
              ) : (
                <FaTimesCircle className="text-red-400" />
              )}
              <span className={`text-sm ${factor.value ? 'text-white' : 'text-gray-500'}`}>
                {factor.name}
              </span>
            </div>
            <span className={`text-sm font-bold ${factor.value ? 'text-green-400' : 'text-gray-600'}`}>
              {factor.weight}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* AI 분석 코멘트 */}
      {analysis && (
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-purple-400 mb-2">AI 분석</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {analysis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 신뢰도 레벨 가이드 */}
      <div className="mt-6 grid grid-cols-5 gap-2">
        <div className="text-center">
          <div className="h-2 bg-red-400 rounded-full mb-1" />
          <div className="text-xs text-gray-500">0-40%</div>
          <div className="text-xs text-red-400">매우낮음</div>
        </div>
        <div className="text-center">
          <div className="h-2 bg-orange-400 rounded-full mb-1" />
          <div className="text-xs text-gray-500">40-60%</div>
          <div className="text-xs text-orange-400">낮음</div>
        </div>
        <div className="text-center">
          <div className="h-2 bg-yellow-400 rounded-full mb-1" />
          <div className="text-xs text-gray-500">60-75%</div>
          <div className="text-xs text-yellow-400">보통</div>
        </div>
        <div className="text-center">
          <div className="h-2 bg-blue-400 rounded-full mb-1" />
          <div className="text-xs text-gray-500">75-90%</div>
          <div className="text-xs text-blue-400">높음</div>
        </div>
        <div className="text-center">
          <div className="h-2 bg-green-400 rounded-full mb-1" />
          <div className="text-xs text-gray-500">90-100%</div>
          <div className="text-xs text-green-400">매우높음</div>
        </div>
      </div>
    </div>
  )
}