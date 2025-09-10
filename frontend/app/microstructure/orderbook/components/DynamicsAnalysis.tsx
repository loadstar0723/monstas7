'use client'

import { motion } from 'framer-motion'
import { FaFireAlt } from 'react-icons/fa'

interface DynamicsAnalysisProps {
  orderbook: any
  historicalData: any[]
  symbol: string
}

export default function DynamicsAnalysis({ orderbook, historicalData, symbol }: DynamicsAnalysisProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaFireAlt className="text-orange-400" />
        호가창 다이나믹스 분석
      </h3>
      <div className="text-center py-12 text-gray-400">
        <FaFireAlt className="text-6xl mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2">개발 진행 중</p>
        <p className="text-sm">주문 추가/취소 패턴, 주문 속도 분석 기능이 곧 제공됩니다</p>
      </div>
    </div>
  )
}