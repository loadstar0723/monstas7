'use client'

import React from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Random Forest Error Boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 m-4">
          <div className="flex items-center gap-3 text-red-400 mb-2">
            <FaExclamationTriangle className="text-2xl" />
            <h3 className="text-lg font-semibold">컴포넌트 오류 발생</h3>
          </div>
          <p className="text-gray-300 text-sm">
            {this.state.error?.message || '예기치 않은 오류가 발생했습니다.'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary