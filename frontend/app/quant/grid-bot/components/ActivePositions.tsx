'use client'

import { FaWallet } from 'react-icons/fa'

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

export default function ActivePositions({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaWallet className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">활성 포지션</h2>
          <p className="text-gray-400">{selectedCoin.name} 그리드 봇 현재 포지션</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">활성 포지션 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">현재 활성화된 그리드 주문과 포지션 현황을 표시합니다.</p>
      </div>
    </div>
  )
}