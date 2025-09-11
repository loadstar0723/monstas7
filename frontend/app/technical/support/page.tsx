'use client'

import dynamic from 'next/dynamic'
import React, { Suspense } from 'react'
import { FaChartLine, FaSpinner } from 'react-icons/fa'

// 동적 임포트로 모듈 로드 (에러 격리 포함)
const SupportResistanceModule = dynamic(
  () => import('./SupportResistanceModule').catch((err) => {
    console.error('Failed to load SupportResistanceModule:', err)
    // 에러 발생 시 폴백 컴포넌트 반환
    return {
      default: () => (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <FaChartLine className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">모듈 로드 실패</h2>
            <p className="text-gray-400">지지/저항 분석 모듈을 불러오는 중 오류가 발생했습니다.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }
  }),
  {
    ssr: false, // 클라이언트 사이드 렌더링만 사용
    loading: () => <LoadingComponent />
  }
)

// 로딩 컴포넌트
function LoadingComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <FaSpinner className="text-6xl text-purple-500 animate-spin mx-auto mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaChartLine className="text-3xl text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">지지/저항 분석 준비 중...</h2>
        <p className="text-gray-400">실시간 데이터를 불러오고 있습니다</p>
        <div className="mt-4 flex justify-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

// 에러 바운더리 컴포넌트
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Support/Resistance Page Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-red-500/50">
            <div className="text-center">
              <FaChartLine className="text-5xl text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">오류 발생</h2>
              <p className="text-gray-400 mb-4">
                페이지를 렌더링하는 중 문제가 발생했습니다.
              </p>
              {this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                    오류 상세 정보
                  </summary>
                  <pre className="mt-2 p-2 bg-black/50 rounded text-xs text-red-400 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 메인 페이지 컴포넌트
export default function SupportResistancePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingComponent />}>
        <SupportResistanceModule />
      </Suspense>
    </ErrorBoundary>
  )
}
