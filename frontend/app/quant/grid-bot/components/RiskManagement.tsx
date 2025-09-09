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

export default function RiskManagement({ selectedCoin }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 ${selectedCoin.bgColor} rounded-lg flex items-center justify-center`}>
          <FaShieldAlt className={`text-xl ${selectedCoin.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">리스크 관리</h2>
          <p className="text-gray-400">{selectedCoin.name} 그리드 봇 리스크 관리</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <p className="text-gray-300">리스크 관리 컴포넌트 - 개발 중</p>
        <p className="text-gray-400 text-sm mt-2">손절가 설정, 포지션 크기 관리, 리스크 평가를 제공합니다.</p>
      </div>
    </div>
  )
}