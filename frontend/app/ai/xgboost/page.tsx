'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// XGBoost 모듈들을 동적 임포트
const XGBoostEnhanced = dynamic(
  () => import('./XGBoostModuleEnhanced'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Enhanced 버전 로딩 중...</p>
        </div>
      </div>
    )
  }
)

const XGBoostSimple = dynamic(
  () => import('./XGBoostModuleSimple'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Simple 버전 로딩 중...</p>
        </div>
      </div>
    )
  }
)

export default function XgboostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const version = searchParams.get('version') || 'simple'

  const handleVersionChange = (newVersion: string) => {
    // URL 파라미터로 버전 변경 - 완전한 페이지 격리
    router.push(`/ai/xgboost?version=${newVersion}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-red-600 text-transparent bg-clip-text">
              XGBoost Go 하이브리드 엔진
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              극한의 그래디언트 부스팅 + Go 병렬 처리
            </p>
          </div>

          {/* Go 엔진 상태 */}
          <div className="flex items-center gap-2 bg-green-900/20 border border-green-800/50 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">Go Engine Active</span>
          </div>
        </div>

        {/* 탭 버튼 - URL 기반 라우팅 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleVersionChange('enhanced')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              version === 'enhanced'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70 border border-gray-700'
            }`}
          >
            🚀 Enhanced 버전
            <span className="block text-xs mt-1 font-normal">
              {version === 'enhanced' ? '풀기능 + Go 컴포넌트' : '전체 기능'}
            </span>
          </button>

          <button
            onClick={() => handleVersionChange('simple')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              version === 'simple'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70 border border-gray-700'
            }`}
          >
            ⚡ Simple 버전
            <span className="block text-xs mt-1 font-normal">
              {version === 'simple' ? '안정성 + 빠른 실행' : '간단 버전'}
            </span>
          </button>
        </div>

        {/* Go 하이브리드 기능 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <div className="text-green-400 text-sm font-semibold mb-1">⚡ 병렬 부스팅</div>
            <div className="text-xs text-gray-400">Goroutines 활용</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <div className="text-blue-400 text-sm font-semibold mb-1">🚀 실시간 분석</div>
            <div className="text-xs text-gray-400">WebSocket 스트리밍</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <div className="text-purple-400 text-sm font-semibold mb-1">💾 메모리 최적화</div>
            <div className="text-xs text-gray-400">효율적 GC</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
            <div className="text-red-400 text-sm font-semibold mb-1">📊 성능 벤치마크</div>
            <div className="text-xs text-gray-400">실시간 메트릭</div>
          </div>
        </div>

        {/* 선택된 버전 표시 */}
        <div className="mb-4 p-3 bg-gray-900/50 backdrop-blur rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              version === 'enhanced' ? 'bg-green-500' : 'bg-blue-500'
            }`} />
            <span className="text-sm text-gray-300">
              현재 실행 중: <span className={`font-bold ${
                version === 'enhanced' ? 'text-green-400' : 'text-blue-400'
              }`}>
                {version === 'enhanced' ? 'Enhanced 버전' : 'Simple 버전'}
              </span>
            </span>
          </div>
        </div>

        {/* 메인 XGBoost 모듈 - URL 파라미터 기반 렌더링 */}
        <div className="min-h-[500px]">
          {version === 'enhanced' ? (
            <XGBoostEnhanced />
          ) : (
            <XGBoostSimple />
          )}
        </div>
      </div>
    </div>
  )
}