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

export default function PositionMonitor({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaWallet className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">포지션 모니터</h2>
          <p className="text-gray-400">{selectedCoin.name} 실시간 포지션 추적</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">포지션 모니터 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">활성 주문과 포지션을 실시간으로 모니터링합니다.</p>
      </div>
    </div>
  )
}