'use client'

import dynamic from 'next/dynamic'
import { Component, ReactNode } from 'react'

// 메인 모듈 동적 임포트
const MeanReversionModule = dynamic(() => import('./MeanReversionModule'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">평균회귀 분석 모듈 로딩 중...</p>
      </div>
    </div>
  ),
  ssr: false
})

// 에러 바운더리 컴포넌트
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-500 mb-2">모듈 로드 실패</h2>
            <p className="text-gray-300 mb-4">평균회귀 분석 모듈을 로드하는 중 오류가 발생했습니다.</p>
            {this.state.error && (
              <details className="text-gray-400 text-sm mb-4">
                <summary className="cursor-pointer">상세 정보</summary>
                <pre className="mt-2 overflow-auto">{this.state.error.message}</pre>
              </details>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function MeanReversionPage() {
  return (
    <ErrorBoundary>
      <MeanReversionModule />
    </ErrorBoundary>
  )
}