'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">오류가 발생했습니다</h2>
            <p className="text-gray-300 mb-4">
              페이지를 불러오는 중 문제가 발생했습니다.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-400">오류 상세</summary>
              <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button 
              onClick={this.handleReset}
              className="w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
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