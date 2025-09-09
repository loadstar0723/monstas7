'use client'

import { FaLayerGroup } from 'react-icons/fa'

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

export default function MarketDepthAnalyzer({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaLayerGroup className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">시장 심도 분석</h2>
          <p className="text-gray-400">{selectedCoin.name} 시장 깊이 3D 시각화</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">시장 심도 분석 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">시장의 깊이와 대규모 주문을 3D로 시각화합니다.</p>
      </div>
    </div>
  )
}