'use client'

import { FaShieldAlt } from 'react-icons/fa'

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

export default function RiskDashboard({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaShieldAlt className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">리스크 관리</h2>
          <p className="text-gray-400">{selectedCoin.name} 리스크 대시보드</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">리스크 대시보드 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">재고 리스크, 가격 변동 리스크를 종합적으로 관리합니다.</p>
      </div>
    </div>
  )
}