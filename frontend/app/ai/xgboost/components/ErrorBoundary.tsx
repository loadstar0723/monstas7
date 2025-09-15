'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('XGBoost Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 m-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-300 mb-4">
            XGBoost 모듈에서 문제가 발생했습니다. 페이지를 새로고침해주세요.
          </p>
          {this.state.error && (
            <details className="text-sm text-gray-400">
              <summary className="cursor-pointer hover:text-gray-300">
                오류 상세 정보
              </summary>
              <pre className="mt-2 p-4 bg-gray-800/50 rounded overflow-x-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}