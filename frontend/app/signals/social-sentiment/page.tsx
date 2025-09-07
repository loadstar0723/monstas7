'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'
import { config } from '@/lib/config'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const SocialSentimentModule = dynamic(
  () => import('./SocialSentimentModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <p className="text-blue-400">소셜 감성 모듈을 로드할 수 없습니다.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg"
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">소셜 감성 분석 시스템 로딩 중...</p>
        </div>
      </div>
    )
  }
)

const MarketAnalysis = dynamic(() => import('@/components/signals/MarketAnalysis'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800 animate-pulse rounded-lg" />
})

/**
 * 소셜 감성 분석 페이지
 * Twitter, Reddit, Telegram 등 소셜 미디어의 실시간 감성 분석
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 */
export default function SocialSentimentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            소셜 감성 분석
          </h1>
          <p className="text-gray-400">실시간 소셜 미디어 감성과 트렌딩 분석</p>
        </motion.div>

        {/* AI 시장 분석 */}
        <div className="mb-8">
          <MarketAnalysis />
        </div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="SocialSentiment">
          <SocialSentimentModule />
        </ErrorBoundary>

        {/* 소셜 감성 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value3 }}
          className="mt-8 p-6 bg-blue-900/20 rounded-xl border border-blue-500/30"
        >
          <h3 className="text-xl font-bold mb-2 text-blue-400">📊 소셜 감성이란?</h3>
          <p className="text-gray-300 mb-4">
            소셜 미디어에서 암호화폐에 대한 대중의 감정과 의견을 실시간으로 분석합니다.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <span className="text-green-400">긍정적 감성</span>: FOMO, 매수 심리 강함</li>
            <li>• <span className="text-red-400">부정적 감성</span>: FUD, 매도 심리 강함</li>
            <li>• <span className="text-orange-400">트렌딩</span>: 급격한 관심 증가, 변동성 예상</li>
            <li>• 소셜 시그널은 단기 가격 움직임의 선행 지표</li>
          </ul>
        </motion.div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: config.decimals.value5 }}
          className="mt-12 p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 소셜 알림</h3>
            <p className="text-gray-400 mb-4">
              트렌딩 급상승과 감성 급변 시 실시간 알림을 받아보세요
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all">
                프리미엄 구독하기
              </button>
              <button className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-bold hover:bg-gray-700 transition-all">
                텔레그램 봇 연동
              </button>
            </div>
          </div>
        </motion.div>

        {/* 모듈 정보 */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            ✅ 모듈화 완료 | 🔒 에러 격리 | 📡 실시간 소셜 데이터 | 🧩 독립 실행
          </p>
        </div>
      </div>
    </div>
  )
}