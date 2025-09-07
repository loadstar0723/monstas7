'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  moduleName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.moduleName || 'module'}:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-red-400">
                모듈 오류
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              {this.props.moduleName 
                ? `${this.props.moduleName} 모듈에서 오류가 발생했습니다.`
                : '이 모듈에서 일시적인 오류가 발생했습니다.'}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              다른 기능은 정상적으로 사용 가능합니다.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}