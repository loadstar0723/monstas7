'use client'

import { motion } from 'framer-motion'
import { FaWater } from 'react-icons/fa'

interface LiquidityDepthProps {
  orderbook: any
  symbol: string
  currentPrice: number
}

export default function LiquidityDepth({ orderbook, symbol, currentPrice }: LiquidityDepthProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <FaWater className="text-blue-400" />
        유동성 깊이 분석
      </h3>
      <div className="text-center py-12 text-gray-400">
        <FaWater className="text-6xl mx-auto mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2">개발 진행 중</p>
        <p className="text-sm">스프레드, 슬리피지, 실행 가능 유동성 분석 기능이 곧 제공됩니다</p>
      </div>
    </div>
  )
}