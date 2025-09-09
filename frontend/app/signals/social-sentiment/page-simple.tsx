'use client'

import { useState } from 'react'

export default function SocialSentimentSimplePage() {
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC')
  const coins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'MATIC', 'DOT']

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">소셜 감성 분석 (Simple Version)</h1>
      
      {/* 코인 선택 */}
      <div className="flex gap-2 mb-8">
        {coins.map(coin => (
          <button
            key={coin}
            onClick={() => setSelectedCoin(coin)}
            className={`px-4 py-2 rounded ${
              selectedCoin === coin ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            {coin}
          </button>
        ))}
      </div>

      {/* 선택된 코인 정보 */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">{selectedCoin} 소셜 감성</h2>
        <div className="space-y-2">
          <p>감성 점수: 65/100</p>
          <p>긍정: 45%</p>
          <p>중립: 35%</p>
          <p>부정: 20%</p>
          <p>총 멘션: 15,234</p>
        </div>
      </div>
    </div>
  )
}