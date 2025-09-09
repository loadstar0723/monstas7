'use client'

import { FaChartLine } from 'react-icons/fa'

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

export default function MarketConditionAnalyzer({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaChartLine className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">시장 상황 분석</h2>
          <p className="text-gray-400">{selectedCoin.name} 시장 상황 및 변동성 분석</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">시장 상황 분석 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">변동성, 추세, 거래량 등 시장 상황을 종합적으로 분석합니다.</p>
      </div>
    </div>
  )
}