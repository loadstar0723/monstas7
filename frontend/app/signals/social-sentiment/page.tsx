'use client'

import { useState } from 'react'
import CoinSelector from './components/CoinSelector'
import SentimentOverview from './components/SentimentOverview'
import TrendingAnalysis from './components/TrendingAnalysis'
import TradingStrategy from './components/TradingStrategy'
import InvestmentSignals from './components/InvestmentSignals'
import VisualizationDashboard from './components/VisualizationDashboard'
import AdvancedTools from './components/AdvancedTools'

export default function SocialSentimentPage() {
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            소셜 감성 분석
          </h1>
          <p className="text-gray-400">실시간 소셜 미디어 감성 분석과 트렌딩 추적으로 시장 심리 파악</p>
        </div>

        {/* 코인 선택 */}
        <CoinSelector selectedCoin={selectedCoin} onSelectCoin={setSelectedCoin} />

        {/* 메인 대시보드 */}
        <div className="space-y-12 mt-8">
          {/* 섹션 1: 소셜 감성 개요 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-400">📊 {selectedCoin} 소셜 감성 개요</h2>
            <SentimentOverview coin={selectedCoin} />
          </section>

          {/* 섹션 2: 트렌딩 분석 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-pink-400">🔥 트렌딩 분석</h2>
            <TrendingAnalysis coin={selectedCoin} />
          </section>

          {/* 섹션 3: 트레이딩 전략 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-400">💡 트레이딩 전략</h2>
            <TradingStrategy coin={selectedCoin} />
          </section>

          {/* 섹션 4: 시각화 대시보드 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-green-400">📈 시각화 대시보드</h2>
            <VisualizationDashboard coin={selectedCoin} />
          </section>

          {/* 섹션 5: 실전 투자 신호 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-orange-400">🎯 실전 투자 신호</h2>
            <InvestmentSignals coin={selectedCoin} />
          </section>

          {/* 섹션 6: 고급 분석 도구 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-indigo-400">🛠️ 고급 분석 도구</h2>
            <AdvancedTools coin={selectedCoin} />
          </section>
        </div>

        {/* 하단 정보 */}
        <div className="mt-12 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            ✅ 실제 API 연동 | 📊 실시간 데이터 | 🚀 10개 코인 지원
          </p>
        </div>
      </div>
    </div>
  )
}