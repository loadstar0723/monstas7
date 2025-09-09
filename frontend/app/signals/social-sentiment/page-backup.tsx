'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 컴포넌트 동적 임포트 (에러 격리)
const CoinSelector = dynamic(() => import('./components/CoinSelector'), { 
  ssr: false,
  loading: () => <div className="h-12 bg-gray-800 animate-pulse rounded-lg" />
})

const SentimentOverview = dynamic(() => import('./components/SentimentOverview'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

const TrendingAnalysis = dynamic(() => import('./components/TrendingAnalysis'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
})

const TradingStrategy = dynamic(() => import('./components/TradingStrategy'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

const VisualizationDashboard = dynamic(() => import('./components/VisualizationDashboard'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

const InvestmentSignals = dynamic(() => import('./components/InvestmentSignals'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
})

const AdvancedTools = dynamic(() => import('./components/AdvancedTools'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-800 animate-pulse rounded-lg" />
})

/**
 * 소셜 감성 분석 페이지
 * 10개 주요 코인의 소셜 미디어 감성을 실시간으로 분석
 * 각 코인별 원페이지 대시보드 제공
 */
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
        <ErrorBoundary moduleName="CoinSelector">
          <CoinSelector selectedCoin={selectedCoin} onSelectCoin={setSelectedCoin} />
        </ErrorBoundary>

        {/* 메인 대시보드 */}
        <div className="space-y-12 mt-8">
          {/* 섹션 1: 소셜 감성 개요 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-purple-400">📊 {selectedCoin} 소셜 감성 개요</h2>
            <ErrorBoundary moduleName="SentimentOverview">
              <SentimentOverview coin={selectedCoin} />
            </ErrorBoundary>
          </section>

          {/* 섹션 2: 트렌딩 분석 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-pink-400">🔥 트렌딩 분석</h2>
            <ErrorBoundary moduleName="TrendingAnalysis">
              <TrendingAnalysis coin={selectedCoin} />
            </ErrorBoundary>
          </section>

          {/* 섹션 3: 트레이딩 전략 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-400">💡 트레이딩 전략</h2>
            <ErrorBoundary moduleName="TradingStrategy">
              <TradingStrategy coin={selectedCoin} />
            </ErrorBoundary>
          </section>

          {/* 섹션 4: 시각화 대시보드 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-green-400">📈 시각화 대시보드</h2>
            <ErrorBoundary moduleName="VisualizationDashboard">
              <VisualizationDashboard coin={selectedCoin} />
            </ErrorBoundary>
          </section>

          {/* 섹션 5: 실전 투자 신호 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-orange-400">🎯 실전 투자 신호</h2>
            <ErrorBoundary moduleName="InvestmentSignals">
              <InvestmentSignals coin={selectedCoin} />
            </ErrorBoundary>
          </section>

          {/* 섹션 6: 고급 분석 도구 */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-indigo-400">🛠️ 고급 분석 도구</h2>
            <ErrorBoundary moduleName="AdvancedTools">
              <AdvancedTools coin={selectedCoin} />
            </ErrorBoundary>
          </section>
        </div>

        {/* 하단 정보 */}
        <div className="mt-12 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            ✅ 실제 API 연동 | 📊 실시간 데이터 | 🔒 에러 격리 | 🚀 10개 코인 지원
          </p>
        </div>
      </div>
    </div>
  )
}