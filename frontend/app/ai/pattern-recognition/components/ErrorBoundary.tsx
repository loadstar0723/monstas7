'use client'

import React from 'react'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface Props {
  children: React.ReactNode
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
    console.error('Pattern Recognition Error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <FaExclamationTriangle className="text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {this.props.moduleName || 'Pattern Recognition'} 모듈 오류
          </h2>
          <p className="text-gray-400 mb-4 text-center max-w-md">
            패턴 인식 시스템에 일시적인 문제가 발생했습니다. 
            잠시 후 다시 시도해주세요.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FaRedo />
            다시 시도
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 p-4 bg-gray-800 rounded-lg max-w-2xl">
              <summary className="cursor-pointer text-gray-400">오류 상세 정보</summary>
              <pre className="mt-2 text-xs text-red-400 overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}