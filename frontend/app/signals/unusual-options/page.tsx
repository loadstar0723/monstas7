'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// 모듈화된 컴포넌트를 동적 임포트 (에러 격리)
const UnusualOptionsModule = dynamic(
  () => import('./UnusualOptionsModule').catch(() => {
    // 모듈 로드 실패 시 폴백
    return {
      default: () => (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
            <p className="text-purple-400">Unusual Options 모듈을 로드할 수 없습니다.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg"
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
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">옵션 플로우 분석 시스템 로딩 중...</p>
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
 * Unusual Options 분석 페이지
 * 비정상적인 옵션 활동과 대규모 옵션 거래 추적
 * 완전한 모듈화 구조로 다른 페이지와 독립적으로 작동
 */
export default function UnusualOptionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Unusual Options Activity
          </h1>
          <p className="text-gray-400">비정상적인 옵션 활동과 대규모 거래 포착</p>
        </motion.div>

        {/* AI 시장 분석 */}
        <div className="mb-8">
          <MarketAnalysis />
        </div>

        {/* Error Boundary로 보호된 모듈 */}
        <ErrorBoundary moduleName="UnusualOptions">
          <UnusualOptionsModule />
        </ErrorBoundary>

        {/* 옵션 거래 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-purple-900/20 rounded-xl border border-purple-500/30"
        >
          <h3 className="text-xl font-bold mb-2 text-purple-400">📊 Unusual Options란?</h3>
          <p className="text-gray-300 mb-4">
            정상적인 거래량 대비 비정상적으로 큰 옵션 거래를 포착하여 기관과 스마트머니의 움직임을 추적합니다.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• <span className="text-green-400">콜 옵션</span>: 상승 베팅, 매수 권리</li>
            <li>• <span className="text-red-400">풋 옵션</span>: 하락 베팅, 매도 권리</li>
            <li>• <span className="text-yellow-400">GEX</span>: 감마 익스포저로 변동성 예측</li>
            <li>• <span className="text-purple-400">Max Pain</span>: 옵션 만기 시 최대 손실 가격</li>
          </ul>
        </motion.div>

        {/* 하단 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/30"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">프리미엄 옵션 시그널</h3>
            <p className="text-gray-400 mb-4">
              기관의 옵션 전략을 실시간으로 포착하고 따라가세요
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
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
            ✅ 모듈화 완료 | 🔒 에러 격리 | 📡 실시간 바이낸스 데이터 | 🧩 독립 실행
          </p>
        </div>
      </div>
    </div>
  )
}
