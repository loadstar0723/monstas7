'use client'

import { motion } from 'framer-motion'
import { FaBrain, FaChartLine, FaShieldAlt, FaRocket } from 'react-icons/fa'

interface TradingStrategyProps {
  orderbook: any
  stats: any
  symbol: string
  currentPrice: number
  priceChange: number
}

export default function TradingStrategy({ orderbook, stats, symbol, currentPrice, priceChange }: TradingStrategyProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          <FaBrain className="text-purple-400" />
          AI 트레이딩 전략 분석
        </h2>
        <p className="text-gray-300">
          현재 오더북 상태를 기반으로 최적의 트레이딩 전략을 제안합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-400" />
            진입 전략
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>• 현재 가격: ${safePrice(currentPrice, 2)}</p>
            <p>• 권장 진입가: ${(currentPrice * 0.995).toFixed(2)}</p>
            <p>• 목표가: ${(currentPrice * 1.02).toFixed(2)}</p>
            <p>• 손절가: ${(currentPrice * 0.98).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-red-400" />
            리스크 관리
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>• 권장 포지션 크기: 자본금의 5%</p>
            <p>• 최대 손실 한도: 2%</p>
            <p>• 리스크/보상 비율: 1:2</p>
            <p>• 실행 리스크: {stats?.executionRisk || '보통'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}