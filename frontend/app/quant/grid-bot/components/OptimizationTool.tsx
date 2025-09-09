'use client'

import { FaBrain } from 'react-icons/fa'

interface CoinInfo {
  symbol: string
  fullSymbol: string
  name: string
  color: string
  bgColor: string
}

interface Props {
  selectedCoin: CoinInfo
}

export default function OptimizationTool({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaBrain className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI 최적화</h2>
          <p className="text-gray-400">{selectedCoin.name} 그리드 봇 AI 최적화</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">AI 최적화 도구 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">AI 기반 그리드 설정 최적화와 시장 예측을 제공합니다.</p>
      </div>
    </div>
  )
}