'use client'

import { FaHistory } from 'react-icons/fa'

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

export default function ProfitSimulator({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaHistory className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">수익 시뮬레이터</h2>
          <p className="text-gray-400">{selectedCoin.name} 백테스팅 및 수익 분석</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">수익 시뮬레이터 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">과거 데이터를 기반으로 마켓 메이킹 전략의 수익성을 분석합니다.</p>
      </div>
    </div>
  )
}