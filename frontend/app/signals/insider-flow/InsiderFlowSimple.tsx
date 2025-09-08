'use client'

import React, { useState, useEffect } from 'react'
import { FaUserSecret, FaExchangeAlt, FaChartLine, FaBrain } from 'react-icons/fa'

// 메인 코인 목록
const MAIN_COINS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'XRP', name: 'Ripple' }
]

export default function InsiderFlowSimple() {
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [coinData, setCoinData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 데이터 설정
    const initData: any = {}
    MAIN_COINS.forEach(coin => {
      initData[coin.symbol] = {
        symbol: coin.symbol,
        name: coin.name,
        price: 0,
        change24h: 0,
        volume24h: 0
      }
    })
    setCoinData(initData)
    
    // 로딩 해제
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  // 현재 코인 데이터
  const currentCoin = coinData[selectedCoin] || {}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">내부자 거래 대시보드 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <FaUserSecret className="inline mr-3 text-yellow-400" />
            내부자 거래 추적 대시보드
          </h1>
          <p className="text-gray-400">실시간 대규모 거래 모니터링 및 AI 기반 패턴 분석</p>
        </div>

        {/* 코인 선택 탭 */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2">
            {MAIN_COINS.map(coin => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin.symbol)}
                className={`px-6 py-4 rounded-lg transition-all ${
                  selectedCoin === coin.symbol
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold">{coin.symbol}</div>
                  <div className="text-sm opacity-80">{coin.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 대시보드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 핵심 지표 */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaChartLine className="mr-3 text-yellow-400" />
              핵심 지표 - {selectedCoin}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">현재 가격</div>
                <div className="text-2xl font-bold">데이터 로딩 중...</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">24시간 변동</div>
                <div className="text-2xl font-bold text-green-400">+0.00%</div>
              </div>
            </div>
          </div>

          {/* 거래 분석 */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaExchangeAlt className="mr-3 text-yellow-400" />
              거래 분석
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">거래소 유입</div>
                <div className="text-xl font-bold text-red-400">$0M</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="text-sm text-gray-400">거래소 유출</div>
                <div className="text-xl font-bold text-green-400">$0M</div>
              </div>
            </div>
          </div>

          {/* AI 분석 */}
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaBrain className="mr-3 text-yellow-400" />
              AI 패턴 분석
            </h2>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <p className="text-gray-300">
                {selectedCoin} 코인의 내부자 거래 패턴을 분석 중입니다. 
                실시간 데이터가 곧 표시됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 교육 콘텐츠 */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30">
          <h3 className="text-xl font-bold mb-3">내부자 거래란?</h3>
          <p className="text-sm text-gray-300">
            내부자 거래는 프로젝트 팀, 기관 투자자, 대규모 보유자(고래) 등이 수행하는 대규모 거래를 의미합니다.
            이들의 거래 패턴을 분석하면 시장의 방향성을 예측하는 데 도움이 됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}