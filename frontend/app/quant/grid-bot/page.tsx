'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// GridBotUltraModule을 동적 임포트 (SSR 비활성화)
const GridBotUltraModule = dynamic(
  () => import('./GridBotUltraModule').catch(() => {
    // 로드 실패 시 에러 페이지 표시
    return { default: () => <div>Error loading Grid Bot Module</div> }
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">그리드 봇 모듈 로딩 중...</p>
        </div>
      </div>
    )
  }
)

// 에러 바운더리 컴포넌트
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Grid Bot page error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center p-8 bg-gray-800 rounded-xl">
            <h2 className="text-2xl font-bold text-red-400 mb-4">에러 발생</h2>
            <p className="text-gray-400">그리드 봇 페이지를 불러오는 중 오류가 발생했습니다.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default function GridBotPage() {
  return (
    <ErrorBoundary>
      <GridBotUltraModule />
    </ErrorBoundary>
  )
}