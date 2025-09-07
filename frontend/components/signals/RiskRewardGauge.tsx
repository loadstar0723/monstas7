'use client'

import { motion } from 'framer-motion'

interface RiskRewardGaugeProps {
  risk: number // 0-100
  reward: number // 0-100
  ratio?: number // 자동 계산 또는 수동 입력
}

/**
 * 리스크/보상 비율 게이지 컴포넌트
 * 트레이딩 기회의 위험 대비 수익 가능성을 시각화
 */
export default function RiskRewardGauge({ risk, reward, ratio }: RiskRewardGaugeProps) {
  const calculatedRatio = ratio || (reward / (risk || 1)).toFixed(2)
  const isGoodRatio = Number(calculatedRatio) >= 2 // 1:2 이상이면 좋음
  const isAcceptableRatio = Number(calculatedRatio) >= 1.5 // 1:1.5 이상이면 수용 가능

  const getRatioColor = () => {
    if (Number(calculatedRatio) >= 3) return 'text-green-400'
    if (Number(calculatedRatio) >= 2) return 'text-blue-400'
    if (Number(calculatedRatio) >= 1.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRatioEmoji = () => {
    if (Number(calculatedRatio) >= 3) return '🎯'
    if (Number(calculatedRatio) >= 2) return '✅'
    if (Number(calculatedRatio) >= 1.5) return '⚠️'
    return '❌'
  }

  const getRatioText = () => {
    if (Number(calculatedRatio) >= 3) return '완벽'
    if (Number(calculatedRatio) >= 2) return '좋음'
    if (Number(calculatedRatio) >= 1.5) return '보통'
    return '위험'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="space-y-4">
        {/* 리스크 게이지 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-400">리스크</span>
            <span className="text-sm font-bold text-red-400">{risk}%</span>
          </div>
          <div className="h-6 bg-gray-700 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${risk}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-600 to-red-400 relative"
            >
              <div className="absolute inset-0 bg-red-500 opacity-50 animate-pulse" />
            </motion.div>
            {/* 리스크 레벨 마커 */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full flex justify-between px-2">
                <div className="text-xs text-gray-500">낮음</div>
                <div className="text-xs text-gray-500">중간</div>
                <div className="text-xs text-gray-500">높음</div>
              </div>
            </div>
          </div>
        </div>

        {/* 보상 게이지 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-400">보상</span>
            <span className="text-sm font-bold text-green-400">{reward}%</span>
          </div>
          <div className="h-6 bg-gray-700 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${reward}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-gradient-to-r from-green-600 to-green-400 relative"
            >
              <div className="absolute inset-0 bg-green-500 opacity-50 animate-pulse" />
            </motion.div>
            {/* 보상 레벨 마커 */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full flex justify-between px-2">
                <div className="text-xs text-gray-500">낮음</div>
                <div className="text-xs text-gray-500">중간</div>
                <div className="text-xs text-gray-500">높음</div>
              </div>
            </div>
          </div>
        </div>

        {/* 비율 표시 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-lg p-3 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRatioEmoji()}</span>
              <div>
                <div className="text-xs text-gray-400">리스크/보상 비율</div>
                <div className={`text-2xl font-bold ${getRatioColor()}`}>
                  1:{calculatedRatio}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getRatioColor()}`}>
                {getRatioText()}
              </div>
              <div className="text-xs text-gray-500">
                {Number(calculatedRatio) >= 2 ? '진입 추천' : '재검토 필요'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 추가 정보 */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-900 rounded p-2">
            <div className="text-xs text-gray-500">승률 필요</div>
            <div className="text-sm font-bold text-white">
              {(100 / (1 + Number(calculatedRatio))).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-900 rounded p-2">
            <div className="text-xs text-gray-500">예상 수익</div>
            <div className="text-sm font-bold text-green-400">
              +{(reward * 0.01 * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-gray-900 rounded p-2">
            <div className="text-xs text-gray-500">최대 손실</div>
            <div className="text-sm font-bold text-red-400">
              -{(risk * 0.01 * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}